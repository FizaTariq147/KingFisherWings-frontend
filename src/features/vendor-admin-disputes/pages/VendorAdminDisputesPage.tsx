import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { getErrorMessage } from '@/features/parties/utils/getErrorMessage';
import {
  PortalAnimatedList,
  PortalAnimatedListItem,
  PortalLoadingState,
} from '@/features/portal-auth/components/portal-ui';
import {
  useAdminVendorDisputes,
  useReviewAdminVendorDispute,
} from '../hooks/useVendorAdminDisputes';
import type { AdminVendorDispute } from '../types/vendorAdminDisputes.types';

export default function VendorAdminDisputesPage() {
  const disputes = useAdminVendorDisputes(true);
  const reviewDispute = useReviewAdminVendorDispute();
  const [actionError, setActionError] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, { status: string; staff_notes: string }>>(
    {},
  );

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-[var(--color-neutral-900)]">
          Vendor disputes inbox
        </h2>
        <p className="text-sm text-[var(--color-neutral-500)]">
          Review and resolve purchase-invoice disputes raised in the Vendor Payment Portal.
        </p>
      </div>

      {actionError ? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {actionError}
        </div>
      ) : null}

      <Card className="p-0 overflow-hidden">
        {disputes.isLoading ? (
          <PortalLoadingState />
        ) : disputes.isError ? (
          <div className="space-y-3 p-6">
            <p className="text-sm font-medium text-[var(--color-danger-600)]">
              {getErrorMessage(disputes.error)}
            </p>
            <Button type="button" size="sm" variant="secondary" onClick={() => void disputes.refetch()}>
              Retry
            </Button>
          </div>
        ) : !(disputes.data?.length) ? (
          <p className="p-6 text-sm text-[var(--color-neutral-400)]">No vendor disputes.</p>
        ) : (
          <PortalAnimatedList className="divide-y divide-[var(--color-neutral-100)]">
            {disputes.data.map((d) => (
              <PortalAnimatedListItem key={d.id}>
                <DisputeRow
                  dispute={d}
                  draft={drafts[d.id] ?? { status: 'UNDER_REVIEW', staff_notes: '' }}
                  onChange={(next) => setDrafts((prev) => ({ ...prev, [d.id]: next }))}
                  pending={reviewDispute.isPending}
                  onSubmit={() => {
                    setActionError(null);
                    const draft = drafts[d.id] ?? {
                      status: 'UNDER_REVIEW',
                      staff_notes: '',
                    };
                    void reviewDispute
                      .mutateAsync({
                        id: d.id,
                        dto: {
                          status: draft.status as
                            | 'OPEN'
                            | 'UNDER_REVIEW'
                            | 'RESOLVED'
                            | 'REJECTED',
                          staff_notes: draft.staff_notes.trim() || undefined,
                        },
                      })
                      .catch((err) => setActionError(getErrorMessage(err)));
                  }}
                />
              </PortalAnimatedListItem>
            ))}
          </PortalAnimatedList>
        )}
      </Card>
    </div>
  );
}

function DisputeRow({
  dispute,
  draft,
  onChange,
  onSubmit,
  pending,
}: {
  dispute: AdminVendorDispute;
  draft: { status: string; staff_notes: string };
  onChange: (next: { status: string; staff_notes: string }) => void;
  onSubmit: () => void;
  pending: boolean;
}) {
  return (
    <div className="px-4 py-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">
            {dispute.invoiceNumber || dispute.invoiceId || 'Dispute'}
          </div>
          <div className="text-xs text-[var(--color-neutral-500)]">
            {[dispute.partyName, dispute.reason, dispute.createdAt].filter(Boolean).join(' · ')}
          </div>
          {dispute.description ? (
            <p className="mt-1 text-sm text-[var(--color-neutral-700)]">{dispute.description}</p>
          ) : null}
          {dispute.staffNotes ? (
            <p className="mt-1 text-xs text-[var(--color-neutral-500)]">
              Previous notes: {dispute.staffNotes}
            </p>
          ) : null}
        </div>
        {dispute.status ? <Badge variant="info">{dispute.status}</Badge> : null}
      </div>
      <div className="grid gap-2 sm:grid-cols-[160px_1fr_auto]">
        <select
          className="h-9 rounded-md border border-[var(--color-neutral-200)] px-2 text-sm"
          value={draft.status}
          onChange={(e) => onChange({ ...draft, status: e.target.value })}
        >
          <option value="OPEN">OPEN</option>
          <option value="UNDER_REVIEW">UNDER_REVIEW</option>
          <option value="RESOLVED">RESOLVED</option>
          <option value="REJECTED">REJECTED</option>
        </select>
        <Input
          value={draft.staff_notes}
          onChange={(e) => onChange({ ...draft, staff_notes: e.target.value })}
          placeholder="Staff notes"
        />
        <Button type="button" size="sm" disabled={pending} onClick={onSubmit}>
          Save
        </Button>
      </div>
    </div>
  );
}
