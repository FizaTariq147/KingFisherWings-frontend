const fs = require('fs');
const spec = JSON.parse(fs.readFileSync('reports/specs/FG_HBL_HKG.json','utf8'));
console.log('images', (spec.images||[]).map(i => ({c:i.proposedClass,x:i.x,y:i.y,w:i.width,h:i.height})).slice(0,10));
console.log('slots', spec.slots);
const names = (spec.spans||[]).filter(s => s.brandingKind === 'name' || /FRESA DEMO|BILL OF LADING|PLMAA/i.test(s.text||'')).slice(0,25);
console.log(JSON.stringify(names.map(s => ({t:s.text,x:s.x,y:s.y,sz:s.size,k:s.brandingKind})), null, 2));
