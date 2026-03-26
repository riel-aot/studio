import type { WebhookRequest, WebhookResponse, StudentListItem, StudentCreatePayload, AssessmentWorkspaceData, RubricListItem, AssessmentListPayload, ReportListItem, ReportGeneratePayload, ReportData, ParentChildrenListResponse, ParentChild, ParentReportsListPayload, ParentReportData, DashboardKpis, ReviewQueueItem, DraftItem, ActivityItem } from './events';
import { studentListData as initialStudentData, getStudentByIdNumber, assessmentWorkspaceData as initialAssessmentData, fullAssessment, aiSuggestions, rubricGrades, mockRubrics, assessmentListItems, reportListItems, fullReportData, GLOBAL_RUBRIC_NAME } from './placeholder-data';
import { activityTracker } from './activity-tracker';

let students: StudentListItem[] = [...initialStudentData];
let reports: ReportListItem[] = [...reportListItems];
let currentAssessmentState: AssessmentWorkspaceData = { ...initialAssessmentData };
const globalRubricName = mockRubrics[0]?.name ?? GLOBAL_RUBRIC_NAME;

const parentChildMap: { [parentId: string]: string[] } = {
    'parent-01': ['S00123'],
};

const kpis: DashboardKpis = {
  pendingReview: 7,
  drafts: 3,
  finalizedThisWeek: 12,
};

const healthCheck = {
    authConfigured: true,
    webhookConfigured: false,
    databaseConnected: true,
    lastSuccessfulCall: new Date().toISOString(),
};

const generateReport = (payload: ReportGeneratePayload) => {
  const newReportId = `rep_${crypto.randomUUID().slice(0, 8)}`;
  const student = students.find((item) => item.studentIdNumber === payload.studentId);
  const periodLabel = payload.period.preset === 'this_month'
    ? 'This Month'
    : payload.period.preset === 'last_30'
      ? 'Last 30 Days'
      : payload.period.startDate && payload.period.endDate
        ? `${payload.period.startDate} - ${payload.period.endDate}`
        : 'Custom Range';

  reports.unshift({
    reportId: newReportId,
    studentName: student?.name ?? 'Unknown Student',
    periodLabel,
    generatedAt: new Date().toISOString(),
    status: 'Queued',
    hasPdf: payload.delivery.pdf,
    delivery: {
      portal: payload.delivery.portal,
      email: payload.delivery.email,
    },
  });

  return { reportId: newReportId, status: 'Queued' as const };
};

const studentList = () => ({
    students: students,
    total: students.length,
});

const getStudent = (payload: { studentId: string }) => {
    const student = getStudentByIdNumber(payload.studentId);
    if (!student) return null;
    return { student };
}

const getStudentAssessments = (payload: { studentId: string }) => {
    return { assessments: fullAssessment.studentAssessments };
}

const getStudentReports = (payload: { studentId: string }) => {
    return { reports: fullAssessment.studentReports };
}

const createStudent = (payload: StudentCreatePayload) => {
    const newStudent: StudentListItem = {
        name: payload.name,
        grade: payload.grade,
        studentIdNumber: payload.studentIdNumber,
        studentEmail: payload.studentEmail,
        parentEmail: payload.parentEmail,
    };
    students.unshift(newStudent);
    return { studentId: newStudent.studentIdNumber };
}

const listAssessments = (payload: AssessmentListPayload) => {
  const { status = 'all', page = 1, pageSize = 10, search = '' } = payload;
  const seenTitles = new Set<string>();
  const deduplicatedItems = assessmentListItems.filter(item => {
    if (seenTitles.has(item.title)) return false;
    seenTitles.add(item.title);
    return true;
  });

  let filteredItems = deduplicatedItems;
  if (status !== 'all') {
    filteredItems = filteredItems.filter(item => item.status === status);
  }
  if (search) {
      const lowercasedSearch = search.toLowerCase();
      filteredItems = filteredItems.filter(item => 
          item.title.toLowerCase().includes(lowercasedSearch) ||
          item.rubric.name.toLowerCase().includes(lowercasedSearch)
      );
  }

  const total = filteredItems.length;
  const items = filteredItems.slice((page - 1) * pageSize, page * pageSize);

  return {
    items,
    counts: {
      needsReview: deduplicatedItems.filter(i => i.status === 'needs_review').length,
      drafts: deduplicatedItems.filter(i => i.status === 'draft').length,
      finalizedThisWeek: 0,
    },
    pagination: { page, pageSize, total },
  };
};

const handlers: { [key: string]: (payload: any, actor: WebhookRequest['actor']) => any } = {
    'GET_DASHBOARD_SUMMARY': () => ({ kpis }),
    'GET_REVIEW_QUEUE': () => ({ items: [
        {
          studentName: 'Amelia Johnson',
          studentId: 'S00123',
          assessmentName: 'Unit 3: Fractions',
          assessmentId: 'asm_01',
          status: 'pending_review',
          updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          studentName: 'Benjamin Carter',
          studentId: 'S00124',
          assessmentName: 'History Mid-Term Essay',
          assessmentId: 'asm_02',
          status: 'ai_draft_ready',
          updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
    ] }),
    'GET_DRAFTS': () => ({ items: [
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
    ] }),
    'GET_RECENT_ACTIVITY': (payload) => {
        // --- REAL ACTIVITY MONITORING ---
        // Fetch activity from the actual tracker engine
        const realActivity = activityTracker.get();
        const limit = payload?.limit || 5;
        return { items: realActivity.slice(0, limit) };
    },
    'HEALTH_CHECK': () => healthCheck,
    'STUDENT_LIST': () => studentList(),
    'STUDENT_GET': (payload: { studentId: string }) => getStudent(payload),
    'STUDENT_CREATE': (payload: StudentCreatePayload) => createStudent(payload),
    'STUDENT_ASSESSMENTS_LIST': (payload: { studentId: string }) => getStudentAssessments(payload),
    'STUDENT_REPORTS_LIST': (payload: { studentId: string }) => getStudentReports(payload),
    'RUBRIC_LIST': () => ({ rubrics: mockRubrics }),
    'ASSESSMENT_LIST': (payload) => listAssessments(payload),
    'ASSESSMENT_GET': (payload: { assessmentId: string }) => {
        if (payload.assessmentId !== currentAssessmentState.id) {
         currentAssessmentState = { ...initialAssessmentData, id: payload.assessmentId, rubricName: globalRubricName };
        }
        return { assessment: currentAssessmentState };
    },
    'ASSESSMENT_CREATE_DRAFT': (payload: { title: string; rubricName?: string; notes?: string }) => {
      const assessmentId = `asm_draft_${crypto.randomUUID().slice(0, 8)}`;
      const rubricName = payload.rubricName ?? globalRubricName;
      assessmentListItems.unshift({
        assessmentId,
        title: payload.title || 'Untitled Assignment',
        student: { id: 'all', name: 'All Students' },
        classLabel: 'Grade 5',
        submissionType: 'typed',
        rubric: { name: rubricName },
        status: 'draft',
        updatedAt: new Date().toISOString(),
        notes: payload.notes,
      });

      currentAssessmentState = {
        ...currentAssessmentState,
        id: assessmentId,
        title: payload.title || 'Untitled Assignment',
        rubricName,
        notes: payload.notes,
        status: 'draft',
      };

      return { assessmentId };
    },
    'ASSESSMENT_FINALIZE': () => {
        currentAssessmentState.status = 'finalized';
        return { assessment: currentAssessmentState };
    },
    'REPORTS_LIST': () => ({ items: reports, pagination: { page: 1, pageSize: 20, total: reports.length } }),
    'REPORT_GET': () => ({ report: fullReportData }),
    'REPORT_GENERATE': (payload: ReportGeneratePayload) => generateReport(payload),
    'PARENT_CHILDREN_LIST': (payload, actor) => {
        const childIds = parentChildMap[actor.userId] || [];
        const children = childIds.map(id => {
            const student = getStudentByIdNumber(id);
            if (!student) return null;
            return {
                childId: student.studentIdNumber,
                childName: student.name,
                gradeLabel: student.grade,
                latestReportAt: new Date().toISOString(),
            };
        }).filter((c): c is ParentChild => c !== null);
        return { children };
    },
};

export function getMockResponse(body: WebhookRequest): WebhookResponse | null {
  const handler = handlers[body.eventName];
  if (handler) {
    const data = handler(body.payload, body.actor);
    return {
      success: true,
      data,
      correlationId: `mock_${crypto.randomUUID()}`,
    };
  }
  return null;
}
