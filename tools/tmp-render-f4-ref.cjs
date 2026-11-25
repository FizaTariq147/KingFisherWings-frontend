const fs = require('fs');
const path = require('path');
const pdfPath = 'reports/references/files/invoice-report-format-4-standard-tax-invoice.pdf';
const outDir = 'tools/tmp-f4-ref';
fs.mkdirSync(outDir, { recursive: true });
// Try pdftoppm
const { execSync } = require('child_process');
try {
  execSync(`pdftoppm -png -r 120 -f 1 -l 1 "${pdfPath}" "${outDir}/ref"`, { stdio: 'inherit' });
  console.log('ok', fs.readdirSync(outDir));
} catch (e) {
  console.error('pdftoppm failed', e.message);
}
