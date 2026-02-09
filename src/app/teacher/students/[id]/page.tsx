'use client';

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FilePlus } from "lucide-react";
import Link from "next/link";
import { useWebhook } from "@/lib/hooks";
import type { StudentProfileData } from "@/lib/events";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import { StudentAssessmentsTab } from "@/components/student-assessments-tab";
import { StudentReportsTab } from "@/components/student-reports-tab";
import { useCallback, use } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

function ProfilePageSkeleton() {
    return (
        <div>
            <div className="mb-4">
                <Skeleton className="h-9 w-36" />
            </div>
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                <div>
                    <Skeleton className="h-9 w-48 mb-3" />
                    <Skeleton className="h-5 w-64" />
                </div>
                <Skeleton className="h-11 w-40" />
            </div>
            
            <div className="grid gap-6 mt-6 md:grid-cols-3">
                <div className="md:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>Student Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="grid grid-cols-2">
                                   <Skeleton className="h-4 w-20" />
                                   <Skeleton className="h-4 w-32" />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
                <div className="md:col-span-2">
                     <Tabs defaultValue="assessments">
                        <TabsList>
                            <TabsTrigger value="assessments">Assessments</TabsTrigger>
                            <TabsTrigger value="reports">Reports</TabsTrigger>
                        </TabsList>
                        <TabsContent value="assessments">
                             <Skeleton className="h-[300px] w-full mt-2" />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
    return (
        <Alert variant="destructive" className="max-w-2xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Failed to Load Student Profile</AlertTitle>
            <AlertDescription>
                There was a problem fetching the student's data. Please try again.
                <div className="mt-4">
                    <Button variant="destructive" onClick={onRetry}>Retry</Button>
                </div>
            </AlertDescription>
        </Alert>
    );
}


export default function StudentDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const pageParams = use(params);

  const { data: studentData, isLoading, error, trigger: refetchStudent } = useWebhook<{ studentId: string }, { student: StudentProfileData }>({ 
      eventName: 'STUDENT_GET', 
      payload: { studentId: pageParams.id } 
  });
  
  const student = studentData?.student;

  const handleNewAssessmentSuccess = useCallback(() => {
    router.push(`/teacher/assessments/new?studentId=${pageParams.id}`);
  }, [router, pageParams.id]);

  const { trigger: startNewAssessment, isLoading: isCreatingAssessment } = useWebhook<{ studentId: string }, {}>({
    eventName: 'NEW_ASSESSMENT_START',
    manual: true,
    onSuccess: handleNewAssessmentSuccess,
  });

  if (isLoading && !student) {
    return <ProfilePageSkeleton />;
  }

  if (error) {
    return (
        <div>
            <div className="mb-4">
                <Button asChild variant="outline" size="sm">
                    <Link href="/teacher/students"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Students</Link>
                </Button>
            </div>
            <ErrorState onRetry={refetchStudent} />
        </div>
    )
  }

  if (!student) {
    return <div>
         <div className="mb-4">
            <Button asChild variant="outline" size="sm">
                <Link href="/teacher/students"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Students</Link>
            </Button>
        </div>
        <p>Student not found.</p>
    </div>;
  }

  return (
    <div className="w-full">
      <div className="mb-4">
        <Button asChild variant="outline" size="sm">
            <Link href="/teacher/students"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Students</Link>
        </Button>
      </div>
      
      <PageHeader
        title={student.name}
        description={
            <span className="flex items-center gap-4 text-muted-foreground">
                <span>{student.class}</span>
                <span className="font-mono text-xs">{student.studentIdNumber}</span>
            </span>
        }
        actions={
          <Button onClick={() => startNewAssessment({ studentId: student.id })} disabled={isCreatingAssessment}>
            <FilePlus className="mr-2 h-4 w-4" />
            {isCreatingAssessment ? 'Starting...' : 'New Assessment'}
          </Button>
        }
      />
      
        <div className="grid gap-6 mt-6 md:grid-cols-3">
            <div className="md:col-span-1">
                <Card>
                    <CardHeader>
                        <CardTitle>Student Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                        <div className="grid grid-cols-2 items-center">
                           <span className="text-muted-foreground">Student ID</span>
                           <span className="font-mono text-xs">{student.studentIdNumber}</span>
                        </div>
                        <div className="grid grid-cols-2 items-center">
                           <span className="text-muted-foreground">Class / Group</span>
                           <span>{student.class}</span>
                        </div>
                        <div className="grid grid-cols-2 items-center">
                           <span className="text-muted-foreground">Student Email</span>
                           <span className="truncate">{student.studentEmail || 'N/A'}</span>
                        </div>
                        <div className="grid grid-cols-2 items-center">
                           <span className="text-muted-foreground">Parent Email</span>
                           <span className="truncate">{student.parentEmail}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="md:col-span-2">
                <Tabs defaultValue="assessments">
                    <TabsList>
                        <TabsTrigger value="assessments">Assessments</TabsTrigger>
                        <TabsTrigger value="reports">Reports</TabsTrigger>
                    </TabsList>
                    <TabsContent value="assessments">
                        <StudentAssessmentsTab studentId={student.id} />
                    </TabsContent>
                    <TabsContent value="reports">
                        <StudentReportsTab studentId={student.id} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    </div>
  );
}
