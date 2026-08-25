import { useMemo, useState, type ReactNode } from 'react';
import { AlertCircle, RefreshCw, Scale } from 'lucide-react';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { parseWithFieldErrors } from '@/lib/validation';
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
import { reviewVendorDisputeSchema } from '../schemas/vendorAdminDisputes.schema';
import type { AdminVendorDispute } from '../types/vendorAdminDisputes.types';

function PanelShell({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">{children}</div>
  );
}

function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-400">
        <Scale size={20} />
      </span>
      <p className="text-sm font-medium text-gray-700">{title}</p>
      {hint ? <p className="max-w-sm text-xs text-gray-400">{hint}</p> : null}
    </div>
  );
}

export default function VendorAdminDisputesPage() {
  const disputes = useAdminVendorDisputes(true);
  const reviewDispute = useReviewAdminVendorDispute();
  const [actionError, setActionError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, Record<string, string>>>({});
  const [drafts, setDrafts] = useState<Record<string, { status: string; staff_notes: string }>>(
    {},
  );

  const openDisputeCount = useMemo(
    () =>
      (disputes.data ?? []).filter((d) => {
        const status = String(d.status ?? '').toUpperCase();
        return status !== 'RESOLVED' && status !== 'REJECTED';
      }).length,
    [disputes.data],
  );

  return (
    <div className="space-y-5">
      <PageBackLink to="/vendors" label="Back to Vendors" />

      <div className="overflow-hidden rounded-xl border border-[#0A2942]/10 bg-[#0A2942] px-5 py-5 sm:px-6">
        <div className="flex flex-wrap items-start gap-4">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white">
            <Scale size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold text-white">Vendor disputes inbox</h1>
            <p className="mt-1 text-sm text-white/65">
              Review and resolve purchase-invoice disputes raised in the Vendor Payment Portal.
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-white/70">
                {(disputes.data ?? []).length} total
              </span>
              <span className="rounded-full border border-[#FF751F]/35 bg-[#FF751F]/15 px-2.5 py-1 text-[#FFB27A]">
                {openDisputeCount} open
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void disputes.refetch()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/15"
          >
            <RefreshCw size={14} className={disputes.isFetching ? 'animate-spin' : ''} />
            {disputes.isFetching ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>

      {actionError ? (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{actionError}</span>
        </div>
      ) : null}

      <PanelShell>
        <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-3 text-sm font-medium text-[#0A2942]">
          <Scale size={15} className="text-[#FF751F]" />
          Disputes
        </div>
        {disputes.isLoading ? (
          <PortalLoadingState />
        ) : disputes.isError ? (
          <div className="space-y-3 p-6">
            <p className="text-sm font-medium text-red-600">{getErrorMessage(disputes.error)}</p>
            <Button type="button" size="sm" variant="secondary" onClick={() => void disputes.refetch()}>
              Retry
            </Button>
          </div>
        ) : !(disputes.data?.length) ? (
          <EmptyState
            title="No vendor disputes."
            hint="Disputes raised from the Vendor Payment Portal will appear here."
          />
        ) : (
          <PortalAnimatedList className="divide-y divide-gray-100">
            {disputes.data.map((d) => (
              <PortalAnimatedListItem key={d.id}>
                <DisputeRow
                  dispute={d}
                  draft={drafts[d.id] ?? { status: 'UNDER_REVIEW', staff_notes: '' }}
                  errors={fieldErrors[d.id]}
                  onChange={(next) => {
                    setDrafts((prev) => ({ ...prev, [d.id]: next }));
                    setFieldErrors((prev) => {
                      if (!prev[d.id]) return prev;
                      const copy = { ...prev };
                      delete copy[d.id];
                      return copy;
                    });
                  }}
                  pending={reviewDispute.isPending}
                  onSubmit={() => {
                    setActionError(null);
                    const draft = drafts[d.id] ?? {
                      status: 'UNDER_REVIEW',
                      staff_notes: '',
                    };
                    const parsed = parseWithFieldErrors(reviewVendorDisputeSchema, {
                      status: draft.status,
                      staff_notes: draft.staff_notes.trim() || undefined,
                    });
                    if (!parsed.success) {
                      setFieldErrors((prev) => ({ ...prev, [d.id]: parsed.fieldErrors }));
                      setActionError(parsed.message);
                      return;
                    }
                    void reviewDispute
                      .mutateAsync({ id: d.id, dto: parsed.data })
                      .then(() => {
                        setFieldErrors((prev) => {
                          const copy = { ...prev };
                          delete copy[d.id];
                          return copy;
                        });
                      })
                      .catch((err) => setActionError(getErrorMessage(err)));
                  }}
                />
              </PortalAnimatedListItem>
            ))}
          </PortalAnimatedList>
        )}
      </PanelShell>
    </div>
  );
}

function DisputeRow({
  dispute,
  draft,
  errors,
  onChange,
  onSubmit,
  pending,
}: {
  dispute: AdminVendorDispute;
  draft: { status: string; staff_notes: string };
  errors?: Record<string, string>;
  onChange: (next: { status: string; staff_notes: string }) => void;
  onSubmit: () => void;
  pending: boolean;
}) {
  return (
    <div className="space-y-3 px-5 py-4 hover:bg-gray-50/60">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-[#0A2942]">
            {dispute.invoiceNumber || dispute.invoiceId || 'Dispute'}
          </div>
          <div className="mt-1 text-xs text-gray-500">
            {[dispute.partyName, dispute.reason, dispute.createdAt].filter(Boolean).join(' · ')}
          </div>
          {dispute.description ? (
            <p className="mt-2 text-sm leading-relaxed text-gray-600">{dispute.description}</p>
          ) : null}
          {dispute.staffNotes ? (
            <p className="mt-1 text-xs text-gray-500">Previous notes: {dispute.staffNotes}</p>
          ) : null}
        </div>
        {dispute.status ? <Badge variant="info">{dispute.status}</Badge> : null}
      </div>
      <div className="grid gap-2 rounded-lg border border-gray-200 bg-gray-50/80 p-3 sm:grid-cols-[160px_1fr_auto]">
        <div className="space-y-1">
          <select
            className={`h-9 w-full rounded-md border bg-white px-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#FF751F] focus:border-[#FF751F] ${
              errors?.status ? 'border-red-500' : 'border-gray-300'
            }`}
            value={draft.status}
            onChange={(e) => onChange({ ...draft, status: e.target.value })}
          >
            <option value="OPEN">OPEN</option>
            <option value="UNDER_REVIEW">UNDER_REVIEW</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
          {errors?.status ? <p className="text-xs text-red-500">{errors.status}</p> : null}
        </div>
        <Input
          value={draft.staff_notes}
          onChange={(e) => onChange({ ...draft, staff_notes: e.target.value })}
          placeholder="Staff notes"
          error={errors?.staff_notes}
        />
        <Button type="button" size="sm" disabled={pending} onClick={onSubmit}>
          {pending ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </div>
  );
}
