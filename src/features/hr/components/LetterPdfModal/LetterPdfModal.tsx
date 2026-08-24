import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { PdfReadyModal } from '@/features/files/components/PdfReadyModal';
import { StoredFileLink } from '@/features/files/components/StoredFileLink';
import { formatPdfFilename } from '@/features/files/utils/pdfFilename';
import { letterPdfBranding } from '@/features/files/utils/pdfBranding';
import { LetterTypeGrid } from '@/features/hr/components/LetterTypeGrid';
import {
  generateLetterSchema,
  parseWithFieldErrors,
  type FieldErrors,
} from '@/features/hr/schemas/hr.schema';
import type { GenerateLetterDto, LetterPdfInfo, LetterType } from '@/features/hr/types/hr.types';
import { letterPdfReference } from '@/features/hr/utils/normalizeLetterPdf';

interface EmployeeOption {
  id: string;
  name: string;
}

interface LetterPdfModalProps {
  open: boolean;
  onClose: () => void;
  employees: EmployeeOption[];
  isPending?: boolean;
  onGenerate: (dto: GenerateLetterDto) => Promise<LetterPdfInfo>;
  onPollPdf?: (letterId: string) => Promise<LetterPdfInfo>;
  onGenerated?: (info: LetterPdfInfo) => void;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function LetterPdfModal({
  open,
  onClose,
  employees,
  isPending,
  onGenerate,
  onPollPdf,
  onGenerated,
}: LetterPdfModalProps) {
  const [employeeId, setEmployeeId] = useState('');
  const [letterType, setLetterType] = useState<LetterType>('EMPLOYMENT_CERT');
  const [payloadJson, setPayloadJson] = useState('{}');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [localError, setLocalError] = useState<string | null>(null);
  const [readyUrl, setReadyUrl] = useState<string | null>(null);
  const [readyBlob, setReadyBlob] = useState<Blob | null>(null);
  const [readyOpen, setReadyOpen] = useState(false);
  const [readyMeta, setReadyMeta] = useState<{ fileName: string; date?: string } | null>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    if (open && !wasOpen.current) {
      setLocalError(null);
      setFieldErrors({});
      setReadyOpen(false);
      setReadyUrl(null);
      setReadyBlob(null);
      setReadyMeta(null);
    }
    wasOpen.current = open;
  }, [open]);

  const selectedEmployee = employees.find((emp) => emp.id === employeeId);
  const previewReference = letterPdfReference({
    id: '',
    employee_id: employeeId,
    employee: selectedEmployee?.name || 'Employee',
    letter_type: letterType,
    generated_at: new Date().toISOString().slice(0, 10),
    status: 'GENERATED',
  });
  const previewFileName = formatPdfFilename(previewReference, 'hr-letter');

  const closeReady = () => {
    setReadyOpen(false);
    setReadyUrl(null);
    setReadyBlob(null);
    onClose();
  };

  const handleGenerate = async () => {
    setLocalError(null);
    const parsed = parseWithFieldErrors(generateLetterSchema, {
      employee_id: employeeId,
      letter_type: letterType,
    });
    if (!parsed.success) {
      setFieldErrors(parsed.fieldErrors);
      setLocalError(parsed.message);
      return;
    }

    let payload: Record<string, unknown> | undefined;
    if (payloadJson.trim() && payloadJson.trim() !== '{}') {
      try {
        payload = JSON.parse(payloadJson) as Record<string, unknown>;
      } catch {
        setLocalError('Payload must be valid JSON.');
        return;
      }
    }

    setReadyOpen(true);
    setReadyUrl(null);
    setReadyBlob(null);

    try {
      let info = await onGenerate({ ...parsed.data, payload });
      const letterId = info.letter_id || info.letter?.id;

      for (let attempt = 0; attempt < 3 && !info.pdfBlob && letterId && onPollPdf; attempt += 1) {
        if (attempt > 0) await sleep(1500);
        info = await onPollPdf(letterId);
      }

      if (!info.pdfBlob && !info.pdf_url) {
        setReadyOpen(false);
        throw new Error('Could not build the letter PDF. Please try again.');
      }

      if (!info.pdfBlob) {
        setReadyOpen(false);
        throw new Error('Could not load the letter PDF bytes. Please try again.');
      }

      const reference = info.letter
        ? letterPdfReference(info.letter)
        : previewReference;
      const fileName = formatPdfFilename(reference, 'hr-letter');
      setReadyMeta({ fileName, date: info.letter?.generated_at });
      setReadyBlob(info.pdfBlob);
      setReadyUrl(info.pdf_url ?? null);
      onGenerated?.(info);
    } catch (err) {
      setReadyOpen(false);
      setLocalError(err instanceof Error ? err.message : 'Could not generate letter PDF.');
    }
  };

  return (
    <>
      <Modal open={open && !readyOpen} onClose={onClose} title="Generate HR letter PDF">
        <div className="space-y-4">
          {localError ? <p className="text-sm text-red-600">{localError}</p> : null}

          <label className="text-sm block">
            Employee
            <select
              className="mt-1 w-full border rounded px-2 py-1.5"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
            >
              <option value="">Select…</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
            {fieldErrors.employee_id ? (
              <span className="text-red-600 text-xs">{fieldErrors.employee_id}</span>
            ) : null}
          </label>

          <div className="space-y-2">
            <span className="text-xs font-medium text-[var(--color-neutral-500)]">Letter type *</span>
            <LetterTypeGrid
              selected={letterType}
              disabled={isPending}
              variant="picker"
              onSelect={setLetterType}
            />
          </div>

          <label className="text-sm block">
            Template payload (optional JSON)
            <textarea
              className="mt-1 w-full border rounded px-2 py-1.5 font-mono text-xs"
              rows={4}
              value={payloadJson}
              onChange={(e) => setPayloadJson(e.target.value)}
            />
          </label>

          <p className="text-xs text-gray-500">
            A branded PDF opens in a popup when generation completes, same as invoices and quotations.
          </p>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="button" onClick={() => void handleGenerate()} disabled={isPending}>
              {isPending ? 'Generating PDF…' : 'Generate PDF'}
            </Button>
          </div>
        </div>
      </Modal>

      <PdfReadyModal
        open={readyOpen}
        onClose={closeReady}
        blob={readyBlob}
        url={readyUrl}
        title="HR letter PDF ready"
        fileName={readyMeta?.fileName || previewFileName}
        branding={letterPdfBranding(
          readyMeta?.fileName ? readyMeta.fileName.replace(/\.pdf$/i, '') : previewReference,
          readyMeta?.date,
        )}
        description="Your HR letter PDF was created successfully."
      />
    </>
  );
}

export function LetterPdfLink({
  letter,
}: {
  letter: {
    id: string;
    letter_type: string;
    generated_at: string;
    employee: string;
    pdf_url?: string;
  };
}) {
  const reference = letterPdfReference({
    id: letter.id,
    employee_id: '',
    employee: letter.employee,
    letter_type: letter.letter_type,
    generated_at: letter.generated_at,
    status: 'GENERATED',
  });
  const fileName = formatPdfFilename(reference, 'hr-letter');
  const branding = letterPdfBranding(reference, letter.generated_at);

  if (!letter.pdf_url) {
    return <span className="text-gray-400">No PDF yet</span>;
  }

  return (
    <StoredFileLink
      url={letter.pdf_url}
      label="Open PDF"
      displayName={fileName}
      branding={branding}
    />
  );
}
