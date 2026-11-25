const fs = require('fs');
const spec = JSON.parse(fs.readFileSync('reports/specs/INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE.json','utf8'));
const shapes = spec.shapes || spec.geometry?.shapes || [];
console.log('keys', Object.keys(spec));
console.log('shapes len', shapes.length);
const nearTitle = shapes.filter(s => {
  const y = s.y ?? s.y1 ?? 0;
  const h = s.height ?? Math.abs((s.y2??0)-(s.y1??0));
  return y > 700 && y < 760;
}).slice(0, 30);
console.log('near title', JSON.stringify(nearTitle, null, 2));
const fills = shapes.filter(s => (s.type === 'rect' || s.kind === 'fill' || s.fill) && (s.width||0) > 400).slice(0, 20);
console.log('wide fills', JSON.stringify(fills.slice(0,10), null, 2));
if (spec.pages) console.log('pages', spec.pages.length);
