import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  PortalEmptyState,
  PortalLoadingState,
  PortalPageHeader,
  PortalPanel,
} from '@/features/portal-auth/components/portal-ui';
import { VendorQueryError } from '@/features/vendor-shared/VendorQueryError';
import { useVendorTds } from '../hooks/useVendorTds';

export default function VendorTdsPage() {
  const { data, isLoading, isError, error, refetch } = useVendorTds();

  return (
    <div className="space-y-5">
      <PortalPageHeader title="TDS" description="Tax deducted at source certificates for India." />
      <PortalPanel padded>
        {isLoading ? (
          <PortalLoadingState />
        ) : isError ? (
          <VendorQueryError error={error} onRetry={() => void refetch()} />
        ) : data?.available ? (
          <p className="text-sm text-[var(--color-neutral-700)]">
            {data.message || 'TDS certificates will appear here when issued.'}
          </p>
        ) : (
          <div className="space-y-4">
            <PortalEmptyState
              title="TDS certificates are not available yet"
              description={
                data?.message ||
                `This feature is planned for ${data?.phase || 'india_phase_3'}. No certificates are shown.`
              }
              Icon={FileText}
            />
            <Button type="button" size="sm" variant="secondary" onClick={() => void refetch()}>
              Retry
            </Button>
          </div>
        )}
      </PortalPanel>
    </div>
  );
}
