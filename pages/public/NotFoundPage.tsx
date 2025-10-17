import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';

const NotFoundPage: React.FC = () => {
    return (
        <div className="text-center flex flex-col items-center justify-center py-20">
            <h1 className="text-9xl font-extrabold text-primary tracking-widest relative">
                404
                <div className="absolute inset-0 text-on-surface/5 blur-sm" aria-hidden="true">404</div>
            </h1>
            <div className="bg-surface px-4 py-2 text-sm rounded-md -mt-4 mb-8 text-on-surface-secondary">
                Page Not Found
            </div>
            <p className="text-xl md:text-2xl text-on-surface-secondary mt-4 mb-8 max-w-md">
                Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
            </p>
            <Link to="/">
                <Button variant="secondary">
                    Go Home
                </Button>
            </Link>
        </div>
    );
};

export default NotFoundPage;