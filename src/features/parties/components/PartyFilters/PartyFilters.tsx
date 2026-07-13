import {
  CREDIT_STATUSES,
  CREDIT_STATUS_LABELS,
  PARTY_TYPES,
  PARTY_TYPE_LABELS,
  type CreditStatus,
  type PartyType,
} from '../../constants/party.constants';
import type { TenantCompanyOption } from '@/features/users/hooks/useTenantCompanies';

interface PartyFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  partyType: PartyType | 'all';
  onPartyTypeChange: (value: PartyType | 'all') => void;
  creditStatus: CreditStatus | 'all';
  onCreditStatusChange: (value: CreditStatus | 'all') => void;
  companyId: string;
  onCompanyIdChange: (value: string) => void;
  companies: TenantCompanyOption[];
  order: 'asc' | 'desc';
  onOrderChange: (value: 'asc' | 'desc') => void;
}

export function PartyFilters({
  search,
  onSearchChange,
  partyType,
  onPartyTypeChange,
  creditStatus,
  onCreditStatusChange,
  companyId,
  onCompanyIdChange,
  companies,
  order,
  onOrderChange,
}: PartyFiltersProps) {
  const selectClass =
    'h-9 rounded-md border border-[var(--color-neutral-200)] bg-white px-3 text-sm text-[var(--color-neutral-800)] focus:outline-none focus:border-[var(--color-primary-500)]';

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
      <input
        type="search"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search code, name, email…"
        aria-label="Search parties"
        className="h-9 w-full lg:w-72 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm text-[var(--color-neutral-800)] placeholder:text-[var(--color-neutral-400)] focus:outline-none focus:border-[var(--color-primary-500)]"
      />

      <select
        value={partyType}
        onChange={(e) => onPartyTypeChange(e.target.value as PartyType | 'all')}
        aria-label="Filter by party type"
        className={selectClass}
      >
        <option value="all">All types</option>
        {PARTY_TYPES.map((t) => (
          <option key={t} value={t}>
            {PARTY_TYPE_LABELS[t]}
          </option>
        ))}
      </select>

      <select
        value={creditStatus}
        onChange={(e) => onCreditStatusChange(e.target.value as CreditStatus | 'all')}
        aria-label="Filter by credit status"
        className={selectClass}
      >
        <option value="all">All credit statuses</option>
        {CREDIT_STATUSES.map((s) => (
          <option key={s} value={s}>
            {CREDIT_STATUS_LABELS[s]}
          </option>
        ))}
      </select>

      <select
        value={companyId}
        onChange={(e) => onCompanyIdChange(e.target.value)}
        aria-label="Filter by company"
        className={selectClass}
      >
        <option value="">All companies</option>
        {companies.map((c) => (
          <option key={c.id} value={c.id}>
            {c.code ? `${c.name} (${c.code})` : c.name}
          </option>
        ))}
      </select>

      <select
        value={order}
        onChange={(e) => onOrderChange(e.target.value as 'asc' | 'desc')}
        aria-label="Sort order"
        className={selectClass}
      >
        <option value="asc">Name A→Z</option>
        <option value="desc">Name Z→A</option>
      </select>
    </div>
  );
}
