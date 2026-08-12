import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PartyForm } from '../components/PartyForm';
import { useCreateParty } from '../hooks/useParties';
import type { CreatePartyFormValues } from '../types/party.types';
import { getErrorMessage } from '../utils/getErrorMessage';

export default function PartyCreatePage() {
  const navigate = useNavigate();
  const createParty = useCreateParty();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <button
        type="button"
        onClick={() => navigate('/parties')}
        className="text-xs font-medium text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)]"
      >
        ← Back to parties
      </button>
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">Create party</h2>
        <p className="text-sm text-[var(--color-neutral-400)] mt-0.5">
          Add any party type (customer, agent, supplier, carrier, etc.). After saving, open the party detail
          page to create Users Portal or Vendor Portal logins — party type is never changed automatically.
        </p>
      </div>
      {error && (
        <div
          role="alert"
          className="rounded-lg border px-4 py-3 text-sm"
          style={{
            background: 'var(--color-danger-100)',
            borderColor: '#FECACA',
            color: 'var(--color-danger-700)',
          }}
        >
          {error}
        </div>
      )}
      <PartyForm
        mode="create"
        isSubmitting={createParty.isPending}
        onCancel={() => navigate('/parties')}
        onSubmit={async (values) => {
          setError(null);
          try {
            const party = await createParty.mutateAsync(values as CreatePartyFormValues);
            navigate(`/parties/${party.id}`);
          } catch (err) {
            setError(getErrorMessage(err));
          }
        }}
      />
    </div>
  );
}
