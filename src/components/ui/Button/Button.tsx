import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../lib/utils';
import { type ButtonHTMLAttributes, forwardRef } from 'react';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-1.5 rounded-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary:   'bg-[var(--fresa-action,#0A2942)] text-white hover:bg-[var(--fresa-action-hover,#163E60)] focus:ring-[var(--fresa-action,#0A2942)]',
        secondary: 'bg-[var(--fresa-secondary-bg,#FFFFFF)] text-[var(--color-neutral-800)] border border-[var(--fresa-secondary-border,#C9D3DF)] hover:bg-[var(--fresa-page-bg,#F4F6F9)] focus:ring-[var(--fresa-action,#0A2942)]',
        danger:    'bg-[var(--fresa-danger,var(--color-danger-500))] text-white hover:bg-[var(--fresa-danger-text,var(--color-danger-700))] focus:ring-[var(--fresa-danger,var(--color-danger-500))]',
        ghost:     'text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-100)] focus:ring-[var(--color-primary-500)]',
      },
      size: {
        sm: 'h-7  px-2.5 text-[12px]',
        md: 'h-8  px-3 text-[13px]',
        lg: 'h-9  px-4 text-sm',
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