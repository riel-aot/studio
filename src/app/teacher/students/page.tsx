'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { PlusCircle, FileUp, ChevronRight, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useWebhook } from '@/lib/hooks';
import type { GetStudentListData, StudentListItem } from '@/lib/events';
import { Skeleton } from '@/components/ui/skeleton';
import { AddStudentDrawer } from '@/components/add-student-drawer';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';

function StudentListSkeleton() {
    return (
        <Card>
            <CardHeader>
                <CardTitle><Skeleton className="h-6 w-32" /></CardTitle>
                <CardDescription><Skeleton className="h-4 w-48" /></CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">Avatar</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Class</TableHead>
                            <TableHead>Student ID</TableHead>
                            <TableHead>Last Assessment</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right w-[50px]"><span className="sr-only">View</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[...Array(5)].map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-10 w-10 rounded-full" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-32" /></TableCell>

                                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-28" /></TableCell>
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
        <div className="text-center py-16 border-dashed border-2 rounded-lg">
            <h3 className="text-xl font-semibold">No students found</h3>
            <p className="text-muted-foreground mt-2 mb-4">Get started by adding your first student.</p>
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
    
    const { data, isLoading, error, trigger: refetchStudents } = useWebhook<{}, GetStudentListData>({ eventName: 'STUDENT_LIST' });

    const handleRowClick = (studentId: string) => {
        router.push(`/teacher/students/${studentId}`);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTableRowElement>, studentId: string) => {
        if (e.key === 'Enter') {
            handleRowClick(studentId);
        }
    };


    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'Up to Date': return 'default';
            case 'Needs Review': return 'destructive';
            case 'Draft in Progress': return 'secondary';
            default: return 'outline';
        }
    }
    
    if (isLoading && !data) return (
        <div>
             <PageHeader
                title="Student Roster"
                description="Search, add, and manage student profiles."
                actions={
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href="/teacher/students/import"><FileUp/> Import Students</Link>
                        </Button>
                        <Button onClick={() => setIsDrawerOpen(true)}><PlusCircle/> Add Student</Button>
                    </div>
                }
            />
            <StudentListSkeleton />
        </div>
    );
    if (error) return <p className="text-destructive">Failed to load students: {error.message}</p>;

    return (
        <div className="w-full">
            <AddStudentDrawer
                isOpen={isDrawerOpen}
                onOpenChange={setIsDrawerOpen}
                onSuccess={() => {
                    setIsDrawerOpen(false);
                    refetchStudents();
                }}
            />
            <PageHeader
                title="Student Roster"
                description="Search, add, and manage student profiles."
                actions={
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href="/teacher/students/import"><FileUp/> Import Students</Link>
                        </Button>
                        <Button onClick={() => setIsDrawerOpen(true)}><PlusCircle/> Add Student</Button>
                    </div>
                }
            />

            {data?.students && data.students.length > 0 ? (
                 <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>All Students ({data.total})</CardTitle>
                                <CardDescription>A list of all students in your classes.</CardDescription>
                            </div>
                             <div className="relative w-full max-w-sm">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search student name..."
                                    className="w-full rounded-lg bg-secondary pl-8 h-9"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[60px]">Avatar</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Class</TableHead>
                                    <TableHead>Student ID</TableHead>
                                    <TableHead>Last Assessment</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right w-[50px]"><span className="sr-only">View</span></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.students.map((student: StudentListItem) => (
                                    <TableRow 
                                        key={student.id}
                                        role="link"
                                        tabIndex={0}
                                        className="cursor-pointer"
                                        onClick={() => handleRowClick(student.id)}
                                        onKeyDown={(e) => handleKeyDown(e, student.id)}
                                    >
                                        <TableCell>
                                            <Avatar className="h-9 w-9">
                                                <AvatarImage src={student.avatarUrl} alt={student.name} />
                                                <AvatarFallback>{student.name.substring(0,2)}</AvatarFallback>
                                            </Avatar>
                                        </TableCell>
                                        <TableCell className="font-medium">{student.name}</TableCell>
                                        <TableCell>{student.class}</TableCell>
                                        <TableCell className="font-mono text-xs">{student.studentIdNumber}</TableCell>
                                        <TableCell className="text-sm">
                                            {student.lastAssessmentDate 
                                                ? format(parseISO(student.lastAssessmentDate), 'dd MMM yyyy')
                                                : 'None'
                                            }
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusVariant(student.status)}>{student.status}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <ChevronRight className="h-4 w-4 text-muted-foreground inline-block" />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            ) : (
                <EmptyState onAddStudent={() => setIsDrawerOpen(true)} />
            )}
        </div>
    );
}
