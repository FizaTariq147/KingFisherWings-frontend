import https from 'https';

function get(url) {
  return new Promise((res, rej) => {
    https
      .get(url, (r) => {
        let d = '';
        r.on('data', (c) => (d += c));
        r.on('end', () => res(d));
      })
      .on('error', rej);
  });
}

const spec = JSON.parse(await get('https://kingfisherwings-backend.onrender.com/docs-json'));
const paths = [
  '/portal/invoices/{id}/payments',
  '/tenants/{id}/features',
  '/tenants/{id}',
  '/users/permission-matrix',
  '/users/role-presets',
  '/payment-proofs/{id}/reject',
  '/payment-proofs/{id}/acknowledge',
];

for (const p of paths) {
  const ops = spec.paths[p];
  if (!ops) {
    console.log('MISSING', p);
    continue;
  }
  console.log('\n===', p, '===');
  for (const m of Object.keys(ops)) {
    const op = ops[m];
    console.log(m.toUpperCase(), op.summary || '');
    console.log((op.description || '').slice(0, 700));
    const content = op.requestBody?.content;
    if (!content) continue;
    for (const [ct, v] of Object.entries(content)) {
      const ref = v.schema?.$ref;
      if (ref) {
        const name = ref.split('/').pop();
        console.log('SCHEMA', name, JSON.stringify(spec.components.schemas[name], null, 2).slice(0, 2500));
      } else {
        console.log('CT', ct, JSON.stringify(v.schema, null, 2).slice(0, 2000));
      }
    }
  }
}

const mod = Object.keys(spec.components?.schemas || {}).filter((k) =>
  /enabled|TenantFeature|Module|UpdateTenantFeature|FeaturesDto/i.test(k),
);
console.log('\nSCHEMAS', mod);
for (const k of mod.slice(0, 25)) {
  console.log('---', k, '\n', JSON.stringify(spec.components.schemas[k], null, 2).slice(0, 1600));
}
