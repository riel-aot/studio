'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

import { StatCard, StatCardSkeleton } from '@/components/stat-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useWebhook } from '@/lib/hooks';
import { useAuth } from '@/hooks/use-auth';
import type { DashboardKpis, ReviewQueueItem, ReportListItem, ActivityItem } from '@/lib/events';
import { normalizeAssessmentIdentifier } from '@/lib/utils';
import { activityTracker } from '@/lib/activity-tracker';
import { FilePlus, PenSquare, AlertCircle, ChevronRight, Activity, GraduationCap, CheckCircle2, TrendingUp, TrendingDown, Minus, Sparkles, MessageSquare, Lightbulb, Loader2, UserPlus, FileCheck2, FileEdit } from 'lucide-react';
import { OnboardingTour } from '@/components/onboarding-tour';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, LabelList, Area, AreaChart, CartesianGrid, Rectangle } from 'recharts';
import { Progress } from '@/components/ui/progress';
import Image from 'next/image';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const COLORS = {
  red: '#F87171',
  orange: '#FB923C',
  green: '#34D399',
};

const formatProficiencyLevel = (score: number): string => {
  const rounded = Math.max(1, Math.min(8, Math.round(Number(score))));
  switch (rounded) {
    case 1: return 'A';
    case 2: return 'B';
    case 3: return '1';
    case 4: return '2';
    case 5: return '3';
    case 6: return '4';
    case 7: return '5';
    case 8: return '6';
    default: return '3';
  }
};

const getLevelGradientId = (levelStr: string) => {
  if (['A', 'B', '1', '2'].includes(levelStr)) return 'url(#barRedLight)';
  if (['3', '4'].includes(levelStr)) return 'url(#barOrangeLight)';
  return 'url(#barGreenLight)';
};

// Custom shape to add breathing animation
const BreathingBar = (props: any) => {
  const { fill, x, y, width, height } = props;
  
  return (
    <motion.g
      initial={{ scaleY: 0, opacity: 0 }}
      animate={{ 
        scaleY: 1, 
        opacity: 1,
      }}
      transition={{ 
        type: 'spring', 
        stiffness: 100, 
        damping: 20,
        delay: props.index * 0.1 
      }}
      style={{ transformOrigin: 'bottom' }}
    >
      <motion.rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fill}
        rx={10}
        ry={10}
        animate={{
          opacity: [0.85, 1, 0.85],
          scaleY: [1, 1.015, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: props.index * 0.5
        }}
        style={{ transformOrigin: `${x + width / 2}px ${y + height}px` }}
      />
    </motion.g>
  );
};

type ClassPerformanceView = {
  avgScore: number;
  completionRate: number;
  masteryAchieved: number;
  criteriaBreakdown: Array<{
    criterion: string;
    averageScore: number;
    maxScore: number;
    trend: 'up' | 'down' | 'stable';
    count: number;
  }>;
};

type FinalizedReport = {
  rubric_grades?: Array<{
    score: number;
    maxScore: number;
    criterionName: string;
  }>;
  rubricGrades?: Array<{
    score: number;
    maxScore: number;
    criterionName: string;
  }>;
  rubricSnapshot?: Array<{
    criterion: string;
    averageScore: number;
    trend: 'up' | 'down' | 'stable';
  }>;
};

function DashboardLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-48 w-full rounded-2xl bg-white dark:bg-[#111827] animate-pulse" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
  const [view, setView] = useState<'performance' | 'progress'>('performance');
  const [localActivity, setLocalActivity] = useState<any[]>([]);

  const { data: kpiData, isLoading: kpiLoading, error: kpiError, trigger: refetchKpis } = useWebhook<{ }, { kpis: DashboardKpis }>({
    eventName: 'GET_DASHBOARD_SUMMARY',
  });
  
  const { data: reviewQueueData, isLoading: reviewQueueLoading, error: reviewQueueError, trigger: refetchReviewQueue } = useWebhook<{ limit: number }, { items: ReviewQueueItem[] }>({
    eventName: 'GET_REVIEW_QUEUE',
    payload: { limit: 5 },
  });

  // Sync with Activity Engine
  useEffect(() => {
    setLocalActivity(activityTracker.get());
    
    const handleActivityUpdate = () => {
      setLocalActivity(activityTracker.get());
    };
    
    window.addEventListener('athena_activity_updated', handleActivityUpdate);
    return () => window.removeEventListener('athena_activity_updated', handleActivityUpdate);
  }, []);

  const { data: reportsListData, isLoading: reportsListLoading } = useWebhook<{}, any>({
    eventName: 'REPORTS_LIST',
    payload: {},
    suppressErrorToast: true,
  });

  const { trigger: fetchReportDetails } = useWebhook<{ reportId?: string; student_name?: string; assignment_title?: string }, FinalizedReport | FinalizedReport[] | { report: FinalizedReport }>({
    eventName: 'REPORT_GET',
    manual: true,
    suppressErrorToast: true,
  });

  const fetchReportDetailsRef = useRef(fetchReportDetails);
  useEffect(() => { fetchReportDetailsRef.current = fetchReportDetails; });

  const [classPerformance, setClassPerformance] = useState<ClassPerformanceView | null>(null);
  const [classPerformanceLoading, setClassPerformanceLoading] = useState(false);

  const reports = useMemo(() => {
    if (!reportsListData) return [];
    if (Array.isArray(reportsListData)) return reportsListData as unknown as ReportListItem[];
    return (reportsListData.reports ?? reportsListData.items ?? []) as ReportListItem[];
  }, [reportsListData]);

  useEffect(() => {
    let isMounted = true;

    const calculateClassPerformance = async () => {
      if (reports.length === 0) {
        if (isMounted) setClassPerformance(null);
        return;
      }

      const completedReports = reports.filter((report) => {
        const status = String((report as any).status ?? '').toLowerCase();
        return ['generated', 'sent', 'finalized', 'complete', 'completed'].includes(status) || !status;
      });
      
      const completionRate = completedReports.length;

      let gradedReports: Array<{ report: ReportListItem; grades: any[] }> = completedReports
        .map((report) => ({
          report,
          grades: (report as any).rubric_grades ?? (report as any).rubricGrades ?? [],
        }))
        .filter(r => r.grades.length > 0);

      if (gradedReports.length === 0) {
        setClassPerformanceLoading(true);
        try {
          const reportRequests = completedReports
            .map((report) => {
              const reportId = (report as any).reportId ?? (report as any).report_id ?? (report as any).id;
              if (!reportId) return null;
              return { report, payload: { reportId: reportId as string } };
            })
            .filter((item): item is NonNullable<typeof item> => item !== null);

          if (reportRequests.length > 0) {
            const reportResponses = await Promise.all(
              reportRequests.map((request) => fetchReportDetailsRef.current(request!.payload))
            );
            if (!isMounted) return;

            gradedReports = reportResponses.flatMap((response, index) => {
              const normalizedReport = Array.isArray(response) ? response[0] : (response as any)?.data?.report ?? (response as any)?.report ?? response;
              const rubricGrades = normalizedReport?.rubric_grades ?? normalizedReport?.rubricGrades;
              if (Array.isArray(rubricGrades) && rubricGrades.length > 0) {
                return [{ report: reportRequests[index]!.report, grades: rubricGrades }];
              }
              return [];
            });
          }
        } catch {
          // fallback
        } finally {
          if (isMounted) setClassPerformanceLoading(false);
        }
      }

      if (!isMounted) return;

      const baseCriteria = ['Listening', 'Speaking', 'Reading', 'Writing'];
      const criteriaMap = new Map<string, { scoreSum: number; count: number; values: number[]; maxScore: number }>();
      
      baseCriteria.forEach(c => criteriaMap.set(c, { scoreSum: 0, count: 0, values: [], maxScore: 8 }));

      for (const gradedReport of gradedReports) {
        for (const grade of gradedReport.grades) {
          const criterionName = grade?.criterionName ?? grade?.criterion_name;
          const rawScore = Number(grade?.score);
          if (!criterionName || Number.isNaN(rawScore)) continue;
          
          const existing = criteriaMap.get(criterionName) ?? { scoreSum: 0, count: 0, values: [], maxScore: 8 };
          existing.scoreSum += rawScore;
          existing.count += 1;
          existing.values.push(rawScore);
          criteriaMap.set(criterionName, existing);
        }
      }

      const criteriaBreakdown = Array.from(criteriaMap.entries())
        .filter(([c]) => baseCriteria.includes(c))
        .map(([criterion, stats]) => {
          const averageScore = stats.count > 0 ? Number((stats.scoreSum / stats.count).toFixed(2)) : 5.0; 
          const delta = stats.values.length > 1 ? stats.values[stats.values.length - 1] - stats.values[0] : 0;
          const trend = delta > 0.15 ? 'up' : delta < -0.15 ? 'down' : 'stable';
          return { criterion, averageScore, maxScore: 8, trend, count: stats.count } as const;
        });

      const avgScore = criteriaBreakdown.length > 0
        ? Number((criteriaBreakdown.reduce((sum, item) => sum + item.averageScore, 0) / criteriaBreakdown.length).toFixed(1))
        : 0;
      const masteryAchieved = criteriaBreakdown.filter((item) => item.averageScore >= 7).length;

      if (isMounted) setClassPerformance({ avgScore, completionRate, masteryAchieved, criteriaBreakdown });
    };

    calculateClassPerformance();
    return () => { isMounted = false; };
  }, [reports]);

  const handleReviewOpen = useCallback((_: any, payload?: { assessmentId: string }) => {
    const normalized = normalizeAssessmentIdentifier(payload?.assessmentId) ?? payload?.assessmentId;
    if (normalized) router.push(`/teacher/assessments/${normalized}`);
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

  const isLoading = kpiLoading || reviewQueueLoading || reportsListLoading;
  const hasError = kpiError || reviewQueueError;

  const handleRetry = () => {
    if (kpiError) refetchKpis();
    if (reviewQueueError) refetchReviewQueue();
  };

  const insightData = useMemo(() => {
    if (!classPerformance?.criteriaBreakdown.length) return null;
    const sorted = [...classPerformance.criteriaBreakdown].sort((a, b) => b.averageScore - a.averageScore);
    const strongest = sorted[0];
    const weakestOnes = classPerformance.criteriaBreakdown
      .filter(item => item.criterion !== strongest.criterion)
      .map(item => item.criterion);
    
    const weakestLabel = weakestOnes.length > 1 
      ? `${weakestOnes.slice(0, -1).join(', ')} and ${weakestOnes[weakestOnes.length - 1]}`
      : weakestOnes[0] || 'other skills';

    return {
      strongest: strongest.criterion,
      strongestLevel: formatProficiencyLevel(strongest.averageScore),
      weakestLabel,
      suggestion: `Focus next assessments on ${weakestOnes.slice(0, 2).join(' and ')} tasks to bridge the proficiency gap.`
    };
  }, [classPerformance]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'student_added': return UserPlus;
      case 'report_generated': return FileCheck2;
      case 'assessment_finalized': return GraduationCap;
      case 'draft_updated': return FileEdit;
      case 'assessment_created': return FilePlus;
      default: return Activity;
    }
  };

  const handleActivityClick = (activity: any) => {
    switch (activity.type) {
      case 'report_generated':
      case 'assessment_finalized':
        router.push('/teacher/reports');
        break;
      case 'student_added':
        router.push('/teacher/students');
        break;
      case 'assessment_created':
      case 'draft_updated':
        router.push('/teacher/assessments');
        break;
      default:
        break;
    }
  };

  if (isLoading) return <DashboardLoadingSkeleton />;
  if (hasError) return <ErrorState onRetry={handleRetry} />;

  return (
    <div className="space-y-6 pb-12">
      <OnboardingTour />
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#111827] to-[#1F2937] text-white p-8 md:p-10 shadow-xl border border-white/5">
        <div className="max-w-lg space-y-4 relative z-10">
          <Badge className="bg-primary text-white border-none px-3 py-0.5 rounded-full font-bold text-[9px] tracking-[0.2em] mb-1 uppercase">Teacher Dashboard</Badge>
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
            Welcome back, {user?.name.split(' ')[0] || 'Teacher'}
          </h1>
          <p className="text-slate-300 text-sm md:text-base font-medium leading-relaxed max-w-sm">
            You have <span className="text-primary font-bold">{kpiData?.kpis.pendingReview ?? 3} submissions</span> awaiting your feedback.
          </p>
        </div>

        <div className="absolute right-4 bottom-0 h-48 w-72 pointer-events-none opacity-90 dark:opacity-80">
          <Image 
            src="/images/athena-classroom.png" 
            alt="Classroom illustration"
            fill
            className="object-contain scale-[1.8] origin-bottom-right translate-x-[20px] translate-y-[40px]"
            priority
            data-ai-hint="classroom illustration"
          />
        </div>
      </div>

      {/* Quick Actions & KPIs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-6">
          <div id="onboarding-kpis" className="grid gap-4 sm:grid-cols-2">
            <StatCard 
              title="Grading Queue" 
              value={kpiData?.kpis.pendingReview ?? 0} 
              icon={PenSquare} 
              variant="amber"
              description="Ready for validation"
              onClick={() => router.push('/teacher/assessments?status=needs_review')}
            />
            <StatCard 
              title="Active Drafts" 
              value={kpiData?.kpis.drafts ?? 0} 
              icon={FilePlus} 
              variant="primary"
              description="Unfinished evaluations"
              onClick={() => router.push('/teacher/assessments?status=draft')}
            />
          </div>

          <Card id="onboarding-review-queue" className="border-border bg-white dark:bg-[#111827] shadow-lg overflow-hidden rounded-3xl">
            <CardHeader className="bg-white dark:bg-[#111827] border-b border-border py-4 px-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-foreground">Grading Priority</CardTitle>
                  <CardDescription className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider font-bold">Recent Submissions</CardDescription>
                </div>
                <Badge variant="secondary" className="bg-secondary text-primary border-none font-bold text-[9px] px-3 py-1 rounded-full">
                  {reviewQueueData?.items.length || 0} ITEMS
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {reviewQueueData?.items && reviewQueueData.items.length > 0 ? (
                <Table>
                  <TableHeader className="bg-secondary/10">
                    <TableRow className="hover:bg-transparent border-b border-border">
                      <TableHead className="font-bold text-foreground h-10 text-[9px] uppercase tracking-widest pl-6">Student</TableHead>
                      <TableHead className="font-bold text-foreground h-10 text-[9px] uppercase tracking-widest">Assignment</TableHead>
                      <TableHead className="font-bold text-foreground h-10 text-[9px] uppercase tracking-widest text-right pr-6">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reviewQueueData.items.map((item) => (
                      <TableRow
                        key={item.assessmentId}
                        onClick={() => openReview({ assessmentId: normalizeAssessmentIdentifier(item.assessmentId) ?? item.assessmentId })}
                        className="group cursor-pointer hover:bg-secondary/10 transition-colors border-b border-border last:border-0"
                      >
                        <TableCell className="font-bold text-foreground py-4 pl-6 text-sm">{item.studentName || 'Student'}</TableCell>
                        <TableCell className="text-muted-foreground py-4 text-sm">{item.assessmentName}</TableCell>
                        <TableCell className="py-4 text-right pr-6">
                          <Badge variant={item.status === 'ai_draft_ready' ? 'default' : 'warning'} className="rounded-full px-2 text-[9px]">
                            {item.status === 'ai_draft_ready' ? 'AI DRAFT' : 'NEEDS REVIEW'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                  <div className="h-12 w-12 bg-secondary rounded-full flex items-center justify-center mb-4">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-base font-bold text-foreground">All Caught Up</h3>
                  <p className="text-xs text-muted-foreground max-w-xs mt-1 leading-relaxed">Your grading queue is currently empty.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card id="onboarding-quick-actions" className="bg-primary text-white border-none shadow-lg overflow-hidden relative rounded-2xl">
            <div className="absolute top-[-10px] right-[-10px] h-24 w-24 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <CardHeader className="p-5 pb-3 relative z-10">
              <CardTitle className="text-base font-bold">Quick Actions</CardTitle>
              <CardDescription className="text-white/70 text-[9px] uppercase tracking-wider font-bold">Classroom Tasks</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2 relative z-10 px-5 pb-5">
              <Button size="sm" onClick={() => startNewAssessment()} className="w-full bg-white text-primary hover:bg-slate-50 h-10 font-bold rounded-xl transition-all border-none shadow-sm">
                <FilePlus className="mr-2 h-4 w-4 stroke-[2.5]" /> New Assignment
              </Button>
              <Button asChild size="sm" variant="outline" className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 h-10 font-bold rounded-xl transition-all">
                <Link href="/teacher/assessments"><PenSquare className="mr-2 h-4 w-4 stroke-[2.5]" /> History</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border bg-white dark:bg-[#111827] shadow-lg overflow-hidden rounded-2xl">
            <CardHeader className="py-4 px-6">
              <CardTitle className="text-base font-bold">Activity Feed</CardTitle>
              <CardDescription className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold">Live Updates</CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="space-y-4 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
                {localActivity.length > 0 ? (
                  localActivity.map((activity) => {
                    const Icon = getActivityIcon(activity.type);
                    return (
                      <div 
                        key={activity.id} 
                        className="flex gap-3 group cursor-pointer" 
                        onClick={() => handleActivityClick(activity)}
                      >
                        <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <p className="text-[11px] font-bold text-foreground truncate">{activity.title}</p>
                          <p className="text-[9px] text-muted-foreground leading-tight truncate">
                            {activity.subtitle} &middot; {activity.updatedAt ? format(new Date(activity.updatedAt), 'h:mm a') : 'N/A'}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-[10px] text-muted-foreground italic text-center py-2">No recent activity.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Class Performance Visualization */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Class Performance</h2>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Aggregated Skill Mastery</p>
            </div>
          </div>
          
          <Tabs value={view} onValueChange={(v) => setView(v as any)} className="bg-secondary/20 p-1 rounded-lg border border-border">
            <TabsList className="bg-transparent h-8 gap-1">
              <TabsTrigger value="performance" className="rounded-md font-bold text-[10px] uppercase tracking-wider h-6 px-3 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                Skill Mastery
              </TabsTrigger>
              <TabsTrigger value="progress" className="rounded-md font-bold text-[10px] uppercase tracking-wider h-6 px-3 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                Progress Flow
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <Card className="lg:col-span-8 border-border bg-white dark:bg-[#111827] shadow-lg overflow-hidden rounded-3xl self-start">
            <CardHeader className="bg-white dark:bg-[#111827] border-b border-border py-4 px-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-foreground">
                    {view === 'performance' ? 'Core Skill Proficiency' : 'Progress Over Time'}
                  </CardTitle>
                  <CardDescription className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider font-bold">
                    {view === 'performance' ? 'Current Skill Breakdown' : 'Academic Trajectory'}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#EF4444]" />
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">1-2</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#F59E0B]" />
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">3-4</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">5-6</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {classPerformanceLoading ? (
                <div className="h-[220px] flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary opacity-20" />
                </div>
              ) : classPerformance?.criteriaBreakdown.length ? (
                <div className="h-[220px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    {view === 'performance' ? (
                      <BarChart data={classPerformance.criteriaBreakdown} margin={{ top: 25, bottom: 5 }}>
                        <defs>
                          <linearGradient id="barRedLight" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#FEF2F2" stopOpacity={1}/>
                            <stop offset="100%" stopColor="#F87171" stopOpacity={1}/>
                          </linearGradient>
                          <linearGradient id="barOrangeLight" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#FFF7ED" stopOpacity={1}/>
                            <stop offset="100%" stopColor="#FB923C" stopOpacity={1}/>
                          </linearGradient>
                          <linearGradient id="barGreenLight" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#F0FDF4" stopOpacity={1}/>
                            <stop offset="100%" stopColor="#34D399" stopOpacity={1}/>
                          </linearGradient>
                        </defs>
                        <XAxis 
                          dataKey="criterion" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                          dy={5}
                        />
                        <YAxis domain={[0, 8]} hide />
                        <Tooltip 
                          cursor={{ fill: 'hsl(var(--secondary) / 0.2)', radius: 8 }}
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              const level = formatProficiencyLevel(data.averageScore);
                              return (
                                <div className="bg-white dark:bg-[#111827] p-3 rounded-2xl shadow-2xl border border-border ring-1 ring-black/5">
                                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">{data.criterion}</p>
                                  <div className="space-y-0.5">
                                    <p className="text-base font-extrabold text-foreground flex items-baseline gap-1">
                                      Level {level}
                                      <span className="text-[10px] font-bold text-muted-foreground font-mono">({data.averageScore.toFixed(1)})</span>
                                    </p>
                                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">From {data.count} assessments</p>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar 
                          dataKey="averageScore" 
                          barSize={45}
                          shape={<BreathingBar />}
                        >
                          {classPerformance.criteriaBreakdown.map((entry, index) => {
                            const levelStr = formatProficiencyLevel(entry.averageScore);
                            return <Cell key={`cell-${index}`} fill={getLevelGradientId(levelStr)} />;
                          })}
                          <LabelList 
                            dataKey="averageScore" 
                            position="top" 
                            formatter={(v: number) => formatProficiencyLevel(v)}
                            style={{ fill: '#64748b', fontSize: 11, fontWeight: 800 }}
                            offset={12}
                          />
                        </Bar>
                      </BarChart>
                    ) : (
                      <AreaChart data={classPerformance.criteriaBreakdown} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
                        <XAxis 
                          dataKey="criterion" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 700 }}
                        />
                        <YAxis 
                          domain={[0, 8]}
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#cbd5e1', fontSize: 9 }}
                          tickFormatter={(v) => formatProficiencyLevel(v)}
                        />
                        <Tooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-white dark:bg-[#111827] p-2 rounded-xl border border-border shadow-lg">
                                  <p className="text-[9px] font-bold text-primary uppercase">{payload[0].payload.criterion}</p>
                                  <p className="text-xs font-bold text-foreground">Level {formatProficiencyLevel(payload[0].value as number)}</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="averageScore" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={3}
                          fillOpacity={1} 
                          fill="url(#colorProgress)" 
                          animationDuration={1500}
                        />
                      </AreaChart>
                    )}
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[220px] flex flex-col items-center justify-center text-center px-6">
                  <div className="h-12 w-12 bg-secondary/50 rounded-xl flex items-center justify-center mb-4">
                    <Activity className="h-6 w-6 text-muted-foreground opacity-30" />
                  </div>
                  <h3 className="text-base font-bold text-foreground">Insufficient Data</h3>
                  <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">Finalize more student assessments to unlock class-wide insights.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="lg:col-span-4 space-y-6">
            <Card className="border-none bg-secondary/20 dark:bg-primary/5 shadow-none overflow-hidden rounded-3xl">
              <CardHeader className="pb-2 px-8 pt-8">
                <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                  <Lightbulb className="h-4 w-4 text-primary" />
                </div>
                <CardTitle className="text-lg font-bold">Class Insight</CardTitle>
                <CardDescription className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">Automated Analysis</CardDescription>
              </CardHeader>
              <CardContent className="px-8 pb-8 space-y-6">
                {insightData ? (
                  <>
                    <div className="space-y-3">
                      <p className="text-xs leading-relaxed text-foreground font-medium">
                        Strongest performance in <span className="text-primary font-bold">{insightData.strongest} (Level {insightData.strongestLevel})</span>.
                      </p>
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        {insightData.weakestLabel} are priority growth areas.
                      </p>
                    </div>

                    <div className="pt-4 border-t border-border/50">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                        <p className="text-[9px] font-bold text-primary uppercase tracking-widest">Strategy</p>
                      </div>
                      <p className="text-xs italic text-muted-foreground leading-relaxed">
                        &ldquo;{insightData.suggestion}&rdquo;
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="py-6 text-center">
                    <p className="text-[10px] text-muted-foreground italic">Generating insights...</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border bg-white dark:bg-[#111827] shadow-lg overflow-hidden rounded-3xl">
              <CardHeader className="bg-white dark:bg-[#111827] border-b border-border py-4 px-6">
                <CardTitle className="text-base font-bold text-foreground">Class Progress</CardTitle>
                <CardDescription className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">Recent Scores</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Avg. Proficiency</p>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-extrabold text-foreground">{classPerformance?.avgScore.toFixed(1) || '—'}</span>
                      <span className="text-[10px] font-bold text-muted-foreground">/ 8</span>
                    </div>
                  </div>
                  <div className="h-10 w-10 rounded-full border-2 border-secondary border-t-primary flex items-center justify-center">
                    <span className="text-[10px] font-bold text-primary">{Math.round(((classPerformance?.avgScore || 0) / 8) * 100)}%</span>
                  </div>
                </div>
                <Progress value={((classPerformance?.avgScore || 0) / 8) * 100} className="h-2 bg-secondary rounded-full" />
                <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mt-5 mb-3">Recent Reports</p>
                <div className="space-y-2">
                  {reports.slice(0, 2).map((report, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-secondary/10 hover:bg-secondary/20 transition-colors cursor-pointer" onClick={() => router.push(`/teacher/reports/${report.reportId}`)}>
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-md bg-white dark:bg-slate-800 flex items-center justify-center text-[9px] font-bold shadow-sm">
                          {(report.studentName || 'S').charAt(0)}
                        </div>
                        <span className="text-[11px] font-bold truncate max-w-[100px]">{report.studentName || 'Student'}</span>
                      </div>
                      <Badge variant="outline" className="text-[8px] font-bold border-border px-1.5 h-4">{(report.status || 'Generated').toUpperCase()}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
