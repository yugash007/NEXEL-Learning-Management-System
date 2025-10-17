import React, { useState, useEffect } from 'react';
import type { Course } from '../../types';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import * as api from '../../services/api';
import Button from '../ui/Button';
import StarRating from '../ui/StarRating';

interface CourseCardProps {
    course: Course;
    onEnrollSuccess?: () => void; // Callback to notify parent of enrollment
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onEnrollSuccess }) => {
    const { user } = useAuth();

    const [isEnrolled, setIsEnrolled] = useState(
        () => user?.role === 'Student' && course.studentsEnrolled.includes(user.id)
    );
    const [isEnrolling, setIsEnrolling] = useState(false);
    const [prereqsMet, setPrereqsMet] = useState(false);
    const [missingPrereqs, setMissingPrereqs] = useState<string[]>([]);
    const [loadingPrereqs, setLoadingPrereqs] = useState(true);

    // Effect to sync enrollment status if the course prop changes from the parent
    useEffect(() => {
        setIsEnrolled(user?.role === 'Student' && course.studentsEnrolled.includes(user.id));
    }, [course.studentsEnrolled, user]);

    // Effect to check prerequisites for a student
    useEffect(() => {
        const checkPrerequisites = async () => {
            if (!user || user.role !== 'Student' || !course.prerequisites || course.prerequisites.length === 0) {
                setPrereqsMet(true);
                setLoadingPrereqs(false);
                return;
            }

            setLoadingPrereqs(true);
            try {
                const studentCourses = await api.getCoursesByStudentId(user.id);
                const completedCourseIds = new Set(
                    studentCourses.filter(c => c.progress === 100).map(c => c.id)
                );

                const missing = course.prerequisites.filter(pId => !completedCourseIds.has(pId));
                
                if (missing.length === 0) {
                    setPrereqsMet(true);
                } else {
                    setPrereqsMet(false);
                    // Fetch full course objects for missing prereqs to get their titles
                    const allCourses = await api.getAllCourses();
                    const missingTitles = missing.map(pId => 
                        allCourses.find(c => c.id === pId)?.title || 'Unknown Course'
                    );
                    setMissingPrereqs(missingTitles);
                }
            } catch (error) {
                console.error("Failed to check prerequisites", error);
                setPrereqsMet(false); // Fail safe
            } finally {
                setLoadingPrereqs(false);
            }
        };

        checkPrerequisites();
    }, [course.prerequisites, user]);


    const handleEnroll = async () => {
        if (!user || user.role !== 'Student') return;

        setIsEnrolling(true);
        try {
            await api.enrollStudentInCourse(course.id, user.id);
            setIsEnrolled(true);
            // Notify the parent component that enrollment was successful
            if (onEnrollSuccess) {
                onEnrollSuccess();
            }
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Could not enroll in course.');
        } finally {
            setIsEnrolling(false);
        }
    };

    const handleDownloadCertificate = () => {
        if (!user || !course) return;

        // @ts-ignore - jspdf is loaded from CDN
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

        const studentName = user.name;
        const courseTitle = course.title;
        const teacherName = course.teacherName || 'The NEXEL Team';
        const completionDate = new Date().toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric',
        });
        
        // Use dark theme for certificate
        doc.setFillColor(31, 41, 55); // surface color
        doc.rect(0, 0, 297, 210, 'F');
        doc.setTextColor(249, 250, 251); // on-surface color

        doc.setLineWidth(1.5);
        doc.setDrawColor(139, 92, 246); // primary color
        doc.rect(5, 5, 287, 200);

        doc.setFontSize(40);
        doc.setFont('helvetica', 'bold');
        doc.text('Certificate of Completion', 148.5, 40, { align: 'center' });
        doc.setFontSize(20);
        doc.setFont('helvetica', 'normal');
        doc.text('This certificate is proudly presented to', 148.5, 65, { align: 'center' });
        doc.setFontSize(32);
        doc.setFont('helvetica', 'bold');
        doc.text(studentName, 148.5, 90, { align: 'center' });
        doc.setLineWidth(0.5);
        doc.line(80, 95, 218.5, 95);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'normal');
        doc.text('For successfully completing the course', 148.5, 115, { align: 'center' });
        doc.setFontSize(28);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(56, 189, 248); // secondary color
        doc.text(`"${courseTitle}"`, 148.5, 135, { align: 'center' });
        doc.setTextColor(249, 250, 251); // on-surface color
        doc.setFontSize(16);
        doc.setFont('helvetica', 'normal');
        doc.text('Date of Completion', 70, 170, { align: 'center' });
        doc.setLineWidth(0.5);
        doc.line(50, 175, 90, 175);
        doc.text(completionDate, 70, 182, { align: 'center' });
        doc.text('Instructor', 228.5, 170, { align: 'center' });
        doc.line(208.5, 175, 248.5, 175);
        doc.text(teacherName, 228.5, 182, { align: 'center' });
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(139, 92, 246); // primary color
        doc.text('NEXEL Learning Platform', 148.5, 195, { align: 'center' });

        doc.save(`NEXEL_Certificate_${courseTitle.replace(/\s/g, '_')}.pdf`);
    };

    const renderFooter = () => {
        if (!user) {
            return null;
        }

        if (user.role === 'Teacher' && user.id === course.teacherId) {
            return (
                <Link to={`/courses/${course.id}/manage`} className="font-semibold text-primary hover:text-primary-hover transition-colors">
                    Manage Course
                </Link>
            );
        }

        if (user.role === 'Student') {
            if (isEnrolled) {
                 if (course.progress === 100) {
                    return (
                        <div className="flex items-center space-x-2">
                            <Link to={`/courses/${course.id}`} className="text-sm font-semibold text-primary hover:text-primary-hover transition-colors">
                                View Course
                            </Link>
                            <Button onClick={handleDownloadCertificate} variant="secondary" className="!px-3 !py-1.5 !text-xs !font-bold">
                                Certificate
                            </Button>
                        </div>
                    );
                }
                return (
                    <Link to={`/courses/${course.id}`} className="font-semibold text-primary hover:text-primary-hover transition-colors">
                        View Course
                    </Link>
                );
            } else {
                 const isEnrollDisabled = !prereqsMet || loadingPrereqs;
                 const tooltipText = `Prerequisites not met. Complete: ${missingPrereqs.join(', ')}`;

                return (
                    <div className="relative group/tooltip">
                        <Button 
                            onClick={handleEnroll} 
                            isLoading={isEnrolling || loadingPrereqs} 
                            variant="secondary"
                            disabled={isEnrollDisabled}
                        >
                            Enroll
                        </Button>
                        {isEnrollDisabled && !loadingPrereqs && (
                             <div className="absolute bottom-full mb-2 w-max max-w-xs p-2.5 text-xs text-white bg-primary rounded-lg shadow-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none">
                                {tooltipText}
                            </div>
                        )}
                    </div>
                );
            }
        }
        
        return null;
    };

    const footerContent = renderFooter();

    return (
        <div className="bg-surface/70 backdrop-blur-sm border border-border-color rounded-2xl shadow-lg hover:shadow-glow-primary transition-all duration-300 transform hover:-translate-y-2 flex flex-col group overflow-hidden">
            <div className="p-6 flex-grow flex flex-col">
                <h3 className="text-xl font-bold text-on-surface mb-3">{course.title}</h3>
                <div className="flex items-center space-x-2 mb-4">
                    {course.averageRating !== undefined ? (
                        <>
                            <StarRating rating={course.averageRating} />
                            <span className="text-xs font-bold text-amber-400">{course.averageRating.toFixed(1)}</span>
                        </>
                    ) : (
                        <span className="text-xs text-on-surface-secondary">No reviews yet</span>
                    )}
                </div>
                <p className="text-on-surface-secondary text-sm flex-grow">{course.description}</p>
                 <div className="text-xs text-on-surface-secondary space-y-1 mt-6">
                    <p>Instructor: {course.teacherName}</p>
                    <p>Duration: {course.duration}</p>
                </div>
                {/* Progress Bar for Students */}
                {user?.role === 'Student' && typeof course.progress === 'number' && (
                    <div className="mt-6">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-semibold text-on-surface-secondary">Progress</span>
                            <span className="text-xs font-bold text-primary">{course.progress}%</span>
                        </div>
                        <div className="w-full bg-border-color rounded-full h-2 overflow-hidden">
                            <div className="bg-primary h-2 rounded-full" style={{ width: `${course.progress}%` }}></div>
                        </div>
                    </div>
                )}
            </div>
            {footerContent && (
                 <div className="bg-surface/50 px-6 py-4 flex justify-end items-center border-t border-border-color">
                    {footerContent}
                </div>
            )}
        </div>
    );
};

export default CourseCard;