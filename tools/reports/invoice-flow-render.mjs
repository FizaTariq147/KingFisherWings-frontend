/**
 * Node pdfmake renderer for engine=flow codes (invoice, quotation, CN, DN).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pdfmake from 'pdfmake';
import { buildFlowDocDefinition } from './flow-doc.mjs';
import { buildInvoiceFlowDocDefinition } from './invoice-flow-doc.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

let fontsReady = false;

function ensureFonts() {
  if (fontsReady) return;
  pdfmake.setUrlAccessPolicy(() => false);
  pdfmake.setLocalAccessPolicy(() => true);
  pdfmake.addFonts({
    Arimo: {
      normal: path.join(root, 'reports/fonts/Arimo-Regular.ttf'),
      bold: path.join(root, 'reports/fonts/Arimo-Bold.ttf'),
      italics: path.join(root, 'reports/fonts/Arimo-Regular.ttf'),
      bolditalics: path.join(root, 'reports/fonts/Arimo-Bold.ttf'),
    },
  });
  fontsReady = true;
}

/**
 * @param {object} record
 * @param {string} outputPath
 */
export async function renderInvoiceFlowPdf(record, outputPath) {
  ensureFonts();
  const payload = { code: 'INVOICE_FLOW_TAX_INVOICE_1', ...record };
  if (!payload.logoBase64) {
    const logoPath = path.join(root, 'public/kingfisher-logo.png');
    if (fs.existsSync(logoPath)) {
      payload.logoBase64 = fs.readFileSync(logoPath).toString('base64');
    }
  }
  const code = String(payload.code || 'INVOICE_FLOW_TAX_INVOICE_1');
  const docDefinition = buildFlowDocDefinition(code, payload);
  await pdfmake.createPdf(docDefinition).write(outputPath);
  return outputPath;
}

export { buildInvoiceFlowDocDefinition, buildFlowDocDefinition };
