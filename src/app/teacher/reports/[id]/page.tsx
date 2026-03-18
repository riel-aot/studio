'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { useWebhook } from "@/lib/hooks";

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

const normalizeLegacyRubricScore = (score: number, maxScore?: number): number => {
    const rawScore = Number(score);
    const rawMaxScore = Number(maxScore);
    // Legacy reports stored proficiency on a 1-6 scale; convert to internal 1-8 mapping.
    if (Number.isFinite(rawMaxScore) && rawMaxScore === 6) {
        return rawScore + 2;
    }
    return rawScore;
};

interface FinalizedReport {
  id?: string;
  student_name: string;
  assignment_title: string;
  rubric_name: string;
  teacher_feedback?: string;
  rubric_grades?: Array<{
    score: number;
    maxScore: number;
    criterionId: string;
    criterionName: string;
  }>;

  created_at?: string;
}

export default function ReportDetailPage() {
    const params = useParams();
    const router = useRouter();
    const reportId = params.id as string;
    
    // Fetch reports list to ensure cache is populated
    const { data: reportsList } = useWebhook<{}, any>({
        eventName: 'REPORTS_LIST',
        payload: {},
        cacheKey: 'reports-list',
        cacheTtlMs: 300_000,
        fallbackToCacheOnError: true,
        suppressErrorToast: true,
    });
    
    const reportInfo = React.useMemo(() => {
        const reports = Array.isArray(reportsList)
            ? reportsList
            : (reportsList?.reports ?? reportsList?.items ?? []);

        const matchingReport = reports.find((r: any, idx: number) => {
            const id = r.id ?? r.reportId ?? r.report_id ?? `report-${idx}`;
            return id === reportId;
        });

        return {
            reportId,
            student_name: matchingReport?.student_name ?? matchingReport?.studentName,
            assignment_title: matchingReport?.assignment_title ?? matchingReport?.assignmentTitle ?? matchingReport?.assessment_title,
        };
    }, [reportId, reportsList]);

    // Fetch report data using REPORT_GET webhook
    const { data: reportRaw, isLoading, error, trigger: refetchReport } = useWebhook<
        { reportId: string; student_name?: string; assignment_title?: string },
        FinalizedReport | FinalizedReport[]
    >({
        eventName: 'REPORT_GET',
        payload: reportInfo,
        manual: true,
        cacheKey: `report-${reportId}`,
        cacheTtlMs: 300_000,
        fallbackToCacheOnError: true,
        suppressErrorToast: true,
    });

    // Extract single report from array response if needed
    const report = React.useMemo(() => {
        if (!reportRaw) return null;
        return Array.isArray(reportRaw) ? reportRaw[0] : reportRaw;
    }, [reportRaw]);

    // Fetch by reportId first; include extra fields when available.
    React.useEffect(() => {
        if (!reportInfo.reportId) {
            return;
        }
        refetchReport(reportInfo);
    }, [reportInfo, refetchReport]);

    if (isLoading && !report) {
        return (
            <div>
                <PageHeader
                    title="Report"
                    description="Loading report details..."
                />
                <Card>
                    <CardContent className="p-6 space-y-4">
                        <Skeleton className="h-6 w-1/2" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!report) {
        return (
            <div>
                <PageHeader
                    title="Report"
                    description="Report not found"
                />
                <Card>
                    <CardContent className="p-6">
                        <p className="text-muted-foreground">Report not found or loading...</p>
                        <Button onClick={() => router.push('/teacher/reports')} className="mt-4">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Reports
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="sm" onClick={() => router.push('/teacher/reports')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
            </div>
            
            <PageHeader
                title={report.student_name ?? 'Unknown Student'}
                description={`Assignment: ${report.assignment_title ?? 'Untitled Assignment'}${(report.Timestamp ?? report.timestamp ?? report.created_at) ? ` • Finalized ${new Date(report.Timestamp ?? report.timestamp ?? report.created_at ?? '').toLocaleDateString()}` : ''}`}
            />

            <div className="space-y-6">
                {report.rubric_name && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Rubric</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-base">{report.rubric_name}</p>
                        </CardContent>
                    </Card>
                )}

                {report.rubric_grades && report.rubric_grades.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Rubric Grades</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className='rounded-md border'>
                                {report.rubric_grades.map((item, index) => (
                                    <div 
                                        key={item.criterionId} 
                                        className={`flex items-center justify-between p-3 text-sm ${index < report.rubric_grades!.length - 1 ? 'border-b' : ''}`}
                                    >
                                        <span className='font-medium'>{item.criterionName}</span>
                                        <Badge variant="secondary">
                                            {formatProficiencyLevel(normalizeLegacyRubricScore(item.score, item.maxScore))}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {report.teacher_feedback && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Teacher Feedback</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className='text-sm whitespace-pre-wrap'>{report.teacher_feedback}</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
