import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const CreateCoursePage: React.FC = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [duration, setDuration] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            setError('You must be logged in to create a course.');
            return;
        }
        setError('');
        setLoading(true);
        try {
            const newCourse = await api.createCourse(title, description, duration, user.id);
            navigate(`/courses/${newCourse.id}/manage`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create course');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Create a New Course</h1>
            <form onSubmit={handleSubmit} className="bg-surface/70 backdrop-blur-sm border border-border-color p-8 rounded-2xl shadow-2xl space-y-6">
                 {error && <p className="text-red-500 text-center text-sm">{error}</p>}
                <Input
                    id="title"
                    label="Course Title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-on-surface-secondary mb-1">
                        Description
                    </label>
                    <textarea
                        id="description"
                        rows={5}
                        className="mt-1 block w-full bg-surface border border-border-color rounded-lg placeholder-on-surface-secondary focus:ring-2 focus:ring-primary focus:border-primary text-on-surface transition-colors duration-200"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                </div>
                 <Input
                    id="duration"
                    label="Course Duration (e.g., 8 Weeks)"
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    required
                />
                <div className="flex justify-end pt-4">
                    <Button type="submit" isLoading={loading}>
                        Create Course
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default CreateCoursePage;