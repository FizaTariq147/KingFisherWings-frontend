const fs = require('fs');
const spec = JSON.parse(fs.readFileSync('reports/specs/FG_HBL_FORMAT_1.json','utf8'));
const spans = spec.spans || [];
const keys = [/issued by/i, /issuing carrier/i, /agent name/i, /house air/i, /non negotiable/i, /accounting/i];
for (const re of keys) {
  const hits = spans.filter(s => re.test(s.text||'')).map(s => ({t:s.text,x:s.x,y:s.y,sz:s.size,w:s.width}));
  console.log(re.toString(), JSON.stringify(hits.slice(0,5)));
}
console.log('page', spec.page.width, spec.page.height);
