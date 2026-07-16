import type { ReactNode } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { CompanyDefaultBadge, CompanyStatusBadge } from '../CompanyStatusBadge';
import type { Company } from '../../types/company.types';

interface CompanyOverviewPanelProps {
  company: Company;
}

export function CompanyOverviewPanel({ company }: CompanyOverviewPanelProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="mb-0 pb-3">
          <CardTitle>Identity</CardTitle>
        </CardHeader>
        <dl className="space-y-0">
          <DetailRow label="Code" value={company.code} mono />
          <DetailRow label="Name" value={company.name} />
          <DetailRow label="Legal name" value={company.legal_name || '—'} />
          <DetailRow label="Registration no." value={company.registration_number || '—'} />
          <DetailRow label="VAT / TRN" value={company.vat_number || '—'} />
          <DetailRow label="Status">
            <div className="flex flex-wrap gap-1.5 justify-end">
              <CompanyStatusBadge company={company} />
              <CompanyDefaultBadge isDefault={company.is_default} />
            </div>
          </DetailRow>
        </dl>
      </Card>

      <Card>
        <CardHeader className="mb-0 pb-3">
          <CardTitle>Contact & location</CardTitle>
        </CardHeader>
        <dl className="space-y-0">
          <DetailRow label="Email" value={company.email} />
          <DetailRow label="Phone" value={company.phone} />
          <DetailRow label="Address" value={company.address} />
          <DetailRow label="City" value={company.city} />
          <DetailRow label="Country" value={company.country_code} />
          {company.created_at && (
            <DetailRow label="Created" value={new Date(company.created_at).toLocaleString()} />
          )}
          {company.deleted_at && (
            <DetailRow label="Deleted" value={new Date(company.deleted_at).toLocaleString()} />
          )}
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
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-[var(--color-neutral-100)] last:border-0 text-sm">
      <dt className="text-[var(--color-neutral-500)] shrink-0">{label}</dt>
      <dd className={`text-right text-[var(--color-neutral-800)] ${mono ? 'font-mono' : ''}`}>
        {children ?? value ?? '—'}
      </dd>
    </div>
  );
}
