import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { PARTY_TYPE_LABELS } from '../../constants/party.constants';
import type { Party } from '../../types/party.types';
import { PartyCreditBadge } from '../PartyCreditBadge';
import { PartyStatusBadge } from '../PartyStatusBadge';

function Row({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-[var(--color-neutral-400)]">{label}</dt>
      <dd className="mt-0.5 text-sm text-[var(--color-neutral-800)]">{value ?? '—'}</dd>
    </div>
  );
}

interface PartyOverviewPanelProps {
  party: Party;
}

export function PartyOverviewPanel({ party }: PartyOverviewPanelProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Identity</CardTitle>
        </CardHeader>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 pt-0">
          <Row label="Code" value={<span className="font-mono text-xs">{party.code}</span>} />
          <Row label="Type" value={PARTY_TYPE_LABELS[party.party_type]} />
          <Row label="Name" value={party.name} />
          <Row label="Short name" value={party.short_name} />
          <Row label="VAT" value={party.vat_number} />
          <Row label="CR" value={party.cr_number} />
          <Row label="Status" value={<PartyStatusBadge party={party} />} />
          <Row label="Credit status" value={<PartyCreditBadge status={party.credit_status} />} />
        </dl>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Location & contact</CardTitle>
        </CardHeader>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 pt-0">
          <Row label="Country" value={party.country_code} />
          <Row label="City" value={party.city} />
          <Row label="Address" value={party.address} />
          <Row label="Phone" value={party.phone} />
          <Row label="Email" value={party.email} />
        </dl>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Credit & flags</CardTitle>
        </CardHeader>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 pt-0">
          <Row label="Credit limit" value={party.credit_limit} />
          <Row label="Credit days" value={party.credit_days} />
          <Row label="Currency" value={party.currency_code} />
          <Row label="Portal access" value={party.portal_access ? 'Yes' : 'No'} />
          <Row
            label="Marketing"
            value={party.marketing_subscription === false ? 'No' : 'Yes'}
          />
          <Row label="IATA" value={party.iata_code} />
          <Row label="SCAC" value={party.scac_code} />
          <Row label="Tags" value={party.tags?.join(', ')} />
          <Row label="Notes" value={party.notes} />
        </dl>
      </Card>
    </div>
  );
}
