import type { UserRole } from './auth';

export type EventName =
  // Dashboard
  | 'GET_DASHBOARD_SUMMARY'
  | 'GET_REVIEW_QUEUE'
  | 'GET_DRAFTS'
  | 'REVIEW_OPEN'
  | 'DRAFT_OPEN'
  
  // Assessments
  | 'NEW_ASSESSMENT_START'
  | 'ASSESSMENT_CREATE_DRAFT'
  | 'ASSESSMENT_GET'
  | 'ASSESSMENT_FINALIZE'
  | 'ASSESSMENT_TYPED_UPLOAD'
  | 'ASSESSMENT_EXTRACT_TEXT'
  | 'ASSESSMENT_TEXT_UPDATE'
  | 'ASSESSMENT_RUN_AI_GRADE'
  | 'ASSESSMENT_SUGGESTION_ACTION'
  | 'ASSESSMENT_SAVE_TEACHER_FEEDBACK'
  | 'ASSESSMENT_SET_RUBRIC'
  | 'ASSESSMENT_SAVE_RUBRIC_OVERRIDE'
  | 'ASSESSMENT_LIST'
  
  // Students
  | 'STUDENT_LIST'
  | 'STUDENT_GET'
  | 'STUDENT_CREATE'
  | 'STUDENT_ASSESSMENTS_LIST'
  | 'STUDENT_REPORTS_LIST'
  | 'STUDENT_IMPORT_PROCESS'

  // Rubrics
  | 'RUBRIC_LIST'

  // Reports
  | 'REPORTS_LIST'
  | 'REPORT_GET'
  | 'REPORT_GENERATE'
  | 'REPORT_SEND'
  | 'REPORT_DOWNLOAD_PDF'

  // Other
  | 'HEALTH_CHECK';

export interface WebhookRequest<T = Record<string, any>> {
  eventName: EventName;
  requestId: string;
  timestamp: string;
  actor: {
    role: UserRole;
    userId: string;
  };
  payload: T;
}

export interface WebhookResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
  correlationId: string;
}

// --- Specific Payload and Data types ---

// GET_DASHBOARD_SUMMARY
export type DashboardKpis = {
  pendingReview: number;
  drafts: number;
  finalizedThisWeek: number;
};

// GET_REVIEW_QUEUE
export type ReviewQueueItem = {
  studentName: string;
  studentId: string;
  assessmentName: string;
  assessmentId: string;
  status: 'pending_review' | 'ai_draft_ready';
  updatedAt: string;
};

// GET_DRAFTS
export type DraftItem = {
  assessmentId: string;
  assessmentName: string;
  studentName: string;
  updatedAt: string;
};

// RUBRIC_LIST
export type RubricListItem = {
    id: string;
    name: string;
    version: string;
};


// STUDENT_LIST
export type StudentListItem = {
    id: string;
    name: string;
    class: string;
    avatarUrl: string;
    studentIdNumber: string;
    lastAssessmentDate: string | null;
    status: 'No Assessments' | 'Draft in Progress' | 'Needs Review' | 'Up to Date';
};
export type GetStudentListData = {
    students: StudentListItem[];
    total: number;
};

// STUDENT_GET
export type StudentProfileData = {
    id: string;
    name: string;
    class: string;
    studentIdNumber: string;
    studentEmail: string | null;
    parentEmail: string;
};

// STUDENT_ASSESSMENTS_LIST
export type StudentAssessmentListItem = {
    id: string;
    name: string;
    type: 'Writing' | 'Reading' | 'Math' | 'Science' | 'EAL';
    status: 'Draft' | 'AI Draft Ready' | 'Needs Review' | 'Finalized';
    updatedAt: string;
};

// STUDENT_REPORTS_LIST
export type StudentReportListItem = {
    id: string;
    name: string;
    generatedDate: string;
    status: 'Draft' | 'Final';
};

// STUDENT_CREATE
export type StudentCreatePayload = {
    fullName: string;
    studentIdNumber: string;
    className: string;
    studentEmail?: string;
    parentEmail: string;
};
export type StudentCreateResponse = {
    studentId: string;
};

// ASSESSMENT_GET & related
export type AISuggestion = {
    id: string;
    start: number;
    end: number;
    criterionName: string;
    severity: 'Minor' | 'Moderate' | 'Major';
    comment: string;
    replacement?: string;
};

export type RubricGrade = {
    id: string;
    criterionId: string;
    criterionName: string;
    suggestedLevelOrScore: number;
    rationale: string;
    evidenceRefs?: string[];
}

export type AssessmentWorkspaceData = {
    id: string;
    title: string;
    status: 'draft' | 'ai_draft_ready' | 'needs_review' | 'finalized';
    rubricId: string | null;
    student: {
        id: string;
        name: string;
    };
    source: 'typed' | 'handwritten_extracted' | null;
    currentText: string | null;
    uploads: { id: string, fileName: string, type: 'typed' | 'handwritten' }[];
    aiReview: {
        status: 'idle' | 'running' | 'ready' | 'error';
        suggestions: AISuggestion[];
        rubricGrades: RubricGrade[];
    } | null;
    teacherFeedback: {
        notes: string;
        finalFeedback: string;
    } | null;
    teacherOverrides: {
        [criterionId: string]: {
            score: number;
            note: string;
        }
    } | null;
};


// HEALTH_CHECK
export type HealthCheckData = {
    authConfigured: boolean;
    webhookConfigured: boolean;
    databaseConnected: boolean;
    lastSuccessfulCall?: string;
};

// ASSESSMENT_LIST
export type AssessmentStatus = 'draft' | 'ai_draft_ready' | 'needs_review' | 'finalized';

export interface AssessmentListItem {
  assessmentId: string;
  title: string;
  student: { id: string; name: string };
  classLabel: string;
  submissionType: 'typed' | 'handwritten';
  rubric: { id: string; name: string };
  status: AssessmentStatus;
  updatedAt: string;
}

export interface AssessmentListCounts {
  needsReview: number;
  drafts: number;
  finalizedThisWeek: number;
}

export interface AssessmentListPayload {
  status?: AssessmentStatus | 'all';
  classId?: string;
  rubricId?: string;
  submissionType?: 'typed' | 'handwritten';
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface AssessmentListResponse {
  items: AssessmentListItem[];
  counts: AssessmentListCounts;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}

// REPORTS
export interface ReportListItem {
    reportId: string;
    studentName: string;
    periodLabel: string;
    generatedAt: string;
    status: 'Queued' | 'Generated' | 'Sent' | 'Failed';
    hasPdf: boolean;
    delivery: {
        portal: boolean;
        email: boolean;
    };
}

export interface ReportListResponse {
    items: ReportListItem[];
    pagination: {
        page: number;
        pageSize: number;
        total: number;
    };
}

export interface ReportGeneratePayload {
    studentId: string;
    period: {
        preset?: 'last_30' | 'this_month';
        startDate?: string;
        endDate?: string;
    };
    include: {
        summary: boolean;
        rubricBreakdown: boolean;
        teacherNotes: boolean;
    };
    delivery: {
        portal: boolean;
        email: boolean;
        pdf: boolean;
    };
}

export interface ReportData {
    id: string;
    studentName: string;
    periodLabel: string;
    generatedAt: string;
    summary: string;
    strengths: string[];
    growthAreas: string[];
    rubricSnapshot: {
        criterion: string;
        averageScore: number;
        trend: 'up' | 'down' | 'stable';
    }[];
    teacherFinalComment: string;
    includedAssessmentsCount: number;
}
