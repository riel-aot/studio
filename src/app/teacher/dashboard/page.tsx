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
import { FilePlus, PenSquare, AlertCircle, Users, ChevronRight, Activity, GraduationCap, CheckCircle2, AlertTriangle, MessageSquare, Calendar, Sparkles, Clock } from 'lucide-react';
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
      <div className="h-48 w-full rounded-3xl bg-white animate-pulse" />
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
      <div className="relative overflow-hidden rounded-[2rem] bg-[#2F5BEA] p-1 pt-1">
        <div className="relative overflow-hidden rounded-[1.9rem] bg-[#2F5BEA] px-10 py-12 flex items-center justify-between">
          <div className="relative z-10 max-w-2xl space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
              Welcome back, {user?.name || 'Teacher'}
            </h1>
            <p className="text-blue-100 text-lg font-medium leading-relaxed max-w-lg">
              You have {kpiData?.kpis.pendingReview ?? 3} assignments pending review. Please check your queue to provide feedback to your students.
            </p>
          </div>
          <div className="hidden lg:block relative h-48 w-64 mr-10">
            <Image 
              src="https://picsum.photos/seed/athena-banner/600/400" 
              alt="Classroom illustration"
              fill
              className="object-contain"
              priority
              data-ai-hint="classroom illustration"
            />
          </div>
          {/* Decorative Background Shapes */}
          <div className="absolute top-0 right-0 h-full w-1/2 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 h-1/2 w-1/3 bg-white/5 rounded-full blur-3xl -ml-20 -mb-20" />
        </div>
      </div>

      {/* Today's Teacher Brief */}
      <div id="onboarding-kpis" className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-[#2F5BEA]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#111827]">Today&apos;s Teacher Brief</h2>
            <p className="text-sm text-slate-500 font-medium">Daily action items for your classroom</p>
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            title="Needs Grading" 
            value={kpiData?.kpis.pendingReview ?? 3} 
            icon={PenSquare} 
            description="Assignments awaiting review" 
          />
          <StatCard 
            title="Missing Work" 
            value={2} 
            icon={AlertCircle} 
            description="Students missing homework" 
          />
          <StatCard 
            title="Parent Messages" 
            value={1} 
            icon={MessageSquare} 
            description="New message waiting" 
          />
          <StatCard 
            title="Due Tomorrow" 
            value={4} 
            icon={Calendar} 
            description="Assignments closing soon" 
          />
        </div>
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
            <CardContent className="p-0 overflow-x-auto">
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
                          <Badge variant={item.status === 'ai_draft_ready' ? 'default' : 'destructive'} className="rounded-md font-bold uppercase text-[10px] tracking-wider px-2 py-0.5 whitespace-nowrap">
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

          {/* Class Health Snapshot */}
          <Card className="border-[#E5E7EB] shadow-sm overflow-hidden">
            <CardHeader className="bg-white border-b border-[#F1F2F6] pb-6">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-[#2F5BEA]" />
                <CardTitle className="text-xl font-bold text-[#111827]">Class Health Snapshot</CardTitle>
              </div>
              <CardDescription className="text-slate-500">Real-time aggregate performance and engagement metrics.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-400">
                    <GraduationCap className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Average Grade</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-[#111827]">78%</span>
                    <span className="text-xs font-bold text-green-600">+2% vs last month</span>
                  </div>
                  <Progress value={78} className="h-1.5" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-400">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Completion Rate</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-[#111827]">84%</span>
                    <span className="text-xs font-bold text-slate-400">Target: 90%</span>
                  </div>
                  <Progress value={84} className="h-1.5" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-400">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <span className="text-xs font-bold uppercase tracking-wider">Students at Risk</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-destructive">4</span>
                    <span className="text-xs font-bold text-slate-400">Action recommended</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="bg-destructive h-full" style={{ width: '15%' }} />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  Grade Distribution
                </h4>
                <div className="h-[220px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={gradeDistData}>
                      <XAxis 
                        dataKey="range" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} 
                      />
                      <Tooltip 
                        cursor={{fill: 'transparent'}}
                        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                      />
                      <Bar 
                        dataKey="count" 
                        radius={[4, 4, 0, 0]}
                        barSize={48}
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
                <Link href="/teacher/assessments"><PenSquare className="mr-2 h-5 w-5" /> All Assignments</Link>
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