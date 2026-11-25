import { readFileSync } from 'node:fs';
import { generateOfficialMeasuredPdf } from '../../src/features/reports/templates/official/generateOfficialMeasuredPdf';

const originalFetch = globalThis.fetch?.bind(globalThis);
globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = String(input);
  if (url.startsWith('/reports-fonts/')) {
    const bytes = readFileSync(`public${url}`);
    return new Response(bytes);
  }
  if (originalFetch) return originalFetch(input, init);
  throw new Error(`fetch not available for ${url}`);
}) as typeof fetch;

async function main() {
  const result = await generateOfficialMeasuredPdf(
    'INVOICE_REPORT_FORMAT_8_STANDARD_INVOICE_ARABIC',
    {
      companyName: 'KingFisher Logistic',
      companyAddress: 'Dubai, UAE',
      companyPhone: '+971 55 5355 286',
    },
  );
  console.log(
    JSON.stringify({
      size: result.blob.size,
      fileName: result.fileName,
      pages: result.face.pages.length,
      texts: result.face.pages[0]?.texts?.length,
    }),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
