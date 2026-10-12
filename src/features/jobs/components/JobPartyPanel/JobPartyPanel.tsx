import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useJobActions } from '../../hooks/useJobActions';
import { useJobDetailTab } from '../../hooks/useJobs';
import type { Job } from '../../types/job.types';
import { getErrorMessage } from '../../utils/getErrorMessage';

/** Party tab — backend route remains GET/PATCH …/organization/* */
export function JobPartyPanel({
  job,
  onChanged,
}: {
  job: Job;
  onChanged?: () => void;
}) {
  const actions = useJobActions(job.id);
  const tabQuery = useJobDetailTab(job.id, 'organization');
  const [referenceType, setReferenceType] = useState(
    job.client_reference_type || 'PO_NUMBER',
  );
  const [referenceNo, setReferenceNo] = useState(job.client_reference_no || '');
  const [partyRole, setPartyRole] = useState('CLIENT');
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const save = async () => {
    setError(null);
    setMsg(null);
    try {
      await actions.upsertClientReference.mutateAsync({
        party_role: partyRole,
        reference_type: referenceType,
        reference_no: referenceNo.trim(),
        ...(job.shipper_id ? { party_id: job.shipper_id } : {}),
      });
      setMsg('Client reference saved.');
      onChanged?.();
      void tabQuery.refetch();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const tabData = tabQuery.data;
  const attachmentCount =
    tabData && typeof tabData.attachment_count === 'number'
      ? tabData.attachment_count
      : undefined;

  return (
    <div className="space-y-3 text-sm">
      {error ? <p className="text-[var(--color-danger-600)]">{error}</p> : null}
      {msg ? <p className="text-[var(--color-success-700)]">{msg}</p> : null}
      {tabQuery.isLoading ? (
        <p className="text-[var(--color-neutral-400)]">Loading party…</p>
      ) : null}
      {attachmentCount != null ? (
        <p className="text-[12px] text-[var(--color-neutral-500)]">
          Related refs / attachments: {attachmentCount}
        </p>
      ) : null}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-[12px] font-medium text-[#334155]">Party role</span>
          <select
            className="h-8 w-full rounded-sm border border-[var(--fresa-border,#C9D3DF)] px-2.5 text-[13px]"
            value={partyRole}
            onChange={(e) => setPartyRole(e.target.value)}
          >
            {['CLIENT', 'SHIPPER', 'CONSIGNEE', 'BILLING_PARTY', 'AGENT'].map((r) => (
              <option key={r} value={r}>
                {r.replaceAll('_', ' ')}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-[12px] font-medium text-[#334155]">Reference type</span>
          <select
            className="h-8 w-full rounded-sm border border-[var(--fresa-border,#C9D3DF)] px-2.5 text-[13px]"
            value={referenceType}
            onChange={(e) => setReferenceType(e.target.value)}
          >
            <option value="PO_NUMBER">PO Number</option>
            <option value="CUSTOMER_REF">Customer Ref</option>
            <option value="OTHER">Other</option>
          </select>
        </label>
        <Input
          label="Reference No"
          value={referenceNo}
          onChange={(e) => setReferenceNo(e.target.value)}
        />
      </div>
      <Button
        type="button"
        size="sm"
        variant="edit"
        disabled={!referenceNo.trim() || actions.upsertClientReference.isPending}
        onClick={() => void save()}
      >
        {actions.upsertClientReference.isPending ? 'Saving…' : 'Save client reference'}
      </Button>
    </div>
  );
}
