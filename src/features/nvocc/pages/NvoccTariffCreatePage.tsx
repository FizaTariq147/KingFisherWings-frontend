import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { Button } from '@/components/ui/Button';
import { TextInput } from '@/components/widgets/FilterField';
import { useCreateNvoccTariff } from '@/features/nvocc/hooks/useNvocc';
import { extractAxiosErrorDetail } from '@/lib/extractAxiosErrorDetail';

export default function NvoccTariffCreatePage() {
  const navigate = useNavigate();
  const create = useCreateNvoccTariff();
  const [trade_lane, setTradeLane] = useState('');
  const [rate_valid_from, setValidFrom] = useState('');
  const [currency_code, setCurrency] = useState('USD');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const tariff = await create.mutateAsync({ trade_lane, rate_valid_from, currency_code });
      navigate(`/nvocc/tariffs/${tariff.id}`);
    } catch (error) {
      window.alert(extractAxiosErrorDetail(error));
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <PageBackLink to="/nvocc/tariffs" label="Back to tariffs" />
      <form onSubmit={submit} className="space-y-4 rounded-md border border-gray-200 bg-white p-5">
        <h1 className="text-lg font-semibold text-gray-900">New NVOCC tariff</h1>
        <label className="block text-sm text-gray-700">
          Trade lane *
          <TextInput value={trade_lane} onChange={(e) => setTradeLane(e.target.value)} className="mt-1" />
        </label>
        <label className="block text-sm text-gray-700">
          Valid from *
          <TextInput type="date" value={rate_valid_from} onChange={(e) => setValidFrom(e.target.value)} className="mt-1" />
        </label>
        <label className="block text-sm text-gray-700">
          Currency *
          <TextInput value={currency_code} onChange={(e) => setCurrency(e.target.value.toUpperCase())} className="mt-1" />
        </label>
        <Button type="submit" disabled={create.isPending || !trade_lane || !rate_valid_from || !currency_code}>
          Create tariff
        </Button>
      </form>
    </div>
  );
}
