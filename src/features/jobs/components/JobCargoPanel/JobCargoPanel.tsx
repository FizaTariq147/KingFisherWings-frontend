import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useInlineValidation } from '@/lib/validation';
import { useJobSubresourceMutations } from '../../hooks/useJobSubresources';
import { useJobCargo } from '../../hooks/useJobs';
import { createJobCargoSchema } from '../../schemas/job.schema';
import { getErrorMessage } from '../../utils/getErrorMessage';

interface JobCargoPanelProps {
  jobId: string;
}

function emptyToUndef(value: string): string | undefined {
  const t = value.trim();
  return t ? t : undefined;
}

function numberOrUndef(value: string): number | undefined {
  if (value.trim() === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export function JobCargoPanel({ jobId }: JobCargoPanelProps) {
  const { data: cargo = [], refetch } = useJobCargo(jobId);
  const mutations = useJobSubresourceMutations(jobId);
  const validation = useInlineValidation();
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

  const add = async () => {
    const ok = await validation.runValidated(
      createJobCargoSchema,
      {
        description: emptyToUndef(description),
        packages: numberOrUndef(packages),
        gross_weight: numberOrUndef(gross),
        measurement: numberOrUndef(volume),
        hs_code: emptyToUndef(hs),
      },
      async (dto) => {
        await mutations.createCargo.mutateAsync(dto);
        setDescription('');
        setPackages('');
        setGross('');
        setVolume('');
        setHs('');
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
            error={validation.fieldError('description')}
            onChange={(e) => {
              setDescription(e.target.value);
              validation.clearField('description');
            }}
            className="sm:col-span-2"
          />
          <Input
            placeholder="Packages"
            type="number"
            value={packages}
            error={validation.fieldError('packages')}
            onChange={(e) => {
              setPackages(e.target.value);
              validation.clearField('packages');
            }}
          />
          <Input
            placeholder="Gross weight"
            type="number"
            value={gross}
            error={validation.fieldError('gross_weight')}
            onChange={(e) => {
              setGross(e.target.value);
              validation.clearField('gross_weight');
            }}
          />
          <Input
            placeholder="Volume CBM"
            type="number"
            value={volume}
            error={validation.fieldError('measurement')}
            onChange={(e) => {
              setVolume(e.target.value);
              validation.clearField('measurement');
            }}
          />
          <Input
            placeholder="HS code"
            value={hs}
            error={validation.fieldError('hs_code')}
            onChange={(e) => {
              setHs(e.target.value);
              validation.clearField('hs_code');
            }}
          />
          <Button
            type="button"
            className="sm:col-span-2 w-fit"
            disabled={mutations.createCargo.isPending}
            onClick={() => void add()}
          >
            Add cargo
          </Button>
        </div>
      </Card>
    </div>
  );
}
