import fs from 'fs';
import path from 'path';

const root = path.resolve('src/features/reports');
const dataDir = path.join(root, 'data');
const catDir = path.join(root, 'constants');

function codesFromJson(file) {
  const j = JSON.parse(fs.readFileSync(file, 'utf8'));
  const arr = Array.isArray(j) ? j : [];
  return arr.map((r) => String(r.code || '').toUpperCase()).filter(Boolean);
}

const layoutCodes = new Set();
for (const f of fs.readdirSync(dataDir).filter((x) => x.endsWith('FormatUiLayouts.json'))) {
  for (const c of codesFromJson(path.join(dataDir, f))) layoutCodes.add(c);
}

const missing = [];
for (const f of fs.readdirSync(catDir).filter((x) => /FormatCatalog/.test(x) && x.endsWith('.ts'))) {
  const text = fs.readFileSync(path.join(catDir, f), 'utf8');
  const re = /code:\s*['"]([^'"]+)['"]/g;
  const seen = new Set();
  let m;
  while ((m = re.exec(text))) {
    const c = m[1].toUpperCase();
    if (seen.has(c)) continue;
    seen.add(c);
    if (!layoutCodes.has(c)) missing.push(`${f}: ${c}`);
  }
}

const registryPath = path.join(dataDir, 'fresaReportRegistry.generated.ts');
const registryText = fs.readFileSync(registryPath, 'utf8');
const regRe = /"code":\s*"([^"]+)"/g;
const regMissing = [];
const regSeen = new Set();
let rm;
while ((rm = regRe.exec(registryText))) {
  const c = rm[1].toUpperCase();
  if (regSeen.has(c)) continue;
  regSeen.add(c);
  if (!layoutCodes.has(c)) regMissing.push(c);
}

console.log('layout unique', layoutCodes.size);
console.log('catalog codes missing layouts', missing.length);
if (missing.length) console.log(missing.slice(0, 50).join('\n'));
console.log('registry unique', regSeen.size);
console.log('registry codes missing layouts', regMissing.length);
if (regMissing.length) console.log(regMissing.slice(0, 80).join('\n'));
