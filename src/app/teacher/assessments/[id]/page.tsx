// This page is a stub to demonstrate routing.
// TODO: Fetch assessment data using the useWebhook hook with the 'ASSESSMENT_GET' event.

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function AssessmentDetailPage({ params }: { params: { id: string } }) {
  return (
    <div>
        <div className="mb-4">
            <Button asChild variant="outline" size="sm">
                <Link href="/teacher/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Link>
            </Button>
        </div>
      <PageHeader
        title="Assessment Editor"
        description={`Editing assessment with ID: ${params.id}`}
        actions={
            <Button>
                <CheckCircle className="mr-2 h-4 w-4" />
                Finalize Assessment
            </Button>
        }
      />
      <Card>
        <CardHeader>
          <CardTitle>Assessment Content</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This page will contain the full assessment editor, allowing the teacher to fill out rubric criteria, add comments, and finalize the assessment.</p>
          <p className="mt-4 font-mono text-sm text-muted-foreground">
            TODO: Implement webhook call for `ASSESSMENT_GET` with payload `&#123; assessmentId: &quot;{params.id}&quot; &#125;`.
          </p>
          <p className="mt-2 font-mono text-sm text-muted-foreground">
            TODO: The "Finalize" button should trigger the `ASSESSMENT_FINALIZE` event.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
