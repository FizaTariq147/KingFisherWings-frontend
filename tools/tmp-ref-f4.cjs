const fs = require('fs');
const { PDFDocument } = require('pdf-lib');
(async () => {
  const bytes = fs.readFileSync('reports/references/files/invoice-report-format-4-standard-tax-invoice.pdf');
  const doc = await PDFDocument.load(bytes);
  const page = doc.getPages()[0];
  const { width, height } = page.getSize();
  console.log('page', width, height, 'rotation', page.getRotation().angle);
  // Extract with pdfjs if available
})();
