const res = await fetch('https://kingfisherwings-backend.onrender.com/docs-json');
const spec = await res.json();

const paths = [
  '/jobs/{id}/invoices/purchase/bulk',
  '/jobs/{id}/invoices/purchase',
  '/jobs/{id}/edi/types',
  '/jobs/{id}/edi/generate',
  '/jobs/{id}/edi/submissions',
  '/jobs/{id}/edi/submissions/{submissionId}/download',
  '/shipments/{id}/edi/types',
  '/shipments/{id}/edi/generate',
  '/shipments/{id}/edi/submissions',
  '/shipments/{id}/edi/submissions/{submissionId}/download',
];

for (const p of paths) {
  console.log('\n========', p, '========');
  console.log(JSON.stringify(spec.paths[p] ?? 'MISSING', null, 2)?.slice(0, 3500));
}

for (const name of Object.keys(spec.components?.schemas || {}).filter((n) =>
  /Edi|PurchaseBulk|BulkPurchase|InvoiceBulk/i.test(n),
)) {
  console.log('\n--- SCHEMA', name, '---');
  console.log(JSON.stringify(spec.components.schemas[name], null, 2).slice(0, 2500));
}
