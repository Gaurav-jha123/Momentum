import React from 'react';
import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode; // What's inside the button (text, icons)
  variant?: 'primary' | 'secondary' | 'danger'; 
  size?: 'sm' | 'md' | 'lg'; 
  isLoading?: boolean; 
  className?: string; // Allow passing extra custom classes
}

// The Button component
const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary', // Default variant
  size = 'md',         // Default size
  isLoading = false,
  disabled = false,
  className = '',
  type = 'button',     
  ...props            
}) => {
  const baseStyle = 'inline-flex items-center justify-center font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition ease-in-out duration-150 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary: 'border-transparent text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500',
    secondary: 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-indigo-500',
    danger: 'border-transparent text-white bg-red-600 hover:bg-red-700 focus:ring-red-500',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  
  const combinedClassName = clsx(
    baseStyle,
    variantStyles[variant],
    sizeStyles[size],
    className 
  );
  
  return (
    <button
      type={type}
      className={combinedClassName}
      disabled={disabled || isLoading} 
      {...props} 
    >
      {/* Show loading indicator if isLoading is true */}
      {isLoading ? (
        <>
          {/* Simple SVG Spinner */}
          <svg
             className={clsx(
                 "animate-spin h-4 w-4",
                 variant === 'primary' || variant === 'danger' ? 'text-white' : 'text-indigo-600', // Spinner color based on variant
                 size === 'sm' ? '-ml-0.5 mr-2' : '-ml-1 mr-2' // Adjust margin based on size
             )}
             xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
           >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {/* Optionally change text during loading */}
          Processing...
        </>
      ) : (
        // Otherwise, show the button children (text/icon)
        children
      )}
    </button>
  );
};

export default Button;