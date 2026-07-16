import { useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { isUuid } from '@/lib/isUuid';
import { AR_AP_AGING_API } from '../api/arApAging.api';
import { AgingFilters } from '../components/AgingFilters';
import { StatementTable } from '../components/StatementTable';
import { useApStatement } from '../hooks/useArApAging';
import { getErrorMessage } from '../utils/getErrorMessage';

const AP_AGING_PATH = AR_AP_AGING_API.apAging;

export default function ApStatementPage() {
  const navigate = useNavigate();
  const { partyId = '' } = useParams<{ partyId: string }>();
  const [searchParams] = useSearchParams();
  const [asOf, setAsOf] = useState(searchParams.get('as_of') ?? '');
  const [companyId, setCompanyId] = useState('');

  const partyValid = isUuid(partyId);
  const filtersValid = !companyId.trim() || isUuid(companyId.trim());

  const params = useMemo(
    () => ({
      as_of: asOf.trim() || undefined,
      company_id: companyId.trim() && isUuid(companyId.trim()) ? companyId.trim() : undefined,
    }),
    [asOf, companyId],
  );

  const { data, isLoading, isFetching, isError, error, refetch } = useApStatement(
    partyId,
    params,
    partyValid && filtersValid,
  );

  if (!partyValid) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-[var(--color-danger-600)]">Invalid party id in URL.</p>
        <Button type="button" variant="secondary" onClick={() => navigate(AP_AGING_PATH)}>
          Back to AP Aging
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <button
            type="button"
            className="text-xs font-medium text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)] mb-1"
            onClick={() => navigate(AP_AGING_PATH)}
          >
            ← AP Aging
          </button>
          <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">
            Vendor statement
          </h2>
          <p className="text-sm text-[var(--color-neutral-400)] mt-0.5">
            {data?.party_name || partyId}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AgingFilters
            asOf={asOf}
            onAsOfChange={setAsOf}
            partyId={partyId}
            onPartyIdChange={() => {}}
            companyId={companyId}
            onCompanyIdChange={setCompanyId}
          />
        </div>

        {!filtersValid ? (
          <p className="text-sm text-[var(--color-danger-600)] py-6">Invalid company UUID.</p>
        ) : isError ? (
          <div className="space-y-3 py-8">
            <p className="flex items-start gap-2 text-sm text-[var(--color-danger-600)]">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              {getErrorMessage(error) || 'Failed to load vendor statement.'}
            </p>
            <Button type="button" variant="secondary" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : isLoading ? (
          <p className="text-sm text-[var(--color-neutral-400)] py-10 text-center">Loading…</p>
        ) : (
          <>
            <div className="flex flex-wrap gap-4 text-sm text-[var(--color-neutral-600)]">
              {data?.as_of ? <span>As of {data.as_of}</span> : null}
              {data?.opening_balance != null ? (
                <span>
                  Opening: {data.currency_code || ''}{' '}
                  {data.opening_balance.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              ) : null}
              {data?.closing_balance != null ? (
                <span className="font-medium">
                  Closing: {data.currency_code || ''}{' '}
                  {data.closing_balance.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              ) : null}
            </div>
            <div className="overflow-x-auto">
              <StatementTable lines={data?.lines ?? []} currencyCode={data?.currency_code} />
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
