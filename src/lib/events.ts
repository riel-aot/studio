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
  
  // Students
  | 'STUDENT_LIST'
  | 'STUDENT_GET'
  | 'STUDENT_CREATE'

  // Other
  | 'REPORT_GET'
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

// NEW_ASSESSMENT_START
export type NewAssessmentStartPayload = {
    studentId: string;
};

// STUDENT_LIST
export type StudentListItem = {
    id: string;
    name: string;
    class: string;
    avatarUrl: string;
    studentIdNumber: string;
    parentEmail: string;
    lastAssessmentDate: string | null;
    status: 'No Assessments' | 'Draft in Progress' | 'Needs Review' | 'Up to Date';
};
export type GetStudentListData = {
    students: StudentListItem[];
    total: number;
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


// HEALTH_CHECK
export type HealthCheckData = {
    authConfigured: boolean;
    webhookConfigured: boolean;
    databaseConnected: boolean;
    lastSuccessfulCall?: string;
};
