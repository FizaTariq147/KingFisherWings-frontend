import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { VerificationUploadPanel } from '../components/VerificationUploadPanel';
import {
  useVendorVerification,
  useVendorVerificationMutations,
} from '../hooks/usePartyVerification';
import { vendorVerificationService } from '../services/partyVerification.service';

export default function VendorVerificationPage() {
  const navigate = useNavigate();
  const query = useVendorVerification();
  const mutations = useVendorVerificationMutations();

  return (
    <div className="mx-auto max-w-3xl space-y-5 p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-neutral-900)]">
            Business verification
          </h1>
          <p className="mt-1 text-sm text-[var(--color-neutral-500)]">
            Required before using vendor jobs and finance on the vendor portal.
          </p>
        </div>
        {query.data?.canUse || String(query.data?.status).toUpperCase() === 'APPROVED' ? (
          <Button type="button" size="sm" onClick={() => navigate('/vendor')}>
            Continue to vendor portal
          </Button>
        ) : null}
      </div>

      <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-4 sm:p-5">
        {query.isError ? (
          <p className="mb-3 text-sm text-[var(--color-danger-600)]" role="alert">
            {query.error instanceof Error
              ? query.error.message
              : 'Could not load verification status.'}
          </p>
        ) : null}
        <VerificationUploadPanel
          state={query.data}
          isLoading={query.isLoading}
          mutations={mutations}
          audienceLabel="vendor portal"
          onApproved={() => navigate('/vendor', { replace: true })}
          onDownload={(documentId, fileName) =>
            vendorVerificationService.download(documentId, fileName)
          }
        />
      </div>
    </div>
  );
}
