import type { WebhookRequest, WebhookResponse } from './events';

const kpis = {
  pendingReview: 7,
  drafts: 3,
  finalizedThisWeek: 12,
};

const reviewQueue = [
    {
      studentName: 'Amelia Johnson',
      studentId: 'stu_01',
      assessmentName: 'Unit 3: Fractions',
      assessmentId: 'asm_01',
      status: 'pending_review' as const,
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      studentName: 'Benjamin Carter',
      studentId: 'stu_02',
      assessmentName: 'History Mid-Term Essay',
      assessmentId: 'asm_02',
      status: 'ai_draft_ready' as const,
      updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      studentName: 'Charlotte Davis',
      studentId: 'stu_03',
      assessmentName: 'Science Project Proposal',
      assessmentId: 'asm_03',
      status: 'pending_review' as const,
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
];

const drafts = [
    {
      assessmentId: 'asm_draft_01',
      assessmentName: 'Creative Writing Assignment',
      studentName: 'Olivia Martinez',
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      assessmentId: 'asm_draft_02',
      assessmentName: 'Algebra II Quiz',
      studentName: 'Liam Garcia',
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
];

const healthCheck = {
    authConfigured: true,
    webhookConfigured: true,
    databaseConnected: true,
    lastSuccessfulCall: new Date().toISOString(),
};


const handlers: { [key: string]: (payload: any) => any } = {
    'GET_DASHBOARD_SUMMARY': () => ({ kpis }),
    'GET_REVIEW_QUEUE': () => ({ items: reviewQueue }),
    'GET_DRAFTS': () => ({ items: drafts }),
    'HEALTH_CHECK': () => healthCheck,

    // Action mocks just return success
    'REVIEW_OPEN': () => ({}),
    'DRAFT_OPEN': () => ({}),
    'NEW_ASSESSMENT_START': () => ({}),
};


export function getMockResponse(body: WebhookRequest): WebhookResponse | null {
  const handler = handlers[body.eventName];
  if (handler) {
    return {
      success: true,
      data: handler(body.payload),
      correlationId: `mock_${crypto.randomUUID()}`,
    };
  }
  return null;
}
