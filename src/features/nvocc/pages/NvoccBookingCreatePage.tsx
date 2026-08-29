import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { Button } from '@/components/ui/Button';
import { SelectInput, TextInput } from '@/components/widgets/FilterField';
import { NVOCC_CARGO_TYPES } from '@/features/nvocc/constants/nvocc.constants';
import { useCreateNvoccBooking } from '@/features/nvocc/hooks/useNvocc';
import type { NvoccCargoType } from '@/features/nvocc/constants/nvocc.constants';
import { extractAxiosErrorDetail } from '@/lib/extractAxiosErrorDetail';

export default function NvoccBookingCreatePage() {
  const navigate = useNavigate();
  const create = useCreateNvoccBooking();
  const [voyage_id, setVoyageId] = useState('');
  const [cargo_type, setCargoType] = useState<NvoccCargoType>('FCL');
  const [enquiry_id, setEnquiryId] = useState('');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!voyage_id) {
      window.alert('Voyage is required.');
      return;
    }
    try {
      const booking = await create.mutateAsync({
        voyage_id,
        cargo_type,
        enquiry_id: enquiry_id || undefined,
        apply_tariff: true,
      });
      navigate(`/nvocc/bookings/${booking.id}`);
    } catch (error) {
      window.alert(extractAxiosErrorDetail(error));
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <PageBackLink to="/nvocc/booking-list" label="Back to bookings" />
      <form onSubmit={submit} className="space-y-4 rounded-md border border-gray-200 bg-white p-5">
        <h1 className="text-lg font-semibold text-gray-900">New NVOCC booking</h1>
        <label className="block text-sm text-gray-700">
          Voyage ID *
          <TextInput value={voyage_id} onChange={(e) => setVoyageId(e.target.value)} placeholder="UUID" />
        </label>
        <label className="block text-sm text-gray-700">
          Cargo type *
          <SelectInput
            options={NVOCC_CARGO_TYPES.map((v) => ({ value: v, label: v }))}
            value={cargo_type}
            onChange={(e) => setCargoType(e.target.value as NvoccCargoType)}
          />
        </label>
        <label className="block text-sm text-gray-700">
          Enquiry ID
          <TextInput value={enquiry_id} onChange={(e) => setEnquiryId(e.target.value)} placeholder="Optional UUID" />
        </label>
        <Button type="submit" disabled={create.isPending || !voyage_id}>
          Create booking
        </Button>
      </form>
    </div>
  );
}
