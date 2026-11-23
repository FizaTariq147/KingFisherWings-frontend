/**
 * Node pdfmake renderer for INVOICE_FLOW_TAX_INVOICE_1.
 * Chosen library: pdfmake — table headerRows + automatic page breaks,
 * runs in Node and the browser, embeds Arimo. jspdf/pdf-lib lack repeated
 * header rows with flowing tables; @react-pdf was not required once pdfmake
 * was available.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pdfmake from 'pdfmake';
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
  const payload = { ...record };
  if (!payload.logoBase64) {
    const logoPath = path.join(root, 'public/kingfisher-logo.png');
    if (fs.existsSync(logoPath)) {
      payload.logoBase64 = fs.readFileSync(logoPath).toString('base64');
    }
  }
  const docDefinition = buildInvoiceFlowDocDefinition(payload);
  await pdfmake.createPdf(docDefinition).write(outputPath);
  return outputPath;
}

export { buildInvoiceFlowDocDefinition };
