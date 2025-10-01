import type React from 'react';

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export default function Card({ children, className = '' }: CardProps): React.ReactNode {
  return (
    <div
      className={`bg-surface rounded-2xl shadow-lg border border-muted p-6 hover:shadow-xl transition-all duration-300 ${className}`}
    >
      {children}
    </div>
  );
}
