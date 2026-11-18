import fs from 'node:fs';
import path from 'node:path';
import { inspectPdfFile } from './extract.mjs';
import { displayGeometry } from './page-box.mjs';

const codes = process.argv.slice(2);
for (const code of codes) {
  const spec = JSON.parse(fs.readFileSync(path.join('reports/specs', `${code}.json`), 'utf8'));
  const rendered = await inspectPdfFile(path.join('reports/output', `${code}.pdf`));
  const keys = {};
  let missing = 0;
  const pages = Math.max(spec.pages.length, rendered.pageReads.length);
  for (let index = 0; index < pages; index += 1) {
    const left = displayGeometry(spec.pages[index], spec.pages[index]?.pageBox);
    const right = displayGeometry(rendered.pageReads[index], rendered.pageReads[index]?.pageBox);
    for (const line of left?.lines || []) {
      let best = null;
      let score = Infinity;
      for (const other of right?.lines || []) {
        const next = Math.abs(line.x1 - other.x1) + Math.abs(line.y1 - other.y1) + Math.abs(line.x2 - other.x2) + Math.abs(line.y2 - other.y2);
        if (next < score) { score = next; best = other; }
      }
      if (!best || score > 1) { missing += 1; keys.absent = (keys.absent || 0) + 1; continue; }
      for (const key of ['width', 'color', 'lineCap', 'lineJoin', 'dash']) {
        const same = key === 'width' ? Math.abs((line.width || 0) - (best.width || 0)) <= 0.1 : JSON.stringify(line[key] ?? null) === JSON.stringify(best[key] ?? null);
        if (!same) keys[key] = (keys[key] || 0) + 1;
      }
    }
    for (const rect of left?.rects || []) {
      let best = null;
      let score = Infinity;
      for (const other of right?.rects || []) {
        const next = Math.abs(rect.x - other.x) + Math.abs(rect.y - other.y);
        if (next < score) { score = next; best = other; }
      }
      if (!best || score > 1) { missing += 1; keys.rectAbsent = (keys.rectAbsent || 0) + 1; continue; }
      for (const key of ['width', 'height', 'fill', 'stroke', 'dash']) {
        const same = key === 'width' || key === 'height' ? Math.abs((rect[key] || 0) - (best[key] || 0)) <= 0.1 : JSON.stringify(rect[key] ?? null) === JSON.stringify(best[key] ?? null);
        if (!same) keys[`rect.${key}`] = (keys[`rect.${key}`] || 0) + 1;
      }
    }
  }
  console.log(JSON.stringify({ code, missing, keys }));
}
