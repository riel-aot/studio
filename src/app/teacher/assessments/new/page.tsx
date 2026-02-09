'use client';

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useWebhook } from "@/lib/hooks";
import type { StudentListItem } from "@/lib/events";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NewAssessmentPage() {
    const router = useRouter();
    const { toast } = useToast();

    // In a real app, you would likely fetch students and rubrics to populate the form
    const { data: studentData, isLoading: studentsLoading } = useWebhook<{ }, { students: StudentListItem[] }>({
        eventName: 'STUDENT_LIST',
    });

    // We use the `manual` option here, so the webhook is only called on form submission.
    const { trigger: createAssessment, isLoading: isCreating } = useWebhook<{ title: string, studentId: string }, { assessmentId: string }>({
        eventName: 'ASSESSMENT_CREATE_DRAFT',
        manual: true,
        onSuccess: (data) => {
            toast({ title: "Draft Created", description: "Your new assessment has been saved as a draft." });
            router.push(`/teacher/assessments/${data.assessmentId}`);
        },
        onError: (error) => {
             // Toast is already shown by the hook
        }
    });

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const title = formData.get('title') as string;
        const studentId = formData.get('studentId') as string;

        if (!title || !studentId) {
            toast({ variant: 'destructive', title: "Missing fields", description: "Please provide a title and select a student." });
            return;
        }

        await createAssessment({ title, studentId });
    };

  return (
    <div>
        <div className="mb-4">
            <Button asChild variant="outline" size="sm">
                <Link href="/teacher/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Link>
            </Button>
        </div>
      <PageHeader
        title="New Assessment"
        description="Start a new assessment for a student. It will be saved as a draft."
      />

        <form onSubmit={handleSubmit}>
            <Card className="mx-auto max-w-2xl">
                <CardHeader>
                    <CardTitle>Assessment Details</CardTitle>
                    <CardDescription>Fill in the initial details. You can add more criteria later.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Assessment Title</Label>
                        <Input id="title" name="title" placeholder="e.g., Unit 5 Reading Comprehension" required/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="studentId">Student</Label>
                        <Select name="studentId" required>
                            <SelectTrigger id="studentId" disabled={studentsLoading}>
                                <SelectValue placeholder={studentsLoading ? "Loading students..." : "Select a student"} />
                            </SelectTrigger>
                            <SelectContent>
                                {studentData?.students.map(student => (
                                    <SelectItem key={student.id} value={student.id}>
                                        {student.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="notes">Initial Notes (Optional)</Label>
                        <Textarea id="notes" name="notes" placeholder="Any initial thoughts or instructions..."/>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={isCreating}>
                        {isCreating ? 'Saving Draft...' : 'Save as Draft'}
                    </Button>
                </CardFooter>
            </Card>
        </form>
         <p className="mt-4 text-center text-xs text-muted-foreground">
            TODO: Implement webhook call for `ASSESSMENT_CREATE_DRAFT`.
          </p>
    </div>
  );
}
