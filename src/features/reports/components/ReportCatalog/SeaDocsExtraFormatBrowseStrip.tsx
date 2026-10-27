import { listSeaDocsExtraFormats } from '../../constants/seaDocsExtraFormatCatalog';
import { filterCatalogStripRows } from '../../utils/filterCatalogStripRows';
import { FresaCatalogSection, FresaFormatCard } from './FresaCatalogSection';

type Props = {
  selectedCode?: string;
  onSelect: (code: string) => void;
  visible: boolean;
  searchQuery?: string;
  allowedCodes?: ReadonlySet<string> | null;
};

export function SeaDocsExtraFormatBrowseStrip({
  selectedCode,
  onSelect,
  visible,
  searchQuery = '',
  allowedCodes = null,
}: Props) {
  if (!visible) return null;

  const all = listSeaDocsExtraFormats();
  const { items, scopedTotal, filterActive } = filterCatalogStripRows(all, {
    searchQuery,
    allowedCodes,
    selectedCode,
  });

  return (
    <FresaCatalogSection
      section="sea_extra"
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
          onClick={() => onSelect(row.code)}
        />
      ))}
    </FresaCatalogSection>
  );
}
