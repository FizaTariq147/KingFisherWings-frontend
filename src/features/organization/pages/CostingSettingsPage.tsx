import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { organizationService } from '../services/organization.service';
import { getErrorMessage } from '../utils/getErrorMessage';

/**
 * GET|PATCH /organization/settings/costing —
 * when PAYMENT_PROOF is uploaded on a sale/cost attachment, auto mark that party paid.
 */
export default function CostingSettingsPage() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['organization', 'costing-settings'],
    queryFn: () => organizationService.getCostingSettings(),
  });
  const [enabled, setEnabled] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (query.data) {
      setEnabled(Boolean(query.data.costing_payment_proof_auto_mark_paid));
    }
  }, [query.data]);

  const save = useMutation({
    mutationFn: () =>
      organizationService.updateCostingSettings({
        costing_payment_proof_auto_mark_paid: enabled,
      }),
    onSuccess: () => {
      setError(null);
      setMessage('Costing settings saved.');
      void queryClient.invalidateQueries({
        queryKey: ['organization', 'costing-settings'],
      });
    },
    onError: (err) => {
      setMessage(null);
      setError(getErrorMessage(err));
    },
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-[var(--color-neutral-900)]">
          Costing
        </h2>
        <p className="mt-1 text-sm text-[var(--color-neutral-500)]">
          Controls whether uploading a costing attachment with purpose{' '}
          <code className="text-[12px]">PAYMENT_PROOF</code> automatically marks that
          sale/cost amount paid (invoice + receipt) using the uploaded file.
        </p>
      </div>

      {query.isLoading ? (
        <p className="text-sm text-[var(--color-neutral-400)]">Loading…</p>
      ) : null}
      {error ? <p className="text-sm text-[var(--color-danger-600)]">{error}</p> : null}
      {message ? <p className="text-sm text-[var(--color-success-700)]">{message}</p> : null}

      <label className="flex cursor-pointer gap-3 rounded-sm bg-white px-3 py-2.5">
        <input
          type="checkbox"
          className="mt-1"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
        />
        <span>
          <span className="block text-sm font-medium text-[var(--color-neutral-900)]">
            Auto mark paid on payment proof
          </span>
          <span className="block text-[12px] text-[var(--color-neutral-500)]">
            When on (default), SALE attachments mark the customer paid and COST
            attachments mark the vendor paid after a successful{' '}
            <code className="text-[11px]">PAYMENT_PROOF</code> upload.
          </span>
        </span>
      </label>

      <Button
        type="button"
        size="sm"
        variant="success"
        disabled={save.isPending || query.isLoading}
        onClick={() => save.mutate()}
      >
        {save.isPending ? 'Saving…' : 'Save'}
      </Button>
    </div>
  );
}
