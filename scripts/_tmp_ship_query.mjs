const res = await fetch('https://kingfisherwings-backend.onrender.com/docs-json');
const spec = await res.json();
const t = JSON.stringify(spec);
const shipList = spec.paths['/shipments']?.get;
console.log('GET /shipments params', JSON.stringify(shipList?.parameters?.map(p => ({name:p.name, desc:p.description})), null, 2));
// job_id filter?
for (const needle of ['job_id', 'filter by job', 'listJobShipments', 'source_shipment']) {
  let idx = 0; let n = 0;
  while ((idx = t.indexOf(needle, idx)) !== -1 && n < 3) {
    console.log('\n---', needle, '---');
    console.log(t.slice(Math.max(0, idx - 60), idx + 200));
    idx += needle.length; n++;
  }
}
