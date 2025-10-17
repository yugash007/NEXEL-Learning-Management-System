import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import * as api from '../services/api';
import type { User, Badge } from '../types';
import { Role } from '../types';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';

const StatCard: React.FC<{ value: number | string; label: string; icon: React.ReactNode }> = ({ value, label, icon }) => (
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


const ProfilePage: React.FC = () => {
    const { user, updateUserContext } = useAuth();
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [fullUser, setFullUser] = useState<User | null>(null);
    
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');

    const [studentStats, setStudentStats] = useState({ completed: 0, inProgress: 0 });
    const [teacherStats, setTeacherStats] = useState({ coursesTaught: 0, totalStudents: 0 });

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            try {
                setLoading(true);
                const userData = await api.getUserById(user.id);
                setFullUser(userData);
                setName(userData.name);
                setEmail(userData.email);

                if (user.role === Role.Student) {
                    const courses = await api.getCoursesByStudentId(user.id);
                    const completed = courses.filter(c => c.progress === 100).length;
                    setStudentStats({ completed, inProgress: courses.length - completed });
                } else if (user.role === Role.Teacher) {
                    const courses = await api.getCoursesByTeacherId(user.id);
                    const totalStudents = courses.reduce((acc, course) => acc + course.studentsEnrolled.length, 0);
                    setTeacherStats({ coursesTaught: courses.length, totalStudents });
                }
            } catch (err) {
                setError('Failed to load profile data.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setError('');
        setSuccess('');
        setIsSaving(true);
        try {
            const updatedUser = await api.updateUser(user.id, name, email);
            updateUserContext(updatedUser);
            setSuccess('Profile updated successfully!');
            setTimeout(() => setSuccess(''), 3000); // Clear success message after 3 seconds
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update profile.');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center"><Spinner /></div>;
    }

    return (
        <div className="max-w-5xl mx-auto space-y-12">
            <h1 className="text-4xl font-bold">My Profile</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <form onSubmit={handleSubmit} className="lg:col-span-2 bg-surface/70 backdrop-blur-sm border border-border-color p-8 rounded-2xl shadow-2xl space-y-6">
                    <h2 className="text-2xl font-bold">Personal Information</h2>
                    {error && <p className="text-red-500 text-center text-sm">{error}</p>}
                    {success && <p className="text-green-400 text-center text-sm">{success}</p>}
                    
                    <Input
                        id="name"
                        label="Full Name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                    <Input
                        id="email"
                        label="Email Address"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    
                     <div>
                        <label className="block text-sm font-medium text-on-surface-secondary mb-1">Role</label>
                        <p className="mt-1 block w-full px-4 py-2.5 bg-surface/50 border border-border-color rounded-lg text-on-surface-secondary">{user?.role}</p>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button type="submit" isLoading={isSaving}>
                            Save Changes
                        </Button>
                    </div>
                </form>

                <div className="space-y-6">
                    <h2 className="text-2xl font-bold">My Status</h2>
                    {user?.role === Role.Student && fullUser && (
                        <>
                            <StatCard 
                                value={fullUser.loginStreak || 0}
                                label="Day Login Streak"
                                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.657 7.343A8 8 0 0117.657 18.657z" /></svg>}
                            />
                            <StatCard 
                                value={studentStats.completed}
                                label="Courses Completed"
                                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                            />
                            <div className="bg-surface/70 backdrop-blur-sm border border-border-color p-4 rounded-xl shadow-lg">
                                <h3 className="font-semibold mb-3 text-on-surface">My Badges</h3>
                                {fullUser.badges && fullUser.badges.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-3">
                                        {fullUser.badges.map(badge => <BadgeDisplay key={badge.id} badge={badge} />)}
                                    </div>
                                ) : (
                                    <p className="text-sm text-center text-on-surface-secondary py-4">No badges earned yet.</p>
                                )}
                            </div>
                        </>
                    )}
                    {user?.role === Role.Teacher && (
                         <>
                            <StatCard 
                                value={teacherStats.coursesTaught}
                                label="Courses Taught"
                                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v11.494m-5.247-8.494l10.494 0M12 21.747c-5.247 0-9.5-4.253-9.5-9.5s4.253-9.5 9.5-9.5 9.5 4.253 9.5 9.5-4.253 9.5-9.5 9.5z" /></svg>}
                            />
                             <StatCard 
                                value={teacherStats.totalStudents}
                                label="Total Students"
                                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                            />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
