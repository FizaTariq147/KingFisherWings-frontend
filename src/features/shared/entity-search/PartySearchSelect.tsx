import { useMemo, useState } from 'react';
import { SearchableSelect } from '@/features/masters/components/SearchableSelect';
import { useParties } from '@/features/parties/hooks/useParties';
import type { PartyType } from '@/features/parties/constants/party.constants';
import { isUuid } from '@/lib/isUuid';

interface PartySearchSelectProps {
  name?: string;
  label?: string;
  value: string;
  onChange: (partyId: string) => void;
  partyType?: PartyType;
  required?: boolean;
  error?: string;
  placeholder?: string;
}

/**
 * Party picker by name/code — stores party UUID, displays name.
 */
export function PartySearchSelect({
  name = 'party_id',
  label = 'Party',
  value,
  onChange,
  partyType,
  required,
  error,
  placeholder = 'Search by party name…',
}: PartySearchSelectProps) {
  const [search, setSearch] = useState('');
  const { data } = useParties({
    page: 1,
    limit: 50,
    search: search.trim() || undefined,
    party_type: partyType,
    order: 'asc',
  });

  const options = useMemo(() => {
    return (data?.parties ?? [])
      .filter((p) => isUuid(p.id))
      .map((p) => {
        const nameText = String(p.name ?? '').trim();
        const code = String(p.code ?? '').trim();
        const labelText =
          nameText && code && !nameText.includes(code)
            ? `${nameText} (${code})`
            : nameText || code || 'Party';
        return { value: p.id, label: labelText };
      })
      .filter((o) => o.label && o.label !== 'Party');
  }, [data?.parties]);

  return (
    <SearchableSelect
      name={name}
      label={label}
      value={value}
      options={options}
      onChange={onChange}
      onQueryChange={setSearch}
      required={required}
      error={error}
      placeholder={placeholder}
      emptyMessage="No parties found"
      allowManualUuid={false}
    />
  );
}
