'use client';

import React, { useState, useMemo, useCallback, use } from 'react';
import { useWebhook } from '@/lib/hooks';
import type { AssessmentWorkspaceData, AISuggestion, RubricCriterion, RubricListItem } from '@/lib/events';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, ChevronDown, FileText, ImageIcon, Loader2, Sparkles, X, Lock } from 'lucide-react';
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
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
    
    const showRunAI = data.status === 'draft' && !!data.currentText && !!data.rubricId;
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
                    {showRunAI && <Button onClick={onRunAI}><Sparkles className="mr-2 h-4 w-4" /> Run AI Grading</Button>}
                    {showFinalize && <Button onClick={() => setIsFinalizeOpen(true)}><CheckCircle className="mr-2 h-4 w-4" /> Finalize Assessment</Button>}
                </div>
            </div>
        </div>
        </>
    );
}

function SetupInputPanel({ 
    assessment, 
    rubrics,
    onRubricSelected,
    onTextSaved,
    onTextExtracted
}: { 
    assessment: AssessmentWorkspaceData, 
    rubrics: RubricListItem[],
    onRubricSelected: (rubricId: string) => void,
    onTextSaved: (text: string, source: 'typed' | 'handwritten_extracted') => void,
    onTextExtracted: (text: string) => void
}) {
    const [text, setText] = useState(assessment.currentText || '');
    const [files, setFiles] = useState<File[]>([]);
    
    const { trigger: setRubric, isLoading: isSettingRubric } = useWebhook<{ assessmentId: string; rubricId: string }, {}>({
        eventName: 'ASSESSMENT_SET_RUBRIC',
        manual: true,
        onSuccess: (_, payload) => payload && onRubricSelected(payload.rubricId),
        errorMessage: "Failed to set rubric."
    });

    const { trigger: saveText, isLoading: isSaving } = useWebhook<{ assessmentId: string; text: string; source: 'typed' | 'handwritten_extracted' }, {}>({
        eventName: 'ASSESSMENT_TEXT_SAVE',
        manual: true,
        onSuccess: (_, payload) => payload && onTextSaved(payload.text, payload.source),
        errorMessage: "Failed to save text."
    });

    const { trigger: extractText, isLoading: isExtracting } = useWebhook<{ assessmentId: string; fileRef: string }, { extractedText: string }>({
        eventName: 'ASSESSMENT_EXTRACT_TEXT',
        manual: true,
        onSuccess: (data) => {
            setText(data.extractedText);
            onTextExtracted(data.extractedText);
        },
        errorMessage: 'Failed to extract text from image.'
    });

    const { trigger: lockAndSend, isLoading: isLocking } = useWebhook<{ assessmentId: string }, { assessment: AssessmentWorkspaceData }>({
        eventName: 'ASSESSMENT_RUN_AI_GRADE',
        manual: true,
        // The main page handler will update the state
    });

    const isFinalized = assessment.status === 'finalized';
    const isTypedTextLocked = assessment.source === 'typed' && !!assessment.currentText;
    const isHandwrittenTextLocked = assessment.aiReview?.status === 'ready' || assessment.aiReview?.status === 'running';

    const selectedRubricName = useMemo(() => {
        return rubrics.find(r => r.id === assessment.rubricId)?.name;
    }, [rubrics, assessment.rubricId]);

    return (
        <div className="h-full rounded-lg bg-card p-4 border flex flex-col">
            <h3 className="text-lg font-semibold mb-1">Setup & Input</h3>
            <p className="text-sm text-muted-foreground mb-4">Select rubric and provide student work.</p>
            
            <div className='space-y-4'>
                {/* Rubric Selection */}
                <div className="space-y-2">
                    <Label htmlFor="rubric">Rubric</Label>
                    <Select 
                        name="rubric" 
                        required 
                        onValueChange={(rubricId) => setRubric({ assessmentId: assessment.id, rubricId })}
                        value={assessment.rubricId || ''}
                        disabled={isSettingRubric || isFinalized}
                    >
                        <SelectTrigger id="rubric" disabled={isSettingRubric || isFinalized}>
                            <SelectValue placeholder={isSettingRubric ? "Saving..." : (selectedRubricName || "Select a rubric")} />
                        </SelectTrigger>
                        <SelectContent>
                            {rubrics.map(rubric => (
                                <SelectItem key={rubric.id} value={rubric.id}>
                                    {rubric.name} (v{rubric.version})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Separator />
            
                {/* Submission Input */}
                <Tabs defaultValue="typed">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="typed" disabled={isFinalized}><FileText className="mr-2 h-4 w-4" /> Typed</TabsTrigger>
                        <TabsTrigger value="handwritten" disabled={isFinalized}><ImageIcon className="mr-2 h-4 w-4" /> Handwritten</TabsTrigger>
                    </TabsList>
                    <TabsContent value="typed" className="pt-4">
                        <div className="space-y-4">
                            {!isTypedTextLocked ? (
                                <>
                                    <FileUploader onFilesSelected={setFiles} />
                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or</span></div>
                                    </div>
                                    <Textarea 
                                        placeholder="Paste student's text here..." 
                                        className="h-48"
                                        value={text}
                                        onChange={(e) => setText(e.target.value)}
                                    />
                                    <Button onClick={() => saveText({ assessmentId: assessment.id, text, source: 'typed' })} disabled={isSaving || !text}>
                                        {isSaving ? <Loader2 className="animate-spin mr-2" /> : null} Save Typed Submission
                                    </Button>
                                </>
                            ) : (
                                <div className="p-4 border rounded-md bg-muted/50 text-sm">
                                    <p className="font-semibold text-foreground flex items-center"><Lock className="mr-2 h-4 w-4" /> Text Locked</p>
                                    <p className="text-muted-foreground mt-1">Typed submissions are read-only once saved to ensure grading consistency.</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>
                    <TabsContent value="handwritten" className="pt-4">
                         <div className="space-y-4">
                            {!assessment.currentText && <FileUploader onFilesSelected={setFiles} acceptedFileTypes={{'image/*': ['.jpeg', '.png'], 'application/pdf': ['.pdf']}} />}
                            {files.length > 0 && !assessment.currentText && (
                                <Button onClick={() => extractText({ assessmentId: assessment.id, fileRef: files[0].name })} disabled={isExtracting}>
                                    {isExtracting ? <Loader2 className="animate-spin mr-2" /> : null} Extract Text
                                </Button>
                            )}
                            {assessment.currentText && (
                                <>
                                <Textarea 
                                    placeholder="Extracted text will appear here. You can edit it before running the AI review." 
                                    className="h-48"
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    readOnly={isFinalized || isHandwrittenTextLocked}
                                />
                                {!isHandwrittenTextLocked && (
                                    <div className='flex flex-wrap gap-2'>
                                        <Button onClick={() => saveText({ assessmentId: assessment.id, text, source: 'handwritten_extracted' })} disabled={isSaving}>
                                            {isSaving ? <Loader2 className="animate-spin mr-2" /> : null} Save Extracted Text
                                        </Button>
                                         <Button onClick={() => lockAndSend({ assessmentId: assessment.id })} disabled={isLocking || !assessment.rubricId} variant="secondary">
                                            {isLocking ? <Loader2 className="animate-spin mr-2" /> : <Lock className="mr-2 h-4 w-4" />} Lock & Send to AI
                                        </Button>
                                    </div>
                                )}
                                {isHandwrittenTextLocked && (
                                    <div className="p-4 border rounded-md bg-muted/50 text-sm">
                                        <p className="font-semibold text-foreground flex items-center"><Lock className="mr-2 h-4 w-4" /> Text Locked</p>
                                        <p className="text-muted-foreground mt-1">Text is now read-only and is being reviewed by the AI.</p>
                                    </div>
                                )}
                                {!assessment.rubricId && !isHandwrittenTextLocked &&
                                    <Alert variant="destructive" className="text-xs">
                                        <AlertDescription>Please select a rubric before sending to AI.</AlertDescription>
                                    </Alert>
                                }
                                </>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

function StudentDocumentPanel({ text, suggestions, onApplySuggestion }: { text: string; suggestions: AISuggestion[]; onApplySuggestion: (suggestionId: string, action: 'apply' | 'dismiss') => void; }) {
    
    const getSeverityClass = (severity: AISuggestion['severity']) => {
        const baseClass = "cursor-pointer rounded px-0.5";
        switch(severity) {
            case 'Major': return `${baseClass} bg-yellow-300/60 hover:bg-yellow-300/90`;
            case 'Moderate': return `${baseClass} bg-yellow-200/60 hover:bg-yellow-200/90 underline decoration-dotted`;
            case 'Minor':
            default:
                return `${baseClass} bg-yellow-100/60 hover:bg-yellow-100/90 underline decoration-dashed`;
        }
    }

    const processedText = useMemo(() => {
        if (!suggestions || suggestions.length === 0) {
            return <p>{text}</p>;
        }

        let lastIndex = 0;
        const parts: React.ReactNode[] = [];
        const sortedSuggestions = [...suggestions].sort((a, b) => a.start - b.start);

        sortedSuggestions.forEach((suggestion) => {
            if (suggestion.start > lastIndex) {
                parts.push(text.substring(lastIndex, suggestion.start));
            }
            const highlightedText = text.substring(suggestion.start, suggestion.end);
            
            parts.push(
                <Popover key={suggestion.id}>
                    <PopoverTrigger asChild>
                        <mark className={getSeverityClass(suggestion.severity)}>
                            {highlightedText}
                        </mark>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <h4 className="font-medium leading-none">{suggestion.criterionName}</h4>
                                <p className="text-sm text-muted-foreground">{suggestion.comment}</p>
                            </div>
                            {suggestion.replacement && (
                                <div className="rounded-md border bg-muted p-2">
                                    <p className="text-sm">Suggest: <span className="font-semibold">{suggestion.replacement}</span></p>
                                </div>
                            )}
                            <div className="flex gap-2">
                                {suggestion.replacement && <Button size="sm" onClick={() => onApplySuggestion(suggestion.id, 'apply')}>Accept</Button>}
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

        return <p>{parts}</p>;
    }, [text, suggestions, onApplySuggestion]);
    
    return (
        <div className="h-full rounded-lg bg-card p-4 border flex flex-col">
            <h3 className="text-lg font-semibold mb-1">Student Document</h3>
            <p className="text-sm text-muted-foreground mb-4">The official text for grading.</p>
            <div className="prose prose-sm max-w-none rounded-md border p-4 h-full overflow-y-auto bg-background">
                {text ? processedText : <p className="text-muted-foreground">Student work will appear here once saved from the left panel.</p>}
            </div>
        </div>
    );
}

function GradingPanel({ assessment, onSaveFeedback, onSaveOverride }: { assessment: AssessmentWorkspaceData; onSaveFeedback: (feedback: { notes: string; finalFeedback: string }) => void; onSaveOverride: (overrides: any) => void; }) {
    const [teacherNotes, setTeacherNotes] = useState(assessment.teacherFeedback?.notes || '');
    const [finalFeedback, setFinalFeedback] = useState(assessment.teacherFeedback?.finalFeedback || '');
    
    const { trigger: saveFeedback, isLoading: isSavingFeedback } = useWebhook<{ assessmentId: string; teacherNotes: string; finalFeedback: string }, {}>({
        eventName: 'ASSESSMENT_SAVE_TEACHER_FEEDBACK',
        manual: true,
        errorMessage: 'Failed to save feedback.',
        onSuccess: () => onSaveFeedback({ notes: teacherNotes, finalFeedback })
    });

    const isFinalized = assessment.status === 'finalized';

    return (
        <div className="h-full rounded-lg bg-card p-4 border flex flex-col">
             <h3 className="text-lg font-semibold mb-1">Rubric Grading & Approval</h3>
            <p className="text-sm text-muted-foreground mb-4">Review AI grades and provide final feedback.</p>
            
            <div className='h-full overflow-y-auto pr-2 space-y-6'>
                {/* Rubric Grades */}
                <div className='space-y-4'>
                    <h4 className='font-semibold'>Rubric Grades (AI Draft)</h4>
                    {assessment.aiReview?.rubricGrades ? (
                        assessment.aiReview.rubricGrades.map(criterion => (
                            <div key={criterion.id} className='p-3 border rounded-md'>
                                <div className='flex justify-between items-start'>
                                    <h5 className="font-semibold">{criterion.criterionName}</h5>
                                    <Badge>AI Score: {criterion.suggestedLevelOrScore}</Badge>
                                </div>
                                <p className="text-xs italic text-muted-foreground mt-1">&quot;{criterion.rationale}&quot;</p>
                                <div className='mt-3 space-y-2'>
                                    <Label className='text-xs'>Teacher Override</Label>
                                    <div className='flex gap-2'>
                                        <Select disabled={isFinalized}>
                                            <SelectTrigger><SelectValue placeholder="Score" /></SelectTrigger>
                                            <SelectContent>
                                                {[...Array(6).keys()].map(i => <SelectItem key={i} value={String(i)}>{i}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <Input placeholder="Note for this criterion..." className='text-xs' disabled={isFinalized}/>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : <p className="text-sm text-muted-foreground text-center pt-4">No rubric draft available. Run AI grading first.</p>}
                     {!isFinalized && assessment.aiReview?.rubricGrades && (
                        <Button size="sm" variant="secondary" disabled={true}>Save Overrides</Button>
                     )}
                </div>

                <Separator />

                {/* Final Feedback */}
                <div className="space-y-4">
                     <h4 className='font-semibold'>Final Feedback</h4>
                    <div className="space-y-2">
                        <Label htmlFor="teacher-notes">Teacher Notes (Private)</Label>
                        <Textarea id="teacher-notes" value={teacherNotes} onChange={e => setTeacherNotes(e.target.value)} readOnly={isFinalized} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="final-feedback">Final Feedback for Student</Label>
                        <Textarea id="final-feedback" value={finalFeedback} onChange={e => setFinalFeedback(e.target.value)} readOnly={isFinalized}/>
                    </div>
                    {!isFinalized && (
                        <Button onClick={() => saveFeedback({assessmentId: assessment.id, teacherNotes, finalFeedback})} disabled={isSavingFeedback}>
                            {isSavingFeedback ? <Loader2 className="animate-spin mr-2" /> : null} Save Feedback
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

// --- Main Page Component ---

export default function AssessmentWorkspacePage({ params }: { params: { id: string } }) {
  const [assessmentData, setAssessmentData] = useState<AssessmentWorkspaceData | null>(null);
  const pageParams = use(params);

  const {data: rubricsData, isLoading: rubricsLoading} = useWebhook<{}, { rubrics: RubricListItem[] }>({
      eventName: 'RUBRIC_LIST',
      payload: {},
  });

  const handleDataSuccess = useCallback((data: { assessment: AssessmentWorkspaceData }) => {
    setAssessmentData(data.assessment);
  }, []);

  const { isLoading: isPageLoading, error, trigger: refetch } = useWebhook<{ assessmentId: string }, { assessment: AssessmentWorkspaceData }>({ 
    eventName: 'ASSESSMENT_GET', 
    payload: { assessmentId: pageParams.id },
    onSuccess: handleDataSuccess
  });

  const { trigger: runAIGrade } = useWebhook<{ assessmentId: string }, { assessment: AssessmentWorkspaceData }>({
      eventName: 'ASSESSMENT_RUN_AI_GRADE',
      manual: true,
      onSuccess: handleDataSuccess,
      errorMessage: "Failed to run AI grading. Please try again."
  });

  const { trigger: finalizeAssessment } = useWebhook<{ assessmentId: string }, { assessment: AssessmentWorkspaceData }>({
      eventName: 'ASSESSMENT_FINALIZE',
      manual: true,
      onSuccess: handleDataSuccess,
      errorMessage: "Failed to finalize assessment."
  });
  
  const { trigger: applySuggestion } = useWebhook<{ assessmentId: string, suggestionId: string, action: 'apply' | 'dismiss' }, { newText: string }>({
    eventName: 'ASSESSMENT_SUGGESTION_ACTION',
    manual: true,
    onSuccess: (data) => {
        if (assessmentData) {
            setAssessmentData({ ...assessmentData, currentText: data.newText });
        }
    },
    errorMessage: "Action failed."
  });

  const handleTextSaved = (newText: string, source: 'typed' | 'handwritten_extracted') => {
    if (assessmentData) {
        setAssessmentData({ ...assessmentData, currentText: newText, source });
    }
  };
  
  const handleFeedbackSaved = (feedback: { notes: string; finalFeedback: string }) => {
      if(assessmentData) {
          setAssessmentData({
              ...assessmentData,
              teacherFeedback: feedback
          });
      }
  };

  const handleRunAI = () => {
    if (assessmentData) {
        runAIGrade({ assessmentId: assessmentData.id });
    }
  };
  
  const handleFinalize = () => {
    if (assessmentData) {
        finalizeAssessment({ assessmentId: assessmentData.id });
    }
  };

  const handleRubricSelected = (rubricId: string) => {
      if(assessmentData) {
        setAssessmentData({ ...assessmentData, rubricId });
      }
  }

  const handleTextExtracted = (newText: string) => {
    if (assessmentData) {
        setAssessmentData({ ...assessmentData, currentText: newText, source: "handwritten_extracted" });
    }
  }

  if (isPageLoading || rubricsLoading) return <AssessmentWorkspaceSkeleton />;
  
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

      <div className="flex gap-6 h-[80vh]">
        {/* Left Rail */}
        <div className="w-[320px] shrink-0">
          <SetupInputPanel 
            assessment={assessmentData}
            rubrics={rubricsData?.rubrics || []}
            onRubricSelected={handleRubricSelected}
            onTextSaved={handleTextSaved}
            onTextExtracted={handleTextExtracted}
          />
        </div>
        {/* Center Panel */}
        <div className="flex-1 min-w-0">
          <StudentDocumentPanel text={assessmentData.currentText || ''} suggestions={assessmentData.aiReview?.suggestions || []} onApplySuggestion={(suggestionId, action) => applySuggestion({assessmentId: assessmentData.id, suggestionId, action})} />
        </div>
        {/* Right Rail */}
        <div className="w-[360px] shrink-0">
          <GradingPanel assessment={assessmentData} onSaveFeedback={handleFeedbackSaved} onSaveOverride={() => {}} />
        </div>
      </div>
    </div>
  );
}
