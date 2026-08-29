import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { Button } from '@/components/ui/Button';
import { SelectInput, TextInput } from '@/components/widgets/FilterField';
import { NVOCC_CARGO_TYPES } from '@/features/nvocc/constants/nvocc.constants';
import { useCreateNvoccEnquiry } from '@/features/nvocc/hooks/useNvocc';
import type { NvoccCargoType } from '@/features/nvocc/constants/nvocc.constants';
import { extractAxiosErrorDetail } from '@/lib/extractAxiosErrorDetail';

export default function NvoccEnquiryCreatePage() {
  const navigate = useNavigate();
  const create = useCreateNvoccEnquiry();
  const [cargo_type, setCargoType] = useState<NvoccCargoType>('FCL');
  const [customer_id, setCustomerId] = useState('');
  const [voyage_id, setVoyageId] = useState('');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const enquiry = await create.mutateAsync({
        cargo_type,
        customer_id: customer_id || undefined,
        voyage_id: voyage_id || undefined,
      });
      navigate(`/nvocc/enquiries/${enquiry.id}`);
    } catch (error) {
      window.alert(extractAxiosErrorDetail(error));
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <PageBackLink to="/nvocc/enquiry-list" label="Back to enquiries" />
      <form onSubmit={submit} className="space-y-4 rounded-md border border-gray-200 bg-white p-5">
        <h1 className="text-lg font-semibold text-gray-900">New NVOCC enquiry</h1>
        <label className="block text-sm text-gray-700">
          Cargo type
          <SelectInput
            options={NVOCC_CARGO_TYPES.map((v) => ({ value: v, label: v }))}
            value={cargo_type}
            onChange={(e) => setCargoType(e.target.value as NvoccCargoType)}
          />
        </label>
        <label className="block text-sm text-gray-700">
          Customer ID
          <TextInput value={customer_id} onChange={(e) => setCustomerId(e.target.value)} placeholder="UUID" />
        </label>
        <label className="block text-sm text-gray-700">
          Voyage ID
          <TextInput value={voyage_id} onChange={(e) => setVoyageId(e.target.value)} placeholder="UUID" />
        </label>
        <Button type="submit" disabled={create.isPending}>
          Create enquiry
        </Button>
      </form>
    </div>
  );
}
