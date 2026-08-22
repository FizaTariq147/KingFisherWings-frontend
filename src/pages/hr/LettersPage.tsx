import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Plus } from 'lucide-react';
import { hrService } from '@/features/hr/services/hr.service';
import { LETTER_TYPES, labelEnum } from '@/features/hr/constants/hr.constants';
import {
  generateLetterSchema,
  parseWithFieldErrors,
  type FieldErrors,
} from '@/features/hr/schemas/hr.schema';
import type { LetterType } from '@/features/hr/types/hr.types';

export default function LettersPage() {
  const queryClient = useQueryClient();
  const [employeeId, setEmployeeId] = useState('');
  const [generateOpen, setGenerateOpen] = useState(false);
  const [genEmployeeId, setGenEmployeeId] = useState('');
  const [letterType, setLetterType] = useState<LetterType>('EMPLOYMENT_CERT');
  const [payloadJson, setPayloadJson] = useState('{}');
  const [actionError, setActionError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [viewLetterId, setViewLetterId] = useState<string | null>(null);
  const [viewContent, setViewContent] = useState<string>('');

  const { data: employees = [] } = useQuery({
    queryKey: ['hr', 'employees', 'letters'],
    queryFn: () => hrService.listEmployees({ limit: 100, status: 'ACTIVE' }),
  });

  const { data: letters = [], isLoading, isError, error } = useQuery({
    queryKey: ['hr', 'letters', employeeId],
    queryFn: () => hrService.listLetters(employeeId),
    enabled: Boolean(employeeId),
  });

  const refresh = () => void queryClient.invalidateQueries({ queryKey: ['hr', 'letters'] });

  const generate = useMutation({
    mutationFn: async () => {
      const parsed = parseWithFieldErrors(generateLetterSchema, {
        employee_id: genEmployeeId,
        letter_type: letterType,
      });
      if (!parsed.success) {
        setFieldErrors(parsed.fieldErrors);
        throw new Error(parsed.message);
      }
      let payload: Record<string, unknown> | undefined;
      if (payloadJson.trim() && payloadJson.trim() !== '{}') {
        try {
          payload = JSON.parse(payloadJson) as Record<string, unknown>;
        } catch {
          throw new Error('Payload must be valid JSON.');
        }
      }
      return hrService.generateLetter({ ...parsed.data, payload });
    },
    onSuccess: (letter) => {
      setGenerateOpen(false);
      setFieldErrors({});
      if (letter?.employee_id) setEmployeeId(letter.employee_id);
      refresh();
    },
    onError: (err) => setActionError(err instanceof Error ? err.message : 'Could not generate letter.'),
  });

  const viewLetter = async (id: string) => {
    try {
      setActionError(null);
      const letter = await hrService.getLetter(id);
      setViewContent(JSON.stringify(letter, null, 2));
      setViewLetterId(id);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not load letter.');
    }
  };

  return (
    <div className="space-y-4">
      <PageBackLink to="/hr" label="Back to HR" />
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-lg font-semibold text-gray-800">HR Letters</h1>
        <Button type="button" onClick={() => setGenerateOpen(true)}>
          <Plus size={14} className="mr-1" />
          Generate letter
        </Button>
      </div>

      <div className="bg-white border border-gray-200 rounded-md p-4">
        <label className="text-sm flex flex-col gap-1 max-w-xs">
          Employee
          <select
            className="border rounded px-2 py-1.5"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
          >
            <option value="">Select employee…</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {actionError && <p className="text-sm text-red-600">{actionError}</p>}

      {!employeeId ? (
        <p className="text-sm text-gray-500">Select an employee to view generated letters.</p>
      ) : isLoading ? (
        <p className="text-sm text-gray-500">Loading letters…</p>
      ) : isError ? (
        <p className="text-sm text-red-600">{error instanceof Error ? error.message : 'Could not load letters.'}</p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-md overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                {['Type', 'Generated', 'Status', 'Actions'].map((col) => (
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
                    No letters for this employee.
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
                        className="text-xs text-blue-700 hover:underline"
                        onClick={() => void viewLetter(letter.id)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={generateOpen} onClose={() => setGenerateOpen(false)} title="Generate HR letter">
        <div className="space-y-3">
          <label className="text-sm block">
            Employee
            <select
              className="mt-1 w-full border rounded px-2 py-1.5"
              value={genEmployeeId}
              onChange={(e) => setGenEmployeeId(e.target.value)}
            >
              <option value="">Select…</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
            {fieldErrors.employee_id && <span className="text-red-600 text-xs">{fieldErrors.employee_id}</span>}
          </label>
          <label className="text-sm block">
            Letter type
            <select
              className="mt-1 w-full border rounded px-2 py-1.5"
              value={letterType}
              onChange={(e) => setLetterType(e.target.value as LetterType)}
            >
              {LETTER_TYPES.map((t) => (
                <option key={t} value={t}>
                  {labelEnum(t)}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm block">
            Template payload (optional JSON)
            <textarea
              className="mt-1 w-full border rounded px-2 py-1.5 font-mono text-xs"
              rows={4}
              value={payloadJson}
              onChange={(e) => setPayloadJson(e.target.value)}
            />
          </label>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setGenerateOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={() => generate.mutate()} disabled={generate.isPending}>
              {generate.isPending ? 'Generating…' : 'Generate'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={Boolean(viewLetterId)} onClose={() => setViewLetterId(null)} title="Letter details">
        <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto max-h-96 whitespace-pre-wrap">{viewContent}</pre>
      </Modal>
    </div>
  );
}
