import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  useQuotationAnalytics,
  useQuotationChargewiseReport,
  useQuotationConversion,
  useQuotationLostReasons,
  useQuotationResponseTime,
} from '../hooks/useQuotationReports';
import { getErrorMessage } from '../utils/getErrorMessage';

type ReportTab =
  | 'chargewise'
  | 'analytics'
  | 'conversion'
  | 'lost-reasons'
  | 'response-time';

const TABS: { key: ReportTab; label: string }[] = [
  { key: 'chargewise', label: 'Chargewise' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'conversion', label: 'Conversion' },
  { key: 'lost-reasons', label: 'Lost reasons' },
  { key: 'response-time', label: 'Response time' },
];

function JsonBlock({ data, error }: { data: unknown; error?: unknown }) {
  if (error) {
    return (
      <p className="text-sm text-[var(--color-danger-600)]">{getErrorMessage(error)}</p>
    );
  }
  if (data == null) {
    return <p className="text-sm text-[var(--color-neutral-400)]">No data.</p>;
  }
  return (
    <pre className="overflow-auto rounded-md border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] p-3 text-xs text-[var(--color-neutral-700)] max-h-[480px]">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

export default function QuotationReportsPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<ReportTab>('chargewise');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const filters = {
    from_date: fromDate || undefined,
    to_date: toDate || undefined,
  };

  const chargewise = useQuotationChargewiseReport(
    { ...filters, page: 1, limit: 50, order: 'desc' },
    tab === 'chargewise',
  );
  const analytics = useQuotationAnalytics(filters, tab === 'analytics');
  const conversion = useQuotationConversion(filters, tab === 'conversion');
  const lostReasons = useQuotationLostReasons(filters, tab === 'lost-reasons');
  const responseTime = useQuotationResponseTime(filters, tab === 'response-time');

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <button
            type="button"
            className="text-xs font-medium text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)] mb-1"
            onClick={() => navigate('/quotations')}
          >
            ← Quotations
          </button>
          <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">
            Quotation reports
          </h2>
          <p className="text-sm text-[var(--color-neutral-400)] mt-0.5">
            Chargewise listing and analytics endpoints.
          </p>
        </div>
      </div>

      <Card className="p-4 space-y-4">
        <div className="flex flex-wrap gap-3 items-end">
          <label className="space-y-1">
            <span className="text-xs text-[var(--color-neutral-500)]">From</span>
            <input
              type="date"
              className="h-9 block rounded-md border border-[var(--color-neutral-200)] px-3 text-sm"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs text-[var(--color-neutral-500)]">To</span>
            <input
              type="date"
              className="h-9 block rounded-md border border-[var(--color-neutral-200)] px-3 text-sm"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </label>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              chargewise.refetch();
              analytics.refetch();
              conversion.refetch();
              lostReasons.refetch();
              responseTime.refetch();
            }}
          >
            Refresh
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-[var(--color-neutral-200)] pb-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`px-3 py-1.5 text-sm rounded-md ${
                tab === t.key
                  ? 'bg-[var(--color-primary-100)] text-[var(--color-primary-700)] font-medium'
                  : 'text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-50)]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'chargewise' && (
          <div className="space-y-2">
            <CardHeader className="px-0 pt-0">
              <CardTitle>Chargewise report</CardTitle>
            </CardHeader>
            {chargewise.isLoading ? (
              <p className="text-sm text-[var(--color-neutral-400)]">Loading…</p>
            ) : (
              <JsonBlock
                data={{
                  meta: chargewise.data?.meta,
                  items: chargewise.data?.items,
                }}
                error={chargewise.error}
              />
            )}
          </div>
        )}
        {tab === 'analytics' && (
          <JsonBlock
            data={analytics.isLoading ? 'Loading…' : analytics.data}
            error={analytics.error}
          />
        )}
        {tab === 'conversion' && (
          <JsonBlock
            data={conversion.isLoading ? 'Loading…' : conversion.data}
            error={conversion.error}
          />
        )}
        {tab === 'lost-reasons' && (
          <JsonBlock
            data={lostReasons.isLoading ? 'Loading…' : lostReasons.data}
            error={lostReasons.error}
          />
        )}
        {tab === 'response-time' && (
          <JsonBlock
            data={responseTime.isLoading ? 'Loading…' : responseTime.data}
            error={responseTime.error}
          />
        )}
      </Card>
    </div>
  );
}
