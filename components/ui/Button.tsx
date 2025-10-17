import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'ghost';
    isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', isLoading = false, ...props }) => {
    const baseClasses = 'px-5 py-2.5 rounded-lg font-semibold text-sm focus:outline-none focus:ring-4 transition-all duration-300 transform hover:-translate-y-px disabled:transform-none flex items-center justify-center';
    
    const variantClasses = {
        primary: 'bg-primary text-white hover:bg-primary-hover focus:ring-primary/50 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30',
        secondary: 'bg-secondary text-white hover:bg-secondary-hover focus:ring-secondary/50 shadow-lg shadow-secondary/20 hover:shadow-xl hover:shadow-secondary/30',
        ghost: 'bg-transparent text-on-surface-secondary hover:text-on-surface border border-border-color hover:border-primary focus:ring-primary/30',
    };
    
    const disabledClasses = 'disabled:bg-surface/50 disabled:text-on-surface-secondary/50 disabled:cursor-not-allowed disabled:shadow-none';

    return (
        <button
            className={`${baseClasses} ${variantClasses[variant]} ${disabledClasses}`}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : (
                children
            )}
        </button>
    );
};

export default Button;