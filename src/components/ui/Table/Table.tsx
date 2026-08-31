import { cn } from '../../../lib/utils';

export function Table({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-[var(--color-neutral-200)]">
      <table className={cn('w-full text-sm', className)}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children }: { children: React.ReactNode }) {
  return (
    <thead className="bg-[var(--color-neutral-50)] border-b border-[var(--color-neutral-200)]">
      {children}
    </thead>
  );
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-[var(--color-neutral-100)]">{children}</tbody>;
}

export function TableRow({ children, selected, className }: {
  children: React.ReactNode;
  selected?: boolean;
  className?: string;
}) {
  return (
    <tr className={cn(
      'transition-colors hover:bg-[var(--color-neutral-50)]',
      selected && 'bg-[var(--color-primary-50)]',
      className
    )}>
      {children}
    </tr>
  );
}

export function TableHead({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={cn(
      'px-4 py-3 text-left text-xs font-semibold text-[var(--color-neutral-600)] uppercase tracking-wide',
      className
    )}>
      {children}
    </th>
  );
}

export function TableCell({ children, mono: _mono, className, colSpan }: {
  children: React.ReactNode;
  /** @deprecated Ignored — list cells use one typography style app-wide. */
  mono?: boolean;
  className?: string;
  colSpan?: number;
}) {
  return (
    <td
      colSpan={colSpan}
      className={cn(
      'px-4 py-3 text-sm font-normal text-[var(--color-neutral-800)]',
      className
    )}>
      {children}
    </td>
  );
}