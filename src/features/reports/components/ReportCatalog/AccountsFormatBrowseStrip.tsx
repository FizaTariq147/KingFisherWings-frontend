import { listAccountsFormats } from '../../constants/accountsFormatCatalog';
import { filterCatalogStripRows } from '../../utils/filterCatalogStripRows';
import { FresaCatalogSection, FresaFormatCard } from './FresaCatalogSection';

type AccountsFormatBrowseStripProps = {
  selectedCode?: string;
  onSelect: (code: string) => void;
  visible: boolean;
  searchQuery?: string;
  allowedCodes?: ReadonlySet<string> | null;
};

/** Accounts other Formats — Fresa sample-report-formats. */
export function AccountsFormatBrowseStrip({
  selectedCode,
  onSelect,
  visible,
  searchQuery = '',
  allowedCodes = null,
}: AccountsFormatBrowseStripProps) {
  if (!visible) return null;

  const all = listAccountsFormats();
  const { items, scopedTotal, filterActive } = filterCatalogStripRows(all, {
    searchQuery,
    allowedCodes,
    selectedCode,
  });

  return (
    <FresaCatalogSection
      section="accounts"
      countLabel={
        filterActive ? `${items.length} of ${scopedTotal} formats` : `${all.length} formats`
      }
      empty={items.length === 0}
      emptyMessage="No Accounts formats match the current filters."
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
