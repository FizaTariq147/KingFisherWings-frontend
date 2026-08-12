import { useState } from 'react';
import { type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { useAppForm } from '@/lib/validation';
import {
  useCreatePartyPortalUser,
  usePartyPortalUsers,
  useResendPartyPortalInvite,
  useResetPartyPortalPassword,
  useUpdatePartyPortalUserStatus,
} from '../../hooks/usePartyPortal';
import { getErrorMessage } from '../../utils/getErrorMessage';

const createSchema = z.object({
  email: z.string().trim().email('Invalid email'),
  full_name: z.string().trim().min(2, 'Full name is required').max(200),
  phone: z.string().trim().max(30).optional().or(z.literal('')),
  password: z.string().min(8, 'Min 8 characters').optional().or(z.literal('')),
  send_email: z.boolean().optional(),
  invite_mode: z.boolean().optional(),
});

type CreateFormValues = z.infer<typeof createSchema>;

interface PartyPortalUsersSectionProps {
  partyId: string;
}

export function PartyPortalUsersSection({ partyId }: PartyPortalUsersSectionProps) {
  const { data: users = [], isLoading, isError, error, refetch } = usePartyPortalUsers(partyId);
  const createUser = useCreatePartyPortalUser(partyId);
  const updateStatus = useUpdatePartyPortalUserStatus(partyId);
  const resetPassword = useResetPartyPortalPassword(partyId);
  const resendInvite = useResendPartyPortalInvite(partyId);

  const [open, setOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  const form = useAppForm<CreateFormValues>({
    resolver: zodResolver(createSchema) as unknown as Resolver<CreateFormValues>,
    defaultValues: {
      email: '',
      full_name: '',
      phone: '',
      password: '',
      send_email: true,
      invite_mode: false,
    },
  });

  const close = () => {
    setOpen(false);
    setFormError(null);
    form.reset({ email: '', full_name: '', phone: '', password: '', send_email: true, invite_mode: false });
  };

  const pending =
    createUser.isPending ||
    updateStatus.isPending ||
    resetPassword.isPending ||
    resendInvite.isPending;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <div>
          <CardTitle>Users Portal</CardTitle>
          <p className="text-xs text-[var(--color-neutral-400)] mt-1 font-normal">
            Available for every party type. Does not change party type.
          </p>
        </div>
        <Button type="button" size="sm" onClick={() => setOpen(true)}>
          Create portal login
        </Button>
      </CardHeader>

      <div className="p-4 pt-0 space-y-3">
        {tempPassword && (
          <div
            role="status"
            className="rounded-md border border-[var(--color-secondary-100)] bg-[var(--color-secondary-100)] px-3 py-2 text-sm text-[var(--color-neutral-800)]"
          >
            Temporary password (share once):{' '}
            <span className="font-mono font-semibold">{tempPassword}</span>
            <button
              type="button"
              className="ml-3 text-xs underline text-[var(--color-primary)]"
              onClick={() => void navigator.clipboard.writeText(tempPassword)}
            >
              Copy
            </button>
            <button
              type="button"
              className="ml-2 text-xs text-[var(--color-neutral-500)]"
              onClick={() => setTempPassword(null)}
            >
              Dismiss
            </button>
          </div>
        )}

        {isLoading ? (
          <p className="text-sm text-[var(--color-neutral-400)]">Loading portal users…</p>
        ) : isError ? (
          <div className="space-y-2">
            <p className="text-sm text-[var(--color-danger-600)]">
              {getErrorMessage(error) || 'Failed to load portal users.'}
            </p>
            <Button type="button" size="sm" variant="secondary" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : users.length === 0 ? (
          <p className="text-sm text-[var(--color-neutral-400)]">
            No portal users yet. Create a login for the Customer Portal.
          </p>
        ) : (
          users.map((user) => {
            const active = String(user.status).toUpperCase() === 'ACTIVE';
            return (
              <div
                key={user.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-md border border-[var(--color-neutral-200)] px-3 py-2"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[var(--color-neutral-800)] truncate">
                      {user.fullName}
                    </span>
                    <Badge variant={active ? 'success' : 'neutral'}>{user.status}</Badge>
                  </div>
                  <div className="text-xs text-[var(--color-neutral-500)] truncate">
                    {[user.email, user.phone].filter(Boolean).join(' · ')}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={pending}
                    onClick={async () => {
                      try {
                        await updateStatus.mutateAsync({
                          id: user.id,
                          status: active ? 'DISABLED' : 'ACTIVE',
                        });
                      } catch (err) {
                        window.alert(getErrorMessage(err) || 'Status update failed.');
                      }
                    }}
                  >
                    {active ? 'Disable' : 'Enable'}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={pending}
                    onClick={async () => {
                      if (!window.confirm(`Reset password for ${user.email}?`)) return;
                      try {
                        const result = await resetPassword.mutateAsync({
                          id: user.id,
                          dto: { send_email: true },
                        });
                        if (result.temporaryPassword) {
                          setTempPassword(result.temporaryPassword);
                        } else {
                          window.alert(result.message || 'Password reset. Check email if SMTP is configured.');
                        }
                      } catch (err) {
                        window.alert(getErrorMessage(err) || 'Password reset failed.');
                      }
                    }}
                  >
                    Reset password
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={pending}
                    onClick={async () => {
                      try {
                        const result = await resendInvite.mutateAsync(user.id);
                        window.alert(result.message || 'Invite resent.');
                      } catch (err) {
                        window.alert(getErrorMessage(err) || 'Could not resend invite.');
                      }
                    }}
                  >
                    Resend invite
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <Modal open={open} onClose={close} title="Create portal login">
        <form
          className="space-y-3"
          noValidate
          onSubmit={form.handleSubmit(async (values) => {
            setFormError(null);
            try {
              const result = await createUser.mutateAsync({
                email: values.email.trim().toLowerCase(),
                full_name: values.full_name.trim(),
                phone: values.phone?.trim() || undefined,
                password: values.password?.trim() || undefined,
                send_email: values.send_email ?? true,
                invite_mode: values.invite_mode ?? false,
              });
              if (result.temporaryPassword) setTempPassword(result.temporaryPassword);
              close();
            } catch (err) {
              setFormError(
                getErrorMessage(err) ||
                  'Could not create portal user. Tenant Admin / authorized staff required.',
              );
            }
          })}
        >
          {formError && (
            <p role="alert" className="text-sm text-[var(--color-danger-600)]">
              {formError}
            </p>
          )}
          <Input label="Email" error={form.formState.errors.email?.message} {...form.register('email')} />
          <Input
            label="Full name"
            error={form.formState.errors.full_name?.message}
            {...form.register('full_name')}
          />
          <Input label="Phone (optional)" {...form.register('phone')} />
          <Input
            label="Password (optional)"
            type="password"
            hint="Leave blank to auto-generate a temporary password."
            error={form.formState.errors.password?.message}
            {...form.register('password')}
          />
          <label className="flex items-center gap-2 text-sm text-[var(--color-neutral-700)]">
            <input type="checkbox" {...form.register('invite_mode')} />
            Invite mode (email accept-invite link instead of temporary password)
          </label>
          <label className="flex items-center gap-2 text-sm text-[var(--color-neutral-700)]">
            <input type="checkbox" {...form.register('send_email')} />
            Send credentials email when SMTP is configured
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" disabled={createUser.isPending}>
              {createUser.isPending ? 'Creating…' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </Card>
  );
}
