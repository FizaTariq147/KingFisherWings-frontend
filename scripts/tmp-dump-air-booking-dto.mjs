import fs from 'fs';

const j = JSON.parse(fs.readFileSync('.tmp-openapi/air-booking-openapi.json', 'utf8'));
const schemas = j.components.schemas;

function refName(v) {
  if (!v) return '';
  if (v.$ref) return String(v.$ref).replace('#/components/schemas/', '');
  return '';
}

function dump(name) {
  const s = schemas[name];
  if (!s) {
    console.log(name, 'MISSING');
    return;
  }
  console.log('\n===' + name + '===');
  if (s.description) console.log('desc:', String(s.description).slice(0, 300));
  if (s.required) console.log('required:', JSON.stringify(s.required));
  const props = s.properties || {};
  for (const [k, v] of Object.entries(props)) {
    let t = refName(v) || v.type || JSON.stringify(v).slice(0, 100);
    const bits = [];
    if ((s.required || []).includes(k)) bits.push('REQ');
    if (v.maxLength != null) bits.push('maxLen=' + v.maxLength);
    if (v.minLength != null) bits.push('minLen=' + v.minLength);
    if (v.maximum != null) bits.push('max=' + v.maximum);
    if (v.minimum != null) bits.push('min=' + v.minimum);
    if (v.enum) bits.push('enum=' + v.enum.join('|'));
    if (v.format) bits.push(v.format);
    if (v.nullable) bits.push('nullable');
    if (v.items) bits.push('items=' + (refName(v.items) || v.items.type || ''));
    if (v.description) bits.push(String(v.description).slice(0, 80));
    console.log('  ' + k + ': ' + t + (bits.length ? ' [' + bits.join(', ') + ']' : ''));
  }
}

const names = Object.keys(schemas)
  .filter((s) => /compliance|BookingForm|AirBooking|SubmitNvocc/i.test(s))
  .sort();
console.log('schema names:\n' + names.join('\n'));
names.forEach(dump);

console.log('\n---paths---');
for (const p of Object.keys(j.paths).sort()) {
  if (!/compliance|booking-form|air-booking|air\/compliance/i.test(p)) continue;
  for (const m of Object.keys(j.paths[p])) {
    const op = j.paths[p][m];
    const body = op.requestBody?.content?.['application/json']?.schema;
    console.log(m.toUpperCase(), p);
    console.log('  body:', refName(body) || (body ? JSON.stringify(body).slice(0, 160) : '-'));
    console.log('  summary:', op.summary || '');
  }
}
