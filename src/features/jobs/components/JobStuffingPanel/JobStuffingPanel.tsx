import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useInlineValidation } from '@/lib/validation';
import { useJobSubresourceMutations } from '../../hooks/useJobSubresources';
import { useJobStuffingRecords } from '../../hooks/useJobs';
import { createStuffingRecordSchema } from '../../schemas/job.schema';
import { getErrorMessage } from '../../utils/getErrorMessage';

interface JobStuffingPanelProps {
  jobId: string;
}

export function JobStuffingPanel({ jobId }: JobStuffingPanelProps) {
  const { data: records = [], refetch } = useJobStuffingRecords(jobId);
  const mutations = useJobSubresourceMutations(jobId);
  const validation = useInlineValidation();
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

  const create = async () => {
    const ok = await validation.runValidated(
      createStuffingRecordSchema,
      {
        supervisor_name: supervisor.trim(),
        stuffing_date: date.trim(),
        notes: notes.trim() || undefined,
      },
      async (dto) => {
        await mutations.createStuffing.mutateAsync(dto);
        setSupervisor('');
        setNotes('');
        refetch();
      },
    );
    if (!ok) setError(null);
  };

  return (
    <div className="space-y-4">
      {(error || validation.formError) && (
        <p className="text-sm text-[var(--color-danger-600)]">{error || validation.formError}</p>
      )}
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
            error={validation.fieldError('supervisor_name')}
            onChange={(e) => {
              setSupervisor(e.target.value);
              validation.clearField('supervisor_name');
            }}
          />
          <Input
            type="date"
            value={date}
            error={validation.fieldError('stuffing_date')}
            onChange={(e) => {
              setDate(e.target.value);
              validation.clearField('stuffing_date');
            }}
          />
          <Input
            placeholder="Notes"
            value={notes}
            error={validation.fieldError('notes')}
            onChange={(e) => {
              setNotes(e.target.value);
              validation.clearField('notes');
            }}
            className="sm:col-span-2"
          />
          <Button
            type="button"
            disabled={mutations.createStuffing.isPending}
            onClick={() => void create()}
          >
            Create record
          </Button>
        </div>
      </Card>
    </div>
  );
}
