import { Briefcase } from 'lucide-react';
import { usePartyTypes } from '../../hooks/useParties';
import { PARTY_TYPE_LABELS, type PartyType } from '../../constants/party.constants';
import { PARTY_TYPE_CARD_STYLES } from '../../constants/partyWizard.constants';
import { resolvePartyTypeOptions } from '../../utils/resolvePartyTypeOptions';

type PartyTypeSelectGridProps = {
  value?: string;
  onChange: (partyType: PartyType) => void;
  error?: string;
  heading?: string;
};

export function PartyTypeSelectGrid({
  value,
  onChange,
  error,
  heading = 'What type of Party would you like to create?',
}: PartyTypeSelectGridProps) {
  const typesQuery = usePartyTypes(true);
  const options = resolvePartyTypeOptions(typesQuery.data);

  return (
    <div className="space-y-4">
      <h3 className="text-center text-base font-semibold text-[var(--color-neutral-800)] sm:text-lg">
        {heading}
      </h3>
      {typesQuery.isLoading ? (
        <p className="text-center text-xs text-[var(--color-neutral-500)]">Loading party types…</p>
      ) : null}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {options.map(({ code, label }) => {
          const style = PARTY_TYPE_CARD_STYLES[code as PartyType];
          const Icon = style?.icon ?? Briefcase;
          const selected = value === code;
          return (
            <button
              key={code}
              type="button"
              onClick={() => onChange(code as PartyType)}
              aria-pressed={selected}
              className={[
                'flex items-center justify-between gap-3 rounded-lg border bg-white px-4 py-3 text-left transition-colors',
                selected
                  ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50,#eff6ff)] ring-1 ring-[var(--color-primary-500)]'
                  : `border-[var(--color-neutral-200)] ${style?.hoverClass ?? 'hover:bg-neutral-50'}`,
              ].join(' ')}
            >
              <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-neutral-800)]">
                {label || PARTY_TYPE_LABELS[code as PartyType] || code}
              </span>
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white ${style?.circleClass ?? 'bg-neutral-500'}`}
                aria-hidden
              >
                <Icon className="h-4 w-4" />
              </span>
            </button>
          );
        })}
      </div>
      {error ? (
        <p className="text-center text-xs text-[var(--color-danger-500)]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
