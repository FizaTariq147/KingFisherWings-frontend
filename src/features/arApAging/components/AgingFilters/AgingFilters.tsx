import { Input } from '@/components/ui/Input';
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
    partyId.trim() && !isUuid(partyId.trim()) ? 'Enter a valid party UUID' : undefined;
  const companyError =
    companyId.trim() && !isUuid(companyId.trim()) ? 'Enter a valid company UUID' : undefined;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <Input
        label="As-of date"
        type="date"
        value={asOf}
        onChange={(e) => onAsOfChange(e.target.value)}
      />
      <Input
        label="Party ID (optional)"
        placeholder="UUID"
        value={partyId}
        onChange={(e) => onPartyIdChange(e.target.value)}
        error={partyError}
      />
      <Input
        label="Company ID (optional)"
        placeholder="UUID"
        value={companyId}
        onChange={(e) => onCompanyIdChange(e.target.value)}
        error={companyError}
      />
    </div>
  );
}
