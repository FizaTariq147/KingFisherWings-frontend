import { listDeliveryOrderFormats } from '../../constants/deliveryOrderFormatCatalog';
import { catalogSharedLayoutHint } from '../../utils/catalogSharedLayoutHint';
import { filterCatalogStripRows } from '../../utils/filterCatalogStripRows';
import { FresaCatalogSection, FresaFormatCard } from './FresaCatalogSection';

type DeliveryOrderFormatBrowseStripProps = {
  selectedCode?: string;
  onSelect: (code: string) => void;
  visible: boolean;
  searchQuery?: string;
  allowedCodes?: ReadonlySet<string> | null;
  distinctLayoutsOnly?: boolean;
};

/** Delivery order — Fresa sample-report-formats. */
export function DeliveryOrderFormatBrowseStrip({
  selectedCode,
  onSelect,
  visible,
  searchQuery = '',
  allowedCodes = null,
  distinctLayoutsOnly = false,
}: DeliveryOrderFormatBrowseStripProps) {
  if (!visible) return null;

  const all = listDeliveryOrderFormats();
  const { items, scopedTotal, filterActive } = filterCatalogStripRows(all, {
    searchQuery,
    allowedCodes,
    selectedCode,
    distinctLayoutsOnly,
  });

  return (
    <FresaCatalogSection
      section="delivery"
      countLabel={
        filterActive ? `${items.length} of ${scopedTotal} formats` : `${all.length} formats`
      }
      empty={items.length === 0}
    >
      {items.map((row, i) => (
        <FresaFormatCard
          key={row.code}
          active={selectedCode === row.code}
          index={row.sortOrder - 1 || i}
          badge={`#${row.sortOrder}`}
          name={row.name}
          sharedHint={catalogSharedLayoutHint(row.code)}
          onClick={() => onSelect(row.code)}
        />
      ))}
    </FresaCatalogSection>
  );
}
