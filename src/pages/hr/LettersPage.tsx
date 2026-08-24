import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { PdfReadyModal } from '@/features/files/components/PdfReadyModal';
import { formatPdfFilename } from '@/features/files/utils/pdfFilename';
import { letterPdfBranding } from '@/features/files/utils/pdfBranding';
import { LetterTypeGrid } from '@/features/hr/components/LetterTypeGrid';
import { labelEnum } from '@/features/hr/constants/hr.constants';
import { hrService } from '@/features/hr/services/hr.service';
import type { LetterRecord, LetterType } from '@/features/hr/types/hr.types';
import { letterPdfReference } from '@/features/hr/utils/normalizeLetterPdf';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export default function LettersPage() {
  const queryClient = useQueryClient();
  const [employeeId, setEmployeeId] = useState('');
  const [generatingType, setGeneratingType] = useState<LetterType | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [readyOpen, setReadyOpen] = useState(false);
  const [readyUrl, setReadyUrl] = useState<string | null>(null);
  const [readyBlob, setReadyBlob] = useState<Blob | null>(null);
  const [readyLetter, setReadyLetter] = useState<LetterRecord | null>(null);
  const [openingId, setOpeningId] = useState<string | null>(null);

  const { data: employees = [] } = useQuery({
    queryKey: ['hr', 'employees', 'letters'],
    queryFn: () => hrService.listEmployees({ limit: 100, status: 'ACTIVE' }),
  });

  const { data: letters = [], isLoading, isError, error } = useQuery({
    queryKey: ['hr', 'letters', employeeId],
    queryFn: () => hrService.listLetters(employeeId),
    enabled: Boolean(employeeId),
  });

  const generate = useMutation({
    mutationFn: (dto: Parameters<typeof hrService.generateLetterPdf>[0]) =>
      hrService.generateLetterPdf(dto),
  });

  const refresh = () => void queryClient.invalidateQueries({ queryKey: ['hr', 'letters'] });

  const generateForType = async (letterType: LetterType) => {
    if (!employeeId) {
      setActionError('Select an employee before generating a letter.');
      return;
    }

    setActionError(null);
    setActionMessage(null);
    setGeneratingType(letterType);

    try {
      let info = await generate.mutateAsync({
        employee_id: employeeId,
        letter_type: letterType,
      });
      const letterId = info.letter_id || info.letter?.id;

      for (let attempt = 0; attempt < 3 && !info.pdfBlob && letterId; attempt += 1) {
        if (attempt > 0) await sleep(1500);
        info = await hrService.getLetterPdf(letterId);
      }

      if (!info.pdfBlob) {
        throw new Error('Could not build the letter PDF. Please try again.');
      }

      const letter =
        info.letter ??
        ({
          id: letterId || '',
          employee_id: employeeId,
          employee: employees.find((emp) => emp.id === employeeId)?.name || '—',
          letter_type: letterType,
          generated_at: new Date().toISOString().slice(0, 10),
          status: 'GENERATED',
        } satisfies LetterRecord);

      setReadyLetter(letter);
      setReadyBlob(info.pdfBlob);
      setReadyUrl(info.pdf_url ?? null);
      setReadyOpen(true);
      setActionMessage(`${labelEnum(letterType)} PDF generated.`);
      refresh();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not generate letter PDF.');
    } finally {
      setGeneratingType(null);
    }
  };

  const openExistingPdf = async (letter: LetterRecord) => {
    setActionError(null);
    setActionMessage(null);
    setOpeningId(letter.id);
    try {
      const info = await hrService.getLetterPdf(letter.id);
      if (!info.pdfBlob) {
        throw new Error('Could not load the letter PDF bytes. Please try again.');
      }
      setReadyLetter(info.letter ?? letter);
      setReadyBlob(info.pdfBlob);
      setReadyUrl(info.pdf_url ?? null);
      setReadyOpen(true);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not open letter PDF.');
    } finally {
      setOpeningId(null);
    }
  };

  const readyReference = readyLetter ? letterPdfReference(readyLetter) : 'HR-LETTER';
  const readyFileName = formatPdfFilename(readyReference, 'hr-letter');
  const selectedEmployee = employees.find((emp) => emp.id === employeeId);

  return (
    <div className="space-y-4">
      <PageBackLink to="/hr" label="Back to HR" />
      <div>
        <h1 className="text-lg font-semibold text-gray-800">HR Letters</h1>
        <p className="text-sm text-gray-500 mt-1">
          Choose a letter type below to generate a branded PDF for an employee.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-md p-4">
        <label className="text-sm flex flex-col gap-1 max-w-md">
          <span className="font-medium text-[#0A2942]">Employee</span>
          <select
            className="border rounded px-2 py-1.5"
            value={employeeId}
            onChange={(e) => {
              setEmployeeId(e.target.value);
              setActionError(null);
            }}
          >
            <option value="">Select employee…</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name}
              </option>
            ))}
          </select>
        </label>
        {!employeeId ? (
          <p className="text-xs text-gray-500 mt-2">Select an employee to enable letter generation.</p>
        ) : selectedEmployee ? (
          <p className="text-xs text-gray-500 mt-2">Generating letters for {selectedEmployee.name}.</p>
        ) : null}
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[#0A2942]">Letter types</h2>
        <LetterTypeGrid
          disabled={!employeeId || generate.isPending}
          generatingType={generatingType}
          onSelect={(type) => void generateForType(type)}
        />
      </section>

      {actionMessage ? <p className="text-sm text-green-700">{actionMessage}</p> : null}
      {actionError ? <p className="text-sm text-red-600">{actionError}</p> : null}

      {employeeId ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-[#0A2942]">Generated letters</h2>
          {isLoading ? (
            <p className="text-sm text-gray-500">Loading letters…</p>
          ) : isError ? (
            <p className="text-sm text-red-600">
              {error instanceof Error ? error.message : 'Could not load letters.'}
            </p>
          ) : (
            <div className="bg-white border border-gray-200 rounded-md overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    {['Type', 'Generated', 'Status', 'PDF'].map((col) => (
                      <th key={col} className="text-left px-4 py-2 font-semibold text-[#0A2942]">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {letters.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-gray-500 text-center">
                        No letters for this employee yet.
                      </td>
                    </tr>
                  ) : (
                    letters.map((letter) => (
                      <tr key={letter.id} className="border-b border-gray-100">
                        <td className="px-4 py-2">{labelEnum(letter.letter_type)}</td>
                        <td className="px-4 py-2">{letter.generated_at || '—'}</td>
                        <td className="px-4 py-2">{letter.status}</td>
                        <td className="px-4 py-2">
                          <button
                            type="button"
                            className="text-xs text-blue-700 hover:underline disabled:opacity-50"
                            disabled={openingId === letter.id}
                            onClick={() => void openExistingPdf(letter)}
                          >
                            {openingId === letter.id ? 'Opening…' : 'Open PDF'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : null}

      <PdfReadyModal
        open={readyOpen}
        onClose={() => {
          setReadyOpen(false);
          setReadyUrl(null);
          setReadyBlob(null);
          setReadyLetter(null);
        }}
        blob={readyBlob}
        url={readyUrl}
        title="HR letter PDF ready"
        fileName={readyFileName}
        branding={letterPdfBranding(readyReference, readyLetter?.generated_at)}
        description="Your HR letter PDF was created successfully."
      />
    </div>
  );
}
