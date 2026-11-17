import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const map = JSON.parse(fs.readFileSync(path.join(root, 'reports/font-map.json'), 'utf8'));

export function mapFont(name) {
  const text = String(name || '');
  const weight = /bold|black|semibold|heavy/i.test(text) ? 'bold' : 'regular';
  const rule = map.rules.find((item) => new RegExp(item.match, 'i').test(text)) || map.rules[map.rules.length - 1];
  const bundle = map.bundles[rule.bundle];
  return {
    bundle: rule.bundle,
    family: bundle.family,
    weight,
    file: bundle[weight],
  };
}

export function fontFile(mapped) {
  return path.join(root, mapped.file);
}
