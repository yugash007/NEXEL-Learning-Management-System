import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as api from '../../services/api';
import type { Course, Assignment, EnrichedAssignment, Video, Module, Announcement, Review, StudyMaterial } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import Spinner from '../../components/ui/Spinner';
import StarRating from '../../components/ui/StarRating';
import Button from '../../components/ui/Button';

// Review Form Component
const ReviewForm: React.FC<{ courseId: string; onReviewSubmitted: () => void; }> = ({ courseId, onReviewSubmitted }) => {
    const { user } = useAuth();
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            setError('Please select a star rating.');
            return;
        }
        if (!user) return;

        setIsSubmitting(true);
        setError('');
        try {
            await api.createReview(courseId, user.id, rating, comment);
            onReviewSubmitted(); // Callback to refresh reviews list
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to submit review.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-surface/70 backdrop-blur-sm border border-border-color p-6 rounded-2xl space-y-4">
            <h3 className="text-xl font-bold">Leave a Review</h3>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div>
                <label className="block text-sm font-medium text-on-surface-secondary mb-2">Your Rating</label>
                <StarRating rating={rating} onRatingChange={setRating} isInteractive />
            </div>
            <div>
                 <label htmlFor="comment" className="block text-sm font-medium text-on-surface-secondary">Your Comment (optional)</label>
                 <textarea
                    id="comment"
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="mt-1 block w-full bg-surface border border-border-color rounded-lg placeholder-on-surface-secondary focus:ring-2 focus:ring-primary focus:border-primary text-on-surface transition-colors duration-200"
                    placeholder="Tell us what you thought of the course..."
                 />
            </div>
            <div className="flex justify-end">
                <Button type="submit" isLoading={isSubmitting}>Submit Review</Button>
            </div>
        </form>
    );
};


const CourseDetailPage: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const { user } = useAuth();
    const [course, setCourse] = useState<Course | null>(null);
    const [assignments, setAssignments] = useState<EnrichedAssignment[]>([]);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [prerequisiteCourses, setPrerequisiteCourses] = useState<Course[]>([]);
    const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State and refs for the custom video player
    const playerRef = useRef<any>(null);
    const playerContainerRef = useRef<HTMLDivElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(100);
    const [isMuted, setIsMuted] = useState(false);

    const fetchCourseData = useCallback(async () => {
        if (!courseId || !user) return;
        try {
            const courseData = await api.getCourseById(courseId);
            
            if (courseData.prerequisites && courseData.prerequisites.length > 0) {
                 const prereqPromises = courseData.prerequisites.map(id => api.getCourseById(id));
                 const prereqCourses = await Promise.all(prereqPromises);
                 setPrerequisiteCourses(prereqCourses);
            }

            const assignmentsData = await api.getAssignmentsByCourseId(courseId);
<<<<<<< HEAD
            const submissionsData = await api.getEnrichedSubmissionsByStudentId(user.id);
=======
            const submissionsData = await api.getSubmissionsByStudentId(user.id);
>>>>>>> c5d459428a2fba052cd0e7654482653475d7bac3
            const announcementsData = await api.getAnnouncementsByCourseId(courseId);
            const reviewsData = await api.getReviewsByCourseId(courseId);

            const studentCourseData = await api.getCoursesByStudentId(user.id);
            const currentCourseWithProgress = studentCourseData.find(c => c.id === courseId);
            courseData.progress = currentCourseWithProgress?.progress;

            const enrichedAssignments: EnrichedAssignment[] = assignmentsData.map(assignment => {
                const submission = submissionsData.find(s => s.assignmentId === assignment.id);
                let submissionStatus: EnrichedAssignment['submissionStatus'] = 'Not Submitted';
                if (submission) {
                    submissionStatus = submission.grade !== null ? 'Graded' : 'Submitted';
                }
                return { ...assignment, submissionStatus, grade: submission?.grade };
            });

            setCourse(courseData);
            setAssignments(enrichedAssignments);
            setAnnouncements(announcementsData);
            setReviews(reviewsData);
            
            if (courseData.modules && courseData.modules.length > 0) {
                 const firstModuleWithVideo = courseData.modules.find(m => m.videos && m.videos.length > 0);
                 if (firstModuleWithVideo) {
                    setSelectedVideo(firstModuleWithVideo.videos[0]);
                 }
            }

        } catch (err) {
            setError('Failed to load course details.');
        } finally {
            setLoading(false);
        }
    }, [courseId, user]);
    
    useEffect(() => {
        setLoading(true);
        fetchCourseData();
    }, [fetchCourseData]);

    const handleDownloadCertificate = () => {
        if (!user || !course) return;

        // @ts-ignore - jspdf is loaded from CDN
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

        const studentName = user.name;
        const courseTitle = course.title;
        const teacherName = course.teacherName || 'The NEXEL Team';
        const completionDate = new Date().toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric',
        });
        
        doc.setFillColor(31, 41, 55);
        doc.rect(0, 0, 297, 210, 'F');
        doc.setTextColor(249, 250, 251);

        doc.setLineWidth(1.5);
        doc.setDrawColor(139, 92, 246);
        doc.rect(5, 5, 287, 200);

        doc.setFontSize(40);
        doc.setFont('helvetica', 'bold');
        doc.text('Certificate of Completion', 148.5, 40, { align: 'center' });
        doc.setFontSize(20);
        doc.setFont('helvetica', 'normal');
        doc.text('This certificate is proudly presented to', 148.5, 65, { align: 'center' });
        doc.setFontSize(32);
        doc.setFont('helvetica', 'bold');
        doc.text(studentName, 148.5, 90, { align: 'center' });
        doc.setLineWidth(0.5);
        doc.line(80, 95, 218.5, 95);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'normal');
        doc.text('For successfully completing the course', 148.5, 115, { align: 'center' });
        doc.setFontSize(28);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(56, 189, 248);
        doc.text(`"${courseTitle}"`, 148.5, 135, { align: 'center' });
        doc.setTextColor(249, 250, 251);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'normal');
        doc.text('Date of Completion', 70, 170, { align: 'center' });
        doc.setLineWidth(0.5);
        doc.line(50, 175, 90, 175);
        doc.text(completionDate, 70, 182, { align: 'center' });
        doc.text('Instructor', 228.5, 170, { align: 'center' });
        doc.line(208.5, 175, 248.5, 175);
        doc.text(teacherName, 228.5, 182, { align: 'center' });
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(139, 92, 246);
        doc.text('NEXEL Learning Platform', 148.5, 195, { align: 'center' });

        doc.save(`NEXEL_Certificate_${courseTitle.replace(/\s/g, '_')}.pdf`);
    };
    
<<<<<<< HEAD
    const handleViewMaterial = (material: StudyMaterial) => {
        window.open(material.fileUrl, '_blank');
    };

    const handleDownloadMaterial = (material: StudyMaterial) => {
        const a = document.createElement('a');
        a.href = material.fileUrl;
        a.download = material.originalFileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

=======
    // --- Study Material Handlers ---
    const generateMockFileContent = (material: StudyMaterial): { blob: Blob } => {
        const textContent = `Mock Content for: ${material.title}\n\nFile Name: ${material.fileName}\n\nThis is simulated content for demonstration purposes. In a real application, this would be the actual file content fetched from a server.`;

        if (material.fileName.toLowerCase().endsWith('.pdf')) {
            // @ts-ignore
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            doc.text(textContent, 10, 10);
            const pdfBlob = doc.output('blob');
            return { blob: pdfBlob };
        } 
        
        const textBlob = new Blob([textContent], { type: 'text/plain' });
        return { blob: textBlob };
    };

    const handleViewMaterial = (material: StudyMaterial) => {
        const { blob } = generateMockFileContent(material);
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
    };

    const handleDownloadMaterial = (material: StudyMaterial) => {
        const { blob } = generateMockFileContent(material);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = material.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };


    // --- Custom Video Player Logic ---

>>>>>>> c5d459428a2fba052cd0e7654482653475d7bac3
    const getYouTubeId = (url: string): string | null => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    useEffect(() => {
        if (!selectedVideo) return;
        const videoId = getYouTubeId(selectedVideo.url);
        if (!videoId) return;

        const cleanup = () => {
            if (playerRef.current) {
                playerRef.current.destroy();
                playerRef.current = null;
            }
        };

        const onPlayerStateChange = (event: any) => {
            if (event.data === 1) setIsPlaying(true);
            else setIsPlaying(false);
        };
        
        const createPlayer = () => {
             cleanup();
             playerRef.current = new (window as any).YT.Player('youtube-player-container', {
                videoId: videoId,
                playerVars: { 'autoplay': 0, 'controls': 0, 'rel': 0, 'showinfo': 0, 'modestbranding': 1, 'iv_load_policy': 3 },
                events: { 'onStateChange': onPlayerStateChange }
            });
        };

        if (!(window as any).YT || !(window as any).YT.Player) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode!.insertBefore(tag, firstScriptTag);
            (window as any).onYouTubeIframeAPIReady = createPlayer;
        } else {
            createPlayer();
        }

        return cleanup;
    }, [selectedVideo]);
    
    const handlePlayPause = () => {
        if (!playerRef.current) return;
        const playerState = playerRef.current.getPlayerState();
<<<<<<< HEAD
        if (playerState === 1) playerRef.current.pauseVideo();
        else playerRef.current.playVideo();
=======
        if (playerState === 1) {
            playerRef.current.pauseVideo();
        } else {
            playerRef.current.playVideo();
        }
>>>>>>> c5d459428a2fba052cd0e7654482653475d7bac3
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = Number(e.target.value);
        if (!playerRef.current) return;
        setVolume(newVolume);
        playerRef.current.setVolume(newVolume);
        if (newVolume > 0 && isMuted) {
            playerRef.current.unMute();
            setIsMuted(false);
        }
    };
    
    const handleMuteToggle = () => {
        if (!playerRef.current) return;
<<<<<<< HEAD
        if (isMuted) playerRef.current.unMute();
        else playerRef.current.mute();
=======
        if (isMuted) {
            playerRef.current.unMute();
        } else {
            playerRef.current.mute();
        }
>>>>>>> c5d459428a2fba052cd0e7654482653475d7bac3
        setIsMuted(!isMuted);
    };

    const handleFullscreen = () => {
        const iframe = playerContainerRef.current?.querySelector('iframe');
<<<<<<< HEAD
        if (iframe?.requestFullscreen) iframe.requestFullscreen();
    };


    if (loading) return <div className="flex justify-center"><Spinner /></div>;
    if (error) return <p className="text-center text-red-500">{error}</p>;
    if (!course) return <p className="text-center">Course not found.</p>;
=======
        if (iframe && iframe.requestFullscreen) {
            iframe.requestFullscreen();
        }
    };


    if (loading) {
        return <div className="flex justify-center"><Spinner /></div>;
    }

    if (error) {
        return <p className="text-center text-red-500">{error}</p>;
    }

    if (!course) {
        return <p className="text-center">Course not found.</p>;
    }
>>>>>>> c5d459428a2fba052cd0e7654482653475d7bac3
    
    const statusBadge = (status: EnrichedAssignment['submissionStatus']) => {
        const baseClasses = "px-2.5 py-0.5 text-xs font-semibold rounded-full";
        switch (status) {
            case 'Graded': return <span className={`bg-green-500/20 text-green-300 ${baseClasses}`}>Graded</span>;
            case 'Submitted': return <span className={`bg-blue-500/20 text-blue-300 ${baseClasses}`}>Submitted</span>;
            case 'Not Submitted': return <span className={`bg-gray-500/20 text-gray-300 ${baseClasses}`}>Not Submitted</span>;
        }
    };
    
    const userHasReviewed = reviews.some(r => r.studentId === user?.id);
    const canReview = course.progress === 100 && !userHasReviewed;
    const isCompleted = course.progress === 100;

<<<<<<< HEAD
=======

>>>>>>> c5d459428a2fba052cd0e7654482653475d7bac3
    return (
        <div className="max-w-7xl mx-auto space-y-12">
            <header>
                 <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-4xl font-bold mb-2 text-on-surface">{course.title}</h1>
                        <p className="text-lg text-on-surface-secondary mb-2">Taught by {course.teacherName}</p>
                    </div>
                     <div className="flex items-center space-x-4">
                        <Link to={`/courses/${course.id}/forum`}>
<<<<<<< HEAD
                            <Button variant="ghost"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V10a2 2 0 012-2h8z" /></svg>Discussion Forum</Button>
                        </Link>
                        {isCompleted && (
                            <Button onClick={handleDownloadCertificate} variant="secondary"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" /><path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" /></svg>Download Certificate</Button>
=======
                            <Button variant="ghost">
                               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V10a2 2 0 012-2h8z" /></svg>
                                Discussion Forum
                            </Button>
                        </Link>
                        {isCompleted && (
                            <Button onClick={handleDownloadCertificate} variant="secondary">
                               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" /><path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
                                Download Certificate
                            </Button>
>>>>>>> c5d459428a2fba052cd0e7654482653475d7bac3
                        )}
                    </div>
                </div>
                 <div className="flex items-center space-x-2 mb-4">
                    {course.averageRating !== undefined ? (
                        <>
                            <StarRating rating={course.averageRating} />
                            <span className="font-bold text-amber-400">{course.averageRating.toFixed(1)}</span>
                            <span className="text-sm text-on-surface-secondary">({reviews.length} reviews)</span>
                        </>
<<<<<<< HEAD
                    ) : <span className="text-sm text-on-surface-secondary">No reviews yet</span>}
=======
                    ) : (
                        <span className="text-sm text-on-surface-secondary">No reviews yet</span>
                    )}
>>>>>>> c5d459428a2fba052cd0e7654482653475d7bac3
                </div>
                {prerequisiteCourses.length > 0 && (
                    <div className="flex items-start text-sm text-on-surface-secondary mb-4">
                       <strong className="mr-2 shrink-0">Prerequisites:</strong>
                       <div className="flex flex-wrap gap-x-2">
<<<<<<< HEAD
                            {prerequisiteCourses.map(prereq => <Link key={prereq.id} to={`/courses/${prereq.id}`} className="text-primary hover:underline">{prereq.title}</Link>)}
=======
                            {prerequisiteCourses.map(prereq => (
                                <Link key={prereq.id} to={`/courses/${prereq.id}`} className="text-primary hover:underline">{prereq.title}</Link>
                            ))}
>>>>>>> c5d459428a2fba052cd0e7654482653475d7bac3
                       </div>
                    </div>
                )}
                <p className="max-w-4xl text-on-surface-secondary">{course.description}</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {selectedVideo && (
                        <div ref={playerContainerRef} className="relative aspect-video bg-black rounded-lg overflow-hidden shadow-2xl group border border-border-color">
                            <div id="youtube-player-container" className="w-full h-full"></div>
                            <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="flex items-center space-x-2 sm:space-x-4 text-white">
                                    <button onClick={handlePlayPause} aria-label={isPlaying ? "Pause" : "Play"} className="p-2 hover:bg-white/20 rounded-full transition-colors"><svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor">{isPlaying ? <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /> : <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8.06v3.88a1 1 0 001.555.832l3.197-1.94a1 1 0 000-1.664l-3.197-1.94z" clipRule="evenodd" />}</svg></button>
                                    <div className="flex items-center space-x-2"><button onClick={handleMuteToggle} aria-label={isMuted ? "Unmute" : "Mute"} className="p-2 hover:bg-white/20 rounded-full transition-colors">{isMuted || volume === 0 ? <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.414z" clipRule="evenodd" /></svg>}</button><input type="range" min="0" max="100" value={isMuted ? 0 : volume} onChange={handleVolumeChange} className="w-24 h-1 bg-gray-200/50 rounded-lg appearance-none cursor-pointer accent-primary" aria-label="Volume"/></div>
                                    <div className="flex-grow"></div>
                                    <button onClick={handleFullscreen} aria-label="Fullscreen" className="p-2 hover:bg-white/20 rounded-full transition-colors"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 110 2H5v3a1 1 0 11-2 0V4zm14 0a1 1 0 00-1-1h-4a1 1 0 100 2h3v3a1 1 0 102 0V4zM4 17a1 1 0 001 1h4a1 1 0 100-2H5v-3a1 1 0 10-2 0v4zm13-1a1 1 0 00-1-1h-4a1 1 0 100 2h3v3a1 1 0 102 0v-4z" clipRule="evenodd" /></svg></button>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {announcements.length > 0 && (
                        <div>
                            <h2 className="text-3xl font-bold mb-6">Announcements</h2>
                            <div className="space-y-4">
                                {announcements.map(anno => (
                                    <div key={anno.id} className="bg-surface/70 backdrop-blur-sm border border-border-color p-4 rounded-xl">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold">{anno.title}</h3>
                                            <span className="text-xs text-on-surface-secondary">{new Date(anno.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p className="mt-2 text-on-surface-secondary">{anno.content}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div>
                         <h2 className="text-3xl font-bold mb-6">Assignments</h2>
                        <div className="bg-surface/70 backdrop-blur-sm border border-border-color rounded-xl">
                            <ul className="divide-y divide-border-color">
                                {assignments.length > 0 ? assignments.map(assignment => (
                                    <li key={assignment.id} className="p-4 flex items-center justify-between hover:bg-primary/10 transition-colors">
                                        <div>
                                            <h3 className="text-lg font-semibold">{assignment.title}</h3>
                                            {assignment.deadline && (
                                                <div className="mt-2 flex items-center text-xs text-on-surface-secondary">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                    Deadline: {new Date(assignment.deadline).toLocaleDateString()}
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-right flex-shrink-0 ml-4">
                                            {statusBadge(assignment.submissionStatus)}
                                            {assignment.submissionStatus === 'Not Submitted' && (
                                                <Link to={`/assignments/${assignment.id}/submit`} className="mt-2 block text-sm font-semibold text-primary hover:underline">
                                                    Submit
                                                </Link>
                                            )}
                                            {assignment.submissionStatus === 'Graded' && (
                                                <p className="mt-2 text-sm font-semibold">Grade: {assignment.grade?.final}%</p>
                                            )}
                                        </div>
                                    </li>
                                )) : (
                                    <li className="p-4 text-center text-on-surface-secondary">No assignments for this course yet.</li>
                                )}
                            </ul>
                        </div>
                    </div>

                    {canReview && courseId && <ReviewForm courseId={courseId} onReviewSubmitted={fetchCourseData} />}
                    
                    <div>
                        <h2 className="text-3xl font-bold mb-6">Student Reviews</h2>
                         {reviews.length > 0 ? (
                            <div className="space-y-6">
                                {reviews.map(review => (
                                    <div key={review.id} className="bg-surface/70 backdrop-blur-sm border border-border-color p-4 rounded-xl">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center space-x-2">
                                                <span className="font-semibold">{review.studentName}</span>
                                                <StarRating rating={review.rating} />
                                            </div>
                                            <span className="text-xs text-on-surface-secondary">{new Date(review.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-on-surface-secondary">{review.comment}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-on-surface-secondary text-center py-4">No reviews yet for this course.</p>
                        )}
                    </div>
                </div>

                <aside className="space-y-6">
                    <h2 className="text-3xl font-bold">Course Content</h2>
                    {course.modules && course.modules.length > 0 ? (
                        course.modules.map(module => (
                            <div key={module.id} className="bg-surface/70 backdrop-blur-sm border border-border-color rounded-xl overflow-hidden">
                                <h3 className="text-lg font-bold p-4 bg-surface/50 border-b border-border-color">{module.title}</h3>
                                <div className="p-4 space-y-4">
                                    {module.videos.length > 0 && (
                                        <div>
                                            <h4 className="font-semibold mb-2 text-sm text-on-surface-secondary">Videos</h4>
                                            <ul className="space-y-2">
                                                {module.videos.map(video => (
                                                    <li key={video.id} onClick={() => setSelectedVideo(video)} className={`flex items-center space-x-2 p-2 rounded-md cursor-pointer transition-colors ${selectedVideo?.id === video.id ? 'bg-primary/20 text-primary' : 'hover:bg-primary/10'}`}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                        <span className="text-sm">{video.title}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {module.studyMaterials.length > 0 && (
                                        <div>
                                            <h4 className="font-semibold mb-2 text-sm text-on-surface-secondary">Study Materials</h4>
                                            <ul className="space-y-2">
                                                {module.studyMaterials.map(material => (
                                                    <li key={material.id} className="flex items-center justify-between p-2 rounded-md hover:bg-primary/10 group transition-colors">
                                                        <div className="flex items-center space-x-2">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-on-surface-secondary group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                            <span className="text-sm text-on-surface-secondary group-hover:text-primary transition-colors">{material.title}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                             <Button onClick={() => handleViewMaterial(material)} variant="ghost" className="!text-xs !py-1 !px-2">View</Button>
                                                             <Button onClick={() => handleDownloadMaterial(material)} variant="ghost" className="!text-xs !py-1 !px-2">Download</Button>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-on-surface-secondary">No content has been added to this course yet.</p>
                    )}
                </aside>
            </div>
        </div>
    );
};

export default CourseDetailPage;