import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DetailPageTemplate } from '@/components/templates/DetailPageTemplate';
import { isUuid } from '@/lib/isUuid';
import { PartyAddressesSection } from '../components/PartyAddressesSection';
import { PartyConfirmModal } from '../components/PartyConfirmModal';
import { PartyContactsSection } from '../components/PartyContactsSection';
import { PartyCreditBadge } from '../components/PartyCreditBadge';
import { PartyHistorySection } from '../components/PartyHistorySection';
import { PartyOverviewPanel } from '../components/PartyOverviewPanel';
import { PartyStatusBadge } from '../components/PartyStatusBadge';
import { PartyPortalPermissionsSection } from '../components/PartyPortalPermissionsSection';
import { PartyPortalUsersSection } from '../components/PartyPortalUsersSection';
import { PartyVendorPermissionsSection } from '../components/PartyVendorPermissionsSection';
import { PartyVendorUsersSection } from '../components/PartyVendorUsersSection';
import { PARTY_TYPE_LABELS } from '../constants/party.constants';
import { usePartyConfirmState } from '../hooks/usePartyConfirmState';
import {
  useDeleteParty,
  useParty,
  useSetPartyActive,
  useUpdatePartyCreditStatus,
} from '../hooks/useParties';
import { getErrorMessage } from '../utils/getErrorMessage';

export default function PartyDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { data: party, isLoading, isError, error, refetch } = useParty(id);
  const deleteParty = useDeleteParty();
  const setActive = useSetPartyActive();
  const updateCredit = useUpdatePartyCreditStatus();
  const { confirm, requestConfirm, closeConfirm } = usePartyConfirmState();
  const [actionError, setActionError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (!isUuid(id)) {
    return <Card className="p-6 text-sm text-[var(--color-danger-700)]">Invalid party id.</Card>;
  }

  if (isLoading) {
    return <Card className="p-8 text-sm text-[var(--color-neutral-400)]">Loading…</Card>;
  }

  if (isError || !party) {
    return (
      <div className="space-y-3">
        <div className="flex items-start gap-2 text-sm text-[var(--color-danger-700)]">
          <AlertCircle className="h-4 w-4 mt-0.5" />
          <span>{error instanceof Error ? error.message : 'Failed to load party.'}</span>
        </div>
        <Button variant="secondary" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4" /> Retry
        </Button>
      </div>
    );
  }

  const runAction = async (action: () => Promise<unknown>) => {
    setActionError(null);
    setPending(true);
    try {
      await action();
      closeConfirm();
      await refetch();
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setPending(false);
    }
  };

  const active = party.is_active !== false;

  return (
    <div className="space-y-4">
      {actionError && (
        <div
          role="alert"
          className="rounded-lg border px-4 py-3 text-sm"
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
        title={party.name}
        subtitle={`${party.code} · ${PARTY_TYPE_LABELS[party.party_type]}`}
        statusLabel={active ? 'Active' : 'Inactive'}
        statusTone={active ? 'emerald' : 'slate'}
        onBack={() => navigate('/parties')}
        backLabel="Back to parties"
        actions={[
          { label: 'Edit', onClick: () => navigate(`/parties/${id}/edit`), variant: 'secondary' },
          {
            label: active ? 'Deactivate' : 'Activate',
            onClick: () => requestConfirm(active ? 'deactivate' : 'activate', party),
            variant: 'secondary',
          },
          {
            label: 'Credit status',
            onClick: () => requestConfirm('credit_status', party),
            variant: 'secondary',
          },
          {
            label: 'Delete',
            onClick: () => requestConfirm('delete', party),
            variant: 'danger',
          },
        ]}
        actionsDisabled={pending}
        sidebar={
          <Card className="p-4 space-y-3">
            <div className="text-xs text-[var(--color-neutral-400)]">Status</div>
            <PartyStatusBadge party={party} />
            <div className="text-xs text-[var(--color-neutral-400)] pt-2">Credit</div>
            <PartyCreditBadge status={party.credit_status} />
            <div className="text-xs font-mono text-[var(--color-neutral-400)] pt-2 break-all">
              {party.id}
            </div>
          </Card>
        }
        tabs={[
          {
            key: 'overview',
            label: 'Overview',
            content: <PartyOverviewPanel party={party} />,
          },
          {
            key: 'contacts',
            label: `Contacts (${party.contacts?.length ?? 0})`,
            content: (
              <PartyContactsSection partyId={party.id} contacts={party.contacts ?? []} />
            ),
          },
          {
            key: 'addresses',
            label: `Addresses (${party.addresses?.length ?? 0})`,
            content: (
              <PartyAddressesSection partyId={party.id} addresses={party.addresses ?? []} />
            ),
          },
          {
            key: 'portal-users',
            label: 'Users Portal',
            content: <PartyPortalUsersSection partyId={party.id} />,
          },
          {
            key: 'portal-permissions',
            label: 'Portal rights',
            content: <PartyPortalPermissionsSection partyId={party.id} />,
          },
          {
            key: 'vendor-users',
            label: 'Vendor Portal',
            content: <PartyVendorUsersSection partyId={party.id} />,
          },
          {
            key: 'vendor-permissions',
            label: 'Vendor rights',
            content: <PartyVendorPermissionsSection partyId={party.id} />,
          },
          {
            key: 'history',
            label: 'History',
            content: <PartyHistorySection partyId={party.id} />,
          },
        ]}
      />

      {confirm && (
        <PartyConfirmModal
          open
          action={confirm.action}
          partyName={confirm.party.name}
          isPending={pending}
          onClose={closeConfirm}
          onConfirm={(extra) => {
            if (confirm.action === 'delete') {
              void runAction(async () => {
                await deleteParty.mutateAsync(party.id);
                navigate('/parties');
              });
            } else if (confirm.action === 'activate') {
              void runAction(() => setActive.mutateAsync({ id: party.id, is_active: true }));
            } else if (confirm.action === 'deactivate') {
              void runAction(() => setActive.mutateAsync({ id: party.id, is_active: false }));
            } else if (confirm.action === 'credit_status' && extra?.credit_status) {
              void runAction(() =>
                updateCredit.mutateAsync({
                  id: party.id,
                  dto: { credit_status: extra.credit_status!, reason: extra.reason },
                }),
              );
            }
          }}
        />
      )}
    </div>
  );
}
