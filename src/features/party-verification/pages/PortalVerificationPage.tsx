import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import {
  PortalLoadingState,
  PortalPageHeader,
  PortalPanel,
} from '@/features/portal-auth/components/portal-ui';
import { VerificationUploadPanel } from '../components/VerificationUploadPanel';
import {
  usePortalVerification,
  usePortalVerificationMutations,
} from '../hooks/usePartyVerification';
import { portalVerificationService } from '../services/partyVerification.service';

export default function PortalVerificationPage() {
  const navigate = useNavigate();
  const query = usePortalVerification();
  const mutations = usePortalVerificationMutations();

  if (query.isLoading) return <PortalLoadingState label="Loading verification…" />;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <PortalPageHeader
        title="Business verification"
        description="Required before booking or requesting quotes on the customer portal."
        actions={
          query.data?.canUse || String(query.data?.status).toUpperCase() === 'APPROVED' ? (
            <Button type="button" size="sm" onClick={() => navigate('/portal')}>
              Continue to portal
            </Button>
          ) : null
        }
      />
      <PortalPanel padded>
        {query.isError ? (
          <p className="text-sm text-[var(--color-danger-600)]" role="alert">
            {query.error instanceof Error
              ? query.error.message
              : 'Could not load verification status.'}
          </p>
        ) : null}
        <VerificationUploadPanel
          state={query.data}
          isLoading={query.isLoading}
          mutations={mutations}
          audienceLabel="customer portal"
          onApproved={() => navigate('/portal', { replace: true })}
          onDownload={(documentId, fileName) =>
            portalVerificationService.download(documentId, fileName)
          }
        />
      </PortalPanel>
    </div>
  );
}
