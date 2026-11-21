import { Button } from '@/components/ui/Button';
import type { ReportTemplate } from '../../types/reportCatalog.types';
import type { ReportContextIds } from '../../utils/reportParameterUtils';
import {
  catalogStripStatusLabel,
  type CatalogStripRow,
} from '../../utils/partitionCatalogStrips';
import { CatalogOurThumbnail } from './CatalogOurThumbnail';
import { isCatalogBrowseReferenceEnabled } from '../../utils/catalogBrowseReferenceFlag';

type CatalogFormatRowProps = {
  row: CatalogStripRow;
  selected?: boolean;
  context?: ReportContextIds | null;
  thumbActive?: boolean;
  onPreview: (template: ReportTemplate) => void;
  onGenerate: (template: ReportTemplate) => void;
  onBrowseReference?: (template: ReportTemplate) => void;
  /** One-line unsuitable reason (Not suitable section). */
  showUnsuitableReason?: boolean;
};

/**
 * Single-column catalogue row: thumbnail, name, family tag, one status chip,
 * Preview (primary) + Generate (secondary). Code in small grey text.
 */
export function CatalogFormatRow({
  row,
  selected = false,
  context,
  thumbActive = true,
  onPreview,
  onGenerate,
  onBrowseReference,
  showUnsuitableReason = false,
}: CatalogFormatRowProps) {
  const { template, familyLabel, statusChip, unsuitableReason } = row;
  const showBrowse = isCatalogBrowseReferenceEnabled() && onBrowseReference;

  return (
    <div
      data-testid="catalog-format-row"
      data-code={template.code}
      className={[
        'flex gap-3 border-b border-[var(--color-neutral-100)] px-3 py-3 sm:px-4',
        selected ? 'bg-[var(--color-primary-50)]' : 'bg-white',
      ].join(' ')}
    >
      <CatalogOurThumbnail code={template.code} context={context} active={thumbActive} />

      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold leading-snug text-[var(--color-neutral-900)]">
            {template.name}
          </p>
          <span className="rounded border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[var(--color-neutral-600)]">
            {familyLabel}
          </span>
          <span
            data-testid="catalog-status-chip"
            className={[
              'rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
              statusChip === 'accepted'
                ? 'bg-[var(--color-success-50)] text-[var(--color-success-700)]'
                : 'bg-[var(--color-warning-50)] text-[var(--color-warning-800)]',
            ].join(' ')}
          >
            {statusChip === 'accepted' ? 'Accepted' : 'Approximate'}
          </span>
        </div>

        <p className="font-mono text-[11px] text-[var(--color-neutral-400)]">{template.code}</p>

        {showUnsuitableReason && unsuitableReason ? (
          <p
            data-testid="catalog-unsuitable-reason"
            className="truncate text-[11px] text-[var(--color-warning-800)]"
            title={unsuitableReason}
          >
            {unsuitableReason}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          <Button type="button" size="sm" variant="primary" onClick={() => onPreview(template)}>
            Preview
          </Button>
          <Button type="button" size="sm" variant="secondary" onClick={() => onGenerate(template)}>
            Generate
          </Button>
          {showBrowse ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => onBrowseReference?.(template)}
            >
              Browse reference
            </Button>
          ) : null}
        </div>

        {/* Keep status wording available for a11y without a second badge line */}
        <span className="sr-only">{catalogStripStatusLabel(statusChip)}</span>
      </div>
    </div>
  );
}
