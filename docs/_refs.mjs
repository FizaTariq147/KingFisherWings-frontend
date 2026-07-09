import fs from 'fs';
const spec = JSON.parse(fs.readFileSync('D:/fresa/fresa-gold-frontend/docs/openapi.json','utf8'));
const hits = [];
function walk(o, p) {
  if (!o || typeof o !== 'object') return;
  if (o.$ref && (o.$ref.includes('PaginationMeta') || o.$ref.includes('Tenant')))
    hits.push({ path: p, ref: o.$ref });
  for (const [k, v] of Object.entries(o)) {
    if (Array.isArray(v)) v.forEach((item, i) => walk(item, `${p}.${k}[${i}]`));
    else walk(v, `${p}.${k}`);
  }
}
walk(spec, '');
console.log(JSON.stringify(hits, null, 2));
