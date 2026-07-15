const fs = require('fs');
const paths = [
  'C:/Users/Star/.cursor/projects/d-fresa-fresa-gold-frontend/agent-tools/afd4a601-3c1b-4109-8970-3557b63387f0.txt',
  'd:/fresa/fresa-gold-frontend/.tmp-kingfisher-docs-fetched.json',
];
let j = null;
for (const p of paths) {
  try {
    j = JSON.parse(fs.readFileSync(p, 'utf8'));
    console.log('source', p);
    break;
  } catch {}
}
if (!j) {
  console.error('no docs');
  process.exit(1);
}
const endpoints = [];
for (const [path, methods] of Object.entries(j.paths || {})) {
  for (const [method, op] of Object.entries(methods)) {
    if (!op || typeof op !== 'object') continue;
    if (!(op.tags || []).includes('Payment Requests')) continue;
    endpoints.push({
      method: method.toUpperCase(),
      path,
      operationId: op.operationId,
      summary: op.summary,
      parameters: op.parameters || [],
      requestBody: op.requestBody
        ? {
            required: op.requestBody.required,
            schema: op.requestBody.content?.['application/json']?.schema,
          }
        : null,
      responses: Object.keys(op.responses || {}),
    });
  }
}
function resolve(schema, depth = 0) {
  if (!schema || depth > 6) return schema;
  if (schema.$ref) {
    const name = schema.$ref.split('/').pop();
    const s = j.components?.schemas?.[name];
    return { schemaName: name, ...resolve(s, depth + 1) };
  }
  if (schema.items) schema = { ...schema, items: resolve(schema.items, depth + 1) };
  if (schema.properties) {
    const props = {};
    for (const [k, v] of Object.entries(schema.properties)) props[k] = resolve(v, depth + 1);
    schema = { ...schema, properties: props };
  }
  return schema;
}
for (const e of endpoints) {
  if (e.requestBody?.schema) e.requestBody.schema = resolve(e.requestBody.schema);
}
const related = {};
for (const name of Object.keys(j.components?.schemas || {})) {
  if (/payment.?request/i.test(name) || /PaymentRequest/i.test(name)) {
    related[name] = resolve(j.components.schemas[name]);
  }
}
const out = { endpointCount: endpoints.length, endpoints, relatedSchemas: related };
fs.writeFileSync(
  'd:/fresa/fresa-gold-frontend/.tmp-payment-requests-swagger-summary.json',
  JSON.stringify(out, null, 2),
);
console.log('count', endpoints.length);
for (const e of endpoints) console.log(e.method, e.path, e.operationId);
console.log('schemas', Object.keys(related));
