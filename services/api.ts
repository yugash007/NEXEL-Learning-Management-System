<<<<<<< HEAD
import type { User, Course, Assignment, Submission, EnrichedSubmission, Video, StudyMaterial, Module, Announcement, Notification, Review, Badge, Thread, Reply } from '../types';
import { Role } from '../types';
import { db, auth, storage } from '../firebase';
import { 
    getDatabase, ref, get, set, push, update, child, query, orderByChild, equalTo, remove 
} from "firebase/database";
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signOut
} from "firebase/auth";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

// --- HELPER FUNCTIONS ---

const transformCourseData = (course: any): Course => {
    const transformedCourse = { ...course };

    if (course.modules && typeof course.modules === 'object') {
        transformedCourse.modules = Object.keys(course.modules).map(moduleId => {
            const moduleData = course.modules[moduleId];
            
            const videos = (moduleData.videos && typeof moduleData.videos === 'object')
                ? Object.keys(moduleData.videos).map(videoId => ({ id: videoId, ...moduleData.videos[videoId] }))
                : [];
            
            const studyMaterials = (moduleData.studyMaterials && typeof moduleData.studyMaterials === 'object')
                ? Object.keys(moduleData.studyMaterials).map(materialId => ({ id: materialId, ...moduleData.studyMaterials[materialId] }))
                : [];
            
            return {
                id: moduleId,
                ...moduleData,
                videos,
                studyMaterials
            };
        });
    } else {
        transformedCourse.modules = [];
    }

    return transformedCourse as Course;
}
=======
// --- IMPORTANT: MOCK API NOTE ---
// This application uses a MOCK API with an IN-MEMORY database.
// This means:
// 1. All data (newly created users, courses, submissions) is TEMPORARY.
// 2. Data WILL persist as you navigate around the app.
// 3. A FULL PAGE RELOAD (e.g., hitting F5 or the refresh button) WILL WIPE
//    ALL CHANGES and reset the database to its original state.
//
// This is expected behavior for this demonstration application.

import type { User, Course, Assignment, Submission, EnrichedSubmission, Video, StudyMaterial, Module, Announcement, Notification, Review, Badge, Thread, Reply } from '../types';
import { Role } from '../types';

// --- MOCK DATABASE ---
>>>>>>> c5d459428a2fba052cd0e7654482653475d7bac3

const allBadges: Badge[] = [
    { id: 'badge-1', name: 'Consistent Learner', description: 'Logged in for 3 consecutive days.', icon: '🥉' },
    { id: 'badge-2', name: 'Dedicated Student', description: 'Logged in for 7 consecutive days.', icon: '🏆' },
];

<<<<<<< HEAD
const snapshotToArray = (snapshot: any) => {
    if (!snapshot.exists()) return [];
    const data = snapshot.val();
    return Object.keys(data).map(key => ({
        id: key,
        ...data[key]
    }));
}

const createNotification = async (userId: string, message: string, link: string) => {
    const newNotification: Omit<Notification, 'id'> = {
=======
let users: User[] = [
    { id: 'user-1', name: 'Alice Johnson', email: 'alice@example.com', role: Role.Teacher },
    { id: 'user-2', name: 'Bob Williams', email: 'bob@example.com', role: Role.Student, lastLogin: new Date(Date.now() - 86400000 * 2).toISOString(), loginStreak: 2, badges: [] },
    { id: 'user-3', name: 'Charlie Brown', email: 'charlie@example.com', role: Role.Student, lastLogin: new Date(Date.now() - 86400000).toISOString(), loginStreak: 7, badges: [allBadges[0], allBadges[1]] },
    { id: 'user-4', name: 'Diana Prince', email: 'diana@example.com', role: Role.Teacher },
    { id: 'user-5', name: 'Ethan Hunt', email: 'ethan@example.com', role: Role.Student, loginStreak: 0, badges: [] },
];

let courses: Course[] = [
    { 
        id: 'course-1', 
        title: 'Introduction to React', 
        description: 'Learn the fundamentals of React and modern web development.', 
        duration: '8 Weeks', 
        teacherId: 'user-1', 
        teacherName: 'Alice Johnson',
        studentsEnrolled: ['user-2', 'user-3'],
        modules: [
            {
                id: 'mod-1',
                title: 'Module 1: Getting Started',
                videos: [
                    { id: 'vid-1', title: 'React in 100 Seconds', url: 'https://www.youtube.com/embed/SqcY0GlETPk' },
                    { id: 'vid-2', title: 'Full React Course for Beginners', url: 'https://www.youtube.com/embed/bMknfKXIFA8' },
                ],
                studyMaterials: [
                    { id: 'mat-1', title: 'React Cheat Sheet', fileName: 'react-cheatsheet.pdf' },
                    { id: 'mat-2', title: 'Project Setup Guide', fileName: 'project-setup.docx' },
                ]
            },
             {
                id: 'mod-2',
                title: 'Module 2: Core Concepts',
                videos: [],
                studyMaterials: []
            }
        ]
    },
    { id: 'course-2', title: 'Advanced Tailwind CSS', description: 'Master utility-first CSS for rapid UI development.', duration: '4 Weeks', teacherId: 'user-1', teacherName: 'Alice Johnson', studentsEnrolled: ['user-2'], modules: [] },
    { id: 'course-3', title: 'Node.js for Beginners', description: 'Understand the basics of server-side JavaScript with Node.js and Express.', duration: '6 Weeks', teacherId: 'user-4', teacherName: 'Diana Prince', studentsEnrolled: ['user-3', 'user-5'], modules: [] },
    { id: 'course-4', title: 'Data Structures in JavaScript', description: 'Learn common data structures and their implementation in JS.', duration: '10 Weeks', teacherId: 'user-4', teacherName: 'Diana Prince', studentsEnrolled: [], modules: [] },
    { id: 'course-5', title: 'UI/UX Design Fundamentals', description: 'A primer on the principles of user interface and user experience design.', duration: '5 Weeks', teacherId: 'user-1', teacherName: 'Alice Johnson', studentsEnrolled: ['user-5'], modules: [] },
    { id: 'course-6', title: 'Introduction to TypeScript', description: 'Learn how to use TypeScript to build more robust and scalable web applications.', duration: '4 Weeks', teacherId: 'user-4', teacherName: 'Diana Prince', studentsEnrolled: ['user-2', 'user-3', 'user-5'], modules: [] },
    { 
        id: 'course-7', 
        title: 'Advanced React Patterns', 
        description: 'Dive deep into advanced patterns, hooks, and state management strategies.', 
        duration: '6 Weeks', 
        teacherId: 'user-1', 
        teacherName: 'Alice Johnson', 
        studentsEnrolled: [], 
        modules: [],
        prerequisites: ['course-1']
    },
];

let assignments: Assignment[] = [
    { id: 'assign-1', courseId: 'course-1', title: 'Component Lifecycle', description: 'Create a component that demonstrates React lifecycle methods.', deadline: '2024-08-15' },
    { id: 'assign-2', courseId: 'course-1', title: 'State Management with Hooks', description: 'Build a small app using useState and useEffect.', deadline: '2024-08-30' },
    { id: 'assign-3', courseId: 'course-2', title: 'Responsive Design Project', description: 'Build a responsive landing page using Tailwind CSS.', deadline: '2024-09-05' },
];

let submissions: Submission[] = [
    { id: 'sub-1', assignmentId: 'assign-1', studentId: 'user-2', content: 'Here is my lifecycle component submission.', grade: { internal: 90, external: 94, final: 92 }, letterGrade: 'A', review: 'Great work! Your understanding of component lifecycle is clear. Try to add more comments in your next submission.' },
    { id: 'sub-2', assignmentId: 'assign-1', studentId: 'user-3', content: 'File: my-lifecycle-project.zip', grade: { internal: 86, external: 90, final: 88 }, letterGrade: 'B+', review: 'Good submission. The project runs well, but the file structure could be better organized.' },
];

let announcements: Announcement[] = [
    { id: 'anno-1', courseId: 'course-1', title: 'Welcome!', content: 'Welcome to Introduction to React! Please review the syllabus in Module 1.', createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
    { id: 'anno-2', courseId: 'course-1', title: 'Assignment 1 Reminder', content: 'Just a reminder that Assignment 1 is due next week. Let me know if you have questions!', createdAt: new Date().toISOString() },
    { id: 'anno-3', courseId: 'course-2', title: 'Project Kick-off', content: 'We will be starting our responsive design project next Monday. Please come prepared with ideas.', createdAt: new Date(Date.now() - 86400000).toISOString() },
];

let notifications: Notification[] = [];

let reviews: Review[] = [
    { id: 'rev-1', courseId: 'course-2', studentId: 'user-2', studentName: 'Bob Williams', rating: 5, comment: 'Excellent course! Alice is a great teacher and explains complex topics in a simple way.', createdAt: new Date().toISOString() },
    { id: 'rev-2', courseId: 'course-3', studentId: 'user-5', studentName: 'Ethan Hunt', rating: 4, comment: 'Good introduction to Node.js. Could have used a few more practical examples in the final module.', createdAt: new Date().toISOString() },
];

let threads: Thread[] = [
    { id: 'thread-1', courseId: 'course-1', title: 'Question about props vs. state', content: "I'm a bit confused about when to use props and when to use state. Can anyone explain the key difference with an example?", authorId: 'user-2', authorName: 'Bob Williams', createdAt: new Date(Date.now() - 86400000).toISOString() },
    { id: 'thread-2', courseId: 'course-1', title: 'Resources for React Hooks', content: "Found a great article on advanced hooks! Sharing it here for everyone: [link to article]", authorId: 'user-3', authorName: 'Charlie Brown', createdAt: new Date().toISOString() }
];

let replies: Reply[] = [
    { id: 'reply-1', threadId: 'thread-1', content: "Great question! The simple way I remember it is: props are passed *into* a component (like function arguments), while state is managed *within* the component (like variables declared inside a function).", authorId: 'user-1', authorName: 'Alice Johnson', createdAt: new Date(Date.now() - 86400000 + 3600000).toISOString() },
    { id: 'reply-2', threadId: 'thread-1', content: "That makes so much sense, thanks Alice! So if a component needs to change data over time (like a counter), it would use state.", authorId: 'user-2', authorName: 'Bob Williams', createdAt: new Date(Date.now() - 86400000 + 7200000).toISOString() }
];


const simulateDelay = <T,>(data: T): Promise<T> => new Promise(res => setTimeout(() => res(data), 500));

// --- NOTIFICATION HELPERS ---
const createNotification = (userId: string, message: string, link: string) => {
    const newNotification: Notification = {
        id: `notif-${Date.now()}-${Math.random()}`,
>>>>>>> c5d459428a2fba052cd0e7654482653475d7bac3
        userId,
        message,
        link,
        createdAt: new Date().toISOString(),
        read: false,
    };
<<<<<<< HEAD
    await push(ref(db, 'notifications'), newNotification);
};

export const calculateProgress = async (courseId: string, studentId: string): Promise<number> => {
    const assignmentsSnapshot = await get(query(ref(db, 'assignments'), orderByChild('courseId'), equalTo(courseId)));
    const courseAssignments = snapshotToArray(assignmentsSnapshot);

    if (courseAssignments.length === 0) return 100;
    
    const submissionsSnapshot = await get(query(ref(db, 'submissions'), orderByChild('studentId'), equalTo(studentId)));
    const studentSubmissions = snapshotToArray(submissionsSnapshot);

    const studentSubmissionsForCourse = studentSubmissions.filter(s => 
        courseAssignments.some(a => a.id === s.assignmentId)
=======
    notifications.push(newNotification);
};

// --- HELPER FUNCTIONS ---
const calculateProgress = (courseId: string, studentId: string): number => {
    const courseAssignments = assignments.filter(a => a.courseId === courseId);
    if (courseAssignments.length === 0) return 100;
    
    const studentSubmissionsForCourse = submissions.filter(s => 
        s.studentId === studentId && courseAssignments.some(a => a.id === s.assignmentId)
>>>>>>> c5d459428a2fba052cd0e7654482653475d7bac3
    );
    return Math.round((studentSubmissionsForCourse.length / courseAssignments.length) * 100);
};

<<<<<<< HEAD
const getAverageRating = async (courseId: string): Promise<number | undefined> => {
    const reviewsSnapshot = await get(query(ref(db, 'reviews'), orderByChild('courseId'), equalTo(courseId)));
    const courseReviews = snapshotToArray(reviewsSnapshot);

=======
const getAverageRating = (courseId: string): number | undefined => {
    const courseReviews = reviews.filter(r => r.courseId === courseId);
>>>>>>> c5d459428a2fba052cd0e7654482653475d7bac3
    if (courseReviews.length === 0) return undefined;
    const sum = courseReviews.reduce((acc, review) => acc + review.rating, 0);
    return parseFloat((sum / courseReviews.length).toFixed(1));
};

<<<<<<< HEAD
// --- API FUNCTIONS ---

export const login = async (email: string, password: string): Promise<{ token: string; user: User }> => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = await getUserById(userCredential.user.uid);
    if (!user) throw new Error("User data not found in database.");

    if (user.role === Role.Student) {
        const today = new Date();
        const lastLogin = user.lastLogin ? new Date(user.lastLogin) : null;
        const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const lastLoginDate = lastLogin ? new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate()) : null;

        let newStreak = user.loginStreak || 0;
        if (lastLoginDate) {
            const diffTime = todayDate.getTime() - lastLoginDate.getTime();
            const diffDays = diffTime / (1000 * 3600 * 24);
            if (diffDays === 1) newStreak++;
            else if (diffDays > 1) newStreak = 1;
        } else {
            newStreak = 1;
        }

        const newBadges = user.badges || [];
        if (newStreak >= 3 && !newBadges.some(b => b.id === 'badge-1')) newBadges.push(allBadges.find(b => b.id === 'badge-1')!);
        if (newStreak >= 7 && !newBadges.some(b => b.id === 'badge-2')) newBadges.push(allBadges.find(b => b.id === 'badge-2')!);
        
        await update(ref(db, `users/${user.id}`), { lastLogin: today.toISOString(), loginStreak: newStreak, badges: newBadges });
        user.lastLogin = today.toISOString();
        user.loginStreak = newStreak;
        user.badges = newBadges;
    }

    const token = await userCredential.user.getIdToken();
    return { token, user };
};

export const logout = async (): Promise<void> => {
    await signOut(auth);
}

export const register = async (name: string, email: string, password: string, role: Role): Promise<{ token: string; user: User }> => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const { uid } = userCredential.user;
    const newUser: User = { id: uid, name, email, role, loginStreak: 0, badges: [] };
    await set(ref(db, 'users/' + uid), { name, email, role, loginStreak: 0, badges: [] });
    const token = await userCredential.user.getIdToken();
    return { token, user: newUser };
};

export const getUserById = async (userId: string): Promise<User> => {
    const snapshot = await get(ref(db, `users/${userId}`));
    if (!snapshot.exists()) throw new Error('User not found');
    return { id: userId, ...snapshot.val() };
}

export const updateUser = async (userId: string, name: string, email: string): Promise<User> => {
    await update(ref(db, `users/${userId}`), { name, email });
    return getUserById(userId);
};

const enrichCourses = async (courses: Course[]): Promise<Course[]> => {
    const userIds = [...new Set(courses.map(c => c.teacherId))];
    const userPromises = userIds.map(id => getUserById(id).catch(() => null));
    const users = (await Promise.all(userPromises)).filter(u => u) as User[];
    const userMap = new Map(users.map(u => [u.id, u.name]));

    const ratingPromises = courses.map(c => getAverageRating(c.id));
    const ratings = await Promise.all(ratingPromises);
    
    return courses.map((course, index) => ({
        ...course,
        studentsEnrolled: course.studentsEnrolled ? Object.keys(course.studentsEnrolled) : [],
        teacherName: userMap.get(course.teacherId) || 'Unknown Teacher',
        averageRating: ratings[index]
    }));
};

export const getAllCourses = async (): Promise<Course[]> => {
    const snapshot = await get(ref(db, 'courses'));
    const courses = snapshotToArray(snapshot);
    const transformedCourses = courses.map(transformCourseData);
    return enrichCourses(transformedCourses);
};

export const getCourseById = async (courseId: string): Promise<Course> => {
    const snapshot = await get(ref(db, `courses/${courseId}`));
    if (!snapshot.exists()) throw new Error('Course not found');
    const rawCourse = { id: courseId, ...snapshot.val() };
    const course = transformCourseData(rawCourse);
    const [enrichedCourse] = await enrichCourses([course]);
    return enrichedCourse;
};

export const getCoursesByStudentId = async (studentId: string): Promise<Course[]> => {
    const coursesSnapshot = await get(ref(db, 'courses'));
    if (!coursesSnapshot.exists()) return [];
    
    const allCourses = snapshotToArray(coursesSnapshot);
    const enrolledCourses = allCourses.filter(course => course.studentsEnrolled && course.studentsEnrolled[studentId]);
    
    const coursesWithProgress = await Promise.all(enrolledCourses.map(async (course) => ({
        ...course, 
        progress: await calculateProgress(course.id, studentId)
    })));

    const transformedCourses = coursesWithProgress.map(transformCourseData);
    return enrichCourses(transformedCourses);
};

export const getCoursesByTeacherId = async (teacherId: string): Promise<Course[]> => {
    const snapshot = await get(query(ref(db, 'courses'), orderByChild('teacherId'), equalTo(teacherId)));
    const teacherCourses = snapshotToArray(snapshot);
    const transformedCourses = teacherCourses.map(transformCourseData);
    return enrichCourses(transformedCourses);
};

export const createCourse = async (title: string, description: string, duration: string, teacherId: string): Promise<Course> => {
    const newCourseData = { title, description, duration, teacherId, studentsEnrolled: {}, modules: {} };
    const newCourseRef = await push(ref(db, 'courses'), newCourseData);
    return { id: newCourseRef.key!, ...newCourseData, studentsEnrolled: [], modules: [] };
};

export const enrollStudentInCourse = async (courseId: string, studentId: string): Promise<Course> => {
    const course = await getCourseById(courseId);
    
    if (course.prerequisites && course.prerequisites.length > 0) {
        const studentCourses = await getCoursesByStudentId(studentId);
        const completedCourseIds = new Set(studentCourses.filter(c => c.progress === 100).map(c => c.id));
        const missingPrereqs = course.prerequisites.filter(pId => !completedCourseIds.has(pId));
        if (missingPrereqs.length > 0) throw new Error(`Prerequisites not met.`);
    }

    await update(ref(db, `courses/${courseId}/studentsEnrolled`), { [studentId]: true });
    
    const student = await getUserById(studentId);
    if (student) {
        await createNotification(course.teacherId, `${student.name} has enrolled in your course: "${course.title}".`, `/courses/${courseId}/manage`);
    }
    
    return getCourseById(courseId);
};

export const getAssignmentsByCourseId = async (courseId: string): Promise<Assignment[]> => {
    const snapshot = await get(query(ref(db, 'assignments'), orderByChild('courseId'), equalTo(courseId)));
    return snapshotToArray(snapshot);
};

export const getAssignmentById = async (assignmentId: string): Promise<Assignment> => {
    const snapshot = await get(ref(db, `assignments/${assignmentId}`));
    if (!snapshot.exists()) throw new Error('Assignment not found');
    return { id: assignmentId, ...snapshot.val() };
};

export const getSubmissionsByAssignmentId = async (assignmentId: string): Promise<Submission[]> => {
    const snapshot = await get(query(ref(db, 'submissions'), orderByChild('assignmentId'), equalTo(assignmentId)));
    const submissions = snapshotToArray(snapshot);
    const enrichedSubmissions = await Promise.all(submissions.map(async (sub) => {
        const student = await getUserById(sub.studentId);
        return { ...sub, studentName: student.name };
    }));
    return enrichedSubmissions;
};

export const createSubmission = async (assignmentId: string, studentId: string, content: string, file?: File): Promise<Submission> => {
    const assignment = await getAssignmentById(assignmentId);
    let submissionFileUrl: string | undefined;
    let submissionFileName: string | undefined;

    if (file) {
        const filePath = `submissions/${assignment.courseId}/${assignmentId}/${studentId}/${file.name}`;
        const fileRef = storageRef(storage, filePath);
        await uploadBytes(fileRef, file);
        submissionFileUrl = await getDownloadURL(fileRef);
        submissionFileName = file.name;
    }
    
    const newSubmissionData: Omit<Submission, 'id' | 'studentName'> = { 
        assignmentId, studentId, content, grade: null, submissionFileUrl, submissionFileName 
    };
    const newSubmissionRef = await push(ref(db, 'submissions'), newSubmissionData);
    
    const student = await getUserById(studentId);
    if (student) {
        const course = await getCourseById(assignment.courseId);
        if (course) {
            await createNotification(course.teacherId, `${student.name} submitted an assignment for "${assignment.title}".`, `/assignments/${assignmentId}/submissions`);
        }
    }
    
    return { id: newSubmissionRef.key!, ...newSubmissionData, studentName: student.name };
};

export const gradeSubmission = async (submissionId: string, marks: { internal: number; external: number }, letterGrade: string, review: string, feedbackFile?: File): Promise<Submission> => {
    const submissionSnapshot = await get(ref(db, `submissions/${submissionId}`));
    const submission = { id: submissionId, ...submissionSnapshot.val() };
    const assignment = await getAssignmentById(submission.assignmentId);

    let feedbackFileUrl: string | undefined = submission.feedbackFileUrl;
    let feedbackFileName: string | undefined = submission.feedbackFileName;

    if (feedbackFile) {
        const filePath = `feedback/${assignment.courseId}/${assignment.id}/${submissionId}/${feedbackFile.name}`;
        const fileRef = storageRef(storage, filePath);
        await uploadBytes(fileRef, feedbackFile);
        feedbackFileUrl = await getDownloadURL(fileRef);
        feedbackFileName = feedbackFile.name;
    }

    const grade = {
=======

// --- API FUNCTIONS ---

export const login = async (email: string): Promise<{ token: string; user: User }> => {
    const user = users.find(u => u.email === email);
    if (!user) throw new Error('User not found');

    // --- Login Streak Logic ---
    if (user.role === Role.Student) {
        const today = new Date();
        const lastLogin = user.lastLogin ? new Date(user.lastLogin) : null;
        
        // Normalize dates to ignore time
        const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const lastLoginDate = lastLogin ? new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate()) : null;

        if (lastLoginDate) {
            const diffTime = todayDate.getTime() - lastLoginDate.getTime();
            const diffDays = diffTime / (1000 * 3600 * 24);

            if (diffDays === 1) {
                user.loginStreak = (user.loginStreak || 0) + 1; // Increment streak
            } else if (diffDays > 1) {
                user.loginStreak = 1; // Reset streak
            }
            // If diffDays is 0, do nothing (already logged in today)
        } else {
            user.loginStreak = 1; // First login
        }
        user.lastLogin = today.toISOString();

        // Award badges based on streak
        user.badges = user.badges || [];
        if (user.loginStreak >= 3 && !user.badges.some(b => b.id === 'badge-1')) {
            user.badges.push(allBadges.find(b => b.id === 'badge-1')!);
        }
        if (user.loginStreak >= 7 && !user.badges.some(b => b.id === 'badge-2')) {
            user.badges.push(allBadges.find(b => b.id === 'badge-2')!);
        }
    }

    return simulateDelay({ token: `fake-jwt-for-${user.id}`, user });
};

export const register = async (name: string, email: string, role: Role): Promise<{ token: string; user: User }> => {
    if (users.some(u => u.email === email)) throw new Error('Email already in use');
    const newUser: User = { 
        id: `user-${Date.now()}`, 
        name, 
        email, 
        role,
        loginStreak: 0,
        badges: []
    };
    users.push(newUser);
    return simulateDelay({ token: `fake-jwt-for-${newUser.id}`, user: newUser });
};

export const getUserById = async (userId: string): Promise<User> => {
    const user = users.find(u => u.id === userId);
    if (!user) throw new Error('User not found');
    return simulateDelay(JSON.parse(JSON.stringify(user))); // Return a deep copy
}

export const updateUser = async (userId: string, name: string, email: string): Promise<User> => {
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error('User not found');

    if (users.some(u => u.email === email && u.id !== userId)) {
        throw new Error('Email is already in use by another account.');
    }

    const user = users[userIndex];
    user.name = name;
    user.email = email;

    users[userIndex] = user;
    
    return simulateDelay(JSON.parse(JSON.stringify(user)));
};

export const getAllCourses = async (): Promise<Course[]> => {
    const coursesWithDetails = courses.map(course => {
        const teacher = users.find(u => u.id === course.teacherId);
        return { 
            ...course, 
            teacherName: teacher?.name || 'Unknown Teacher',
            averageRating: getAverageRating(course.id)
        };
    });
    return simulateDelay(coursesWithDetails);
};

export const getCourseById = async (courseId: string): Promise<Course> => {
    const course = courses.find(c => c.id === courseId);
    if (!course) throw new Error('Course not found');
    const teacher = users.find(u => u.id === course.teacherId);
    return simulateDelay({
        ...course,
        teacherName: teacher?.name || 'Unknown Teacher',
        averageRating: getAverageRating(courseId),
    });
};

export const getCoursesByStudentId = async (studentId: string): Promise<Course[]> => {
    const enrolledCourses = courses.filter(c => c.studentsEnrolled.includes(studentId));
    
    const coursesWithProgress = enrolledCourses.map(course => ({
        ...course, 
        progress: calculateProgress(course.id, studentId),
        averageRating: getAverageRating(course.id)
    }));

    return simulateDelay(coursesWithProgress);
};

export const getCoursesByTeacherId = async (teacherId: string): Promise<Course[]> => {
    const teacherCourses = courses.filter(c => c.teacherId === teacherId);
    const coursesWithRatings = teacherCourses.map(course => ({
        ...course,
        averageRating: getAverageRating(course.id)
    }));
    return simulateDelay(coursesWithRatings);
};


export const createCourse = async (title: string, description: string, duration: string, teacherId: string): Promise<Course> => {
    const teacher = users.find(u => u.id === teacherId);
    const newCourse: Course = { 
        id: `course-${Date.now()}`, 
        title, 
        description, 
        duration, 
        teacherId, 
        studentsEnrolled: [], 
        modules: [],
        teacherName: teacher?.name || 'Unknown Teacher'
    };
    courses.push(newCourse);
    return simulateDelay(newCourse);
};

export const enrollStudentInCourse = async (courseId: string, studentId: string): Promise<Course> => {
    const course = courses.find(c => c.id === courseId);
    if (!course) throw new Error('Course not found');

    if (course.studentsEnrolled.includes(studentId)) {
        console.warn('Student already enrolled');
        return simulateDelay(course); 
    }
    
    // --- Prerequisite Check ---
    if (course.prerequisites && course.prerequisites.length > 0) {
        const studentCourses = courses.filter(c => c.studentsEnrolled.includes(studentId));
        const completedCourseIds = studentCourses
            .filter(c => calculateProgress(c.id, studentId) === 100)
            .map(c => c.id);

        const missingPrereqs = course.prerequisites.filter(pId => !completedCourseIds.includes(pId));

        if (missingPrereqs.length > 0) {
            const missingCourseTitles = missingPrereqs
                .map(pId => courses.find(c => c.id === pId)?.title || 'Unknown Course')
                .join(', ');
            throw new Error(`Prerequisites not met. Please complete: ${missingCourseTitles}`);
        }
    }
    // --- End Prerequisite Check ---

    course.studentsEnrolled.push(studentId);

    // --- Add Notification ---
    const student = users.find(u => u.id === studentId);
    if (student) {
        createNotification(
            course.teacherId,
            `${student.name} has enrolled in your course: "${course.title}".`,
            `/courses/${courseId}/manage`
        );
    }
    // --- End Notification ---
    
    return simulateDelay(course);
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

    // --- Add Notification ---
    const student = users.find(u => u.id === studentId);
    const assignment = assignments.find(a => a.id === assignmentId);
    if (student && assignment) {
        const course = courses.find(c => c.id === assignment.courseId);
        if (course) {
            createNotification(
                course.teacherId,
                `${student.name} submitted an assignment for "${assignment.title}".`,
                `/assignments/${assignmentId}/submissions`
            );
        }
    }
    // --- End Notification ---
    
    return simulateDelay(newSubmission);
};


export const gradeSubmission = async (
    submissionId: string, 
    marks: { internal: number; external: number },
    letterGrade: string,
    review: string
): Promise<Submission> => {
    const submissionIndex = submissions.findIndex(s => s.id === submissionId);
    if (submissionIndex === -1) throw new Error('Submission not found');
    
    const submission = submissions[submissionIndex];
    submission.grade = {
>>>>>>> c5d459428a2fba052cd0e7654482653475d7bac3
        internal: marks.internal,
        external: marks.external,
        final: Math.round((marks.internal + marks.external) / 2)
    };
<<<<<<< HEAD
    
    await update(ref(db, `submissions/${submissionId}`), { grade, letterGrade, review, feedbackFileUrl, feedbackFileName });
    
    await createNotification(submission.studentId, `Your submission for "${assignment.title}" has been graded.`, `/grades`);
    
    return { ...submission, grade, letterGrade, review, feedbackFileUrl, feedbackFileName };
};

export const getEnrolledStudents = async (courseId: string): Promise<User[]> => {
    const courseSnapshot = await get(ref(db, `courses/${courseId}/studentsEnrolled`));
    if (!courseSnapshot.exists()) return [];
    const studentIds = Object.keys(courseSnapshot.val());
    const studentPromises = studentIds.map(id => getUserById(id));
    return Promise.all(studentPromises);
};

export const createAssignment = async (courseId: string, title: string, description: string, deadline: string): Promise<Assignment> => {
    const newAssignmentData = { courseId, title, description, deadline };
    const newAssignmentRef = await push(ref(db, 'assignments'), newAssignmentData);
    
    const course = await getCourseById(courseId);
    if (course) {
        const studentIds = course.studentsEnrolled || [];
        const notificationPromises = studentIds.map(studentId => 
            createNotification(studentId, `A new assignment "${title}" was added to "${course.title}".`, `/courses/${courseId}`)
        );
        await Promise.all(notificationPromises);
    }
    
    return { id: newAssignmentRef.key!, ...newAssignmentData };
};

export const createModule = async (courseId: string, title: string): Promise<Module> => {
    const newModuleData = { title, videos: {}, studyMaterials: {} };
    const newModuleRef = await push(ref(db, `courses/${courseId}/modules`), newModuleData);
    return { id: newModuleRef.key!, ...newModuleData, videos: [], studyMaterials: [] };
};

export const addVideoToModule = async (courseId: string, moduleId: string, title: string, url: string): Promise<Video> => {
    const newVideoData = { title, url };
    const newVideoRef = await push(ref(db, `courses/${courseId}/modules/${moduleId}/videos`), newVideoData);
    return { id: newVideoRef.key!, ...newVideoData };
};

export const addStudyMaterialToModule = async (courseId: string, moduleId: string, title: string, file: File): Promise<StudyMaterial> => {
    const filePath = `materials/${courseId}/${moduleId}/${file.name}`;
    const fileRef = storageRef(storage, filePath);
    await uploadBytes(fileRef, file);
    const fileUrl = await getDownloadURL(fileRef);
    
    const newMaterialData = { title, fileUrl, originalFileName: file.name };
    const newMaterialRef = await push(ref(db, `courses/${courseId}/modules/${moduleId}/studyMaterials`), newMaterialData);
    return { id: newMaterialRef.key!, ...newMaterialData };
};

export const getEnrichedSubmissionsByStudentId = async (studentId: string): Promise<EnrichedSubmission[]> => {
    const snapshot = await get(query(ref(db, 'submissions'), orderByChild('studentId'), equalTo(studentId)));
    const studentSubmissions = snapshotToArray(snapshot);
    
    const enrichedPromises = studentSubmissions.map(async (sub) => {
        const assignment = await getAssignmentById(sub.assignmentId);
        if (!assignment) return null;
        const course = await getCourseById(assignment.courseId);
=======
    submission.letterGrade = letterGrade;
    submission.review = review;

    // --- Add Notification ---
    const assignment = assignments.find(a => a.id === submission.assignmentId);
    if (assignment) {
        createNotification(
            submission.studentId,
            `Your submission for "${assignment.title}" has been graded.`,
            `/grades`
        );
    }
    // --- End Notification ---

    return simulateDelay(submission);
};

export const getEnrolledStudents = async (courseId: string): Promise<User[]> => {
    const course = courses.find(c => c.id === courseId);
    if(!course) throw new Error('Course not found');
    const studentIds = course.studentsEnrolled;
    const enrolledUsers = users.filter(user => studentIds.includes(user.id));
    return simulateDelay(enrolledUsers);
}

export const createAssignment = async (courseId: string, title: string, description: string, deadline: string): Promise<Assignment> => {
    const newAssignment: Assignment = { id: `assign-${Date.now()}`, courseId, title, description, deadline };
    assignments.push(newAssignment);

    // --- Add Notifications ---
    const course = courses.find(c => c.id === courseId);
    if (course) {
        course.studentsEnrolled.forEach(studentId => {
            createNotification(
                studentId,
                `A new assignment "${title}" was added to "${course.title}".`,
                `/courses/${courseId}`
            );
        });
    }
    // --- End Notifications ---

    return simulateDelay(newAssignment);
};

export const createModule = async (courseId: string, title: string): Promise<Module> => {
    const course = courses.find(c => c.id === courseId);
    if (!course) throw new Error('Course not found');
    if (!course.modules) course.modules = [];
    
    const newModule: Module = { id: `mod-${Date.now()}`, title, videos: [], studyMaterials: [] };
    course.modules.push(newModule);
    return simulateDelay(newModule);
};

export const addVideoToModule = async (courseId: string, moduleId: string, title: string, url: string): Promise<Video> => {
    const course = courses.find(c => c.id === courseId);
    const module = course?.modules?.find(m => m.id === moduleId);
    if (!module) throw new Error('Module not found');

    const newVideo: Video = { id: `vid-${Date.now()}`, title, url };
    module.videos.push(newVideo);
    return simulateDelay(newVideo);
};

export const addStudyMaterialToModule = async (courseId: string, moduleId: string, title: string, fileName: string): Promise<StudyMaterial> => {
    const course = courses.find(c => c.id === courseId);
    const module = course?.modules?.find(m => m.id === moduleId);
    if (!module) throw new Error('Module not found');
    
    const newMaterial: StudyMaterial = { id: `mat-${Date.now()}`, title, fileName };
    module.studyMaterials.push(newMaterial);
    return simulateDelay(newMaterial);
};

export const getEnrichedSubmissionsByStudentId = async (studentId: string): Promise<EnrichedSubmission[]> => {
    const studentSubmissions = submissions.filter(s => s.studentId === studentId);

    const enriched = studentSubmissions.map((sub): EnrichedSubmission | null => {
        const assignment = assignments.find(a => a.id === sub.assignmentId);
        if (!assignment) return null;
        
        const course = courses.find(c => c.id === assignment.courseId);
>>>>>>> c5d459428a2fba052cd0e7654482653475d7bac3
        return {
            ...sub,
            assignmentTitle: assignment.title,
            courseTitle: course?.title || 'Unknown Course',
            courseId: course?.id,
        };
<<<<<<< HEAD
    });
    const enriched = (await Promise.all(enrichedPromises)).filter(Boolean) as EnrichedSubmission[];
    return enriched;
};

export const createAnnouncement = async (courseId: string, title: string, content: string): Promise<Announcement> => {
    const newAnnouncementData = { courseId, title, content, createdAt: new Date().toISOString() };
    const newAnnouncementRef = await push(ref(db, 'announcements'), newAnnouncementData);
    
    const course = await getCourseById(courseId);
    const studentIds = course.studentsEnrolled || [];
    const notificationPromises = studentIds.map(studentId =>
        createNotification(studentId, `New announcement in "${course.title}": ${title}`, `/courses/${courseId}`)
    );
    await Promise.all(notificationPromises);
    
    return { id: newAnnouncementRef.key!, ...newAnnouncementData };
}

export const getAnnouncementsByCourseId = async (courseId: string): Promise<Announcement[]> => {
    const snapshot = await get(query(ref(db, 'announcements'), orderByChild('courseId'), equalTo(courseId)));
    return snapshotToArray(snapshot).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export const getAnnouncementsForStudent = async (studentId: string): Promise<Announcement[]> => {
    const enrolledCourses = await getCoursesByStudentId(studentId);
    const enrolledCourseIds = enrolledCourses.map(c => c.id);
    
    const announcementsSnapshot = await get(ref(db, 'announcements'));
    const allAnnouncements = snapshotToArray(announcementsSnapshot);
    
    const studentAnnouncements = allAnnouncements
        .filter(a => enrolledCourseIds.includes(a.courseId))
        .map(a => {
            const course = enrolledCourses.find(c => c.id === a.courseId);
            return { ...a, courseTitle: course?.title || 'Unknown Course' };
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
    return studentAnnouncements;
};

export const getNotificationsByUserId = async (userId: string): Promise<Notification[]> => {
    const snapshot = await get(query(ref(db, 'notifications'), orderByChild('userId'), equalTo(userId)));
    return snapshotToArray(snapshot).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const markNotificationsAsRead = async (userId: string): Promise<void> => {
    const snapshot = await get(query(ref(db, 'notifications'), orderByChild('userId'), equalTo(userId)));
    if (!snapshot.exists()) return;
    const updates: { [key: string]: boolean } = {};
    snapshot.forEach(childSnapshot => {
        if (!childSnapshot.val().read) {
            updates[`/notifications/${childSnapshot.key}/read`] = true;
        }
    });
    if (Object.keys(updates).length > 0) {
        await update(ref(db), updates);
    }
};

export const getReviewsByCourseId = async (courseId: string): Promise<Review[]> => {
    const snapshot = await get(query(ref(db, 'reviews'), orderByChild('courseId'), equalTo(courseId)));
    return snapshotToArray(snapshot).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const createReview = async (courseId: string, studentId: string, rating: number, comment: string): Promise<Review> => {
    const student = await getUserById(studentId);
    const newReviewData = { courseId, studentId, studentName: student.name, rating, comment, createdAt: new Date().toISOString() };
    const newReviewRef = await push(ref(db, 'reviews'), newReviewData);
    
    const course = await getCourseById(courseId);
    await createNotification(course.teacherId, `${student.name} left a ${rating}-star review on your course: "${course.title}".`, `/courses/${courseId}`);
    
    return { id: newReviewRef.key!, ...newReviewData };
};

export const getThreadsByCourseId = async (courseId: string): Promise<Thread[]> => {
    const snapshot = await get(query(ref(db, 'threads'), orderByChild('courseId'), equalTo(courseId)));
    const threads = snapshotToArray(snapshot);
    const enrichedThreads = await Promise.all(threads.map(async thread => {
        const repliesSnapshot = await get(query(ref(db, 'replies'), orderByChild('threadId'), equalTo(thread.id)));
        return { ...thread, replyCount: repliesSnapshot.exists() ? Object.keys(repliesSnapshot.val()).length : 0 };
    }));
    return enrichedThreads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const getThreadById = async (threadId: string): Promise<Thread> => {
    const snapshot = await get(ref(db, `threads/${threadId}`));
    if (!snapshot.exists()) throw new Error('Thread not found');
    const thread = { id: threadId, ...snapshot.val() };
    const repliesSnapshot = await get(query(ref(db, 'replies'), orderByChild('threadId'), equalTo(thread.id)));
    return { ...thread, replyCount: repliesSnapshot.exists() ? Object.keys(repliesSnapshot.val()).length : 0 };
};

export const getRepliesByThreadId = async (threadId: string): Promise<Reply[]> => {
    const snapshot = await get(query(ref(db, 'replies'), orderByChild('threadId'), equalTo(threadId)));
    return snapshotToArray(snapshot).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
};

export const createThread = async (courseId: string, title: string, content: string, authorId: string): Promise<Thread> => {
    const author = await getUserById(authorId);
    const newThreadData = { courseId, title, content, authorId, authorName: author.name, createdAt: new Date().toISOString() };
    const newThreadRef = await push(ref(db, 'threads'), newThreadData);
    
    const course = await getCourseById(courseId);
    await createNotification(course.teacherId, `${author.name} started a new discussion in "${course.title}": ${title}`, `/threads/${newThreadRef.key}`);
    
    return { id: newThreadRef.key!, ...newThreadData };
};

export const createReply = async (threadId: string, content: string, authorId: string): Promise<Reply> => {
    const author = await getUserById(authorId);
    const thread = await getThreadById(threadId);
    
    const newReplyData = { threadId, content, authorId, authorName: author.name, createdAt: new Date().toISOString() };
    const newReplyRef = await push(ref(db, 'replies'), newReplyData);
    
    const course = await getCourseById(thread.courseId);
    if (course.teacherId !== authorId) {
        await createNotification(course.teacherId, `${author.name} replied to a discussion in "${course.title}".`, `/threads/${threadId}`);
    }
    if (thread.authorId !== authorId) {
        await createNotification(thread.authorId, `${author.name} replied to your discussion: "${thread.title}".`, `/threads/${threadId}`);
    }
    
    return { id: newReplyRef.key!, ...newReplyData };
=======
    }).filter((sub): sub is EnrichedSubmission => sub !== null);

    return simulateDelay(enriched);
};

export const createAnnouncement = async (courseId: string, title: string, content: string): Promise<Announcement> => {
    const newAnnouncement: Announcement = {
        id: `anno-${Date.now()}`,
        courseId,
        title,
        content,
        createdAt: new Date().toISOString(),
    };
    announcements.push(newAnnouncement);

    // --- Add Notifications ---
    const course = courses.find(c => c.id === courseId);
    if (course) {
        course.studentsEnrolled.forEach(studentId => {
            createNotification(
                studentId,
                `New announcement in "${course.title}": ${title}`,
                `/courses/${courseId}`
            );
        });
    }
    // --- End Notifications ---

    return simulateDelay(newAnnouncement);
}

export const getAnnouncementsByCourseId = async (courseId: string): Promise<Announcement[]> => {
    const courseAnnouncements = announcements
        .filter(a => a.courseId === courseId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return simulateDelay(courseAnnouncements);
}

export const getAnnouncementsForStudent = async (studentId: string): Promise<Announcement[]> => {
    const enrolledCourseIds = courses
        .filter(c => c.studentsEnrolled.includes(studentId))
        .map(c => c.id);

    const studentAnnouncements = announcements
        .filter(a => enrolledCourseIds.includes(a.courseId))
        .map(a => {
            const course = courses.find(c => c.id === a.courseId);
            return { ...a, courseTitle: course?.title || 'Unknown Course' };
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return simulateDelay(studentAnnouncements);
};

export const getNotificationsByUserId = async (userId: string): Promise<Notification[]> => {
    const userNotifications = notifications
        .filter(n => n.userId === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return simulateDelay(userNotifications);
};

export const markNotificationsAsRead = async (userId: string): Promise<void> => {
    notifications.forEach(n => {
        if (n.userId === userId) {
            n.read = true;
        }
    });
    return simulateDelay(undefined);
};

// --- Review Functions ---
export const getReviewsByCourseId = async (courseId: string): Promise<Review[]> => {
    const courseReviews = reviews
        .filter(r => r.courseId === courseId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return simulateDelay(courseReviews);
};

export const createReview = async (courseId: string, studentId: string, rating: number, comment: string): Promise<Review> => {
    if (reviews.some(r => r.courseId === courseId && r.studentId === studentId)) {
        throw new Error('You have already reviewed this course.');
    }
    
    const student = users.find(u => u.id === studentId);
    if (!student) throw new Error('Student not found.');

    const newReview: Review = {
        id: `rev-${Date.now()}`,
        courseId,
        studentId,
        studentName: student.name,
        rating,
        comment,
        createdAt: new Date().toISOString(),
    };
    reviews.push(newReview);
    
    // --- Add Notification ---
    const course = courses.find(c => c.id === courseId);
    if (course) {
        createNotification(
            course.teacherId,
            `${student.name} left a ${rating}-star review on your course: "${course.title}".`,
            `/courses/${courseId}`
        );
    }
    // --- End Notification ---

    return simulateDelay(newReview);
};

// --- Forum Functions ---
export const getThreadsByCourseId = async (courseId: string): Promise<Thread[]> => {
    const courseThreads = threads
        .filter(t => t.courseId === courseId)
        .map(thread => ({
            ...thread,
            replyCount: replies.filter(r => r.threadId === thread.id).length
        }))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return simulateDelay(courseThreads);
};

export const getThreadById = async (threadId: string): Promise<Thread> => {
    const thread = threads.find(t => t.id === threadId);
    if (!thread) throw new Error('Thread not found');
    return simulateDelay({
        ...thread,
        replyCount: replies.filter(r => r.threadId === thread.id).length
    });
};

export const getRepliesByThreadId = async (threadId: string): Promise<Reply[]> => {
    const threadReplies = replies
        .filter(r => r.threadId === threadId)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    return simulateDelay(threadReplies);
};

export const createThread = async (courseId: string, title: string, content: string, authorId: string): Promise<Thread> => {
    const author = users.find(u => u.id === authorId);
    if (!author) throw new Error('Author not found');

    const newThread: Thread = {
        id: `thread-${Date.now()}`,
        courseId,
        title,
        content,
        authorId,
        authorName: author.name,
        createdAt: new Date().toISOString(),
    };
    threads.push(newThread);

    // --- Add Notification ---
    const course = courses.find(c => c.id === courseId);
    if (course) {
        createNotification(
            course.teacherId,
            `${author.name} started a new discussion in "${course.title}": ${title}`,
            `/threads/${newThread.id}`
        );
    }
    // --- End Notification ---

    return simulateDelay(newThread);
};

export const createReply = async (threadId: string, content: string, authorId: string): Promise<Reply> => {
    const author = users.find(u => u.id === authorId);
    if (!author) throw new Error('Author not found');
    
    const thread = threads.find(t => t.id === threadId);
    if (!thread) throw new Error('Thread not found');

    const newReply: Reply = {
        id: `reply-${Date.now()}`,
        threadId,
        content,
        authorId,
        authorName: author.name,
        createdAt: new Date().toISOString(),
    };
    replies.push(newReply);
    
    // --- Add Notification ---
    const course = courses.find(c => c.id === thread.courseId);
    if (course && course.teacherId !== authorId) { // Don't notify teacher if they are the one replying
        createNotification(
            course.teacherId,
            `${author.name} replied to a discussion in "${course.title}".`,
            `/threads/${threadId}`
        );
    }
    if (thread.authorId !== authorId) { // Don't notify author if they are replying to their own thread
        createNotification(
            thread.authorId,
            `${author.name} replied to your discussion: "${thread.title}".`,
            `/threads/${threadId}`
        );
    }
    // --- End Notification ---

    return simulateDelay(newReply);
>>>>>>> c5d459428a2fba052cd0e7654482653475d7bac3
};