'use client';

import React, { useState, useMemo, useCallback, use } from 'react';
import { useWebhook } from '@/lib/hooks';
import type { AssessmentWorkspaceData, AISuggestion, RubricCriterion } from '@/lib/events';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, FileText, ImageIcon, Loader2, Sparkles, X } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { FileUploader } from '@/components/file-uploader';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { FinalizeConfirmationDialog } from '@/components/assessment-workspace/finalize-dialog';
import { AssessmentWorkspaceSkeleton } from '@/components/assessment-workspace/skeletons';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// --- Helper Functions and Components ---

function getStatusPill(status: AssessmentWorkspaceData['status']) {
    const variants = {
        draft: 'secondary',
        ai_draft_ready: 'default',
        needs_review: 'destructive',
        finalized: 'outline',
    } as const;
    const text = {
        draft: 'Draft',
        ai_draft_ready: 'AI Draft Ready',
        needs_review: 'Needs Review',
        finalized: 'Finalized',
    } as const;

    return <Badge variant={variants[status]}>{text[status]}</Badge>;
}

function WorkspaceHeader({ data, onRunAI, onFinalize }: { data: AssessmentWorkspaceData, onRunAI: () => void, onFinalize: () => void }) {
    const [isFinalizeOpen, setIsFinalizeOpen] = useState(false);
    
    const showRunAI = data.status === 'draft' && !!data.currentText;
    const showFinalize = data.status === 'ai_draft_ready' || data.status === 'needs_review';

    return (
        <>
        <FinalizeConfirmationDialog 
            isOpen={isFinalizeOpen}
            onOpenChange={setIsFinalizeOpen}
            onConfirm={onFinalize}
        />
        <div className="mb-6">
            <div className="mb-4">
                <Button asChild variant="outline" size="sm">
                    <Link href={`/teacher/students/${data.student.id}`}><ArrowLeft className="mr-2 h-4 w-4" /> Back to Student</Link>
                </Button>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{data.title}</h1>
                    <p className="mt-1 text-muted-foreground">For {data.student.name}</p>
                </div>
                <div className="flex items-center gap-4">
                    {getStatusPill(data.status)}
                    {showRunAI && <Button onClick={onRunAI}><Sparkles className="mr-2 h-4 w-4" /> Run AI Review</Button>}
                    {showFinalize && <Button onClick={() => setIsFinalizeOpen(true)}><CheckCircle className="mr-2 h-4 w-4" /> Finalize Assessment</Button>}
                </div>
            </div>
        </div>
        </>
    );
}

function InputPanel({ assessment, onTextSaved }: { assessment: AssessmentWorkspaceData, onTextSaved: (text: string) => void }) {
    const [text, setText] = useState(assessment.currentText || '');
    const [files, setFiles] = useState<File[]>([]);
    
    const { trigger: saveText, isLoading: isSaving } = useWebhook<{ assessmentId: string; text: string }, {}>({
        eventName: 'ASSESSMENT_TEXT_SAVE',
        manual: true,
        onSuccess: () => onTextSaved(text),
        errorMessage: "Failed to save text."
    });

    const { trigger: extractText, isLoading: isExtracting } = useWebhook<{ assessmentId: string; fileRef: string }, { extractedText: string }>({
        eventName: 'ASSESSMENT_EXTRACT_TEXT',
        manual: true,
        onSuccess: (data) => setText(data.extractedText),
        errorMessage: 'Failed to extract text from image.'
    });

    const isReadOnly = assessment.status === 'finalized';

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Input</CardTitle>
                <CardDescription>Provide the student's work.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="typed">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="typed"><FileText className="mr-2 h-4 w-4" /> Typed Work</TabsTrigger>
                        <TabsTrigger value="handwritten"><ImageIcon className="mr-2 h-4 w-4" /> Handwritten</TabsTrigger>
                    </TabsList>
                    <TabsContent value="typed" className="pt-4">
                        <div className="space-y-4">
                            <FileUploader onFilesSelected={setFiles} />
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-card px-2 text-muted-foreground">Or</span>
                                </div>
                            </div>
                            <Textarea 
                                placeholder="Paste student's text here..." 
                                className="h-64"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                readOnly={isReadOnly}
                            />
                            <Button onClick={() => saveText({ assessmentId: assessment.id, text })} disabled={isSaving || isReadOnly}>
                                {isSaving ? <Loader2 className="animate-spin mr-2" /> : null} Save Text
                            </Button>
                        </div>
                    </TabsContent>
                    <TabsContent value="handwritten" className="pt-4">
                         <div className="space-y-4">
                            <FileUploader onFilesSelected={setFiles} acceptedFileTypes={{'image/*': ['.jpeg', '.png'], 'application/pdf': ['.pdf']}} />
                            {files.length > 0 && (
                                <Button onClick={() => extractText({ assessmentId: assessment.id, fileRef: files[0].name })} disabled={isExtracting || isReadOnly}>
                                    {isExtracting ? <Loader2 className="animate-spin mr-2" /> : null} Extract Text
                                </Button>
                            )}
                            <Textarea 
                                placeholder="Extracted text will appear here. You can edit it before running the AI review." 
                                className="h-64"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                readOnly={isReadOnly || isExtracting}
                            />
                             <Button onClick={() => saveText({ assessmentId: assessment.id, text })} disabled={isSaving || isReadOnly}>
                                {isSaving ? <Loader2 className="animate-spin mr-2" /> : null} Save Extracted Text
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}

function DocumentPanel({ text, suggestions, onApplySuggestion }: { text: string; suggestions: AISuggestion[]; onApplySuggestion: (suggestionId: string, action: 'apply' | 'dismiss') => void; }) {
    const processedText = useMemo(() => {
        if (!suggestions || suggestions.length === 0) {
            return <span>{text}</span>;
        }

        let lastIndex = 0;
        const parts: React.ReactNode[] = [];
        const sortedSuggestions = [...suggestions].sort((a, b) => a.start - b.start);

        sortedSuggestions.forEach((suggestion, i) => {
            if (suggestion.start > lastIndex) {
                parts.push(text.substring(lastIndex, suggestion.start));
            }
            const highlightedText = text.substring(suggestion.start, suggestion.end);
            
            parts.push(
                <Popover key={suggestion.id}>
                    <PopoverTrigger asChild>
                        <mark className="bg-yellow-200/50 hover:bg-yellow-200/80 cursor-pointer rounded px-0.5">
                            {highlightedText}
                        </mark>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <h4 className="font-medium leading-none">{suggestion.category}</h4>
                                <p className="text-sm text-muted-foreground">{suggestion.note}</p>
                            </div>
                            {suggestion.replacement && (
                                <div className="rounded-md border bg-muted p-2">
                                    <p className="text-sm">Suggest: <span className="font-semibold">{suggestion.replacement}</span></p>
                                </div>
                            )}
                            <div className="flex gap-2">
                                {suggestion.replacement && <Button size="sm" onClick={() => onApplySuggestion(suggestion.id, 'apply')}>Apply</Button>}
                                <Button size="sm" variant="outline" onClick={() => onApplySuggestion(suggestion.id, 'dismiss')}>Dismiss</Button>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
            );
            lastIndex = suggestion.end;
        });

        if (lastIndex < text.length) {
            parts.push(text.substring(lastIndex));
        }

        return <>{parts}</>;
    }, [text, suggestions, onApplySuggestion]);
    
    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Document</CardTitle>
                <CardDescription>The official text for review and feedback.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="prose prose-sm max-w-none rounded-md border p-4 h-[70vh] overflow-y-auto">
                    {text ? processedText : <p className="text-muted-foreground">Student work will appear here once saved from the left panel.</p>}
                </div>
            </CardContent>
        </Card>
    );
}

function ReviewPanel({ assessment, onApplySuggestion, onSaveFeedback }: { assessment: AssessmentWorkspaceData; onApplySuggestion: (suggestionId: string, action: 'apply' | 'dismiss') => void; onSaveFeedback: (feedback: { teacherNotes: string; finalFeedback: string }) => void; }) {
    const [teacherNotes, setTeacherNotes] = useState(assessment.teacherFeedback?.notes || '');
    const [finalFeedback, setFinalFeedback] = useState(assessment.teacherFeedback?.finalFeedback || '');
    
    const { trigger: saveFeedback, isLoading: isSaving } = useWebhook<{ assessmentId: string; teacherNotes: string; finalFeedback: string }, {}>({
        eventName: 'ASSESSMENT_SAVE_TEACHER_FEEDBACK',
        manual: true,
        errorMessage: 'Failed to save feedback.',
        onSuccess: () => onSaveFeedback({ teacherNotes, finalFeedback })
    });

    const suggestionGroups = useMemo(() => {
        const groups: { [key: string]: AISuggestion[] } = {};
        assessment.aiReview?.suggestions?.forEach(s => {
            if (!groups[s.category]) {
                groups[s.category] = [];
            }
            groups[s.category].push(s);
        });
        return groups;
    }, [assessment.aiReview?.suggestions]);

    const isReadOnly = assessment.status === 'finalized';

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Review & Feedback</CardTitle>
                <CardDescription>AI suggestions and rubric scoring.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="suggestions">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
                        <TabsTrigger value="rubric">Rubric Draft</TabsTrigger>
                    </TabsList>
                    <TabsContent value="suggestions" className="pt-4 space-y-4 h-[65vh] overflow-y-auto">
                         {Object.entries(suggestionGroups).length > 0 ? Object.entries(suggestionGroups).map(([category, suggestions]) => (
                             <div key={category}>
                                <h4 className="font-semibold text-sm mb-2">{category} ({suggestions.length})</h4>
                                <div className="space-y-2">
                                {suggestions.map(s => (
                                    <Card key={s.id} className="p-3">
                                        <p className="text-sm text-muted-foreground">{s.note}</p>
                                        {s.replacement && <p className="text-sm mt-1">Change to: <span className="font-semibold">{s.replacement}</span></p>}
                                        <div className="flex gap-2 mt-2">
                                            {s.replacement && <Button size="sm" variant="ghost" onClick={() => onApplySuggestion(s.id, 'apply')}>Apply</Button>}
                                            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => onApplySuggestion(s.id, 'dismiss')}>Dismiss</Button>
                                        </div>
                                    </Card>
                                ))}
                                </div>
                             </div>
                         )) : <p className="text-sm text-muted-foreground text-center pt-10">No AI suggestions available. Run the AI review first.</p>}
                    </TabsContent>
                    <TabsContent value="rubric" className="pt-4 space-y-4 h-[65vh] overflow-y-auto">
                        {assessment.aiReview?.rubricDraft ? (
                            <>
                            {assessment.aiReview.rubricDraft.map(criterion => (
                                <div key={criterion.id}>
                                    <h4 className="font-semibold">{criterion.name}</h4>
                                    <p className="text-sm text-muted-foreground">{criterion.description}</p>
                                    <div className="mt-2 flex items-center gap-2">
                                        <Badge>Score: {criterion.draftScore}/{criterion.maxScore}</Badge>
                                        <p className="text-xs italic text-muted-foreground">{criterion.evidence}</p>
                                    </div>
                                </div>
                            ))}
                             <Separator className="my-4"/>
                            </>
                        ) : <p className="text-sm text-muted-foreground text-center pt-10">No rubric draft available. Run the AI review first.</p>}

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="teacher-notes">Teacher Notes (Private)</Label>
                                <Textarea id="teacher-notes" value={teacherNotes} onChange={e => setTeacherNotes(e.target.value)} readOnly={isReadOnly} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="final-feedback">Final Feedback for Student</Label>
                                <Textarea id="final-feedback" value={finalFeedback} onChange={e => setFinalFeedback(e.target.value)} readOnly={isReadOnly}/>
                            </div>
                            {!isReadOnly && (
                                <Button onClick={() => saveFeedback({assessmentId: assessment.id, teacherNotes, finalFeedback})} disabled={isSaving}>
                                    {isSaving ? <Loader2 className="animate-spin mr-2" /> : null} Save Feedback
                                </Button>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}

// --- Main Page Component ---

export default function AssessmentWorkspacePage({ params }: { params: { id: string } }) {
  const [assessmentData, setAssessmentData] = useState<AssessmentWorkspaceData | null>(null);
  const pageParams = use(params);

  const handleDataSuccess = useCallback((data: { assessment: AssessmentWorkspaceData }) => {
    setAssessmentData(data.assessment);
  }, []);

  const { isLoading: isPageLoading, error, trigger: refetch } = useWebhook<{ assessmentId: string }, { assessment: AssessmentWorkspaceData }>({ 
    eventName: 'ASSESSMENT_GET', 
    payload: { assessmentId: pageParams.id },
    onSuccess: handleDataSuccess
  });

  const { trigger: runAIReview } = useWebhook<{ assessmentId: string }, { assessment: AssessmentWorkspaceData }>({
      eventName: 'ASSESSMENT_RUN_AI_REVIEW',
      manual: true,
      onSuccess: handleDataSuccess,
      errorMessage: "Failed to run AI review. Please try again."
  });

  const { trigger: finalizeAssessment } = useWebhook<{ assessmentId: string }, { assessment: AssessmentWorkspaceData }>({
      eventName: 'ASSESSMENT_FINALIZE',
      manual: true,
      onSuccess: handleDataSuccess,
      errorMessage: "Failed to finalize assessment."
  });
  
  const { trigger: applySuggestion } = useWebhook<{ assessmentId: string, suggestionId: string, action: 'apply' | 'dismiss' }, { newText: string }>({
    eventName: 'ASSESSMENT_APPLY_SUGGESTION',
    manual: true,
    onSuccess: (data) => {
        if (assessmentData) {
            setAssessmentData({ ...assessmentData, currentText: data.newText });
        }
    },
    errorMessage: "Action failed."
  });

  const handleTextSaved = (newText: string) => {
    if (assessmentData) {
        setAssessmentData({ ...assessmentData, currentText: newText });
    }
  };
  
  const handleFeedbackSaved = (feedback: { teacherNotes: string; finalFeedback: string }) => {
      if(assessmentData) {
          setAssessmentData({
              ...assessmentData,
              teacherFeedback: feedback
          });
      }
  };

  const handleRunAI = () => {
    if (assessmentData) {
        runAIReview({ assessmentId: assessmentData.id });
    }
  };
  
  const handleFinalize = () => {
    if (assessmentData) {
        finalizeAssessment({ assessmentId: assessmentData.id });
    }
  };

  if (isPageLoading) return <AssessmentWorkspaceSkeleton />;
  
  if (error || !assessmentData) {
    return (
         <div className="p-6">
            <div className="mb-4">
                <Button asChild variant="outline" size="sm">
                    <Link href="/teacher/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Link>
                </Button>
            </div>
            <Alert variant="destructive">
                <X className="h-4 w-4" />
                <AlertTitle>Failed to load workspace</AlertTitle>
                <AlertDescription>
                    There was an error fetching data for this assessment.
                    <div className="mt-4">
                        <Button variant="destructive" onClick={() => refetch()}>Try Again</Button>
                    </div>
                </AlertDescription>
            </Alert>
        </div>
    );
  }

  return (
    <div className="w-full">
      <WorkspaceHeader data={assessmentData} onRunAI={handleRunAI} onFinalize={handleFinalize} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-3">
          <InputPanel assessment={assessmentData} onTextSaved={handleTextSaved} />
        </div>
        <div className="lg:col-span-5">
          <DocumentPanel text={assessmentData.currentText || ''} suggestions={assessmentData.aiReview?.suggestions || []} onApplySuggestion={(suggestionId, action) => applySuggestion({assessmentId: assessmentData.id, suggestionId, action})} />
        </div>
        <div className="lg:col-span-4">
          <ReviewPanel assessment={assessmentData} onApplySuggestion={(suggestionId, action) => applySuggestion({assessmentId: assessmentData.id, suggestionId, action})} onSaveFeedback={handleFeedbackSaved} />
        </div>
      </div>
    </div>
  );
}
