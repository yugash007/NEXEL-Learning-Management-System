
import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { User } from '../types';
import { Role } from '../types';
import * as api from '../services/api';

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    isStudent: boolean;
    isTeacher: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
    updateUserContext: (updatedUser: User) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [loading, setLoading] = useState<boolean>(true);

    const logout = useCallback(() => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }, []);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            try {
                const parsedUser: User = JSON.parse(storedUser);
                setUser(parsedUser);
            } catch (error) {
                console.error("Failed to parse user from localStorage", error);
                logout();
            }
        }
        setLoading(false);
    }, [logout]);

    const login = (newToken: string, newUser: User) => {
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
    };

    const updateUserContext = (updatedUser: User) => {
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    const isStudent = useMemo(() => user?.role === Role.Student, [user]);
    const isTeacher = useMemo(() => user?.role === Role.Teacher, [user]);

    const value = useMemo(() => ({
        user,
        token,
        loading,
        isStudent,
        isTeacher,
        login,
        logout,
        updateUserContext
    }), [user, token, loading, isStudent, isTeacher, logout]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};