import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ParentDashboard() {
  return (
    <div>
      <PageHeader
        title="Parent Dashboard"
        description="Welcome! Here's a summary of your child's recent progress."
      />
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
          <CardDescription>Finalized reports from the last 30 days.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This area will display a list of recently finalized and published reports for your child.</p>
           <p className="mt-4 font-mono text-sm text-muted-foreground">
            TODO: Implement webhook call for `PARENT_DASHBOARD_GET`.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
