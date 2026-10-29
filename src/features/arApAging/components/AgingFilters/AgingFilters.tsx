import { Input } from '@/components/ui/Input';
import { PartySearchSelect } from '@/features/shared/entity-search';
import { isUuid } from '@/lib/isUuid';

interface AgingFiltersProps {
  asOf: string;
  onAsOfChange: (v: string) => void;
  partyId: string;
  onPartyIdChange: (v: string) => void;
  companyId: string;
  onCompanyIdChange: (v: string) => void;
}

export function AgingFilters({
  asOf,
  onAsOfChange,
  partyId,
  onPartyIdChange,
  companyId,
  onCompanyIdChange,
}: AgingFiltersProps) {
  const partyError =
    partyId.trim() && !isUuid(partyId.trim()) ? 'Select a party from the list' : undefined;
  const companyError =
    companyId.trim() && !isUuid(companyId.trim()) ? 'Enter a valid company or leave blank' : undefined;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <Input
        label="As-of date"
        type="date"
        value={asOf}
        onChange={(e) => onAsOfChange(e.target.value)}
      />
      <PartySearchSelect
        name="aging_filter_party"
        label="Party (optional)"
        value={partyId}
        onChange={onPartyIdChange}
        error={partyError}
        placeholder="Search party by name…"
      />
      <Input
        label="Company (optional)"
        placeholder="Leave blank for default"
        value={companyId}
        onChange={(e) => onCompanyIdChange(e.target.value)}
        error={companyError}
      />
    </div>
  );
}
