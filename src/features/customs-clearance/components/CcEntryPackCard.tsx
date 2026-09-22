import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { getErrorMessage } from '@/features/jobs/utils/getErrorMessage';
import { useCcJobActions } from '../hooks/useCustomsClearance';

/** POST /jobs/:id/cc/documents/entry-pack */
export function CcEntryPackCard({ jobId }: { jobId: string }) {
  const actions = useCcJobActions(jobId);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>CC entry pack</CardTitle>
      </CardHeader>
      <div className="space-y-2 px-4 pb-4">
        <p className="text-xs text-[var(--color-neutral-500)]">
          Generate the customs entry document pack for this job.
        </p>
        <Button
          type="button"
          disabled={actions.entryPack.isPending}
          onClick={() =>
            void (async () => {
              setErr(null);
              setMsg(null);
              try {
                await actions.entryPack.mutateAsync({});
                setMsg('Entry pack generated.');
              } catch (e) {
                setErr(getErrorMessage(e));
              }
            })()
          }
        >
          Generate entry pack
        </Button>
        {err ? <p className="text-sm text-[var(--color-danger-600)]">{err}</p> : null}
        {msg ? <p className="text-sm text-[var(--color-success-700)]">{msg}</p> : null}
      </div>
    </Card>
  );
}
