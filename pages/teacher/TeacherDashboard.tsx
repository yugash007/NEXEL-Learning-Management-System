import React, { useState, useEffect } from 'react';
import * as api from '../../services/api';
import type { Course } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import CourseCard from '../../components/courses/CourseCard';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { Link } from 'react-router-dom';
import FunFactWidget from '../../components/ui/FunFactWidget';

const TeacherDashboard: React.FC = () => {
    const { user } = useAuth();
    const [myCourses, setMyCourses] = useState<Course[]>([]);
    const [allCourses, setAllCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCourses = async () => {
            if (user) {
                try {
                    setLoading(true);
                    const [teacherCourses, allPlatformCourses] = await Promise.all([
                        api.getCoursesByTeacherId(user.id),
                        api.getAllCourses()
                    ]);
                    setMyCourses(teacherCourses);
                    setAllCourses(allPlatformCourses);
                } catch (err) {
                    setError('Failed to load courses.');
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchCourses();
    }, [user]);

    if (loading) {
        return <div className="flex justify-center"><Spinner /></div>;
    }

    if (error) {
        return <p className="text-center text-red-500">{error}</p>;
    }

    return (
        <div className="space-y-12">
            <FunFactWidget />
            
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">My Courses</h1>
                    <Link to="/courses/new">
                        <Button variant="primary">Create New Course</Button>
                    </Link>
                </div>
                {myCourses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {myCourses.map(course => (
                            <CourseCard key={course.id} course={course} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 border-2 border-dashed border-border-color rounded-lg">
                        <h2 className="text-xl font-semibold text-on-surface">No courses found</h2>
                        <p className="text-on-surface-secondary mt-2">Get started by creating your first course.</p>
                    </div>
                )}
            </div>

            <div>
                 <h1 className="text-3xl font-bold mb-6">Explore All Courses</h1>
                 {allCourses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {allCourses.map(course => (
                            <CourseCard key={course.id} course={course} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 border-2 border-dashed border-border-color rounded-lg">
                        <h2 className="text-xl font-semibold text-on-surface">No courses available on the platform yet.</h2>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeacherDashboard;