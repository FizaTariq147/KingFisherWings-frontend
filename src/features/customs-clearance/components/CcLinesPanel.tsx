import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { getErrorMessage } from '@/features/jobs/utils/getErrorMessage';
import { useCcJobActions, useCcLines } from '../hooks/useCustomsClearance';

export function CcLinesPanel({ jobId }: { jobId: string }) {
  const { data: lines = [], isLoading, isError, error, refetch } = useCcLines(jobId);
  const actions = useCcJobActions(jobId);
  const [description, setDescription] = useState('');
  const [hsCode, setHsCode] = useState('');
  const [quantity, setQuantity] = useState('1');
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle>CC lines</CardTitle>
        <Button type="button" variant="secondary" size="sm" onClick={() => void refetch()}>
          Refresh
        </Button>
      </CardHeader>
      <div className="space-y-3 px-4 pb-4">
        <div className="grid gap-2 sm:grid-cols-4">
          <Input
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Input placeholder="HS code" value={hsCode} onChange={(e) => setHsCode(e.target.value)} />
          <Input
            type="number"
            min={0}
            placeholder="Qty"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
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
                      quantity: Number(quantity) || 1,
                    }),
                  'Line added.',
                ).then(() => {
                  setDescription('');
                  setHsCode('');
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
        {hsMsg ? <p className="text-xs text-[var(--color-neutral-600)]">{hsMsg}</p> : null}
        {err ? <p className="text-sm text-[var(--color-danger-600)]">{err}</p> : null}
        {msg ? <p className="text-sm text-[var(--color-success-700)]">{msg}</p> : null}
        {isLoading ? <p className="text-sm text-[var(--color-neutral-400)]">Loading…</p> : null}
        {isError ? (
          <p className="text-sm text-[var(--color-danger-600)]">{getErrorMessage(error)}</p>
        ) : null}
        <ul className="divide-y divide-[var(--color-neutral-100)] rounded-md border border-[var(--color-neutral-200)]">
          {lines.map((line) => (
            <li
              key={line.id}
              className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm"
            >
              <div>
                <p className="font-medium">
                  {line.description || 'Line'}
                  {line.hs_code ? ` · HS ${line.hs_code}` : ''}
                  {line.quantity != null ? ` × ${line.quantity}` : ''}
                </p>
                <p className="text-xs text-[var(--color-neutral-500)]">
                  {line.classified ? 'Classified' : 'Unclassified'}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  disabled={actions.classifyLine.isPending}
                  onClick={() =>
                    void run(
                      () =>
                        actions.classifyLine.mutateAsync({
                          lineId: line.id,
                          dto: { hs_code: line.hs_code || hsCode.trim() || undefined },
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
