import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { isUuid } from '@/lib/isUuid';
import { AR_AP_AGING_ROUTE_PREFIX } from '../api/arApAging.api';
import { AgingFilters } from '../components/AgingFilters';
import { AgingTable } from '../components/AgingTable';
import { useArAging } from '../hooks/useArApAging';
import { getErrorMessage } from '../utils/getErrorMessage';

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export default function ArAgingPage() {
  const navigate = useNavigate();
  const [asOf, setAsOf] = useState(todayIsoDate);
  const [partyId, setPartyId] = useState('');
  const [companyId, setCompanyId] = useState('');

  const filtersValid =
    (!partyId.trim() || isUuid(partyId.trim())) &&
    (!companyId.trim() || isUuid(companyId.trim()));

  const params = useMemo(
    () => ({
      as_of: asOf.trim() || undefined,
      party_id: partyId.trim() && isUuid(partyId.trim()) ? partyId.trim() : undefined,
      company_id: companyId.trim() && isUuid(companyId.trim()) ? companyId.trim() : undefined,
    }),
    [asOf, partyId, companyId],
  );

  const { data, isLoading, isFetching, isError, error, refetch } = useArAging(
    params,
    filtersValid,
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <button
            type="button"
            className="text-xs font-medium text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)] mb-1"
            onClick={() => navigate('/accounts')}
          >
            ← Accounts
          </button>
          <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">AR Aging</h2>
          <p className="text-sm text-[var(--color-neutral-400)] mt-0.5">
            Customer receivables by aging bucket (GET /gl/ar/aging).
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() => refetch()}
          disabled={isFetching || !filtersValid}
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Card className="p-4 space-y-4">
        <AgingFilters
          asOf={asOf}
          onAsOfChange={setAsOf}
          partyId={partyId}
          onPartyIdChange={setPartyId}
          companyId={companyId}
          onCompanyIdChange={setCompanyId}
        />

        {!filtersValid ? (
          <p className="text-sm text-[var(--color-danger-600)] py-6">
            Fix invalid UUID filters before loading the report.
          </p>
        ) : isError ? (
          <div className="space-y-3 py-8">
            <p className="flex items-start gap-2 text-sm text-[var(--color-danger-600)]">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              {getErrorMessage(error) || 'Failed to load AR aging.'}
            </p>
            <Button type="button" variant="secondary" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : isLoading ? (
          <p className="text-sm text-[var(--color-neutral-400)] py-10 text-center">Loading…</p>
        ) : (
          <>
            {data?.as_of ? (
              <p className="text-xs text-[var(--color-neutral-400)]">As of {data.as_of}</p>
            ) : null}
            <div className="overflow-x-auto">
              <AgingTable
                lines={data?.lines ?? []}
                totals={data?.totals}
                onOpenStatement={(line) => {
                  if (!line.party_id) return;
                  const qs = asOf.trim() ? `?as_of=${encodeURIComponent(asOf.trim())}` : '';
                  navigate(`${AR_AP_AGING_ROUTE_PREFIX}/statement/${line.party_id}${qs}`);
                }}
              />
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
