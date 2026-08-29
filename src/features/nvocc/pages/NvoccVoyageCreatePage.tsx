import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { Button } from '@/components/ui/Button';
import { TextInput, DateInput } from '@/components/widgets/FilterField';
import { useCreateNvoccVoyage } from '@/features/nvocc/hooks/useNvocc';
import { extractAxiosErrorDetail } from '@/lib/extractAxiosErrorDetail';

export default function NvoccVoyageCreatePage() {
  const navigate = useNavigate();
  const create = useCreateNvoccVoyage();
  const [etd, setEtd] = useState('');
  const [eta, setEta] = useState('');
  const [mbl_number, setMbl] = useState('');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const voyage = await create.mutateAsync({ etd: etd || undefined, eta: eta || undefined, mbl_number: mbl_number || undefined });
      navigate(`/nvocc/voyages/${voyage.id}`);
    } catch (error) {
      window.alert(extractAxiosErrorDetail(error));
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <PageBackLink to="/nvocc/vessel-voyage-master" label="Back to voyages" />
      <form onSubmit={submit} className="space-y-4 rounded-md border border-gray-200 bg-white p-5">
        <h1 className="text-lg font-semibold text-gray-900">New voyage</h1>
        <label className="block text-sm text-gray-700">
          ETD
          <DateInput value={etd} onChange={(e) => setEtd(e.target.value)} />
        </label>
        <label className="block text-sm text-gray-700">
          ETA
          <DateInput value={eta} onChange={(e) => setEta(e.target.value)} />
        </label>
        <label className="block text-sm text-gray-700">
          MBL number
          <TextInput value={mbl_number} onChange={(e) => setMbl(e.target.value)} />
        </label>
        <Button type="submit" disabled={create.isPending}>
          Create voyage
        </Button>
      </form>
    </div>
  );
}
