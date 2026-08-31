import { Link, useNavigate } from 'react-router-dom';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { useInvoices } from '@/features/invoices/hooks/useInvoices';
import { invoiceDisplayNumber } from '@/features/invoices/utils/normalizeInvoice';

const WIDGET_LIMIT = 8;

function formatInvoiceDate(value?: string): string {
  if (!value?.trim()) return '—';
  const raw = value.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
  return raw;
}

function formatAmount(amount?: number, currency?: string): string {
  if (amount == null || Number.isNaN(amount)) return '—';
  const formatted = amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return currency ? `${formatted} ${currency}` : formatted;
}

/** Dashboard card: latest invoices from GET /invoices. */
export function RecentInvoicesWidget() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useInvoices({
    page: 1,
    limit: WIDGET_LIMIT,
  });

  const invoices = data?.invoices ?? [];

  return (
    <DashboardCard
      title="Recent Created Invoices"
      accent="primaryTint"
      isLoading={isLoading}
      isEmpty={!isLoading && (isError || invoices.length === 0)}
      emptyMessage={
        isError ? 'Unable to load invoices.' : 'No invoices created recently.'
      }
      onExpand={() => navigate('/invoices')}
      onAdd={() => navigate('/invoices/new')}
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Voucher No.</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((inv) => (
            <TableRow key={inv.id}>
              <TableCell className="text-[var(--color-primary)]">
                <Link
                  to={`/invoices/${inv.id}`}
                  className="hover:underline focus:outline-none focus:underline"
                >
                  {invoiceDisplayNumber(inv)}
                </Link>
              </TableCell>
              <TableCell className="max-w-[220px] truncate">
                <div title={inv.party_name || undefined}>{inv.party_name || '—'}</div>
              </TableCell>
              <TableCell>{formatInvoiceDate(inv.invoice_date || inv.created_at)}</TableCell>
              <TableCell className="text-right">
                {formatAmount(inv.total_amount, inv.currency_code)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </DashboardCard>
  );
}

export default RecentInvoicesWidget;
