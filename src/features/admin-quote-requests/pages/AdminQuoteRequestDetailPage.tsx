import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ExternalLink } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { useAuth } from '@/hooks/useAuth';
import { appType } from '@/lib/erpTypography';
import { getErrorMessage } from '@/features/jobs/utils/getErrorMessage';
import { resolveAuthRoleSlug } from '@/features/users/constants/userPermissions';
import { QuoteLineItemsTable } from '../components/QuoteLineItemsTable';
import {
  useConvertQuoteRequestToQuote,
  useLinkQuoteRequestCrm,
  usePatchQuoteRequestStatus,
  useQuoteRequestConnection,
  useQuoteRequestDetail,
} from '../hooks/useAdminQuoteRequests';
import { KFQA_QUOTE_STATUSES } from '../types/adminQuoteRequests.types';
import { flattenExtraFields } from '../utils/formatExtraFields';
import {
  displayCustomerCompany,
  displayCustomerContact,
  displayCustomerName,
  displayReference,
  isKfqaStyleQuote,
  sourceBadgeLabel,
} from '../utils/quoteRequestDisplay';
import {
  canLinkQuoteRequestCrm,
  canUpdateQuoteRequestStatus,
  canViewQuoteRequests,
} from '../utils/quoteRequestsPermissions';

function formatWhen(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-[var(--color-neutral-400)]">{label}</dt>
      <dd className="mt-0.5 text-sm text-[var(--color-neutral-800)]">{value || '—'}</dd>
    </div>
  );
}

function ExternalHref({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 text-sm text-[var(--color-primary,#0A2942)] underline-offset-2 hover:underline"
    >
      {label}
      <ExternalLink className="h-3.5 w-3.5" />
    </a>
  );
}

function CrmLink({ to, label }: { to: string; label: string }) {
  return (
    <Link
      className="text-[var(--color-primary,#0A2942)] underline-offset-2 hover:underline"
      to={to}
    >
      {label}
    </Link>
  );
}

export default function AdminQuoteRequestDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const auth = useAuth();
  const roleSlug = resolveAuthRoleSlug(auth.user?.role);
  const canView = canViewQuoteRequests(auth, roleSlug);
  const canStatus = canUpdateQuoteRequestStatus(auth, roleSlug);
  const canCrm = canLinkQuoteRequestCrm(auth, roleSlug);

  const connection = useQuoteRequestConnection(canView);
  const detail = useQuoteRequestDetail(id, canView && Boolean(id));
  const patchStatus = usePatchQuoteRequestStatus(id);
  const linkCrm = useLinkQuoteRequestCrm(id);
  const convert = useConvertQuoteRequestToQuote(id);

  const [status, setStatus] = useState('');
  const [softwareRef, setSoftwareRef] = useState('');
  const [statusSeeded, setStatusSeeded] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState(false);

  useEffect(() => {
    if (!detail.data || statusSeeded) return;
    setStatus(detail.data.status || '');
    setSoftwareRef(detail.data.software_ref || '');
    setStatusSeeded(true);
  }, [detail.data, statusSeeded]);

  const isKfqa = isKfqaStyleQuote(detail.data, connection.data?.provider);

  const extraFields = useMemo(() => {
    const row = detail.data;
    if (!row || isKfqa) return [];
    return flattenExtraFields(row.raw_json ?? undefined, {
      excludeKeys: [
        'external_id',
        'externalId',
        'contact_name',
        'contactName',
        'contact_email',
        'contactEmail',
        'contact_phone',
        'contactPhone',
        'email',
        'phone',
        'name',
        'message',
        'remarks',
        'notes',
        'commodity',
        'status',
        'submitted_at',
        'submittedAt',
        'created_at',
        'createdAt',
        'lead_id',
        'leadId',
        'enquiry_id',
        'enquiryId',
        'party_id',
        'partyId',
        'company_id',
        'companyId',
        'last_synced_at',
        'lastSyncedAt',
        'status_pushed_at',
        'statusPushedAt',
        'sync_error',
        'syncError',
        'status_push_pending',
        'statusPushPending',
        'pending_status_push',
        'items',
        'customer',
        'reference',
        'source',
        'software_ref',
      ],
    });
  }, [detail.data, isKfqa]);

  const run = async (label: string, fn: () => Promise<unknown>) => {
    setError(null);
    setNotice(null);
    try {
      const result = await fn();
      setNotice(`${label} completed.`);
      if (result && typeof result === 'object') {
        const record = result as Record<string, unknown>;
        const quotationId = String(
          record.quotation_id ??
            record.quotationId ??
            (record.quotation as { id?: string } | undefined)?.id ??
            '',
        );
        if (quotationId) {
          setNotice(`${label} completed.`);
          navigate(`/quotations/${encodeURIComponent(quotationId)}`);
        }
        if (
          label === 'Status update' &&
          (record.status_push_pending === true ||
            record.pending_status_push === true ||
            (typeof record.sync_error === 'string' && record.sync_error))
        ) {
          setNotice(
            'Status saved locally. Remote push may still be pending — check the banner below.',
          );
        }
      }
      await detail.refetch();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (!canView) {
    return (
      <div className="space-y-3">
        <PageBackLink to="/admin/integrations/quote-requests" />
        <p className="text-sm text-[var(--color-danger-600)]">
          You do not have permission to view this quote request.
        </p>
      </div>
    );
  }

  const featureOff =
    (detail.error as { response?: { status?: number } } | null)?.response?.status === 404 &&
    !detail.data;

  const row = detail.data;

  return (
    <div className="space-y-4">
      <PageBackLink to="/admin/integrations/quote-requests" />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className={appType.pageTitle}>
            {row
              ? isKfqa
                ? displayReference(row)
                : `Quote request #${row.external_id}`
              : 'Quote request'}
          </h1>
          <p className={appType.pageSubtitle}>
            {row && isKfqa
              ? sourceBadgeLabel(row.source, row.source_label)
              : 'Review the website inquiry, update status on the site, and continue in CRM when ready.'}
          </p>
        </div>
        {row && isKfqa ? (
          <div className="flex flex-wrap gap-3">
            {row.page_url ? (
              <ExternalHref href={row.page_url} label="Storefront" />
            ) : null}
            {row.admin_url ? (
              <ExternalHref href={row.admin_url} label="WP admin" />
            ) : null}
          </div>
        ) : null}
      </div>

      {featureOff ? (
        <Card className="border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          This integration is disabled for the workspace, or the request was not found.
        </Card>
      ) : null}

      {error ? (
        <p className="text-sm text-[var(--color-danger-600)]" role="alert">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p className="text-sm text-emerald-700" role="status">
          {notice}
        </p>
      ) : null}

      {row?.status_push_pending || row?.sync_error ? (
        <Card className="border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          {row.sync_error
            ? `Remote push issue: ${row.sync_error}. Status may still be saved locally — run Sync later to retry.`
            : 'Status push to the website is pending. Run Sync later if it does not clear.'}
        </Card>
      ) : null}

      {detail.isLoading ? (
        <p className="text-sm text-[var(--color-neutral-500)]">Loading…</p>
      ) : null}
      {detail.isError && !featureOff ? (
        <p className="text-sm text-[var(--color-danger-600)]">{getErrorMessage(detail.error)}</p>
      ) : null}

      {row ? (
        <>
          {isKfqa ? (
            <>
              <Card className="p-4">
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <span className="rounded bg-[var(--color-neutral-100)] px-2 py-0.5 text-xs capitalize text-[var(--color-neutral-700)]">
                    {row.status || '—'}
                  </span>
                  {row.synced === false ? (
                    <span className="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
                      Not synced on WP
                    </span>
                  ) : null}
                </div>
                <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Field label="External id" value={row.external_id} />
                  <Field label="Submitted" value={formatWhen(row.submitted_at)} />
                  <Field label="Software ref" value={row.software_ref || '—'} />
                  <Field label="Last synced" value={formatWhen(row.last_synced_at)} />
                </dl>
              </Card>

              <Card className="p-4">
                <CardHeader className="mb-3 p-0">
                  <CardTitle className="text-base">Customer</CardTitle>
                </CardHeader>
                <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Field label="Type" value={row.customer.type} />
                  <Field label="Name" value={displayCustomerName(row)} />
                  <Field label="Company" value={displayCustomerCompany(row)} />
                  <Field
                    label="Email"
                    value={row.customer.email || row.contact_email}
                  />
                  <Field
                    label="Phone"
                    value={row.customer.phone || row.contact_phone}
                  />
                  <Field label="Contact summary" value={displayCustomerContact(row)} />
                </dl>
              </Card>

              <Card className="space-y-3 p-4">
                <CardHeader className="mb-0 p-0">
                  <CardTitle className="text-base">Line items</CardTitle>
                </CardHeader>
                <QuoteLineItemsTable items={row.items} />
                {row.commodity && row.items.length === 0 ? (
                  <p className="text-sm text-[var(--color-neutral-600)]">{row.commodity}</p>
                ) : null}
              </Card>

              {row.service != null ? (
                <Card className="p-4">
                  <CardHeader className="mb-3 p-0">
                    <CardTitle className="text-base">Service inquiry</CardTitle>
                  </CardHeader>
                  <pre className="overflow-x-auto rounded bg-[var(--color-neutral-50)] p-3 text-xs text-[var(--color-neutral-800)]">
                    {typeof row.service === 'string'
                      ? row.service
                      : JSON.stringify(row.service, null, 2)}
                  </pre>
                </Card>
              ) : null}

              {row.message ? (
                <Card className="p-4">
                  <CardHeader className="mb-2 p-0">
                    <CardTitle className="text-base">Message</CardTitle>
                  </CardHeader>
                  <p className="whitespace-pre-wrap text-sm text-[var(--color-neutral-800)]">
                    {row.message}
                  </p>
                </Card>
              ) : null}
            </>
          ) : (
            <Card className="p-4">
              <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="Website id" value={`#${row.external_id}`} />
                <Field
                  label="Status"
                  value={<span className="capitalize">{row.status || '—'}</span>}
                />
                <Field label="Submitted" value={formatWhen(row.submitted_at)} />
                <Field label="Contact name" value={row.contact_name} />
                <Field label="Email" value={row.contact_email} />
                <Field label="Phone" value={row.contact_phone} />
                <Field label="Commodity" value={row.commodity} />
                <Field label="Last synced" value={formatWhen(row.last_synced_at)} />
                <Field label="Status sent to website" value={formatWhen(row.status_pushed_at)} />
                <Field
                  label="Website update"
                  value={row.status_push_pending ? 'Waiting to push' : 'Up to date'}
                />
                <Field
                  label="Sync issue"
                  value={
                    row.sync_error ? (
                      <span className="text-[var(--color-danger-600)]">{row.sync_error}</span>
                    ) : (
                      'None'
                    )
                  }
                />
              </dl>
              {row.message ? (
                <div className="mt-4 border-t border-[var(--color-neutral-100)] pt-3">
                  <p className="text-xs text-[var(--color-neutral-400)]">Message</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-[var(--color-neutral-800)]">
                    {row.message}
                  </p>
                </div>
              ) : null}
            </Card>
          )}

          <Card className="p-4">
            <CardHeader className="mb-3 p-0">
              <CardTitle className="text-base">CRM links</CardTitle>
            </CardHeader>
            <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field
                label="Lead"
                value={
                  row.lead_id ? (
                    <CrmLink to={`/sales/lead/${encodeURIComponent(row.lead_id)}`} label="Open lead" />
                  ) : (
                    'Not linked'
                  )
                }
              />
              <Field
                label="Enquiry"
                value={
                  row.enquiry_id ? (
                    <CrmLink
                      to={`/sales/enquiries/${encodeURIComponent(row.enquiry_id)}`}
                      label="Open enquiry"
                    />
                  ) : (
                    'Not linked'
                  )
                }
              />
              <Field
                label="Party"
                value={
                  row.party_id ? (
                    <CrmLink
                      to={`/parties/${encodeURIComponent(row.party_id)}`}
                      label="Open party"
                    />
                  ) : (
                    'Not linked'
                  )
                }
              />
            </dl>
          </Card>

          {extraFields.length > 0 ? (
            <Card className="p-4">
              <CardHeader className="mb-3 p-0">
                <CardTitle className="text-base">Additional website fields</CardTitle>
              </CardHeader>
              <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {extraFields.map((field) => (
                  <Field key={field.label} label={field.label} value={field.value} />
                ))}
              </dl>
            </Card>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="space-y-3 p-4">
              <CardHeader className="mb-0 p-0">
                <CardTitle className="text-base">Update status</CardTitle>
              </CardHeader>
              <p className="text-xs text-[var(--color-neutral-500)]">
                Saves the status in KingFisher and pushes it back to the website
                {isKfqa ? ' (KFQA statuses).' : '.'}
              </p>
              {canStatus ? (
                <>
                  {isKfqa ? (
                    <label className="block text-sm">
                      <span className="mb-1 block text-xs font-medium text-[var(--color-neutral-600)]">
                        Status
                      </span>
                      <select
                        className="h-9 w-full rounded-md border border-[var(--color-neutral-200)] px-3 text-sm capitalize"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                      >
                        {!KFQA_QUOTE_STATUSES.includes(
                          status as (typeof KFQA_QUOTE_STATUSES)[number],
                        ) && status ? (
                          <option value={status}>{status}</option>
                        ) : null}
                        {KFQA_QUOTE_STATUSES.map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                    </label>
                  ) : (
                    <Input
                      label="Status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      placeholder="pending"
                    />
                  )}
                  {isKfqa ? (
                    <Input
                      label="Software ref (optional)"
                      value={softwareRef}
                      onChange={(e) => setSoftwareRef(e.target.value)}
                      placeholder="SO-2291"
                      hint="Local SO / quotation number pushed to WordPress."
                    />
                  ) : null}
                  <Button
                    type="button"
                    disabled={!status.trim() || patchStatus.isPending}
                    onClick={() =>
                      void run('Status update', () =>
                        patchStatus.mutateAsync({
                          status: status.trim(),
                          ...(isKfqa
                            ? {
                                ...(softwareRef.trim()
                                  ? { software_ref: softwareRef.trim() }
                                  : {}),
                                synced: true,
                              }
                            : {}),
                        }),
                      )
                    }
                  >
                    Update status
                  </Button>
                </>
              ) : (
                <p className="text-sm text-[var(--color-neutral-500)]">
                  Your role cannot update website status.
                </p>
              )}
            </Card>

            <Card className="space-y-3 p-4">
              <CardHeader className="mb-0 p-0">
                <CardTitle className="text-base">CRM</CardTitle>
              </CardHeader>
              <p className="text-xs text-[var(--color-neutral-500)]">
                Link creates a Lead and Enquiry if they are missing. Convert opens a freight
                quotation from the linked enquiry (not a merchandise invoice).
              </p>
              {canCrm ? (
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={linkCrm.isPending || Boolean(row.lead_id && row.enquiry_id)}
                    onClick={() => void run('CRM link', () => linkCrm.mutateAsync())}
                  >
                    {row.lead_id && row.enquiry_id ? 'Already linked' : 'Link to CRM'}
                  </Button>
                  <Button
                    type="button"
                    disabled={convert.isPending || !row.enquiry_id}
                    onClick={() =>
                      void run('Convert to quote', () => convert.mutateAsync())
                    }
                  >
                    Convert to freight quote
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-[var(--color-neutral-500)]">
                  CRM actions are not available for your role.
                </p>
              )}
              {!row.enquiry_id ? (
                <p className="text-xs text-amber-700">
                  Convert needs a linked enquiry. Use Link to CRM first, or sync a request that
                  includes an email address.
                </p>
              ) : null}
            </Card>
          </div>

          {(row.remote || row.raw_json) && isKfqa ? (
            <Card className="space-y-2 p-4">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base">Raw remote payload</CardTitle>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => setShowRaw((v) => !v)}
                >
                  {showRaw ? 'Hide' : 'Show'}
                </Button>
              </div>
              {showRaw ? (
                <pre className="max-h-96 overflow-auto rounded bg-[var(--color-neutral-50)] p-3 text-xs text-[var(--color-neutral-800)]">
                  {JSON.stringify(row.remote ?? row.raw_json, null, 2)}
                </pre>
              ) : (
                <p className="text-xs text-[var(--color-neutral-500)]">
                  Optional debug view of the mirrored WordPress document.
                </p>
              )}
            </Card>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
