import { VerificationUploadPanel } from './VerificationUploadPanel';
import {
  usePortalVerification,
  usePortalVerificationMutations,
  useVendorVerification,
  useVendorVerificationMutations,
} from '../hooks/usePartyVerification';
import {
  portalVerificationService,
  vendorVerificationService,
} from '../services/partyVerification.service';
import type { VerificationAudience } from '../store/verificationGateStore';

interface AccountVerificationSectionProps {
  audience: VerificationAudience;
}

/**
 * Account-page section: view / upload / submit company KYC docs
 * via GET/POST/DELETE /portal|/vendor/verification*.
 */
export function AccountVerificationSection({ audience }: AccountVerificationSectionProps) {
  const portalQuery = usePortalVerification(audience === 'portal');
  const vendorQuery = useVendorVerification(audience === 'vendor');
  const portalMutations = usePortalVerificationMutations();
  const vendorMutations = useVendorVerificationMutations();

  const query = audience === 'vendor' ? vendorQuery : portalQuery;
  const mutations = audience === 'vendor' ? vendorMutations : portalMutations;
  const audienceLabel =
    audience === 'vendor' ? 'vendor portal' : 'customer portal';

  return (
    <div id="verification" className="scroll-mt-24 space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-[var(--color-neutral-900)]">
          Business documents
        </h2>
        <p className="mt-1 text-xs text-[var(--color-neutral-500)]">
          View and manage your VAT certificate and business license. Tenant Admin approval
          unlocks the full {audienceLabel}.
        </p>
      </div>
      {query.isError ? (
        <p className="text-sm text-[var(--color-danger-600)]" role="alert">
          {query.error instanceof Error
            ? query.error.message
            : 'Could not load verification documents.'}
        </p>
      ) : null}
      <VerificationUploadPanel
        state={query.data}
        isLoading={query.isLoading}
        mutations={mutations}
        audienceLabel={audienceLabel}
        onDownload={async (documentId, fileName) => {
          if (audience === 'vendor') {
            await vendorVerificationService.download(documentId, fileName);
          } else {
            await portalVerificationService.download(documentId, fileName);
          }
        }}
      />
    </div>
  );
}
