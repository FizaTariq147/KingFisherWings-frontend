import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useJobActions } from '../../hooks/useJobActions';
import { useJobDetailTab } from '../../hooks/useJobs';
import type { Job } from '../../types/job.types';
import { getErrorMessage } from '../../utils/getErrorMessage';

export function JobDimensionsPanel({
  job,
  onChanged,
}: {
  job: Job;
  onChanged?: () => void;
}) {
  const actions = useJobActions(job.id);
  const tabQuery = useJobDetailTab(job.id, 'dimensions');
  const [commodityDescription, setCommodityDescription] = useState(
    job.commodity_description || job.commodity || '',
  );
  const [hsCode, setHsCode] = useState(job.hs_code || '');
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const save = async () => {
    setError(null);
    setMsg(null);
    try {
      await actions.patchDimensions.mutateAsync({
        commodity_description: commodityDescription.trim() || undefined,
        hs_code: hsCode.trim() || undefined,
      });
      setMsg('Dimensions updated.');
      onChanged?.();
      void tabQuery.refetch();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-3 text-sm">
      {error ? <p className="text-[var(--color-danger-600)]">{error}</p> : null}
      {msg ? <p className="text-[var(--color-success-700)]">{msg}</p> : null}
      {tabQuery.isLoading ? (
        <p className="text-[var(--color-neutral-400)]">Loading dimensions…</p>
      ) : null}
      <Input
        label="Commodity description"
        value={commodityDescription}
        onChange={(e) => setCommodityDescription(e.target.value)}
      />
      <Input label="HS code" value={hsCode} onChange={(e) => setHsCode(e.target.value)} />
      <Button
        type="button"
        size="sm"
        variant="edit"
        disabled={actions.patchDimensions.isPending}
        onClick={() => void save()}
      >
        {actions.patchDimensions.isPending ? 'Saving…' : 'Save dimensions'}
      </Button>
    </div>
  );
}
