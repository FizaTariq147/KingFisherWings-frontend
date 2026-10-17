import { useRef, useState } from 'react';
import { Download, Paperclip, Upload } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getServerErrorMessage } from '@/lib/validation/mapApiErrors';
import {
  useSectionAttachmentMutations,
  useSectionAttachments,
} from './useSectionAttachments';
import {
  OPS_SECTION_LABELS,
  type OpsSectionKey,
  type SectionAttachmentEntity,
} from './sectionAttachment.types';

interface SectionAttachmentsPanelProps {
  entity: SectionAttachmentEntity;
  entityId: string;
  section: OpsSectionKey;
  /** Tie upload to one row (deposit / POD / BL / stuffing id). */
  recordId?: string;
  title?: string;
  compact?: boolean;
  className?: string;
}

export function SectionAttachmentsPanel({
  entity,
  entityId,
  section,
  recordId,
  title,
  compact = false,
  className = '',
}: SectionAttachmentsPanelProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const query = useSectionAttachments(entity, entityId, section);
  const mutations = useSectionAttachmentMutations(entity, entityId, section);
  const [visibleToCustomer, setVisibleToCustomer] = useState(true);
  const [visibleToVendor, setVisibleToVendor] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const items = (query.data?.items ?? []).filter((row) =>
    recordId ? row.record_id === recordId || !row.record_id : true,
  );
  const canUpload = query.data?.can_upload !== false;
  const busy = mutations.upload.isPending || mutations.openOrDownload.isPending;

  const onPick = async (file: File | null) => {
    if (!file) return;
    setError(null);
    setMsg(null);
    try {
      await mutations.upload.mutateAsync({
        file,
        fields: {
          ...(recordId?.trim() ? { record_id: recordId.trim() } : {}),
          visible_to_customer: visibleToCustomer,
          visible_to_vendor: visibleToVendor,
        },
      });
      setMsg(`Uploaded “${file.name}”. Appears on Documents when saved.`);
      if (fileRef.current) fileRef.current.value = '';
    } catch (err) {
      setError(getServerErrorMessage(err));
    }
  };

  const heading = title || `${OPS_SECTION_LABELS[section]} files`;

  return (
    <div
      className={`rounded-sm border border-[var(--fresa-border,#C9D3DF)] bg-[#F8FAFC] ${compact ? 'p-2' : 'p-3'} ${className}`.trim()}
    >
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[var(--fresa-header-text,#0A2942)]">
          <Paperclip className="h-3.5 w-3.5" aria-hidden />
          {heading}
        </p>
        <span className="text-[11px] text-[var(--color-neutral-500)]">
          {items.length} file{items.length === 1 ? '' : 's'}
        </span>
      </div>

      {error ? (
        <p className="mb-2 text-[12px] text-[var(--color-danger-600)]">{error}</p>
      ) : null}
      {msg ? (
        <p className="mb-2 text-[12px] text-[var(--color-success-700)]">{msg}</p>
      ) : null}

      {query.isLoading ? (
        <p className="text-[12px] text-[var(--color-neutral-400)]">Loading files…</p>
      ) : items.length === 0 ? (
        <p className="text-[12px] text-[var(--color-neutral-400)]">No files yet.</p>
      ) : (
        <ul className="mb-2 space-y-1.5">
          {items.map((row) => (
            <li
              key={row.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-sm border border-[var(--fresa-border,#C9D3DF)] bg-white px-2 py-1.5 text-[12px]"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-[#0f172a]">
                  {row.file_name || row.id.slice(0, 8)}
                </p>
                <p className="text-[10px] text-[var(--color-neutral-500)]">
                  {[
                    row.visible_to_customer ? 'Customer' : null,
                    row.visible_to_vendor ? 'Vendor' : null,
                    row.mime_type,
                  ]
                    .filter(Boolean)
                    .join(' · ') || 'Staff only'}
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                leftIcon={<Download className="h-3.5 w-3.5" />}
                disabled={busy}
                onClick={() => {
                  setError(null);
                  void mutations.openOrDownload
                    .mutateAsync({
                      documentId: row.id,
                      fileName: row.file_name,
                    })
                    .catch((err) => setError(getServerErrorMessage(err)));
                }}
              >
                Open
              </Button>
            </li>
          ))}
        </ul>
      )}

      {canUpload ? (
        <div className="space-y-2 border-t border-[var(--fresa-border,#C9D3DF)] pt-2">
          <div className="flex flex-wrap gap-3 text-[11px] text-[var(--color-neutral-600)]">
            <label className="inline-flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={visibleToCustomer}
                onChange={(e) => setVisibleToCustomer(e.target.checked)}
                disabled={busy}
              />
              Visible to customer
            </label>
            <label className="inline-flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={visibleToVendor}
                onChange={(e) => setVisibleToVendor(e.target.checked)}
                disabled={busy}
              />
              Visible to vendor
            </label>
          </div>
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            onChange={(e) => void onPick(e.target.files?.[0] ?? null)}
          />
          <Button
            type="button"
            size="sm"
            variant="create"
            leftIcon={<Upload className="h-3.5 w-3.5" />}
            disabled={busy}
            onClick={() => fileRef.current?.click()}
          >
            {mutations.upload.isPending ? 'Uploading…' : 'Upload file'}
          </Button>
        </div>
      ) : (
        <p className="text-[11px] text-[var(--color-neutral-500)]">
          Upload not available for this section.
        </p>
      )}
    </div>
  );
}
