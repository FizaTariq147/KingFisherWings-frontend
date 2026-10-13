import type { MouseEvent } from 'react';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface ListRowEditButtonProps {
  onClick: () => void;
  disabled?: boolean;
  title?: string;
  className?: string;
  'aria-label'?: string;
}

/**
 * Compact pencil control for the right edge of list rows (Jobs / Quotes /
 * Enquiries / Shipments). Always stops row-click navigation.
 */
export function ListRowEditButton({
  onClick,
  disabled,
  title = 'Edit',
  className,
  'aria-label': ariaLabel = 'Edit',
}: ListRowEditButtonProps) {
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onClick();
  };

  return (
    <Button
      type="button"
      size="icon"
      variant="edit"
      disabled={disabled}
      title={title}
      aria-label={ariaLabel}
      className={cn('h-7 w-7 shrink-0', className)}
      onClick={handleClick}
    >
      <Pencil className="h-3.5 w-3.5" aria-hidden />
    </Button>
  );
}
