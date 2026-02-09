'use client';

import React, { useState } from 'react';
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Download, MoreHorizontal, FileText } from "lucide-react";
import { useWebhook } from "@/lib/hooks";
import type { ReportListItem, ReportListResponse } from "@/lib/events";
import { GenerateReportModal } from '@/components/reports/generate-report-modal';
import { ReportPreviewDrawer } from '@/components/reports/report-preview-drawer';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

function ReportsPageSkeleton() {
    return (
        <div>
            <PageHeader
                title="Reports"
                description="Generate and manage parent reports from finalized assessments."
                actions={<Skeleton className="h-11 w-40" />}
            />
            <Card>
                <CardHeader>
                    <CardTitle>Report History</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student</TableHead>
                                <TableHead>Period</TableHead>
                                <TableHead>Generated On</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-[80px] text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[...Array(5)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-8 w-8" /></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}

function EmptyState({ onGenerateClick }: { onGenerateClick: () => void }) {
    return (
        <div className="text-center py-16 border-dashed border-2 rounded-lg">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-xl font-semibold">No reports generated yet</h3>
            <p className="text-muted-foreground mt-2 mb-4">Start by generating the first report for a student.</p>
            <Button onClick={onGenerateClick}>
                <Download className="mr-2 h-4 w-4" />
                Generate Report
            </Button>
        </div>
    )
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
    return (
        <Alert variant="destructive" className="mt-8">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Failed to Load Reports</AlertTitle>
            <AlertDescription>
                There was an issue fetching the report history. Please try again.
                <div className="mt-4">
                    <Button variant="destructive" onClick={onRetry}>Retry</Button>
                </div>
            </AlertDescription>
        </Alert>
    );
}

const statusPillVariants: Record<ReportListItem['status'], 'default' | 'secondary' | 'destructive' | 'outline'> = {
    Queued: 'secondary',
    Generated: 'default',
    Sent: 'outline',
    Failed: 'destructive',
};

export default function ReportsPage() {
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
    const [previewReportId, setPreviewReportId] = useState<string | null>(null);
    const { toast } = useToast();

    const { data, isLoading, error, trigger: refetch } = useWebhook<{}, ReportListResponse>({
        eventName: 'REPORTS_LIST',
        payload: { page: 1, pageSize: 20 },
    });

    const { trigger: sendReport, isLoading: isSending } = useWebhook<{ reportId: string }, {}>({
        eventName: 'REPORT_SEND',
        manual: true,
        onSuccess: () => toast({ title: "Report sent successfully"}),
        errorMessage: "Failed to send report."
    });

    const { trigger: downloadPdf, isLoading: isDownloading } = useWebhook<{ reportId: string }, { fileContent: string }>({
        eventName: 'REPORT_DOWNLOAD_PDF',
        manual: true,
        onSuccess: (data, payload) => {
            // In a real app, this would trigger a file download.
            console.log(`Downloading PDF for report ${payload?.reportId}`);
            toast({ title: "PDF download started."});
        },
        errorMessage: "Failed to download PDF."
    });

    const handleGenerateSuccess = () => {
        setIsGenerateModalOpen(false);
        toast({ title: 'Report Queued', description: 'Your report is being generated and will appear here shortly.'});
        refetch();
    };

    if (isLoading && !data) {
        return <ReportsPageSkeleton />;
    }

    if (error) {
        return (
            <div>
                 <PageHeader
                    title="Reports"
                    description="Generate and manage parent reports from finalized assessments."
                    actions={
                        <Button onClick={() => setIsGenerateModalOpen(true)}>
                            <Download className="mr-2 h-4 w-4" />
                            Generate Report
                        </Button>
                    }
                />
                <ErrorState onRetry={refetch} />
            </div>
        )
    }

    return (
        <div>
            <GenerateReportModal
                isOpen={isGenerateModalOpen}
                onOpenChange={setIsGenerateModalOpen}
                onSuccess={handleGenerateSuccess}
            />
            {previewReportId && (
                <ReportPreviewDrawer
                    reportId={previewReportId}
                    onOpenChange={(isOpen) => !isOpen && setPreviewReportId(null)}
                />
            )}
            <PageHeader
                title="Reports"
                description="Generate and manage parent reports from finalized assessments."
                actions={
                    <Button onClick={() => setIsGenerateModalOpen(true)}>
                        <Download className="mr-2 h-4 w-4" />
                        Generate Report
                    </Button>
                }
            />
            
            {data?.items && data.items.length > 0 ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Report History</CardTitle>
                        <CardDescription>A log of all reports you have generated.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Period</TableHead>
                                    <TableHead>Generated On</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-[80px] text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.items.map((report) => (
                                    <TableRow key={report.reportId}>
                                        <TableCell className="font-medium">{report.studentName}</TableCell>
                                        <TableCell className="text-muted-foreground">{report.periodLabel}</TableCell>
                                        <TableCell className="text-muted-foreground">{format(new Date(report.generatedAt), 'dd MMM yyyy, p')}</TableCell>
                                        <TableCell>
                                            <Badge variant={statusPillVariants[report.status]}>{report.status}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                             <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" disabled={isSending || isDownloading}>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                        <span className="sr-only">More actions</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => setPreviewReportId(report.reportId)}>
                                                        View Report
                                                    </DropdownMenuItem>
                                                    {report.hasPdf && (
                                                        <DropdownMenuItem onClick={() => downloadPdf({ reportId: report.reportId })}>
                                                            Download PDF
                                                        </DropdownMenuItem>
                                                    )}
                                                    {report.delivery.email && (
                                                        <DropdownMenuItem onClick={() => sendReport({ reportId: report.reportId })}>
                                                            Resend Email
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            ) : (
                <EmptyState onGenerateClick={() => setIsGenerateModalOpen(true)} />
            )}
        </div>
    );
}
