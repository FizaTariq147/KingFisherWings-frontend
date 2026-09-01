import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { Button } from '@/components/ui/Button';
import { TextInput } from '@/components/widgets/FilterField';
import { useBulkCostActions } from '@/features/documentation/hooks/useDocumentation';
import type { BulkCostLineDto } from '@/features/documentation/types/documentation.types';
import { extractAxiosErrorDetail } from '@/lib/extractAxiosErrorDetail';

export default function BulkCostEntryPage() {
  const navigate = useNavigate();
  const actions = useBulkCostActions();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [line, setLine] = useState<BulkCostLineDto>({
    job_id: '',
    description: '',
    currency_code: 'AED',
    fcy_amount: 0,
  });
  const [lines, setLines] = useState<BulkCostLineDto[]>([]);
  const [voyageNumber, setVoyageNumber] = useState('');
  const [prorateMethod, setProrateMethod] = useState('BY_WEIGHT');

  const addLine = () => {
    if (!line.job_id.trim() || !line.description.trim()) {
      setError('Job ID and description are required.');
      return;
    }
    setError(null);
    setLines((prev) => [...prev, { ...line, fcy_amount: Number(line.fcy_amount) || 0 }]);
    setLine({ job_id: '', description: '', currency_code: 'AED', fcy_amount: 0 });
  };

  const save = async (closeAfter: boolean) => {
    setError(null);
    setMessage(null);
    if (lines.length === 0) {
      setError('Add at least one charge line.');
      return;
    }
    try {
      await actions.create.mutateAsync({
        voyage_number: voyageNumber || undefined,
        prorate_method: prorateMethod,
        lines,
      });
      setMessage('Bulk cost batch saved.');
      if (closeAfter) navigate('/documentation');
    } catch (err) {
      setError(extractAxiosErrorDetail(err));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 py-6">
      <div className="w-full max-w-6xl space-y-3 px-4">
        <PageBackLink to="/documentation" label="Back to Documentation" />
        <div className="rounded-md bg-white shadow-lg">
          <div className="border-b border-gray-200 px-5 py-3">
            <h1 className="text-[17px] font-medium text-gray-800">Bulk Cost Entry</h1>
          </div>

          <div className="grid grid-cols-1 gap-3 p-5 md:grid-cols-2">
            <TextInput placeholder="Voyage no." value={voyageNumber} onChange={(e) => setVoyageNumber(e.target.value)} />
            <TextInput placeholder="Prorate method" value={prorateMethod} onChange={(e) => setProrateMethod(e.target.value)} />
            <TextInput placeholder="Job ID (UUID) *" value={line.job_id} onChange={(e) => setLine({ ...line, job_id: e.target.value })} />
            <TextInput placeholder="Description *" value={line.description} onChange={(e) => setLine({ ...line, description: e.target.value })} />
            <TextInput placeholder="Currency" value={line.currency_code} onChange={(e) => setLine({ ...line, currency_code: e.target.value })} />
            <TextInput placeholder="FCY amount" value={String(line.fcy_amount || '')} onChange={(e) => setLine({ ...line, fcy_amount: Number(e.target.value) || 0 })} />
            <div className="md:col-span-2 flex gap-2">
              <Button type="button" variant="secondary" onClick={addLine}>Add charge</Button>
              <Button type="button" variant="secondary" disabled={actions.preview.isPending} onClick={() => void actions.preview.mutateAsync({ lines, voyage_number: voyageNumber, prorate_method: prorateMethod })}>
                Preview
              </Button>
            </div>
          </div>

          {error ? <p className="px-5 text-sm text-red-600">{error}</p> : null}
          {message ? <p className="px-5 text-sm text-emerald-700">{message}</p> : null}

          <div className="bg-teal-500 px-5 py-2.5">
            <h2 className="text-sm font-medium text-white">Charge List ({lines.length})</h2>
          </div>
          <div className="min-h-[120px] p-5 text-sm text-gray-600">
            {lines.length === 0 ? 'No charges added yet' : (
              <ul className="space-y-1">
                {lines.map((l, i) => (
                  <li key={i}>{l.job_id} — {l.description} — {l.fcy_amount} {l.currency_code}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex justify-between border-t border-gray-200 px-5 py-3">
            <Button type="button" variant="secondary" onClick={() => navigate('/documentation')}>Cancel</Button>
            <div className="flex gap-2">
              <Button type="button" disabled={actions.create.isPending} onClick={() => void save(false)}>Save and New</Button>
              <Button type="button" disabled={actions.create.isPending} onClick={() => void save(true)}>Save and Close</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
