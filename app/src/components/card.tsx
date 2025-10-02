import type React from 'react';

type CardProps = {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
};

export default function Card({
  children,
  className = '',
  onClick = undefined,
}: CardProps): React.ReactNode {
  return (
    <div
      className={`bg-surface rounded-2xl shadow-lg border border-muted p-6 hover:shadow-xl transition-all duration-300 ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
