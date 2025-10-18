import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as api from '../../services/api';
import type { Course, Thread } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const timeSince = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return `${Math.floor(interval)} year${Math.floor(interval) > 1 ? 's' : ''} ago`;
    interval = seconds / 2592000;
    if (interval > 1) return `${Math.floor(interval)} month${Math.floor(interval) > 1 ? 's' : ''} ago`;
    interval = seconds / 86400;
    if (interval > 1) return `${Math.floor(interval)} day${Math.floor(interval) > 1 ? 's' : ''} ago`;
    interval = seconds / 3600;
    if (interval > 1) return `${Math.floor(interval)} hour${Math.floor(interval) > 1 ? 's' : ''} ago`;
    interval = seconds / 60;
    if (interval > 1) return `${Math.floor(interval)} minute${Math.floor(interval) > 1 ? 's' : ''} ago`;
    return `${Math.floor(seconds)} second${Math.floor(seconds) > 1 ? 's' : ''} ago`;
};

const CourseForumPage: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const { user } = useAuth();
    const [course, setCourse] = useState<Course | null>(null);
    const [threads, setThreads] = useState<Thread[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchData = useCallback(async () => {
        if (!courseId) return;
        setLoading(true);
        try {
            const [courseData, threadsData] = await Promise.all([
                api.getCourseById(courseId),
                api.getThreadsByCourseId(courseId),
            ]);
            setCourse(courseData);
            setThreads(threadsData);
        } catch (err) {
            setError('Failed to load forum data.');
        } finally {
            setLoading(false);
        }
    }, [courseId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCreateThread = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!courseId || !user) return;
        setIsSubmitting(true);
        try {
            await api.createThread(courseId, newTitle, newContent, user.id);
            setNewTitle('');
            setNewContent('');
            setShowCreateForm(false);
            await fetchData(); // Refresh threads
        } catch (err) {
            alert('Failed to create discussion.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="flex justify-center"><Spinner /></div>;
    if (error) return <p className="text-center text-red-500">{error}</p>;

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Discussion Forum</h1>
                    <p className="text-lg text-on-surface-secondary mt-1">{course?.title}</p>
                </div>
                <Button variant="primary" onClick={() => setShowCreateForm(!showCreateForm)}>
                    {showCreateForm ? 'Cancel' : 'Start New Discussion'}
                </Button>
            </div>

            {showCreateForm && (
                <div className="bg-surface/70 backdrop-blur-sm border border-border-color p-6 rounded-2xl shadow-2xl mb-8">
                    <form onSubmit={handleCreateThread} className="space-y-4">
                        <Input
                            id="thread-title"
                            label="Discussion Title"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            required
                        />
                        <div>
                            <label htmlFor="thread-content" className="block text-sm font-medium text-on-surface-secondary mb-1">Your Message</label>
                            <textarea
                                id="thread-content"
                                rows={6}
                                value={newContent}
                                onChange={(e) => setNewContent(e.target.value)}
                                required
                                className="mt-1 block w-full bg-surface border border-border-color rounded-lg placeholder-on-surface-secondary focus:ring-2 focus:ring-primary focus:border-primary text-on-surface transition-colors duration-200"
                            />
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit" isLoading={isSubmitting}>Post Discussion</Button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-surface/70 backdrop-blur-sm border border-border-color rounded-xl overflow-hidden shadow-lg">
                <ul className="divide-y divide-border-color">
                    {threads.length > 0 ? threads.map(thread => (
                        <li key={thread.id}>
                            <Link to={`/threads/${thread.id}`} className="block p-4 hover:bg-primary/10 transition-colors">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-lg font-semibold text-on-surface">{thread.title}</h2>
                                        <p className="text-xs text-on-surface-secondary mt-1">
                                            By {thread.authorName} - {timeSince(thread.createdAt)}
                                        </p>
                                    </div>
                                    <div className="text-center flex-shrink-0 ml-4">
                                        <p className="font-bold text-lg">{thread.replyCount}</p>
                                        <p className="text-xs text-on-surface-secondary">replies</p>
                                    </div>
                                </div>
                            </Link>
                        </li>
                    )) : (
                        <li className="p-8 text-center text-on-surface-secondary">
                            No discussions have been started yet. Be the first!
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default CourseForumPage;
