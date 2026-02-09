// This page is a stub to demonstrate routing.
// TODO: Fetch student data using the useWebhook hook with the 'STUDENT_GET' event.

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { singleStudentData } from "@/lib/placeholder-data";
import { ArrowLeft, FilePlus } from "lucide-react";
import Link from "next/link";

export default function StudentDetailPage({ params }: { params: { id: string } }) {
  const student = singleStudentData(params.id);

  if (!student) {
    return <div>Student not found.</div>;
  }

  return (
    <div>
      <div className="mb-4">
        <Button asChild variant="outline" size="sm">
            <Link href="/teacher/students"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Roster</Link>
        </Button>
      </div>
      <PageHeader
        title={student.name || 'Student Details'}
        description={`Viewing details for student ID: ${params.id}`}
        actions={
          <Button asChild>
            <Link href="/teacher/assessments/new">
                <FilePlus className="mr-2 h-4 w-4" /> New Assessment for {student.name?.split(' ')[0]}
            </Link>
          </Button>
        }
      />
      <Card>
        <CardHeader>
          <CardTitle>Student Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This page will show detailed information about the student, including recent assessments, reports, and trends.</p>
          <p className="mt-4 font-mono text-sm text-muted-foreground">
            TODO: Implement webhook call for `STUDENT_GET` with payload `&#123; studentId: &quot;{params.id}&quot; &#125;`.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
