import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../../services/api';
import type { Course, Announcement, User, Badge } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import CourseCard from '../../components/courses/CourseCard';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import FunFactWidget from '../../components/ui/FunFactWidget';

const StatCard: React.FC<{ value: number; label: string; icon: React.ReactNode }> = ({ value, label, icon }) => (
    <div className="bg-surface/70 backdrop-blur-sm border border-border-color p-4 rounded-xl shadow-lg flex items-center">
        <div className="p-3 rounded-full bg-primary/10 text-primary mr-4 border border-primary/20">
            {icon}
        </div>
        <div>
            <p className="text-2xl font-bold text-on-surface">{value}</p>
            <p className="text-sm text-on-surface-secondary">{label}</p>
        </div>
    </div>
);

const BadgeDisplay: React.FC<{ badge: Badge }> = ({ badge }) => (
    <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg flex items-center space-x-3" title={badge.description}>
        <span className="text-2xl">{badge.icon}</span>
        <div>
            <p className="font-semibold text-amber-300">{badge.name}</p>
            <p className="text-xs text-amber-400">{badge.description}</p>
        </div>
    </div>
);


const MyLearningPage: React.FC = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState<Course[]>([]);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [fullUser, setFullUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStudentData = useCallback(async () => {
        if (user) {
            try {
                setLoading(true);
                const [coursesData, announcementsData, userData] = await Promise.all([
                    api.getCoursesByStudentId(user.id),
                    api.getAnnouncementsForStudent(user.id),
                    api.getUserById(user.id) // Fetch full user to get streak/badges
                ]);
                setCourses(coursesData);
                setAnnouncements(announcementsData);
                setFullUser(userData);
            } catch (err) {
                setError('Failed to load your dashboard.');
            } finally {
                setLoading(false);
            }
        }
    }, [user]);

    useEffect(() => {
        fetchStudentData();
    }, [fetchStudentData]);

    const courseStats = useMemo(() => {
        const total = courses.length;
        const completed = courses.filter(c => c.progress === 100).length;
        const inProgress = total - completed;
        return { total, completed, inProgress };
    }, [courses]);

    if (loading) {
        return <div className="flex justify-center"><Spinner /></div>;
    }

    if (error) {
        return <p className="text-center text-red-500">{error}</p>;
    }

    return (
        <div className="space-y-12">
            <FunFactWidget />

            <section>
                <h2 className="text-2xl font-bold mb-4">At a Glance</h2>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard 
                        value={courseStats.total} 
                        label="Enrolled Courses"
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v11.494m-5.247-8.494l10.494 0M12 21.747c-5.247 0-9.5-4.253-9.5-9.5s4.253-9.5 9.5-9.5 9.5 4.253 9.5 9.5-4.253 9.5-9.5 9.5z" /></svg>}
                    />
                    <StatCard 
                        value={courseStats.inProgress} 
                        label="In Progress"
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    />
                    <StatCard 
                        value={courseStats.completed} 
                        label="Completed"
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    />
                </div>
            </section>

            <section>
                 <h2 className="text-2xl font-bold mb-4">Engagement</h2>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-surface/70 backdrop-blur-sm border border-border-color p-4 rounded-xl shadow-lg flex items-center">
                        <div className="p-3 rounded-full bg-red-500/10 text-red-400 mr-4 border border-red-500/20">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.657 7.343A8 8 0 0117.657 18.657z" /><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 16.121A3 3 0 1014.12 11.88a3 3 0 00-4.242 4.242z" /></svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-on-surface">{fullUser?.loginStreak || 0} Day{fullUser?.loginStreak !== 1 && 's'}</p>
                            <p className="text-sm text-on-surface-secondary">Login Streak</p>
                        </div>
                    </div>
                    <div className="md:col-span-2 bg-surface/70 backdrop-blur-sm border border-border-color p-4 rounded-xl shadow-lg">
                        <h3 className="font-semibold mb-3 text-on-surface">My Badges</h3>
                        {fullUser?.badges && fullUser.badges.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {fullUser.badges.map(badge => <BadgeDisplay key={badge.id} badge={badge} />)}
                            </div>
                        ) : (
                            <p className="text-sm text-center text-on-surface-secondary py-4">Keep logging in to earn new badges!</p>
                        )}
                    </div>
                 </div>
            </section>

            {announcements.length > 0 && (
                <section>
                    <h2 className="text-2xl font-bold mb-4">Recent Announcements</h2>
                    <div className="space-y-4">
                        {announcements.slice(0, 3).map(anno => (
                            <div key={anno.id} className="bg-surface/70 backdrop-blur-sm border border-border-color p-4 rounded-xl border-l-4 border-l-secondary">
                                <p className="text-xs font-semibold text-secondary">{anno.courseTitle}</p>
                                <h3 className="font-bold mt-1 text-on-surface">{anno.title}</h3>
                                <p className="text-sm text-on-surface-secondary mt-1">{anno.content}</p>
                                <p className="text-right text-xs text-on-surface-secondary mt-2">{new Date(anno.createdAt).toLocaleString()}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <section className="bg-surface/70 backdrop-blur-sm border border-border-color p-8 rounded-2xl shadow-lg text-center">
                <h2 className="text-2xl font-bold text-on-surface mb-2">Discover Your Next Course</h2>
                <p className="text-on-surface-secondary mb-6 max-w-xl mx-auto">
                    Expand your skillset and explore new topics. Our full course catalog is waiting for you.
                </p>
                <Link to="/">
                    <Button variant="secondary">Browse All Courses</Button>
                </Link>
            </section>

            <section>
                <h2 className="text-2xl font-bold mb-6">My Enrolled Courses</h2>
                {courses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {courses.map(course => (
                            <CourseCard key={course.id} course={course} onEnrollSuccess={fetchStudentData} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 border-2 border-dashed border-border-color rounded-lg">
                        <h2 className="text-xl font-semibold text-on-surface">Your learning space is empty.</h2>
                        <p className="text-on-surface-secondary mt-2">
                            Start your learning journey by exploring our courses.
                        </p>
                    </div>
                )}
            </section>
        </div>
    );
};

export default MyLearningPage;