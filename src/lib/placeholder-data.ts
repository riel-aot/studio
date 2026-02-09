import type { StudentListItem, StudentAssessmentListItem, StudentReportListItem, StudentProfileData, AssessmentWorkspaceData, AISuggestion, RubricCriterion } from './events';

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
    { id: 'sug_01', start: 161, end: 167, category: 'Grammar', note: 'Spelling error.', replacement: 'follows' },
    { id: 'sug_02', start: 350, end: 382, category: 'Clarity', note: 'This could be phrased more clearly to emphasize the trade-off.', replacement: 'This role isolates him, highlighting the conflict between a painless society and deep human connection.' },
    { id: 'sug_03', start: 22, end: 34, category: 'Rubric Evidence', note: 'Identifies the author of the text.', replacement: undefined },
    { id: 'sug_04', start: 407, end: 446, category: 'Rubric Evidence', note: 'Correctly identifies a major theme of the book.', replacement: undefined },
];

export const rubricDraft: RubricCriterion[] = [
    { id: 'crit_01', name: 'Identifies Central Idea', description: 'Student accurately identifies the main theme or central idea of the text.', draftScore: 4, maxScore: 5, evidence: 'Correctly identifies a major theme of the book.' },
    { id: 'crit_02', name: 'Supporting Details', description: 'Uses specific details from the text to support their analysis.', draftScore: 3, maxScore: 5, evidence: 'References the main character and his role.' },
    { id: 'crit_03', name: 'Clarity and Mechanics', description: 'Writing is clear, with few grammatical or spelling errors.', draftScore: 3, maxScore: 5, evidence: 'Contains a few spelling and clarity issues.' },
];

export const assessmentWorkspaceData: AssessmentWorkspaceData = {
    id: "asm_01",
    title: "Book Report: The Giver",
    status: 'draft',
    student: {
        id: "stu_01",
        name: "Amelia Johnson",
    },
    currentText: sampleText,
    uploads: [{ id: 'up_01', fileName: 'The Giver Report.docx', type: 'typed' }],
    aiReview: null,
    teacherFeedback: {
        notes: 'Amelia seems to grasp the main concepts but needs to work on proofreading her work before submission.',
        finalFeedback: 'Good analysis of the central theme, Amelia. Be sure to proofread for minor spelling errors next time. Your insights are strong!'
    }
};
