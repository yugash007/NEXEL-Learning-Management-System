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

const allBadges: Badge[] = [
    { id: 'badge-1', name: 'Consistent Learner', description: 'Logged in for 3 consecutive days.', icon: '🥉' },
    { id: 'badge-2', name: 'Dedicated Student', description: 'Logged in for 7 consecutive days.', icon: '🏆' },
];

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
        userId,
        message,
        link,
        createdAt: new Date().toISOString(),
        read: false,
    };
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
    );
    return Math.round((studentSubmissionsForCourse.length / courseAssignments.length) * 100);
};

const getAverageRating = async (courseId: string): Promise<number | undefined> => {
    const reviewsSnapshot = await get(query(ref(db, 'reviews'), orderByChild('courseId'), equalTo(courseId)));
    const courseReviews = snapshotToArray(reviewsSnapshot);

    if (courseReviews.length === 0) return undefined;
    const sum = courseReviews.reduce((acc, review) => acc + review.rating, 0);
    return parseFloat((sum / courseReviews.length).toFixed(1));
};

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
        internal: marks.internal,
        external: marks.external,
        final: Math.round((marks.internal + marks.external) / 2)
    };
    
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
        return {
            ...sub,
            assignmentTitle: assignment.title,
            courseTitle: course?.title || 'Unknown Course',
            courseId: course?.id,
        };
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
};