import React from 'react';
import { useAuth } from '../../hooks/useAuth';

const FunFactWidget: React.FC = () => {
    const { user } = useAuth();

    // A default, hardcoded fun fact
    const fact = "The human brain has a memory capacity of approximately 2.5 petabytes, which is equivalent to 3 million hours of TV shows!";

    if (!user) return null;

    return (
        <section className="bg-surface-glass backdrop-blur-md border border-border-color p-6 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-16 -mr-16 w-48 h-48 bg-gradient-radial from-secondary/20 to-transparent rounded-full"></div>
            <div className="relative z-10">
                <h2 className="text-2xl font-bold text-on-surface mb-4">
                    Hey {user.name.split(' ')[0]}, <span className="text-on-surface-secondary font-medium">did you know...</span>
                </h2>
                <blockquote className="text-lg text-on-surface-secondary italic">"{fact}"</blockquote>
            </div>
        </section>
    );
};

export default FunFactWidget;
