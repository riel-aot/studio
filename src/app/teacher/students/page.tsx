'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { PlusCircle, FileText, ChevronRight, Search, Users, School, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { StudentListItem, StudentListResponse } from '@/lib/events';
import { Skeleton } from '@/components/ui/skeleton';
import { AddStudentDrawer } from '@/components/add-student-drawer';
import { Input } from '@/components/ui/input';
import { OnboardingTour } from '@/components/onboarding-tour';
import { Badge } from '@/components/ui/badge';
import { useWebhook } from '@/lib/hooks';

function StudentListSkeleton() {
    return (
        <Card className="w-full border-border bg-card">
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
        <div className="flex flex-col items-center justify-center py-24 text-center bg-card rounded-2xl border border-dashed border-border w-full shadow-sm">
            <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <Users className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">Build Your Roster</h3>
            <p className="text-muted-foreground mt-2 mb-8 max-w-sm">No students found. Start by manually adding your first student or importing your class roster.</p>
            <Button onClick={onAddStudent} size="lg" className="bg-primary hover:bg-primary/90 font-bold px-8 h-12 rounded-xl">
                <PlusCircle className="mr-2 h-5 w-5" />
                Enroll First Student
            </Button>
        </div>
    )
}

export default function StudentsPage() {
    const router = useRouter();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [displaySearch, setDisplaySearch] = useState('');
    const [dbSearch, setDbSearch] = useState('');

    // Debounce search input to avoid spamming the database
    useEffect(() => {
        const timer = setTimeout(() => {
            setDbSearch(displaySearch);
        }, 500);
        return () => clearTimeout(timer);
    }, [displaySearch]);

    const { data, isLoading, error, trigger: refetch } = useWebhook<{ search?: string }, StudentListResponse | StudentListItem[]>({
        eventName: 'STUDENT_LIST',
        payload: { search: dbSearch },
        allowRawResponse: true,
        cacheKey: `student-list:${dbSearch}`,
        cacheTtlMs: 60_000,
        fallbackToCacheOnError: true,
    });

    const students = useMemo(() => {
        if (!data) return [];
        let baseList: StudentListItem[] = [];
        
        // Parse the data from the webhook response
        if (Array.isArray(data)) {
            baseList = data.map((student: any) => ({
                name: student.name,
                studentIdNumber: student.student_id ?? student.studentIdNumber,
                grade: student.grade,
                studentEmail: student.student_email ?? student.studentEmail,
                parentEmail: student.parent_email ?? student.parentEmail,
            }));
        } else if (data.success && data.data?.students) {
            baseList = data.data.students.map((student: any) => ({
                name: student.name,
                studentIdNumber: student.student_id ?? student.studentIdNumber,
                grade: student.grade,
                studentEmail: student.student_email ?? student.studentEmail,
                parentEmail: student.parent_email ?? student.parentEmail,
            }));
        }

        // Apply local filtering for immediate "dynamic" feedback
        if (!displaySearch) return baseList;
        const searchLower = displaySearch.toLowerCase();
        return baseList.filter(student => 
            student.name.toLowerCase().includes(searchLower) || 
            student.studentIdNumber.toLowerCase().includes(searchLower)
        );
    }, [data, displaySearch]);

    const handleRowClick = (studentIdNumber: string) => {
        router.push(`/teacher/students/${encodeURIComponent(studentIdNumber)}`);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTableRowElement>, studentIdNumber: string) => {
        if (e.key === 'Enter') {
            handleRowClick(studentIdNumber);
        }
    };

    if (isLoading && !data) return (
        <div className="space-y-8">
             <PageHeader
                title="Student Roster"
                description="Manage enrollment and track performance for all students."
                hideBack
            />
            <StudentListSkeleton />
        </div>
    );
    
    if (error && !data) return (
        <div className="space-y-8">
            <PageHeader title="Student Roster" description="Manage enrollment." hideBack />
            <div className="p-12 text-center bg-card rounded-2xl border border-destructive/20 shadow-sm">
                <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4 opacity-20" />
                <p className="text-destructive font-bold text-lg">Synchronization Offline</p>
                <p className="text-muted-foreground mb-6">{error?.message || 'Failed to load students'}</p>
                <Button onClick={() => refetch()} variant="outline" className="font-bold">Retry Sync</Button>
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
                    refetch();
                }}
            />
            
            <div className="flex flex-col gap-2">
                <PageHeader
                    title="Student Roster"
                    description="The central directory for all students across your active classes."
                    hideBack
                    actions={
                        <div className="flex gap-3">
                            <Button variant="outline" className="h-11 rounded-xl font-bold border-border bg-card text-foreground" asChild>
                                <Link href="/teacher/assessments"><FileText className="mr-2 h-4 w-4" /> Assignments</Link>
                            </Button>
                            <Button id="onboarding-add-student" onClick={() => setIsDrawerOpen(true)} className="bg-primary hover:bg-primary/90 h-11 rounded-xl font-bold px-6 shadow-md shadow-primary/20 transition-all">
                                <PlusCircle className="mr-2 h-4 w-4 stroke-[3]" /> Add Student
                            </Button>
                        </div>
                    }
                />
            </div>

            {(data || displaySearch) ? (
                 <Card id="onboarding-student-list" className="border-border shadow-sm overflow-hidden rounded-2xl bg-card">
                    <CardHeader className="bg-card pb-8 border-b border-border">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 bg-secondary rounded-xl flex items-center justify-center border border-border">
                                    <School className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl font-bold text-foreground">Active Enrollment</CardTitle>
                                    <CardDescription className="text-muted-foreground font-medium">
                                        {students.length} {students.length === 1 ? 'student' : 'students'} tracked in the system
                                    </CardDescription>
                                </div>
                            </div>
                             <div className="relative w-full max-w-sm">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                    placeholder="Find student by name..."
                                    className="w-full rounded-xl bg-secondary border-none focus:ring-2 focus:ring-primary/20 pl-12 h-12 text-base transition-all placeholder:text-muted-foreground font-medium"
                                    value={displaySearch}
                                    onChange={(e) => setDisplaySearch(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {students.length > 0 ? (
                            <Table>
                                <TableHeader className="bg-secondary/30">
                                    <TableRow className="hover:bg-transparent border-b border-border">
                                        <TableHead className="font-bold text-foreground h-14 pl-8">Name</TableHead>
                                        <TableHead className="font-bold text-foreground h-14">Academic Level</TableHead>
                                        <TableHead className="font-bold text-foreground h-14">Identifier</TableHead>
                                        <TableHead className="text-right w-24 h-14 pr-8"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {students.map((student: StudentListItem) => (
                                        <TableRow 
                                            key={student.studentIdNumber}
                                            role="link"
                                            tabIndex={0}
                                            className="group cursor-pointer hover:bg-secondary/50 transition-colors border-b border-border last:border-0"
                                            onClick={() => handleRowClick(student.studentIdNumber)}
                                            onKeyDown={(e) => handleKeyDown(e, student.studentIdNumber)}
                                        >
                                            <TableCell className="font-bold text-foreground py-5 pl-8 text-lg">{student.name}</TableCell>
                                            <TableCell className="py-5">
                                                <Badge variant="secondary" className="bg-secondary text-foreground border-none font-bold rounded-md px-3 py-1">
                                                    {(student.grade || '').toUpperCase()}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-mono text-xs text-muted-foreground py-5 tracking-widest uppercase">{student.studentIdNumber}</TableCell>
                                            <TableCell className="text-right py-5 pr-8">
                                                <div className="flex items-center justify-end gap-2">
                                                    <span className="text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">View Profile</span>
                                                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="py-24 text-center px-6">
                                <div className="h-16 w-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground">No results for &quot;{displaySearch}&quot;</h3>
                                <p className="text-muted-foreground mt-1">Check the spelling or try a broader search term.</p>
                                <Button 
                                    variant="ghost" 
                                    onClick={() => setDisplaySearch('')}
                                    className="mt-6 text-primary font-bold hover:bg-primary/10"
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