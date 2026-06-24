import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        success: 'bg-[var(--color-success-100)] text-[var(--color-success-700)]',
        warning: 'bg-[var(--color-warning-100)] text-[var(--color-warning-700)]',
        danger:  'bg-[var(--color-danger-100)]  text-[var(--color-danger-700)]',
        info:    'bg-[var(--color-info-100)]    text-[var(--color-info-500)]',
        neutral: 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-600)]',
        primary: 'bg-[var(--color-primary-100)] text-[var(--color-primary-700)]',
      },
    },
    defaultVariants: { variant: 'neutral' },
  }
);

interface BadgeProps extends VariantProps<typeof badgeVariants> {
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

export function Badge({ variant, children, className, dot = true }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)}>
      {dot && (
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
      )}
      {children}
    </span>
  );
}