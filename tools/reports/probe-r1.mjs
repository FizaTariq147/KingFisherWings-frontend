import fs from 'node:fs';
import path from 'node:path';

const codes = JSON.parse(fs.readFileSync('reports/output/track-a/first-run-failures.json', 'utf8')).r1Top.map((row) => row.code);
const rows = [];
for (const code of codes) {
  const specPath = path.join('reports/specs', `${code}.json`);
  if (!fs.existsSync(specPath)) {
    rows.push({ code, missing: true });
    continue;
  }
  const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
  const pages = spec.pages?.length ? spec.pages : [spec];
  const images = pages.flatMap((page, pageIndex) => (page.images || []).map((image) => ({
    page: pageIndex + 1,
    class: image.proposedClass,
    x: image.x,
    y: image.y,
    width: image.width,
    height: image.height,
    slot: image.slot || '',
  })));
  rows.push({
    code,
    images,
    logoSlot: spec.slots?.logo || null,
    page: { width: spec.page?.width, height: spec.page?.height },
  });
}
fs.writeFileSync('reports/output/track-a/r1-images.json', `${JSON.stringify(rows, null, 2)}\n`);
console.log(JSON.stringify(rows, null, 2));
