import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { isUuid } from '@/lib/isUuid';
import { useArOpenItems, useApOpenItems } from '../hooks/useArApAging';
import { getErrorMessage } from '../utils/getErrorMessage';

type OpenItemsKind = 'ar' | 'ap';

interface GlOpenItemsPageProps {
  kind: OpenItemsKind;
}

function formatMoney(value: number | undefined, currency?: string) {
  if (value == null || !Number.isFinite(value)) return '—';
  return `${currency ? `${currency} ` : ''}${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

export function GlOpenItemsPage({ kind }: GlOpenItemsPageProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [partyId, setPartyId] = useState(() => searchParams.get('party_id') ?? '');
  const [companyId, setCompanyId] = useState(() => {
    const fromQuery = searchParams.get('company_id')?.trim() || '';
    if (fromQuery && isUuid(fromQuery)) return fromQuery;
    return user?.companyId?.trim() || '';
  });

  const params = useMemo(
    () => ({
      party_id: partyId.trim(),
      company_id: companyId.trim() && isUuid(companyId.trim()) ? companyId.trim() : undefined,
    }),
    [partyId, companyId],
  );

  const ready = isUuid(params.party_id);
  const ar = useArOpenItems(params, kind === 'ar' && ready);
  const ap = useApOpenItems(params, kind === 'ap' && ready);
  const query = kind === 'ar' ? ar : ap;

  const title = kind === 'ar' ? 'AR open items' : 'AP open items';
  const description =
    kind === 'ar'
      ? 'Customer invoices with amount paid vs balance due (GET /gl/ar/open-items).'
      : 'Vendor purchase invoices with paid vs pending (GET /gl/ap/open-items).';
  const invoicePath = (id: string) =>
    kind === 'ar' ? `/invoices/${id}` : `/purchase-invoices/${id}`;
  const agingPath = kind === 'ar' ? '/gl/ar/aging' : '/gl/ap/aging';
  const statementPath = (id: string) =>
    kind === 'ar' ? `/gl/ar/statement/${id}` : `/gl/ap/statement/${id}`;

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
          <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">{title}</h2>
          <p className="text-sm text-[var(--color-neutral-400)] mt-0.5">{description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={() => navigate(agingPath)}>
            Aging
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => void query.refetch()}
            disabled={query.isFetching || !ready}
          >
            <RefreshCw className={`h-4 w-4 ${query.isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Card className="p-4 space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label="Party ID *"
            placeholder="Customer / vendor UUID"
            value={partyId}
            onChange={(e) => setPartyId(e.target.value)}
            error={
              partyId.trim() && !isUuid(partyId.trim()) ? 'Enter a valid UUID' : undefined
            }
          />
          <Input
            label="Company ID (optional)"
            placeholder="UUID — omit to use tenant default"
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
            error={
              companyId.trim() && !isUuid(companyId.trim())
                ? 'Enter a valid UUID or leave blank'
                : undefined
            }
            hint="Wrong company_id returns an empty list; leave blank if unsure."
          />
        </div>

        {!ready ? (
          <p className="text-sm text-[var(--color-neutral-500)] py-4">
            Enter a party UUID to load open items with paid vs pending balances.
          </p>
        ) : query.isLoading ? (
          <p className="text-sm text-[var(--color-neutral-400)] py-6">Loading open items…</p>
        ) : query.isError ? (
          <p className="text-sm text-[var(--color-danger-600)] py-4 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            {getErrorMessage(query.error)}
          </p>
        ) : !query.data?.items.length ? (
          <p className="text-sm text-[var(--color-neutral-400)] py-6">
            No open items for this party.
          </p>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              {query.data.partyName ? (
                <button
                  type="button"
                  className="font-medium text-[var(--color-primary-700)] hover:underline"
                  onClick={() => navigate(statementPath(params.party_id))}
                >
                  {query.data.partyName} — statement
                </button>
              ) : null}
              <span>
                Paid:{' '}
                <strong className="tabular-nums">
                  {formatMoney(query.data.totalPaid, query.data.currencyCode)}
                </strong>
              </span>
              <span>
                Outstanding:{' '}
                <strong className="tabular-nums">
                  {formatMoney(query.data.totalOutstanding, query.data.currencyCode)}
                </strong>
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-[var(--color-neutral-500)]">
                    <th className="py-2 pr-3">Invoice</th>
                    <th className="py-2 pr-3">Due</th>
                    <th className="py-2 pr-3 text-right">Total</th>
                    <th className="py-2 pr-3 text-right">Paid</th>
                    <th className="py-2 pr-3 text-right">Balance due</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {query.data.items.map((item) => (
                    <tr key={item.id} className="border-b border-[var(--color-neutral-100)]">
                      <td className="py-2 pr-3">
                        <Link
                          to={invoicePath(item.id)}
                          className="font-medium text-[var(--color-primary-700)] hover:underline"
                        >
                          {item.number || item.id}
                        </Link>
                      </td>
                      <td className="py-2 pr-3 text-[var(--color-neutral-600)]">
                        {item.dueDate ? item.dueDate.slice(0, 10) : '—'}
                      </td>
                      <td className="py-2 pr-3 text-right tabular-nums">
                        {formatMoney(item.totalAmount, item.currencyCode)}
                      </td>
                      <td className="py-2 pr-3 text-right tabular-nums">
                        {formatMoney(item.paidAmount, item.currencyCode)}
                      </td>
                      <td className="py-2 pr-3 text-right tabular-nums font-medium">
                        {formatMoney(item.balanceDue, item.currencyCode)}
                      </td>
                      <td className="py-2 text-[var(--color-neutral-600)]">
                        {item.status?.replaceAll('_', ' ') || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

export default function ArOpenItemsPage() {
  return <GlOpenItemsPage kind="ar" />;
}
