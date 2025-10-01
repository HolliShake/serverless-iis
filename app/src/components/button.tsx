import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'success' | 'warning' | 'error'; // default is the default which uses bg-primary
  appearance?: 'solid' | 'soft'; // solid is default for buttons
  size?: 'sm' | 'md' | 'lg'; // md is default
  children: React.ReactNode;
  className?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'default',
      appearance = 'solid',
      size = 'md',
      children,
      className = '',
      disabled = false,
      ...props
    },
    ref
  ) => {
    const getVariantClasses = () => {
      const baseClasses =
        'inline-flex items-center justify-center rounded-lg font-medium transition-opacity hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed';

      const sizeClasses = {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
      };

      if (appearance === 'solid') {
        switch (variant) {
          case 'success':
            return `${baseClasses} ${sizeClasses[size]} bg-success text-white`;
          case 'warning':
            return `${baseClasses} ${sizeClasses[size]} bg-warning text-white`;
          case 'error':
            return `${baseClasses} ${sizeClasses[size]} bg-error text-white`;
          default:
            return `${baseClasses} ${sizeClasses[size]} bg-primary text-white`;
        }
      } else {
        // soft type
        switch (variant) {
          case 'success':
            return `${baseClasses} ${sizeClasses[size]} bg-success text-success border border-success`;
          case 'warning':
            return `${baseClasses} ${sizeClasses[size]} bg-warning text-warning border border-warning`;
          case 'error':
            return `${baseClasses} ${sizeClasses[size]} bg-error text-error border border-error`;
          default:
            return `${baseClasses} ${sizeClasses[size]} bg-primary text-primary border border-primary`;
        }
      }
    };

    return (
      <button
        ref={ref}
        className={`${getVariantClasses()} ${className}`}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
