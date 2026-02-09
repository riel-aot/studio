'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { useWebhook } from '@/lib/hooks';
import type { ReportData } from '@/lib/events';
import { Skeleton } from '../ui/skeleton';
import { Badge } from '../ui/badge';
import { ArrowDown, ArrowRight, ArrowUp } from 'lucide-react';

interface ReportPreviewDrawerProps {
  reportId: string;
  onOpenChange: (isOpen: boolean) => void;
}

function PreviewSkeleton() {
    return (
        <div className="space-y-8 p-6">
            <div>
                <Skeleton className="h-7 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="space-y-3">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
            </div>
            <div className="space-y-3">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
            </div>
             <div className="space-y-3">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
            </div>
        </div>
    )
}

const trendIcons = {
    up: <ArrowUp className="h-4 w-4 text-green-600" />,
    down: <ArrowDown className="h-4 w-4 text-destructive" />,
    stable: <ArrowRight className="h-4 w-4 text-muted-foreground" />,
}

export function ReportPreviewDrawer({ reportId, onOpenChange }: ReportPreviewDrawerProps) {
    const { data, isLoading, error } = useWebhook<{ reportId: string }, { report: ReportData }>({
        eventName: 'REPORT_GET',
        payload: { reportId }
    });

    const report = data?.report;

  return (
    <Sheet open={!!reportId} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        {isLoading && <PreviewSkeleton />}
        {error && <p className='p-6 text-destructive'>Failed to load report: {error.message}</p>}
        {report && (
            <>
            <SheetHeader className='p-6'>
              <SheetTitle className='text-2xl'>Report for {report.studentName}</SheetTitle>
              <SheetDescription>
                {report.periodLabel} &bull; Generated {new Date(report.generatedAt).toLocaleDateString()}
              </SheetDescription>
            </SheetHeader>
            <div className='px-6 pb-6 space-y-8'>
                <div className="space-y-2">
                    <h3 className='font-semibold'>AI-Generated Summary</h3>
                    <p className='text-sm text-muted-foreground'>{report.summary}</p>
                    <p className='text-xs text-muted-foreground/70 pt-1'>Based on {report.includedAssessmentsCount} finalized assessments.</p>
                </div>
                 <div className="space-y-2">
                    <h3 className='font-semibold'>Identified Strengths</h3>
                    <ul className='list-disc list-inside space-y-1 text-sm'>
                        {report.strengths.map((s,i) => <li key={i}>{s}</li>)}
                    </ul>
                </div>
                 <div className="space-y-2">
                    <h3 className='font-semibold'>Potential Growth Areas</h3>
                    <ul className='list-disc list-inside space-y-1 text-sm'>
                        {report.growthAreas.map((g,i) => <li key={i}>{g}</li>)}
                    </ul>
                </div>

                 <div className="space-y-3">
                    <h3 className='font-semibold'>Rubric Snapshot</h3>
                    <div className='rounded-md border'>
                        {report.rubricSnapshot.map((item, index) => (
                            <div key={index} className={`flex items-center justify-between p-3 text-sm ${index < report.rubricSnapshot.length -1 ? 'border-b' : ''}`}>
                                <span className='font-medium'>{item.criterion}</span>
                                <div className='flex items-center gap-2'>
                                    <span>{trendIcons[item.trend]}</span>
                                    <Badge variant="secondary">Avg. {item.averageScore.toFixed(1)}</Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <h3 className='font-semibold'>Teacher&apos;s Final Comment</h3>
                    <p className='text-sm text-muted-foreground italic border-l-2 pl-4'>&quot;{report.teacherFinalComment}&quot;</p>
                </div>
            </div>
            </>
        )}
      </SheetContent>
    </Sheet>
  );
}
