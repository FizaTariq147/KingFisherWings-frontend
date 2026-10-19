/**
 * Preserve official Fresa invoice layouts from build-invoice-format-ui-layouts.mjs.
 * Only inject small extras so same-kind Format-N variants are not identical clones.
 *
 * Usage: node scripts/uniquify-invoice-kind-variants.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { blockSignature } from './lib/fresaLayoutDiversity.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const jsonPath = path.join(root, 'src/features/reports/data/invoiceFormatUiLayouts.json');
const tsPath = path.join(root, 'src/features/reports/data/invoiceFormatUiLayouts.generated.ts');

const VARIANT_EXTRAS = [
  { type: 'formatBadge' },
  { type: 'letterBody' },
  { type: 'containerStrip' },
  { type: 'stampSignature' },
  { type: 'wireBox' },
  { type: 'jobDescription' },
  { type: 'agingSummary' },
  { type: 'taxAmountBox' },
];

const rows = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const used = new Set();

const next = rows.map((row, index) => {
  let blocks = Array.isArray(row.blocks) ? row.blocks.map((b) => ({ ...b })) : [];
  const n = Number(row.formatNumber) || index;
  const foot = blocks[blocks.length - 1];
  const hasFooter = foot?.type === 'colorfulFooter';
  const body = hasFooter ? blocks.slice(0, -1) : blocks;
  const usedTypes = new Set(body.map((b) => b.type));

  // Always differentiate by format number within the same Fresa kind.
  const extras = [VARIANT_EXTRAS[n % VARIANT_EXTRAS.length]];
  if (n % 2 === 0) extras.push(VARIANT_EXTRAS[(n + 2) % VARIANT_EXTRAS.length]);
  if (n % 7 === 0) extras.push(VARIANT_EXTRAS[(n + 4) % VARIANT_EXTRAS.length]);
  for (const ex of extras) {
    if (!usedTypes.has(ex.type)) {
      body.push({ ...ex });
      usedTypes.add(ex.type);
    }
  }

  let outBlocks = hasFooter ? [...body, foot] : body;
  let sig = blockSignature(outBlocks);
  let attempt = 0;
  while (used.has(sig) && attempt < 40) {
    const extra = { ...VARIANT_EXTRAS[(n + attempt + 3) % VARIANT_EXTRAS.length] };
    outBlocks = hasFooter
      ? [...outBlocks.slice(0, -1), extra, foot]
      : [...outBlocks, extra];
    sig = blockSignature(outBlocks);
    attempt += 1;
  }
  used.add(sig);

  return {
    ...row,
    blocks: outBlocks,
    branding: {
      company: 'KingFisher Wings',
      address: 'Dubai, United Arab Emirates',
      web: 'www.kingfisherwingsgroup.com',
      phone: '+971 55 5355 286',
      email: 'inquiry@kingfishertec.com',
      logo: 'kingfisher',
    },
  };
});

fs.writeFileSync(jsonPath, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
fs.writeFileSync(
  tsPath,
  `import type { InvoiceFormatUiLayout } from '../types/invoiceFormatUiLayout.types';\n\n` +
    `/** Permanent JSON UI layouts — invoiceFormatUiLayouts. */\n` +
    `export const INVOICE_FORMAT_UI_LAYOUTS: InvoiceFormatUiLayout[] = ${JSON.stringify(
      next,
      null,
      2,
    )} as InvoiceFormatUiLayout[];\n`,
  'utf8',
);

console.log(`Invoice layouts: ${next.length}, unique signatures: ${used.size}`);
