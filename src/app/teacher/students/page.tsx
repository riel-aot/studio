'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { PlusCircle, FileUp, ChevronRight, Search, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useWebhook } from '@/lib/hooks';
import type { GetStudentListData, StudentListItem } from '@/lib/events';
import { Skeleton } from '@/components/ui/skeleton';
import { AddStudentDrawer } from '@/components/add-student-drawer';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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

function SearchEmptyState({ searchTerm, onClear }: { searchTerm: string; onClear: () => void; }) {
    return (
        <div className="text-center py-16 border-dashed border-2 rounded-lg w-full">
            <h3 className="text-xl font-semibold">No students found for &quot;{searchTerm}&quot;</h3>
            <p className="text-muted-foreground mt-2 mb-4">Try a different search term or clear the search.</p>
            <Button onClick={onClear} variant="outline">
                Clear Search
            </Button>
        </div>
    )
}


function ErrorState({ onRetry }: { onRetry: () => void }) {
    return (
        <Alert variant="destructive" className="mt-8">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Failed to Load Students</AlertTitle>
            <AlertDescription>
                There was an issue fetching the student list.
                <div className="mt-4">
                    <Button variant="destructive" onClick={onRetry}>Try Again</Button>
                </div>
            </AlertDescription>
        </Alert>
    );
}


export default function StudentsPage() {
    const router = useRouter();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    const { data, isLoading, error, trigger: refetchStudents } = useWebhook<{ search: string }, GetStudentListData>({ 
        eventName: 'STUDENT_LIST',
        payload: { search: searchTerm },
    });

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
            case 'Needs Review': return 'destructive';
            case 'Draft in Progress': 
            case 'Up to Date':
            case 'No Assessments':
            default: 
                return 'secondary';
        }
    }
    
    if (isLoading && !data) return (
        <div className="w-full">
             <PageHeader
                title="Students"
                description="All students in your classes."
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
    
    const hasStudents = data?.students && data.students.length > 0;
    const isSearching = searchTerm.length > 0;

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
                title="Students"
                description="All students in your classes."
                actions={
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href="/teacher/students/import"><FileUp/> Import Students</Link>
                        </Button>
                        <Button onClick={() => setIsDrawerOpen(true)}><PlusCircle/> Add Student</Button>
                    </div>
                }
            />

            {error ? (
                <ErrorState onRetry={refetchStudents} />
            ) : hasStudents || isSearching ? (
                 <Card className="w-full">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>All Students ({data?.total || 0})</CardTitle>
                            </div>
                             <div className="relative w-full max-w-sm">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search student name..."
                                    className="w-full rounded-lg bg-secondary pl-8 h-9"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {hasStudents ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Class / Grade</TableHead>
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
                                            <TableCell className="font-medium">{student.name}</TableCell>
                                            <TableCell>{student.class}</TableCell>
                                            <TableCell className="font-mono text-xs text-muted-foreground">{student.studentIdNumber}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {student.lastAssessmentDate 
                                                    ? format(parseISO(student.lastAssessmentDate), 'dd MMM yyyy')
                                                    : 'None'
                                                }
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusVariant(student.status)}>{student.status}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <ChevronRight className="h-4 w-4 text-muted-foreground inline-block opacity-50 group-hover:opacity-100 transition-opacity" />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <SearchEmptyState searchTerm={searchTerm} onClear={() => setSearchTerm('')} />
                        )}
                    </CardContent>
                </Card>
            ) : (
                <EmptyState onAddStudent={() => setIsDrawerOpen(true)} />
            )}
        </div>
    );
}
