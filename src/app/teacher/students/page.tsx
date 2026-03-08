'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { PlusCircle, FileText, ChevronRight, Search, Users, School } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { StudentListItem } from '@/lib/events';
import { Skeleton } from '@/components/ui/skeleton';
import { AddStudentDrawer } from '@/components/add-student-drawer';
import { Input } from '@/components/ui/input';
import { OnboardingTour } from '@/components/onboarding-tour';
import { Badge } from '@/components/ui/badge';

const N8N_STUDENT_LIST_WEBHOOK = 'https://n8n.srv1336679.hstgr.cloud/webhook/0889db3b-9b44-46a2-a5a2-0e1513fb884b';
const STUDENT_LIST_CACHE_KEY = 'n8n:student-list';

const readStudentsCache = (): { timestamp: number; data: StudentListItem[] } | null => {
    if (typeof window === 'undefined') {
        return null;
    }
    const rawValue = window.localStorage.getItem(STUDENT_LIST_CACHE_KEY);
    if (!rawValue) {
        return null;
    }
    try {
        return JSON.parse(rawValue) as { timestamp: number; data: StudentListItem[] };
    } catch {
        window.localStorage.removeItem(STUDENT_LIST_CACHE_KEY);
        return null;
    }
};

const writeStudentsCache = (data: StudentListItem[]) => {
    if (typeof window === 'undefined') {
        return;
    }
    window.localStorage.setItem(
        STUDENT_LIST_CACHE_KEY,
        JSON.stringify({ timestamp: Date.now(), data })
    );
};

function StudentListSkeleton() {
    return (
        <Card className="w-full">
            <CardHeader>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Grade</TableHead>
                            <TableHead>Student ID</TableHead>
                            <TableHead className="text-right w-[50px]"><span className="sr-only">View</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[...Array(5)].map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-5 w-5" /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

function EmptyState({ onAddStudent }: { onAddStudent: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-dashed border-slate-300 w-full shadow-sm">
            <div className="h-20 w-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                <Users className="h-10 w-10 text-[#2F5BEA]" />
            </div>
            <h3 className="text-2xl font-bold text-[#111827]">Build Your Roster</h3>
            <p className="text-slate-500 mt-2 mb-8 max-w-sm">No students found. Start by manually adding your first student or importing your class roster.</p>
            <Button onClick={onAddStudent} size="lg" className="bg-[#2F5BEA] font-bold px-8 h-12 rounded-xl">
                <PlusCircle className="mr-2 h-5 w-5" />
                Enroll First Student
            </Button>
        </div>
    )
}

export default function StudentsPage() {
    const router = useRouter();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [students, setStudents] = useState<StudentListItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const fetchStudents = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            const response = await fetch(N8N_STUDENT_LIST_WEBHOOK, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({}),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (Array.isArray(result)) {
                const mappedStudents = result.map((student: any) => ({
                    name: student.name,
                    studentIdNumber: student.student_id,
                    grade: student.grade,
                    studentEmail: student.student_email,
                    parentEmail: student.parent_email,
                }));
                setStudents(mappedStudents);
                writeStudentsCache(mappedStudents);
            } else if (result.success && result.data?.students) {
                const mappedStudents = result.data.students.map((student: any) => ({
                    name: student.name,
                    studentIdNumber: student.student_id,
                    grade: student.grade,
                    studentEmail: student.student_email,
                    parentEmail: student.parent_email,
                }));
                setStudents(mappedStudents);
                writeStudentsCache(mappedStudents);
            } else {
                setStudents([]);
            }
            
        } catch (err) {
            const cached = readStudentsCache();
            if (cached?.data?.length) {
                setStudents(cached.data);
                setError(null);
            } else {
                setError(err instanceof Error ? err.message : 'Failed to load students');
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const filteredStudents = useMemo(() => {
        if (!searchQuery.trim()) return students;
        const lowQuery = searchQuery.toLowerCase();
        return students.filter(student => 
            student.name.toLowerCase().includes(lowQuery)
        );
    }, [students, searchQuery]);

    const handleRowClick = (studentIdNumber: string) => {
        router.push(`/teacher/students/${encodeURIComponent(studentIdNumber)}`);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTableRowElement>, studentIdNumber: string) => {
        if (e.key === 'Enter') {
            handleRowClick(studentIdNumber);
        }
    };

    if (isLoading) return (
        <div className="space-y-8">
             <PageHeader
                title="Student Roster"
                description="Manage enrollment and track performance for all students."
                hideBack
            />
            <StudentListSkeleton />
        </div>
    );
    
    if (error) return (
        <div className="space-y-8">
            <PageHeader title="Student Roster" description="Manage enrollment." hideBack />
            <div className="p-12 text-center bg-white rounded-2xl border border-destructive/20 shadow-sm">
                <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4 opacity-20" />
                <p className="text-destructive font-bold text-lg">Synchronization Offline</p>
                <p className="text-slate-500 mb-6">{error}</p>
                <Button onClick={fetchStudents} variant="outline" className="font-bold">Retry Sync</Button>
            </div>
        </div>
    );

    return (
        <div className="space-y-10">
            <OnboardingTour />
            <AddStudentDrawer
                isOpen={isDrawerOpen}
                onOpenChange={setIsDrawerOpen}
                onSuccess={() => {
                    setIsDrawerOpen(false);
                    fetchStudents();
                }}
            />
            
            <div className="flex flex-col gap-2">
                <PageHeader
                    title="Student Roster"
                    description="The central directory for all students across your active classes."
                    hideBack
                    actions={
                        <div className="flex gap-3">
                            <Button variant="outline" className="h-11 rounded-xl font-bold text-slate-600 border-slate-200" asChild>
                                <Link href="/teacher/assessments"><FileText className="mr-2 h-4 w-4" /> Assignments</Link>
                            </Button>
                            <Button id="onboarding-add-student" onClick={() => setIsDrawerOpen(true)} className="bg-[#2F5BEA] hover:bg-[#2447C6] h-11 rounded-xl font-bold px-6 shadow-md shadow-blue-500/20 transition-all">
                                <PlusCircle className="mr-2 h-4 w-4 stroke-[3]" /> Add Student
                            </Button>
                        </div>
                    }
                />
            </div>

            {students.length > 0 ? (
                 <Card id="onboarding-student-list" className="border-[#E5E7EB] shadow-sm overflow-hidden rounded-2xl">
                    <CardHeader className="bg-white pb-8 border-b border-[#F1F2F6]">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
                                    <School className="h-6 w-6 text-[#2F5BEA]" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl font-bold text-[#111827]">Active Enrollment</CardTitle>
                                    <CardDescription className="text-slate-500 font-medium">
                                        {filteredStudents.length} {filteredStudents.length === 1 ? 'student' : 'students'} tracked in the system
                                    </CardDescription>
                                </div>
                            </div>
                             <div className="relative w-full max-w-sm">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <Input
                                    placeholder="Find student by name..."
                                    className="w-full rounded-xl bg-[#F1F2F6] border-none focus:ring-2 focus:ring-[#2F5BEA]/20 pl-12 h-12 text-base transition-all placeholder:text-slate-400 font-medium"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {filteredStudents.length > 0 ? (
                            <Table>
                                <TableHeader className="bg-slate-50/50">
                                    <TableRow className="hover:bg-transparent border-b border-[#F1F2F6]">
                                        <TableHead className="font-bold text-[#111827] h-14 pl-8">Name</TableHead>
                                        <TableHead className="font-bold text-[#111827] h-14">Academic Level</TableHead>
                                        <TableHead className="font-bold text-[#111827] h-14">Identifier</TableHead>
                                        <TableHead className="text-right w-24 h-14 pr-8"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredStudents.map((student: StudentListItem) => (
                                        <TableRow 
                                            key={student.studentIdNumber}
                                            role="link"
                                            tabIndex={0}
                                            className="group cursor-pointer hover:bg-slate-50/80 transition-colors border-b border-[#F1F2F6] last:border-0"
                                            onClick={() => handleRowClick(student.studentIdNumber)}
                                            onKeyDown={(e) => handleKeyDown(e, student.studentIdNumber)}
                                        >
                                            <TableCell className="font-bold text-[#111827] py-5 pl-8 text-lg">{student.name}</TableCell>
                                            <TableCell className="py-5">
                                                <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none font-bold rounded-md px-3 py-1">
                                                    {student.grade.toUpperCase()}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-mono text-xs text-slate-400 py-5 tracking-widest uppercase">{student.studentIdNumber}</TableCell>
                                            <TableCell className="text-right py-5 pr-8">
                                                <div className="flex items-center justify-end gap-2">
                                                    <span className="text-[10px] font-bold text-[#2F5BEA] opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">View Profile</span>
                                                    <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-[#2F5BEA] group-hover:translate-x-1 transition-all" />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="py-24 text-center px-6">
                                <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search className="h-8 w-8 text-slate-300" />
                                </div>
                                <h3 className="text-xl font-bold text-[#111827]">No results for &quot;{searchQuery}&quot;</h3>
                                <p className="text-slate-500 mt-1">Check the spelling or try a broader search term.</p>
                                <Button 
                                    variant="ghost" 
                                    onClick={() => setSearchQuery('')}
                                    className="mt-6 text-[#2F5BEA] font-bold hover:bg-blue-50"
                                >
                                    Reset Filters
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <EmptyState onAddStudent={() => setIsDrawerOpen(true)} />
            )}
        </div>
    );
}
