'use client';

import { useWebhook } from "@/lib/hooks";
import { type StudentAssessmentListItem } from "@/lib/events";
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, FilePlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { AlertCircle } from "lucide-react";

function AssessmentsTableSkeleton() {
    return (
        <Card>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Assessment Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Last Updated</TableHead>
                            <TableHead className="text-right w-[50px]"><span className="sr-only">View</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[...Array(3)].map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-28" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-5 w-5" /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
    return (
        <Alert variant="destructive" className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Failed to Load Assessments</AlertTitle>
            <AlertDescription>
                There was a problem fetching this student's assessments.
                <div className="mt-4">
                    <Button variant="destructive" onClick={onRetry}>Retry</Button>
                </div>
            </AlertDescription>
        </Alert>
    );
}

export function StudentAssessmentsTab({ studentId }: { studentId: string }) {
    const router = useRouter();
    const { data, isLoading, error, trigger: refetch } = useWebhook<{ studentId: string }, { assessments: StudentAssessmentListItem[] }>({
        eventName: 'STUDENT_ASSESSMENTS_LIST',
        payload: { studentId }
    });

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'Needs Review': return 'destructive';
            case 'AI Draft Ready': return 'default';
            case 'Draft': return 'secondary';
            case 'Finalized': return 'outline';
            default: return 'secondary';
        }
    };
    
    const handleRowClick = (assessmentId: string) => {
        router.push(`/teacher/assessments/${assessmentId}`);
    };
    
    const handleNewAssessmentClick = () => {
        // This relies on the parent page's webhook logic, just routes.
        router.push(`/teacher/assessments/new?studentId=${studentId}`);
    };

    if (isLoading) {
        return <AssessmentsTableSkeleton />;
    }

    if (error) {
        return <ErrorState onRetry={refetch} />;
    }

    if (!data || data.assessments.length === 0) {
        return (
            <div className="text-center py-16 border-dashed border-2 rounded-lg mt-2">
                <h3 className="text-xl font-semibold">No assessments yet</h3>
                <p className="text-muted-foreground mt-2 mb-4">Get started by creating the first assessment for this student.</p>
                <Button onClick={handleNewAssessmentClick}>
                    <FilePlus className="mr-2" />
                    Create First Assessment
                </Button>
            </div>
        );
    }

    return (
        <Card>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Assessment Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Last Updated</TableHead>
                            <TableHead className="text-right w-[50px]"><span className="sr-only">View</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.assessments.map((assessment) => (
                            <TableRow
                                key={assessment.id}
                                className="cursor-pointer"
                                onClick={() => handleRowClick(assessment.id)}
                            >
                                <TableCell className="font-medium">{assessment.name}</TableCell>
                                <TableCell>{assessment.type}</TableCell>
                                <TableCell>
                                    <Badge variant={getStatusVariant(assessment.status)}>{assessment.status}</Badge>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {format(parseISO(assessment.updatedAt), 'dd MMM yyyy')}
                                </TableCell>
                                <TableCell className="text-right">
                                    <ChevronRight className="h-4 w-4 text-muted-foreground inline-block opacity-50 group-hover:opacity-100 transition-opacity" />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
