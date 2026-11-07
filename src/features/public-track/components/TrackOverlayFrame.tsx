import { useState, type ReactNode } from 'react';
import { ChevronsLeftRight, ChevronsRightLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
  children: ReactNode;
  className?: string;
};

/**
 * Left Track & Trace overlay shell.
 * Default width matches the current card (~520px); user can expand for more reading room.
 */
export function TrackOverlayFrame({ children, className }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={cn(
        'absolute inset-y-0 left-0 z-[1] flex flex-col p-3 transition-[max-width] duration-300 ease-out sm:p-4',
        expanded ? 'w-full max-w-[min(920px,96%)]' : 'w-full max-w-[520px]',
        className,
      )}
    >
      <div className="relative flex h-full min-h-0 flex-col">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="absolute -right-2 top-1/2 z-[2] flex h-9 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--fresa-border,#C9D3DF)] bg-white text-[#0A2942] shadow-md hover:bg-[var(--color-neutral-50)]"
          aria-label={expanded ? 'Collapse panel' : 'Expand panel'}
          title={expanded ? 'Collapse' : 'Expand'}
        >
          {expanded ? (
            <ChevronsRightLeft className="h-4 w-4" aria-hidden />
          ) : (
            <ChevronsLeftRight className="h-4 w-4" aria-hidden />
          )}
        </button>
        <div className="h-full min-h-0 min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
