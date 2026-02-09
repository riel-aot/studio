import type { WebhookRequest, WebhookResponse, StudentListItem, StudentCreatePayload, AssessmentWorkspaceData, RubricListItem, AssessmentListPayload, ReportListItem, ReportGeneratePayload, ReportData, ParentChildrenListResponse, ParentChild, ParentReportsListPayload, ParentReportData } from './events';
import { studentListData as initialStudentData, getStudentById, assessmentWorkspaceData as initialAssessmentData, fullAssessment, aiSuggestions, rubricGrades, mockRubrics, assessmentListItems, reportListItems, fullReportData } from './placeholder-data';

let students: StudentListItem[] = [...initialStudentData];
let reports: ReportListItem[] = [...reportListItems];
let currentAssessmentState: AssessmentWorkspaceData = { ...initialAssessmentData };

const parentChildMap: { [parentId: string]: string[] } = {
    'parent-01': ['stu_01'], // John Doe is parent of Amelia Johnson
};

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

// --- Assessment Handlers ---

const listAssessments = (payload: AssessmentListPayload) => {
  const { status = 'all', page = 1, pageSize = 10, search = '' } = payload;
  
  let filteredItems = assessmentListItems;

  if (status !== 'all') {
    filteredItems = filteredItems.filter(item => item.status === status);
  }

  if (search) {
      const lowercasedSearch = search.toLowerCase();
      filteredItems = filteredItems.filter(item => 
          item.title.toLowerCase().includes(lowercasedSearch) ||
          item.student.name.toLowerCase().includes(lowercasedSearch) ||
          item.rubric.name.toLowerCase().includes(lowercasedSearch)
      );
  }

  const total = filteredItems.length;
  const items = filteredItems.slice((page - 1) * pageSize, page * pageSize);

  return {
    items,
    counts: {
      needsReview: assessmentListItems.filter(i => i.status === 'needs_review').length,
      drafts: assessmentListItems.filter(i => i.status === 'draft').length,
      finalizedThisWeek: assessmentListItems.filter(i => i.status === 'finalized' && new Date(i.updatedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
    },
    pagination: {
      page,
      pageSize,
      total,
    },
  };
};

const getAssessment = (payload: { assessmentId: string }) => {
    // If the ID is 'new', reset to the draft state.
    if (payload.assessmentId.startsWith('asm_new_')) {
        // State is set by ASSESSMENT_CREATE_DRAFT
    } else if (payload.assessmentId !== currentAssessmentState.id) {
         currentAssessmentState = { ...initialAssessmentData, id: payload.assessmentId };
    }
    return { assessment: currentAssessmentState };
};

const setAssessmentRubric = (payload: { assessmentId: string, rubricId: string }) => {
    currentAssessmentState.rubricId = payload.rubricId;
    return { assessmentId: payload.assessmentId, rubricId: payload.rubricId };
}

const updateAssessmentText = (payload: { assessmentId: string, text: string, source: 'handwritten_extracted' }) => {
    currentAssessmentState.currentText = payload.text;
    currentAssessmentState.source = payload.source;
    return { assessmentId: payload.assessmentId, text: payload.text };
}

const uploadTypedFile = (payload: { assessmentId: string, fileRef: string }) => {
    currentAssessmentState.source = 'typed';
    currentAssessmentState.currentText = `This is sample text extracted from the typed document: ${payload.fileRef}. Once saved, this text becomes read-only to ensure grading consistency against a single version of the student's work. The AI review process will begin automatically.`;
    currentAssessmentState.uploads.push({ id: `up_${crypto.randomUUID()}`, fileName: payload.fileRef, type: 'typed' });
    
    // Simulate AI Grading after upload
    currentAssessmentState.status = 'ai_draft_ready';
    currentAssessmentState.aiReview = {
        status: 'ready',
        suggestions: aiSuggestions,
        rubricGrades: rubricGrades,
    };
    return { assessment: currentAssessmentState };
}

const extractText = (payload: { assessmentId: string, fileRef: string }) => {
    currentAssessmentState.source = 'handwritten_extracted';
    currentAssessmentState.currentText = `This is sample OCR text extracted from ${payload.fileRef}. It may contane some errors for the techer to fix. For example, speling mistakes or formatting isues. Please review and correct the text before locking it for AI grading.`;
    currentAssessmentState.uploads.push({ id: `up_${crypto.randomUUID()}`, fileName: payload.fileRef, type: 'handwritten' });
    return { assessment: currentAssessmentState };
}

const runAIGrade = (payload: { assessmentId: string }) => {
    currentAssessmentState.status = 'ai_draft_ready';
    currentAssessmentState.aiReview = {
        status: 'ready',
        suggestions: [...aiSuggestions], // Return a copy
        rubricGrades: [...rubricGrades],
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
    currentAssessmentState.currentText = newText;
    
    if(currentAssessmentState.aiReview) {
        currentAssessmentState.aiReview.suggestions = currentAssessmentState.aiReview.suggestions.filter(s => s.id !== payload.suggestionId);
    }
    return { newText };
}

const saveTeacherFeedback = (payload: { assessmentId: string; teacherNotes: string, finalFeedback: string }) => {
    currentAssessmentState.teacherFeedback = {
        notes: payload.teacherNotes,
        finalFeedback: payload.finalFeedback,
    };
    return {};
}

const saveRubricOverrides = (payload: { assessmentId: string; overrides: any }) => {
    currentAssessmentState.teacherOverrides = payload.overrides;
    return { overrides: payload.overrides };
}

// --- Report Handlers ---
const listReports = () => {
    return {
        items: reports,
        pagination: { page: 1, pageSize: 20, total: reports.length },
    };
};

const getReport = (payload: { reportId: string }): { report: ReportData } => {
    return { report: fullReportData };
};

const generateReport = (payload: ReportGeneratePayload) => {
    const student = getStudentById(payload.studentId);
    const newReport: ReportListItem = {
        reportId: `rep_${crypto.randomUUID()}`,
        studentName: student?.name || 'Unknown Student',
        periodLabel: payload.period.preset === 'last_30' ? 'Last 30 Days' : 'Custom Range',
        generatedAt: new Date().toISOString(),
        status: 'Queued',
        hasPdf: payload.delivery.pdf,
        delivery: {
            portal: payload.delivery.portal,
            email: payload.delivery.email,
        },
    };
    reports.unshift(newReport);
    // Simulate generation
    setTimeout(() => {
        const generatedReport = reports.find(r => r.reportId === newReport.reportId);
        if (generatedReport) {
            generatedReport.status = 'Generated';
        }
    }, 5000);
    return { reportId: newReport.reportId };
};

const handlers: { [key: string]: (payload: any, actor: WebhookRequest['actor']) => any } = {
    'GET_DASHBOARD_SUMMARY': (payload, actor) => ({ kpis }),
    'GET_REVIEW_QUEUE': (payload, actor) => ({ items: reviewQueue }),
    'GET_DRAFTS': (payload, actor) => ({ items: drafts }),
    'HEALTH_CHECK': (payload, actor) => healthCheck,
    'STUDENT_LIST': (payload, actor) => studentList(),
    'STUDENT_GET': (payload: { studentId: string }, actor) => getStudent(payload),
    'STUDENT_CREATE': (payload: StudentCreatePayload, actor) => createStudent(payload),
    'STUDENT_ASSESSMENTS_LIST': (payload: { studentId: string }, actor) => getStudentAssessments(payload),
    'STUDENT_REPORTS_LIST': (payload: { studentId: string }, actor) => getStudentReports(payload),

    // Rubrics
    'RUBRIC_LIST': (payload, actor) => ({ rubrics: mockRubrics }),

    // Assessment
    'ASSESSMENT_LIST': (payload, actor) => listAssessments(payload),
    'ASSESSMENT_GET': (payload: { assessmentId: string }, actor) => getAssessment(payload),
    'ASSESSMENT_SET_RUBRIC': (payload, actor) => setAssessmentRubric(payload),
    'ASSESSMENT_TEXT_UPDATE': (payload, actor) => updateAssessmentText(payload),
    'ASSESSMENT_TYPED_UPLOAD': (payload, actor) => uploadTypedFile(payload),
    'ASSESSMENT_EXTRACT_TEXT': (payload, actor) => extractText(payload),
    'ASSESSMENT_RUN_AI_GRADE': (payload, actor) => runAIGrade(payload),
    'ASSESSMENT_FINALIZE': (payload, actor) => finalizeAssessment(payload),
    'ASSESSMENT_SUGGESTION_ACTION': (payload, actor) => applySuggestion(payload),
    'ASSESSMENT_SAVE_TEACHER_FEEDBACK': (payload, actor) => saveTeacherFeedback(payload),
    'ASSESSMENT_SAVE_RUBRIC_OVERRIDE': (payload, actor) => saveRubricOverrides(payload),


    // Reports
    'REPORTS_LIST': (payload, actor) => listReports(),
    'REPORT_GET': (payload, actor) => getReport(payload),
    'REPORT_GENERATE': (payload, actor) => generateReport(payload),
    'REPORT_SEND': (payload, actor) => ({ success: true }),
    'REPORT_DOWNLOAD_PDF': (payload, actor) => ({ fileContent: 'mock-pdf-base64-content' }),

    // Action mocks just return success
    'REVIEW_OPEN': (payload, actor) => ({}),
    'DRAFT_OPEN': (payload, actor) => ({}),
    'NEW_ASSESSMENT_START': (payload, actor) => ({}),
    'ASSESSMENT_CREATE_DRAFT': ({ title, studentId, rubricId }: {title: string, studentId: string, rubricId: string}) => {
        const student = getStudentById(studentId);
        const newId = `asm_new_${crypto.randomUUID().slice(0,4)}`;
        currentAssessmentState = {
            id: newId,
            title: title,
            status: "draft",
            student: { id: studentId, name: student?.name || 'Unknown Student' },
            rubricId: rubricId,
            source: null,
            currentText: null,
            uploads: [],
            aiReview: null,
            teacherFeedback: null,
            teacherOverrides: null,
        };
        return { assessmentId: newId };
    },

    // Parent Portal
    'PARENT_CHILDREN_LIST': (payload, actor) => {
        const childIds = parentChildMap[actor.userId] || [];
        const children = childIds.map(id => {
            const student = getStudentById(id);
            if (!student) return null;
            const studentReports = reportListItems.filter(r => r.studentName === student.name).sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());
            return {
                childId: student.id,
                childName: student.name,
                gradeLabel: student.class,
                latestReportAt: studentReports.length > 0 ? studentReports[0].generatedAt : null,
            };
        }).filter((c): c is ParentChild => c !== null);
        return { children };
    },
    'PARENT_REPORTS_LIST': (payload: ParentReportsListPayload) => {
        const student = getStudentById(payload.childId);
        if (!student) { return { studentName: "Unknown", items: [], pagination: { page: 1, pageSize: 10, total: 0 }}; }

        const items = reportListItems
            .filter(item => item.studentName === student.name)
            .map(({ reportId, periodLabel, generatedAt, hasPdf }) => ({ reportId, periodLabel, generatedAt, hasPdf }));
        
        return {
            studentName: student.name,
            items,
            pagination: { page: 1, pageSize: 10, total: items.length },
        };
    },
    'PARENT_REPORT_GET': (payload: { reportId: string }): { report: ParentReportData } => {
        const summary = reportListItems.find(r => r.reportId === payload.reportId);
        const studentName = summary?.studentName || fullReportData.studentName;

        return {
            report: {
                reportId: payload.reportId,
                childName: studentName,
                periodLabel: summary?.periodLabel || fullReportData.periodLabel,
                generatedAt: summary?.generatedAt || fullReportData.generatedAt,
                hasPdf: summary?.hasPdf || false,
                sections: {
                    summary: fullReportData.summary,
                    strengths: fullReportData.strengths,
                    growthAreas: fullReportData.growthAreas,
                    rubricSnapshot: fullReportData.rubricSnapshot,
                    teacherFinalComment: fullReportData.teacherFinalComment
                }
            }
        };
    },
};


export function getMockResponse(body: WebhookRequest): WebhookResponse | null {
  const handler = handlers[body.eventName];
  if (handler) {
    const data = handler(body.payload, body.actor);
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
