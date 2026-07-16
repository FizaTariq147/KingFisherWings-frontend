import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useJobSubresourceMutations } from '../../hooks/useJobSubresources';
import { useJobStuffingRecords } from '../../hooks/useJobs';
import { getErrorMessage } from '../../utils/getErrorMessage';

interface JobStuffingPanelProps {
  jobId: string;
}

export function JobStuffingPanel({ jobId }: JobStuffingPanelProps) {
  const { data: records = [], refetch } = useJobStuffingRecords(jobId);
  const mutations = useJobSubresourceMutations(jobId);
  const [error, setError] = useState<string | null>(null);
  const [supervisor, setSupervisor] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');

  const run = async (fn: () => Promise<unknown>) => {
    setError(null);
    try {
      await fn();
      refetch();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-[var(--color-danger-600)]">{error}</p>}
      <Card>
        <CardHeader>
          <CardTitle>Stuffing records</CardTitle>
        </CardHeader>
        <div className="px-4 pb-4 space-y-2 text-sm">
          {records.length === 0 ? (
            <p className="text-[var(--color-neutral-400)]">No stuffing records.</p>
          ) : (
            records.map((raw) => {
              const r = raw as {
                id: string;
                supervisor_name?: string;
                stuffing_date?: string;
                notes?: string;
              };
              return (
                <div
                  key={r.id}
                  className="flex items-center justify-between gap-2 border-b py-2"
                >
                  <div>
                    <p className="font-medium">{r.supervisor_name}</p>
                    <p className="text-xs text-[var(--color-neutral-400)]">
                      {r.stuffing_date} {r.notes ? `· ${r.notes}` : ''}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        run(() =>
                          mutations.updateStuffing.mutateAsync({
                            recordId: r.id,
                            dto: { notes: r.notes || 'Updated' },
                          }),
                        )
                      }
                    >
                      Touch update
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="danger"
                      onClick={() =>
                        run(() => mutations.deleteStuffing.mutateAsync(r.id))
                      }
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Add stuffing record</CardTitle>
        </CardHeader>
        <div className="px-4 pb-4 grid gap-2 sm:grid-cols-2">
          <Input
            placeholder="Supervisor name *"
            value={supervisor}
            onChange={(e) => setSupervisor(e.target.value)}
          />
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <Input
            placeholder="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="sm:col-span-2"
          />
          <Button
            type="button"
            disabled={!supervisor || !date || mutations.createStuffing.isPending}
            onClick={() =>
              run(async () => {
                await mutations.createStuffing.mutateAsync({
                  supervisor_name: supervisor,
                  stuffing_date: date,
                  notes: notes || undefined,
                });
                setSupervisor('');
                setNotes('');
              })
            }
          >
            Create record
          </Button>
        </div>
      </Card>
    </div>
  );
}
