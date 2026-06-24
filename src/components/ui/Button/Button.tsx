import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../lib/utils';
import { type ButtonHTMLAttributes, forwardRef } from 'react';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary:   'bg-[var(--color-primary-500)] text-white hover:bg-[var(--color-primary-600)] focus:ring-[var(--color-primary-500)]',
        secondary: 'bg-white text-[var(--color-neutral-800)] border border-[var(--color-neutral-200)] hover:bg-[var(--color-neutral-50)] focus:ring-[var(--color-primary-500)]',
        danger:    'bg-[var(--color-danger-500)] text-white hover:bg-[var(--color-danger-700)] focus:ring-[var(--color-danger-500)]',
        ghost:     'text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-100)] focus:ring-[var(--color-primary-500)]',
      },
      size: {
        sm: 'h-8  px-3 text-xs',
        md: 'h-9  px-4 text-sm',
        lg: 'h-10 px-5 text-sm',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
);
Button.displayName = 'Button';