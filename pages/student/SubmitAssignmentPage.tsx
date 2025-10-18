import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as api from '../../services/api';
import type { Assignment } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';

const SubmitAssignmentPage: React.FC = () => {
    const { assignmentId } = useParams<{ assignmentId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [assignment, setAssignment] = useState<Assignment | null>(null);
    const [content, setContent] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!assignmentId) return;
        const fetchAssignment = async () => {
            try {
                const data = await api.getAssignmentById(assignmentId);
                setAssignment(data);
            } catch (err) {
                setError('Failed to load assignment.');
            } finally {
                setLoading(false);
            }
        };
        fetchAssignment();
    }, [assignmentId]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
<<<<<<< HEAD
        if (!assignmentId || !user || (!content.trim() && !file)) {
            setError('Please provide a submission text or upload a file.');
=======
        if (!assignmentId || !user || (!content && !file)) {
            setError('Please provide a submission.');
>>>>>>> c5d459428a2fba052cd0e7654482653475d7bac3
            return;
        };

        setSubmitting(true);
        setError(null);
        try {
<<<<<<< HEAD
            await api.createSubmission(assignmentId, user.id, content, file || undefined);
=======
            const submissionContent = file ? `File: ${file.name}` : content;
            await api.createSubmission(assignmentId, user.id, submissionContent);
>>>>>>> c5d459428a2fba052cd0e7654482653475d7bac3
            navigate(`/courses/${assignment?.courseId}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to submit.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center"><Spinner /></div>;
    }

    if (error && !assignment) {
        return <p className="text-center text-red-500">{error}</p>;
    }

    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">Submit: {assignment?.title}</h1>
            {assignment?.deadline && (
                <div className="mb-4 flex items-center text-md text-red-400 font-semibold">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    Deadline: {new Date(assignment.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            )}
            <p className="text-on-surface-secondary mb-6">{assignment?.description}</p>


            <form onSubmit={handleSubmit} className="bg-surface/70 backdrop-blur-sm border border-border-color p-8 rounded-2xl space-y-6">
                <div>
                    <label htmlFor="submission-content" className="block text-sm font-medium text-on-surface-secondary mb-1">
                        Your Submission (Text)
                    </label>
                    <textarea
                        id="submission-content"
                        rows={10}
                        className="mt-1 block w-full bg-surface border border-border-color rounded-lg placeholder-on-surface-secondary focus:ring-2 focus:ring-primary focus:border-primary text-on-surface transition-colors duration-200 disabled:bg-surface/50 disabled:cursor-not-allowed"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
<<<<<<< HEAD
=======
                        required={!file}
>>>>>>> c5d459428a2fba052cd0e7654482653475d7bac3
                        disabled={!!file}
                    />
                </div>
                
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border-color" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-surface text-on-surface-secondary">OR</span>
                    </div>
                </div>


                <div>
                    <label htmlFor="file-upload" className="block text-sm font-medium text-on-surface-secondary mb-1">
                        Upload a File
                    </label>
                    <div className="mt-1">
                        <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="block w-full text-sm text-on-surface-secondary
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-primary/10 file:text-primary
                                hover:file:bg-primary/20
                                disabled:opacity-50 disabled:cursor-not-allowed"
                            onChange={handleFileChange}
<<<<<<< HEAD
                            disabled={!!content.trim()}
=======
                            required={!content}
                            disabled={!!content}
>>>>>>> c5d459428a2fba052cd0e7654482653475d7bac3
                        />
                    </div>
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}
                <div className="flex justify-end pt-4">
                    <Button type="submit" isLoading={submitting}>
                        Submit Assignment
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default SubmitAssignmentPage;