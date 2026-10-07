import { useEffect, useId, useRef, useState } from 'react';
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
  /** When false, files are staged locally (filename shown) and uploaded when this becomes true. */
  canUpload?: boolean;
  /** When true, mark all listed kinds as required in the UI. */
  allRequired?: boolean;
  requiredKinds?: ReadonlySet<string>;
  /** Called whenever a file is chosen (before / instead of remote upload when staged). */
  onFileSelected?: (kind: PortalBookingDocumentKind, file: File) => void;
}

function formatFileLabel(file: File | undefined | null): string {
  if (!file) return 'No file chosen';
  const name = file.name?.trim() || 'Selected file';
  if (name.length <= 42) return name;
  const ext = name.includes('.') ? name.slice(name.lastIndexOf('.')) : '';
  return `${name.slice(0, 34)}…${ext}`;
}

export function BookingDocumentUploadList({
  kinds,
  uploadedKinds,
  disabled,
  uploadingKind,
  onUpload,
  canUpload = true,
  allRequired,
  requiredKinds,
  onFileSelected,
}: BookingDocumentUploadListProps) {
  const baseId = useId();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File>>({});
  const [stagedNotes, setStagedNotes] = useState<Record<string, string>>({});
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const flushInFlight = useRef<Set<string>>(new Set());

  const tryUpload = async (kind: PortalBookingDocumentKind, file: File) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[kind];
      return next;
    });
    setStagedNotes((prev) => {
      const next = { ...prev };
      delete next[kind];
      return next;
    });
    try {
      await onUpload(kind, file);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed.';
      setErrors((prev) => ({ ...prev, [kind]: message }));
      throw err;
    }
  };

  // When a booking/shipment becomes available, flush staged files.
  useEffect(() => {
    if (!canUpload) return;
    for (const kind of kinds) {
      if (uploadedKinds.has(kind)) continue;
      const file = selectedFiles[kind];
      if (!file) continue;
      if (flushInFlight.current.has(kind)) continue;
      if (uploadingKind === kind) continue;
      flushInFlight.current.add(kind);
      void tryUpload(kind, file)
        .catch(() => {
          /* error already stored */
        })
        .finally(() => {
          flushInFlight.current.delete(kind);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- flush when canUpload / selection changes
  }, [canUpload, kinds, selectedFiles, uploadedKinds, uploadingKind]);

  return (
    <ul className="space-y-2">
      {kinds.map((kind) => {
        const required = allRequired || requiredKinds?.has(kind) || false;
        const uploaded = uploadedKinds.has(kind);
        const busy = uploadingKind === kind;
        const file = selectedFiles[kind];
        const inputId = `${baseId}-${kind}`;
        const statusText = uploaded
          ? 'Uploaded'
          : busy
            ? 'Uploading…'
            : file
              ? canUpload
                ? 'Ready to upload'
                : stagedNotes[kind] ||
                  'Selected — upload when booking/shipment is linked'
              : required
                ? 'PDF / image required'
                : 'PDF / image — optional';

        return (
          <li
            key={kind}
            className="rounded-md border border-[var(--color-neutral-200)] px-3 py-2"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
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
                <p className="text-xs text-[var(--color-neutral-500)]">{statusText}</p>
              </div>

              <div className="flex min-w-0 max-w-full flex-wrap items-center gap-2">
                <input
                  ref={(el) => {
                    inputRefs.current[kind] = el;
                  }}
                  id={inputId}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.webp,application/pdf,image/*"
                  disabled={disabled || busy}
                  className="sr-only"
                  onChange={(e) => {
                    const next = e.target.files?.[0];
                    // Keep value so re-picking same file still works after clear.
                    e.target.value = '';
                    if (!next) return;
                    setSelectedFiles((prev) => ({ ...prev, [kind]: next }));
                    setErrors((prev) => {
                      const copy = { ...prev };
                      delete copy[kind];
                      return copy;
                    });
                    onFileSelected?.(kind, next);

                    if (!canUpload) {
                      setStagedNotes((prev) => ({
                        ...prev,
                        [kind]:
                          'Selected — upload when booking/shipment is linked',
                      }));
                      return;
                    }

                    void tryUpload(kind, next).catch(() => {
                      /* keep filename; error shown below */
                    });
                  }}
                />
                <label
                  htmlFor={inputId}
                  className={[
                    'inline-flex h-9 shrink-0 cursor-pointer items-center rounded-md border border-[var(--color-neutral-300)] bg-[var(--color-neutral-50)] px-3 text-xs font-medium text-[var(--color-neutral-800)]',
                    'hover:bg-[var(--color-neutral-100)]',
                    disabled || busy
                      ? 'pointer-events-none cursor-not-allowed opacity-60'
                      : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {file || uploaded ? 'Change file' : 'Choose file'}
                </label>
                <span
                  className="min-w-0 max-w-[220px] truncate text-xs text-[var(--color-neutral-600)]"
                  title={file?.name || (uploaded ? 'Uploaded' : undefined)}
                >
                  {uploaded && !file
                    ? 'File uploaded'
                    : formatFileLabel(file)}
                </span>
              </div>
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
