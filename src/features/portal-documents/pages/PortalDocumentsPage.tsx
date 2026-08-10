import { useMemo, useState } from 'react';
import { Download, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PortalApiError } from '@/lib/portalApiClient';
import { PARTY_PORTAL_DOCUMENT_TYPES as PORTAL_DOCUMENT_TYPES } from '@/features/parties/api/party.api';
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
  useDownloadPortalDocument,
  usePortalDocuments,
  usePortalDocumentSummary,
} from '../hooks/usePortalDocuments';

export default function PortalDocumentsPage() {
  const [page, setPage] = useState(1);
  const [source, setSource] = useState('');
  const [docType, setDocType] = useState('');
  const params = useMemo(
    () => ({
      page,
      limit: 20,
      source: source || undefined,
      portal_document_type: docType || undefined,
      order: 'desc' as const,
    }),
    [page, source, docType],
  );

  const summary = usePortalDocumentSummary();
  const { data, isLoading, isError, error, refetch, isFetching } = usePortalDocuments(params);
  const download = useDownloadPortalDocument();
  const items = data?.items ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-5">
      <PortalPageHeader
        title="Documents"
        description="Invoices and shipment documents available to your account."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <PortalStatCard
          label="Total documents"
          value={summary.data?.total ?? (summary.isLoading ? '…' : 0)}
          Icon={FileText}
        />
      </div>

      <PortalPanel padded>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium text-[var(--color-neutral-600)]">
              Source
            </span>
            <select
              className={portalSelectClassName}
              value={source}
              onChange={(e) => {
                setPage(1);
                setSource(e.target.value);
              }}
            >
              <option value="">All</option>
              <option value="job">Job</option>
              <option value="invoice">Invoice</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium text-[var(--color-neutral-600)]">
              Type
            </span>
            <select
              className={portalSelectClassName}
              value={docType}
              onChange={(e) => {
                setPage(1);
                setDocType(e.target.value);
              }}
            >
              <option value="">All</option>
              {PORTAL_DOCUMENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.replaceAll('_', ' ')}
                </option>
              ))}
            </select>
          </label>
        </div>
      </PortalPanel>

      <PortalPanel>
        <PortalFetchBar active={isFetching && !isLoading} />
        {isLoading ? (
          <PortalLoadingState label="Loading documents…" />
        ) : isError ? (
          <div className="p-6 space-y-2">
            <p className="text-sm text-[var(--color-danger-600)]">
              {error instanceof PortalApiError || error instanceof Error
                ? error.message
                : 'Failed to load documents.'}
            </p>
            <Button type="button" size="sm" variant="secondary" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : items.length === 0 ? (
          <PortalEmptyState
            title="No documents found"
            description="Documents appear here once invoices or job files are available for your party."
            Icon={FileText}
          />
        ) : (
          <PortalAnimatedList className="divide-y divide-[var(--color-neutral-100)]">
            {items.map((doc) => (
              <PortalAnimatedListItem
                key={doc.id}
                className="flex items-center justify-between gap-3 px-4 py-3.5"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary-100)] text-[var(--color-primary)]">
                    <FileText size={16} aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate">{doc.name}</div>
                    <div className="text-xs text-[var(--color-neutral-500)]">
                      {[doc.documentType, doc.source, doc.createdAt].filter(Boolean).join(' · ')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {doc.source ? <Badge variant="neutral">{doc.source}</Badge> : null}
                  {doc.canDownload !== false && (
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      disabled={download.isPending}
                      onClick={() => void download.mutateAsync(doc)}
                    >
                      <Download size={14} aria-hidden="true" />
                      Download
                    </Button>
                  )}
                </div>
              </PortalAnimatedListItem>
            ))}
          </PortalAnimatedList>
        )}
      </PortalPanel>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--color-neutral-500)]">
            Page {meta.page} of {meta.totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={page >= meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
