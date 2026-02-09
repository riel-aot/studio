import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Printer } from "lucide-react";
import Link from "next/link";

export default function ParentReportPage({ params }: { params: { id: string } }) {
  return (
    <div>
        <div className="mb-4">
            <Button asChild variant="outline" size="sm">
                <Link href="/parent/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Link>
            </Button>
        </div>
      <PageHeader
        title="Viewing Report"
        description={`Report ID: ${params.id}`}
        actions={
            <Button variant="secondary">
                <Printer className="mr-2 h-4 w-4" />
                Print Report
            </Button>
        }
      />
      <Card>
        <CardHeader>
          <CardTitle>Report Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This page will show a read-only view of a finalized report.</p>
          <p className="mt-4 font-mono text-sm text-muted-foreground">
            TODO: Implement webhook call for `REPORT_GET` with payload `&#123; reportId: &quot;{params.id}&quot; &#125;`.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
