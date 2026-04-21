'use client';

import React from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { ReportPDFTemplate } from './report-pdf-template';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';

interface ReportDownloadButtonProps {
  report: {
    student_name: string;
    assignment_title: string;
    teacher_feedback?: string;
  };
  rubricGrades: Array<{
    criterionName: string;
    score: number;
    maxScore: number;
  }>;
  formattedDate: string;
}

export default function ReportDownloadButton({ report, rubricGrades, formattedDate }: ReportDownloadButtonProps) {
  return (
    <PDFDownloadLink
      document={
        <ReportPDFTemplate
          studentName={report.student_name}
          assignmentTitle={report.assignment_title}
          date={formattedDate}
          rubricGrades={rubricGrades}
          teacherFeedback={report.teacher_feedback || ''}
        />
      }
      fileName={`Athena_${report.student_name}.pdf`}
    >
      {({ loading, error }) => {
        if (error) {
          console.error('[PDF Gen] Critical failure:', error);
        }
        return (
          <Button 
            variant="outline" 
            disabled={loading}
            className="h-11 rounded-xl font-bold border-border bg-card shadow-sm hover:bg-secondary/50"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Preparing PDF...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </>
            )}
          </Button>
        );
      }}
    </PDFDownloadLink>
  );
}