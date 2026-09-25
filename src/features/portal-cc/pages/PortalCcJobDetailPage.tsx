import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  CircleDashed,
  ClipboardList,
  FileUp,
  RefreshCw,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PortalApiError } from '@/lib/portalApiClient';
import {
  PortalAnimatedList,
  PortalAnimatedListItem,
  PortalEmptyState,
  PortalFetchBar,
  PortalLoadingState,
  PortalPageHeader,
  PortalPanel,
  PortalStatCard,
  portalSelectClassName,
} from '@/features/portal-auth/components/portal-ui';
import {
  usePortalCcAttachDocument,
  usePortalCcChecklist,
  usePortalCcJob,
} from '../hooks/usePortalCc';
import type { PortalCcChecklistItem } from '../types/portalCc.types';

const DOC_OPTIONS: { value: string; label: string }[] = [
  { value: 'COMMERCIAL_INVOICE', label: 'Commercial invoice' },
  { value: 'PACKING_LIST', label: 'Packing list' },
  { value: 'BILL_OF_LADING', label: 'Bill of lading' },
  { value: 'AIR_WAYBILL', label: 'Air waybill' },
  { value: 'CERTIFICATE_OF_ORIGIN', label: 'Certificate of origin' },
  { value: 'IMPORT_PERMIT', label: 'Import permit' },
  { value: 'OTHER', label: 'Other' },
];

function formatLabel(value?: string | null): string {
  if (!value?.trim()) return '—';
  return value.replaceAll('_', ' ');
}

function statusVariant(
  status?: string | null,
): 'success' | 'warning' | 'danger' | 'info' | 'neutral' {
  const s = String(status ?? '').toUpperCase();
  if (/CLEAR|DONE|COMPLETE|RELEASED|CLOSED|VERIFIED/.test(s)) return 'success';
  if (/HOLD|QUERY|PENDING|WAIT|REQUIRED/.test(s)) return 'warning';
  if (/REJECT|FAIL|CANCEL|BLOCK|MISSING/.test(s)) return 'danger';
  if (/PROGRESS|REVIEW|FILED|SUBMIT|RECEIVED/.test(s)) return 'info';
  return 'neutral';
}

function checklistStatus(item: PortalCcChecklistItem): string {
  if (item.status?.trim()) return item.status;
  if (item.verified) return 'verified';
  if (item.received) return 'received';
  if (item.completed) return 'done';
  return 'pending';
}

function isChecklistDone(item: PortalCcChecklistItem): boolean {
  const s = checklistStatus(item).toUpperCase();
  return Boolean(item.verified || item.completed || /VERIFIED|DONE|COMPLETE|RECEIVED/.test(s));
}

export default function PortalCcJobDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const jobQuery = usePortalCcJob(id);
  const checklistQuery = usePortalCcChecklist(id);
  const attach = usePortalCcAttachDocument(id);
  const [docCode, setDocCode] = useState('COMMERCIAL_INVOICE');
  const [jobDocumentId, setJobDocumentId] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const job = jobQuery.data;
  const checklist = checklistQuery.data ?? [];

  const checklistStats = useMemo(() => {
    const done = checklist.filter(isChecklistDone).length;
    const required = checklist.filter((i) => i.required).length;
    const requiredDone = checklist.filter((i) => i.required && isChecklistDone(i)).length;
    return { total: checklist.length, done, required, requiredDone };
  }, [checklist]);

  const onAttach = async () => {
    if (!docCode.trim()) {
      setErr('Document type is required.');
      return;
    }
    setErr(null);
    setMsg(null);
    try {
      await attach.mutateAsync({
        doc_code: docCode.trim(),
        job_document_id: jobDocumentId.trim() || undefined,
      });
      const label = DOC_OPTIONS.find((d) => d.value === docCode)?.label ?? docCode;
      setMsg(`${label} attached to checklist.`);
      setJobDocumentId('');
      await checklistQuery.refetch();
    } catch (e) {
      setErr(
        e instanceof PortalApiError
          ? e.message
          : e instanceof Error
            ? e.message
            : 'Could not attach document.',
      );
    }
  };

  if (jobQuery.isLoading) {
    return <PortalLoadingState label="Loading customs clearance job…" />;
  }

  if (jobQuery.isError || !job) {
    return (
      <div className="space-y-3">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-neutral-500)] hover:text-[var(--color-primary)]"
          onClick={() => navigate('/portal/cc-jobs')}
        >
          <ArrowLeft size={14} aria-hidden="true" />
          All CC jobs
        </button>
        <p className="text-sm text-[var(--color-danger-600)]" role="alert">
          {jobQuery.error instanceof PortalApiError || jobQuery.error instanceof Error
            ? jobQuery.error.message
            : 'Customs clearance job not found.'}
        </p>
        <Button type="button" size="sm" variant="secondary" onClick={() => void jobQuery.refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <button
        type="button"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-neutral-500)] hover:text-[var(--color-primary)]"
        onClick={() => navigate('/portal/cc-jobs')}
      >
        <ArrowLeft size={14} aria-hidden="true" />
        All CC jobs
      </button>

      <PortalPageHeader
        title={job.job_number || 'Customs clearance'}
        description={
          [formatLabel(job.stage), job.customer_name].filter(Boolean).join(' · ') ||
          'Checklist and document upload for this clearance job.'
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {job.status ? (
              <Badge variant={statusVariant(job.status)}>{formatLabel(job.status)}</Badge>
            ) : null}
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={jobQuery.isFetching || checklistQuery.isFetching}
              onClick={() => {
                void jobQuery.refetch();
                void checklistQuery.refetch();
              }}
            >
              <RefreshCw size={14} aria-hidden="true" />
              Refresh
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => navigate(`/portal/documents?job_id=${encodeURIComponent(id)}`)}
            >
              Documents
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <PortalStatCard
          label="Checklist"
          value={`${checklistStats.done}/${checklistStats.total || '—'}`}
          Icon={ClipboardList}
          theme="navy"
        />
        <PortalStatCard
          label="Required done"
          value={`${checklistStats.requiredDone}/${checklistStats.required || '—'}`}
          Icon={CheckCircle2}
          theme="cyan"
        />
        <PortalStatCard
          label="Stage"
          value={formatLabel(job.stage)}
          Icon={CircleDashed}
          theme="orange"
        />
      </div>

      <PortalPanel padded>
        <h2 className="text-sm font-semibold text-[var(--color-neutral-900)]">Job details</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-neutral-500)]">
              Job number
            </dt>
            <dd className="mt-1 text-sm font-medium text-[var(--color-neutral-800)]">
              {job.job_number || job.id}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-neutral-500)]">
              Status
            </dt>
            <dd className="mt-1 text-sm font-medium text-[var(--color-neutral-800)]">
              {formatLabel(job.status)}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-neutral-500)]">
              Stage
            </dt>
            <dd className="mt-1 text-sm font-medium text-[var(--color-neutral-800)]">
              {formatLabel(job.stage)}
            </dd>
          </div>
          {job.customer_name ? (
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-neutral-500)]">
                Customer
              </dt>
              <dd className="mt-1 text-sm font-medium text-[var(--color-neutral-800)]">
                {job.customer_name}
              </dd>
            </div>
          ) : null}
          {job.notes ? (
            <div className="sm:col-span-2 lg:col-span-3">
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-neutral-500)]">
                Notes
              </dt>
              <dd className="mt-1 text-sm text-[var(--color-neutral-700)]">{job.notes}</dd>
            </div>
          ) : null}
        </dl>
      </PortalPanel>

      <PortalPanel>
        <div className="border-b border-[var(--color-neutral-100)] px-5 py-4 sm:px-6">
          <h2 className="text-sm font-semibold text-[var(--color-neutral-900)]">Checklist</h2>
          <p className="mt-0.5 text-xs text-[var(--color-neutral-500)]">
            Required items are marked. Attach supporting documents below when ready.
          </p>
        </div>
        <PortalFetchBar active={checklistQuery.isFetching && !checklistQuery.isLoading} />
        {checklistQuery.isLoading ? (
          <PortalLoadingState label="Loading checklist…" />
        ) : checklistQuery.isError ? (
          <div className="space-y-2 p-6">
            <p className="text-sm text-[var(--color-danger-600)]" role="alert">
              Could not load checklist.
            </p>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => void checklistQuery.refetch()}
            >
              Retry
            </Button>
          </div>
        ) : checklist.length === 0 ? (
          <PortalEmptyState
            title="No checklist items"
            description="Checklist items will appear once ops opens the clearance pack."
            Icon={ClipboardList}
          />
        ) : (
          <PortalAnimatedList className="divide-y divide-[var(--color-neutral-100)]">
            {checklist.map((item) => {
              const status = checklistStatus(item);
              const done = isChecklistDone(item);
              return (
                <PortalAnimatedListItem key={item.id}>
                  <div className="flex items-center justify-between gap-3 px-5 py-3.5 sm:px-6">
                    <div className="flex min-w-0 items-start gap-3">
                      <div
                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          done
                            ? 'bg-[var(--color-success-100)] text-[var(--color-success-700)]'
                            : 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-500)]'
                        }`}
                      >
                        {done ? (
                          <CheckCircle2 size={15} aria-hidden="true" />
                        ) : (
                          <CircleDashed size={15} aria-hidden="true" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-[var(--color-neutral-800)]">
                          {item.label || formatLabel(item.code) || item.id.slice(0, 8)}
                          {item.required ? (
                            <span className="ml-1 text-[var(--color-warning-700)]" title="Required">
                              *
                            </span>
                          ) : null}
                        </p>
                        {item.code ? (
                          <p className="mt-0.5 text-xs text-[var(--color-neutral-400)]">
                            {formatLabel(item.code)}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <Badge variant={statusVariant(status)}>{formatLabel(status)}</Badge>
                  </div>
                </PortalAnimatedListItem>
              );
            })}
          </PortalAnimatedList>
        )}
      </PortalPanel>

      <PortalPanel padded>
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-secondary-100)] text-[var(--color-secondary-700)]">
            <FileUp size={16} aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold text-[var(--color-neutral-900)]">
              Attach document
            </h2>
            <p className="mt-0.5 text-xs text-[var(--color-neutral-500)]">
              Link a document type to this clearance job. Upload files under Documents first if you
              need a job document id.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1.2fr_auto] lg:items-end">
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium text-[var(--color-neutral-600)]">
              Document type
            </span>
            <select
              className={portalSelectClassName}
              value={docCode}
              onChange={(e) => setDocCode(e.target.value)}
            >
              {DOC_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <Input
            label="Job document id (optional)"
            value={jobDocumentId}
            onChange={(e) => setJobDocumentId(e.target.value)}
            placeholder="UUID from Documents"
          />
          <Button
            type="button"
            disabled={attach.isPending}
            onClick={() => void onAttach()}
            className="w-full lg:w-auto"
          >
            {attach.isPending ? 'Attaching…' : 'Attach'}
          </Button>
        </div>

        {err ? (
          <p className="mt-3 text-sm text-[var(--color-danger-600)]" role="alert">
            {err}
          </p>
        ) : null}
        {msg ? (
          <p className="mt-3 text-sm text-[var(--color-success-700)]" role="status">
            {msg}
          </p>
        ) : null}
      </PortalPanel>
    </div>
  );
}
