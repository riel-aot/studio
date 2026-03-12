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
import { FilePlus, PenSquare, AlertCircle, ChevronRight, Activity, GraduationCap, CheckCircle2, AlertTriangle, Calendar, Sparkles, FileText, History } from 'lucide-react';
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
    <div className="space-y-10">
      <div className="h-64 w-full rounded-2xl bg-white dark:bg-[#111827] animate-pulse" />
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
    <div className="space-y-10">
      <OnboardingTour />
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#3B6EF5] to-[#2F5BEA] dark:from-[#1D4ED8] dark:to-[#1E3A8A] text-white p-10 md:p-14 shadow-lg min-h-[260px] flex items-center border border-white/10">
        <div className="max-w-lg space-y-5 relative z-10">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Welcome back, {user?.name || 'Teacher'}
          </h1>
          <p className="text-blue-50 dark:text-blue-200 text-sm md:text-lg font-medium leading-relaxed max-w-sm">
            You have {kpiData?.kpis.pendingReview ?? 3} assignments pending review. Check your queue to provide feedback.
          </p>
        </div>

        <div className="absolute right-4 bottom-0 h-56 w-80 pointer-events-none opacity-90 dark:opacity-80">
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
      <div id="onboarding-kpis" className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 rounded-full bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-[#2F5BEA] dark:text-[#3B82F6]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#111827] dark:text-[#E5E7EB]">Today&apos;s Teacher Brief</h2>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">Priority Action Items</p>
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            title="Needs Grading" 
            value={kpiData?.kpis.pendingReview ?? 0} 
            icon={PenSquare} 
            variant="amber"
            description="Submissions awaiting review"
            onClick={() => router.push('/teacher/assessments?status=needs_review')}
          />
          <StatCard 
            title="Active Drafts" 
            value={kpiData?.kpis.drafts ?? 0} 
            icon={FileText} 
            variant="blue"
            description="Assessments in progress"
            onClick={() => router.push('/teacher/assessments?status=draft')}
          />
          <StatCard 
            title="Student Activity" 
            value={reviewQueueData?.items.length ?? 0} 
            icon={History} 
            variant="purple"
            description="Recent submissions or updates"
            onClick={() => router.push('/teacher/students')}
          />
          <StatCard 
            title="Due Tomorrow" 
            value={4} 
            icon={Calendar} 
            variant="red"
            description="Upcoming deadlines"
            onClick={() => router.push('/teacher/assessments')}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        {/* Main Feed: Priority Tasks */}
        <div className="lg:col-span-8 space-y-10">
          <Card id="onboarding-review-queue" className="border-[#E5E7EB] dark:border-[#1F2937] bg-white dark:bg-[#111827] shadow-sm overflow-hidden rounded-2xl">
            <CardHeader className="bg-white dark:bg-[#111827] border-b border-slate-50 dark:border-[#1F2937] py-5 px-8">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-[#111827] dark:text-[#E5E7EB]">Grading Priority</CardTitle>
                  <CardDescription className="text-xs text-slate-500 dark:text-slate-500">Student submissions ready for teacher validation.</CardDescription>
                </div>
                <Badge variant="secondary" className="bg-blue-50 dark:bg-blue-500/10 text-[#2F5BEA] dark:text-[#3B82F6] border-none font-bold text-[10px] px-3">
                  {reviewQueueData?.items.length || 0} SUBMISSIONS
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              {reviewQueueData?.items && reviewQueueData.items.length > 0 ? (
                <Table>
                  <TableHeader className="bg-slate-50/30 dark:bg-[#1F2937]/30">
                    <TableRow className="hover:bg-transparent border-b border-slate-50 dark:border-[#1F2937]">
                      <TableHead className="font-bold text-[#111827] dark:text-slate-400 h-12 text-[10px] uppercase tracking-wider pl-8">Student</TableHead>
                      <TableHead className="font-bold text-[#111827] dark:text-slate-400 h-12 text-[10px] uppercase tracking-wider">Assessment</TableHead>
                      <TableHead className="font-bold text-[#111827] dark:text-slate-400 h-12 text-[10px] uppercase tracking-wider">Status</TableHead>
                      <TableHead className="hidden md:table-cell text-right font-bold text-[#111827] dark:text-slate-400 h-12 text-[10px] uppercase tracking-wider">Activity</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reviewQueueData.items.map((item) => (
                      <TableRow
                        key={item.assessmentId}
                        onClick={() => openReview({ assessmentId: normalizeAssessmentIdentifier(item.assessmentId) ?? item.assessmentId })}
                        className="group cursor-pointer hover:bg-blue-50/30 dark:hover:bg-slate-800/20 transition-colors border-b border-slate-50 dark:border-[#1F2937] last:border-0"
                      >
                        <TableCell className="font-bold text-[#111827] dark:text-[#E5E7EB] py-5 pl-8 text-sm">{item.studentName}</TableCell>
                        <TableCell className="text-slate-500 dark:text-slate-400 py-5 text-sm">{item.assessmentName}</TableCell>
                        <TableCell className="py-5">
                          <Badge variant={item.status === 'ai_draft_ready' ? 'default' : 'warning'}>
                            {item.status === 'ai_draft_ready' ? 'AI DRAFT' : 'NEEDS REVIEW'}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-right text-slate-400 dark:text-slate-500 py-5 font-medium text-xs">
                          {formatDistanceToNow(new Date(item.updatedAt), { addSuffix: true }).replace('about ', '')}
                        </TableCell>
                        <TableCell className="text-right py-5 pr-6">
                          <ChevronRight className="h-4 w-4 text-slate-300 dark:text-slate-700 group-hover:text-[#2F5BEA] dark:group-hover:text-[#3B82F6] group-hover:translate-x-1 transition-all" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center px-8">
                  <div className="h-12 w-12 bg-blue-50 dark:bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
                    <Sparkles className="h-6 w-6 text-[#2F5BEA] dark:text-[#3B82F6]" />
                  </div>
                  <h3 className="text-base font-bold text-[#111827] dark:text-[#E5E7EB]">All Caught Up</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-500 max-w-xs mt-2 leading-relaxed">There are no submissions waiting for review. You can start a new assessment or check your activity.</p>
                  <Button size="sm" onClick={() => startNewAssessment()} className="mt-6 bg-[#2F5BEA] dark:bg-[#3B82F6] font-bold text-xs h-10 px-6 rounded-xl">
                    <FilePlus className="mr-2 h-4 w-4" /> New Assessment
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Class Performance */}
          <Card className="border-[#E5E7EB] dark:border-[#1F2937] bg-white dark:bg-[#111827] shadow-sm overflow-hidden rounded-2xl">
            <CardHeader className="bg-white dark:bg-[#111827] border-b border-slate-50 dark:border-[#1F2937] py-5 px-8">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-[#2F5BEA] dark:text-[#3B82F6]" />
                <CardTitle className="text-lg font-bold text-[#111827] dark:text-[#E5E7EB]">Class Performance</CardTitle>
              </div>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-500">Aggregated student progress metrics across all active classes.</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-10">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                    <GraduationCap className="h-4 w-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Avg. Grade</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-[#111827] dark:text-[#E5E7EB]">78%</span>
                    <span className="text-[10px] font-bold text-green-600 dark:text-green-500">+2.4%</span>
                  </div>
                  <Progress value={78} className="h-1.5 bg-slate-100 dark:bg-[#1F2937]" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Completion</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-[#111827] dark:text-[#E5E7EB]">84%</span>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">Target: 90%</span>
                  </div>
                  <Progress value={84} className="h-1.5 bg-slate-100 dark:bg-[#1F2937]" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                    <AlertTriangle className="h-4 w-4 text-amber-500 dark:text-amber-600" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Students At Risk</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-destructive dark:text-amber-500">4</span>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">Requires focus</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 dark:bg-[#1F2937] rounded-full overflow-hidden">
                    <div className="bg-destructive dark:bg-amber-600 h-full" style={{ width: '15%' }} />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-slate-900 dark:text-slate-400 flex items-center gap-2 uppercase tracking-widest">
                  Academic Grade Distribution
                </h4>
                <div className="h-[180px] w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={gradeDistData}>
                      <XAxis 
                        dataKey="range" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 600}} 
                      />
                      <Tooltip 
                        cursor={{fill: '#f8fafc'}}
                        contentStyle={{backgroundColor: '#111827', borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '11px', color: '#fff'}}
                        itemStyle={{color: '#E5E7EB'}}
                      />
                      <Bar 
                        dataKey="count" 
                        radius={[4, 4, 0, 0]}
                        barSize={32}
                      >
                        {gradeDistData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} className="dark:opacity-80" />
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
        <div className="lg:col-span-4 space-y-10">
          <Card id="onboarding-quick-actions" className="bg-[#2F5BEA] dark:bg-[#1E293B] text-white border-none shadow-xl shadow-blue-500/10 overflow-hidden relative rounded-2xl">
            <div className="absolute top-[-20px] right-[-20px] h-40 w-40 bg-white/10 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            <CardHeader className="py-6 px-8">
              <CardTitle className="text-lg font-bold">Quick Actions</CardTitle>
              <CardDescription className="text-blue-100 dark:text-slate-400 text-xs">Common administrative tasks.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 relative z-10 px-8 pb-8">
              <Button size="lg" onClick={() => startNewAssessment()} className="w-full bg-white dark:bg-[#3B82F6] text-[#2F5BEA] dark:text-white hover:bg-blue-50 dark:hover:bg-[#2563EB] h-12 font-bold rounded-xl transition-all border-none shadow-md">
                <FilePlus className="mr-2 h-4 w-4 stroke-[2.5]" /> New Assignment
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full bg-white/10 border-white/20 dark:border-slate-700 text-white hover:bg-white/20 dark:hover:bg-slate-800 h-12 font-bold rounded-xl transition-all">
                <Link href="/teacher/assessments"><PenSquare className="mr-2 h-4 w-4 stroke-[2.5]" /> All Assignments</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-[#E5E7EB] dark:border-[#1F2937] bg-white dark:bg-[#111827] shadow-sm rounded-2xl">
            <CardHeader className="pb-4 pt-6 px-8 border-b border-slate-50 dark:border-[#1F2937]">
              <CardTitle className="text-base font-bold text-[#111827] dark:text-[#E5E7EB]">Drafts In Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 px-6 py-6">
              {draftsData?.items && draftsData.items.length > 0 ? (
                draftsData.items.map((draft) => (
                  <div 
                    key={draft.assessmentId} 
                    onClick={() => router.push(`/teacher/assessments/${normalizeAssessmentIdentifier(draft.assessmentId) ?? draft.assessmentId}`)}
                    className="flex items-start gap-3 group p-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-slate-100 dark:hover:border-slate-800"
                  >
                    <div className="mt-0.5 h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                      <PenSquare className="h-4 w-4 text-slate-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-[#111827] dark:text-[#E5E7EB] truncate leading-tight">{draft.assessmentName}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-500 mt-0.5 line-clamp-1">{draft.studentName}</p>
                      <p className="text-[9px] text-slate-400 dark:text-slate-600 mt-1 font-bold uppercase tracking-wider">
                        {formatDistanceToNow(new Date(draft.updatedAt), { addSuffix: true }).replace('about ', '')}
                      </p>
                    </div>
                    <ChevronRight className="h-3 w-3 text-slate-300 dark:text-slate-700 group-hover:text-[#2F5BEA] dark:group-hover:text-[#3B82F6] transition-transform group-hover:translate-x-0.5 shrink-0 self-center" />
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-[10px] text-slate-400 dark:text-slate-600 font-bold uppercase tracking-widest italic">No active drafts</p>
                </div>
              )}
              <Button variant="ghost" className="w-full text-[#2F5BEA] dark:text-[#3B82F6] font-bold hover:bg-blue-50 dark:hover:bg-blue-500/10 text-[10px] uppercase tracking-widest mt-2 h-10 rounded-xl" asChild>
                <Link href="/teacher/assessments">View Full History</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
