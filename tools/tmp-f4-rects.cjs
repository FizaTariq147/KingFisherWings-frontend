const fs = require('fs');
const spec = JSON.parse(fs.readFileSync('reports/specs/INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE.json','utf8'));
console.log('rects', (spec.rects||[]).length, JSON.stringify((spec.rects||[]).slice(0,15), null, 2));
console.log('shadings', JSON.stringify(spec.shadings, null, 2));
console.log('bands', JSON.stringify(spec.bands, null, 2));
const longH = (spec.lines||[]).filter(l => Math.abs((l.y1??l.y??0)-(l.y2??l.y??0))<1 && Math.abs((l.x2??0)-(l.x1??0))>400);
console.log('longH sample', JSON.stringify(longH.slice(0,8), null, 2));
