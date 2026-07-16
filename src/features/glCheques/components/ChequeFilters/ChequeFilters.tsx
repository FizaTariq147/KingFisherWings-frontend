import { Input } from '@/components/ui/Input';
import { isUuid } from '@/lib/isUuid';
import {
  CHEQUE_STATUSES,
  CHEQUE_STATUS_LABELS,
  CHEQUE_TYPES,
  CHEQUE_TYPE_LABELS,
  type ChequeStatus,
  type ChequeType,
} from '../../constants/cheque.constants';

const selectClass =
  'h-9 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]';

interface ChequeFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  chequeType: ChequeType | 'all';
  onChequeTypeChange: (v: ChequeType | 'all') => void;
  status: ChequeStatus | 'all';
  onStatusChange: (v: ChequeStatus | 'all') => void;
  isPdc: 'all' | 'yes' | 'no';
  onIsPdcChange: (v: 'all' | 'yes' | 'no') => void;
  dueBefore: string;
  onDueBeforeChange: (v: string) => void;
  partyId: string;
  onPartyIdChange: (v: string) => void;
}

export function ChequeFilters({
  search,
  onSearchChange,
  chequeType,
  onChequeTypeChange,
  status,
  onStatusChange,
  isPdc,
  onIsPdcChange,
  dueBefore,
  onDueBeforeChange,
  partyId,
  onPartyIdChange,
}: ChequeFiltersProps) {
  const partyError =
    partyId.trim() && !isUuid(partyId.trim()) ? 'Enter a valid party UUID' : undefined;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <Input
        label="Search"
        placeholder="Cheque no, party, bank…"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <div className="space-y-1">
        <label className="text-sm font-medium text-[var(--color-neutral-700)]">Type</label>
        <select
          className={selectClass}
          value={chequeType}
          onChange={(e) => onChequeTypeChange(e.target.value as ChequeType | 'all')}
        >
          <option value="all">All types</option>
          {CHEQUE_TYPES.map((t) => (
            <option key={t} value={t}>
              {CHEQUE_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium text-[var(--color-neutral-700)]">Status</label>
        <select
          className={selectClass}
          value={status}
          onChange={(e) => onStatusChange(e.target.value as ChequeStatus | 'all')}
        >
          <option value="all">All statuses</option>
          {CHEQUE_STATUSES.map((s) => (
            <option key={s} value={s}>
              {CHEQUE_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium text-[var(--color-neutral-700)]">PDC</label>
        <select
          className={selectClass}
          value={isPdc}
          onChange={(e) => onIsPdcChange(e.target.value as 'all' | 'yes' | 'no')}
        >
          <option value="all">All</option>
          <option value="yes">PDC only</option>
          <option value="no">Non-PDC</option>
        </select>
      </div>
      <Input
        label="Due before"
        type="date"
        value={dueBefore}
        onChange={(e) => onDueBeforeChange(e.target.value)}
      />
      <Input
        label="Party ID"
        placeholder="UUID (optional)"
        value={partyId}
        onChange={(e) => onPartyIdChange(e.target.value)}
        error={partyError}
      />
    </div>
  );
}
