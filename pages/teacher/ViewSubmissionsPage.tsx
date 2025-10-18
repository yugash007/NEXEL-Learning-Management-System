import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import * as api from '../../services/api';
import type { Assignment, Submission } from '../../types';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';

const GradingForm: React.FC<{ submission: Submission; onGrade: (submissionId: string, marks: { internal: number; external: number }, letterGrade: string, review: string) => void }> = ({ submission, onGrade }) => {
    const [internalGrade, setInternalGrade] = useState(submission.grade?.internal?.toString() || '');
    const [externalGrade, setExternalGrade] = useState(submission.grade?.external?.toString() || '');
    const [letterGrade, setLetterGrade] = useState(submission.letterGrade || '');
    const [review, setReview] = useState(submission.review || '');
    const [isEditing, setIsEditing] = useState(!submission.grade);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        const internal = parseInt(internalGrade, 10);
        const external = parseInt(externalGrade, 10);
        if (isNaN(internal) || internal < 0 || internal > 100 || isNaN(external) || external < 0 || external > 100) {
            alert('Please enter valid marks between 0 and 100.');
            return;
        }
        setIsSaving(true);
        await onGrade(submission.id, { internal, external }, letterGrade, review);
        setIsSaving(false);
        setIsEditing(false);
    };

    if (!isEditing) {
        return (
            <div>
                <div className="grid grid-cols-3 gap-4 mb-2">
                    <div>
                        <p className="text-xs text-on-surface-secondary">Internal</p>
                        <p className="font-bold">{submission.grade?.internal}%</p>
                    </div>
                     <div>
                        <p className="text-xs text-on-surface-secondary">External</p>
                        <p className="font-bold">{submission.grade?.external}%</p>
                    </div>
                     <div>
                        <p className="text-xs text-on-surface-secondary">Final</p>
                        <p className="font-bold text-lg text-primary">{submission.grade?.final}%</p>
                    </div>
                </div>
                {submission.letterGrade && <p className="font-semibold">Letter Grade: {submission.letterGrade}</p>}
                {submission.review && <p className="mt-2 text-sm text-on-surface-secondary italic p-3 bg-surface rounded-md">"{submission.review}"</p>}
                <button onClick={() => setIsEditing(true)} className="mt-4 text-sm text-secondary hover:underline">
                    Edit Grade/Review
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex space-x-4">
                <div>
                    <label htmlFor={`internal-grade-${submission.id}`} className="block text-sm font-medium text-on-surface-secondary mb-1">Internal (100)</label>
                    <input id={`internal-grade-${submission.id}`} type="number" min="0" max="100" value={internalGrade} onChange={(e) => setInternalGrade(e.target.value)} className="mt-1 w-24 px-2 py-1 bg-surface border border-border-color rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"/>
                </div>
                 <div>
                    <label htmlFor={`external-grade-${submission.id}`} className="block text-sm font-medium text-on-surface-secondary mb-1">External (100)</label>
                    <input id={`external-grade-${submission.id}`} type="number" min="0" max="100" value={externalGrade} onChange={(e) => setExternalGrade(e.target.value)} className="mt-1 w-24 px-2 py-1 bg-surface border border-border-color rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"/>
                </div>
                 <div>
                    <label htmlFor={`letter-grade-${submission.id}`} className="block text-sm font-medium text-on-surface-secondary mb-1">Letter Grade</label>
                    <input id={`letter-grade-${submission.id}`} type="text" value={letterGrade} onChange={(e) => setLetterGrade(e.target.value)} className="mt-1 w-24 px-2 py-1 bg-surface border border-border-color rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm" placeholder="e.g., A+"/>
                </div>
            </div>
             <div>
                <label htmlFor={`review-${submission.id}`} className="block text-sm font-medium text-on-surface-secondary mb-1">Review / Feedback</label>
                <textarea
                    id={`review-${submission.id}`}
                    rows={4}
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    className="mt-1 block w-full bg-surface border border-border-color rounded-lg placeholder-on-surface-secondary focus:ring-2 focus:ring-primary focus:border-primary text-on-surface transition-colors duration-200"
                    placeholder="Provide constructive feedback..."
                />
            </div>
            <div className="flex items-center space-x-4">
                <Button onClick={handleSave} variant="secondary" isLoading={isSaving}>Save Grade</Button>
                {submission.grade !== null && <button onClick={() => setIsEditing(false)} className="text-sm text-on-surface-secondary hover:underline">Cancel</button>}
            </div>
        </div>
    );
};

const ViewSubmissionsPage: React.FC = () => {
    const { assignmentId } = useParams<{ assignmentId: string }>();
    const [assignment, setAssignment] = useState<Assignment | null>(null);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSubmissions = useCallback(async () => {
        if (!assignmentId) return;
        setLoading(true);
        try {
            const assignmentData = await api.getAssignmentById(assignmentId);
            const submissionsData = await api.getSubmissionsByAssignmentId(assignmentId);
            setAssignment(assignmentData);
            setSubmissions(submissionsData);
        } catch (err) {
            setError('Failed to load submissions.');
        } finally {
            setLoading(false);
        }
    }, [assignmentId]);

    useEffect(() => {
        fetchSubmissions();
    }, [fetchSubmissions]);

    const handleGradeSubmission = async (submissionId: string, marks: { internal: number, external: number }, letterGrade: string, review: string) => {
        try {
            await api.gradeSubmission(submissionId, marks, letterGrade, review);
            setSubmissions(prev => prev.map(s => s.id === submissionId ? { ...s, grade: { ...marks, final: Math.round((marks.internal + marks.external) / 2)}, letterGrade, review } : s));
        } catch (err) {
            alert('Failed to save grade.');
        }
    };
    
    const renderSubmissionContent = (submission: Submission) => {
        if (submission.submissionFileUrl) {
            return (
                 <div className="flex items-center p-4 bg-surface rounded-md border border-border-color">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-on-surface-secondary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <a href={submission.submissionFileUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate" download={submission.submissionFileName}>
                        {submission.submissionFileName}
                    </a>
                </div>
            );
        }
        if (submission.content) {
            return <p className="whitespace-pre-wrap p-4 bg-surface rounded-md border border-border-color text-on-surface-secondary">{submission.content}</p>;
        }
        return <p className="p-4 text-center text-on-surface-secondary italic">No content submitted.</p>;
    };

    if (loading) return <div className="flex justify-center"><Spinner /></div>;
    if (error) return <p className="text-center text-red-500">{error}</p>;

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">Submissions for: {assignment?.title}</h1>
            <p className="text-on-surface-secondary mb-8">{assignment?.description}</p>
            
            <div className="space-y-6">
                {submissions.length > 0 ? submissions.map(sub => (
                    <div key={sub.id} className="bg-surface/70 backdrop-blur-sm border border-border-color rounded-xl overflow-hidden shadow-lg">
                        <div className="p-4 border-b border-border-color bg-surface/50">
                            <h2 className="text-lg font-bold">{sub.studentName}</h2>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-semibold mb-2">Submission Content</h3>
                                {renderSubmissionContent(sub)}
                            </div>
                            <div>
                                <h3 className="font-semibold mb-2">Grade & Review</h3>
                                <GradingForm submission={sub} onGrade={handleGradeSubmission} />
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-12 border-2 border-dashed border-border-color rounded-lg">
                        <h2 className="text-xl font-semibold text-on-surface">No submissions yet</h2>
                        <p className="text-on-surface-secondary mt-2">Check back later to review student work.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ViewSubmissionsPage;