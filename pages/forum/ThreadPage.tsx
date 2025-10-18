import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as api from '../../services/api';
import type { Thread, Reply, Course } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';

const timeSince = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
};

const PostCard: React.FC<{ post: { authorName: string, createdAt: string, content: string } }> = ({ post }) => (
    <div className="bg-surface/70 backdrop-blur-sm border border-border-color rounded-2xl overflow-hidden">
        <div className="p-4 bg-surface/50 border-b border-border-color text-sm text-on-surface-secondary flex justify-between items-center">
            <span>Posted by <span className="font-semibold text-on-surface">{post.authorName}</span></span>
            <span>{timeSince(post.createdAt)}</span>
        </div>
        <div className="p-6 whitespace-pre-wrap">
            <p>{post.content}</p>
        </div>
    </div>
);


const ThreadPage: React.FC = () => {
    const { threadId } = useParams<{ threadId: string }>();
    const { user } = useAuth();
    const [thread, setThread] = useState<Thread | null>(null);
    const [replies, setReplies] = useState<Reply[]>([]);
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [newReplyContent, setNewReplyContent] = useState('');
    const [isReplying, setIsReplying] = useState(false);

    const fetchData = useCallback(async () => {
        if (!threadId) return;
        setLoading(true);
        try {
            const threadData = await api.getThreadById(threadId);
            const repliesData = await api.getRepliesByThreadId(threadId);
            const courseData = await api.getCourseById(threadData.courseId);
            setThread(threadData);
            setReplies(repliesData);
            setCourse(courseData);
        } catch (err) {
            setError('Failed to load discussion thread.');
        } finally {
            setLoading(false);
        }
    }, [threadId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handlePostReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!threadId || !user || !newReplyContent.trim()) return;
        setIsReplying(true);
        try {
            await api.createReply(threadId, newReplyContent, user.id);
            setNewReplyContent('');
            await fetchData(); // Refresh replies
        } catch (err) {
            alert('Failed to post reply.');
        } finally {
            setIsReplying(false);
        }
    };

    if (loading) return <div className="flex justify-center"><Spinner /></div>;
    if (error) return <p className="text-center text-red-500">{error}</p>;
    if (!thread || !course) return <p className="text-center">Thread not found.</p>;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <Link to={`/courses/${course.id}/forum`} className="text-sm text-primary hover:underline mb-2 block">
                    &larr; Back to {course.title} Forum
                </Link>
                <h1 className="text-3xl font-bold">{thread.title}</h1>
            </div>

            <div className="space-y-6">
                <PostCard post={thread} />
                {replies.map(reply => (
                    <PostCard key={reply.id} post={reply} />
                ))}
            </div>

            <div>
                <form onSubmit={handlePostReply} className="bg-surface/70 backdrop-blur-sm border border-border-color p-6 rounded-2xl shadow-2xl">
                    <h2 className="text-xl font-bold mb-4">Post a Reply</h2>
                    <textarea
                        rows={5}
                        value={newReplyContent}
                        onChange={(e) => setNewReplyContent(e.target.value)}
                        placeholder="Share your thoughts..."
                        required
                        className="w-full bg-surface border border-border-color rounded-lg placeholder-on-surface-secondary focus:ring-2 focus:ring-primary focus:border-primary text-on-surface transition-colors duration-200"
                    />
                    <div className="flex justify-end mt-4">
                        <Button type="submit" isLoading={isReplying}>
                            Post Reply
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ThreadPage;
