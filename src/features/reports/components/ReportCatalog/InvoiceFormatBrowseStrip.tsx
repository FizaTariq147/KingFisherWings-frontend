import { listInvoiceFormatPreviews } from '../../data/invoiceFormatPreviews';
import { invoiceV2BadgeText } from '../../engine/invoiceV2Codes';
import { invoiceV2ListRank, invoiceV2ApplicabilityHint, type InvoiceFitInput } from '../../engine/invoiceV2Applicability';
import { resolveCatalogFormatStatus } from '../../utils/catalogFormatStatus';
import { reportConformanceStatus } from '../../utils/reportConformanceStatus';
import { filterCatalogStripRows } from '../../utils/filterCatalogStripRows';
import { FresaCatalogSection, FresaFormatCard } from './FresaCatalogSection';

type InvoiceFormatBrowseStripProps = {
  selectedCode?: string;
  onSelect: (code: string) => void;
  visible: boolean;
  searchQuery?: string;
  allowedCodes?: ReadonlySet<string> | null;
  invoiceCurrency?: InvoiceFitInput;
};

/** Invoice Formats — https://fresatechnologies.com/sample-report-formats/ */
export function InvoiceFormatBrowseStrip({
  selectedCode,
  onSelect,
  visible,
  searchQuery = '',
  allowedCodes = null,
  invoiceCurrency = null,
}: InvoiceFormatBrowseStripProps) {
  if (!visible) return null;

  const all = listInvoiceFormatPreviews()
    .slice()
    .sort((a, b) => invoiceV2ListRank(a.code, invoiceCurrency) - invoiceV2ListRank(b.code, invoiceCurrency) || a.formatNumber - b.formatNumber);
  const { items, scopedTotal, filterActive } = filterCatalogStripRows(all, {
    searchQuery,
    allowedCodes,
    selectedCode,
    toSearchable: (row) => ({
      name: row.name,
      code: row.code,
      formatNumber: row.formatNumber,
      kind: 'invoice',
    }),
  });

  return (
    <FresaCatalogSection
      section="invoice"
      countLabel={
        filterActive
          ? `${items.length} of ${scopedTotal} formats`
          : `${all.length} formats`
      }
      empty={items.length === 0}
      emptyMessage="No Invoice formats match the current filters."
    >
      {items.map((row, i) => (
        <FresaFormatCard
          key={row.code}
          active={selectedCode === row.code}
          index={row.formatNumber - 1 || i}
          badge={`#${row.formatNumber}`}
          name={row.name}
          status={resolveCatalogFormatStatus(row.code)}
          sharedHint={
            [
              invoiceV2ListRank(row.code, invoiceCurrency) < 2 ? invoiceV2BadgeText(reportConformanceStatus(row.code)) : null,
              invoiceV2ApplicabilityHint(row.code, invoiceCurrency),
            ].filter(Boolean).join(' · ') || null
          }
          onClick={() => onSelect(row.code)}
        />
      ))}
    </FresaCatalogSection>
  );
}
