import { cn } from '../../../lib/utils';
import { appType } from '../../../lib/erpTypography';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({ children, className, padding = 'md' }: CardProps) {
  const paddingMap = { none: '', sm: 'p-3', md: 'p-4', lg: 'p-6' };
  return (
    <div className={cn(
      'rounded-sm border border-[#d0d7de] bg-white shadow-none',
      paddingMap[padding],
      className
    )}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-center justify-between border-b border-[var(--color-neutral-200)] pb-3 mb-4', className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={cn(appType.cardTitle, className)}>
      {children}
    </h3>
  );
}