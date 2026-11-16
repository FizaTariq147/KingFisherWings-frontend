import fs from 'fs';
import path from 'path';

const dir = 'src/features/reports/components/ReportCatalog';
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('BrowseStrip.tsx'))) {
  const p = path.join(dir, f);
  let s = fs.readFileSync(p, 'utf8');
  if (!s.includes('FresaFormatCard')) continue;

  if (!s.includes('resolveCatalogFormatStatus')) {
    if (s.includes("from '../../utils/catalogSharedLayoutHint'")) {
      s = s.replace(
        "import { catalogSharedLayoutHint } from '../../utils/catalogSharedLayoutHint';",
        "import { resolveCatalogFormatStatus } from '../../utils/catalogFormatStatus';\nimport { catalogSharedLayoutHint } from '../../utils/catalogSharedLayoutHint';",
      );
    } else if (s.includes("from '../../utils/filterCatalogStripRows'")) {
      s = s.replace(
        "import { filterCatalogStripRows } from '../../utils/filterCatalogStripRows';",
        "import { resolveCatalogFormatStatus } from '../../utils/catalogFormatStatus';\nimport { filterCatalogStripRows } from '../../utils/filterCatalogStripRows';",
      );
    }
  }

  if (!s.includes('status={resolveCatalogFormatStatus')) {
    if (s.includes('sharedHint={catalogSharedLayoutHint(row.code)}')) {
      s = s.replace(
        'sharedHint={catalogSharedLayoutHint(row.code)}',
        'sharedHint={catalogSharedLayoutHint(row.code)}\n          status={resolveCatalogFormatStatus(row.code)}',
      );
    } else {
      s = s.replace(
        /name=\{row\.name\}\n(\s*)onClick=/,
        'name={row.name}\n$1status={resolveCatalogFormatStatus(row.code)}\n$1onClick=',
      );
    }
  }

  s = s.replace('distinct Fresa layouts', 'formats');
  fs.writeFileSync(p, s);
  console.log('patched', f);
}
