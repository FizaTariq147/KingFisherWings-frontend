import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Download, RefreshCw, Upload } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useTenantCompanies } from '@/features/users/hooks/useTenantCompanies';
import { PartyConfirmModal } from '../components/PartyConfirmModal';
import { PartyFilters } from '../components/PartyFilters';
import { PartyTable } from '../components/PartyTable';
import {
  DEFAULT_PARTY_PAGE_SIZE,
  type CreditStatus,
  type PartyType,
} from '../constants/party.constants';
import { usePartyConfirmState } from '../hooks/usePartyConfirmState';
import {
  useDeleteParty,
  useExportPartiesCsv,
  useImportParties,
  useParties,
  useSetPartyActive,
  useUpdatePartyCreditStatus,
} from '../hooks/useParties';
import type { Party } from '../types/party.types';
import { getErrorMessage } from '../utils/getErrorMessage';

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

export default function PartyListPage() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');
  const [partyType, setPartyType] = useState<PartyType | 'all'>('all');
  const [creditStatus, setCreditStatus] = useState<CreditStatus | 'all'>('all');
  const [companyId, setCompanyId] = useState('');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const { confirm, requestConfirm, closeConfirm } = usePartyConfirmState();

  const debouncedSearch = useDebouncedValue(search, 300);
  const { data: companies = [] } = useTenantCompanies(true);
  const deleteParty = useDeleteParty();
  const setActive = useSetPartyActive();
  const updateCredit = useUpdatePartyCreditStatus();
  const importParties = useImportParties();
  const exportParties = useExportPartiesCsv();

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, partyType, creditStatus, companyId, order]);

  const listParams = {
    page,
    limit: DEFAULT_PARTY_PAGE_SIZE,
    search: debouncedSearch.trim() || undefined,
    party_type: partyType === 'all' ? undefined : partyType,
    credit_status: creditStatus === 'all' ? undefined : creditStatus,
    company_id: companyId || undefined,
    order,
  };

  const { data, isLoading, isFetching, isError, error, refetch } = useParties(listParams);
  const parties = data?.parties ?? [];
  const meta = data?.meta;

  const runAction = async (party: Party, action: () => Promise<unknown>) => {
    setActionError(null);
    setPendingActionId(party.id);
    try {
      await action();
      closeConfirm();
    } catch (err) {
      setActionError(getErrorMessage(err) || 'Action failed.');
    } finally {
      setPendingActionId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">Parties</h2>
          <p className="text-sm text-[var(--color-neutral-400)] mt-0.5">
            Any party can have Users Portal and Vendor Portal logins from the party detail page.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={exportParties.isPending}
            onClick={() => {
              setActionError(null);
              void exportParties.mutateAsync(listParams).catch((err) => {
                setActionError(getErrorMessage(err) || 'Export failed.');
              });
            }}
          >
            <Download className="h-4 w-4" />
            {exportParties.isPending ? 'Exporting…' : 'Export CSV'}
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = '';
              if (!file) return;
              setImportMessage(null);
              setImportErrors([]);
              setActionError(null);
              try {
                const result = await importParties.mutateAsync(file);
                setImportMessage(
                  `Import finished: ${result.imported} imported, ${result.failed} failed of ${result.total}.`,
                );
                setImportErrors(
                  result.errors.slice(0, 10).map((err) =>
                    `Row ${err.row}${err.code ? ` (${err.code})` : ''}: ${err.message}`,
                  ),
                );
                await refetch();
              } catch (err) {
                setActionError(getErrorMessage(err));
              }
            }}
          />
          <Button
            type="button"
            variant="secondary"
            onClick={() => fileRef.current?.click()}
            disabled={importParties.isPending}
          >
            <Upload className="h-4 w-4" />
            Import CSV
          </Button>
          <Button type="button" onClick={() => navigate('/parties/new')}>
            Add party
          </Button>
        </div>
      </div>

      <PartyFilters
        search={search}
        onSearchChange={setSearch}
        partyType={partyType}
        onPartyTypeChange={setPartyType}
        creditStatus={creditStatus}
        onCreditStatusChange={setCreditStatus}
        companyId={companyId}
        onCompanyIdChange={setCompanyId}
        companies={companies}
        order={order}
        onOrderChange={setOrder}
      />

      {importMessage && (
        <div className="rounded-lg border border-[var(--color-success-200)] bg-[var(--color-success-50)] px-4 py-3 text-sm text-[var(--color-success-700)] space-y-1">
          <p>{importMessage}</p>
          {importErrors.length > 0 ? (
            <ul className="list-disc pl-5 text-[var(--color-warning-700)]">
              {importErrors.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          ) : null}
        </div>
      )}

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

      {isError ? (
        <Card className="p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-2 text-sm text-[var(--color-danger-700)]">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error instanceof Error ? error.message : 'Failed to load parties.'}</span>
            </div>
            <Button variant="secondary" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" /> Retry
            </Button>
          </div>
        </Card>
      ) : isLoading ? (
        <Card className="p-8 text-sm text-[var(--color-neutral-400)]">Loading parties…</Card>
      ) : (
        <PartyTable
          parties={parties}
          isFetching={isFetching}
          meta={meta}
          onPage={setPage}
          pendingActionId={pendingActionId}
          onView={(p) => navigate(`/parties/${p.id}`)}
          onEdit={(p) => navigate(`/parties/${p.id}/edit`)}
          onActivate={(p) => requestConfirm('activate', p)}
          onDeactivate={(p) => requestConfirm('deactivate', p)}
          onCreditStatus={(p) => requestConfirm('credit_status', p)}
          onDelete={(p) => requestConfirm('delete', p)}
        />
      )}

      {confirm && (
        <PartyConfirmModal
          open
          action={confirm.action}
          partyName={confirm.party.name}
          isPending={pendingActionId === confirm.party.id}
          onClose={closeConfirm}
          onConfirm={(extra) => {
            const party = confirm.party;
            if (confirm.action === 'delete') {
              void runAction(party, () => deleteParty.mutateAsync(party.id));
            } else if (confirm.action === 'activate') {
              void runAction(party, () =>
                setActive.mutateAsync({ id: party.id, is_active: true }),
              );
            } else if (confirm.action === 'deactivate') {
              void runAction(party, () =>
                setActive.mutateAsync({ id: party.id, is_active: false }),
              );
            } else if (confirm.action === 'credit_status' && extra?.credit_status) {
              void runAction(party, () =>
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
