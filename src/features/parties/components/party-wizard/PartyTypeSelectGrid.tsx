import { useState } from 'react';
import { Briefcase, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getServerErrorMessage } from '@/lib/validation/mapApiErrors';
import { PARTY_TYPES, PARTY_TYPE_LABELS, type PartyType } from '../../constants/party.constants';
import { PARTY_TYPE_CARD_STYLES } from '../../constants/partyWizard.constants';
import {
  useDeactivatePartyType,
  usePartyTypeCatalog,
} from '../../hooks/useParties';
import { resolvePartyTypeOptions } from '../../utils/resolvePartyTypeOptions';
import { AddPartyTypeModal } from '../AddPartyTypeModal';

type PartyTypeSelectGridProps = {
  value?: string;
  onChange: (partyType: string) => void;
  error?: string;
  heading?: string;
};

function canDeactivate(option: {
  id?: string;
  code: string;
  is_system?: boolean;
}): boolean {
  if (!option.id) return false;
  if (option.is_system === true) return false;
  if ((PARTY_TYPES as readonly string[]).includes(option.code)) return false;
  return true;
}

export function PartyTypeSelectGrid({
  value,
  onChange,
  error,
  heading = 'What type of Party would you like to create?',
}: PartyTypeSelectGridProps) {
  const catalogQuery = usePartyTypeCatalog(true);
  const deactivate = useDeactivatePartyType();
  const options = resolvePartyTypeOptions(catalogQuery.data);
  const [addOpen, setAddOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const onDeactivate = async (id: string, code: string) => {
    setActionError(null);
    try {
      await deactivate.mutateAsync(id);
      if (value === code) onChange('CUSTOMER');
    } catch (err) {
      setActionError(getServerErrorMessage(err) || 'Could not deactivate party type.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
        <h3 className="text-center text-base font-semibold text-[var(--color-neutral-800)] sm:text-lg">
          {heading}
        </h3>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="shrink-0 gap-1"
          onClick={() => setAddOpen(true)}
        >
          <Plus className="h-3.5 w-3.5" aria-hidden />
          Add type
        </Button>
      </div>
      {catalogQuery.isLoading ? (
        <p className="text-center text-xs text-[var(--color-neutral-500)]">Loading party types…</p>
      ) : null}
      {actionError ? (
        <p className="text-center text-xs text-[var(--color-danger-500)]" role="alert">
          {actionError}
        </p>
      ) : null}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {options.map((option) => {
          const { code, label } = option;
          const style = PARTY_TYPE_CARD_STYLES[code as PartyType];
          const Icon = style?.icon ?? Briefcase;
          const selected = value === code;
          const showDeactivate = canDeactivate(option);
          return (
            <div key={code} className="relative">
              <button
                type="button"
                onClick={() => onChange(code)}
                aria-pressed={selected}
                className={[
                  'flex w-full items-center justify-between gap-3 rounded-lg border bg-white px-4 py-3 text-left transition-colors',
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
              {showDeactivate ? (
                <button
                  type="button"
                  title="Deactivate custom type"
                  aria-label={`Deactivate ${label}`}
                  disabled={deactivate.isPending}
                  className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-[var(--color-neutral-200)] bg-white text-[var(--color-neutral-500)] shadow-sm hover:border-[var(--color-danger-400)] hover:text-[var(--color-danger-600)]"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (option.id) void onDeactivate(option.id, code);
                  }}
                >
                  <X className="h-3 w-3" aria-hidden />
                </button>
              ) : null}
            </div>
          );
        })}
      </div>
      {error ? (
        <p className="text-center text-xs text-[var(--color-danger-500)]" role="alert">
          {error}
        </p>
      ) : null}
      <AddPartyTypeModal
        open={addOpen}
        nested={false}
        onClose={() => setAddOpen(false)}
        onCreated={(code) => onChange(code)}
      />
    </div>
  );
}
