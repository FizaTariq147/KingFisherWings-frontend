/**
 * Stable hash of the flow template sources used for acceptance artifacts.
 */
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const FILES = [
  'tools/reports/flow-blocks.mjs',
  'tools/reports/flow-doc.mjs',
  'tools/reports/invoice-flow-doc.mjs',
  'tools/reports/invoice-flow-options.mjs',
  'tools/reports/invoice-flow-totals.mjs',
  'tools/reports/amount-words.mjs',
  'src/features/reports/flow/invoiceFlowStyle.ts',
  'src/features/reports/flow/invoiceFlowOptions.ts',
];

export function flowTemplateHash() {
  const hash = createHash('sha256');
  for (const relative of FILES) {
    const file = path.join(root, relative);
    hash.update(relative);
    hash.update('\0');
    hash.update(fs.existsSync(file) ? fs.readFileSync(file) : Buffer.alloc(0));
    hash.update('\0');
  }
  return hash.digest('hex');
}

export function writeFlowTemplateHash(outDir = path.join(root, 'reports/flow-spike')) {
  fs.mkdirSync(outDir, { recursive: true });
  const value = flowTemplateHash();
  fs.writeFileSync(path.join(outDir, 'template-hash.txt'), `${value}\n`);
  return value;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  console.log(writeFlowTemplateHash());
}
