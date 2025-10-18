
<<<<<<< HEAD

=======
>>>>>>> c5d459428a2fba052cd0e7654482653475d7bac3
import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { User } from '../types';
import { Role } from '../types';
import * as api from '../services/api';
<<<<<<< HEAD
import { auth } from '../firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
=======
>>>>>>> c5d459428a2fba052cd0e7654482653475d7bac3

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    isStudent: boolean;
    isTeacher: boolean;
<<<<<<< HEAD
    login: (email: string, password: string) => Promise<{ token: string; user: User; }>;
    logout: () => Promise<void>;
=======
    login: (token: string, user: User) => void;
    logout: () => void;
>>>>>>> c5d459428a2fba052cd0e7654482653475d7bac3
    updateUserContext: (updatedUser: User) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
<<<<<<< HEAD
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
            if (firebaseUser) {
                try {
                    const idToken = await firebaseUser.getIdToken();
                    const userProfile = await api.getUserById(firebaseUser.uid);
                    setToken(idToken);
                    setUser(userProfile);
                    localStorage.setItem('user', JSON.stringify(userProfile));
                    localStorage.setItem('token', idToken);
                } catch (error) {
                    if (error instanceof Error && error.message === 'User not found') {
                        // This is likely a new registration. The DB record hasn't been written yet.
                        // Poll for a short period to wait for the DB write to complete.
                        let userProfile: User | null = null;
                        for (let i = 0; i < 5; i++) { // Poll 5 times (2.5 seconds total)
                            await new Promise(res => setTimeout(res, 500));
                            try {
                                userProfile = await api.getUserById(firebaseUser.uid);
                                if (userProfile) break; // Found it, exit loop
                            } catch (pollError) {
                                // Ignore and continue polling
                            }
                        }

                        if (userProfile) {
                            const idToken = await firebaseUser.getIdToken();
                            setToken(idToken);
                            setUser(userProfile);
                            localStorage.setItem('user', JSON.stringify(userProfile));
                            localStorage.setItem('token', idToken);
                        } else {
                            console.error("Failed to fetch user profile after polling, logging out.", error);
                            await api.logout();
                        }
                    } else {
                        console.error("Failed to fetch user profile, logging out.", error);
                        await api.logout();
                    }
                }
            } else {
                setUser(null);
                setToken(null);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
            setLoading(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);
    
    const login = async (email: string, password: string) => {
        // The onAuthStateChanged listener will handle setting the state
        return api.login(email, password);
    };

    const logout = async () => {
        // The onAuthStateChanged listener will handle clearing the state
        await api.logout();
    };

=======
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
>>>>>>> c5d459428a2fba052cd0e7654482653475d7bac3

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
<<<<<<< HEAD
    }), [user, token, loading, isStudent, isTeacher]);
=======
    }), [user, token, loading, isStudent, isTeacher, logout]);
>>>>>>> c5d459428a2fba052cd0e7654482653475d7bac3

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};