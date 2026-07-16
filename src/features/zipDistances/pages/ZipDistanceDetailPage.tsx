import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DetailPageTemplate } from '@/components/templates/DetailPageTemplate';
import { ZIP_DISTANCE_ROUTE_PREFIX } from '../api/zipDistance.api';
import {
  ZipDistanceConfirmModal,
  type ZipDistanceConfirmAction,
} from '../components/ZipDistanceConfirmModal';
import { ZipDistanceOverviewPanel } from '../components/ZipDistanceOverviewPanel';
import {
  useDeleteZipDistance,
  useSetZipDistanceActive,
  useZipDistance,
} from '../hooks/useZipDistances';
import { getErrorMessage } from '../utils/getErrorMessage';
import { zipDistanceDisplayLabel } from '../utils/normalizeZipDistance';

export default function ZipDistanceDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { data: item, isLoading, isError, error, refetch } = useZipDistance(id);
  const setActive = useSetZipDistanceActive();
  const remove = useDeleteZipDistance();
  const [pending, setPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<ZipDistanceConfirmAction | null>(null);

  if (isLoading) {
    return <p className="text-sm text-[var(--color-neutral-400)]">Loading…</p>;
  }
  if (isError || !item) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-[var(--color-danger-600)]">
          {getErrorMessage(error) || 'Zip distance not found.'}
        </p>
        <button type="button" className="text-sm underline" onClick={() => refetch()}>
          Retry
        </button>
      </div>
    );
  }

  const active = item.is_active !== false;

  const run = async (fn: () => Promise<unknown>) => {
    setActionError(null);
    setPending(true);
    try {
      await fn();
      setConfirm(null);
      if (confirm === 'delete') {
        navigate(ZIP_DISTANCE_ROUTE_PREFIX);
        return;
      }
      refetch();
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      {actionError && (
        <div
          role="alert"
          className="mb-3 rounded-lg border px-3 py-2 text-sm"
          style={{
            background: 'var(--color-danger-100)',
            borderColor: '#FECACA',
            color: 'var(--color-danger-700)',
          }}
        >
          {actionError}
        </div>
      )}
      <DetailPageTemplate
        title={zipDistanceDisplayLabel(item)}
        subtitle={`${item.distance} ${item.unit}`}
        statusLabel={active ? 'Active' : 'Inactive'}
        statusTone={active ? 'emerald' : 'slate'}
        onBack={() => navigate(ZIP_DISTANCE_ROUTE_PREFIX)}
        backLabel="Zip Distance Master"
        actions={[
          {
            label: 'Edit',
            onClick: () => navigate(`${ZIP_DISTANCE_ROUTE_PREFIX}/${id}/edit`),
            variant: 'secondary',
          },
          active
            ? {
                label: 'Deactivate',
                onClick: () => setConfirm('deactivate'),
                variant: 'danger',
              }
            : {
                label: 'Activate',
                onClick: () => setConfirm('activate'),
                variant: 'primary',
              },
          {
            label: 'Delete',
            onClick: () => setConfirm('delete'),
            variant: 'danger',
          },
        ]}
        actionsDisabled={pending}
        tabs={[
          {
            key: 'overview',
            label: 'Overview',
            content: <ZipDistanceOverviewPanel item={item} />,
          },
        ]}
      />

      {confirm && (
        <ZipDistanceConfirmModal
          open
          action={confirm}
          item={item}
          isPending={pending}
          onClose={() => setConfirm(null)}
          onConfirm={() => {
            if (confirm === 'activate')
              return run(() => setActive.mutateAsync({ id, is_active: true }));
            if (confirm === 'deactivate')
              return run(() => setActive.mutateAsync({ id, is_active: false }));
            if (confirm === 'delete') return run(() => remove.mutateAsync(id));
            return undefined;
          }}
        />
      )}
    </>
  );
}
