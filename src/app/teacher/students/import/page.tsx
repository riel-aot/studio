import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ImportStudentsPage() {
  return (
    <div>
        <div className="mb-4">
            <Button asChild variant="outline" size="sm">
                <Link href="/teacher/students"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Students</Link>
            </Button>
        </div>
      <PageHeader
        title="Import Students"
        description="Bulk-add students to your classes."
      />
      <Card>
        <CardHeader>
          <CardTitle>Import from CSV</CardTitle>
          <CardDescription>
            This page will contain a file uploader to import students from a CSV file.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Content to be implemented.</p>
        </CardContent>
      </Card>
    </div>
  );
}
