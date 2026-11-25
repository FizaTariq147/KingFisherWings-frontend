/**
 * Baseline | current | diff sheets for the classic guard.
 * Does not update the snapshots.
 */
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const root = process.cwd();
const snap = path.join(root, 'reports/classic-snapshots');
const work = path.join(snap, 'work');
const out = path.join(root, 'reports/output/classic-guard');
fs.mkdirSync(out, { recursive: true });
const kinds = ['quotation', 'invoice', 'credit-note', 'debit-note'];

function read(file) {
  return PNG.sync.read(fs.readFileSync(file));
}

for (const kind of kinds) {
  const baseline = read(path.join(snap, `${kind}-1.png`));
  const current = read(path.join(work, `${kind}-1.png`));
  const width = Math.max(baseline.width, current.width);
  const height = Math.max(baseline.height, current.height);
  const left = new PNG({ width, height });
  const right = new PNG({ width, height });
  left.data.fill(255);
  right.data.fill(255);
  PNG.bitblt(baseline, left, 0, 0, baseline.width, baseline.height, 0, 0);
  PNG.bitblt(current, right, 0, 0, current.width, current.height, 0, 0);
  const diff = new PNG({ width, height });
  const mismatches = pixelmatch(left.data, right.data, diff.data, width, height, { threshold: 0.1 });
  const gap = 12;
  const sheet = new PNG({ width: width * 3 + gap * 2, height });
  sheet.data.fill(255);
  PNG.bitblt(left, sheet, 0, 0, width, height, 0, 0);
  PNG.bitblt(right, sheet, 0, 0, width, height, width + gap, 0);
  PNG.bitblt(diff, sheet, 0, 0, width, height, (width + gap) * 2, 0);
  const dest = path.join(out, `${kind}-baseline-vs-current.png`);
  fs.writeFileSync(dest, PNG.sync.write(sheet));
  console.log(`${kind} mismatches=${mismatches} ${path.relative(root, dest)}`);
}
