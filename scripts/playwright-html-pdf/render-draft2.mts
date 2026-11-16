/**
 * One-shot Draft-2 print for the QA harness.
 * Not an HTTP endpoint. Writes a PDF buffer to --out and exits.
 */
import { writeFileSync } from 'node:fs';
import {
  PILOT_HAWB_DRAFT2_FIXTURE,
  PLAYWRIGHT_HTML_PILOT_CODE,
} from '@/features/reports/engines/pdf/playwrightHtml/hawbDraft2Html';
import {
  closePlaywrightHtmlBrowser,
  renderPlaywrightHtmlPdf,
} from '@/features/reports/engines/pdf/playwrightHtml/renderPlaywrightHtmlPdf';

const outFlag = process.argv.indexOf('--out');
const out = outFlag >= 0 ? process.argv[outFlag + 1] : '';
if (!out) {
  console.error('Missing --out');
  process.exit(1);
}

try {
  const pdf = await renderPlaywrightHtmlPdf({
    code: PLAYWRIGHT_HTML_PILOT_CODE,
    data: PILOT_HAWB_DRAFT2_FIXTURE,
  });
  writeFileSync(out, pdf);
  console.log(JSON.stringify({ ok: true, bytes: pdf.length, out }));
} finally {
  await closePlaywrightHtmlBrowser();
}
