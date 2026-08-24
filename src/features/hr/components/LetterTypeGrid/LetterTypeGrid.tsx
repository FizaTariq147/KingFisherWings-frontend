import {
  Award,
  BadgeCheck,
  Briefcase,
  CircleDollarSign,
  FileCheck,
  FileText,
  LogOut,
  ShieldAlert,
  Stamp,
  type LucideIcon,
} from 'lucide-react';
import { LETTER_TYPE_OPTIONS, labelEnum } from '@/features/hr/constants/hr.constants';
import type { LetterType } from '@/features/hr/types/hr.types';

const LETTER_TYPE_ICONS: Record<LetterType, LucideIcon> = {
  APPOINTMENT: Briefcase,
  CONFIRMATION: BadgeCheck,
  SALARY_REVISION: CircleDollarSign,
  WARNING: ShieldAlert,
  EXPERIENCE: Award,
  EMPLOYMENT_CERT: FileCheck,
  NOC: Stamp,
  RESIGNATION_ACCEPTANCE: LogOut,
  END_OF_SERVICE: FileText,
  REFERENCE: FileText,
};

interface LetterTypeGridProps {
  selected?: LetterType | null;
  generatingType?: LetterType | null;
  disabled?: boolean;
  /** picker = choose one type; action = click card to generate */
  variant?: 'picker' | 'action';
  onSelect: (type: LetterType) => void;
}

export function LetterTypeGrid({
  selected,
  generatingType,
  disabled,
  variant = 'action',
  onSelect,
}: LetterTypeGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
      {LETTER_TYPE_OPTIONS.map(({ type, description }) => {
        const Icon = LETTER_TYPE_ICONS[type];
        const isSelected = selected === type;
        const isGenerating = generatingType === type;
        const isDisabled = disabled || (Boolean(generatingType) && !isGenerating);

        return (
          <button
            key={type}
            type="button"
            disabled={isDisabled}
            aria-pressed={isSelected}
            onClick={() => onSelect(type)}
            className={[
              'group text-left rounded-xl border p-4 transition-all duration-150',
              'focus:outline-none focus:ring-2 focus:ring-[#FF751F]/40',
              isSelected
                ? 'border-[#FF751F] bg-orange-50/60 shadow-sm'
                : 'border-gray-200 bg-white hover:border-[#FF751F] hover:shadow-sm',
              isDisabled ? 'opacity-50 cursor-not-allowed' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="text-sm font-semibold text-[#0A2942] leading-snug">
                {labelEnum(type)}
              </h3>
              <span
                className={[
                  'shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white',
                  isSelected ? 'bg-[#FF751F]' : 'bg-sky-500 group-hover:bg-[#FF751F]',
                ].join(' ')}
              >
                <Icon size={16} aria-hidden="true" />
              </span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{description}</p>
            {variant === 'action' ? (
              <p className="mt-3 text-xs font-medium text-[#0A2942]">
                {isGenerating ? 'Generating PDF…' : 'Generate PDF'}
              </p>
            ) : isSelected ? (
              <p className="mt-3 text-xs font-medium text-[#FF751F]">Selected</p>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
