import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useJobSubresourceMutations } from '../../hooks/useJobSubresources';
import { useJobCargo } from '../../hooks/useJobs';
import { getErrorMessage } from '../../utils/getErrorMessage';

interface JobCargoPanelProps {
  jobId: string;
}

export function JobCargoPanel({ jobId }: JobCargoPanelProps) {
  const { data: cargo = [], refetch } = useJobCargo(jobId);
  const mutations = useJobSubresourceMutations(jobId);
  const [error, setError] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [packages, setPackages] = useState('');
  const [gross, setGross] = useState('');
  const [volume, setVolume] = useState('');
  const [hs, setHs] = useState('');

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
          <CardTitle>Cargo lines</CardTitle>
        </CardHeader>
        <div className="px-4 pb-4 space-y-2 text-sm">
          {cargo.length === 0 ? (
            <p className="text-[var(--color-neutral-400)]">No cargo lines.</p>
          ) : (
            cargo.map((raw) => {
              const c = raw as {
                id: string;
                description?: string;
                packages?: number;
                gross_weight?: number;
                volume_cbm?: number;
                hs_code?: string;
              };
              return (
                <div
                  key={c.id}
                  className="flex items-center justify-between gap-2 border-b border-[var(--color-neutral-100)] py-2"
                >
                  <div>
                    <p className="font-medium">{c.description || 'Cargo'}</p>
                    <p className="text-xs text-[var(--color-neutral-400)]">
                      Pkgs {c.packages ?? '—'} · GW {c.gross_weight ?? '—'} · CBM{' '}
                      {c.volume_cbm ?? '—'} · HS {c.hs_code || '—'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        run(() =>
                          mutations.updateCargo.mutateAsync({
                            cargoId: c.id,
                            dto: {
                              description: c.description,
                              packages: c.packages,
                              gross_weight: c.gross_weight,
                            },
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
                      onClick={() => run(() => mutations.deleteCargo.mutateAsync(c.id))}
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
          <CardTitle>Add cargo</CardTitle>
        </CardHeader>
        <div className="px-4 pb-4 grid gap-2 sm:grid-cols-2">
          <Input
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="sm:col-span-2"
          />
          <Input
            placeholder="Packages"
            type="number"
            value={packages}
            onChange={(e) => setPackages(e.target.value)}
          />
          <Input
            placeholder="Gross weight"
            type="number"
            value={gross}
            onChange={(e) => setGross(e.target.value)}
          />
          <Input
            placeholder="Volume CBM"
            type="number"
            value={volume}
            onChange={(e) => setVolume(e.target.value)}
          />
          <Input placeholder="HS code" value={hs} onChange={(e) => setHs(e.target.value)} />
          <Button
            type="button"
            className="sm:col-span-2 w-fit"
            disabled={mutations.createCargo.isPending}
            onClick={() =>
              run(async () => {
                await mutations.createCargo.mutateAsync({
                  description: description || undefined,
                  packages: packages ? Number(packages) : undefined,
                  gross_weight: gross ? Number(gross) : undefined,
                  volume_cbm: volume ? Number(volume) : undefined,
                  hs_code: hs || undefined,
                });
                setDescription('');
                setPackages('');
                setGross('');
                setVolume('');
                setHs('');
              })
            }
          >
            Add cargo
          </Button>
        </div>
      </Card>
    </div>
  );
}
