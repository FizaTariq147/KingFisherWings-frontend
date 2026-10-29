import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { useAuth } from '@/hooks/useAuth';
import { appType } from '@/lib/erpTypography';
import { getErrorMessage } from '@/features/jobs/utils/getErrorMessage';
import { resolveAuthRoleSlug } from '@/features/users/constants/userPermissions';
import {
  useConvertQuoteRequestToQuote,
  useLinkQuoteRequestCrm,
  usePatchQuoteRequestStatus,
  useQuoteRequestDetail,
} from '../hooks/useAdminQuoteRequests';
import { flattenExtraFields } from '../utils/formatExtraFields';
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

function CrmLink({
  to,
  label,
}: {
  to: string;
  label: string;
}) {
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

  const detail = useQuoteRequestDetail(id, canView && Boolean(id));
  const patchStatus = usePatchQuoteRequestStatus(id);
  const linkCrm = useLinkQuoteRequestCrm(id);
  const convert = useConvertQuoteRequestToQuote(id);

  const [status, setStatus] = useState('');
  const [statusSeeded, setStatusSeeded] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!detail.data || statusSeeded) return;
    setStatus(detail.data.status || '');
    setStatusSeeded(true);
  }, [detail.data, statusSeeded]);

  const extraFields = useMemo(() => {
    const row = detail.data;
    if (!row) return [];
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
      ],
    });
  }, [detail.data]);

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
      <div>
        <h1 className={appType.pageTitle}>
          Quote request {row?.external_id ? `#${row.external_id}` : ''}
        </h1>
        <p className={appType.pageSubtitle}>
          Review the website inquiry, update status on the site, and continue in CRM when ready.
        </p>
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

      {detail.isLoading ? (
        <p className="text-sm text-[var(--color-neutral-500)]">Loading…</p>
      ) : null}
      {detail.isError && !featureOff ? (
        <p className="text-sm text-[var(--color-danger-600)]">{getErrorMessage(detail.error)}</p>
      ) : null}

      {row ? (
        <>
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
            {row.message ? (
              <div className="mt-4 border-t border-[var(--color-neutral-100)] pt-3">
                <p className="text-xs text-[var(--color-neutral-400)]">Message</p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-[var(--color-neutral-800)]">
                  {row.message}
                </p>
              </div>
            ) : null}
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
                Saves the status in KingFisher and sends it back to the website.
              </p>
              {canStatus ? (
                <>
                  <Input
                    label="Status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    placeholder="pending"
                  />
                  <Button
                    type="button"
                    disabled={!status.trim() || patchStatus.isPending}
                    onClick={() =>
                      void run('Status update', () =>
                        patchStatus.mutateAsync({ status: status.trim() }),
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
                quotation from the linked enquiry.
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
        </>
      ) : null}
    </div>
  );
}
