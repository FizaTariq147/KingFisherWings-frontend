import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { CHEQUE_ROUTE_PREFIX } from '../api/cheque.api';
import { ChequeTable } from '../components/ChequeTable';
import { DEFAULT_CHEQUE_PAGE_SIZE, DEFAULT_PDC_WITHIN_DAYS } from '../constants/cheque.constants';
import { usePdcDueReport } from '../hooks/useGlCheques';
import { getErrorMessage } from '../utils/getErrorMessage';

export default function PdcDueReportPage() {
  const navigate = useNavigate();
  const [withinDays, setWithinDays] = useState(DEFAULT_PDC_WITHIN_DAYS);
  const [page, setPage] = useState(1);

  const params = {
    within_days: Number.isFinite(withinDays) && withinDays > 0 ? withinDays : undefined,
  };

  const { data, isLoading, isFetching, isError, error, refetch } = usePdcDueReport(params);
  const all = data?.cheques ?? [];
  const pageSize = DEFAULT_CHEQUE_PAGE_SIZE;
  const total = all.length;
  const paged = all.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <button
            type="button"
            className="text-xs font-medium text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)] mb-1"
            onClick={() => navigate(CHEQUE_ROUTE_PREFIX)}
          >
            ← Cheques
          </button>
          <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">PDC due report</h2>
          <p className="text-sm text-[var(--color-neutral-400)] mt-0.5">
            Post-dated cheques due within N days (GET /gl/cheques/reports/pdc-due).
          </p>
        </div>
        <Button type="button" variant="secondary" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Card className="p-4 space-y-4">
        <div className="max-w-xs">
          <Input
            label="Within days"
            type="number"
            min={1}
            value={withinDays}
            onChange={(e) => {
              setPage(1);
              setWithinDays(Number(e.target.value) || DEFAULT_PDC_WITHIN_DAYS);
            }}
          />
        </div>

        {isError ? (
          <div className="space-y-3 py-8">
            <p className="flex items-start gap-2 text-sm text-[var(--color-danger-600)]">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              {getErrorMessage(error) || 'Failed to load PDC due report.'}
            </p>
            <Button type="button" variant="secondary" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : isLoading ? (
          <p className="text-sm text-[var(--color-neutral-400)] py-10 text-center">Loading…</p>
        ) : (
          <ChequeTable
            cheques={paged}
            isFetching={isFetching}
            page={page}
            pageSize={pageSize}
            total={total}
            sortKey="due_date"
            sortDir="asc"
            onSort={() => {}}
            onPage={setPage}
            onView={(c) => navigate(`${CHEQUE_ROUTE_PREFIX}/${c.id}`)}
          />
        )}
      </Card>
    </div>
  );
}
