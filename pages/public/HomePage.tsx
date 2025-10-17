import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../../services/api';
import type { Course } from '../../types';
import CourseCard from '../../components/courses/CourseCard';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const Feature: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="flex flex-col items-center p-4 text-center">
        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary mb-4 border border-primary/20">
            {icon}
        </div>
        <h3 className="text-xl font-bold mb-2 text-on-surface">{title}</h3>
        <p className="text-on-surface-secondary max-w-xs">{children}</p>
    </div>
);


const HomePage: React.FC = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchCourses = useCallback(async () => {
        try {
            setLoading(true);
            const allCourses = await api.getAllCourses();
            setCourses(allCourses);
        } catch (err) {
            setError('Failed to load courses.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);
    
    // This function will be called by CourseCard on a successful enrollment
    const handleEnrollmentSuccess = () => {
        // Re-fetch courses to get the updated enrollment status for all cards
        fetchCourses();
    };

    const coursesToDisplay = useMemo(() => {
        const filtered = courses.filter(course =>
            course.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
        const reversed = [...filtered].reverse();
        return searchTerm ? reversed : reversed.slice(0, 6);
    }, [courses, searchTerm]);


    return (
        <div className="space-y-24 md:space-y-32">
            {/* Hero Section */}
            <section className="text-center pt-8 pb-16 relative">
                <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-background via-background to-primary/10 opacity-50"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 -z-10 bg-gradient-radial from-primary/10 to-transparent blur-3xl rounded-full"></div>
                
                <h1 className="text-5xl font-extrabold tracking-tight text-on-surface sm:text-6xl md:text-7xl">
                    The Next Level of Digital <span className="text-primary">Excellence</span>
                </h1>
                <p className="mt-6 max-w-2xl mx-auto text-lg text-on-surface-secondary md:text-xl">
                    NEXEL is where ambition meets opportunity. Elevate your skills with our cutting-edge courses designed for the future of work.
                </p>
                <div className="mt-10 flex justify-center gap-x-4">
                    <Link to="/register">
                        <Button variant="primary" className="text-lg px-8 py-3 !font-bold">Get Started Now</Button>
                    </Link>
                    <a href="#courses">
                        <Button variant="ghost" className="text-lg px-8 py-3">Explore Courses</Button>
                    </a>
                </div>
            </section>
            
            {/* Features Section */}
            <section className="container mx-auto">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    <Feature 
                        title="Expert-Led Courses" 
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                    >
                        Learn from industry leaders who are passionate about teaching and mentoring.
                    </Feature>
                    <Feature 
                        title="Interactive Learning"
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" /></svg>}
                    >
                        Engage with hands-on assignments, video content, and direct feedback.
                    </Feature>
                     <Feature 
                        title="Track Your Progress"
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-3.293 3.293m3.293-3.293l-3.293-3.293" /></svg>}
                    >
                        Monitor your grades and submissions easily through your personal dashboard.
                    </Feature>
                </div>
            </section>

            {/* Courses Section */}
            <section id="courses" className="scroll-mt-20">
                 <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold tracking-tight text-on-surface">Explore Our Courses</h2>
                    <p className="mt-3 max-w-2xl mx-auto text-lg text-on-surface-secondary">
                        Find the perfect course to help you achieve your career and personal goals.
                    </p>
                </div>
                <div className="max-w-xl mx-auto mb-12">
                    <Input
                        id="search-courses"
                        label=""
                        type="search"
                        placeholder="Search for courses like 'React', 'Node.js'..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {loading ? (
                    <div className="flex justify-center"><Spinner /></div>
                ) : error ? (
                    <p className="text-center text-red-500">{error}</p>
                ) : (
                    coursesToDisplay.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {coursesToDisplay.map(course => (
                                <CourseCard 
                                    key={course.id} 
                                    course={course} 
                                    onEnrollSuccess={handleEnrollmentSuccess}
                                />
                            ))}
                        </div>
                    ) : (
                         <div className="text-center py-12 border-2 border-dashed border-border-color rounded-lg">
                            <h2 className="text-xl font-semibold text-on-surface">
                                {searchTerm ? 'No Courses Found' : 'No Courses Available'}
                            </h2>
                            <p className="text-on-surface-secondary mt-2">
                                {searchTerm 
                                    ? "Try adjusting your search terms." 
                                    : "Please check back later for new courses."}
                            </p>
                        </div>
                    )
                )}
            </section>
            
            {/* Final CTA Section */}
            <section className="bg-surface/70 backdrop-blur-sm border border-border-color rounded-2xl shadow-lg p-12 text-center relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-full -z-10 bg-gradient-radial from-secondary/10 to-transparent blur-3xl"></div>
                <h2 className="text-3xl font-bold text-on-surface">Ready to Excel?</h2>
                <p className="mt-4 text-lg text-on-surface-secondary max-w-2xl mx-auto">
                    Join thousands of learners on NEXEL and take the next step in your professional journey. Create your account today.
                </p>
                <div className="mt-8">
                    <Link to="/register">
                        <Button variant="secondary" className="text-lg px-8 py-3 !font-bold">Sign Up for Free</Button>
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default HomePage;