import { ReactNode, CSSProperties } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  accent?: 'primary' | 'success' | 'warning' | 'error' | 'none';
  style?: CSSProperties;
}

export function Card({ children, className = '', onClick, hoverable = false, accent = 'none', style }: CardProps) {
  const hoverClass = hoverable ? 'hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer' : '';

  const accentBorders = {
    primary: 'border-l-[3px] border-l-[var(--color-primary)]',
    success: 'border-l-[3px] border-l-[var(--color-success)]',
    warning: 'border-l-[3px] border-l-[var(--color-warning)]',
    error: 'border-l-[3px] border-l-[var(--color-error)]',
    none: '',
  };

  return (
    <div
      onClick={onClick}
      style={style}
      className={`
        bg-[var(--bg-card)]
        rounded-[var(--border-radius-lg)]
        border border-[var(--color-neutral-100)]
        shadow-[var(--shadow-sm)]
        ${accentBorders[accent]}
        ${hoverClass}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
