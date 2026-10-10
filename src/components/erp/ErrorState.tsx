import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function ErrorState({
  message = 'Something went wrong.',
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="space-y-3 py-8 text-center sm:text-left">
      <p className="flex items-start justify-center gap-2 text-sm text-[var(--color-danger-700)] sm:justify-start">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        {message}
      </p>
      {onRetry ? (
        <Button type="button" variant="secondary" onClick={onRetry}>
          Retry
        </Button>
      ) : null}
    </div>
  );
}
