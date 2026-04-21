'use client';

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWebhook } from "@/lib/hooks";
import type { ParentChildrenListResponse, ParentChild } from "@/lib/events";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, User, ChevronRight } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

function ChildCard({ child }: { child: ParentChild }) {
    return (
        <Card className="rounded-[2rem] border-border bg-white dark:bg-[#111827] shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 px-8 pt-8">
                <CardTitle className="text-xl font-bold">{child.childName}</CardTitle>
                <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center border border-border">
                    <User className="h-5 w-5 text-primary" />
                </div>
            </CardHeader>
            <CardContent className="px-8">
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{child.gradeLabel}</p>
                <p className="text-[10px] font-bold text-muted-foreground/60 mt-4 uppercase tracking-widest">
                    Last Sync: {child.latestReportAt ? format(new Date(child.latestReportAt), 'dd MMM yyyy') : 'No records yet'}
                </p>
            </CardContent>
            <div className="p-8 pt-4">
                <Button asChild className="w-full bg-primary hover:opacity-90 font-bold rounded-xl h-11">
                    <Link href={`/parent/children/${child.childId}/reports`}>
                        View Records <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </div>
        </Card>
    )
}

function DashboardSkeleton() {
    return (
         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
             {[...Array(2)].map((_, i) => (
                <Card key={i} className="rounded-[2rem]">
                    <CardHeader className="pb-2">
                        <Skeleton className="h-6 w-3/4" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-4 w-1/4 mb-2" />
                        <Skeleton className="h-3 w-1/2" />
                    </CardContent>
                    <div className="p-6 pt-0">
                         <Skeleton className="h-11 w-full" />
                    </div>
                </Card>
             ))}
         </div>
    )
}

export default function ParentDashboard() {
  const { data, isLoading, error, trigger } = useWebhook<{}, ParentChildrenListResponse>({
      eventName: 'PARENT_CHILDREN_LIST',
  });

  if (isLoading) {
      return (
          <div>
              <PageHeader
                title="Parent Portal"
                description="View your child’s progress reports."
                hideBack
              />
              <DashboardSkeleton />
          </div>
      )
  }

  if (error) {
      return (
          <div className="space-y-6">
            <PageHeader
                title="Parent Portal"
                description="Connection notice."
                hideBack
            />
            <Alert variant="destructive" className="max-w-2xl mx-auto rounded-[2rem] p-8 border-2 border-primary/20 bg-card">
                <AlertCircle className="h-6 w-6 text-primary" />
                <AlertTitle className="text-lg font-bold uppercase tracking-widest text-primary mb-2">Service Temporarily Unavailable</AlertTitle>
                <AlertDescription className="text-sm font-medium text-muted-foreground mb-6">
                    Athena was unable to sync with the academic records. Please try refreshing your view or contact the school office if this persists.
                    <div className="mt-6">
                            <Button variant="outline" className="font-bold rounded-xl px-8 h-11 border-primary/20 hover:bg-primary/5" onClick={() => trigger()}>Retry Connection</Button>
                        </div>
                </AlertDescription>
            </Alert>
          </div>
      )
  }

  return (
    <div>
      <PageHeader
        title="Parent Portal"
        description="Select a student to view their academic records and finalized reports."
        hideBack
      />
      
      {data?.children && data.children.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {data.children.map(child => <ChildCard key={child.childId} child={child} />)}
          </div>
      ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-card rounded-[2rem] border border-dashed border-border w-full shadow-sm mt-8">
              <User className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground font-bold">No students are currently linked to your portal account.</p>
              <p className="text-xs text-muted-foreground/60 mt-1 uppercase tracking-widest">Contact your school administrator to enroll.</p>
          </div>
      )}
    </div>
  );
}
