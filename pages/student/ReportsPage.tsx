import React, { useState, useEffect, useMemo } from 'react';
import * as api from '../../services/api';
import type { EnrichedSubmission } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import Spinner from '../../components/ui/Spinner';
import BarChart from '../../components/ui/BarChart';
import Button from '../../components/ui/Button';

const ReportsPage: React.FC = () => {
    const { user } = useAuth();
    const [submissions, setSubmissions] = useState<EnrichedSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchGrades = async () => {
            if (!user) return;
            try {
                const enrichedSubmissions = await api.getEnrichedSubmissionsByStudentId(user.id);
                setSubmissions(enrichedSubmissions.filter(s => s.grade && s.grade.final !== null));
            } catch (err) {
                setError('Failed to load grade data.');
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

    const handleDownloadReport = () => {
        if (!user) return;
        // @ts-ignore - jspdf is loaded via CDN
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        doc.setFillColor(13, 17, 23); // background
        doc.rect(0, 0, 210, 297, 'F');
        doc.setTextColor(249, 250, 251); // on-surface

        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('NEXEL Report Card', 105, 20, { align: 'center' });

        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        doc.text(`Student: ${user.name}`, 14, 35);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 42);

        let startY = 55;

        Object.values(groupedSubmissions).forEach(data => {
            if (startY > 260) {
                doc.addPage();
                doc.setFillColor(13, 17, 23);
                doc.rect(0, 0, 210, 297, 'F');
                startY = 20;
            }

            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text(data.courseTitle, 14, startY);
            startY += 8;

            const tableColumn = ["Assignment", "Final Grade (%)", "Letter Grade"];
            const tableRows: (string | number)[][] = [];
            
            let totalGrade = 0;
            let gradedAssignmentsCount = 0;
            
            data.submissions.forEach(sub => {
                if (sub.grade?.final !== null && sub.grade?.final !== undefined) {
                    const submissionData = [
                        sub.assignmentTitle || 'N/A',
                        sub.grade.final,
                        sub.letterGrade || 'N/A'
                    ];
                    tableRows.push(submissionData);
                    totalGrade += sub.grade.final;
                    gradedAssignmentsCount++;
                }
            });
            
            // @ts-ignore
            doc.autoTable({
                head: [tableColumn],
                body: tableRows,
                startY: startY,
                theme: 'grid',
                headStyles: { fillColor: [139, 92, 246] }, // primary
                styles: {
                    fillColor: [31, 41, 55], // surface
                    textColor: [249, 250, 251],
                    lineColor: [55, 65, 81] // border-color
                }
            });
            
            // @ts-ignore
            startY = doc.lastAutoTable.finalY + 10;
            
            if (gradedAssignmentsCount > 0) {
                const courseAverage = (totalGrade / gradedAssignmentsCount).toFixed(2);
                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.text(`Course Average: ${courseAverage}%`, 14, startY);
                startY += 15;
            }
        });

        doc.save(`NEXEL_Report_Card_${user.name.replace(/\s/g, '_')}.pdf`);
    };

    if (loading) {
        return <div className="flex justify-center"><Spinner /></div>;
    }

    if (error) {
        return <p className="text-center text-red-500">{error}</p>;
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">My Performance Reports</h1>
                {Object.keys(groupedSubmissions).length > 0 && (
                     <Button onClick={handleDownloadReport} variant="secondary">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                        Download Report Card
                    </Button>
                )}
            </div>
            {Object.keys(groupedSubmissions).length > 0 ? (
                <div className="space-y-12">
                    {Object.entries(groupedSubmissions).map(([courseId, data]) => {
                        const chartData = data.submissions.map(s => ({
                           label: s.assignmentTitle || 'Unnamed Assignment',
                           value: s.grade!.final!
                        }));

                        return (
                            <div key={courseId} className="bg-surface/70 backdrop-blur-sm border border-border-color p-6 rounded-2xl shadow-2xl">
                                <h2 className="text-2xl font-bold mb-4">{data.courseTitle} - Grade Distribution</h2>
                                {chartData.length > 0 ? (
                                    <BarChart data={chartData} title="Final Grades per Assignment" />
                                ) : (
                                    <p>No graded assignments to display for this course yet.</p>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-12 border-2 border-dashed border-border-color rounded-lg">
                    <h2 className="text-xl font-semibold text-on-surface">No Graded Submissions Found</h2>
                    <p className="text-on-surface-secondary mt-2">Your performance reports will appear here once your assignments are graded.</p>
                </div>
            )}
        </div>
    );
};

export default ReportsPage;