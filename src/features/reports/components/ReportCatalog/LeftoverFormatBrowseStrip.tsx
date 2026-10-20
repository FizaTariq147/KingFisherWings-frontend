import { listLeftoverFormats } from '../../constants/leftoverFormatCatalog';
import { filterCatalogStripRows } from '../../utils/filterCatalogStripRows';
import {
  CATALOG_STRIP_META,
  CATALOG_STRIP_SCROLL,
  CATALOG_STRIP_SHELL,
  CATALOG_STRIP_TITLE,
  catalogStripCardClass,
  catalogStripTone,
} from './catalogStripUi';

type Props = {
  selectedCode?: string;
  onSelect: (code: string) => void;
  visible: boolean;
  searchQuery?: string;
  allowedCodes?: ReadonlySet<string> | null;
};

/** Extended Jasper invoice / HBL variants from Fresa sample-report-formats. */
export function LeftoverFormatBrowseStrip({
  selectedCode,
  onSelect,
  visible,
  searchQuery = '',
  allowedCodes = null,
}: Props) {
  if (!visible) return null;

  const all = listLeftoverFormats();
  const { items, scopedTotal, filterActive } = filterCatalogStripRows(all, {
    searchQuery,
    allowedCodes,
    selectedCode,
  });

  return (
    <div className={CATALOG_STRIP_SHELL}>
      <div className="flex items-baseline justify-between gap-2">
        <h3 className={CATALOG_STRIP_TITLE}>Additional commercial formats</h3>
        <p className={CATALOG_STRIP_META}>
          {filterActive ? `${items.length} of ${scopedTotal} formats` : `${all.length} formats`}
        </p>
      </div>
      {items.length === 0 ? (
        <p className="px-1 py-2 text-xs text-[var(--color-neutral-500)]">
          No formats match the current filters.
        </p>
      ) : (
        <div className={CATALOG_STRIP_SCROLL}>
          {items.map((row, i) => {
            const active = selectedCode === row.code;
            const tone = catalogStripTone(i);
            return (
              <button
                key={row.code}
                type="button"
                onClick={() => onSelect(row.code)}
                title={row.name}
                className={catalogStripCardClass(active, tone)}
              >
                <span className={`absolute inset-y-0 left-0 w-1 ${tone.accent}`} aria-hidden />
                <p className={`pl-1.5 text-[10px] font-bold uppercase tracking-wide ${tone.label}`}>
                  Format-{row.sortOrder}
                </p>
                <p className="mt-0.5 line-clamp-2 pl-1.5 text-[11px] font-medium leading-snug text-[var(--color-neutral-800)]">
                  {row.name}
                </p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
