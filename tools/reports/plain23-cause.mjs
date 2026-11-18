import fs from 'node:fs';

const rows = JSON.parse(fs.readFileSync('reports/output/track-a4/plain23/segments.json', 'utf8'));
for (const row of rows) {
  if (row.pass) {
    console.log(JSON.stringify({ code: row.code, pass: true, ratio: row.ratio }));
    continue;
  }
  const sources = {};
  let zero = 0;
  let shifted = 0;
  for (const item of row.top || []) {
    const key = `${item.source}->${item.output?.source || 'none'}`;
    sources[key] = (sources[key] || 0) + 1;
    if ((item.endpointDistance || 0) === 0) zero += 1;
    else shifted += 1;
  }
  console.log(JSON.stringify({
    code: row.code,
    ratio: Number(row.ratio.toFixed(6)),
    lines: [row.referenceLines, row.outputLines],
    rects: [row.referenceRects, row.outputRects],
    sources,
    zero,
    shifted,
    sample: row.top?.[0],
  }));
}
