import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getErrorMessage } from '@/features/jobs/utils/getErrorMessage';

type PlatformBillingErrorAlertProps = {
  error: unknown;
  onRetry?: () => void;
};

export function PlatformBillingErrorAlert({ error, onRetry }: PlatformBillingErrorAlertProps) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-lg border px-4 py-3 text-sm"
      style={{
        background: 'var(--color-danger-100)',
        borderColor: '#FECACA',
        color: 'var(--color-danger-700)',
      }}
    >
      <div className="flex items-start gap-2">
        <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
        <span>{getErrorMessage(error)}</span>
      </div>
      {onRetry && (
        <Button type="button" variant="secondary" size="sm" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}
