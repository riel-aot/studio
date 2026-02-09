import type { StudentListItem, StudentAssessmentListItem, StudentReportListItem, StudentProfileData } from './events';

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

export const singleStudentData = (id: string): (StudentProfileData & { details: any, recentAssessments: any[], recentReports: any[] }) | null => {
    const student = getStudentById(id);
    if (!student) return null;

    return {
        id: student.id,
        name: student.name,
        class: student.class,
        studentIdNumber: student.studentIdNumber,
        studentEmail: student.studentEmail,
        parentEmail: student.parentEmail,
        details: {
            gradeLevel: '5th Grade',
            homeroom: 'Mrs. Gable',
            lastLogin: '2023-10-26T08:00:00Z',
        },
        recentAssessments: [
            { id: 'asm_01', name: 'Unit 3: Fractions', status: 'pending_review', date: '2023-10-26' },
            { id: 'asm_11', name: 'Book Report: The Giver', status: 'finalized', date: '2023-10-15' },
            { id: 'asm_12', name: 'Spelling Test #5', status: 'finalized', date: '2023-10-10' },
        ],
        recentReports: []
    }
};

export const studentAssessments: StudentAssessmentListItem[] = [
    { id: 'asm_01', name: 'Unit 3: Fractions', type: 'Math', status: 'Needs Review', updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'asm_11', name: 'Book Report: The Giver', type: 'Reading', status: 'Finalized', updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'asm_12', name: 'Spelling Test #5', type: 'Writing', status: 'Finalized', updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'asm_draft_03', name: 'Science Fair Proposal', type: 'Science', status: 'Draft', updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'asm_ai_01', name: 'EAL Vocabulary Quiz', type: 'EAL', status: 'AI Draft Ready', updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
];

export const studentReports: StudentReportListItem[] = [
    { id: 'rep_01', name: 'Q3 Progress Report', generatedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), status: 'Final' },
    { id: 'rep_02', name: 'Mid-Term Summary', generatedDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), status: 'Final' },
];

export const assessmentData = (id: string) => ({
    id,
    title: "Unit 3: Fractions",
    student: getStudentById('stu_01'),
    status: 'pending_review',
    createdAt: '2023-10-20T10:00:00Z',
    updatedAt: '2023-10-26T10:00:00Z',
    rubric: {
        id: 'rub_01',
        name: 'Standard Math Quiz Rubric',
        criteria: [
            { id: 'crit_01', name: 'Correctness', description: 'Accuracy of the final answers.', score: 4, maxScore: 5, comments: 'Good work on most problems, but check your calculations for question #3.' },
            { id: 'crit_02', name: 'Methodology', description: 'Shows the steps taken to reach the answer.', score: 5, maxScore: 5, comments: 'Excellent and clear work shown.' },
            { id: 'crit_03', name: 'Clarity', description: 'The work is neat and easy to follow.', score: 3, maxScore: 5, comments: 'Some parts were hard to read. Try to be neater next time.' },
        ]
    },
    overallComments: 'A solid effort on this quiz, Amelia. Your understanding of fraction multiplication is strong. Pay closer attention to simplifying your final answers.'
})
