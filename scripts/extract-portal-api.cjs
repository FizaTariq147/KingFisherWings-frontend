const fs = require('fs');
const spec = JSON.parse(
  fs.readFileSync(
    'C:/Users/Star/.cursor/projects/d-fresa-fresa-gold-frontend/agent-tools/29d3c520-11ad-4ada-ace8-d9db67d59168.txt',
    'utf8',
  ),
);

function resolveRef(ref) {
  if (!ref || !ref.startsWith('#/')) return null;
  const parts = ref.slice(2).split('/');
  let cur = spec;
  for (const p of parts) cur = cur?.[p];
  return cur;
}

function brief(schema, depth = 0) {
  if (!schema || depth > 4) return schema;
  if (schema.$ref) {
    const resolved = resolveRef(schema.$ref);
    return brief(resolved || { $ref: schema.$ref }, depth + 1);
  }
  if (schema.allOf) return { allOf: schema.allOf.map((s) => brief(s, depth + 1)) };
  if (schema.type === 'array') return { type: 'array', items: brief(schema.items, depth + 1) };
  if (schema.type === 'object' || schema.properties) {
    const props = {};
    for (const [k, v] of Object.entries(schema.properties || {})) {
      props[k] = brief(v, depth + 1);
    }
    return { type: 'object', required: schema.required, properties: props };
  }
  const out = { type: schema.type };
  if (schema.enum) out.enum = schema.enum;
  if (schema.format) out.format = schema.format;
  if (schema.nullable) out.nullable = true;
  return out;
}

const paths = [
  '/portal/invoices',
  '/portal/invoices/summary',
  '/portal/invoices/{id}',
  '/portal/invoices/{id}/pdf',
  '/portal/credit-notes',
  '/portal/credit-notes/{id}',
  '/portal/payments',
  '/portal/credit/summary',
  '/portal/credit/aging',
  '/portal/credit/statement',
  '/portal/credit/statement.pdf',
  '/portal/credit/limit-requests',
  '/portal/messages',
  '/portal/disputes',
  '/portal/notifications',
  '/portal/notifications/unread-count',
  '/portal/notifications/{id}/read',
  '/portal/notifications/read-all',
  '/portal-admin/messages',
  '/portal-admin/messages/{id}/read',
  '/portal-admin/disputes',
  '/portal-admin/disputes/{id}',
  '/portal-admin/credit-limit-requests',
  '/portal-admin/credit-limit-requests/{id}',
  '/track',
  '/track/embed',
  '/notifications',
  '/notifications/unread-count',
  '/notifications/{id}/read',
  '/notifications/read-all',
];

const out = [];
for (const p of paths) {
  const item = spec.paths[p];
  if (!item) {
    out.push(`\nMISSING ${p}`);
    continue;
  }
  for (const [m, op] of Object.entries(item)) {
    if (!op || typeof op !== 'object') continue;
    out.push(`\n==== ${m.toUpperCase()} ${p} ====`);
    out.push(`summary: ${op.summary}`);
    if (op.parameters) {
      out.push(
        'params: ' +
          JSON.stringify(
            op.parameters.map((x) => ({
              in: x.in,
              name: x.name,
              required: x.required,
              schema: brief(x.schema),
            })),
          ),
      );
    }
    if (op.requestBody) {
      const c = op.requestBody.content || {};
      const json = c['application/json'] || Object.values(c)[0];
      out.push('body: ' + JSON.stringify(brief(json && json.schema), null, 2));
    }
    const res =
      op.responses &&
      (op.responses['200'] || op.responses['201'] || Object.values(op.responses)[0]);
    if (res && res.content) {
      const json =
        res.content['application/json'] ||
        res.content['application/pdf'] ||
        Object.values(res.content)[0];
      const text = JSON.stringify(brief(json && json.schema), null, 2);
      out.push('response: ' + text.slice(0, 3500));
    } else if (res) {
      out.push('response desc: ' + res.description);
    }
  }
}

fs.writeFileSync('portal-api-extract.txt', out.join('\n'));
console.log('wrote', out.length, 'lines');
