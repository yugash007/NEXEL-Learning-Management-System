import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as api from '../../services/api';
import type { Course, Assignment, User, Announcement } from '../../types';
import Spinner from '../../components/ui/Spinner';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const ManageCoursePage: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const [course, setCourse] = useState<Course | null>(null);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [students, setStudents] = useState<User[]>([]);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [newAssignmentTitle, setNewAssignmentTitle] = useState('');
    const [newAssignmentDesc, setNewAssignmentDesc] = useState('');
    const [newAssignmentDeadline, setNewAssignmentDeadline] = useState('');
    const [isSubmittingAssignment, setIsSubmittingAssignment] = useState(false);

    const [newAnnouncementTitle, setNewAnnouncementTitle] = useState('');
    const [newAnnouncementContent, setNewAnnouncementContent] = useState('');
    const [isSubmittingAnnouncement, setIsSubmittingAnnouncement] = useState(false);

    const fetchCourseData = useCallback(async () => {
        if (!courseId) return;
        try {
            const courseData = await api.getCourseById(courseId);
            const assignmentsData = await api.getAssignmentsByCourseId(courseId);
            const studentsData = await api.getEnrolledStudents(courseId);
            const announcementsData = await api.getAnnouncementsByCourseId(courseId);
            setCourse(courseData);
            setAssignments(assignmentsData);
            setStudents(studentsData);
            setAnnouncements(announcementsData);
        } catch (err) {
            setError('Failed to load course data.');
        } finally {
            setLoading(false);
        }
    }, [courseId]);

    useEffect(() => {
        fetchCourseData();
    }, [fetchCourseData]);

    const handleCreateAssignment = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!courseId || !newAssignmentTitle || !newAssignmentDesc || !newAssignmentDeadline) return;
        setIsSubmittingAssignment(true);
        try {
            await api.createAssignment(courseId, newAssignmentTitle, newAssignmentDesc, newAssignmentDeadline);
            setNewAssignmentTitle('');
            setNewAssignmentDesc('');
            setNewAssignmentDeadline('');
            await fetchCourseData();
        } catch(err) {
            setError("Failed to create assignment");
        } finally {
            setIsSubmittingAssignment(false);
        }
    }
    
    const handleCreateAnnouncement = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!courseId || !newAnnouncementTitle || !newAnnouncementContent) return;
        setIsSubmittingAnnouncement(true);
        try {
            await api.createAnnouncement(courseId, newAnnouncementTitle, newAnnouncementContent);
            setNewAnnouncementTitle('');
            setNewAnnouncementContent('');
            await fetchCourseData();
        } catch (err) {
            setError("Failed to post announcement");
        } finally {
            setIsSubmittingAnnouncement(false);
        }
    };


    if (loading) return <div className="flex justify-center"><Spinner /></div>;
    if (error) return <p className="text-center text-red-500">{error}</p>;
    if (!course) return <p className="text-center">Course not found.</p>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <div>
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold">{course.title}</h1>
                            <p className="text-on-surface-secondary mt-2 max-w-2xl">Manage assignments, announcements, and view enrolled students for this course.</p>
                        </div>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                            <Link to={`/courses/${course.id}/forum`}>
                                <Button variant="ghost">View Forum</Button>
                            </Link>
                            <Link to={`/courses/${course.id}/modules`}>
                                <Button variant="secondary">Manage Content</Button>
                            </Link>
                        </div>
                    </div>
                </div>

                <section>
                    <h2 className="text-2xl font-bold mb-4">Announcements</h2>
                    <form onSubmit={handleCreateAnnouncement} className="bg-surface/70 backdrop-blur-sm border border-border-color p-6 rounded-2xl space-y-6 mb-6">
                        <h3 className="text-lg font-semibold">Post New Announcement</h3>
                        <Input id="anno-title" label="Title" value={newAnnouncementTitle} onChange={e => setNewAnnouncementTitle(e.target.value)} required />
                        <div>
                            <label htmlFor="anno-content" className="block text-sm font-medium text-on-surface-secondary mb-1">Content</label>
                            <textarea id="anno-content" rows={4} value={newAnnouncementContent} onChange={e => setNewAnnouncementContent(e.target.value)} required className="mt-1 block w-full bg-surface border border-border-color rounded-lg placeholder-on-surface-secondary focus:ring-2 focus:ring-primary focus:border-primary text-on-surface transition-colors duration-200" />
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit" isLoading={isSubmittingAnnouncement}>Post Announcement</Button>
                        </div>
                    </form>
                    
                    <div className="space-y-4">
                        {announcements.length > 0 ? announcements.map(anno => (
                            <div key={anno.id} className="bg-surface/70 backdrop-blur-sm border border-border-color p-4 rounded-xl">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-bold">{anno.title}</h4>
                                    <span className="text-xs text-on-surface-secondary">{new Date(anno.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p className="mt-2 text-on-surface-secondary">{anno.content}</p>
                            </div>
                        )) : <p className="text-center text-on-surface-secondary py-4">No announcements posted yet.</p>}
                    </div>
                </section>


                <section>
                    <h2 className="text-2xl font-bold mb-4">Assignments</h2>
                    <div className="bg-surface/70 backdrop-blur-sm border border-border-color rounded-xl mb-6 overflow-hidden">
                        <ul className="divide-y divide-border-color">
                            {assignments.length > 0 ? assignments.map(a => (
                                <li key={a.id} className="p-4 flex justify-between items-center hover:bg-primary/10 transition-colors">
                                    <div>
                                      <p>{a.title}</p>
                                      {a.deadline && <p className="text-xs text-on-surface-secondary">Deadline: {new Date(a.deadline).toLocaleDateString()}</p>}
                                    </div>
                                    <Link to={`/assignments/${a.id}/submissions`} className="font-semibold text-primary hover:text-primary-hover transition-colors">
                                        View Submissions
                                    </Link>
                                </li>
                            )) : <li className="p-6 text-center text-on-surface-secondary">No assignments created yet.</li>}
                        </ul>
                    </div>
                     <form onSubmit={handleCreateAssignment} className="bg-surface/70 backdrop-blur-sm border border-border-color p-6 rounded-2xl space-y-6">
                        <h3 className="text-lg font-semibold">Create New Assignment</h3>
                        <Input id="assign-title" label="Title" value={newAssignmentTitle} onChange={e => setNewAssignmentTitle(e.target.value)} required />
                        <div>
                            <label htmlFor="assign-desc" className="block text-sm font-medium text-on-surface-secondary mb-1">Description</label>
                            <textarea id="assign-desc" rows={4} value={newAssignmentDesc} onChange={e => setNewAssignmentDesc(e.target.value)} required className="mt-1 block w-full bg-surface border border-border-color rounded-lg placeholder-on-surface-secondary focus:ring-2 focus:ring-primary focus:border-primary text-on-surface transition-colors duration-200" />
                        </div>
                        <Input id="assign-deadline" label="Deadline" type="date" value={newAssignmentDeadline} onChange={e => setNewAssignmentDeadline(e.target.value)} required />
                        <div className="flex justify-end">
                            <Button type="submit" isLoading={isSubmittingAssignment}>Create Assignment</Button>
                        </div>
                    </form>
                </section>
            </div>

            <aside>
                <h2 className="text-2xl font-bold mb-4">Enrolled Students ({students.length})</h2>
                 <div className="bg-surface/70 backdrop-blur-sm border border-border-color rounded-xl overflow-hidden shadow-lg">
                    <ul className="divide-y divide-border-color">
                        {students.length > 0 ? students.map(s => (
                            <li key={s.id} className="p-4">
                                <p className="font-semibold">{s.name}</p>
                                <p className="text-sm text-on-surface-secondary">{s.email}</p>
                            </li>
                        )) : <li className="p-6 text-center text-on-surface-secondary">No students enrolled.</li>}
                    </ul>
                </div>
            </aside>
        </div>
    );
};

export default ManageCoursePage;