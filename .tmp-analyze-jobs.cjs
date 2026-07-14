const fs = require('fs');
const spec = JSON.parse(fs.readFileSync('d:/fresa/fresa-gold-frontend/.tmp-kingfisher-docs.json','utf8'));
const paths = spec.paths || {};
const schemas = spec.components?.schemas || {};

const jobPaths = [];
for (const [path, methods] of Object.entries(paths)) {
  const isJobPath = /job/i.test(path);
  for (const [method, op] of Object.entries(methods)) {
    if (!['get','post','put','patch','delete'].includes(method)) continue;
    const opTags = op.tags || [];
    const isJobTag = opTags.some(t => /job/i.test(t));
    if (isJobPath || isJobTag) {
      jobPaths.push({
        method: method.toUpperCase(),
        path,
        operationId: op.operationId,
        summary: op.summary,
        tags: opTags,
        security: op.security,
        parameters: op.parameters,
        requestBody: op.requestBody,
        responses: Object.fromEntries(Object.entries(op.responses||{}).map(([c,r])=>[c,{description:r.description,schema:r.content?.['application/json']?.schema}]))
      });
    }
  }
}

const jobSchemaNames = Object.keys(schemas).filter(n => /job/i.test(n));

function flattenSchema(schema, visited = new Set()) {
  if (!schema) return null;
  if (schema.$ref) {
    const name = schema.$ref.split('/').pop();
    if (visited.has(name)) return { $ref: name, circular: true };
    visited.add(name);
    return { $ref: name, ...flattenSchema(schemas[name], new Set(visited)) };
  }
  const required = schema.required || [];
  const properties = {};
  if (schema.properties) {
    for (const [k, v] of Object.entries(schema.properties)) {
      properties[k] = {
        required: required.includes(k),
        type: v.type,
        format: v.format,
        enum: v.enum,
        nullable: v.nullable,
        description: v.description,
        ref: v.$ref ? v.$ref.split('/').pop() : undefined,
        itemsRef: v.items?.$ref ? v.items.$ref.split('/').pop() : undefined,
        itemsType: v.items?.type,
        itemsEnum: v.items?.enum
      };
    }
  }
  return { type: schema.type, enum: schema.enum, required, properties };
}

const schemaDetails = {};
for (const name of jobSchemaNames.sort()) {
  schemaDetails[name] = flattenSchema(schemas[name]);
}

const refs = new Set();
function collectRefs(obj) {
  if (!obj || typeof obj !== 'object') return;
  const s = JSON.stringify(obj);
  const matches = s.match(/#\/components\/schemas\/([A-Za-z0-9_]+)/g) || [];
  matches.forEach(m => refs.add(m.split('/').pop()));
}
jobPaths.forEach(p => collectRefs(p));
jobSchemaNames.forEach(n => collectRefs(schemas[n]));

const enums = {};
for (const name of jobSchemaNames) {
  const walk = (sch, prefix) => {
    if (!sch) return;
    if (sch.enum) enums[prefix] = sch.enum;
    if (sch.properties) {
      for (const [k,v] of Object.entries(sch.properties)) {
        if (v.enum) enums[prefix+'.'+k] = v.enum;
        if (v.$ref) walk(schemas[v.$ref.split('/').pop()], prefix+'.'+k);
        if (v.items?.$ref) walk(schemas[v.items.$ref.split('/').pop()], prefix+'.'+k+'[]');
      }
    }
  };
  walk(schemas[name], name);
}

fs.writeFileSync('d:/fresa/fresa-gold-frontend/.tmp-jobs-analysis.json', JSON.stringify({
  jobPaths,
  jobSchemaNames: jobSchemaNames.sort(),
  schemaDetails,
  securitySchemes: spec.components?.securitySchemes,
  globalSecurity: spec.security,
  relatedSchemaRefs: [...refs].filter(r => !/job/i.test(r)).sort(),
  enums
}, null, 2));
console.log('done', jobPaths.length, 'paths', jobSchemaNames.length, 'schemas');
