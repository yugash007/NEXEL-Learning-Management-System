
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../../services/api';
import type { Course } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import CourseCard from '../../components/courses/CourseCard';
import Spinner from '../../components/ui/Spinner';

const MyCoursesPage: React.FC = () => {
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
                    setError('Failed to load your courses.');
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
        <div>
            <h1 className="text-3xl font-bold mb-6">My Courses</h1>
            {courses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {courses.map(course => (
                        <CourseCard key={course.id} course={course} />
                    ))}
                </div>
            ) : (
                <p>You are not enrolled in any courses yet. Visit the <Link to="/" className="text-primary hover:underline">homepage</Link> to enroll.</p>
            )}
        </div>
    );
};

export default MyCoursesPage;
