import fs from 'fs';
const t = fs.readFileSync(
  'C:/Users/fizat/.cursor/projects/d-KingFisherWings-frontend/agent-tools/8b042752-31d4-47fb-b00d-da7903fee19c.txt',
  'utf8',
);
const set = new Set(
  [...t.matchAll(/"(QUOTE_[A-Z0-9_]+|BOOKING_FORM_[A-Z0-9_]+|CUSTOMER_[A-Z0-9_]+|CS_[A-Z0-9_]+|INVOICE_[A-Z0-9_]+|INTERMEDIATE_[A-Z0-9_]+)"/g)].map(
    (x) => x[1],
  ),
);
console.log([...set].sort().join('\n'));
const hits = [...t.matchAll(/intermediate stages[^\"]{0,80}/gi)];
console.log('hits', hits.slice(0, 5));
const j = JSON.parse(t);
for (const [name, schema] of Object.entries(j.components?.schemas || {})) {
  const s = JSON.stringify(schema);
  if (s.includes('QUOTE_SENT') || s.includes('BOOKING_FORM_COMPLETE')) {
    console.log('schema', name, s.slice(0, 1200));
  }
}
