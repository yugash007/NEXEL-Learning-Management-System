import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import TeacherDashboard from './teacher/TeacherDashboard';
import Spinner from '../components/ui/Spinner';
import { Role } from '../types';

const DashboardPage: React.FC = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="flex justify-center items-center h-64"><Spinner /></div>;
    }

    if (!user) {
        // This case is largely handled by ProtectedRoute, but as a fallback:
        return <Navigate to="/login" replace />;
    }

    if (user.role === Role.Student) {
        // Redirect students to their primary learning page
        return <Navigate to="/my-learning" replace />;
    }

    if (user.role === Role.Teacher) {
        return <TeacherDashboard />;
    }

    return <p className="text-center">Invalid user role.</p>;
};

export default DashboardPage;