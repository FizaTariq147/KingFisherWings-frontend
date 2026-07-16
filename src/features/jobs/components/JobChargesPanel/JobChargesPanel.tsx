import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useJobActions, useJobChargeMutations } from '../../hooks/useJobActions';
import type { Job, JobCharge } from '../../types/job.types';
import { getErrorMessage } from '../../utils/getErrorMessage';

interface JobChargesPanelProps {
  job: Job;
  onChanged?: () => void;
}

export function JobChargesPanel({ job, onChanged }: JobChargesPanelProps) {
  const charges = job.charges ?? [];
  const mutations = useJobChargeMutations(job.id);
  const actions = useJobActions(job.id);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [chargeCodeId, setChargeCodeId] = useState('');
  const [description, setDescription] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [currency, setCurrency] = useState('AED');
  const [prorateCodeId, setProrateCodeId] = useState('');

  const run = async (fn: () => Promise<unknown>, success?: string) => {
    setError(null);
    setMsg(null);
    try {
      await fn();
      if (success) setMsg(success);
      onChanged?.();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-[var(--color-danger-600)]">{error}</p>}
      {msg && <p className="text-sm text-[var(--color-success-700)]">{msg}</p>}
      <Card>
        <CardHeader>
          <CardTitle>Charge lines</CardTitle>
        </CardHeader>
        <div className="px-4 pb-4 space-y-2">
          {charges.length === 0 ? (
            <p className="text-sm text-[var(--color-neutral-400)]">No charges yet.</p>
          ) : (
            charges.map((c: JobCharge) => (
              <div
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-2 py-2 border-b border-[var(--color-neutral-100)] text-sm"
              >
                <div>
                  <p className="font-medium">{c.description}</p>
                  <p className="text-xs text-[var(--color-neutral-400)]">
                    {c.currency_code} {c.unit_price}
                    {c.quantity != null ? ` × ${c.quantity}` : ''}
                    {c.charge_code_id ? ` · code ${c.charge_code_id.slice(0, 8)}` : ''}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      run(
                        () =>
                          mutations.update.mutateAsync({
                            chargeId: c.id,
                            dto: {
                              description: c.description,
                              unit_price: c.unit_price,
                              currency_code: c.currency_code,
                            },
                          }),
                        'Charge updated.',
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
                      run(() => mutations.remove.mutateAsync(c.id), 'Charge removed.')
                    }
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add charge</CardTitle>
        </CardHeader>
        <div className="px-4 pb-4 grid gap-3 sm:grid-cols-2">
          <Input
            placeholder="Charge code UUID"
            value={chargeCodeId}
            onChange={(e) => setChargeCodeId(e.target.value)}
          />
          <Input
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Input
            placeholder="Unit price"
            type="number"
            value={unitPrice}
            onChange={(e) => setUnitPrice(e.target.value)}
          />
          <Input
            placeholder="Currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          />
          <Button
            type="button"
            disabled={mutations.create.isPending}
            onClick={() =>
              run(async () => {
                await mutations.create.mutateAsync({
                  charge_code_id: chargeCodeId,
                  description,
                  unit_price: Number(unitPrice),
                  currency_code: currency.toUpperCase(),
                });
                setChargeCodeId('');
                setDescription('');
                setUnitPrice('');
              }, 'Charge added.')
            }
            className="sm:col-span-2 w-fit"
          >
            Add charge
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Prorate master cost to houses</CardTitle>
        </CardHeader>
        <div className="px-4 pb-4 flex flex-wrap gap-2 items-center">
          <Input
            placeholder="Charge code UUID to prorate"
            value={prorateCodeId}
            onChange={(e) => setProrateCodeId(e.target.value)}
            className="max-w-xs"
          />
          <Button
            type="button"
            variant="secondary"
            disabled={!prorateCodeId || actions.prorateCost.isPending}
            onClick={() =>
              run(() => actions.prorateCost.mutateAsync(prorateCodeId), 'Cost prorated.')
            }
          >
            Prorate cost
          </Button>
        </div>
      </Card>
    </div>
  );
}
