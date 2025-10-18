<<<<<<< HEAD
// This file is deprecated and no longer in use.
// The active API service is located at /services/api.ts
// This file can be safely deleted.
=======

import type { User, Course, Assignment, Submission, EnrichedSubmission } from '../types';
import { Role } from '../types';

// --- MOCK DATABASE ---
let users: User[] = [
    { id: 'user-1', name: 'Alice Johnson', email: 'alice@example.com', role: Role.Teacher },
    { id: 'user-2', name: 'Bob Williams', email: 'bob@example.com', role: Role.Student },
    { id: 'user-3', name: 'Charlie Brown', email: 'charlie@example.com', role: Role.Student },
];

let courses: Course[] = [
    { id: 'course-1', title: 'Introduction to React', description: 'Learn the fundamentals of React and modern web development.', duration: '8 Weeks', teacherId: 'user-1', studentsEnrolled: ['user-2', 'user-3'] },
    { id: 'course-2', title: 'Advanced Tailwind CSS', description: 'Master utility-first CSS for rapid UI development.', duration: '4 Weeks', teacherId: 'user-1', studentsEnrolled: ['user-2'] },
];

let assignments: Assignment[] = [
    { id: 'assign-1', courseId: 'course-1', title: 'Component Lifecycle', description: 'Create a component that demonstrates React lifecycle methods.' },
    { id: 'assign-2', courseId: 'course-1', title: 'State Management with Hooks', description: 'Build a small app using useState and useEffect.' },
    { id: 'assign-3', courseId: 'course-2', title: 'Responsive Design Project', description: 'Build a responsive landing page using Tailwind CSS.' },
];

let submissions: Submission[] = [
    { id: 'sub-1', assignmentId: 'assign-1', studentId: 'user-2', content: 'Here is my lifecycle component submission.', grade: 92 },
    { id: 'sub-2', assignmentId: 'assign-1', studentId: 'user-3', content: 'Attached is my work for the lifecycle assignment.', grade: 88 },
];

const simulateDelay = <T,>(data: T): Promise<T> => new Promise(res => setTimeout(() => res(data), 500));

// --- API FUNCTIONS ---

export const login = async (email: string): Promise<{ token: string; user: User }> => {
    const user = users.find(u => u.email === email);
    if (!user) throw new Error('User not found');
    return simulateDelay({ token: `fake-jwt-for-${user.id}`, user });
};

export const register = async (name: string, email: string, role: Role): Promise<{ token: string; user: User }> => {
    if (users.some(u => u.email === email)) throw new Error('Email already in use');
    const newUser: User = { id: `user-${Date.now()}`, name, email, role };
    users.push(newUser);
    return simulateDelay({ token: `fake-jwt-for-${newUser.id}`, user: newUser });
};

export const getAllCourses = async (): Promise<Course[]> => {
    const coursesWithTeachers = courses.map(course => {
        const teacher = users.find(u => u.id === course.teacherId);
        return { ...course, teacherName: teacher?.name || 'Unknown Teacher' };
    });
    return simulateDelay(coursesWithTeachers);
};

export const getCourseById = async (courseId: string): Promise<Course> => {
    const course = courses.find(c => c.id === courseId);
    if (!course) throw new Error('Course not found');
    const teacher = users.find(u => u.id === course.teacherId);
    return simulateDelay({ ...course, teacherName: teacher?.name || 'Unknown Teacher' });
};

export const getCoursesByStudentId = async (studentId: string): Promise<Course[]> => {
    const enrolledCourses = courses.filter(c => c.studentsEnrolled.includes(studentId));
    return simulateDelay(enrolledCourses);
};

export const getCoursesByTeacherId = async (teacherId: string): Promise<Course[]> => {
    const teacherCourses = courses.filter(c => c.teacherId === teacherId);
    const teacher = users.find(u => u.id === teacherId);
    const coursesWithTeacher = teacherCourses.map(course => ({
        ...course,
        teacherName: teacher?.name || 'Unknown Teacher'
    }));
    return simulateDelay(coursesWithTeacher);
};


export const createCourse = async (title: string, description: string, duration: string, teacherId: string): Promise<Course> => {
    const newCourse: Course = { id: `course-${Date.now()}`, title, description, duration, teacherId, studentsEnrolled: [] };
    courses.push(newCourse);
    return simulateDelay(newCourse);
};


export const getAssignmentsByCourseId = async (courseId: string): Promise<Assignment[]> => {
    return simulateDelay(assignments.filter(a => a.courseId === courseId));
};

export const getAssignmentById = async (assignmentId: string): Promise<Assignment> => {
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) throw new Error('Assignment not found');
    return simulateDelay(assignment);
}

export const getSubmissionsByAssignmentId = async (assignmentId: string): Promise<Submission[]> => {
    const relevantSubmissions = submissions.filter(s => s.assignmentId === assignmentId);
    const submissionsWithStudentNames = relevantSubmissions.map(sub => {
        const student = users.find(u => u.id === sub.studentId);
        return { ...sub, studentName: student?.name || 'Unknown Student' };
    });
    return simulateDelay(submissionsWithStudentNames);
};


export const getSubmissionsByStudentId = async (studentId: string): Promise<Submission[]> => {
    const studentSubmissions = submissions.filter(s => s.studentId === studentId);
    return simulateDelay(studentSubmissions);
};


export const createSubmission = async (assignmentId: string, studentId: string, content: string): Promise<Submission> => {
    // Prevent duplicate submissions for simplicity
    if (submissions.some(s => s.assignmentId === assignmentId && s.studentId === studentId)) {
        throw new Error('You have already submitted this assignment.');
    }
    const newSubmission: Submission = { id: `sub-${Date.now()}`, assignmentId, studentId, content, grade: null };
    submissions.push(newSubmission);
    return simulateDelay(newSubmission);
};


export const gradeSubmission = async (submissionId: string, grade: number): Promise<Submission> => {
    const submissionIndex = submissions.findIndex(s => s.id === submissionId);
    if (submissionIndex === -1) throw new Error('Submission not found');
    submissions[submissionIndex].grade = grade;
    return simulateDelay(submissions[submissionIndex]);
};

export const getEnrolledStudents = async (courseId: string): Promise<User[]> => {
    const course = courses.find(c => c.id === courseId);
    if(!course) throw new Error('Course not found');
    const studentIds = course.studentsEnrolled;
    const enrolledUsers = users.filter(user => studentIds.includes(user.id));
    return simulateDelay(enrolledUsers);
}

export const createAssignment = async (courseId: string, title: string, description: string): Promise<Assignment> => {
    const newAssignment: Assignment = { id: `assign-${Date.now()}`, courseId, title, description };
    assignments.push(newAssignment);
    return simulateDelay(newAssignment);
};

export const getEnrichedSubmissionsByStudentId = async (studentId: string): Promise<EnrichedSubmission[]> => {
    const studentSubmissions = submissions.filter(s => s.studentId === studentId);

    // FIX: Add an explicit return type to the map callback. This prevents TypeScript
    // from inferring a type that is too specific, which would otherwise conflict with
    // the `EnrichedSubmission` type predicate in the subsequent `.filter()` call.
    const enriched = studentSubmissions.map((sub): EnrichedSubmission | null => {
        const assignment = assignments.find(a => a.id === sub.assignmentId);
        if (!assignment) return null;
        
        const course = courses.find(c => c.id === assignment.courseId);
        return {
            ...sub,
            assignmentTitle: assignment.title,
            courseTitle: course?.title || 'Unknown Course',
            courseId: course?.id,
        };
    }).filter((sub): sub is EnrichedSubmission => sub !== null);

    return simulateDelay(enriched);
};
>>>>>>> c5d459428a2fba052cd0e7654482653475d7bac3
