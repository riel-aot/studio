'use client';

import React, { useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';

import { PageHeader } from '@/components/page-header';
import { StatCard, StatCardSkeleton } from '@/components/stat-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useWebhook } from '@/lib/hooks';
import type { DashboardKpis, ReviewQueueItem, DraftItem } from '@/lib/events';
import { normalizeAssessmentIdentifier } from '@/lib/utils';
import { FileEdit, FilePlus, PenSquare, FileText, AlertCircle, Users, ChevronRight, BarChart3, Clock, Sparkles } from 'lucide-react';
import { OnboardingTour } from '@/components/onboarding-tour';
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

// Mock data for the activity pulse chart
const pulseData = [
  { day: 'Mon', count: 4 },
  { day: 'Tue', count: 7 },
  { day: 'Wed', count: 5 },
  { day: 'Thu', count: 12 },
  { day: 'Fri', count: 8 },
  { day: 'Sat', count: 2 },
  { day: 'Sun', count: 3 },
];

function DashboardLoadingSkeleton() {
  return (
    <div className="space-y-8">
      <PageHeader title="Dashboard" description="Review queue, drafts, and recent activity." />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <div className="h-[400px] w-full rounded-2xl bg-white animate-pulse border border-slate-200" />
        </div>
        <div className="space-y-8">
          <div className="h-[300px] w-full rounded-2xl bg-white animate-pulse border border-slate-200" />
        </div>
      </div>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
    return (
        <Alert variant="destructive" className="max-w-2xl mx-auto mt-10">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>System Sync Interrupted</AlertTitle>
            <AlertDescription>
                We encountered an issue retrieving your latest classroom data.
                <div className="mt-4">
                    <Button variant="destructive" onClick={onRetry} className="font-bold">Retry Connection</Button>
                </div>
            </AlertDescription>
        </Alert>
    );
}

export default function TeacherDashboard() {
  const router = useRouter();

  const { data: kpiData, isLoading: kpiLoading, error: kpiError, trigger: refetchKpis } = useWebhook<{ }, { kpis: DashboardKpis }>({
    eventName: 'GET_DASHBOARD_SUMMARY',
  });
  
  const { data: reviewQueueData, isLoading: reviewQueueLoading, error: reviewQueueError, trigger: refetchReviewQueue } = useWebhook<{ limit: number }, { items: ReviewQueueItem[] }>({
    eventName: 'GET_REVIEW_QUEUE',
    payload: { limit: 5 },
  });

  const { data: draftsData, isLoading: draftsLoading, error: draftsError, trigger: refetchDrafts } = useWebhook<{ limit: number }, { items: DraftItem[] }>({
    eventName: 'GET_DRAFTS',
    payload: { limit: 5 },
  });

  const handleReviewOpen = useCallback((_: any, payload?: { assessmentId: string }) => {
    const normalized = normalizeAssessmentIdentifier(payload?.assessmentId) ?? payload?.assessmentId;
    if (normalized) {
        router.push(`/teacher/assessments/${normalized}`);
    }
  }, [router]);

  const { trigger: openReview } = useWebhook<{ assessmentId: string }, {}>({
    eventName: 'REVIEW_OPEN',
    manual: true,
    onSuccess: handleReviewOpen,
  });

  const handleNewAssessmentStart = useCallback(() => {
    router.push(`/teacher/assessments/new`);
  }, [router]);

  const { trigger: startNewAssessment } = useWebhook<{}, {}>({
    eventName: 'NEW_ASSESSMENT_START',
    manual: true,
    onSuccess: handleNewAssessmentStart,
  });

  const isLoading = kpiLoading || reviewQueueLoading || draftsLoading;
  const hasError = kpiError || reviewQueueError || draftsError;

  const handleRetry = () => {
    if (kpiError) refetchKpis();
    if (reviewQueueError) refetchReviewQueue();
    if (draftsError) refetchDrafts();
  };

  if (isLoading) return <DashboardLoadingSkeleton />;
  if (hasError) return <ErrorState onRetry={handleRetry} />;

  return (
    <div className="space-y-10">
      <OnboardingTour />
      
      <div className="flex flex-col gap-2">
        <PageHeader 
          title="Academic Pulse"
          description="Your real-time grading queue and classroom performance summary."
          hideBack
        />
      </div>

      {/* KPI Section */}
      <div id="onboarding-kpis" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Action Required" value={kpiData?.kpis.pendingReview ?? 0} icon={PenSquare} description="Pending teacher review" />
        <StatCard title="Drafts" value={kpiData?.kpis.drafts ?? 0} icon={FileEdit} description="In-progress assignments" />
        <StatCard title="Week Finalized" value={kpiData?.kpis.finalizedThisWeek ?? 0} icon={Users} description="Assessments completed this week" />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Main Feed: Priority Tasks */}
        <div className="lg:col-span-8 space-y-8">
          <Card id="onboarding-review-queue" className="border-[#E5E7EB] shadow-sm overflow-hidden">
            <CardHeader className="bg-white border-b border-[#F1F2F6] pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold text-[#111827]">Grading Priority</CardTitle>
                  <CardDescription className="text-slate-500">Submissions ready for your final validation.</CardDescription>
                </div>
                <Badge variant="secondary" className="bg-blue-50 text-[#2F5BEA] border-none font-bold">
                  {reviewQueueData?.items.length || 0} ITEMS
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {reviewQueueData?.items && reviewQueueData.items.length > 0 ? (
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow className="hover:bg-transparent border-b border-[#F1F2F6]">
                      <TableHead className="font-bold text-[#111827] h-12">Student</TableHead>
                      <TableHead className="font-bold text-[#111827] h-12">Assessment</TableHead>
                      <TableHead className="font-bold text-[#111827] h-12">Status</TableHead>
                      <TableHead className="hidden md:table-cell text-right font-bold text-[#111827] h-12">Last Update</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reviewQueueData.items.map((item) => (
                      <TableRow
                        key={item.assessmentId}
                        onClick={() => openReview({ assessmentId: normalizeAssessmentIdentifier(item.assessmentId) ?? item.assessmentId })}
                        className="group cursor-pointer hover:bg-slate-50/80 transition-colors border-b border-[#F1F2F6] last:border-0"
                      >
                        <TableCell className="font-semibold text-[#111827] py-4">{item.studentName}</TableCell>
                        <TableCell className="text-slate-600 py-4">{item.assessmentName}</TableCell>
                        <TableCell className="py-4">
                          <Badge variant={item.status === 'ai_draft_ready' ? 'default' : 'destructive'} className="rounded-md font-bold uppercase text-[10px] tracking-wider px-2 py-0.5">
                            {item.status === 'ai_draft_ready' ? 'AI READY' : 'REVIEW'}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-right text-slate-400 py-4 font-medium">
                          {formatDistanceToNow(new Date(item.updatedAt), { addSuffix: true }).replace('about ', '')}
                        </TableCell>
                        <TableCell className="text-right py-4 pr-6">
                          <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-[#2F5BEA] group-hover:translate-x-0.5 transition-all" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                  <div className="h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                    <Sparkles className="h-8 w-8 text-[#2F5BEA]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#111827]">Queue Cleared</h3>
                  <p className="text-slate-500 max-w-xs mt-1">All current submissions have been processed. Great work!</p>
                  <Button onClick={() => startNewAssessment()} className="mt-6 bg-[#2F5BEA] font-bold">
                    <FilePlus className="mr-2 h-4 w-4" /> Start New Assessment
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity Chart: Weekly Grading Pulse */}
          <Card className="border-[#E5E7EB] shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-[#2F5BEA]" />
                <CardTitle className="text-lg font-bold">Grading Velocity</CardTitle>
              </div>
              <CardDescription>Finalized assessments over the last 7 days.</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={pulseData}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2F5BEA" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#2F5BEA" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 12}}
                    dy={10}
                  />
                  <Tooltip 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#2F5BEA" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorCount)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Side Actions & Drafts */}
        <div className="lg:col-span-4 space-y-8">
          <Card id="onboarding-quick-actions" className="bg-[#2F5BEA] text-white border-none shadow-lg shadow-blue-500/20 overflow-hidden relative">
            <div className="absolute top-[-20px] right-[-20px] h-40 w-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <CardHeader>
              <CardTitle className="text-xl font-bold">Quick Actions</CardTitle>
              <CardDescription className="text-blue-100">Common administrative tasks.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 relative z-10">
              <Button onClick={() => startNewAssessment()} className="w-full bg-white text-[#2F5BEA] hover:bg-blue-50 h-12 font-bold rounded-xl transition-all border-none">
                <FilePlus className="mr-2 h-5 w-5" /> New Assessment
              </Button>
              <Button asChild variant="outline" className="w-full bg-transparent border-white/20 text-white hover:bg-white/10 h-12 font-bold rounded-xl">
                <Link href="/teacher/assessments"><FileText className="mr-2 h-5 w-5" /> All Assignments</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-[#E5E7EB] shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-slate-400" />
                <CardTitle className="text-lg font-bold">Recent Drafts</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {draftsData?.items && draftsData.items.length > 0 ? (
                draftsData.items.map((draft) => (
                  <div key={draft.assessmentId} className="flex items-center justify-between group p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-slate-100">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#111827] truncate">{draft.assessmentName}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{draft.studentName}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-[#2F5BEA] transition-colors shrink-0" />
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400 text-center py-4">No active drafts found.</p>
              )}
              <Button variant="ghost" className="w-full text-[#2F5BEA] font-bold hover:bg-blue-50 text-xs mt-2" asChild>
                <Link href="/teacher/assessments?status=draft">View All Drafts</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
