'use client';

import React, { useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';

import { StatCard, StatCardSkeleton } from '@/components/stat-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useWebhook } from '@/lib/hooks';
import { useAuth } from '@/hooks/use-auth';
import type { DashboardKpis, ReviewQueueItem, DraftItem } from '@/lib/events';
import { normalizeAssessmentIdentifier } from '@/lib/utils';
import { FilePlus, PenSquare, AlertCircle, ChevronRight, Activity, GraduationCap, CheckCircle2, AlertTriangle, MessageSquare, Calendar, Sparkles, Clock } from 'lucide-react';
import { OnboardingTour } from '@/components/onboarding-tour';
import { Bar, BarChart, ResponsiveContainer, XAxis, Tooltip, Cell } from 'recharts';
import { Progress } from '@/components/ui/progress';
import Image from 'next/image';

const gradeDistData = [
  { range: 'A', count: 12, fill: '#2F5BEA' },
  { range: 'B', count: 18, fill: '#4F79F2' },
  { range: 'C', count: 8, fill: '#7F9CF5' },
  { range: 'D', count: 3, fill: '#A5B4FC' },
  { range: 'F', count: 1, fill: '#E5E7EB' },
];

function DashboardLoadingSkeleton() {
  return (
    <div className="space-y-8">
      <div className="h-64 w-full rounded-2xl bg-white animate-pulse" />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
    return (
        <Alert variant="destructive" className="max-w-xl mx-auto mt-10">
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
  const { user } = useAuth();

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
    <div className="space-y-8">
      <OnboardingTour />
      
      {/* Welcome Banner - Solid Blue Layout */}
      <div className="relative overflow-hidden rounded-2xl bg-[#2F5BEA] text-white p-8 md:p-12 shadow-lg min-h-[240px] flex items-center border border-[#E5E7EB]">
        <div className="max-w-md space-y-4 relative z-10">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Welcome back, {user?.name || 'Teacher'}
          </h1>
          <p className="text-blue-100 text-sm md:text-base font-medium leading-relaxed">
            You have {kpiData?.kpis.pendingReview ?? 3} assignments pending review. Check your queue to provide feedback.
          </p>
        </div>

        {/* Classroom Illustration - Anchored bottom-right with 2.1x scale */}
        <div className="absolute right-0 bottom-0 h-48 w-72 pointer-events-none">
          <Image 
            src="/images/athena-classroom.png" 
            alt="Classroom illustration"
            fill
            className="object-contain scale-[2.1] origin-bottom-right translate-x-[39px] translate-y-[80px]"
            priority
            data-ai-hint="classroom illustration"
          />
        </div>
      </div>

      {/* Today's Teacher Brief */}
      <div id="onboarding-kpis" className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
            <Sparkles className="h-3 w-3 text-[#2F5BEA]" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#111827]">Today&apos;s Teacher Brief</h2>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Action Items</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            title="Needs Grading" 
            value={kpiData?.kpis.pendingReview ?? 3} 
            icon={PenSquare} 
            description="Awaiting review" 
          />
          <StatCard 
            title="Missing Work" 
            value={2} 
            icon={AlertCircle} 
            description="Students pending" 
          />
          <StatCard 
            title="Parent Messages" 
            value={1} 
            icon={MessageSquare} 
            description="New message" 
          />
          <StatCard 
            title="Due Tomorrow" 
            value={4} 
            icon={Calendar} 
            description="Closing soon" 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Main Feed: Priority Tasks */}
        <div className="lg:col-span-8 space-y-6">
          <Card id="onboarding-review-queue" className="border-[#E5E7EB] shadow-sm overflow-hidden">
            <CardHeader className="bg-white border-b border-[#F1F2F6] py-3 px-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-[#111827]">Grading Priority</CardTitle>
                  <CardDescription className="text-[10px] text-slate-500">Submissions ready for validation.</CardDescription>
                </div>
                <Badge variant="secondary" className="bg-blue-50 text-[#2F5BEA] border-none font-bold text-[9px]">
                  {reviewQueueData?.items.length || 0} ITEMS
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              {reviewQueueData?.items && reviewQueueData.items.length > 0 ? (
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow className="hover:bg-transparent border-b border-[#F1F2F6]">
                      <TableHead className="font-bold text-[#111827] h-10 text-[10px] uppercase tracking-wider pl-6">Student</TableHead>
                      <TableHead className="font-bold text-[#111827] h-10 text-[10px] uppercase tracking-wider">Assessment</TableHead>
                      <TableHead className="font-bold text-[#111827] h-10 text-[10px] uppercase tracking-wider">Status</TableHead>
                      <TableHead className="hidden md:table-cell text-right font-bold text-[#111827] h-10 text-[10px] uppercase tracking-wider">Last Update</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reviewQueueData.items.map((item) => (
                      <TableRow
                        key={item.assessmentId}
                        onClick={() => openReview({ assessmentId: normalizeAssessmentIdentifier(item.assessmentId) ?? item.assessmentId })}
                        className="group cursor-pointer hover:bg-slate-50/80 transition-colors border-b border-[#F1F2F6] last:border-0"
                      >
                        <TableCell className="font-semibold text-[#111827] py-3 pl-6 text-sm">{item.studentName}</TableCell>
                        <TableCell className="text-slate-600 py-3 text-sm">{item.assessmentName}</TableCell>
                        <TableCell className="py-3">
                          <Badge variant={item.status === 'ai_draft_ready' ? 'default' : 'destructive'} className="rounded-md font-bold uppercase text-[8px] tracking-wider px-1.5 py-0 whitespace-nowrap">
                            {item.status === 'ai_draft_ready' ? 'AI READY' : 'REVIEW'}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-right text-slate-400 py-3 font-medium text-xs">
                          {formatDistanceToNow(new Date(item.updatedAt), { addSuffix: true }).replace('about ', '')}
                        </TableCell>
                        <TableCell className="text-right py-3 pr-4">
                          <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-[#2F5BEA] group-hover:translate-x-0.5 transition-all" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                  <div className="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center mb-3">
                    <Sparkles className="h-5 w-5 text-[#2F5BEA]" />
                  </div>
                  <h3 className="text-sm font-bold text-[#111827]">Queue Cleared</h3>
                  <p className="text-[10px] text-slate-500 max-w-xs mt-1">All current submissions have been processed.</p>
                  <Button size="sm" onClick={() => startNewAssessment()} className="mt-4 bg-[#2F5BEA] font-bold text-xs h-9">
                    <FilePlus className="mr-2 h-3.5 w-3.5" /> New Assessment
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Class Health Snapshot */}
          <Card className="border-[#E5E7EB] shadow-sm overflow-hidden">
            <CardHeader className="bg-white border-b border-[#F1F2F6] py-3 px-6">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-[#2F5BEA]" />
                <CardTitle className="text-base font-bold text-[#111827]">Class Health Snapshot</CardTitle>
              </div>
              <CardDescription className="text-[10px] text-slate-500">Real-time classroom engagement metrics.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-slate-400">
                    <GraduationCap className="h-3 w-3" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Avg Grade</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-[#111827]">78%</span>
                    <span className="text-[9px] font-bold text-green-600">+2%</span>
                  </div>
                  <Progress value={78} className="h-1" />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-slate-400">
                    <CheckCircle2 className="h-3 w-3" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Completion</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-[#111827]">84%</span>
                    <span className="text-[9px] font-bold text-slate-400">Tgt: 90%</span>
                  </div>
                  <Progress value={84} className="h-1" />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-slate-400">
                    <AlertTriangle className="h-3 w-3 text-amber-500" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">At Risk</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-destructive">4</span>
                    <span className="text-[9px] font-bold text-slate-400">Students</span>
                  </div>
                  <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div className="bg-destructive h-full" style={{ width: '15%' }} />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wide">
                  Grade Distribution
                </h4>
                <div className="h-[160px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={gradeDistData}>
                      <XAxis 
                        dataKey="range" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#94a3b8', fontSize: 9, fontWeight: 600}} 
                      />
                      <Tooltip 
                        cursor={{fill: 'transparent'}}
                        contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', fontSize: '10px'}}
                      />
                      <Bar 
                        dataKey="count" 
                        radius={[2, 2, 0, 0]}
                        barSize={28}
                      >
                        {gradeDistData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Side Actions & Drafts */}
        <div className="lg:col-span-4 space-y-6">
          <Card id="onboarding-quick-actions" className="bg-[#2F5BEA] text-white border-none shadow-lg shadow-blue-500/20 overflow-hidden relative">
            <div className="absolute top-[-20px] right-[-20px] h-32 w-32 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <CardHeader className="py-4">
              <CardTitle className="text-base font-bold">Quick Actions</CardTitle>
              <CardDescription className="text-blue-100 text-[10px]">Common tasks.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2 relative z-10">
              <Button size="sm" onClick={() => startNewAssessment()} className="w-full bg-white text-[#2F5BEA] hover:bg-blue-50 h-9 font-bold rounded-lg transition-all border-none text-[10px]">
                <FilePlus className="mr-2 h-3.5 w-3.5" /> New Assessment
              </Button>
              <Button asChild size="sm" variant="outline" className="w-full bg-transparent border-white/20 text-white hover:bg-white/10 h-9 font-bold rounded-lg text-[10px]">
                <Link href="/teacher/assessments"><PenSquare className="mr-2 h-3.5 w-3.5" /> All Assignments</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-[#E5E7EB] shadow-sm">
            <CardHeader className="pb-3 pt-4 px-6">
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                <CardTitle className="text-sm font-bold">Recent Drafts</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 px-4 pb-4">
              {draftsData?.items && draftsData.items.length > 0 ? (
                draftsData.items.map((draft) => (
                  <div key={draft.assessmentId} className="flex items-center justify-between group p-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-slate-100">
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-[#111827] truncate">{draft.assessmentName}</p>
                      <p className="text-[9px] text-slate-500 mt-0.5">{draft.studentName}</p>
                    </div>
                    <ChevronRight className="h-3 w-3 text-slate-300 group-hover:text-[#2F5BEA] transition-colors shrink-0" />
                  </div>
                ))
              ) : (
                <p className="text-[10px] text-slate-400 text-center py-4">No active drafts.</p>
              )}
              <Button variant="ghost" className="w-full text-[#2F5BEA] font-bold hover:bg-blue-50 text-[9px] mt-1 h-8" asChild>
                <Link href="/teacher/assessments?status=draft">View All Drafts</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
