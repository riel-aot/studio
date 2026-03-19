'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWebhook } from '@/lib/hooks';
import { useToast } from '@/hooks/use-toast';
import { normalizeAssessmentIdentifier } from '@/lib/utils';
import { clampProficiencyLevelForGrade, getAllowedProficiencyLevelsForGrade, normalizeStudentGrade } from '@/lib/grade-rules';
import type { StudentListItem, StudentListResponse } from '@/lib/events';

type GradeScaleValue = 'A' | 'B' | '1' | '2' | '3' | '4' | '5' | '6';

const FIXED_REPORT_CRITERIA: Array<{ id: string; title: string; description?: string; maxPoints: number }> = [
  { id: 'listening', title: 'Listening', maxPoints: 8 },
  { id: 'speaking', title: 'Speaking', maxPoints: 8 },
  { id: 'reading', title: 'Reading', maxPoints: 8 },
  { id: 'writing', title: 'Writing', maxPoints: 8 },
];

const toGradeNumericValue = (value: GradeScaleValue): number => {
  switch (value) {
    case 'A': return 1;
    case 'B': return 2;
    case '1': return 3;
    case '2': return 4;
    case '3': return 5;
    case '4': return 6;
    case '5': return 7;
    case '6': return 8;
    default: return 5;
  }
};

const toGradeScaleValue = (value: unknown): GradeScaleValue => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    if (value === 'A' || value === 'B') {
      return value;
    }
    return '3';
  }
  const clamped = Math.max(1, Math.min(8, Math.round(parsed)));
  switch (clamped) {
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

export default function GradingPage() {
  const params = useParams<{ id: string }>();
  const assessmentId = params.id;
  const normalizedAssessmentId = normalizeAssessmentIdentifier(assessmentId) ?? assessmentId;
  const { toast } = useToast();
  const router = useRouter();

  const { data: assessmentData, isLoading } = useWebhook<{ assessmentId: string }, { assessment: any }>({
    eventName: 'ASSESSMENT_GET',
    payload: { assessmentId: normalizedAssessmentId },
    cacheKey: `assessment-get:${normalizedAssessmentId}`,
    cacheTtlMs: 60_000,
    fallbackToCacheOnError: true,
  });

  const { data: studentsData } = useWebhook<{}, StudentListResponse | StudentListItem[] | { students?: any[] }>({
    eventName: 'STUDENT_LIST',
    allowRawResponse: true,
  });

  const normalizedStudents = useMemo<StudentListItem[]>(() => {
    if (!studentsData) {
      return [];
    }

    const mapStudent = (student: any): StudentListItem => ({
      name: student?.name,
      grade: student?.grade,
      studentIdNumber: student?.student_id ?? student?.studentId ?? student?.studentIdNumber ?? student?.id ?? '',
      studentEmail: student?.student_email ?? student?.studentEmail,
      parentEmail: student?.parent_email ?? student?.parentEmail ?? '',
    });

    if (Array.isArray(studentsData)) {
      return studentsData.map(mapStudent).filter((student) => student.name && student.studentIdNumber);
    }

    const responseLike = studentsData as any;
    if (Array.isArray(responseLike.students)) {
      return responseLike.students.map(mapStudent).filter((student: StudentListItem) => student.name && student.studentIdNumber);
    }

    if (responseLike.success && Array.isArray(responseLike.data?.students)) {
      return responseLike.data.students.map(mapStudent).filter((student: StudentListItem) => student.name && student.studentIdNumber);
    }

    return [];
  }, [studentsData]);

  const resolvedAssessment = useMemo(() => {
    if (!assessmentData) {
      return null;
    }
    if (Array.isArray(assessmentData)) {
      return assessmentData[0] ?? null;
    }
    const candidate = assessmentData as any;
    return candidate.assessment ?? candidate.data?.assessment ?? candidate ?? null;
  }, [assessmentData]);

  const { trigger: finalizeAssessment, isLoading: isFinalizing } = useWebhook<{
    assessment_id: string;
    student_id?: string | null;
    student_name?: string | null;
    assignment_title?: string | null;
    rubric_name?: string | null;
    teacher_feedback?: string | null;
    ai_output?: string | null;
    status?: string;
    rubric_grades?: Array<{
      criterionId: string;
      criterionName: string;
      score: number;
      maxScore: number;
    }>;
    criteria_ratings?: Array<{
      criterionId: string;
      criterionName: string;
      rating: number;
      maxRating: number;
    }>;
  }, { reportId?: string; assessment?: any; report?: { reportId?: string } }>(
    {
      eventName: 'ASSESSMENT_FINALIZE',
      manual: true,
    }
  );

  const { trigger: markComplete, isLoading: isMarkingComplete } = useWebhook<{
    student_id: string;
    assessment_id: string;
    status: string;
  }, { success?: boolean }>(
    {
      eventName: 'ASSESSMENT_MARK_COMPLETE',
      manual: true,
    }
  );

  const [scores, setScores] = useState<Record<string, GradeScaleValue>>({});
  const [teacherFeedback, setTeacherFeedback] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedStudentName, setSelectedStudentName] = useState<string | null>(null);
  const [selectedAssignmentTitle, setSelectedAssignmentTitle] = useState<string | null>(null);
  const [sessionAiOutput, setSessionAiOutput] = useState<string | null>(null);
  const [rubricNameFromSession, setRubricNameFromSession] = useState<string | null>(null);

  const criteria = useMemo(() => FIXED_REPORT_CRITERIA, []);

  const aiOutputText = useMemo(() => {
    const rawOutput = resolvedAssessment?.aiReview?.finalFeedback
      ?? resolvedAssessment?.aiReview?.feedback
      ?? resolvedAssessment?.aiReview?.summary
      ?? resolvedAssessment?.aiReview?.output
      ?? resolvedAssessment?.aiReview?.rawOutput
      ?? resolvedAssessment?.aiReview?.text
      ?? resolvedAssessment?.aiReview
      ?? resolvedAssessment?.aiOutput
      ?? resolvedAssessment?.aiResponse
      ?? resolvedAssessment?.aiResult
      ?? resolvedAssessment?.ai;

    if (!rawOutput) {
      return sessionAiOutput || 'No AI output yet.';
    }

    const extractTextFromParts = (parts: any[]): string => {
      return parts
        .map((part) => (typeof part?.text === 'string' ? part.text : ''))
        .filter(Boolean)
        .join('\n');
    };

    if (typeof rawOutput === 'string') {
      return rawOutput;
    }

    if (Array.isArray(rawOutput)) {
      const first = rawOutput[0];
      const parts = first?.content?.parts ?? first?.parts;
      if (Array.isArray(parts)) {
        const extracted = extractTextFromParts(parts);
        if (extracted) {
          return extracted;
        }
      }
      return JSON.stringify(rawOutput, null, 2);
    }

    const parts = rawOutput?.content?.parts ?? rawOutput?.parts;
    if (Array.isArray(parts)) {
      const extracted = extractTextFromParts(parts);
      if (extracted) {
        return extracted;
      }
    }

    if (typeof rawOutput?.text === 'string') {
      return rawOutput.text;
    }

    return JSON.stringify(rawOutput, null, 2);
  }, [resolvedAssessment, sessionAiOutput]);

  const resolvedStudentGrade = useMemo(() => {
    const assessmentGrade = resolvedAssessment?.student?.grade
      ?? resolvedAssessment?.student?.gradeLabel
      ?? resolvedAssessment?.student_grade
      ?? resolvedAssessment?.studentGrade
      ?? resolvedAssessment?.gradeLabel
      ?? resolvedAssessment?.grade
      ?? null;

    if (assessmentGrade) {
      return String(assessmentGrade);
    }

    const students = normalizedStudents;
    if (!students.length) {
      return null;
    }

    const assessmentStudentId = resolvedAssessment?.student?.studentIdNumber
      ?? resolvedAssessment?.student?.id
      ?? null;
    const assessmentStudentName = resolvedAssessment?.student?.name ?? null;

    const normalizeMatchValue = (value: unknown): string => String(value ?? '').trim().toLowerCase();

    const candidateIds = new Set(
      [
        selectedStudentId,
        assessmentStudentId,
      ]
        .map(normalizeMatchValue)
        .filter(Boolean),
    );

    const candidateNames = new Set(
      [
        selectedStudentName,
        assessmentStudentName,
      ]
        .map(normalizeMatchValue)
        .filter(Boolean),
    );

    const matchedStudent = students.find((student) => {
      const rawStudent = student as any;
      const studentIdCandidates = [
        rawStudent.id,
        rawStudent.student_id,
        rawStudent.studentId,
        rawStudent.studentIdNumber,
        student.studentIdNumber,
      ]
        .map(normalizeMatchValue)
        .filter(Boolean);

      const studentNameCandidates = [
        rawStudent.name,
        rawStudent.student_name,
        rawStudent.studentName,
        student.name,
      ]
        .map(normalizeMatchValue)
        .filter(Boolean);

      return (
        studentIdCandidates.some((id) => candidateIds.has(id))
        || studentNameCandidates.some((name) => candidateNames.has(name))
      );
    });

    return matchedStudent?.grade ?? null;
  }, [resolvedAssessment, selectedStudentId, selectedStudentName, normalizedStudents]);

  const allowedGradeScaleOptions = useMemo(
    () => getAllowedProficiencyLevelsForGrade(resolvedStudentGrade) as GradeScaleValue[],
    [resolvedStudentGrade],
  );

  const displayedLimiterGrade = useMemo(
    () => normalizeStudentGrade(resolvedStudentGrade),
    [resolvedStudentGrade],
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const storedStudentId = sessionStorage.getItem('currentStudentId');
    const storedStudentName = sessionStorage.getItem('currentStudentName');
    const storedAssignmentTitle = sessionStorage.getItem('currentAssignmentTitle');
    const storedAiOutput = sessionStorage.getItem('currentAiOutput');
    const storedRubricName = sessionStorage.getItem('currentRubricName');
    if (storedStudentId) {
      setSelectedStudentId(storedStudentId);
    }
    if (storedStudentName) {
      setSelectedStudentName(storedStudentName);
    }
    if (storedAiOutput) {
      setSessionAiOutput(storedAiOutput);
    }
    if (storedRubricName) {
      setRubricNameFromSession(storedRubricName);
    }
    if (normalizedAssessmentId) {
      setSelectedAssignmentTitle(normalizedAssessmentId);
      sessionStorage.setItem('currentAssignmentTitle', normalizedAssessmentId);
    } else if (storedAssignmentTitle) {
      setSelectedAssignmentTitle(storedAssignmentTitle);
    }
  }, []);

  useEffect(() => {
    if (!criteria.length) {
      return;
    }
    const initial: Record<string, GradeScaleValue> = {};
    criteria.forEach((criterion) => {
      initial[criterion.id] = clampProficiencyLevelForGrade(
        toGradeScaleValue(Math.round(criterion.maxPoints * 0.6)),
        resolvedStudentGrade,
      ) as GradeScaleValue;
    });
    setScores(initial);
  }, [criteria, resolvedStudentGrade]);

  useEffect(() => {
    // Populate scores from AI review when assessment data loads
    const rubricGrades = resolvedAssessment?.aiReview?.rubricGrades
      ?? resolvedAssessment?.aiReview?.criteria
      ?? [];
    if (!Array.isArray(rubricGrades) || !criteria.length) {
      return;
    }
    const newScores: Record<string, GradeScaleValue> = {};
    criteria.forEach((criterion, index) => {
      const grade = rubricGrades.find((g: any) =>
        g.criterionId === criterion.id
        || g.id === criterion.id
        || (g.title && g.title === criterion.title)
        || (g.name && g.name === criterion.title)
      ) ?? rubricGrades[index];
      const score = grade?.score ?? grade?.points;
      const resolvedScore = Number.isFinite(Number(score))
        ? toGradeScaleValue(score)
        : toGradeScaleValue(Math.round(criterion.maxPoints * 0.6));
      newScores[criterion.id] = clampProficiencyLevelForGrade(resolvedScore, resolvedStudentGrade) as GradeScaleValue;
    });
    setScores((prev) => ({ ...prev, ...newScores }));
  }, [resolvedAssessment, criteria, resolvedStudentGrade]);

  const handleScoreChange = (id: string, value: GradeScaleValue) => {
    setScores((s) => ({ ...s, [id]: value }));
  };

  const handleFinalize = async () => {
    const rubricGrades = criteria.map((criterion) => {
      const rawScore = scores[criterion.id] ?? '4';
      const rating = toGradeNumericValue(rawScore);
      return {
        criterionId: criterion.id,
        criterionName: criterion.title,
        score: rating,
        maxScore: 8,
      };
    });
    const criteriaRatings = rubricGrades.map((item) => ({
      criterionId: item.criterionId,
      criterionName: item.criterionName,
      rating: item.score,
      maxRating: 8,
    }));
    const assignmentTitle = resolvedAssessment?.title ?? selectedAssignmentTitle ?? normalizedAssessmentId ?? null;
    const rubricName = resolvedAssessment?.rubricName
      ?? resolvedAssessment?.rubric_name
      ?? resolvedAssessment?.rubricId
      ?? resolvedAssessment?.rubric_id
      ?? rubricNameFromSession
      ?? null;
    const studentId = resolvedAssessment?.student?.studentIdNumber
      ?? resolvedAssessment?.student?.id
      ?? selectedStudentId
      ?? null;
    const studentName = resolvedAssessment?.student?.name ?? selectedStudentName ?? null;
    const aiOutput = aiOutputText && aiOutputText !== 'No AI output yet.' ? aiOutputText : null;
    const feedbackValue = teacherFeedback.trim() ? teacherFeedback.trim() : null;

    const finalizeResponse = await finalizeAssessment({
      assessment_id: normalizedAssessmentId,
      student_id: studentId,
      student_name: studentName,
      assignment_title: assignmentTitle,
      rubric_name: rubricName,
      teacher_feedback: feedbackValue,
      ai_output: aiOutput,
      status: 'Graded',
      rubric_grades: rubricGrades,
      criteria_ratings: criteriaRatings,
    });

    // Mark the assignment as complete for the student
    if (studentName && assignmentTitle) {
      await markComplete({
        student_id: studentName,
        assessment_id: assignmentTitle,
        status: 'Graded',
      });
    }

    if (typeof window !== 'undefined') {
      if (studentId) {
        sessionStorage.setItem('currentStudentId', studentId);
      }
      if (studentName) {
        sessionStorage.setItem('currentStudentName', studentName);
      }
      if (assignmentTitle) {
        sessionStorage.setItem('currentAssignmentTitle', assignmentTitle);
      }
    }

    const reportId = (finalizeResponse as any)?.data?.reportId
      ?? (finalizeResponse as any)?.reportId
      ?? (finalizeResponse as any)?.data?.report?.reportId
      ?? (finalizeResponse as any)?.report?.reportId
      ?? (finalizeResponse as any)?.data?.assessment?.reportId
      ?? (finalizeResponse as any)?.assessment?.reportId;

    if (typeof window !== 'undefined' && reportId && studentId) {
      const cacheKey = `report:${studentId}:${normalizedAssessmentId}`;
      window.sessionStorage.setItem(cacheKey, reportId);
    }

    toast({ title: 'Finalized', description: 'Assessment finalized.' });
    setTimeout(() => router.push(reportId ? `/teacher/reports/${reportId}` : '/teacher/reports'), 600);
  };

  return (
    <div className="w-full">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Grading & Feedback</CardTitle>
              <CardDescription>Review AI suggestions and finalize the assignment proficiency levels.</CardDescription>
              {(resolvedAssessment?.student || selectedStudentId || selectedStudentName) && (
                <div className="mt-2 text-sm">
                  <span className="text-muted-foreground">Student: </span>
                  <span className="font-medium">
                    {resolvedAssessment?.student?.name
                      ?? resolvedAssessment?.student?.studentIdNumber
                      ?? selectedStudentName
                      ?? selectedStudentId}
                  </span>
                </div>
              )}
              {(resolvedAssessment?.title || selectedAssignmentTitle || normalizedAssessmentId) && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Assignment: </span>
                  <span className="font-medium">
                    {normalizedAssessmentId ?? resolvedAssessment?.title ?? selectedAssignmentTitle}
                  </span>
                </div>
              )}
              <div className="mt-3 rounded-md border bg-muted/30 px-3 py-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Limiter Grade: </span>
                  <span className="font-medium">{displayedLimiterGrade ?? 'Unknown (using full scale)'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Allowed Levels: </span>
                  <span className="font-medium">{allowedGradeScaleOptions.join(', ')}</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {criteria.map((criterion) => (
              <div key={criterion.id} className="p-3 border rounded">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{criterion.title}</div>
                    {criterion.description && (
                      <div className="text-sm text-muted-foreground">{criterion.description}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={clampProficiencyLevelForGrade(scores[criterion.id] ?? '4', resolvedStudentGrade)}
                      onValueChange={(value) => handleScoreChange(criterion.id, value as GradeScaleValue)}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue placeholder="Proficiency Level" />
                      </SelectTrigger>
                      <SelectContent>
                        {allowedGradeScaleOptions.map((option) => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))}

            <div>
              <Label>AI Output</Label>
              <pre className="mt-2 h-64 overflow-y-auto rounded border bg-muted/30 p-3 text-sm whitespace-pre-wrap">
                {aiOutputText}
              </pre>
            </div>

            <div>
              <Label htmlFor="teacher-feedback">Teacher Feedback</Label>
              <Textarea id="teacher-feedback" className="h-40" value={teacherFeedback} onChange={(e) => setTeacherFeedback(e.target.value)} />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => { setTeacherFeedback(''); }}>Reset</Button>
              <Button onClick={handleFinalize} disabled={isFinalizing || isMarkingComplete}>{isFinalizing || isMarkingComplete ? 'Processing...' : 'Finalize & Create Report'}</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
