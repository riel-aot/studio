import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download } from "lucide-react";

export default function ReportsPage() {
  return (
    <div>
      <PageHeader
        title="Reports"
        description="Generate and view reports for students and classes."
         actions={
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Generate New Report
          </Button>
        }
      />
      <Card>
        <CardHeader>
          <CardTitle>Generated Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This page will list all generated reports, with options to filter by student, class, or date range.</p>
           <p className="mt-4 font-mono text-sm text-muted-foreground">
            TODO: Implement webhook calls for `REPORT_LIST`, `REPORT_GENERATE`, etc.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
