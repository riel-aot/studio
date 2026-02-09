'use client';

import { PageHeader } from '@/components/page-header';
import { StatCard, StatCardSkeleton } from '@/components/stat-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useWebhook } from '@/lib/hooks';
import type { GetDashboardSummaryData } from '@/lib/events';
import { BookCopy, FilePlus, Users, PenSquare, Draft } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

function DashboardLoadingSkeleton() {
    return (
        <div>
            <PageHeader title="Dashboard" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
            </div>
            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                 <Card>
                    <CardHeader>
                        <CardTitle>To Review</CardTitle>
                        <CardDescription>Assessments waiting for your feedback.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="flex items-center">
                                    <Skeleton className="h-8 w-full" />
                                 </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                           <Skeleton className="h-10 w-full" />
                           <Skeleton className="h-10 w-full" />
                           <Skeleton className="h-10 w-full" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}


export default function TeacherDashboard() {
  const { data, isLoading, error } = useWebhook<
    {},
    GetDashboardSummaryData
  >({
    eventName: 'GET_DASHBOARD_SUMMARY',
    // In a real app, you might fetch this from a real endpoint.
    // For now, we'll just show an error state if the hook fails.
  });

  if (isLoading) {
    return <DashboardLoadingSkeleton />;
  }
  
  if (error || !data) {
     return <div className="text-red-500">Error loading dashboard data: {error?.message}</div>
  }

  return (
    <div>
      <PageHeader title="Dashboard" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Pending Review" value={data.kpis.pendingReview} icon={PenSquare} />
        <StatCard title="Drafts" value={data.kpis.drafts} icon={Draft} />
        <StatCard title="Finalized This Week" value={data.kpis.finalizedThisWeek} icon={Users} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>To Review</CardTitle>
            <CardDescription>
              These assessments are complete and waiting for your feedback.
            </CardDescription>
          </CardHeader>
          <CardContent>
             {data.reviewQueue.length > 0 ? (
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead className="hidden sm:table-cell">Assessment</TableHead>
                            <TableHead className="hidden md:table-cell text-right">Submitted</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.reviewQueue.map((item) => (
                        <TableRow key={item.assessmentId}>
                            <TableCell className="font-medium">{item.studentName}</TableCell>
                            <TableCell className="hidden sm:table-cell">{item.assessmentName}</TableCell>
                            <TableCell className="hidden md:table-cell text-right text-muted-foreground">{formatDistanceToNow(new Date(item.updatedAt), { addSuffix: true })}</TableCell>
                            <TableCell className="text-right">
                                <Button asChild variant="outline" size="sm">
                                    <Link href={`/teacher/assessments/${item.assessmentId}`}>Review</Link>
                                </Button>
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
             ) : (
                <p className="text-sm text-muted-foreground">Your review queue is empty. Great job!</p>
             )}
          </CardContent>
        </Card>

        <div className="space-y-6">
            <Card>
            <CardHeader>
                <CardTitle>Drafts</CardTitle>
                <CardDescription>
                Continue working on these assessments.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {data.drafts.length > 0 ? (
                    <div className="space-y-4">
                        {data.drafts.map(draft => (
                             <div key={draft.assessmentId} className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">{draft.assessmentName}</p>
                                    <p className="text-sm text-muted-foreground">{draft.studentName}</p>
                                </div>
                                <Button asChild variant="secondary" size="sm">
                                    <Link href={`/teacher/assessments/${draft.assessmentId}`}>Continue</Link>
                                </Button>
                            </div>
                        ))}
                    </div>
                ): (
                    <p className="text-sm text-muted-foreground">No drafts in progress.</p>
                )}
            </CardContent>
            </Card>

            <Card>
            <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
                <Button asChild variant="default" className="justify-start">
                    <Link href="/teacher/assessments/new"><FilePlus className="mr-2 h-4 w-4" /> New Assessment</Link>
                </Button>
                <Button asChild variant="secondary" className="justify-start">
                    <Link href="/teacher/rubrics"><BookCopy className="mr-2 h-4 w-4" /> Manage Rubrics</Link>
                </Button>
                <Button asChild variant="secondary" className="justify-start">
                    <Link href="/teacher/students"><Users className="mr-2 h-4 w-4" /> View Students</Link>
                </Button>
            </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
