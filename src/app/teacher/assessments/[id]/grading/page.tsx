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

type GradeScaleValue = 'A' | 'B' | '1' | '2' | '3' | '4' | '5' | '6';

const GRADE_SCALE_OPTIONS: GradeScaleValue[] = ['A', 'B', '1', '2', '3', '4', '5', '6'];

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

  const { trigger: getRubricDetails } = useWebhook<
    { rubricName?: string; rubric_name?: string },
    any
  >({
    eventName: 'RUBRIC_GET',
    manual: true,
    allowRawResponse: true,
    suppressErrorToast: true,
  });

  const [scores, setScores] = useState<Record<string, GradeScaleValue>>({});
  const [teacherFeedback, setTeacherFeedback] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedStudentName, setSelectedStudentName] = useState<string | null>(null);
  const [selectedAssignmentTitle, setSelectedAssignmentTitle] = useState<string | null>(null);
  const [sessionAiOutput, setSessionAiOutput] = useState<string | null>(null);
  const [rubricCriteria, setRubricCriteria] = useState<Array<{ id: string; title: string; description?: string; maxPoints: number }>>(() => {
    // Try to initialize from cache on mount
    if (typeof window !== 'undefined') {
      const storedRubricName = sessionStorage.getItem('currentRubricName');
      if (storedRubricName) {
        const cacheKey = `n8n:rubric:criteria:${storedRubricName}`;
        try {
          const cachedValue = window.localStorage.getItem(cacheKey);
          if (cachedValue) {
            const cached = JSON.parse(cachedValue) as { timestamp: number; data: Array<{ id: string; title: string; description?: string; maxPoints: number }> };
            if (Array.isArray(cached?.data) && cached.data.length > 0) {
              return cached.data;
            }
          }
        } catch {
          // Ignore parse errors
        }
      }
    }
    return [];
  });
  const [rubricNameFromSession, setRubricNameFromSession] = useState<string | null>(null);

  const criteria = useMemo(() => {
    const rawCriteria = resolvedAssessment?.criteria ?? rubricCriteria;
    if (!Array.isArray(rawCriteria)) {
      return [] as Array<{ id: string; title: string; description?: string; maxPoints: number }>;
    }
    return rawCriteria.map((item: any, index: number) => {
      const maxPoints = Number(item.maxPoints ?? item.max_points ?? item.points ?? 5);
      return {
        id: item.id ?? item.criterionId ?? item.key ?? `criterion-${index + 1}`,
        title: item.title ?? item.name ?? item.criterion ?? `Criterion ${index + 1}`,
        description: item.description ?? item.details ?? '',
        maxPoints: Number.isFinite(maxPoints) ? maxPoints : 5,
      };
    });
  }, [resolvedAssessment, rubricCriteria]);

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
    const fetchRubricCriteria = async () => {
      if (criteria.length > 0) {
        return;
      }
      const rubricName = resolvedAssessment?.rubricName
        ?? resolvedAssessment?.rubric_name
        ?? resolvedAssessment?.rubricId
        ?? resolvedAssessment?.rubric_id
        ?? rubricNameFromSession;

      if (!rubricName) {
        return;
      }

      const cacheKey = `n8n:rubric:criteria:${rubricName}`;
      if (typeof window !== 'undefined') {
        const cachedValue = window.localStorage.getItem(cacheKey);
        if (cachedValue) {
          try {
            const cached = JSON.parse(cachedValue) as { timestamp: number; data: Array<{ id: string; title: string; description?: string; maxPoints: number }> };
            if (Array.isArray(cached?.data) && cached.data.length > 0) {
              setRubricCriteria(cached.data);
              return;
            }
          } catch {
            window.localStorage.removeItem(cacheKey);
          }
        }
      }

      try {
        const webhookResponse = await getRubricDetails({ rubricName, rubric_name: rubricName });
        const result = (webhookResponse as any)?.data ?? webhookResponse;
        const rawCriteria = result?.criteria
          ?? result?.rubric?.criteria
          ?? result?.data?.criteria
          ?? result?.data?.rubric?.criteria
          ?? result?.items
          ?? result;

        const criteriaFields = [
          { key: 'criteria1', label: 'Criterion 1' },
          { key: 'criteria2', label: 'Criterion 2' },
          { key: 'criteria3', label: 'Criterion 3' },
          { key: 'criteria4', label: 'Criterion 4' },
        ];

        const persistCriteria = (mapped: Array<{ id: string; title: string; description?: string; maxPoints: number }>) => {
          setRubricCriteria(mapped);
          if (typeof window !== 'undefined') {
            window.localStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data: mapped }));
          }
        };

        if (rawCriteria && !Array.isArray(rawCriteria) && typeof rawCriteria === 'object') {
          const mappedFromFields = criteriaFields
            .map((field) => {
              const value = (rawCriteria as Record<string, unknown>)[field.key];
              if (!value) {
                return null;
              }
              return {
                id: field.key,
                title: String(value),
                description: '',
                maxPoints: 5,
              };
            })
            .filter((item): item is { id: string; title: string; description: string; maxPoints: number } => item !== null);

          if (mappedFromFields.length > 0) {
            persistCriteria(mappedFromFields);
            return;
          }
        }

        if (Array.isArray(rawCriteria)) {
          const first = rawCriteria[0];
          if (first && typeof first === 'object') {
            const mappedFromFields = criteriaFields
              .map((field) => {
                const value = first[field.key as keyof typeof first];
                if (!value) {
                  return null;
                }
                return {
                  id: field.key,
                  title: String(value),
                  description: '',
                  maxPoints: 5,
                };
              })
              .filter((item): item is { id: string; title: string; description: string; maxPoints: number } => item !== null);

            if (mappedFromFields.length > 0) {
              persistCriteria(mappedFromFields);
              return;
            }
          }

          const mapped = rawCriteria.map((item: any, index: number) => {
            const maxPoints = Number(item.maxPoints ?? item.max_points ?? item.points ?? 5);
            return {
              id: item.id ?? item.criterionId ?? item.key ?? `criterion-${index + 1}`,
              title: item.title ?? item.name ?? item.criterion ?? `Criterion ${index + 1}`,
              description: item.description ?? item.details ?? '',
              maxPoints: Number.isFinite(maxPoints) ? maxPoints : 5,
            };
          });
          persistCriteria(mapped);
        }
      } catch (error) {
        console.warn('[Grading] Failed to fetch rubric criteria:', error);
      }
    };

    fetchRubricCriteria();
  }, [criteria.length, resolvedAssessment, rubricNameFromSession, getRubricDetails]);

  useEffect(() => {
    if (!criteria.length) {
      return;
    }
    const initial: Record<string, GradeScaleValue> = {};
    criteria.forEach((criterion) => {
      initial[criterion.id] = toGradeScaleValue(Math.round(criterion.maxPoints * 0.6));
    });
    setScores(initial);
  }, [criteria]);

  useEffect(() => {
    // Populate scores from AI review when assessment data loads
    const rubricGrades = resolvedAssessment?.aiReview?.rubricGrades
      ?? resolvedAssessment?.aiReview?.criteria
      ?? [];
    if (!Array.isArray(rubricGrades) || !criteria.length) {
      return;
    }
    const newScores: Record<string, GradeScaleValue> = {};
    criteria.forEach((criterion) => {
      const grade = rubricGrades.find((g: any) =>
        g.criterionId === criterion.id
        || g.id === criterion.id
        || (g.title && g.title === criterion.title)
        || (g.name && g.name === criterion.title)
      );
      const score = grade?.score ?? grade?.points;
      newScores[criterion.id] = Number.isFinite(Number(score))
        ? toGradeScaleValue(score)
        : toGradeScaleValue(Math.round(criterion.maxPoints * 0.6));
    });
    setScores((prev) => ({ ...prev, ...newScores }));
  }, [resolvedAssessment, criteria]);

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
                      value={scores[criterion.id] ?? '4'}
                      onValueChange={(value) => handleScoreChange(criterion.id, value as GradeScaleValue)}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue placeholder="Proficiency Level" />
                      </SelectTrigger>
                      <SelectContent>
                        {GRADE_SCALE_OPTIONS.map((option) => (
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
