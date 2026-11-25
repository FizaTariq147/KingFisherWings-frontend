const fs = require('fs');
const spec = JSON.parse(fs.readFileSync('reports/specs/INVOICE_REPORT_FORMAT_2_TAX_INVOICE_INDIA.json','utf8'));
console.log('rotate', spec.page?.rotate, 'orient', spec.page?.orientation);
const spans = spec.spans || [];
const powered = spans.filter(s => /powered|fresa tech/i.test(s.text||''));
console.log('powered spans', powered);
const footerHighX = spans.filter(s => s.x > 540).map(s => ({t:s.text,x:s.x,y:s.y}));
console.log('footer', footerHighX);
