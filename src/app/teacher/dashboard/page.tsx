'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import type { DashboardKpis, ReviewQueueItem, ReportListItem } from '@/lib/events';
import { normalizeAssessmentIdentifier } from '@/lib/utils';
import { FilePlus, PenSquare, AlertCircle, ChevronRight, Activity, GraduationCap, CheckCircle2, TrendingUp, TrendingDown, Minus, Sparkles } from 'lucide-react';
import { OnboardingTour } from '@/components/onboarding-tour';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { Progress } from '@/components/ui/progress';
import Image from 'next/image';

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

type ClassPerformanceView = {
  avgScore: number;
  completionRate: number;
  masteryAchieved: number;
  criteriaBreakdown: Array<{
    criterion: string;
    averageScore: number;
    maxScore: number;
    trend: 'up' | 'down' | 'stable';
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
        if (!status) return true;
        return ['generated', 'sent', 'finalized', 'complete', 'completed'].includes(status);
      });
      const completionRate = completedReports.length;

      if (completedReports.length === 0) {
        if (isMounted) setClassPerformance({ avgScore: 0, completionRate, masteryAchieved: 0, criteriaBreakdown: [] });
        return;
      }

      const reportsWithGrades = completedReports.filter((report) => {
        const grades = (report as any).rubric_grades ?? (report as any).rubricGrades;
        return Array.isArray(grades) && grades.length > 0;
      });

      let gradedReports: Array<{ report: ReportListItem; grades: any[] }> = reportsWithGrades.map((report) => ({
        report,
        grades: (report as any).rubric_grades ?? (report as any).rubricGrades,
      }));

      if (gradedReports.length === 0) {
        setClassPerformanceLoading(true);
        try {
          const reportRequests = completedReports
            .map((report) => {
              const reportId = (report as any).reportId ?? (report as any).report_id ?? (report as any).id;
              if (!reportId) return null;
              const student_name = (report as any).student_name ?? (report as any).studentName ?? undefined;
              const assignment_title = (report as any).assignment_title ?? (report as any).assignmentTitle ?? (report as any).assessment_title ?? undefined;
              return { report, payload: { reportId: reportId as string, student_name: student_name as string | undefined, assignment_title: assignment_title as string | undefined } };
            })
            .filter((item): item is NonNullable<typeof item> => item !== null);

          if (reportRequests.length > 0) {
            const reportResponses = await Promise.all(
              reportRequests.map((request) => fetchReportDetailsRef.current(request!.payload))
            );
            if (!isMounted) return;

            gradedReports = reportResponses.flatMap((response, index) => {
              const reportPayload = response && 'data' in response ? (response as any).data : null;
              if (!reportPayload) return [];
              const normalizedReport = Array.isArray(reportPayload) ? reportPayload[0] : (reportPayload as any).report ?? reportPayload;
              const rubricGrades = normalizedReport?.rubric_grades ?? normalizedReport?.rubricGrades;
              if (Array.isArray(rubricGrades) && rubricGrades.length > 0) {
                return [{ report: reportRequests[index]!.report, grades: rubricGrades }];
              }
              const rubricSnapshot = normalizedReport?.rubricSnapshot;
              if (Array.isArray(rubricSnapshot) && rubricSnapshot.length > 0) {
                return [{ report: reportRequests[index]!.report, grades: rubricSnapshot.map((e: any) => ({ criterionName: e.criterion, score: e.averageScore, maxScore: 5 })) }];
              }
              return [];
            });
          }
        } catch {
          // fall through
        } finally {
          if (isMounted) setClassPerformanceLoading(false);
        }
      }

      if (!isMounted) return;

      if (gradedReports.length === 0) {
        setClassPerformance({ avgScore: 0, completionRate, masteryAchieved: 0, criteriaBreakdown: [] });
        return;
      }

      const criteriaMap = new Map<string, { scoreSum: number; count: number; values: number[]; maxScore: number }>();
      for (const gradedReport of gradedReports) {
        for (const grade of gradedReport.grades) {
          const criterionName = grade?.criterionName ?? grade?.criterion_name;
          const rawScore = Number(grade?.score);
          const rawMaxScore = Number(grade?.maxScore ?? grade?.max_score);
          if (!criterionName || Number.isNaN(rawScore)) continue;
          const maxScore = rawMaxScore > 0 ? rawMaxScore : 8;
          let normalizedScore = rawScore;
          if (maxScore === 6) {
            normalizedScore = rawScore + 2; 
          }
          const existing = criteriaMap.get(criterionName) ?? { scoreSum: 0, count: 0, values: [], maxScore: 8 };
          existing.scoreSum += normalizedScore;
          existing.count += 1;
          existing.values.push(normalizedScore);
          criteriaMap.set(criterionName, existing);
        }
      }

      const criteriaBreakdown = Array.from(criteriaMap.entries()).map(([criterion, stats]) => {
        const averageScore = Number((stats.scoreSum / stats.count).toFixed(2));
        const delta = stats.values[stats.values.length - 1] - stats.values[0];
        const trend = delta > 0.15 ? 'up' : delta < -0.15 ? 'down' : 'stable';
        return { criterion, averageScore, maxScore: 8, trend } as const;
      });

      const validCriteria = criteriaBreakdown.filter(item => item.averageScore >= 3);
      const avgScore = validCriteria.length > 0
        ? Number((validCriteria.reduce((sum, item) => sum + item.averageScore, 0) / validCriteria.length - 2).toFixed(1))
        : 0;
      const masteryAchieved = criteriaBreakdown.filter((item) => item.averageScore >= 8).length;

      if (isMounted) setClassPerformance({ avgScore, completionRate, masteryAchieved, criteriaBreakdown });
    };

    calculateClassPerformance();

    return () => {
      isMounted = false;
    };
  }, [reports]);

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

  const isLoading = kpiLoading || reviewQueueLoading || reportsListLoading;
  const hasError = kpiError || reviewQueueError;

  const handleRetry = () => {
    if (kpiError) refetchKpis();
    if (reviewQueueError) refetchReviewQueue();
  };

  if (isLoading) return <DashboardLoadingSkeleton />;
  if (hasError) return <ErrorState onRetry={handleRetry} />;

  return (
    <div className="space-y-10">
      <OnboardingTour />
      
      {/* Welcome Banner: Updated to Navy/Mint aesthetic */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#111827] to-[#1F2937] text-white p-10 md:p-14 shadow-lg min-h-[260px] flex items-center border border-white/5">
        <div className="max-w-lg space-y-5 relative z-10">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Welcome back, {user?.name || 'Teacher'}
          </h1>
          <p className="text-primary/90 text-sm md:text-lg font-medium leading-relaxed max-w-sm">
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

        <div className="mt-6 flex justify-end">
          <div className="w-full lg:w-[420px]">
            <Card id="onboarding-quick-actions" className="bg-primary text-white border-none shadow-xl shadow-primary/10 overflow-hidden relative rounded-2xl">
              <div className="absolute top-[-20px] right-[-20px] h-40 w-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />
              <CardHeader className="py-6 px-8">
                <CardTitle className="text-lg font-bold">Quick Actions</CardTitle>
                <CardDescription className="text-white/80 text-xs">Common administrative tasks.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 relative z-10 px-8 pb-8">
                <Button size="lg" onClick={() => startNewAssessment()} className="w-full bg-white text-primary hover:bg-secondary h-12 font-bold rounded-xl transition-all border-none shadow-md">
                  <FilePlus className="mr-2 h-4 w-4 stroke-[2.5]" /> New Assignment
                </Button>
                <Button asChild size="lg" variant="outline" className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 h-12 font-bold rounded-xl transition-all">
                  <Link href="/teacher/assessments"><PenSquare className="mr-2 h-4 w-4 stroke-[2.5]" /> All Assignments</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

      {/* Today's Teacher Brief */}
      <div id="onboarding-kpis" className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Today&apos;s Teacher Brief</h2>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Priority Action Items</p>
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
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10">
        <Card id="onboarding-review-queue" className="border-border bg-white dark:bg-[#111827] shadow-sm overflow-hidden rounded-2xl">
          <CardHeader className="bg-white dark:bg-[#111827] border-b border-border py-5 px-8">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-foreground">Grading Priority</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">Student submissions ready for teacher validation.</CardDescription>
              </div>
              <Badge variant="secondary" className="bg-secondary text-primary border-none font-bold text-[10px] px-3">
                {reviewQueueData?.items.length || 0} SUBMISSIONS
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            {reviewQueueData?.items && reviewQueueData.items.length > 0 ? (
              <Table>
                <TableHeader className="bg-secondary/30">
                  <TableRow className="hover:bg-transparent border-b border-border">
                    <TableHead className="font-bold text-foreground h-12 text-[10px] uppercase tracking-wider pl-8">Student</TableHead>
                    <TableHead className="font-bold text-foreground h-12 text-[10px] uppercase tracking-wider">Assessment</TableHead>
                    <TableHead className="font-bold text-foreground h-12 text-[10px] uppercase tracking-wider">Status</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviewQueueData.items.map((item) => (
                    <TableRow
                      key={item.assessmentId}
                      onClick={() => openReview({ assessmentId: normalizeAssessmentIdentifier(item.assessmentId) ?? item.assessmentId })}
                      className="group cursor-pointer hover:bg-secondary/30 transition-colors border-b border-border last:border-0"
                    >
                      <TableCell className="font-bold text-foreground py-5 pl-8 text-sm">{item.studentName}</TableCell>
                      <TableCell className="text-muted-foreground py-5 text-sm">{item.assessmentName}</TableCell>
                      <TableCell className="py-5">
                        <Badge variant={item.status === 'ai_draft_ready' ? 'default' : 'warning'}>
                          {item.status === 'ai_draft_ready' ? 'AI DRAFT' : 'NEEDS REVIEW'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right py-5 pr-6">
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center px-8">
                <div className="h-12 w-12 bg-secondary rounded-full flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-base font-bold text-foreground">All Caught Up</h3>
                <p className="text-xs text-muted-foreground max-w-xs mt-2 leading-relaxed">There are no submissions waiting for review.</p>
                <Button size="sm" onClick={() => startNewAssessment()} className="mt-6 bg-primary font-bold text-xs h-10 px-6 rounded-xl">
                  <FilePlus className="mr-2 h-4 w-4" /> New Assessment
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border bg-white dark:bg-[#111827] shadow-sm overflow-hidden rounded-2xl">
          <CardHeader className="bg-white dark:bg-[#111827] border-b border-border py-5 px-8">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg font-bold text-foreground">Class Performance</CardTitle>
            </div>
            <CardDescription className="text-xs text-muted-foreground">Aggregated rubric scores across all generated reports.</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-10">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <GraduationCap className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Avg. Score</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-foreground">{classPerformance?.avgScore ?? '—'}</span>
                  <span className="text-[10px] font-bold text-muted-foreground">/ 6</span>
                </div>
                <Progress value={((classPerformance?.avgScore ?? 0) / 6) * 100} className="h-1.5 bg-secondary" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Reports Complete</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-foreground">{classPerformance?.completionRate ?? '—'}</span>
                  <span className="text-[10px] font-bold text-muted-foreground">completed</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <GraduationCap className="h-4 w-4 text-emerald-500" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Mastery Achieved</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-emerald-600">{classPerformance?.masteryAchieved ?? '—'}</span>
                  <span className="text-[10px] font-bold text-muted-foreground">Level 6</span>
                </div>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full" style={{ width: `${classPerformance?.masteryAchieved ? (classPerformance.masteryAchieved / (classPerformance.criteriaBreakdown.length || 1)) * 100 : 0}%` }} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-bold text-foreground flex items-center gap-2 uppercase tracking-widest">
                Rubric Criteria Breakdown
              </h4>
              {classPerformanceLoading ? (
                <div className="h-[180px] flex items-center justify-center">
                  <p className="text-xs text-muted-foreground">Loading rubric data...</p>
                </div>
              ) : classPerformance?.criteriaBreakdown && classPerformance.criteriaBreakdown.length > 0 ? (
                <div className="h-[180px] w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={classPerformance.criteriaBreakdown} margin={{ left: -16, top: 10, bottom: 20 }}>
                      <XAxis
                        dataKey="criterion"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                      />
                      <YAxis
                        domain={[1, 8]}
                        ticks={[1, 2, 3, 4, 5, 6, 7, 8]}
                        interval={0}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) => {
                          switch (value) {
                            case 1: return 'A';
                            case 2: return 'B';
                            case 3: return '1';
                            case 4: return '2';
                            case 5: return '3';
                            case 6: return '4';
                            case 7: return '5';
                            case 8: return '6';
                            default: return '';
                          }
                        }}
                        tick={{ fill: '#94a3b8', fontSize: 9 }}
                      />
                      <Tooltip
                        cursor={{ fill: '#f8fafc' }}
                        contentStyle={{ backgroundColor: '#111827', borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '11px', color: '#fff' }}
                        itemStyle={{ color: '#E5E7EB' }}
                        formatter={(value: number) => [`${formatProficiencyLevel(value)}`, 'Avg. Proficiency']}
                      />
                      <Bar dataKey="averageScore" radius={[4, 4, 0, 0]} barSize={32}>
                        {classPerformance.criteriaBreakdown.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.averageScore >= 4.8 ? 'hsl(var(--primary))' : entry.averageScore >= 3 ? 'hsl(var(--primary) / 0.7)' : '#F59E0B'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[180px] flex items-center justify-center">
                  <p className="text-xs text-muted-foreground">No report data available yet.</p>
                </div>
              )}
              <div className="flex flex-wrap gap-4 pt-1">
                {classPerformance?.criteriaBreakdown.map((entry) => (
                  <div key={entry.criterion} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    {entry.trend === 'up' ? <TrendingUp className="h-3 w-3 text-green-500" /> : entry.trend === 'down' ? <TrendingDown className="h-3 w-3 text-red-500" /> : <Minus className="h-3 w-3 text-muted-foreground" />}
                    <span className="font-semibold">{entry.criterion}</span>
                    <span className="text-border">·</span>
                    <span>{formatProficiencyLevel(entry.averageScore)}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
