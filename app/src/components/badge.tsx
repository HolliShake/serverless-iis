import React from 'react';

export interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'error'; // default is the default which uses bg-primary
  appearance?: 'solid' | 'soft'; // soft is default
  children: React.ReactNode;
  className?: string;
}

export default function Badge({
  variant = 'default',
  appearance = 'soft',
  children,
  className = '',
}: BadgeProps) {
  const getVariantClasses = () => {
    const baseClasses = 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium';

    if (appearance === 'solid') {
      switch (variant) {
        case 'success':
          return `${baseClasses} bg-success text-white`;
        case 'warning':
          return `${baseClasses} bg-warning text-white`;
        case 'error':
          return `${baseClasses} bg-error text-white`;
        default:
          return `${baseClasses} bg-primary text-white`;
      }
    } else {
      // soft appearance
      switch (variant) {
        case 'success':
          return `${baseClasses} bg-success text-success border border-success`;
        case 'warning':
          return `${baseClasses} bg-warning text-warning border border-warning`;
        case 'error':
          return `${baseClasses} bg-error text-error border border-error`;
        default:
          return `${baseClasses} bg-primary text-primary border border-primary`;
      }
    }
  };

  return <span className={`${getVariantClasses()} ${className}`}>{children}</span>;
}
