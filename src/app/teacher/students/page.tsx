'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { PlusCircle, FileText, ChevronRight, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { StudentListItem } from '@/lib/events';
import { Skeleton } from '@/components/ui/skeleton';
import { AddStudentDrawer } from '@/components/add-student-drawer';
import { Input } from '@/components/ui/input';
import { OnboardingTour } from '@/components/onboarding-tour';

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
                <CardTitle><Skeleton className="h-6 w-32" /></CardTitle>
                <CardDescription><Skeleton className="h-4 w-48" /></CardDescription>
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
        <div className="text-center py-16 border-dashed border-2 rounded-lg w-full">
            <h3 className="text-xl font-semibold">No students yet</h3>
            <p className="text-muted-foreground mt-2 mb-4">Add your first student to start creating assessments.</p>
            <Button onClick={onAddStudent}>
                <PlusCircle className="mr-2" />
                Add Student
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
        <div className="w-full">
             <PageHeader
                title="Students"
                description="All students in your classes."
                actions={
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href="/teacher/assessments"><FileText/> View Assessments</Link>
                        </Button>
                        <Button onClick={() => setIsDrawerOpen(true)}><PlusCircle/> Add Student</Button>
                    </div>
                }
            />
            <StudentListSkeleton />
        </div>
    );
    
    if (error) return (
        <div className="w-full">
            <PageHeader
                title="Students"
                description="All students in your classes."
                actions={
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href="/teacher/assessments"><FileText/> View Assessments</Link>
                        </Button>
                        <Button onClick={() => setIsDrawerOpen(true)}><PlusCircle/> Add Student</Button>
                    </div>
                }
            />
            <div className="p-8 text-center bg-white rounded-xl border border-destructive/20">
                <p className="text-destructive font-medium mb-4">Failed to load students: {error}</p>
                <Button onClick={fetchStudents} variant="outline">Retry</Button>
            </div>
        </div>
    );

    return (
        <div className="w-full">
            <OnboardingTour />
            <AddStudentDrawer
                isOpen={isDrawerOpen}
                onOpenChange={setIsDrawerOpen}
                onSuccess={() => {
                    setIsDrawerOpen(false);
                    fetchStudents();
                }}
            />
            <PageHeader
                title="Students"
                description="All students in your classes."
                actions={
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href="/teacher/assessments"><FileText/> View Assessments</Link>
                        </Button>
                        <Button id="onboarding-add-student" onClick={() => setIsDrawerOpen(true)} className="bg-[#2F5BEA] hover:bg-[#2447C6] font-bold">
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Student
                        </Button>
                    </div>
                }
            />

            {students.length > 0 ? (
                 <Card id="onboarding-student-list" className="w-full border-[#E5E7EB] shadow-sm overflow-hidden">
                    <CardHeader className="bg-white pb-6 border-b border-[#F1F2F6]">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle className="text-xl font-bold text-[#111827]">Roster</CardTitle>
                                <CardDescription className="text-slate-500">
                                    {filteredStudents.length} {filteredStudents.length === 1 ? 'student' : 'students'} {searchQuery && 'matching your search'}
                                </CardDescription>
                            </div>
                             <div className="relative w-full max-w-sm">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Search student name..."
                                    className="w-full rounded-xl bg-[#F1F2F6] border-none focus:ring-2 focus:ring-[#2F5BEA]/20 pl-10 h-11 text-base transition-all"
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
                                        <TableHead className="font-bold text-[#111827] h-12">Name</TableHead>
                                        <TableHead className="font-bold text-[#111827] h-12">Grade</TableHead>
                                        <TableHead className="font-bold text-[#111827] h-12">Student ID</TableHead>
                                        <TableHead className="text-right w-[50px] h-12"><span className="sr-only">View</span></TableHead>
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
                                            <TableCell className="font-semibold text-[#111827] py-4">{student.name}</TableCell>
                                            <TableCell className="text-slate-600 py-4">{student.grade}</TableCell>
                                            <TableCell className="font-mono text-xs text-slate-400 py-4 tracking-wider">{student.studentIdNumber}</TableCell>
                                            <TableCell className="text-right py-4 pr-6">
                                                <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-[#2F5BEA] group-hover:translate-x-0.5 transition-all" />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="py-20 text-center">
                                <Search className="mx-auto h-12 w-12 text-slate-200 mb-4" />
                                <h3 className="text-lg font-bold text-[#111827]">No students found</h3>
                                <p className="text-slate-500">We couldn't find anyone matching &quot;{searchQuery}&quot;</p>
                                <Button 
                                    variant="ghost" 
                                    onClick={() => setSearchQuery('')}
                                    className="mt-4 text-[#2F5BEA] font-bold"
                                >
                                    Clear Search
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