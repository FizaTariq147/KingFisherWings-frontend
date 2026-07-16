const fs = require('fs');
const path = require('path');

const swaggerPath = path.join(__dirname, '.tmp-swagger-full.json');
const raw = JSON.parse(fs.readFileSync(swaggerPath, 'utf8'));
const comps = raw.components?.schemas ?? {};

function resolve(schema, depth = 0) {
  if (!schema || depth > 6) return schema;
  if (schema.$ref) {
    const name = schema.$ref.split('/').pop();
    return resolve(comps[name], depth + 1);
  }
  if (schema.allOf) {
    return Object.assign({}, ...schema.allOf.map((s) => resolve(s, depth + 1)));
  }
  if (schema.type === 'object' && schema.properties) {
    const props = {};
    for (const [k, v] of Object.entries(schema.properties)) {
      props[k] = resolve(v, depth + 1);
    }
    return { ...schema, properties: props };
  }
  if (schema.type === 'array' && schema.items) {
    return { ...schema, items: resolve(schema.items, depth + 1) };
  }
  return schema;
}

const chequePaths = {};
for (const [p, ops] of Object.entries(raw.paths ?? {})) {
  if (!/cheque/i.test(p)) continue;
  chequePaths[p] = {};
  for (const [method, op] of Object.entries(ops)) {
    const body = op.requestBody?.content?.['application/json']?.schema;
    const res =
      op.responses?.['200']?.content?.['application/json']?.schema ||
      op.responses?.['201']?.content?.['application/json']?.schema;
    chequePaths[p][method] = {
      summary: op.summary,
      operationId: op.operationId,
      parameters: op.parameters,
      requestBody: body ? resolve(body) : undefined,
      response: res ? resolve(res) : undefined,
    };
  }
}

const chequeSchemas = {};
for (const [k, v] of Object.entries(comps)) {
  if (/cheque|pdc/i.test(k)) chequeSchemas[k] = v;
}

const out = { paths: chequePaths, schemas: chequeSchemas };
fs.writeFileSync(path.join(__dirname, '.tmp-cheques-swagger.json'), JSON.stringify(out, null, 2));
console.log('paths', Object.keys(chequePaths).length);
console.log('schemas', Object.keys(chequeSchemas).join(', '));
