import { Button } from '@/components/ui/Button';
import { VerificationBlockedCallout } from '@/features/party-verification/components/VerificationBlockedCallout';
import { getVerificationGateMessage } from '@/features/party-verification/utils/normalizePartyVerification';
import { vendorErrorMessage } from './vendorUnavailable';

export function VendorQueryError({
  error,
  onRetry,
}: {
  error: unknown;
  onRetry: () => void;
}) {
  const verificationMessage = getVerificationGateMessage(error);

  if (verificationMessage) {
    return (
      <div className="p-4">
        <VerificationBlockedCallout
          audience="vendor"
          message={verificationMessage}
        />
      </div>
    );
  }

  return (
    <div className="space-y-2 p-6">
      <p className="text-sm text-[var(--color-danger-600)]" role="alert">
        {vendorErrorMessage(error)}
      </p>
      <Button type="button" size="sm" variant="secondary" onClick={onRetry}>
        Retry
      </Button>
    </div>
  );
}
