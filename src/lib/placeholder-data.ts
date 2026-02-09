import type { StudentListItem, StudentAssessmentListItem, StudentReportListItem, StudentProfileData, AssessmentWorkspaceData, AISuggestion, RubricGrade, RubricListItem, AssessmentListItem } from './events';

export const studentListData: StudentListItem[] = [
    { 
        id: 'stu_01', 
        name: 'Amelia Johnson', 
        class: 'Grade 5', 
        avatarUrl: 'https://picsum.photos/seed/student1/100/100',
        studentIdNumber: 'S00123',
        lastAssessmentDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'Needs Review',
    },
    { 
        id: 'stu_02', 
        name: 'Benjamin Carter', 
        class: 'Grade 5', 
        avatarUrl: 'https://picsum.photos/seed/student2/100/100',
        studentIdNumber: 'S00124',
        lastAssessmentDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'Up to Date',
    },
    { 
        id: 'stu_03', 
        name: 'Charlotte Davis', 
        class: 'Grade 5', 
        avatarUrl: 'https://picsum.photos/seed/student3/100/100',
        studentIdNumber: 'S00125',
        lastAssessmentDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'Draft in Progress',
    },
    { 
        id: 'stu_04', 
        name: 'Daniel Evans', 
        class: 'Grade 5', 
        avatarUrl: 'https://picsum.photos/seed/student4/100/100',
        studentIdNumber: 'S00126',
        lastAssessmentDate: null,
        status: 'No Assessments',
    },
    { 
        id: 'stu_05', 
        name: 'Emma Foster', 
        class: 'Grade 5', 
        avatarUrl: 'https://picsum.photos/seed/student5/100/100',
        studentIdNumber: 'S00127',
        lastAssessmentDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'Up to Date',
    },
];

export const getStudentById = (id: string): (StudentListItem & { studentEmail: string | null; parentEmail: string }) | undefined => {
    const student = studentListData.find(s => s.id === id);
    if (!student) return undefined;
    return {
        ...student,
        studentEmail: `${student.name.split(' ')[0].toLowerCase()}@school.edu`,
        parentEmail: `${student.name.split(' ')[1].toLowerCase()}@family.com`
    };
};

const studentAssessments: StudentAssessmentListItem[] = [
    { id: 'asm_01', name: 'Unit 3: Fractions', type: 'Math', status: 'Needs Review', updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'asm_11', name: 'Book Report: The Giver', type: 'Reading', status: 'Finalized', updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'asm_12', name: 'Spelling Test #5', type: 'Writing', status: 'Finalized', updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'asm_draft_03', name: 'Science Fair Proposal', type: 'Science', status: 'Draft', updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'asm_ai_01', name: 'EAL Vocabulary Quiz', type: 'EAL', status: 'AI Draft Ready', updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
];

const studentReports: StudentReportListItem[] = [
    { id: 'rep_01', name: 'Q3 Progress Report', generatedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), status: 'Final' },
    { id: 'rep_02', name: 'Mid-Term Summary', generatedDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), status: 'Final' },
];

export const fullAssessment = {
    studentAssessments,
    studentReports,
}

// --- MOCK DATA FOR ASSESSMENT WORKSPACE ---
const sampleText = "The book 'The Giver' by Lois Lowry explores a society that has eliminated pain and strife by converting to 'Sameness'—a tightly controlled social order. The story folows a boy named Jonas who is chosen to be the next 'Receiver of Memory', the only person who holds the memories of the past, including pain and pleasure. This role isolates him from his friends and family. One of the central themes is the importance of individuality and freedom of choice. Lowry uses a simple writing style, but the concepts are deep. The ending is ambiguous, leaving the reader to wonder about Jonas's fate.";

export const aiSuggestions: AISuggestion[] = [
    { id: 'sug_01', start: 161, end: 167, criterionName: 'Mechanics', severity: 'Major', comment: 'Spelling error.', replacement: 'follows' },
    { id: 'sug_02', start: 350, end: 382, criterionName: 'Clarity', severity: 'Moderate', comment: 'This could be phrased more clearly to emphasize the trade-off.', replacement: 'This role isolates him, highlighting the conflict between a painless society and deep human connection.' },
    { id: 'sug_03', start: 22, end: 34, criterionName: 'Evidence', severity: 'Minor', comment: 'Identifies the author of the text.', replacement: undefined },
    { id: 'sug_04', start: 407, end: 446, criterionName: 'Central Idea', severity: 'Moderate', comment: 'Correctly identifies a major theme of the book.', replacement: undefined },
];

export const rubricGrades: RubricGrade[] = [
    { id: 'rg_01', criterionId: 'crit_01', criterionName: 'Central Idea', suggestedLevelOrScore: 4, rationale: 'Student accurately identifies the main theme of individuality vs. community.' },
    { id: 'rg_02', criterionId: 'crit_02', criterionName: 'Evidence', suggestedLevelOrScore: 3, rationale: 'Uses some details, but could include more specific examples from the text to support claims.' },
    { id: 'rg_03', criterionId: 'crit_03', criterionName: 'Mechanics', suggestedLevelOrScore: 3, rationale: 'Contains a few spelling and clarity issues that slightly impede readability.' },
];

export const mockRubrics: RubricListItem[] = [
    { id: 'rub_01', name: '5th Grade Book Report', version: '1.2' },
    { id: 'rub_02', name: 'Standard ELA Essay', version: '2.0' },
    { id: 'rub_03', name: 'Quick Write - Single Paragraph', version: '1.0' },
];


export const assessmentWorkspaceData: AssessmentWorkspaceData = {
    id: "asm_01",
    title: "Book Report: The Giver",
    status: 'draft',
    rubricId: null,
    student: {
        id: "stu_01",
        name: "Amelia Johnson",
    },
    source: "typed",
    currentText: sampleText,
    uploads: [{ id: 'up_01', fileName: 'The Giver Report.docx', type: 'typed' }],
    aiReview: null,
    teacherFeedback: {
        notes: 'Amelia seems to grasp the main concepts but needs to work on proofreading her work before submission.',
        finalFeedback: 'Good analysis of the central theme, Amelia. Be sure to proofread for minor spelling errors next time. Your insights are strong!'
    },
    teacherOverrides: null,
};

export const assessmentListItems: AssessmentListItem[] = [
  {
    assessmentId: 'asm_01',
    title: 'Unit 3: Fractions',
    student: { id: 'stu_01', name: 'Amelia Johnson' },
    classLabel: 'Grade 5',
    submissionType: 'typed',
    rubric: { id: 'rub_02', name: 'Standard ELA Essay' },
    status: 'needs_review',
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    assessmentId: 'asm_02',
    title: 'History Mid-Term Essay',
    student: { id: 'stu_02', name: 'Benjamin Carter' },
    classLabel: 'Grade 5',
    submissionType: 'handwritten',
    rubric: { id: 'rub_02', name: 'Standard ELA Essay' },
    status: 'ai_draft_ready',
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    assessmentId: 'asm_draft_01',
    title: 'Creative Writing Assignment',
    student: { id: 'stu_03', name: 'Charlotte Davis' },
    classLabel: 'Grade 5',
    submissionType: 'typed',
    rubric: { id: 'rub_03', name: 'Quick Write - Single Paragraph' },
    status: 'draft',
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    assessmentId: 'asm_04',
    title: 'Book Report: The Giver',
    student: { id: 'stu_01', name: 'Amelia Johnson' },
    classLabel: 'Grade 5',
    submissionType: 'typed',
    rubric: { id: 'rub_01', name: '5th Grade Book Report' },
    status: 'finalized',
    updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
    {
    assessmentId: 'asm_05',
    title: 'Lab Report: Photosynthesis',
    student: { id: 'stu_05', name: 'Emma Foster' },
    classLabel: 'Grade 5',
    submissionType: 'handwritten',
    rubric: { id: 'rub_01', name: '5th Grade Book Report' },
    status: 'needs_review',
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];
