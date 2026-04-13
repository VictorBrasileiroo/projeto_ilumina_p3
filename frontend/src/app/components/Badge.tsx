interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  size?: 'sm' | 'md';
}

export function Badge({ children, variant = 'neutral', size = 'md' }: BadgeProps) {
  const variants = {
    success: 'bg-[var(--color-success-surface)] text-[var(--color-secondary-green-dark)] border-[var(--color-secondary-green)]/20',
    warning: 'bg-[var(--color-warning-surface)] text-[#6B5900] border-[var(--color-warning)]/30',
    error: 'bg-[var(--color-error-surface)] text-[var(--color-error)] border-[var(--color-error)]/20',
    info: 'bg-[var(--color-info-surface)] text-[var(--color-primary)] border-[var(--color-primary)]/20',
    neutral: 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-600)] border-[var(--color-neutral-200)]'
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-[3px] text-[12px]'
  };

  return (
    <span className={`inline-flex items-center rounded-[var(--border-radius)] border ${variants[variant]} ${sizes[size]}`} style={{ fontWeight: 500 }}>
      {children}
    </span>
  );
}
