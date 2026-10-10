import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[11px] font-medium leading-tight',
  {
    variants: {
      variant: {
        success: 'bg-[var(--fresa-success-soft,var(--color-success-100))] text-[var(--fresa-success-text,var(--color-success-700))]',
        warning: 'bg-[var(--fresa-warning-soft,var(--color-warning-100))] text-[var(--fresa-warning-text,var(--color-warning-700))]',
        danger:  'bg-[var(--fresa-danger-soft,var(--color-danger-100))] text-[var(--fresa-danger-text,var(--color-danger-700))]',
        info:    'bg-[var(--fresa-info-soft,var(--color-info-100))] text-[var(--fresa-info-text,var(--color-info-700,#0E7490))]',
        neutral: 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-600)]',
        primary: 'bg-[var(--fresa-action-soft,var(--color-primary-50))] text-[var(--fresa-header-text,var(--color-primary))]',
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