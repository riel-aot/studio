import type { StudentListItem } from './events';

export const studentListData: StudentListItem[] = [
    { 
        id: 'stu_01', 
        name: 'Amelia Johnson', 
        class: 'Grade 5', 
        avatarUrl: 'https://picsum.photos/seed/student1/100/100',
        studentIdNumber: 'S00123',
        parentEmail: 'amelia.parent@example.com',
        lastAssessmentDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'Needs Review',
    },
    { 
        id: 'stu_02', 
        name: 'Benjamin Carter', 
        class: 'Grade 5', 
        avatarUrl: 'https://picsum.photos/seed/student2/100/100',
        studentIdNumber: 'S00124',
        parentEmail: 'ben.carter.family@example.com',
        lastAssessmentDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'Up to Date',
    },
    { 
        id: 'stu_03', 
        name: 'Charlotte Davis', 
        class: 'Grade 5', 
        avatarUrl: 'https://picsum.photos/seed/student3/100/100',
        studentIdNumber: 'S00125',
        parentEmail: 'charlotte.davis.dad@example.com',
        lastAssessmentDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'Draft in Progress',
    },
    { 
        id: 'stu_04', 
        name: 'Daniel Evans', 
        class: 'Grade 5', 
        avatarUrl: 'https://picsum.photos/seed/student4/100/100',
        studentIdNumber: 'S00126',
        parentEmail: 'evans.family@example.com',
        lastAssessmentDate: null,
        status: 'No Assessments',
    },
    { 
        id: 'stu_05', 
        name: 'Emma Foster', 
        class: 'Grade 5', 
        avatarUrl: 'https://picsum.photos/seed/student5/100/100',
        studentIdNumber: 'S00127',
        parentEmail: 'contact.foster.home@example.com',
        lastAssessmentDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'Up to Date',
    },
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
