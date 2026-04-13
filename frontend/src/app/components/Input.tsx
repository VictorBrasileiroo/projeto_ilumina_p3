import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helper, fullWidth = false, className = '', ...props }, ref) => {
    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label className="block text-[14px] text-[var(--color-neutral-700)] mb-1.5" style={{ fontWeight: 600 }}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            px-3 py-[7px] border rounded-[var(--border-radius)]
            bg-white text-sm
            border-[var(--color-neutral-200)]
            text-[var(--color-neutral-800)]
            placeholder:text-[var(--color-neutral-400)]
            focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-lighten-02)] focus:border-[var(--color-primary)]
            disabled:bg-[var(--color-neutral-50)] disabled:cursor-not-allowed disabled:text-[var(--color-neutral-400)]
            transition-all
            ${error ? 'border-[var(--color-error)] focus:ring-[var(--color-error-surface)]' : ''}
            ${fullWidth ? 'w-full' : ''}
            ${className}
          `}
          {...props}
        />
        {helper && !error && (
          <p className="mt-1 text-[13px] text-[var(--color-neutral-400)]">{helper}</p>
        )}
        {error && (
          <p className="mt-1 text-[13px] text-[var(--color-error)]">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
