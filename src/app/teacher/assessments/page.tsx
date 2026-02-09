
'use client';

import React, { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow, parseISO } from 'date-fns';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWebhook } from '@/lib/hooks';
import type { AssessmentListPayload, AssessmentListResponse, AssessmentStatus } from '@/lib/events';
import { AlertCircle, ChevronRight, FilePlus, Search } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const statusMap: Record<AssessmentStatus, string> = {
  draft: 'Draft',
  ai_draft_ready: 'AI Draft Ready',
  needs_review: 'Needs Review',
  finalized: 'Finalized',
};

const statusPillVariants: Record<AssessmentStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    draft: 'secondary',
    ai_draft_ready: 'default',
    needs_review: 'destructive',
    finalized: 'outline',
};

function AssessmentsPageSkeleton() {
  return (
    <div className="w-full">
      <PageHeader
        title="Assessments"
        description="Search, filter, and open assessments for review."
        actions={<Skeleton className="h-11 w-40" />}
      />
      <div className="mb-4 flex gap-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-40" />
      </div>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Skeleton className="h-10 w-full sm:w-64" />
            <Skeleton className="h-10 w-full sm:w-[400px]" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Assessment</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="w-12"><span className="sr-only">View</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-5" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function EmptyState() {
    return (
        <div className="text-center py-16 border-dashed border-2 rounded-lg mt-8">
            <h3 className="text-xl font-semibold">No assessments found</h3>
            <p className="text-muted-foreground mt-2 mb-4">Try adjusting your filters or create a new assessment.</p>
            <Button asChild>
                <Link href="/teacher/assessments/new">
                    <FilePlus className="mr-2 h-4 w-4" />
                    Create New Assessment
                </Link>
            </Button>
        </div>
    )
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <Alert variant="destructive" className="mt-8">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Failed to Load Assessments</AlertTitle>
      <AlertDescription>
        There was an issue fetching the assessment list. Please try again.
        <div className="mt-4">
          <Button variant="destructive" onClick={onRetry}>Retry</Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}


export default function AssessmentsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<Omit<AssessmentListPayload, 'pageSize'>>({ status: 'all', search: '', page: 1 });

  const { data, isLoading, error, trigger: refetch } = useWebhook<AssessmentListPayload, AssessmentListResponse>({
    eventName: 'ASSESSMENT_LIST',
    payload: { ...filters, pageSize: 10 },
  });

  const handleStatusChange = (status: string) => {
    setFilters(prev => ({ ...prev, status: status as AssessmentStatus, page: 1 }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }));
  };

  const handlePageChange = (direction: 'next' | 'prev') => {
    setFilters(prev => ({
        ...prev,
        page: direction === 'next' ? (prev.page ?? 1) + 1 : (prev.page ?? 1) - 1,
    }));
  };

  const handleRowClick = (assessmentId: string) => {
    router.push(`/teacher/assessments/${assessmentId}`);
  };

  const counts = data?.counts;
  const items = data?.items ?? [];
  const pagination = data?.pagination;

  const pageNumber = pagination?.page ?? 1;
  const totalPages = pagination ? Math.ceil(pagination.total / pagination.pageSize) : 1;

  if (isLoading && !data) {
    return <AssessmentsPageSkeleton />;
  }

  if (error && !data) {
    return (
      <div className="w-full">
         <PageHeader
            title="Assessments"
            description="Search, filter, and open assessments for review."
            actions={
              <Button asChild>
                <Link href="/teacher/assessments/new"><FilePlus className="mr-2 h-4 w-4" /> New Assessment</Link>
              </Button>
            }
          />
        <ErrorState onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="w-full">
      <PageHeader
        title="Assessments"
        description="Search, filter, and open assessments for review."
        actions={
          <Button asChild>
            <Link href="/teacher/assessments/new"><FilePlus className="mr-2 h-4 w-4" /> New Assessment</Link>
          </Button>
        }
      />
      
      {/* Quick Counts */}
      <div className="mb-4 flex items-center gap-4 text-sm">
        <Button variant="link" className="p-0 h-auto text-muted-foreground hover:text-primary" onClick={() => handleStatusChange('needs_review')}>
            Needs Review: <span className="font-semibold ml-1 text-foreground">{counts?.needsReview ?? '-'}</span>
        </Button>
        <Button variant="link" className="p-0 h-auto text-muted-foreground hover:text-primary" onClick={() => handleStatusChange('draft')}>
            Drafts: <span className="font-semibold ml-1 text-foreground">{counts?.drafts ?? '-'}</span>
        </Button>
         <Button variant="link" className="p-0 h-auto text-muted-foreground" disabled>
            Finalized This Week: <span className="font-semibold ml-1 text-foreground">{counts?.finalizedThisWeek ?? '-'}</span>
        </Button>
      </div>

      <Card>
        <CardHeader>
            {/* Filter Bar */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                 <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search student or title..."
                        className="w-full rounded-lg bg-background pl-8"
                        value={filters.search}
                        onChange={handleSearchChange}
                        disabled={isLoading}
                    />
                </div>
                <Tabs value={filters.status} onValueChange={handleStatusChange} className="w-full overflow-x-auto sm:w-auto">
                    <TabsList className="w-full sm:w-auto">
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="needs_review">Needs Review</TabsTrigger>
                        <TabsTrigger value="ai_draft_ready">AI Draft Ready</TabsTrigger>
                        <TabsTrigger value="draft">Draft</TabsTrigger>
                        <TabsTrigger value="finalized">Finalized</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>
        </CardHeader>
        <CardContent>
            {items.length > 0 ? (
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Assessment Title</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Rubric</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Updated</TableHead>
                        <TableHead className="w-12"><span className="sr-only">View</span></TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {items.map((item) => (
                        <TableRow key={item.assessmentId} onClick={() => handleRowClick(item.assessmentId)} className="cursor-pointer">
                        <TableCell className="font-medium">{item.title}</TableCell>
                        <TableCell className="text-muted-foreground">{item.student.name}</TableCell>
                        <TableCell className="text-muted-foreground">{item.rubric.name}</TableCell>
                        <TableCell>
                            <Badge variant={statusPillVariants[item.status]}>{statusMap[item.status]}</Badge>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground text-xs">
                            {formatDistanceToNow(parseISO(item.updatedAt), { addSuffix: true }).replace('about ', '')}
                        </TableCell>
                        <TableCell>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            ) : (
                <EmptyState />
            )}
        </CardContent>
        {pagination && pagination.total > pagination.pageSize && (
            <div className="flex items-center justify-end gap-2 border-t p-4">
                <span className="text-sm text-muted-foreground">
                    Page {pageNumber} of {totalPages}
                </span>
                <Button variant="outline" size="sm" onClick={() => handlePageChange('prev')} disabled={pageNumber <= 1}>
                    Previous
                </Button>
                <Button variant="outline" size="sm" onClick={() => handlePageChange('next')} disabled={pageNumber >= totalPages}>
                    Next
                </Button>
            </div>
        )}
      </Card>
    </div>
  );
}
