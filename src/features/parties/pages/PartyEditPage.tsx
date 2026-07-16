import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { isUuid } from '@/lib/isUuid';
import { PartyForm } from '../components/PartyForm';
import { useParty, useUpdateParty } from '../hooks/useParties';
import type { CreatePartyFormValues, UpdatePartyFormValues } from '../types/party.types';
import { getErrorMessage } from '../utils/getErrorMessage';

export default function PartyEditPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { data: party, isLoading, isError, error, refetch } = useParty(id);
  const updateParty = useUpdateParty(id);
  const [formError, setFormError] = useState<string | null>(null);

  if (!isUuid(id)) {
    return <Card className="p-6 text-sm text-[var(--color-danger-700)]">Invalid party id.</Card>;
  }

  if (isLoading) {
    return <Card className="p-8 text-sm text-[var(--color-neutral-400)]">Loading…</Card>;
  }

  if (isError || !party) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-[var(--color-danger-700)]">
          {error instanceof Error ? error.message : 'Failed to load party.'}
        </p>
        <Button variant="secondary" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4" /> Retry
        </Button>
      </div>
    );
  }

  const defaults: Partial<CreatePartyFormValues> = {
    company_id: party.company_id,
    party_type: party.party_type,
    code: party.code,
    name: party.name,
    short_name: party.short_name,
    vat_number: party.vat_number,
    cr_number: party.cr_number,
    country_code: party.country_code,
    city: party.city,
    address: party.address,
    phone: party.phone,
    email: party.email,
    credit_limit: party.credit_limit,
    credit_days: party.credit_days,
    currency_code: party.currency_code,
    salesperson_id: party.salesperson_id,
    portal_access: party.portal_access,
    marketing_subscription: party.marketing_subscription,
    iata_code: party.iata_code,
    scac_code: party.scac_code,
    tags: party.tags,
    notes: party.notes,
    is_active: party.is_active,
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <button
        type="button"
        onClick={() => navigate(`/parties/${id}`)}
        className="text-xs font-medium text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)]"
      >
        ← Back to party
      </button>
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">Edit party</h2>
        <p className="text-sm text-[var(--color-neutral-400)] mt-0.5">{party.name}</p>
      </div>
      {formError && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border px-4 py-3 text-sm"
          style={{
            background: 'var(--color-danger-100)',
            borderColor: '#FECACA',
            color: 'var(--color-danger-700)',
          }}
        >
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{formError}</span>
        </div>
      )}
      <PartyForm
        mode="edit"
        defaultValues={defaults}
        isSubmitting={updateParty.isPending}
        onCancel={() => navigate(`/parties/${id}`)}
        onSubmit={async (values) => {
          setFormError(null);
          try {
            await updateParty.mutateAsync(values as UpdatePartyFormValues);
            navigate(`/parties/${id}`);
          } catch (err) {
            setFormError(getErrorMessage(err));
          }
        }}
      />
    </div>
  );
}
