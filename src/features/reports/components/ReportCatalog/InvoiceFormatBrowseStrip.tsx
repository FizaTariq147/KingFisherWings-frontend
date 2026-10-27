import { listInvoiceFormatPreviews } from '../../data/invoiceFormatPreviews';
import { filterCatalogStripRows } from '../../utils/filterCatalogStripRows';
import { FresaCatalogSection, FresaFormatCard } from './FresaCatalogSection';

type InvoiceFormatBrowseStripProps = {
  selectedCode?: string;
  onSelect: (code: string) => void;
  visible: boolean;
  searchQuery?: string;
  allowedCodes?: ReadonlySet<string> | null;
};

/** Invoice Formats — https://fresatechnologies.com/sample-report-formats/ */
export function InvoiceFormatBrowseStrip({
  selectedCode,
  onSelect,
  visible,
  searchQuery = '',
  allowedCodes = null,
}: InvoiceFormatBrowseStripProps) {
  if (!visible) return null;

  const all = listInvoiceFormatPreviews()
    .slice()
    .sort((a, b) => a.formatNumber - b.formatNumber);
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
          : `${all.length} distinct Fresa layouts`
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
          onClick={() => onSelect(row.code)}
        />
      ))}
    </FresaCatalogSection>
  );
}
