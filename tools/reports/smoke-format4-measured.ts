import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { generateOfficialMeasuredPdf } from '../../src/features/reports/templates/official/generateOfficialMeasuredPdf';

const originalFetch = globalThis.fetch?.bind(globalThis);
globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = String(input);
  if (url.startsWith('/reports-fonts/')) {
    const bytes = readFileSync(`public${url}`);
    return new Response(bytes);
  }
  if (url.includes('logo') || url.endsWith('.png') || url.endsWith('.jpg') || url.endsWith('.jpeg') || url.endsWith('.webp')) {
    // try commercial logo from public
    try {
      const path = url.startsWith('/') ? `public${url}` : url.replace(/^.*\/public\//, 'public/');
      const bytes = readFileSync(path);
      return new Response(bytes);
    } catch {
      /* fall through */
    }
  }
  if (originalFetch) return originalFetch(input, init);
  throw new Error(`fetch not available for ${url}`);
}) as typeof fetch;

async function main() {
  const result = await generateOfficialMeasuredPdf(
    'INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE',
    {
      companyName: 'Zoyan Logistics',
      companyAddress: 'Dubai, UAE',
      companyWeb: 'www.example.com',
      companyPhone: '+971 50 000 0000',
      invoiceNumber: 'INV1800584',
      shipperLines: ['TRANS WORLD SHIPPING AND CO'],
      consigneeLines: ['Al Nabha Trading'],
    },
  );
  mkdirSync('tools/tmp-f4-out', { recursive: true });
  const buf = Buffer.from(await result.blob.arrayBuffer());
  writeFileSync('tools/tmp-f4-out/format4.pdf', buf);
  console.log(JSON.stringify({ size: result.blob.size, fileName: result.fileName, logo: result.face ? 'ok' : null }));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
