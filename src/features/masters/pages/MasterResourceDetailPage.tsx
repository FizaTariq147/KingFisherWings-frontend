import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getMasterResource } from '../config/masterResources';
import { useMasterDetail, useMasterMutations } from '../hooks/useMasterResource';
import {
  useMasterPageRoute,
  type MasterPageRouteProps,
} from '../hooks/useMasterPageRoute';
import { masterDisplayValue } from '../utils/normalizeMasterRecord';

export default function MasterResourceDetailPage(props: MasterPageRouteProps = {}) {
  const navigate = useNavigate();
  const { resourceKey, id, listPath, editPath } = useMasterPageRoute(props);
  const resource = getMasterResource(resourceKey);

  // Exchange rates etc. — API has no GET /:id
  useEffect(() => {
    if (resource?.createOnly) {
      navigate(listPath, { replace: true });
    }
  }, [resource, listPath, navigate]);

  const { data, isLoading, isError, error, refetch } = useMasterDetail(
    resource?.key ?? resourceKey,
    resource?.basePath ?? '',
    resource?.createOnly ? '' : id,
  );
  const mutations = useMasterMutations(resource?.key ?? resourceKey, resource?.basePath ?? '');
  const [actionError, setActionError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (!resource) {
    return <p className="text-sm text-[var(--color-neutral-500)]">Unknown master resource.</p>;
  }

  if (resource.createOnly) {
    return (
      <p className="text-sm text-[var(--color-neutral-500)]">
        This master does not support view-by-id. Redirecting to list…
      </p>
    );
  }

  if (isLoading) {
    return <p className="text-sm text-[var(--color-neutral-400)]">Loading…</p>;
  }

  if (isError || !data) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-[var(--color-danger-700)]">
          {error instanceof Error ? error.message : 'Failed to load record.'}
        </p>
        <Button variant="secondary" size="sm" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  const title = masterDisplayValue(data, resource.labelField);
  const active = data.is_active !== false;

  const run = async (action: () => Promise<unknown>) => {
    setActionError(null);
    setPending(true);
    try {
      await action();
      await refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Action failed.');
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-4 max-w-3xl">
      <button
        type="button"
        className="text-xs font-medium text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)]"
        onClick={() => navigate(listPath)}
      >
        ← Back to {resource.title}
      </button>

      {actionError && (
        <div
          role="alert"
          className="mb-4 rounded-lg border px-4 py-3 text-sm"
          style={{
            background: 'var(--color-danger-100)',
            borderColor: '#FECACA',
            color: 'var(--color-danger-700)',
          }}
        >
          {actionError}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">{title}</h2>
            <Badge variant={active ? 'success' : 'neutral'}>{active ? 'Active' : 'Inactive'}</Badge>
          </div>
          <p className="text-xs font-mono text-[var(--color-neutral-400)] mt-1">{data.id}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!resource.createOnly && (
            <Button
              variant="secondary"
              onClick={() => navigate(editPath(id))}
              disabled={pending}
            >
              Edit
            </Button>
          )}
          {!resource.createOnly && (
            <Button
              variant="secondary"
              disabled={pending}
              onClick={() =>
                void run(() => mutations.setActive.mutateAsync({ id, is_active: !active }))
              }
            >
              {active ? 'Deactivate' : 'Activate'}
            </Button>
          )}
          {resource.supportsDelete !== false && (
            <Button
              variant="danger"
              disabled={pending}
              onClick={() => {
                if (!window.confirm('Soft-delete this record?')) return;
                void run(async () => {
                  await mutations.remove.mutateAsync(id);
                  navigate(listPath);
                });
              }}
            >
              Delete
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          {resource.fields.map((field) => (
            <div key={field.name}>
              <dt className="text-xs text-[var(--color-neutral-400)]">{field.label}</dt>
              <dd className="mt-0.5 text-[var(--color-neutral-800)]">
                {masterDisplayValue(data, field.name)}
              </dd>
            </div>
          ))}
        </dl>
      </Card>
    </div>
  );
}
