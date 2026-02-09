import type { WebhookRequest, WebhookResponse, StudentListItem, StudentCreatePayload } from './events';
import { studentListData as initialStudentData } from './placeholder-data';

let students: StudentListItem[] = [...initialStudentData];

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

const studentList = () => ({
    students: students,
    total: students.length,
});

const createStudent = (payload: StudentCreatePayload) => {
    const newStudent: StudentListItem = {
        id: `stu_${crypto.randomUUID()}`,
        name: payload.fullName,
        class: payload.className,
        studentIdNumber: payload.studentIdNumber,
        parentEmail: payload.parentEmail,
        avatarUrl: `https://picsum.photos/seed/new${students.length + 1}/100/100`,
        lastAssessmentDate: null,
        status: 'No Assessments',
    };
    students.unshift(newStudent); // Add to the beginning of the list
    return { studentId: newStudent.id };
}


const handlers: { [key: string]: (payload: any) => any } = {
    'GET_DASHBOARD_SUMMARY': () => ({ kpis }),
    'GET_REVIEW_QUEUE': () => ({ items: reviewQueue }),
    'GET_DRAFTS': () => ({ items: drafts }),
    'HEALTH_CHECK': () => healthCheck,
    'STUDENT_LIST': () => studentList(),
    'STUDENT_CREATE': (payload: StudentCreatePayload) => createStudent(payload),

    // Action mocks just return success
    'REVIEW_OPEN': () => ({}),
    'DRAFT_OPEN': () => ({}),
    'NEW_ASSESSMENT_START': () => ({}),
    'ASSESSMENT_CREATE_DRAFT': ({ title, studentId }: {title: string, studentId: string}) => ({ assessmentId: `asm_draft_${crypto.randomUUID()}` }),
};


export function getMockResponse(body: WebhookRequest): WebhookResponse | null {
  const handler = handlers[body.eventName];
  if (handler) {
    // Simulate a network delay
    // await new Promise(resolve => setTimeout(resolve, 500));
    return {
      success: true,
      data: handler(body.payload),
      correlationId: `mock_${crypto.randomUUID()}`,
    };
  }
  return null;
}
