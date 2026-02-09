import type { UserRole } from './auth';

// As per WEBHOOK_CONTRACT.md

export type EventName =
  | 'GET_DASHBOARD_SUMMARY'
  | 'GET_REVIEW_QUEUE'
  | 'NEW_ASSESSMENT_START'
  | 'ASSESSMENT_CREATE_DRAFT'
  | 'ASSESSMENT_GET'
  | 'ASSESSMENT_FINALIZE'
  | 'STUDENT_LIST'
  | 'STUDENT_GET'
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
export type GetDashboardSummaryPayload = {};
export type GetDashboardSummaryData = {
  kpis: {
    pendingReview: number;
    drafts: number;
    finalizedThisWeek: number;
  };
  reviewQueue: {
    studentName: string;
    studentId: string;
    assessmentName: string;
    assessmentId: string;
    status: 'pending_review';
    updatedAt: string;
  }[];
  drafts: {
    assessmentId: string;
    assessmentName: string;
    studentName: string;
    updatedAt: string;
  }[];
};

// STUDENT_LIST
export type GetStudentListPayload = {
    page?: number;
    limit?: number;
    sortBy?: string;
};
export type StudentListItem = {
    id: string;
    name: string;
    class: string;
    avatarUrl: string;
};
export type GetStudentListData = {
    students: StudentListItem[];
    total: number;
};

// HEALTH_CHECK
export type HealthCheckPayload = {};
export type HealthCheckData = {
    authConfigured: boolean;
    webhookConfigured: boolean;
    databaseConnected: boolean;
    lastSuccessfulCall?: string;
};

// You can continue to define specific types for each event
// For example:
export type AssessmentGetPayload = { assessmentId: string };
// export type AssessmentGetData = { ...full assessment object... };
