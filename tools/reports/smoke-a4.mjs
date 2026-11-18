import fs from 'node:fs';
import path from 'node:path';
import { readPageBoxes, pageBoxMismatch } from './page-box.mjs';
import { inspectPdfFile } from './extract.mjs';
import { displayGeometry } from './page-box.mjs';

const codes = process.argv.slice(2);
for (const code of codes) {
  const spec = JSON.parse(fs.readFileSync(path.join('reports/specs', `${code}.json`), 'utf8'));
  const reference = spec.source;
  const rendered = path.join('reports/output/track-a4/smoke', `${code}.pdf`);
  const left = await readPageBoxes(reference);
  const right = await readPageBoxes(rendered);
  const boxes = left.map((box, index) => ({ page: index + 1, fields: pageBoxMismatch(box, right[index]), reference: box, rendered: right[index] }));
  const read = await inspectPdfFile(rendered);
  const specPage = spec.pages[0];
  const outPage = read.pageReads[0];
  const specGeom = displayGeometry(specPage, specPage.pageBox);
  const outGeom = displayGeometry(outPage, outPage.pageBox);
  const specLine = specGeom.lines[0];
  const outLine = outGeom.lines[0];
  const colorSample = {
    spec: specPage.lines.slice(0, 3).map((line) => line.color),
    out: outPage.lines.slice(0, 3).map((line) => line.color),
    specWidth: specPage.lines.slice(0, 3).map((line) => line.width),
    outWidth: outPage.lines.slice(0, 3).map((line) => line.width),
  };
  function miss(line, others) {
    return !others.some((other) =>
      Math.abs(line.x1 - other.x1) <= 0.1
      && Math.abs(line.y1 - other.y1) <= 0.1
      && Math.abs(line.x2 - other.x2) <= 0.1
      && Math.abs(line.y2 - other.y2) <= 0.1
      && Math.abs((line.width || 0) - (other.width || 0)) <= 0.1
      && (line.color || '#000000') === (other.color || '#000000'));
  }
  const missing = specGeom.lines.filter((line) => miss(line, outGeom.lines));
  const colorMiss = specGeom.lines.filter((line) => {
    const hit = outGeom.lines.find((other) =>
      Math.abs(line.x1 - other.x1) <= 0.1
      && Math.abs(line.y1 - other.y1) <= 0.1
      && Math.abs(line.x2 - other.x2) <= 0.1
      && Math.abs(line.y2 - other.y2) <= 0.1);
    return hit && line.color !== hit.color;
  });
  console.log(JSON.stringify({
    code,
    boxes,
    page: { spec: [specPage.width, specPage.height], out: [outPage.width, outPage.height] },
    lines: { spec: specGeom.lines.length, out: outGeom.lines.length, missing: missing.length },
    rects: { spec: specGeom.rects.length, out: outGeom.rects.length },
    colorMiss: colorMiss.length,
    colorSample,
    firstMissing: missing.slice(0, 2),
    firstColor: colorMiss.slice(0, 1).map((line) => ({
      spec: line.color,
      out: outGeom.lines.find((other) => Math.abs(line.x1 - other.x1) <= 0.1 && Math.abs(line.y1 - other.y1) <= 0.1)?.color,
    })),
    firstSpecLine: specLine,
    firstOutLine: outLine,
  }, null, 2));
}
