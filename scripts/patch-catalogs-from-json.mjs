/**
 * Ensure format-catalog list* helpers include every JSON layout in that section.
 * Patches catalogs that merge core+remaining so strips never omit JSON rows.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const PATCHES = [
  {
    file: 'src/features/reports/constants/wmsFormatCatalog.ts',
    layoutImport: `import { listWmsFormatUiLayouts } from '../data/wmsFormatUiLayouts';`,
    marker: 'const ALL_WMS_FORMATS: WmsFormatSpec[] = [...WMS_FORMAT_CATALOG, ...WMS_EXTRA];',
    replacement: `function buildAllWmsFormats(): WmsFormatSpec[] {
  const by = new Map<string, WmsFormatSpec>();
  for (const row of [...WMS_FORMAT_CATALOG, ...WMS_EXTRA]) by.set(row.code.toUpperCase(), row);
  listWmsFormatUiLayouts().forEach((layout, i) => {
    const key = layout.code.toUpperCase();
    const existing = by.get(key);
    by.set(key, {
      code: layout.code,
      name: layout.name || existing?.name || layout.code,
      kind: existing?.kind || \`wms_\${layout.formatNumber || i + 1}\`,
      sortOrder: existing?.sortOrder ?? layout.formatNumber ?? 2000 + i,
    });
  });
  return [...by.values()].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
}

const ALL_WMS_FORMATS: WmsFormatSpec[] = buildAllWmsFormats();`,
  },
];

for (const patch of PATCHES) {
  const p = path.join(root, patch.file);
  let text = fs.readFileSync(p, 'utf8');
  if (!text.includes(patch.layoutImport)) {
    text = text.replace(
      /import \{ catalogRowsMatchSearch \} from '\\.\\./utils\\/reportCatalogSearch';/,
      (m) => `${m}\n${patch.layoutImport}`,
    );
  }
  if (text.includes(patch.marker) && !text.includes('buildAllWmsFormats')) {
    text = text.replace(patch.marker, patch.replacement);
  }
  fs.writeFileSync(p, text, 'utf8');
  console.log('patched', patch.file);
}
