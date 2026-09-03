import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import {
  usePartyTransactionSummary,
  useSendPartyTransactionSummary,
} from '../../hooks/usePartyTransactionSummary';
import type { Party } from '../../types/party.types';
import type { PartyTransactionBucket } from '../../types/partyTransactionSummary.types';
import { getErrorMessage } from '../../utils/getErrorMessage';

interface PartyTransactionSummarySectionProps {
  party: Party;
  compact?: boolean;
}

function formatMoney(value: number | undefined, currency?: string): string {
  if (value == null || Number.isNaN(value)) return '—';
  const amount = value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return currency ? `${currency} ${amount}` : amount;
}

function defaultEmails(party: Party): string {
  const fromParty = party.email?.trim() ? [party.email.trim()] : [];
  const fromContacts = (party.contacts ?? [])
    .map((contact) => contact.email?.trim())
    .filter((email): email is string => Boolean(email));
  return [...new Set([...fromParty, ...fromContacts])].join('\n');
}

function parseEmails(value: string): string[] {
  return [...new Set(value.split(/[\n,;]/).map((item) => item.trim()).filter(Boolean))];
}

function BucketCard({
  title,
  bucket,
  currency,
}: {
  title: string;
  bucket: PartyTransactionBucket;
  currency?: string;
}) {
  return (
    <Card className="p-4 space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <h4 className="text-sm font-semibold text-[var(--color-neutral-800)]">{title}</h4>
        <span className="text-xs text-[var(--color-neutral-400)]">{bucket.count} total</span>
      </div>
      <p className="text-lg font-semibold text-[var(--color-neutral-900)]">
        {formatMoney(bucket.amount, currency)}
      </p>
      {bucket.items.length > 0 && (
        <ul className="divide-y divide-[var(--color-neutral-100)]">
          {bucket.items.slice(0, 5).map((item, index) => (
            <li key={item.id || `${item.reference}-${index}`} className="py-1.5 text-xs">
              <div className="flex justify-between gap-2">
                <span className="text-[var(--color-neutral-700)] truncate">
                  {item.reference || item.id || '—'}
                </span>
                <span className="text-[var(--color-neutral-500)] whitespace-nowrap">
                  {formatMoney(item.amount, currency)}
                </span>
              </div>
              <p className="text-[var(--color-neutral-400)]">
                {[item.status, item.date].filter(Boolean).join(' · ')}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export function PartyTransactionSummarySection({
  party,
  compact = false,
}: PartyTransactionSummarySectionProps) {
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch, isFetching } = usePartyTransactionSummary(
    party.id,
  );
  const sendSummary = useSendPartyTransactionSummary(party.id);
  const [emailsText, setEmailsText] = useState(() => defaultEmails(party));
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  const currency = data?.currency_code || party.currency_code;

  const buckets = useMemo(
    () =>
      data
        ? [
            { title: 'Quotes', bucket: data.quotes },
            { title: 'Jobs', bucket: data.jobs },
            { title: 'Invoices', bucket: data.invoices },
            { title: 'Payments', bucket: data.payments },
          ]
        : [],
    [data],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-[var(--color-neutral-500)]">
          Quotes, jobs, invoices, payments, and open balance for this customer.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => navigate(`/gl/ar/statement/${party.id}`)}
          >
            AR statement
          </Button>
          {!compact && (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => navigate(`/parties/${party.id}/transaction-summary`)}
            >
              Open full page
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => void refetch()}
            disabled={isFetching}
          >
            {isFetching ? 'Refreshing…' : 'Refresh'}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-[var(--color-neutral-400)]">Loading transaction summary…</p>
      ) : isError ? (
        <div className="space-y-2">
          <p className="text-sm text-[var(--color-danger-600)]">
            {getErrorMessage(error) || 'Failed to load transaction summary.'}
          </p>
          <Button type="button" size="sm" variant="secondary" onClick={() => void refetch()}>
            Retry
          </Button>
        </div>
      ) : data && !data.available ? (
        <Card className="p-4">
          <p className="text-sm text-[var(--color-neutral-500)]">
            Transaction summary is not available yet (GET /parties/:id/transaction-summary). The
            existing customer statement at /gl/ar/statement/{party.id} still works.
          </p>
        </Card>
      ) : data ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {buckets.map((entry) => (
              <BucketCard
                key={entry.title}
                title={entry.title}
                bucket={entry.bucket}
                currency={currency}
              />
            ))}
          </div>
          <Card className="p-4">
            <p className="text-xs text-[var(--color-neutral-400)]">Open balance</p>
            <p className="text-xl font-semibold text-[var(--color-neutral-900)]">
              {formatMoney(data.open_balance, currency)}
            </p>
          </Card>
        </>
      ) : null}

      <Card>
        <CardHeader className="mb-0 pb-3">
          <CardTitle>Send summary</CardTitle>
        </CardHeader>
        <div className="p-4 pt-0 space-y-3">
          <p className="text-xs text-[var(--color-neutral-400)]">
            POST /parties/:id/transaction-summary/send — emails optional (defaults can come from the
            party record).
          </p>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-[var(--color-neutral-600)]">Emails</span>
            <textarea
              rows={3}
              className="w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 py-2 text-sm"
              value={emailsText}
              onChange={(e) => setEmailsText(e.target.value)}
              placeholder="one per line"
            />
          </label>
          <Input
            label="Message (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          {status && (
            <p className="text-sm text-[var(--color-neutral-600)]" role="status">
              {status}
            </p>
          )}
          <Button
            type="button"
            size="sm"
            disabled={sendSummary.isPending}
            onClick={async () => {
              setStatus(null);
              try {
                const result = await sendSummary.mutateAsync({
                  emails: parseEmails(emailsText),
                  message: note.trim() || undefined,
                });
                setStatus(result.message || 'Summary sent.');
              } catch (err) {
                setStatus(getErrorMessage(err) || 'Failed to send summary.');
              }
            }}
          >
            {sendSummary.isPending ? 'Sending…' : 'Send summary'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
