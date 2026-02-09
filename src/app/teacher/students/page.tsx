'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { PlusCircle, FileUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useWebhook } from '@/lib/hooks';
import type { GetStudentListData, StudentListItem, NewAssessmentStartPayload } from '@/lib/events';
import { Skeleton } from '@/components/ui/skeleton';
import { AddStudentDrawer } from '@/components/add-student-drawer';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
                            <TableHead>Parent Email</TableHead>
                            <TableHead>Last Assessment</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right w-[200px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[...Array(5)].map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-10 w-10 rounded-full" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-28" /></TableCell>
                                <TableCell className="text-right"><div className="flex gap-2 justify-end"><Skeleton className="h-9 w-20" /><Skeleton className="h-9 w-32" /></div></TableCell>
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

    const handleNewAssessmentSuccess = useCallback((_: any, payload?: NewAssessmentStartPayload) => {
        if (payload?.studentId) {
            router.push(`/teacher/assessments/new?studentId=${payload.studentId}`);
        }
    }, [router]);

    const { trigger: startNewAssessment } = useWebhook<NewAssessmentStartPayload, {}>({
        eventName: 'NEW_ASSESSMENT_START',
        manual: true,
        onSuccess: handleNewAssessmentSuccess,
        errorMessage: "Could not start a new assessment for this student."
    });

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
        <TooltipProvider>
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
                            <div className="w-full max-w-sm">
                                <Input placeholder="Search student name..." />
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
                                    <TableHead>Parent Email</TableHead>
                                    <TableHead>Last Assessment</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right w-[240px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.students.map((student: StudentListItem) => (
                                    <TableRow key={student.id}>
                                        <TableCell>
                                            <Avatar className="h-9 w-9">
                                                <AvatarImage src={student.avatarUrl} alt={student.name} />
                                                <AvatarFallback>{student.name.substring(0,2)}</AvatarFallback>
                                            </Avatar>
                                        </TableCell>
                                        <TableCell className="font-medium">{student.name}</TableCell>
                                        <TableCell>{student.class}</TableCell>
                                        <TableCell className="font-mono text-xs">{student.studentIdNumber}</TableCell>
                                        <TableCell>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <span className="truncate text-sm">{student.parentEmail}</span>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>{student.parentEmail}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TableCell>
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
                                            <div className="flex gap-2 justify-end">
                                                <Button asChild variant="outline" size="sm">
                                                    <Link href={`/teacher/students/${student.id}`}>View</Link>
                                                </Button>
                                                <Button size="sm" onClick={() => startNewAssessment({ studentId: student.id })}>
                                                    <PlusCircle size={16}/> New Assessment
                                                </Button>
                                            </div>
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
        </TooltipProvider>
    );
}
