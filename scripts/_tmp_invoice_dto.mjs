const res = await fetch('https://kingfisherwings-backend.onrender.com/docs-json');
const spec = await res.json();
for (const name of [
  'JobInvoiceFromChargesDto',
  'GenerateJobEdiDto',
  'GenerateShipmentEdiDto',
]) {
  console.log('\n---', name, '---');
  console.log(JSON.stringify(spec.components.schemas[name], null, 2));
}
