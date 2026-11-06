import { useMemo, useState } from 'react';
import { SearchableSelect } from '@/features/masters/components/SearchableSelect';
import { useParties, useParty } from '@/features/parties/hooks/useParties';
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

function partyOptionLabel(name?: string | null, code?: string | null): string {
  const nameText = String(name ?? '').trim();
  const codeText = String(code ?? '').trim();
  if (nameText && codeText && !nameText.includes(codeText)) {
    return `${nameText} (${codeText})`;
  }
  return nameText || codeText || 'Party';
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
  const { data: selectedParty } = useParty(isUuid(value) ? value : '');

  const options = useMemo(() => {
    const fromList = (data?.parties ?? [])
      .filter((p) => isUuid(p.id))
      .map((p) => ({
        value: p.id,
        label: partyOptionLabel(p.name, p.code),
      }))
      .filter((o) => o.label && o.label !== 'Party');

    if (
      selectedParty &&
      isUuid(selectedParty.id) &&
      !fromList.some((o) => o.value === selectedParty.id)
    ) {
      return [
        {
          value: selectedParty.id,
          label: partyOptionLabel(selectedParty.name, selectedParty.code),
        },
        ...fromList,
      ];
    }
    return fromList;
  }, [data?.parties, selectedParty]);

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
