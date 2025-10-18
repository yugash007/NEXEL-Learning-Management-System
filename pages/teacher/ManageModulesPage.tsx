import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as api from '../../services/api';
import type { Course, Module, Video, StudyMaterial } from '../../types';
import Spinner from '../../components/ui/Spinner';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const ModuleEditor: React.FC<{ courseId: string; module: Module; onContentUpdate: () => void }> = ({ courseId, module, onContentUpdate }) => {
    const [videoTitle, setVideoTitle] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [materialTitle, setMaterialTitle] = useState('');
    const [materialFile, setMaterialFile] = useState<File | null>(null);
    const [submittingVideo, setSubmittingVideo] = useState(false);
    const [submittingMaterial, setSubmittingMaterial] = useState(false);

    const handleAddVideo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!videoTitle || !videoUrl) return;
        setSubmittingVideo(true);
        try {
            await api.addVideoToModule(courseId, module.id, videoTitle, videoUrl);
            setVideoTitle('');
            setVideoUrl('');
            onContentUpdate();
        } catch (err) { alert('Failed to add video.'); } 
        finally { setSubmittingVideo(false); }
    };

    const handleAddMaterial = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!materialTitle || !materialFile) return;
        setSubmittingMaterial(true);
        try {
<<<<<<< HEAD
            await api.addStudyMaterialToModule(courseId, module.id, materialTitle, materialFile);
=======
            await api.addStudyMaterialToModule(courseId, module.id, materialTitle, materialFile.name);
>>>>>>> c5d459428a2fba052cd0e7654482653475d7bac3
            setMaterialTitle('');
            setMaterialFile(null);
            (e.target as HTMLFormElement).reset();
            onContentUpdate();
        } catch (err) { alert('Failed to add material.'); } 
        finally { setSubmittingMaterial(false); }
    };

    return (
        <div className="bg-surface/50 p-6 rounded-b-xl space-y-6">
            <div>
                <h4 className="font-semibold mb-2 text-on-surface">Existing Content</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h5 className="font-medium mb-2 text-on-surface-secondary">Videos</h5>
                        {module.videos.length > 0 ? (
                            <ul className="list-disc pl-5 text-sm space-y-1 text-on-surface-secondary">
                                {module.videos.map(v => <li key={v.id}>{v.title}</li>)}
                            </ul>
                        ) : <p className="text-xs text-on-surface-secondary">No videos in this module.</p>}
                    </div>
                     <div>
                        <h5 className="font-medium mb-2 text-on-surface-secondary">Study Materials</h5>
                        {module.studyMaterials.length > 0 ? (
                            <ul className="list-disc pl-5 text-sm space-y-1 text-on-surface-secondary">
<<<<<<< HEAD
                                {module.studyMaterials.map(m => <li key={m.id}>{m.title} ({m.originalFileName})</li>)}
=======
                                {module.studyMaterials.map(m => <li key={m.id}>{m.title} ({m.fileName})</li>)}
>>>>>>> c5d459428a2fba052cd0e7654482653475d7bac3
                            </ul>
                        ) : <p className="text-xs text-on-surface-secondary">No materials in this module.</p>}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-border-color pt-6">
                <form onSubmit={handleAddVideo} className="space-y-4">
                    <h5 className="font-semibold text-on-surface">Add New Video</h5>
                    <Input id={`v-title-${module.id}`} label="Video Title" value={videoTitle} onChange={e => setVideoTitle(e.target.value)} required />
                    <Input id={`v-url-${module.id}`} label="YouTube Embed URL" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} required />
                    <Button type="submit" isLoading={submittingVideo} variant="ghost" className="w-full">Add Video</Button>
                </form>
                <form onSubmit={handleAddMaterial} className="space-y-4">
                    <h5 className="font-semibold text-on-surface">Add New Material</h5>
                    <Input id={`m-title-${module.id}`} label="Material Title" value={materialTitle} onChange={e => setMaterialTitle(e.target.value)} required />
                    <div>
                        <label htmlFor={`m-file-${module.id}`} className="block text-sm font-medium text-on-surface-secondary mb-1">File</label>
                        <input id={`m-file-${module.id}`} type="file" onChange={e => e.target.files && setMaterialFile(e.target.files[0])} required className="mt-1 block w-full text-sm text-on-surface-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-secondary/10 file:text-secondary hover:file:bg-secondary/20"/>
                    </div>
                    <Button type="submit" isLoading={submittingMaterial} variant="ghost" className="w-full">Add Material</Button>
                </form>
            </div>
        </div>
    );
};

const ManageModulesPage: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [newModuleTitle, setNewModuleTitle] = useState('');
    const [submittingModule, setSubmittingModule] = useState(false);

    const fetchCourseData = useCallback(async () => {
        if (!courseId) return;
        try {
            const courseData = await api.getCourseById(courseId);
            setCourse(courseData);
        } catch (err) {
            setError('Failed to load course data.');
        } finally {
            setLoading(false);
        }
    }, [courseId]);

    useEffect(() => {
        fetchCourseData();
    }, [fetchCourseData]);

    const handleCreateModule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!courseId || !newModuleTitle) return;
        setSubmittingModule(true);
        try {
            await api.createModule(courseId, newModuleTitle);
            setNewModuleTitle('');
            await fetchCourseData();
        } catch (err) {
            alert('Failed to create module.');
        } finally {
            setSubmittingModule(false);
        }
    };

    if (loading) return <div className="flex justify-center"><Spinner /></div>;
    if (error) return <p className="text-center text-red-500">{error}</p>;
    if (!course) return <p className="text-center">Course not found.</p>;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                 <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold">Manage Content for: {course.title}</h1>
                        <p className="text-on-surface-secondary mt-2">Add modules, videos, and study materials for your course.</p>
                    </div>
                    <Link to={`/courses/${course.id}/manage`}>
                        <Button variant="secondary">Manage Assignments</Button>
                    </Link>
                </div>
            </div>
            
            <div className="bg-surface/70 backdrop-blur-sm border border-border-color p-6 rounded-2xl shadow-lg">
                <h2 className="text-2xl font-bold mb-4">Create New Module</h2>
                <form onSubmit={handleCreateModule} className="flex items-end space-x-4">
                    <div className="flex-grow">
                        <Input id="module-title" label="Module Title" value={newModuleTitle} onChange={e => setNewModuleTitle(e.target.value)} required />
                    </div>
                    <Button type="submit" isLoading={submittingModule}>Create Module</Button>
                </form>
            </div>

            <div>
                <h2 className="text-2xl font-bold mb-4">Course Modules</h2>
                <div className="space-y-4">
                    {course.modules && course.modules.length > 0 ? (
                        course.modules.map(module => (
                            <div key={module.id} className="bg-surface/70 backdrop-blur-sm border border-border-color rounded-xl shadow-lg">
                                <h3 className="text-xl font-bold p-4 border-b border-border-color">{module.title}</h3>
                                <ModuleEditor courseId={course.id} module={module} onContentUpdate={fetchCourseData} />
                            </div>
                        ))
                    ) : (
                        <p className="text-on-surface-secondary text-center py-8">No modules created yet for this course.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageModulesPage;