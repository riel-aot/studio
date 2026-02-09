import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AssessmentsPage() {
  return (
    <div>
      <PageHeader
        title="Assessments"
        description="View and manage all student assessments."
      />
      <Card>
        <CardHeader>
          <CardTitle>All Assessments</CardTitle>
          <CardDescription>
            This page will show a searchable and filterable list of all assessments.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Content to be implemented.</p>
        </CardContent>
      </Card>
    </div>
  );
}
