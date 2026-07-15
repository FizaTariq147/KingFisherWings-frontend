const fs = require('fs');
const path = 'd:/fresa/fresa-gold-frontend/.tmp-kingfisher-docs-fetched.json';
let text = fs.readFileSync(path, 'utf8');
if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
const doc = JSON.parse(text);
const route = '/invoices/{id}/pdf';
const ops = doc.paths && doc.paths[route];
if (!ops) {
  const keys = Object.keys(doc.paths || {}).filter((k) => k.includes('invoice') && k.toLowerCase().includes('pdf'));
  console.log('MISSING path. similar:', keys);
  process.exit(1);
}
const result = {
  openapi: doc.openapi || '3.0.0',
  info: { title: 'Invoice PDF endpoints (extracted)', version: (doc.info && doc.info.version) || 'extracted' },
  paths: { [route]: ops },
  components: { schemas: {} },
};
function collectRefs(obj, schemas) {
  if (!obj || typeof obj !== 'object') return;
  if (Array.isArray(obj)) {
    obj.forEach((x) => collectRefs(x, schemas));
    return;
  }
  if (typeof obj.$ref === 'string') {
    const m = obj.$ref.match(/^#\/components\/schemas\/(.+)$/);
    if (m && doc.components && doc.components.schemas && doc.components.schemas[m[1]] && !schemas[m[1]]) {
      schemas[m[1]] = doc.components.schemas[m[1]];
      collectRefs(schemas[m[1]], schemas);
    }
  }
  for (const v of Object.values(obj)) collectRefs(v, schemas);
}
collectRefs(ops, result.components.schemas);
if (Object.keys(result.components.schemas).length === 0) delete result.components;

const out = 'd:/fresa/fresa-gold-frontend/.tmp-invoice-pdf-swagger.json';
fs.writeFileSync(out, JSON.stringify(result, null, 2));
console.log('Wrote', out);

function summarize(method, op) {
  const rb = op.requestBody;
  let rbInfo = 'no';
  if (rb) {
    const content = rb.content || {};
    const schemas = Object.keys(content).map((ct) => {
      const s = content[ct] && content[ct].schema;
      if (!s) return ct + ': (no schema)';
      if (s.$ref) return ct + ': ' + s.$ref;
      if (s.type) return ct + ': type=' + s.type + (s.format ? '(' + s.format + ')' : '');
      return ct + ': ' + JSON.stringify(s).slice(0, 120);
    });
    rbInfo = 'yes — ' + schemas.join('; ');
  }
  const resp = Object.entries(op.responses || {})
    .map(([code, r]) => {
      const desc = r.description || '';
      const cts = r.content ? Object.keys(r.content).join(',') : '';
      return code + (cts ? ' [' + cts + ']' : '') + (desc ? ' ' + desc : '');
    })
    .join('; ');
  console.log('---');
  console.log(method.toUpperCase(), route);
  console.log('operationId:', op.operationId || '(none)');
  console.log('requestBody:', rbInfo);
  console.log('responses:', resp || '(none)');
}
for (const m of ['get', 'post', 'put', 'patch', 'delete']) {
  if (ops[m]) summarize(m, ops[m]);
}
