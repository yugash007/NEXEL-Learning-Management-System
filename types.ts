// FIX: Removed self-import of `Role` to resolve declaration conflict.
export enum Role {
    Student = 'Student',
    Teacher = 'Teacher'
}

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string; // Emoji or character
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
    lastLogin?: string; // ISO date string
    loginStreak?: number;
    badges?: Badge[];
}

export interface Video {
    id: string;
    title: string;
    url: string; // e.g., a YouTube embed URL
}

export interface StudyMaterial {
    id: string;
    title: string;
    fileUrl: string;
    originalFileName: string;
}

export interface Module {
    id: string;
    title: string;
    videos: Video[];
    studyMaterials: StudyMaterial[];
}

export interface Course {
    id: string;
    title: string;
    description: string;
    duration: string;
    teacherId: string;
    teacherName?: string; 
    studentsEnrolled: string[];
    modules?: Module[];
    progress?: number; // For student progress tracking
    prerequisites?: string[]; // Array of course IDs
    averageRating?: number;
}

export interface Assignment {
    id: string;
    courseId: string;
    title: string;
    description: string;
    deadline?: string;
}

export interface Submission {
    id: string;
    assignmentId: string;
    studentId: string;
    studentName?: string;
    content?: string; // Text content, now optional
    submissionFileUrl?: string;
    submissionFileName?: string;
    grade: {
        internal: number | null;
        external: number | null;
        final: number | null;
    } | null;
    letterGrade?: string;
    review?: string;
    feedbackFileUrl?: string;
    feedbackFileName?: string;
}

export interface EnrichedAssignment extends Assignment {
    submissionStatus: 'Submitted' | 'Not Submitted' | 'Graded';
    grade?: {
        internal: number | null;
        external: number | null;
        final: number | null;
    } | null;
}

export interface EnrichedSubmission extends Submission {
    assignmentTitle?: string;
    courseTitle?: string;
    courseId?: string;
}

export interface Announcement {
    id: string;
    courseId: string;
    courseTitle?: string; // For student dashboard
    title: string;
    content: string;
    createdAt: string; // ISO date string
}

export interface Notification {
    id: string;
    userId: string; // The user who receives the notification
    message: string;
    link: string; // URL to navigate to on click
    createdAt: string; // ISO date string
    read: boolean;
}

export interface Review {
    id: string;
    courseId: string;
    studentId: string;
    studentName: string;
    rating: number; // 1 to 5
    comment: string;
    createdAt: string; // ISO date string
}

export interface Thread {
    id: string;
    courseId: string;
    title: string;
    content: string;
    authorId: string;
    authorName: string;
    createdAt: string; // ISO date string
    replyCount?: number;
}

export interface Reply {
    id: string;
    threadId: string;
    content: string;
    authorId: string;
    authorName: string;
    createdAt: string; // ISO date string
}