import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PaymentProofOpenButton } from '@/features/payment-proofs/components/PaymentProofOpenButton';
import { PartyOnlinePaymentHistoryPanel } from '@/features/online-payments/components/PartyOnlinePaymentHistoryPanel';
import { usePartyPayments } from '../../hooks/useParties';
import type { PartyPaymentRow } from '../../types/partyPayments.types';

interface PartyPaymentsPanelProps {
  partyId: string;
  partyType: string;
}

function directionVariant(
  direction?: string,
): 'success' | 'info' | 'neutral' | 'warning' {
  const d = (direction || '').toUpperCase();
  if (d === 'RECEIPT' || d.includes('RECEIPT')) return 'success';
  if (d === 'PAYMENT' || d.includes('PAYMENT')) return 'info';
  return 'neutral';
}

function PaymentRow({ row }: { row: PartyPaymentRow }) {
  const proof =
    row.proof_id || row.proof_url
      ? {
          id: row.proof_id || row.id,
          fileUrl: row.proof_url,
          fileName: 'payment-proof',
          reference: row.reference,
        }
      : null;

  return (
    <Card className="p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={directionVariant(row.direction)}>
              {row.direction || 'Payment'}
            </Badge>
            <span className="text-sm font-medium text-[var(--color-neutral-800)]">
              {row.amount != null
                ? `${row.currency_code || ''} ${row.amount.toLocaleString()}`.trim()
                : '—'}
            </span>
            {row.payment_date ? (
              <span className="text-xs text-[var(--color-neutral-500)]">{row.payment_date}</span>
            ) : null}
          </div>
          <p className="text-xs text-[var(--color-neutral-500)]">
            {row.reference ? `Ref ${row.reference}` : row.id}
            {row.invoice_id ? (
              <>
                {' · '}
                <Link
                  to={`/invoices/${row.invoice_id}`}
                  className="text-[var(--color-primary-600)] hover:underline"
                >
                  {row.invoice_number || `Invoice ${row.invoice_id.slice(0, 8)}`}
                </Link>
              </>
            ) : row.invoice_number ? (
              ` · ${row.invoice_number}`
            ) : null}
          </p>
          {row.notes ? (
            <p className="text-xs text-[var(--color-neutral-500)]">{row.notes}</p>
          ) : null}
        </div>
        {proof ? (
          <PaymentProofOpenButton proof={proof} viewer="staff" showDownload />
        ) : null}
      </div>
    </Card>
  );
}

/**
 * Party Payments tab — GET /parties/:id/payments (GL RECEIPT + PAYMENT),
 * with Stripe/online history kept below for continuity.
 */
export function PartyPaymentsPanel({ partyId, partyType }: PartyPaymentsPanelProps) {
  const { data = [], isLoading, isError, error, refetch } = usePartyPayments(partyId);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-[var(--color-neutral-500)]">
            Posted receipts and payments for this party (GET /parties/:id/payments).
          </p>
          <Button type="button" size="sm" variant="secondary" onClick={() => void refetch()}>
            Refresh
          </Button>
        </div>
        {isLoading ? (
          <p className="text-sm text-[var(--color-neutral-500)]">Loading payments…</p>
        ) : null}
        {isError ? (
          <p className="text-sm text-[var(--color-danger-600)]">
            {error instanceof Error ? error.message : 'Failed to load party payments.'}
          </p>
        ) : null}
        {!isLoading && !isError && data.length === 0 ? (
          <Card className="p-4 text-sm text-[var(--color-neutral-500)]">
            No posted receipts or payments for this party yet.
          </Card>
        ) : null}
        <div className="space-y-2">
          {data.map((row) => (
            <PaymentRow key={row.id} row={row} />
          ))}
        </div>
      </div>

      <div className="space-y-2 border-t border-[var(--color-neutral-100)] pt-4">
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-neutral-400)]">
          Online checkout history
        </p>
        <PartyOnlinePaymentHistoryPanel partyId={partyId} partyType={partyType} />
      </div>
    </div>
  );
}
