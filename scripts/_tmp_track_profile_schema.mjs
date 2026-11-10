import fs from 'fs';

const j = JSON.parse(
  fs.readFileSync(
    'C:/Users/fizat/.cursor/projects/d-KingFisherWings-frontend/agent-tools/36561aa7-c244-4aa5-86c3-a113b7a75770.txt',
    'utf8',
  ),
);

function resolve(s) {
  if (!s) return s;
  if (s.$ref) {
    const p = s.$ref.replace('#/', '').split('/');
    let cur = j;
    for (const k of p) cur = cur?.[k];
    return resolve(cur);
  }
  return s;
}

const put = j.paths['/jobs/{id}/tracking/profile']?.put;
const get = j.paths['/jobs/{id}/tracking/profile']?.get;
const schema = resolve(put?.requestBody?.content?.['application/json']?.schema);
console.log('=== PUT properties ===');
console.log(Object.keys(schema?.properties || {}));
for (const [k, v] of Object.entries(schema?.properties || {})) {
  const r = resolve(v);
  const keys = r?.properties ? Object.keys(r.properties) : null;
  const itemKeys =
    r?.items ? Object.keys(resolve(r.items)?.properties || {}) : null;
  console.log(`\n${k}:`, keys || itemKeys || r?.type || r);
}

const getSchema = resolve(
  get?.responses?.['200']?.content?.['application/json']?.schema,
);
console.log('\n=== GET 200 top keys ===');
console.log(Object.keys(resolve(getSchema)?.properties || getSchema || {}));

// Search schemas for flight
const comps = j.components?.schemas || {};
for (const [name, sch] of Object.entries(comps)) {
  const text = JSON.stringify(sch);
  if (/flight/i.test(text) && /tracking|Track|profile|Profile|Leg/i.test(name + text.slice(0, 200))) {
    console.log('\nSCHEMA', name, Object.keys(sch.properties || {}).slice(0, 40));
  }
}
