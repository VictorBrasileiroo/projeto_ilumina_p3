import { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  type = 'button',
  disabled = false,
  fullWidth = false,
  className = '',
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all rounded-[var(--border-radius)] focus-visible:outline-3 focus-visible:outline-[var(--color-secondary-yellow)] focus-visible:outline-offset-2';

  const variants = {
    primary: 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] active:bg-[var(--color-primary-darken-02)]',
    secondary: 'bg-[var(--color-secondary-green)] text-white hover:bg-[var(--color-secondary-green-dark)]',
    outline: 'border border-[var(--color-primary)] text-[var(--color-primary)] bg-transparent hover:bg-[var(--color-primary-surface)]',
    ghost: 'text-[var(--color-primary)] bg-transparent hover:bg-[var(--color-primary-surface)]',
    danger: 'bg-[var(--color-error)] text-white hover:bg-[#C91B06]',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-[14px] gap-1.5',
    md: 'px-5 py-2 text-[15px] gap-2',
    lg: 'px-6 py-2.5 text-[16px] gap-2',
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const disabledClass = disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${disabledClass} ${className}`}
    >
      {children}
    </button>
  );
}
