import React, { useState, useEffect, useMemo } from 'react';
import * as api from '../../services/api';
import type { EnrichedSubmission } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import Spinner from '../../components/ui/Spinner';

const MyGradesPage: React.FC = () => {
    const { user } = useAuth();
    const [submissions, setSubmissions] = useState<EnrichedSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchGrades = async () => {
            if (!user) return;
            try {
                const enrichedSubmissions = await api.getEnrichedSubmissionsByStudentId(user.id);
                setSubmissions(enrichedSubmissions);
            } catch (err) {
                setError('Failed to load grades.');
            } finally {
                setLoading(false);
            }
        };

        fetchGrades();
    }, [user]);

    const groupedSubmissions = useMemo(() => {
        return submissions.reduce((acc, sub) => {
            const courseId = sub.courseId || 'unknown';
            if (!acc[courseId]) {
                acc[courseId] = { courseTitle: sub.courseTitle || 'Unknown Course', submissions: [] };
            }
            acc[courseId].submissions.push(sub);
            return acc;
        }, {} as Record<string, { courseTitle: string, submissions: EnrichedSubmission[] }>);
    }, [submissions]);

    if (loading) {
        return <div className="flex justify-center"><Spinner /></div>;
    }

    if (error) {
        return <p className="text-center text-red-500">{error}</p>;
    }

    return (
        <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">My Grades</h1>
            {Object.keys(groupedSubmissions).length > 0 ? (
                <div className="space-y-10">
                    {Object.entries(groupedSubmissions).map(([courseId, data]) => (
                        <div key={courseId}>
                            <h2 className="text-2xl font-bold mb-4">{data.courseTitle}</h2>
                            <div className="bg-surface/70 backdrop-blur-sm border border-border-color rounded-xl overflow-hidden shadow-lg">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-border-color">
                                        <thead className="bg-surface/50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-on-surface-secondary uppercase tracking-wider">Assignment</th>
                                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-on-surface-secondary uppercase tracking-wider">Internal</th>
                                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-on-surface-secondary uppercase tracking-wider">External</th>
                                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-on-surface-secondary uppercase tracking-wider">Final Grade</th>
                                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-on-surface-secondary uppercase tracking-wider">Letter Grade</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-on-surface-secondary uppercase tracking-wider">Review</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border-color">
                                            {data.submissions.map(sub => (
                                                <tr key={sub.id} className="hover:bg-primary/10 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-on-surface">{sub.assignmentTitle}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-on-surface-secondary">{sub.grade?.internal ?? 'N/A'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-on-surface-secondary">{sub.grade?.external ?? 'N/A'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-on-surface">
                                                        {sub.grade?.final !== null && sub.grade?.final !== undefined ? `${sub.grade.final}%` : 'Pending'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-on-surface-secondary">{sub.letterGrade || 'N/A'}</td>
                                                    <td className="px-6 py-4 text-sm text-on-surface-secondary min-w-[200px]">{sub.review || 'N/A'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                 <div className="text-center py-12 border-2 border-dashed border-border-color rounded-lg">
                    <h2 className="text-xl font-semibold text-on-surface">No Submissions Found</h2>
                    <p className="text-on-surface-secondary mt-2">Your grades will appear here once you've made submissions.</p>
                </div>
            )}
        </div>
    );
};

export default MyGradesPage;