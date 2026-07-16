import { useState } from 'react';
import { type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { getServerErrorMessage, useAppForm } from '@/lib/validation';
import { createPartyContactSchema } from '../../schemas/party.schema';
import type { CreatePartyContactFormValues, PartyContact } from '../../types/party.types';
import { usePartyContactMutations } from '../../hooks/useParties';

interface PartyContactsSectionProps {
  partyId: string;
  contacts: PartyContact[];
}

export function PartyContactsSection({ partyId, contacts }: PartyContactsSectionProps) {
  const { add, update, remove } = usePartyContactMutations(partyId);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PartyContact | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useAppForm<CreatePartyContactFormValues>({
    resolver: zodResolver(createPartyContactSchema) as unknown as Resolver<CreatePartyContactFormValues>,
    defaultValues: { name: '', is_primary: false },
  });

  const close = () => {
    setOpen(false);
    setEditing(null);
    form.reset({ name: '', is_primary: false });
    setError(null);
  };

  const openCreate = () => {
    setEditing(null);
    form.reset({ name: '', designation: '', phone: '', mobile: '', email: '', is_primary: false });
    setOpen(true);
  };

  const openEdit = (contact: PartyContact) => {
    setEditing(contact);
    form.reset({
      name: contact.name,
      designation: contact.designation ?? '',
      phone: contact.phone ?? '',
      mobile: contact.mobile ?? '',
      email: contact.email ?? '',
      is_primary: contact.is_primary ?? false,
    });
    setOpen(true);
  };

  const pending = add.isPending || update.isPending || remove.isPending;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle>Contacts</CardTitle>
        <Button type="button" size="sm" onClick={openCreate}>
          Add contact
        </Button>
      </CardHeader>
      <div className="p-4 pt-0 space-y-2">
        {contacts.length === 0 ? (
          <p className="text-sm text-[var(--color-neutral-400)]">No contacts yet.</p>
        ) : (
          contacts.map((c) => (
            <div
              key={c.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-md border border-[var(--color-neutral-200)] px-3 py-2"
            >
              <div>
                <div className="text-sm font-medium text-[var(--color-neutral-800)]">
                  {c.name}
                  {c.is_primary ? (
                    <span className="ml-2 text-[10px] uppercase text-[var(--color-primary-600)]">
                      Primary
                    </span>
                  ) : null}
                </div>
                <div className="text-xs text-[var(--color-neutral-500)]">
                  {[c.designation, c.email, c.phone || c.mobile].filter(Boolean).join(' · ') || '—'}
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="button" size="sm" variant="secondary" onClick={() => openEdit(c)}>
                  Edit
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="danger"
                  disabled={pending}
                  onClick={async () => {
                    if (!window.confirm(`Remove contact ${c.name}?`)) return;
                    try {
                      await remove.mutateAsync(c.id);
                    } catch (err) {
                      setError(getServerErrorMessage(err));
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
        title={editing ? 'Edit contact' : 'Add contact'}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={close} disabled={pending}>
              Cancel
            </Button>
            <Button
              disabled={pending}
              onClick={form.handleValidatedSubmit(async (values) => {
                setError(null);
                try {
                  if (editing) {
                    await update.mutateAsync({ contactId: editing.id, dto: values });
                  } else {
                    await add.mutateAsync(values);
                  }
                  close();
                } catch (err) {
                  setError(getServerErrorMessage(err));
                }
              })}
            >
              {pending ? 'Saving…' : 'Save'}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Input label="Name *" {...form.register('name')} error={form.formState.errors.name?.message} />
          <Input label="Designation" {...form.register('designation')} />
          <PhoneInput
            label="Phone"
            name="phone"
            value={form.watch('phone') ?? ''}
            countryIso="AE"
            error={form.formState.errors.phone?.message}
            onChange={(v) => form.setValue('phone', v, { shouldValidate: true, shouldDirty: true })}
          />
          <PhoneInput
            label="Mobile"
            name="mobile"
            value={form.watch('mobile') ?? ''}
            countryIso="AE"
            error={form.formState.errors.mobile?.message}
            onChange={(v) => form.setValue('mobile', v, { shouldValidate: true, shouldDirty: true })}
          />
          <Input label="Email" {...form.register('email')} error={form.formState.errors.email?.message} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...form.register('is_primary')} /> Primary contact
          </label>
          {error && <p className="text-sm text-[var(--color-danger-600)]">{error}</p>}
        </div>
      </Modal>
    </Card>
  );
}
