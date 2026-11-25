const fs = require('fs');
const spec = JSON.parse(fs.readFileSync('reports/specs/INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE.json','utf8'));
console.log(JSON.stringify({
  page: spec.page,
  slots: spec.slots,
  images: (spec.images||[]).slice(0,8).map(i => ({class:i.proposedClass,x:i.x,y:i.y,w:i.width,h:i.height})),
  brandingSpans: (spec.spans||[]).filter(s => s.brandingKind || /FRESA DEMO|COMPANY LIMITED|WEB:/i.test(s.text||'')).slice(0,20).map(s => ({text:s.text,x:s.x,y:s.y,size:s.size,kind:s.brandingKind,color:s.color})),
  titleBar: (spec.shapes||[]).filter(s => s.y > 700 && s.y < 750).slice(0,20),
}, null, 2));
