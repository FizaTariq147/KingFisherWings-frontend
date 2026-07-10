import type { ReactNode } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { TenantStatusBadge } from '../TenantStatusBadge';
import type { Tenant } from '../../types/tenant.types';
import { formatTenantSlug } from '../../utils/formatTenantSlug';

interface TenantOverviewPanelProps {
  tenant: Tenant;
}

export function TenantOverviewPanel({ tenant }: TenantOverviewPanelProps) {
  const isDeleted = !!tenant.deleted_at;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="mb-0 pb-3">
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <dl className="space-y-0">
          <DetailRow label="Tenant code" value={tenant.code} mono />
          <DetailRow label="Workspace slug" value={formatTenantSlug(tenant.slug)} mono />
          <DetailRow label="Login tip" value="Use this slug + the temporary password from create" />
          <DetailRow label="Legal name" value={tenant.name} />
          <DetailRow label="Display name" value={tenant.display_name} />
          <DetailRow label="Company code" value={tenant.company_code} mono />
          <DetailRow label="Company name" value={tenant.company_name} />
          <DetailRow label="Company legal name" value={tenant.company_legal_name || '—'} />
          <DetailRow
            label="Company registration no."
            value={tenant.company_registration_number || '—'}
          />
          <DetailRow label="Lifecycle status">
            <TenantStatusBadge tenant={tenant} />
          </DetailRow>
          <DetailRow label="Created" value={formatDate(tenant.created_at)} />
          <DetailRow label="Last updated" value={formatDate(tenant.updated_at)} />
          {isDeleted && tenant.deleted_at && (
            <DetailRow label="Deleted at" value={formatDate(tenant.deleted_at)} />
          )}
        </dl>
      </Card>

      <Card>
        <CardHeader className="mb-0 pb-3">
          <CardTitle>Company & Contact</CardTitle>
        </CardHeader>
        <dl className="space-y-0">
          <DetailRow label="Admin email" value={tenant.email} />
          <DetailRow label="Phone" value={tenant.phone} />
          <DetailRow label="Address" value={tenant.address} />
          <DetailRow label="City" value={tenant.city} />
          <DetailRow label="Country" value={tenant.country_code} />
          <DetailRow label="Website" value={tenant.website || '—'} />
          <DetailRow label="Custom domain" value={tenant.domain || '—'} />
          <DetailRow label="VAT / TRN" value={tenant.vat_number || '—'} />
          <DetailRow label="CR number" value={tenant.cr_number || '—'} />
        </dl>
      </Card>

      <Card>
        <CardHeader className="mb-0 pb-3">
          <CardTitle>Regional & Branding</CardTitle>
        </CardHeader>
        <dl className="space-y-0">
          <DetailRow label="Language" value={tenant.language} />
          <DetailRow label="Base currency" value={tenant.base_currency} />
          <DetailRow label="Timezone" value={tenant.timezone} />
          <DetailRow label="Financial year start" value={`Month ${tenant.financial_year_start}`} />
          <DetailRow label="Brand color">
            <span className="inline-flex items-center gap-2">
              <span
                className="inline-block h-4 w-4 rounded border border-[var(--color-neutral-200)]"
                style={{ backgroundColor: tenant.primary_color }}
              />
              <span className="font-mono text-xs">{tenant.primary_color}</span>
            </span>
          </DetailRow>
          <DetailRow label="Logo">
            {tenant.logo_url ? (
              <a
                href={tenant.logo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-primary-600)] hover:underline text-sm truncate max-w-[200px] inline-block"
              >
                {tenant.logo_url}
              </a>
            ) : (
              '—'
            )}
          </DetailRow>
        </dl>
      </Card>

      <Card>
        <CardHeader className="mb-0 pb-3">
          <CardTitle>Subscription & Limits</CardTitle>
        </CardHeader>
        <dl className="space-y-0">
          <DetailRow label="Plan" value={capitalize(String(tenant.subscription_plan))} />
          <DetailRow label="Subscription status" value={capitalize(String(tenant.status))} />
          <DetailRow label="Trial ends" value={formatDate(tenant.trial_ends)} />
          <DetailRow label="Subscription ends" value={formatDate(tenant.subscription_ends)} />
          <DetailRow
            label="Total users"
            value={
              typeof tenant.total_users === 'number' ? String(tenant.total_users) : '—'
            }
          />
          <DetailRow label="Max users" value={String(tenant.max_users)} />
          <DetailRow
            label="Total branches"
            value={
              typeof tenant.total_branches === 'number' ? String(tenant.total_branches) : '—'
            }
          />
          <DetailRow label="Branch limit" value={String(tenant.max_branches)} />
          <DetailRow
            label="Storage usage"
            value={
              typeof tenant.storage_used_gb === 'number'
                ? `${tenant.storage_used_gb} / ${tenant.max_storage_gb} GB`
                : `0 / ${tenant.max_storage_gb} GB`
            }
          />
          <DetailRow label="Storage limit" value={`${tenant.max_storage_gb} GB`} />
          <DetailRow label="Tenant status" value={tenant.is_active ? 'Active' : 'Inactive'} />
          <DetailRow label="Active flag" value={tenant.is_active ? 'Yes' : 'No'} />
        </dl>
      </Card>
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono,
  children,
}: {
  label: string;
  value?: string;
  mono?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[var(--color-neutral-100)] py-2.5 last:border-0">
      <dt className="text-sm text-[var(--color-neutral-500)] shrink-0">{label}</dt>
      <dd
        className={`text-sm font-medium text-[var(--color-neutral-800)] text-right ${
          mono ? 'font-mono text-xs' : ''
        }`}
      >
        {children ?? value ?? '—'}
      </dd>
    </div>
  );
}

function formatDate(value?: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
}

function capitalize(s: string): string {
  if (!s) return '—';
  return s.charAt(0).toUpperCase() + s.slice(1);
}
