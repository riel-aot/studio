import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";

export default function RubricsPage() {
  return (
    <div>
      <PageHeader
        title="Rubrics"
        description="Create, view, and manage your grading rubrics."
        actions={
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Rubric
          </Button>
        }
      />
      <Card>
        <CardHeader>
          <CardTitle>Your Rubric Library</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This page will list all of your saved rubrics. You will be able to edit them or create new ones from templates.</p>
           <p className="mt-4 font-mono text-sm text-muted-foreground">
            TODO: Implement webhook calls for `RUBRIC_LIST`, `RUBRIC_CREATE`, etc.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
