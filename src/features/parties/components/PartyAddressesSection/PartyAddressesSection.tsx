import { useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { createPartyAddressSchema } from '../../schemas/party.schema';
import type { CreatePartyAddressFormValues, PartyAddress } from '../../types/party.types';
import { usePartyAddressMutations } from '../../hooks/useParties';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { loadPartyCountryOptions } from '../../utils/partyCountryOptions';

const selectClass =
  'h-9 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 text-sm';

interface PartyAddressesSectionProps {
  partyId: string;
  addresses: PartyAddress[];
}

export function PartyAddressesSection({ partyId, addresses }: PartyAddressesSectionProps) {
  const { add, update, remove } = usePartyAddressMutations(partyId);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PartyAddress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: countries = [] } = useQuery({
    queryKey: ['tenant', 'parties', 'country-options'],
    queryFn: loadPartyCountryOptions,
    staleTime: 60_000,
  });

  const form = useForm<CreatePartyAddressFormValues>({
    resolver: zodResolver(createPartyAddressSchema) as unknown as Resolver<CreatePartyAddressFormValues>,
    defaultValues: { label: '', address_line1: '', country_code: 'AE', is_default: false },
  });

  const close = () => {
    setOpen(false);
    setEditing(null);
    form.reset({ label: '', address_line1: '', country_code: 'AE', is_default: false });
    setError(null);
  };

  const openCreate = () => {
    setEditing(null);
    form.reset({
      label: 'Billing',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      postal_code: '',
      country_code: 'AE',
      is_default: false,
    });
    setOpen(true);
  };

  const openEdit = (address: PartyAddress) => {
    setEditing(address);
    form.reset({
      label: address.label,
      address_line1: address.address_line1,
      address_line2: address.address_line2 ?? '',
      city: address.city ?? '',
      state: address.state ?? '',
      postal_code: address.postal_code ?? '',
      country_code: address.country_code,
      is_default: address.is_default ?? false,
    });
    setOpen(true);
  };

  const pending = add.isPending || update.isPending || remove.isPending;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle>Addresses</CardTitle>
        <Button type="button" size="sm" onClick={openCreate}>
          Add address
        </Button>
      </CardHeader>
      <div className="p-4 pt-0 space-y-2">
        {addresses.length === 0 ? (
          <p className="text-sm text-[var(--color-neutral-400)]">No addresses yet.</p>
        ) : (
          addresses.map((a) => (
            <div
              key={a.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-md border border-[var(--color-neutral-200)] px-3 py-2"
            >
              <div>
                <div className="text-sm font-medium text-[var(--color-neutral-800)]">
                  {a.label}
                  {a.is_default ? (
                    <span className="ml-2 text-[10px] uppercase text-[var(--color-primary-600)]">
                      Default
                    </span>
                  ) : null}
                </div>
                <div className="text-xs text-[var(--color-neutral-500)]">
                  {[a.address_line1, a.city, a.country_code].filter(Boolean).join(', ')}
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="button" size="sm" variant="secondary" onClick={() => openEdit(a)}>
                  Edit
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="danger"
                  disabled={pending}
                  onClick={async () => {
                    if (!window.confirm(`Remove address ${a.label}?`)) return;
                    try {
                      await remove.mutateAsync(a.id);
                    } catch (err) {
                      setError(getErrorMessage(err));
                    }
                  }}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))
        )}
        {error && <p className="text-sm text-[var(--color-danger-600)]">{error}</p>}
      </div>

      <Modal
        open={open}
        onClose={pending ? () => {} : close}
        title={editing ? 'Edit address' : 'Add address'}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={close} disabled={pending}>
              Cancel
            </Button>
            <Button
              disabled={pending}
              onClick={form.handleSubmit(async (values) => {
                setError(null);
                try {
                  if (editing) {
                    await update.mutateAsync({ addressId: editing.id, dto: values });
                  } else {
                    await add.mutateAsync(values);
                  }
                  close();
                } catch (err) {
                  setError(getErrorMessage(err));
                }
              })}
            >
              {pending ? 'Saving…' : 'Save'}
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input label="Label *" {...form.register('label')} error={form.formState.errors.label?.message} />
          <label className="text-xs font-medium text-[var(--color-neutral-500)] space-y-1">
            Country *
            <select className={selectClass} {...form.register('country_code')}>
              {countries.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <div className="sm:col-span-2">
            <Input
              label="Address line 1 *"
              {...form.register('address_line1')}
              error={form.formState.errors.address_line1?.message}
            />
          </div>
          <div className="sm:col-span-2">
            <Input label="Address line 2" {...form.register('address_line2')} />
          </div>
          <Input label="City" {...form.register('city')} />
          <Input label="State" {...form.register('state')} />
          <Input label="Postal code" {...form.register('postal_code')} />
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input type="checkbox" {...form.register('is_default')} /> Default address
          </label>
          {error && <p className="text-sm text-[var(--color-danger-600)] sm:col-span-2">{error}</p>}
        </div>
      </Modal>
    </Card>
  );
}
