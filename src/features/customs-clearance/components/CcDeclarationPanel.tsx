import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { getErrorMessage } from '@/features/jobs/utils/getErrorMessage';
import { useCcDeclaration, useCcJobActions } from '../hooks/useCustomsClearance';

export function CcDeclarationPanel({ jobId }: { jobId: string }) {
  const { data, isLoading, isError, error, refetch } = useCcDeclaration(jobId);
  const actions = useCcJobActions(jobId);
  const [jsonText, setJsonText] = useState('{}');
  const [entryNumber, setEntryNumber] = useState('');
  const [filingType, setFilingType] = useState('BOE');
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!data?.payload) return;
    try {
      setJsonText(JSON.stringify(data.payload, null, 2));
    } catch {
      setJsonText('{}');
    }
  }, [data]);

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
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Declaration</CardTitle>
          <Button type="button" variant="secondary" size="sm" onClick={() => void refetch()}>
            Refresh
          </Button>
        </CardHeader>
        <div className="space-y-3 px-4 pb-4">
          {isLoading ? <p className="text-sm text-[var(--color-neutral-400)]">Loading…</p> : null}
          {isError ? (
            <p className="text-sm text-[var(--color-danger-600)]">{getErrorMessage(error)}</p>
          ) : null}
          <textarea
            className="min-h-[160px] w-full rounded-md border border-[var(--color-neutral-200)] bg-white p-2 font-mono text-xs"
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
          />
          {data?.validation_errors?.length ? (
            <ul className="list-disc pl-5 text-sm text-[var(--color-danger-600)]">
              {data.validation_errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              disabled={actions.putDeclaration.isPending}
              onClick={() =>
                void run(async () => {
                  let payload: Record<string, unknown> = {};
                  try {
                    payload = JSON.parse(jsonText) as Record<string, unknown>;
                  } catch {
                    throw new Error('Declaration JSON is invalid.');
                  }
                  await actions.putDeclaration.mutateAsync(payload);
                }, 'Declaration saved.')
              }
            >
              Save declaration
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={actions.validateDeclaration.isPending}
              onClick={() =>
                void run(
                  () => actions.validateDeclaration.mutateAsync({}),
                  'Declaration validated.',
                )
              }
            >
              Validate
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={actions.submitDeclarationLocal.isPending}
              onClick={() =>
                void run(
                  () => actions.submitDeclarationLocal.mutateAsync({}),
                  'Submitted locally.',
                )
              }
            >
              Submit local
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Filing</CardTitle>
        </CardHeader>
        <div className="space-y-3 px-4 pb-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <Input
              placeholder="Filing type (BOE / SB)"
              value={filingType}
              onChange={(e) => setFilingType(e.target.value)}
            />
            <Input
              placeholder="Entry number"
              value={entryNumber}
              onChange={(e) => setEntryNumber(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              disabled={actions.updateFiling.isPending}
              onClick={() =>
                void run(
                  () =>
                    actions.updateFiling.mutateAsync({
                      filing_type: filingType || undefined,
                      entry_number: entryNumber || undefined,
                    }),
                  'Filing saved.',
                )
              }
            >
              Save filing
            </Button>
            <Button
              type="button"
              disabled={actions.stageFile.isPending}
              onClick={() => void run(() => actions.stageFile.mutateAsync({}), 'File stage done.')}
            >
              Stage: file
            </Button>
          </div>
          {err ? <p className="text-sm text-[var(--color-danger-600)]">{err}</p> : null}
          {msg ? <p className="text-sm text-[var(--color-success-700)]">{msg}</p> : null}
        </div>
      </Card>
    </div>
  );
}
