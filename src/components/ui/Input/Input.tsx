import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../../../lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium text-[var(--color-neutral-600)]"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'h-9 w-full rounded-md border bg-white px-3 text-sm text-[var(--color-neutral-800)] placeholder:text-[var(--color-neutral-400)] transition-colors',
            'border-[var(--color-neutral-200)]',
            'focus:outline-none focus:border-[var(--color-primary-500)] focus:ring-1 focus:ring-[var(--color-primary-500)]',
            error && 'border-[var(--color-danger-500)] focus:ring-[var(--color-danger-500)]',
            props.disabled && 'bg-[var(--color-neutral-50)] opacity-60 cursor-not-allowed',
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-xs text-[var(--color-danger-500)]">{error}</p>
        )}
        {hint && !error && (
          <p className="text-xs text-[var(--color-neutral-400)]">{hint}</p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';