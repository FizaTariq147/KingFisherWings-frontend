import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { getErrorMessage } from '@/features/jobs/utils/getErrorMessage';
import { useCcDetails, useCcJobActions } from '../hooks/useCustomsClearance';

export function CcDetailsPanel({ jobId }: { jobId: string }) {
  const { data, isLoading, isError, error, refetch } = useCcDetails(jobId);
  const actions = useCcJobActions(jobId);
  const [form, setForm] = useState({
    direction: '',
    customs_office: '',
    port_id: '',
    importer_id: '',
    exporter_id: '',
    broker_ref: '',
    entry_type: '',
    notes: '',
  });
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!data) return;
    setForm({
      direction: data.direction ?? '',
      customs_office: data.customs_office ?? '',
      port_id: data.port_id ?? '',
      importer_id: data.importer_id ?? '',
      exporter_id: data.exporter_id ?? '',
      broker_ref: data.broker_ref ?? '',
      entry_type: data.entry_type ?? '',
      notes: data.notes ?? '',
    });
  }, [data]);

  const save = async () => {
    setErr(null);
    setMsg(null);
    try {
      await actions.updateDetails.mutateAsync({
        direction: form.direction || undefined,
        customs_office: form.customs_office || undefined,
        port_id: form.port_id || undefined,
        importer_id: form.importer_id || undefined,
        exporter_id: form.exporter_id || undefined,
        broker_ref: form.broker_ref || undefined,
        entry_type: form.entry_type || undefined,
        notes: form.notes || undefined,
      });
      setMsg('CC details saved.');
      await refetch();
    } catch (e) {
      setErr(getErrorMessage(e));
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>CC details</CardTitle>
        <Button type="button" variant="secondary" size="sm" onClick={() => void refetch()}>
          Refresh
        </Button>
      </CardHeader>
      <div className="space-y-3 px-4 pb-4">
        {isLoading ? <p className="text-sm text-[var(--color-neutral-400)]">Loading…</p> : null}
        {isError ? (
          <p className="text-sm text-[var(--color-danger-600)]">{getErrorMessage(error)}</p>
        ) : null}
        <div className="grid gap-2 sm:grid-cols-2">
          {(
            [
              ['direction', 'Direction (import/export)'],
              ['customs_office', 'Customs office'],
              ['port_id', 'Port id'],
              ['importer_id', 'Importer id'],
              ['exporter_id', 'Exporter id'],
              ['broker_ref', 'Broker ref'],
              ['entry_type', 'Entry type'],
              ['notes', 'Notes'],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="block text-xs text-[var(--color-neutral-500)]">
              {label}
              <Input
                className="mt-1"
                value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              />
            </label>
          ))}
        </div>
        {err ? <p className="text-sm text-[var(--color-danger-600)]">{err}</p> : null}
        {msg ? <p className="text-sm text-[var(--color-success-700)]">{msg}</p> : null}
        <Button type="button" disabled={actions.updateDetails.isPending} onClick={() => void save()}>
          Save details
        </Button>
      </div>
    </Card>
  );
}
