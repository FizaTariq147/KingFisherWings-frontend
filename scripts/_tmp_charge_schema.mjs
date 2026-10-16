const res = await fetch('https://kingfisherwings-backend.onrender.com/docs-json');
const spec = await res.json();
const t = JSON.stringify(spec);

// Find charge attachment schema / side param
const att = spec.paths['/jobs/{id}/charges/{chargeId}/attachments'];
console.log('ATTACH', JSON.stringify(att, null, 2).slice(0, 2500));

const sale = spec.paths['/jobs/{id}/charges/{chargeId}/sale'];
console.log('\nSALE PATCH', JSON.stringify(sale, null, 2).slice(0, 1500));
const cost = spec.paths['/jobs/{id}/charges/{chargeId}/cost'];
console.log('\nCOST PATCH', JSON.stringify(cost, null, 2).slice(0, 1500));

// Search for line_no, attachment_count, can_edit in schemas
for (const needle of [
  'attachment_count',
  'attachments_count',
  'has_attachments',
  'line_no',
  'line_number',
  'can_edit_sale',
  'can_edit_cost',
  'sale_attachments',
  'cost_attachments',
  'PatchJobChargeSale',
  'PatchJobChargeCost',
  'JobChargeLine',
]) {
  let idx = 0;
  let n = 0;
  while ((idx = t.indexOf(needle, idx)) !== -1 && n < 2) {
    console.log('\n---', needle, '---');
    console.log(t.slice(Math.max(0, idx - 100), idx + 250));
    idx += needle.length;
    n++;
  }
}

// list charges response description
const charges = spec.paths['/jobs/{id}/charges']?.get;
console.log('\nLIST CHARGES', JSON.stringify(charges, null, 2).slice(0, 2000));
