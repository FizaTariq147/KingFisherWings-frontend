import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { CountrySelect } from '@/components/ui/CountrySelect';
import { authService } from '@/features/auth/services/auth.service';
import { bootstrapLocaleSession } from '@/features/locale/bootstrap/localeBootstrap';
import { getServerErrorMessage } from '@/lib/validation';
import { useAuthStore } from '@/store/authStore';

function pickPreferredCountry(me: Record<string, unknown>): string {
  const raw = me.preferred_country_code ?? me.preferredCountryCode;
  return raw == null ? '' : String(raw).trim().toUpperCase();
}

export default function MyProfilePage() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [country, setCountry] = useState('');
  const [initial, setInitial] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['auth', 'me', 'profile'],
    queryFn: () => authService.me(),
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!data) return;
    const cc = pickPreferredCountry(data as Record<string, unknown>);
    setCountry(cc);
    setInitial(cc);
  }, [data]);

  const dirty = country !== initial;

  const onSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await authService.updateMe({ preferred_country_code: country || null });
      setInitial(country);
      setSuccess(true);
      bootstrapLocaleSession(country || null);
      await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      window.setTimeout(() => setSuccess(false), 2500);
    } catch (err) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 404 || status === 405) {
        setError(
          'Updating profile preferences is not available on this Auth API (PATCH /auth/me missing).',
        );
      } else {
        setError(getServerErrorMessage(err));
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-lg font-semibold text-[var(--color-neutral-900)]">My profile</h1>
          <p className="text-sm text-[var(--color-neutral-500)]">
            Account from GET /auth/me. Locale preference uses PATCH /auth/me when the API supports it
            (not listed in Auth OpenAPI — save may fail until backend adds it).
          </p>
        </div>
        <div className="flex items-center gap-2">
          {success && <Badge variant="success">Saved</Badge>}
          <Button type="button" variant="secondary" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
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

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-[var(--color-neutral-500)]">Name</p>
              <p className="font-medium text-[var(--color-neutral-800)]">{user?.name ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--color-neutral-500)]">Email</p>
              <p className="font-medium text-[var(--color-neutral-800)]">{user?.email ?? '—'}</p>
            </div>
          </div>

          {isLoading ? (
            <p className="text-sm text-[var(--color-neutral-400)]">Loading preferences…</p>
          ) : (
            <CountrySelect
              label="Preferred country"
              allowEmpty
              name="preferred_country_code"
              value={country}
              hint="Optional and clearable — when unset, phone accepts any valid international number (+…)"
              onChange={setCountry}
            />
          )}

          <div className="flex justify-end">
            <Button type="button" disabled={!dirty || saving} onClick={onSave}>
              {saving ? 'Saving…' : 'Save preference'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
