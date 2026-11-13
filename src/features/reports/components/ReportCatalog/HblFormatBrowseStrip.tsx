import { listHblFormats } from '../../constants/hblFormatCatalog';
import { catalogSharedLayoutHint } from '../../utils/catalogSharedLayoutHint';
import { filterCatalogStripRows } from '../../utils/filterCatalogStripRows';
import { FresaCatalogSection, FresaFormatCard } from './FresaCatalogSection';

type Props = {
  selectedCode?: string;
  onSelect: (code: string) => void;
  visible: boolean;
  searchQuery?: string;
  allowedCodes?: ReadonlySet<string> | null;
  distinctLayoutsOnly?: boolean;
};

/** HBL — Fresa sample-report-formats. */
export function HblFormatBrowseStrip({
  selectedCode,
  onSelect,
  visible,
  searchQuery = '',
  allowedCodes = null,
  distinctLayoutsOnly = false,
}: Props) {
  if (!visible) return null;

  const all = listHblFormats();
  const { items, scopedTotal, filterActive } = filterCatalogStripRows(all, {
    searchQuery,
    allowedCodes,
    selectedCode,
    distinctLayoutsOnly,
  });

  return (
    <FresaCatalogSection
      section="hbl"
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
