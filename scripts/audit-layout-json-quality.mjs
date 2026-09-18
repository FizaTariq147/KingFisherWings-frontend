import fs from 'node:fs';
import path from 'node:path';

const dataDir = 'src/features/reports/data';
const files = fs.readdirSync(dataDir).filter((f) => f.endsWith('FormatUiLayouts.json'));

let thin = 0;
let total = 0;
const thinSamples = [];

for (const f of files) {
  const rows = JSON.parse(fs.readFileSync(path.join(dataDir, f), 'utf8'));
  for (const row of rows) {
    total += 1;
    const blocks = Array.isArray(row.blocks) ? row.blocks.length : 0;
    if (blocks < 4) {
      thin += 1;
      if (thinSamples.length < 30) {
        thinSamples.push(`${f} ${row.code} blocks=${blocks}`);
      }
    }
  }
  // sync check: generated.ts length
  const gen = f.replace('.json', '.generated.ts');
  const genPath = path.join(dataDir, gen);
  if (fs.existsSync(genPath)) {
    const text = fs.readFileSync(genPath, 'utf8');
    const m = text.match(/"code":/g);
    const genCount = m ? m.length : 0;
    if (genCount !== rows.length) {
      console.log(`OUT OF SYNC ${f}: json=${rows.length} generated=${genCount}`);
    }
  } else {
    console.log(`MISSING generated for ${f}`);
  }
}

console.log({ total, thin, thinSamples });
