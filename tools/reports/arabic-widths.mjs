/**
 * Widths and crops after per-glyph Arabic placement.
 * Run: node tools/reports/arabic-widths.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { PNG } from 'pngjs';
import { renderSpec } from './render-spec.mjs';
import { diffPilot } from './diff-pilot.mjs';
import { inspectPdfFile } from './extract.mjs';

const codes = JSON.parse(fs.readFileSync('reports/output/round8/arabic.json', 'utf8')).documents.map((item) => item.code);
const outDir = 'reports/output/track-a2/arabic';
fs.mkdirSync(outDir, { recursive: true });
const rows = [];

function cropTop(pdf, dest) {
  const prefix = dest.replace(/\.png$/, '');
  execFileSync('pdftoppm', ['-png', '-r', '110', '-f', '1', '-l', '1', '-x', '0', '-y', '0', '-W', '500', '-H', '220', pdf, prefix]);
  const png = fs.readdirSync(path.dirname(dest)).find((name) => name.startsWith(path.basename(prefix)) && name.endsWith('.png'));
  if (png && path.join(path.dirname(dest), png) !== dest) fs.renameSync(path.join(path.dirname(dest), png), dest);
}

for (const code of codes) {
  await renderSpec(code);
  const result = await diffPilot(code, { fastMetrics: true, writeHeatmap: false, skipDeviation: true });
  const spec = JSON.parse(fs.readFileSync(`reports/specs/${code}.json`, 'utf8'));
  const read = await inspectPdfFile(`reports/output/${code}.pdf`);
  const arabic = (spec.spans || []).filter((span) => [...String(span.text || '')].some((char) => {
    const value = char.codePointAt(0);
    return (value >= 0xFB50 && value <= 0xFDFF) || (value >= 0xFE70 && value <= 0xFEFF) || (value >= 0x0600 && value <= 0x06FF);
  }));
  let maxGap = 0;
  let broken = 0;
  for (const span of arabic) {
    const line = (read.spans || []).filter((item) => Math.abs(item.y - span.y) < 0.6 && item.x >= span.x - 0.5 && item.x <= span.x + span.width + 8);
    const ordered = line.sort((left, right) => left.x - right.x);
    for (let index = 1; index < ordered.length; index += 1) {
      const gap = ordered[index].x - (ordered[index - 1].x + (ordered[index - 1].width || 0));
      if (gap > maxGap) maxGap = gap;
      if (gap > 0.8) broken += 1;
    }
  }
  const widthFailures = [...(result.staticText.failures || []), ...(result.dynamicText.failures || [])]
    .filter((item) => item.cause === 'width')
    .slice(0, 8);
  const refPdf = spec.source;
  cropTop(refPdf, path.join(outDir, `${code}-ref.png`));
  cropTop(path.join('reports/output', `${code}.pdf`), path.join(outDir, `${code}-out.png`));
  rows.push({
    code,
    static: result.staticText.pass,
    dynamic: result.dynamicText.pass,
    raster: result.raster.pass,
    widthFailures,
    maxInteriorGapPt: Number(maxGap.toFixed(2)),
    gapsOverPoint8: broken,
    joinsBroken: broken > 0,
  });
  console.log(JSON.stringify({ code, static: rows.at(-1).static, dynamic: rows.at(-1).dynamic, joinsBroken: rows.at(-1).joinsBroken, maxGap: rows.at(-1).maxInteriorGapPt, widths: widthFailures.length }));
}

fs.writeFileSync(path.join(outDir, 'widths.json'), `${JSON.stringify({ rows }, null, 2)}\n`);
console.log(JSON.stringify({ documents: rows.length, joinsBroken: rows.filter((row) => row.joinsBroken).length }));
