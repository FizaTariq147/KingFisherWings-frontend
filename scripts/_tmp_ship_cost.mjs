const res = await fetch('https://kingfisherwings-backend.onrender.com/docs-json');
const spec = await res.json();
const t = JSON.stringify(spec);

function pathOps(path) {
  const p = spec.paths?.[path];
  if (!p) return null;
  return Object.fromEntries(
    Object.entries(p).map(([m, op]) => [
      m,
      {
        operationId: op.operationId,
        summary: op.summary,
        body: op.requestBody?.content?.['application/json']?.schema,
        resp: op.responses?.['200']?.content?.['application/json']?.schema,
      },
    ]),
  );
}

console.log('=== /jobs/{id}/shipments ===');
console.log(JSON.stringify(pathOps('/jobs/{id}/shipments'), null, 2)?.slice(0, 2000));
console.log('=== /jobs/{id}/detail/{tab} ===');
console.log(JSON.stringify(pathOps('/jobs/{id}/detail/{tab}'), null, 2)?.slice(0, 800));

for (const name of [
  'JobShipmentsBodyDto',
  'JobCharge',
  'JobChargeDto',
  'CreateJobChargeDto',
  'JobChargesResponse',
]) {
  const sch = spec.components?.schemas?.[name];
  if (sch) {
    console.log('\nSCHEMA', name, JSON.stringify(sch, null, 2)?.slice(0, 1200));
  }
}

// charge-related paths
const chargePaths = Object.keys(spec.paths || {}).filter((p) =>
  /jobs\/\{id\}.*(charge|costing|attachment)/i.test(p),
);
console.log('\nCHARGE PATHS', chargePaths.slice(0, 40));

for (const p of chargePaths.slice(0, 25)) {
  const ops = pathOps(p);
  console.log('\n', p, Object.keys(ops || {}), ops?.get?.summary || ops?.post?.summary || ops?.patch?.summary);
}
