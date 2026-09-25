import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { getErrorMessage } from '@/features/jobs/utils/getErrorMessage';
import type { CcLine } from '../types/customsClearance.types';
import { useCcJobActions, useCcLines } from '../hooks/useCustomsClearance';

function lineDraft(line: CcLine) {
  return {
    description: line.description ?? '',
    hs_code: line.hs_code ?? '',
    quantity: line.quantity != null ? String(line.quantity) : '',
    unit: line.unit ?? '',
    value_amount: line.value_amount != null ? String(line.value_amount) : '',
    currency_code: line.currency_code ?? 'AED',
    country_of_origin: line.country_of_origin ?? '',
  };
}

export function CcLinesPanel({ jobId }: { jobId: string }) {
  const { data: lines = [], isLoading, isError, error, refetch } = useCcLines(jobId);
  const actions = useCcJobActions(jobId);
  const [description, setDescription] = useState('');
  const [hsCode, setHsCode] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('');
  const [valueAmount, setValueAmount] = useState('');
  const [currency, setCurrency] = useState('AED');
  const [origin, setOrigin] = useState('');
  const [permitNotes, setPermitNotes] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [edit, setEdit] = useState(lineDraft({ id: '' }));
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [hsMsg, setHsMsg] = useState<string | null>(null);

  const run = async (fn: () => Promise<unknown>, success: string) => {
    setErr(null);
    setMsg(null);
    try {
      await fn();
      setMsg(success);
      await refetch();
    } catch (e) {
      setErr(getErrorMessage(e));
    }
  };

  const startEdit = (line: CcLine) => {
    setEditingId(line.id);
    setEdit(lineDraft(line));
    setErr(null);
    setMsg(null);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle>CC lines</CardTitle>
        <Button type="button" variant="secondary" size="sm" onClick={() => void refetch()}>
          Refresh
        </Button>
      </CardHeader>
      <div className="space-y-3 px-4 pb-4">
        <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-4">
          <Input
            placeholder="Description *"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Input
            placeholder="8517.12"
            value={hsCode}
            onChange={(e) => setHsCode(e.target.value)}
          />
          <Input
            type="number"
            min={0}
            placeholder="Qty"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
          <Input placeholder="Unit" value={unit} onChange={(e) => setUnit(e.target.value)} />
          <Input
            type="number"
            min={0}
            placeholder="Value amount"
            value={valueAmount}
            onChange={(e) => setValueAmount(e.target.value)}
          />
          <Input
            placeholder="Currency (AED)"
            value={currency}
            onChange={(e) => setCurrency(e.target.value.toUpperCase())}
            maxLength={3}
          />
          <Input
            placeholder="Origin (ISO-2)"
            value={origin}
            onChange={(e) => setOrigin(e.target.value.toUpperCase())}
            maxLength={2}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              disabled={actions.createLine.isPending || !description.trim()}
              onClick={() =>
                void run(
                  () =>
                    actions.createLine.mutateAsync({
                      description: description.trim(),
                      hs_code: hsCode.trim() || undefined,
                      quantity: Number(quantity) || undefined,
                      unit: unit.trim() || undefined,
                      value_amount: valueAmount ? Number(valueAmount) : undefined,
                      currency_code: currency.trim() || undefined,
                      country_of_origin: origin.trim() || undefined,
                    }),
                  'Line added.',
                ).then(() => {
                  setDescription('');
                  setHsCode('');
                  setValueAmount('');
                  setOrigin('');
                })
              }
            >
              Add line
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={actions.validateHs.isPending || !hsCode.trim()}
              onClick={() =>
                void (async () => {
                  setHsMsg(null);
                  try {
                    const res = await actions.validateHs.mutateAsync({
                      hs_code: hsCode.trim(),
                    });
                    setHsMsg(
                      [
                        res.valid === false ? 'Invalid' : 'Valid',
                        res.description,
                        res.is_prohibited ? 'Prohibited' : null,
                        res.is_restricted ? 'Restricted' : null,
                        res.message,
                      ]
                        .filter(Boolean)
                        .join(' · '),
                    );
                  } catch (e) {
                    setHsMsg(getErrorMessage(e));
                  }
                })()
              }
            >
              Validate HS
            </Button>
          </div>
        </div>
        <Input
          placeholder="Permit notes (used when classifying)"
          value={permitNotes}
          onChange={(e) => setPermitNotes(e.target.value)}
        />
        {hsMsg ? <p className="text-xs text-[var(--color-neutral-600)]">{hsMsg}</p> : null}
        {err ? <p className="text-sm text-[var(--color-danger-600)]">{err}</p> : null}
        {msg ? <p className="text-sm text-[var(--color-success-700)]">{msg}</p> : null}
        {isLoading ? <p className="text-sm text-[var(--color-neutral-400)]">Loading…</p> : null}
        {isError ? (
          <p className="text-sm text-[var(--color-danger-600)]">{getErrorMessage(error)}</p>
        ) : null}
        <ul className="divide-y divide-[var(--color-neutral-100)] rounded-md border border-[var(--color-neutral-200)]">
          {lines.map((line) => (
            <li key={line.id} className="space-y-2 px-3 py-2 text-sm">
              {editingId === line.id ? (
                <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-4">
                  <Input
                    placeholder="Description"
                    value={edit.description}
                    onChange={(e) => setEdit((d) => ({ ...d, description: e.target.value }))}
                  />
                  <Input
                    placeholder="HS code"
                    value={edit.hs_code}
                    onChange={(e) => setEdit((d) => ({ ...d, hs_code: e.target.value }))}
                  />
                  <Input
                    type="number"
                    min={0}
                    placeholder="Qty"
                    value={edit.quantity}
                    onChange={(e) => setEdit((d) => ({ ...d, quantity: e.target.value }))}
                  />
                  <Input
                    placeholder="Unit"
                    value={edit.unit}
                    onChange={(e) => setEdit((d) => ({ ...d, unit: e.target.value }))}
                  />
                  <Input
                    type="number"
                    min={0}
                    placeholder="Value"
                    value={edit.value_amount}
                    onChange={(e) => setEdit((d) => ({ ...d, value_amount: e.target.value }))}
                  />
                  <Input
                    placeholder="Currency"
                    value={edit.currency_code}
                    onChange={(e) =>
                      setEdit((d) => ({ ...d, currency_code: e.target.value.toUpperCase() }))
                    }
                    maxLength={3}
                  />
                  <Input
                    placeholder="Origin"
                    value={edit.country_of_origin}
                    onChange={(e) =>
                      setEdit((d) => ({
                        ...d,
                        country_of_origin: e.target.value.toUpperCase(),
                      }))
                    }
                    maxLength={2}
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      disabled={actions.updateLine.isPending || !edit.description.trim()}
                      onClick={() =>
                        void run(
                          () =>
                            actions.updateLine.mutateAsync({
                              lineId: line.id,
                              dto: {
                                description: edit.description.trim(),
                                hs_code: edit.hs_code.trim() || undefined,
                                quantity: edit.quantity ? Number(edit.quantity) : undefined,
                                unit: edit.unit.trim() || undefined,
                                value_amount: edit.value_amount
                                  ? Number(edit.value_amount)
                                  : undefined,
                                currency_code: edit.currency_code.trim() || undefined,
                                country_of_origin: edit.country_of_origin.trim() || undefined,
                              },
                            }),
                          'Line updated.',
                        ).then(() => setEditingId(null))
                      }
                    >
                      Save
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">
                      {line.description || 'Line'}
                      {line.hs_code ? ` · HS ${line.hs_code}` : ''}
                      {line.quantity != null ? ` × ${line.quantity}` : ''}
                      {line.value_amount != null
                        ? ` · ${line.currency_code || ''} ${line.value_amount}`
                        : ''}
                    </p>
                    <p className="text-xs text-[var(--color-neutral-500)]">
                      {line.classified ? 'Classified' : 'Unclassified'}
                      {line.country_of_origin ? ` · Origin ${line.country_of_origin}` : ''}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => startEdit(line)}
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      disabled={
                        actions.classifyLine.isPending || !(line.hs_code || hsCode.trim())
                      }
                      onClick={() =>
                        void run(
                          () =>
                            actions.classifyLine.mutateAsync({
                              lineId: line.id,
                              dto: {
                                hs_code: (line.hs_code || hsCode.trim()) as string,
                                permit_notes: permitNotes.trim() || undefined,
                              },
                            }),
                          'Line classified.',
                        )
                      }
                    >
                      Classify
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      disabled={actions.deleteLine.isPending}
                      onClick={() =>
                        void run(() => actions.deleteLine.mutateAsync(line.id), 'Line deleted.')
                      }
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              )}
            </li>
          ))}
          {!isLoading && lines.length === 0 ? (
            <li className="px-3 py-2 text-sm text-[var(--color-neutral-400)]">No lines yet.</li>
          ) : null}
        </ul>
        <Button
          type="button"
          disabled={actions.stageClassify.isPending}
          onClick={() =>
            void run(() => actions.stageClassify.mutateAsync({}), 'Classify stage complete.')
          }
        >
          Stage: classify complete
        </Button>
      </div>
    </Card>
  );
}
