import {
  catalogFormatStatusTone,
  type CatalogFormatStatus,
  type CatalogFormatStatusId,
} from '../../utils/catalogFormatStatus';

type Props = {
  status: CatalogFormatStatus;
  className?: string;
  /** Compact for cards */
  size?: 'sm' | 'md';
};

export function FormatStatusBadge({ status, className = '', size = 'sm' }: Props) {
  const tone = catalogFormatStatusTone(status.id);
  return (
    <span
      title={status.detail}
      className={[
        'inline-flex max-w-full items-center rounded border font-semibold uppercase tracking-wide',
        size === 'sm' ? 'px-1.5 py-0.5 text-[9px] leading-tight' : 'px-2 py-0.5 text-[10px]',
        tone.bg,
        tone.text,
        tone.border,
        className,
      ].join(' ')}
    >
      <span className="truncate">{status.label}</span>
    </span>
  );
}

export function formatStatusIdForTest(id: CatalogFormatStatusId): string {
  return id;
}
