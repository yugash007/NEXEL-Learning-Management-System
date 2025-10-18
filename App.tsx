import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import Header from './components/layout/Header';
import HomePage from './pages/public/HomePage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import NotFoundPage from './pages/public/NotFoundPage';
import ProtectedRoute from './components/layout/ProtectedRoute';
import CourseDetailPage from './pages/student/CourseDetailPage';
import SubmitAssignmentPage from './pages/student/SubmitAssignmentPage';
import MyGradesPage from './pages/student/MyGradesPage';
import CreateCoursePage from './pages/teacher/CreateCoursePage';
import ManageCoursePage from './pages/teacher/ManageCoursePage';
import ViewSubmissionsPage from './pages/teacher/ViewSubmissionsPage';
import { Role } from './types';
import NXLearnPage from './pages/teacher/NLearnPage';
import ManageModulesPage from './pages/teacher/ManageModulesPage';
import MyLearningPage from './pages/student/MyLearningPage';
import ReportsPage from './pages/student/ReportsPage';
import ProfilePage from './pages/ProfilePage';
import CourseForumPage from './pages/forum/CourseForumPage';
import ThreadPage from './pages/forum/ThreadPage';

const AppContent: React.FC = () => {
    const { user } = useAuth();
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow container mx-auto px-6 sm:px-8 py-16">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    {/* Common Protected Routes */}
                    <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                    <Route path="/courses/:courseId/forum" element={<ProtectedRoute><CourseForumPage /></ProtectedRoute>} />
                    <Route path="/threads/:threadId" element={<ProtectedRoute><ThreadPage /></ProtectedRoute>} />
                    
                    {/* Student Routes */}
                    <Route path="/my-learning" element={<ProtectedRoute requiredRole={Role.Student}><MyLearningPage /></ProtectedRoute>} />
                    <Route path="/courses/:courseId" element={<ProtectedRoute requiredRole={Role.Student}><CourseDetailPage /></ProtectedRoute>} />
                    <Route path="/assignments/:assignmentId/submit" element={<ProtectedRoute requiredRole={Role.Student}><SubmitAssignmentPage /></ProtectedRoute>} />
                    <Route path="/grades" element={<ProtectedRoute requiredRole={Role.Student}><MyGradesPage /></ProtectedRoute>} />
                    <Route path="/reports" element={<ProtectedRoute requiredRole={Role.Student}><ReportsPage /></ProtectedRoute>} />

                    {/* Teacher Routes */}
                    <Route path="/nxlearn" element={<ProtectedRoute requiredRole={Role.Teacher}><NXLearnPage /></ProtectedRoute>} />
                    <Route path="/courses/new" element={<ProtectedRoute requiredRole={Role.Teacher}><CreateCoursePage /></ProtectedRoute>} />
                    <Route path="/courses/:courseId/manage" element={<ProtectedRoute requiredRole={Role.Teacher}><ManageCoursePage /></ProtectedRoute>} />
                    <Route path="/courses/:courseId/modules" element={<ProtectedRoute requiredRole={Role.Teacher}><ManageModulesPage /></ProtectedRoute>} />
                    <Route path="/assignments/:assignmentId/submissions" element={<ProtectedRoute requiredRole={Role.Teacher}><ViewSubmissionsPage /></ProtectedRoute>} />

                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </main>
        </div>
    );
};


const App: React.FC = () => {
    return (
        <AuthProvider>
            <HashRouter>
                <AppContent />
            </HashRouter>
        </AuthProvider>
    );
};

export default App;