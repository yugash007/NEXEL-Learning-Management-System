import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../../services/api';
import type { Course } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';

const NXLearnPage: React.FC = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCourses = async () => {
            if (user) {
                try {
                    const data = await api.getCoursesByTeacherId(user.id);
                    setCourses(data);
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
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">NX Learn Content Manager</h1>
            <p className="text-on-surface-secondary mb-8">Select a course to manage its modules, videos, and study materials.</p>
            
            <div className="bg-surface/70 backdrop-blur-sm border border-border-color rounded-xl shadow-lg">
                <ul className="divide-y divide-border-color">
                    {courses.length > 0 ? courses.map(course => (
                        <li key={course.id} className="p-4 flex items-center justify-between hover:bg-primary/10 transition-colors">
                            <div>
                                <h2 className="text-lg font-semibold text-on-surface">{course.title}</h2>
                                <p className="text-sm text-on-surface-secondary">{course.modules?.length || 0} modules</p>
                            </div>
                            <Link to={`/courses/${course.id}/modules`}>
                                <Button>Manage Content</Button>
                            </Link>
                        </li>
                    )) : (
                        <li className="p-6 text-center text-on-surface-secondary">You have not created any courses yet.</li>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default NXLearnPage;