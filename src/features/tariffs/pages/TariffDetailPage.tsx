import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DetailPageTemplate } from '@/components/templates/DetailPageTemplate';
import { TARIFF_ROUTE_PREFIX } from '../api/tariff.api';
import {
  TariffConfirmModal,
  type TariffConfirmAction,
} from '../components/TariffConfirmModal';
import { TariffOverviewPanel } from '../components/TariffOverviewPanel';
import { TARIFF_SERVICE_TYPE_LABELS } from '../constants/tariff.constants';
import {
  useDeleteTariff,
  useDuplicateTariff,
  useSetTariffActive,
  useTariff,
} from '../hooks/useTariffs';
import { getErrorMessage } from '../utils/getErrorMessage';
import { tariffDisplayLabel } from '../utils/normalizeTariff';

export default function TariffDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { data: tariff, isLoading, isError, error, refetch } = useTariff(id);
  const setActive = useSetTariffActive();
  const remove = useDeleteTariff();
  const duplicate = useDuplicateTariff();
  const [pending, setPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<TariffConfirmAction | null>(null);

  if (isLoading) {
    return <p className="text-sm text-[var(--color-neutral-400)]">Loading…</p>;
  }
  if (isError || !tariff) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-[var(--color-danger-600)]">
          {getErrorMessage(error) || 'Tariff not found.'}
        </p>
        <button type="button" className="text-sm underline" onClick={() => refetch()}>
          Retry
        </button>
      </div>
    );
  }

  const active = tariff.is_active !== false;

  const run = async (fn: () => Promise<unknown>) => {
    setActionError(null);
    setPending(true);
    try {
      const result = await fn();
      setConfirm(null);
      if (result && typeof result === 'object' && 'id' in result) {
        const created = result as { id: string };
        if (created.id !== id) {
          navigate(`${TARIFF_ROUTE_PREFIX}/${created.id}`);
          return;
        }
      }
      if (confirm === 'delete') {
        navigate(TARIFF_ROUTE_PREFIX);
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
        title={tariffDisplayLabel(tariff)}
        subtitle={
          TARIFF_SERVICE_TYPE_LABELS[tariff.service_type] ?? tariff.service_type
        }
        statusLabel={active ? 'Active' : 'Inactive'}
        statusTone={active ? 'emerald' : 'slate'}
        onBack={() => navigate(TARIFF_ROUTE_PREFIX)}
        backLabel="Online Tariff Master"
        actions={[
          {
            label: 'Edit',
            onClick: () => navigate(`${TARIFF_ROUTE_PREFIX}/${id}/edit`),
            variant: 'secondary',
          },
          {
            label: 'Duplicate',
            onClick: () => setConfirm('duplicate'),
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
            content: <TariffOverviewPanel tariff={tariff} />,
          },
        ]}
      />

      {confirm && (
        <TariffConfirmModal
          open
          action={confirm}
          tariff={tariff}
          isPending={pending}
          onClose={() => setConfirm(null)}
          onConfirm={() => {
            if (confirm === 'activate')
              return run(() => setActive.mutateAsync({ id, is_active: true }));
            if (confirm === 'deactivate')
              return run(() => setActive.mutateAsync({ id, is_active: false }));
            if (confirm === 'delete') return run(() => remove.mutateAsync(id));
            if (confirm === 'duplicate') return run(() => duplicate.mutateAsync(id));
            return undefined;
          }}
        />
      )}
    </>
  );
}
