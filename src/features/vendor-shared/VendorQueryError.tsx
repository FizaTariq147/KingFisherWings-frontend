import { Button } from '@/components/ui/Button';
import { vendorErrorMessage } from './vendorUnavailable';

export function VendorQueryError({
  error,
  onRetry,
}: {
  error: unknown;
  onRetry: () => void;
}) {
  return (
    <div className="p-6 space-y-2">
      <p className="text-sm text-[var(--color-danger-600)]" role="alert">
        {vendorErrorMessage(error)}
      </p>
      <Button type="button" size="sm" variant="secondary" onClick={onRetry}>
        Retry
      </Button>
    </div>
  );
}
