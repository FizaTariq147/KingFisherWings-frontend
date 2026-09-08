import { PARTY_TYPES, PARTY_TYPE_LABELS, type PartyType } from '../../constants/party.constants';
import { PARTY_TYPE_CARD_STYLES } from '../../constants/partyWizard.constants';

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
  return (
    <div className="space-y-4">
      <h3 className="text-center text-base font-semibold text-[var(--color-neutral-800)] sm:text-lg">
        {heading}
      </h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {PARTY_TYPES.map((partyType) => {
          const style = PARTY_TYPE_CARD_STYLES[partyType];
          const Icon = style.icon;
          const selected = value === partyType;
          return (
            <button
              key={partyType}
              type="button"
              onClick={() => onChange(partyType)}
              aria-pressed={selected}
              className={[
                'flex items-center justify-between gap-3 rounded-lg border bg-white px-4 py-3 text-left transition-colors',
                selected
                  ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50,#eff6ff)] ring-1 ring-[var(--color-primary-500)]'
                  : `border-[var(--color-neutral-200)] ${style.hoverClass}`,
              ].join(' ')}
            >
              <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-neutral-800)]">
                {PARTY_TYPE_LABELS[partyType]}
              </span>
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white ${style.circleClass}`}
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
