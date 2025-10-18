import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../../services/api';
import type { Course } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import CourseCard from '../../components/courses/CourseCard';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';

const StudentDashboard: React.FC = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEnrolledCourses = async () => {
            if (user) {
                try {
                    const data = await api.getCoursesByStudentId(user.id);
                    setCourses(data);
                } catch (err) {
                    setError('Failed to load enrolled courses.');
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchEnrolledCourses();
    }, [user]);

    if (loading) {
        return <div className="flex justify-center"><Spinner /></div>;
    }

    if (error) {
        return <p className="text-center text-red-500">{error}</p>;
    }

    return (
        <div className="space-y-12">
            <h1 className="text-3xl font-bold">Student Dashboard</h1>
            
            <div className="bg-surface p-6 rounded-lg shadow-md border-l-4 border-primary">
                <h2 className="text-2xl font-bold text-on-surface mb-2">Discover Your Next Course</h2>
                <p className="text-on-surface-secondary mb-4">
                    Expand your skillset and explore new topics. Our full course catalog is waiting for you.
                </p>
                <Link to="/">
                    <Button variant="secondary">Browse All Courses</Button>
                </Link>
            </div>

            <div>
                <h2 className="text-2xl font-bold mb-6">My Enrolled Courses</h2>
                {courses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {courses.map(course => (
                            <CourseCard key={course.id} course={course} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                         <h2 className="text-xl font-semibold text-on-surface">You haven't enrolled in any courses yet.</h2>
                        <p className="text-on-surface-secondary mt-2">Start your learning journey by exploring our courses!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentDashboard;