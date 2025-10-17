import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import * as api from '../../services/api';
import type { Notification } from '../../types';
import Button from '../ui/Button';

const Header: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    const fetchNotifications = useCallback(async () => {
        if (user) {
            const userNotifications = await api.getNotificationsByUserId(user.id);
            setNotifications(userNotifications);
        }
    }, [user]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };
    
    const handleNotificationClick = async () => {
        setShowNotifications(prev => !prev);
        if (!showNotifications && unreadCount > 0) {
            await api.markNotificationsAsRead(user!.id);
            fetchNotifications(); // Re-fetch to update read status
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const timeSince = (date: string) => {
        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + "y ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + "mo ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + "d ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + "h ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + "m ago";
        return Math.floor(seconds) + "s ago";
    };

    return (
        <header className="bg-background/80 backdrop-blur-lg border-b border-border-color sticky top-0 z-50">
            <nav className="container mx-auto px-6 sm:px-8 py-4 flex justify-between items-center">
                <Link to="/" className="text-2xl font-bold text-on-surface tracking-wider">
                    NEXEL
                </Link>
                <div className="flex items-center space-x-4">
                    {user ? (
                        <>
                            <span className="text-on-surface-secondary hidden sm:inline">Welcome, {user.name}</span>
                            {user.role === 'Student' && (
                                <>
                                    <Link to="/my-learning">
                                      <Button variant="ghost">My Learning</Button>
                                    </Link>
                                    <Link to="/grades">
                                      <Button variant="ghost">My Grades</Button>
                                    </Link>
                                    <Link to="/reports">
                                      <Button variant="ghost">Reports</Button>
                                    </Link>
                                </>
                            )}
                             {user.role === 'Teacher' && (
                                <>
                                     <Link to="/dashboard">
                                        <Button variant="ghost">Dashboard</Button>
                                     </Link>
                                    <Link to="/nxlearn">
                                      <Button variant="ghost">NX Learn</Button>
                                    </Link>
                                </>
                            )}
                            <Link to="/profile">
                                <Button variant="ghost">Profile</Button>
                            </Link>
                            <div className="relative" ref={notificationRef}>
                                <button onClick={handleNotificationClick} className="relative text-on-surface-secondary hover:text-on-surface focus:outline-none transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white ring-2 ring-background">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>
                                {showNotifications && (
                                    <div className="absolute right-0 mt-4 w-80 max-h-96 overflow-y-auto bg-surface rounded-lg shadow-2xl border border-border-color z-20">
                                        <div className="p-4 font-bold border-b border-border-color">Notifications</div>
                                        {notifications.length > 0 ? (
                                            <ul>
                                                {notifications.map(n => (
                                                    <li key={n.id} className="border-b border-border-color last:border-b-0 hover:bg-primary/10 transition-colors">
                                                        <Link to={n.link} onClick={() => setShowNotifications(false)} className="block p-4">
                                                            <p className="text-sm text-on-surface">{n.message}</p>
                                                            <p className="text-xs text-on-surface-secondary mt-1">{timeSince(n.createdAt)}</p>
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="p-4 text-sm text-center text-on-surface-secondary">No new notifications.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                            <Button onClick={handleLogout} variant="secondary">Logout</Button>
                        </>
                    ) : (
                        <>
                            <Link to="/login">
                                <Button variant="ghost">Login</Button>
                            </Link>
                            <Link to="/register">
                                <Button variant="primary">Register</Button>
                            </Link>
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
};

export default Header;