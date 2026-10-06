import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import {
  BOOKING_DOCUMENT_KIND_LABELS,
  type PortalBookingDocumentKind,
} from '../constants/bookingDocumentKinds';

export interface BookingDocumentUploadListProps {
  kinds: readonly PortalBookingDocumentKind[];
  uploadedKinds: ReadonlySet<string>;
  disabled?: boolean;
  uploadingKind?: string | null;
  onUpload: (kind: PortalBookingDocumentKind, file: File) => Promise<void>;
  /** When true, mark all listed kinds as required in the UI. */
  allRequired?: boolean;
  requiredKinds?: ReadonlySet<string>;
}

export function BookingDocumentUploadList({
  kinds,
  uploadedKinds,
  disabled,
  uploadingKind,
  onUpload,
  allRequired,
  requiredKinds,
}: BookingDocumentUploadListProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  return (
    <ul className="space-y-2">
      {kinds.map((kind) => {
        const required =
          allRequired || requiredKinds?.has(kind) || false;
        const uploaded = uploadedKinds.has(kind);
        const busy = uploadingKind === kind;
        return (
          <li
            key={kind}
            className="rounded-md border border-[var(--color-neutral-200)] px-3 py-2"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-medium text-[var(--color-neutral-800)]">
                  {BOOKING_DOCUMENT_KIND_LABELS[kind]}
                  {required ? (
                    <span className="text-[var(--color-danger-600)]"> *</span>
                  ) : (
                    <span className="text-xs font-normal text-[var(--color-neutral-400)]">
                      {' '}
                      (optional)
                    </span>
                  )}
                </p>
                <p className="text-xs text-[var(--color-neutral-500)]">
                  {uploaded
                    ? 'Uploaded'
                    : busy
                      ? 'Uploading…'
                      : required
                        ? 'PDF / image — customer upload required before submit'
                        : 'PDF / image — optional'}
                </p>
              </div>
              <Input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp"
                disabled={disabled || busy}
                className="max-w-[220px] text-xs"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = '';
                  if (!file) return;
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next[kind];
                    return next;
                  });
                  void onUpload(kind, file).catch((err) => {
                    setErrors((prev) => ({
                      ...prev,
                      [kind]:
                        err instanceof Error ? err.message : 'Upload failed.',
                    }));
                  });
                }}
              />
            </div>
            {errors[kind] ? (
              <p className="mt-1 text-xs text-[var(--color-danger-600)]">{errors[kind]}</p>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
