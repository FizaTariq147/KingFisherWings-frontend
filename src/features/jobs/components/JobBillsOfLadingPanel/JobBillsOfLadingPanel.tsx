import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useJobSubresourceMutations } from '../../hooks/useJobSubresources';
import { useJobBillsOfLading } from '../../hooks/useJobs';
import { getErrorMessage } from '../../utils/getErrorMessage';

interface JobBillsOfLadingPanelProps {
  jobId: string;
}

export function JobBillsOfLadingPanel({ jobId }: JobBillsOfLadingPanelProps) {
  const { data: bills = [], refetch } = useJobBillsOfLading(jobId);
  const mutations = useJobSubresourceMutations(jobId);
  const [error, setError] = useState<string | null>(null);
  const [blType, setBlType] = useState('HBL');
  const [blNumber, setBlNumber] = useState('');

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
          <CardTitle>Bills of lading</CardTitle>
        </CardHeader>
        <div className="px-4 pb-4 space-y-2 text-sm">
          {bills.length === 0 ? (
            <p className="text-[var(--color-neutral-400)]">No BLs.</p>
          ) : (
            bills.map((raw) => {
              const b = raw as {
                id: string;
                bl_type?: string;
                bl_number?: string;
                is_original?: boolean;
                is_surrendered?: boolean;
              };
              return (
                <div
                  key={b.id}
                  className="flex flex-wrap items-center justify-between gap-2 border-b py-2"
                >
                  <div>
                    <p className="font-medium">
                      {b.bl_type || 'BL'} {b.bl_number || b.id.slice(0, 8)}
                    </p>
                    <p className="text-xs text-[var(--color-neutral-400)]">
                      Original: {b.is_original ? 'Yes' : 'No'} · Surrendered:{' '}
                      {b.is_surrendered ? 'Yes' : 'No'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        run(() =>
                          mutations.updateBl.mutateAsync({
                            blId: b.id,
                            dto: { is_original: true },
                          }),
                        )
                      }
                    >
                      Mark original
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="danger"
                      onClick={() => run(() => mutations.deleteBl.mutateAsync(b.id))}
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
          <CardTitle>Create BL</CardTitle>
        </CardHeader>
        <div className="px-4 pb-4 grid gap-2 sm:grid-cols-2">
          <Input value={blType} onChange={(e) => setBlType(e.target.value)} placeholder="BL type" />
          <Input
            value={blNumber}
            onChange={(e) => setBlNumber(e.target.value)}
            placeholder="BL number"
          />
          <Button
            type="button"
            disabled={!blType || mutations.createBl.isPending}
            onClick={() =>
              run(async () => {
                await mutations.createBl.mutateAsync({
                  bl_type: blType,
                  bl_number: blNumber || undefined,
                });
                setBlNumber('');
              })
            }
          >
            Create BL
          </Button>
        </div>
      </Card>
    </div>
  );
}
