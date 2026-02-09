import type { WebhookRequest, WebhookResponse, StudentListItem, StudentCreatePayload, AssessmentWorkspaceData } from './events';
import { studentListData as initialStudentData, getStudentById, assessmentWorkspaceData, fullAssessment, aiSuggestions, rubricDraft } from './placeholder-data';

let students: StudentListItem[] = [...initialStudentData];
let currentAssessmentState: AssessmentWorkspaceData = { ...assessmentWorkspaceData };

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

const getStudent = (payload: { studentId: string }) => {
    const student = getStudentById(payload.studentId);
    if (!student) return null;
    
    const { avatarUrl, lastAssessmentDate, status, ...profileData } = student;
    return { student: profileData };
}

const getStudentAssessments = (payload: { studentId: string }) => {
    return { assessments: fullAssessment.studentAssessments };
}

const getStudentReports = (payload: { studentId: string }) => {
    return { reports: fullAssessment.studentReports };
}


const createStudent = (payload: StudentCreatePayload) => {
    const newStudent: StudentListItem = {
        id: `stu_${crypto.randomUUID()}`,
        name: payload.fullName,
        class: payload.className,
        studentIdNumber: payload.studentIdNumber,
        avatarUrl: `https://picsum.photos/seed/new${students.length + 1}/100/100`,
        lastAssessmentDate: null,
        status: 'No Assessments',
    };
    students.unshift(newStudent);
    return { studentId: newStudent.id };
}

// --- Assessment Workspace Handlers ---
const getAssessment = (payload: { assessmentId: string }) => {
    // If the ID is 'new', reset to the draft state.
    if (payload.assessmentId === 'asm_new_id_123' && currentAssessmentState.id !== 'asm_new_id_123') {
        currentAssessmentState = {
            id: "asm_new_id_123",
            title: "Unit 5 Reading Comprehension",
            status: "draft",
            student: { id: "stu_01", name: "Amelia Johnson" },
            currentText: null,
            uploads: [],
            aiReview: null,
            teacherFeedback: null,
        };
    } else {
        // Return full assessment for a known ID
        if (payload.assessmentId === assessmentWorkspaceData.id && !currentAssessmentState.currentText) {
             currentAssessmentState = { ...assessmentWorkspaceData };
        }
    }
    return { assessment: currentAssessmentState };
};

const saveAssessmentText = (payload: { assessmentId: string, text: string }) => {
    currentAssessmentState.currentText = payload.text;
    return {};
}

const extractText = (payload: { assessmentId: string, fileRef: string }) => {
    return { extractedText: `This is sample OCR text extracted from ${payload.fileRef}. It may contane some errors for the techer to fix. For example, speling mistakes or formatting isues.` };
}

const runAIReview = (payload: { assessmentId: string }) => {
    currentAssessmentState.status = 'ai_draft_ready';
    currentAssessmentState.aiReview = {
        status: 'ready',
        suggestions: aiSuggestions,
        rubricDraft: rubricDraft,
    }
    return { assessment: currentAssessmentState };
}

const finalizeAssessment = (payload: { assessmentId: string }) => {
    currentAssessmentState.status = 'finalized';
    return { assessment: currentAssessmentState };
}

const applySuggestion = (payload: { assessmentId: string; suggestionId: string, action: 'apply' | 'dismiss' }) => {
    const suggestion = currentAssessmentState.aiReview?.suggestions.find(s => s.id === payload.suggestionId);
    let newText = currentAssessmentState.currentText || '';
    if (payload.action === 'apply' && suggestion?.replacement && newText) {
        newText = newText.substring(0, suggestion.start) + suggestion.replacement + newText.substring(suggestion.end);
    }
    // Remove suggestion from list
    if(currentAssessmentState.aiReview) {
        currentAssessmentState.aiReview.suggestions = currentAssessmentState.aiReview.suggestions.filter(s => s.id !== payload.suggestionId);
    }
    currentAssessmentState.currentText = newText;
    return { newText };
}

const saveTeacherFeedback = (payload: { assessmentId: string; teacherNotes: string, finalFeedback: string }) => {
    currentAssessmentState.teacherFeedback = {
        notes: payload.teacherNotes,
        finalFeedback: payload.finalFeedback,
    };
    return {};
}


const handlers: { [key: string]: (payload: any) => any } = {
    'GET_DASHBOARD_SUMMARY': () => ({ kpis }),
    'GET_REVIEW_QUEUE': () => ({ items: reviewQueue }),
    'GET_DRAFTS': () => ({ items: drafts }),
    'HEALTH_CHECK': () => healthCheck,
    'STUDENT_LIST': () => studentList(),
    'STUDENT_GET': (payload: { studentId: string }) => getStudent(payload),
    'STUDENT_CREATE': (payload: StudentCreatePayload) => createStudent(payload),
    'STUDENT_ASSESSMENTS_LIST': (payload: { studentId: string }) => getStudentAssessments(payload),
    'STUDENT_REPORTS_LIST': (payload: { studentId: string }) => getStudentReports(payload),

    // Assessment Workspace
    'ASSESSMENT_GET': (payload: { assessmentId: string }) => getAssessment(payload),
    'ASSESSMENT_TEXT_SAVE': saveAssessmentText,
    'ASSESSMENT_EXTRACT_TEXT': extractText,
    'ASSESSMENT_RUN_AI_REVIEW': runAIReview,
    'ASSESSMENT_FINALIZE': finalizeAssessment,
    'ASSESSMENT_APPLY_SUGGESTION': applySuggestion,
    'ASSESSMENT_SAVE_TEACHER_FEEDBACK': saveTeacherFeedback,


    // Action mocks just return success
    'REVIEW_OPEN': () => ({}),
    'DRAFT_OPEN': () => ({}),
    'NEW_ASSESSMENT_START': () => ({}),
    'ASSESSMENT_CREATE_DRAFT': ({ title, studentId }: {title: string, studentId: string}) => ({ assessmentId: `asm_new_id_123` }),
};


export function getMockResponse(body: WebhookRequest): WebhookResponse | null {
  const handler = handlers[body.eventName];
  if (handler) {
    const data = handler(body.payload);
    if (data === null) {
         return {
            success: false,
            error: { message: 'Not found' },
            correlationId: `mock_${crypto.randomUUID()}`,
        };
    }
    return {
      success: true,
      data,
      correlationId: `mock_${crypto.randomUUID()}`,
    };
  }
  return null;
}
