import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { getErrorMessage } from '@/features/jobs/utils/getErrorMessage';
import { publicApiAdminService } from '../services/publicApiAdmin.service';

function idOf(row: Record<string, unknown>, index: number): string {
  return String(row.id ?? row.key_id ?? index);
}

export default function PublicApiAdminPage() {
  const qc = useQueryClient();
  const keys = useQuery({ queryKey: ['admin-api-keys'], queryFn: () => publicApiAdminService.listKeys() });
  const hooks = useQuery({
    queryKey: ['admin-webhooks'],
    queryFn: () => publicApiAdminService.listWebhooks(),
  });
  const billing = useQuery({
    queryKey: ['admin-billing'],
    queryFn: () => publicApiAdminService.billingStatus(),
  });
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<string | null>(null);

  const run = useMutation({
    mutationFn: async (fn: () => Promise<unknown>) => fn(),
    onSuccess: (value) => {
      setError(null);
      setNotice('Saved.');
      if (value && typeof value === 'object') {
        const record = value as Record<string, unknown>;
        const secret = record.secret ?? record.api_key ?? record.key ?? record.token;
        if (secret) setCreated(String(secret));
        const checkoutUrl = record.url ?? record.checkout_url;
        if (typeof checkoutUrl === 'string' && checkoutUrl.startsWith('http')) {
          window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
        }
      }
      void qc.invalidateQueries({ queryKey: ['admin-api-keys'] });
      void qc.invalidateQueries({ queryKey: ['admin-webhooks'] });
      void qc.invalidateQueries({ queryKey: ['admin-billing'] });
    },
    onError: (err: unknown) => {
      setNotice(null);
      setError(getErrorMessage(err));
    },
  });

  return (
    <div className="space-y-4">
      <PageBackLink to="/settings" />
      <div>
        <h2 className="text-lg font-semibold">Public API</h2>
        <p className="text-sm text-[var(--color-neutral-500)]">
          Tenant API keys, webhooks, and billing for /api/v1 clients.
        </p>
      </div>
      {error ? <p className="text-sm text-[var(--color-danger-600)]">{error}</p> : null}
      {notice ? <p className="text-sm text-[var(--color-success-700)]">{notice}</p> : null}
      {created ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm">
          Copy this key now — it may not be shown again: {created}
        </p>
      ) : null}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>API keys</CardTitle>
          </CardHeader>
          <div className="space-y-3 px-4 pb-4">
            <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <Button
              type="button"
              disabled={!name.trim() || run.isPending}
              onClick={() => run.mutate(() => publicApiAdminService.createKey(name.trim()))}
            >
              Create key
            </Button>
            <ul className="space-y-2 text-sm">
              {(keys.data ?? []).map((row, index) => {
                const id = idOf(row, index);
                return (
                  <li key={id} className="flex items-center justify-between gap-2">
                    <span>{String(row.name ?? row.label ?? id)}</span>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => run.mutate(() => publicApiAdminService.revokeKey(id))}
                    >
                      Revoke
                    </Button>
                  </li>
                );
              })}
            </ul>
          </div>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Webhooks</CardTitle>
          </CardHeader>
          <div className="space-y-3 px-4 pb-4">
            <Input label="URL" value={url} onChange={(e) => setUrl(e.target.value)} />
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                disabled={!url.trim() || run.isPending}
                onClick={() => run.mutate(() => publicApiAdminService.createWebhook(url.trim()))}
              >
                Add webhook
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => run.mutate(() => publicApiAdminService.testDispatch())}
              >
                Test dispatch
              </Button>
            </div>
            <ul className="space-y-1 text-sm">
              {(hooks.data ?? []).map((row, index) => (
                <li key={idOf(row, index)}>{String(row.url ?? row.endpoint ?? idOf(row, index))}</li>
              ))}
            </ul>
          </div>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Billing</CardTitle>
        </CardHeader>
        <div className="space-y-3 px-4 pb-4 text-sm">
          <pre className="overflow-auto rounded bg-[var(--color-neutral-50)] p-3 text-xs">
            {JSON.stringify(billing.data ?? {}, null, 2)}
          </pre>
          <Button type="button" onClick={() => run.mutate(() => publicApiAdminService.checkout())}>
            Start checkout
          </Button>
        </div>
      </Card>
    </div>
  );
}
