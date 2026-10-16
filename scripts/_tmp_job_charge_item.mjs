const res = await fetch('https://kingfisherwings-backend.onrender.com/docs-json');
const spec = await res.json();
const schemas = spec.components?.schemas ?? {};
for (const name of Object.keys(schemas)) {
  if (/JobCharge/i.test(name) || /ChargeLine/i.test(name) || /ChargeList/i.test(name)) {
    console.log('\n====', name, '====');
    console.log(JSON.stringify(schemas[name], null, 2).slice(0, 2500));
  }
}
