import type { GetDashboardSummaryData, StudentListItem } from './events';

export const dashboardSummaryData: GetDashboardSummaryData = {
  kpis: {
    pendingReview: 7,
    drafts: 3,
    finalizedThisWeek: 12,
  },
  reviewQueue: [
    {
      studentName: 'Amelia Johnson',
      studentId: 'stu_01',
      assessmentName: 'Unit 3: Fractions',
      assessmentId: 'asm_01',
      status: 'pending_review',
      updatedAt: '2023-10-26T10:00:00Z',
    },
    {
      studentName: 'Benjamin Carter',
      studentId: 'stu_02',
      assessmentName: 'History Mid-Term Essay',
      assessmentId: 'asm_02',
      status: 'pending_review',
      updatedAt: '2023-10-26T09:30:00Z',
    },
    {
      studentName: 'Charlotte Davis',
      studentId: 'stu_03',
      assessmentName: 'Science Project Proposal',
      assessmentId: 'asm_03',
      status: 'pending_review',
      updatedAt: '2023-10-25T15:00:00Z',
    },
  ],
  drafts: [
    {
      assessmentId: 'asm_draft_01',
      assessmentName: 'Creative Writing Assignment',
      studentName: 'Olivia Martinez',
      updatedAt: '2023-10-24T11:00:00Z',
    },
    {
      assessmentId: 'asm_draft_02',
      assessmentName: 'Algebra II Quiz',
      studentName: 'Liam Garcia',
      updatedAt: '2023-10-23T14:20:00Z',
    },
  ],
};

export const studentListData: StudentListItem[] = [
    { id: 'stu_01', name: 'Amelia Johnson', class: 'Grade 5', avatarUrl: 'https://picsum.photos/seed/student1/100/100' },
    { id: 'stu_02', name: 'Benjamin Carter', class: 'Grade 5', avatarUrl: 'https://picsum.photos/seed/student2/100/100' },
    { id: 'stu_03', name: 'Charlotte Davis', class: 'Grade 5', avatarUrl: 'https://picsum.photos/seed/student3/100/100' },
    { id: 'stu_04', name: 'Daniel Evans', class: 'Grade 5', avatarUrl: 'https://picsum.photos/seed/student4/100/100' },
    { id: 'stu_05', name: 'Emma Foster', class: 'Grade 5', avatarUrl: 'https://picsum.photos/seed/student5/100/100' },
    { id: 'stu_06', name: 'Finn Harris', class: 'Grade 5', avatarUrl: 'https://picsum.photos/seed/student6/100/100' },
    { id: 'stu_07', name: 'Grace Hill', class: 'Grade 5', avatarUrl: 'https://picsum.photos/seed/student7/100/100' },
];

export const getStudentById = (id: string) => {
    return studentListData.find(s => s.id === id);
}

export const singleStudentData = (id: string) => ({
    ...getStudentById(id),
    details: {
        gradeLevel: '5th Grade',
        homeroom: 'Mrs. Gable',
        lastLogin: '2023-10-26T08:00:00Z',
    },
    recentAssessments: [
        { id: 'asm_01', name: 'Unit 3: Fractions', status: 'pending_review', date: '2023-10-26' },
        { id: 'asm_11', name: 'Book Report: The Giver', status: 'finalized', date: '2023-10-15' },
        { id: 'asm_12', name: 'Spelling Test #5', status: 'finalized', date: '2023-10-10' },
    ]
})

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
