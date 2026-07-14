const fs = require('fs');
const spec = JSON.parse(fs.readFileSync('d:/fresa/fresa-gold-frontend/.tmp-kingfisher-docs.json','utf8'));
const paths = spec.paths || {};
const schemas = spec.components?.schemas || {};

function getSchemaRef(schema) {
  if (!schema) return null;
  if (schema.$ref) return { ref: schema.$ref.split('/').pop() };
  if (schema.type === 'array' && schema.items?.$ref) return { type: 'array', ref: schema.items.$ref.split('/').pop() };
  return schema;
}

function expandSchema(name, depth=0, visited=new Set()) {
  const schema = typeof name === 'string' ? schemas[name] : name;
  if (!schema) return { missing: name };
  if (schema.$ref) {
    const refName = schema.$ref.split('/').pop();
    if (visited.has(refName)) return { $ref: refName, circular: true };
    visited = new Set(visited); visited.add(refName);
    return { $ref: refName, ...expandSchema(refName, depth+1, visited) };
  }
  const required = schema.required || [];
  const properties = {};
  for (const [k,v] of Object.entries(schema.properties || {})) {
    const entry = {
      required: required.includes(k),
      description: v.description || undefined,
    };
    if (v.enum) { entry.enum = v.enum; entry.type = v.type || 'string'; }
    else if (v.$ref) entry.$ref = v.$ref.split('/').pop();
    else if (v.type === 'array') {
      entry.type = 'array';
      if (v.items?.$ref) entry.itemsRef = v.items.$ref.split('/').pop();
      else if (v.items?.enum) { entry.itemsEnum = v.items.enum; entry.itemsType = v.items.type; }
      else entry.itemsType = v.items?.type;
    } else {
      entry.type = v.type;
      entry.format = v.format;
      entry.nullable = v.nullable;
    }
    properties[k] = entry;
  }
  const out = { type: schema.type };
  if (schema.enum) out.enum = schema.enum;
  if (Object.keys(properties).length) out.properties = properties;
  if (required.length) out.required = required;
  return out;
}

const allOps = [];
for (const [path, methods] of Object.entries(paths)) {
  for (const [method, op] of Object.entries(methods)) {
    if (!['get','post','put','patch','delete'].includes(method)) continue;
    const tags = op.tags || [];
    const jobsTag = tags.includes('Jobs');
    const jobsPath = path === '/jobs' || path.startsWith('/jobs/');
    const jobRelated = /\/jobs|convert-to-job/i.test(path) || jobsTag;
    if (!jobRelated) continue;
    const params = (op.parameters || []).map(p => ({
      name: p.name, in: p.in, required: p.required,
      schema: p.schema ? expandSchema(p.schema, 0, new Set()) : undefined,
      description: p.description
    }));
    let bodyDto = null;
    const rb = op.requestBody?.content?.['application/json']?.schema;
    if (rb?.$ref) bodyDto = rb.$ref.split('/').pop();
    else if (rb) bodyDto = expandSchema(rb, 0, new Set());
    const res = {};
    for (const [code, r] of Object.entries(op.responses || {})) {
      const sch = r.content?.['application/json']?.schema;
      res[code] = {
        description: r.description,
        dto: sch?.$ref ? sch.$ref.split('/').pop() : (sch ? 'inline' : undefined)
      };
    }
    allOps.push({
      method: method.toUpperCase(),
      path,
      operationId: op.operationId,
      summary: op.summary,
      description: op.description,
      tags,
      jobsTag,
      security: op.security,
      parameters: params,
      requestBodyDto: bodyDto,
      responses: res
    });
  }
}

const jobSchemas = Object.keys(schemas).filter(n => /job/i.test(n)).sort();
const schemaExpanded = {};
for (const n of jobSchemas) schemaExpanded[n] = expandSchema(n);

// Find all enums under job schemas recursively
const jobEnums = {};
function walkEnum(name, sch, prefix, vis=new Set()) {
  if (!sch || vis.has(name+prefix)) return;
  if (typeof sch === 'string') sch = schemas[sch];
  if (!sch) return;
  if (sch.$ref) return walkEnum(sch.$ref.split('/').pop(), schemas[sch.$ref.split('/').pop()], prefix, vis);
  if (sch.enum) jobEnums[prefix || name] = sch.enum;
  for (const [k,v] of Object.entries(sch.properties || {})) {
    if (v.enum) jobEnums[(prefix||name)+'.'+k] = v.enum;
    if (v.$ref) walkEnum(v.$ref.split('/').pop(), schemas[v.$ref.split('/').pop()], (prefix||name)+'.'+k, vis);
    if (v.items?.$ref) walkEnum(v.items.$ref.split('/').pop(), schemas[v.items.$ref.split('/').pop()], (prefix||name)+'.'+k+'[]', vis);
  }
}
for (const n of jobSchemas) walkEnum(n, schemas[n], n);

// Master data refs from job DTO fields
const masterRefs = new Set();
for (const n of jobSchemas) {
  const ex = schemaExpanded[n];
  const walk = (props, pref) => {
    if (!props) return;
    for (const [k,v] of Object.entries(props)) {
      if (v.$ref) masterRefs.add({ field: pref+'.'+k, schema: v.$ref });
      if (v.itemsRef) masterRefs.add({ field: pref+'.'+k, schema: v.itemsRef });
    }
    if (ex.properties) for (const [k,v] of Object.entries(ex.properties)) {
      if (v.$ref && !/job/i.test(v.$ref)) masterRefs.add(JSON.stringify({field:k, schema:v.$ref}));
      if (v.itemsRef && !/job/i.test(v.itemsRef)) masterRefs.add(JSON.stringify({field:k, schema:v.itemsRef}));
    }
  };
}
for (const n of jobSchemas) {
  const ex = schemaExpanded[n];
  if (!ex.properties) continue;
  for (const [k,v] of Object.entries(ex.properties)) {
    if (v.$ref && !/job/i.test(v.$ref)) masterRefs.add(JSON.stringify({field: n+'.'+k, schema: v.$ref}));
    if (v.itemsRef && !/job/i.test(v.itemsRef)) masterRefs.add(JSON.stringify({field: n+'.'+k+'[]', schema: v.itemsRef}));
  }
}

// Map master schema names to API paths
const masterPaths = {};
for (const [path, methods] of Object.entries(paths)) {
  for (const [method, op] of Object.entries(methods)) {
    if (method === 'parameters' || !op.operationId) continue;
    const tag = (op.tags||[])[0];
    if (!masterPaths[tag]) masterPaths[tag] = [];
    if (method === 'get' && !path.includes('{')) masterPaths[tag].push({ method: 'GET', path, summary: op.summary });
  }
}

const actionKeywords = ['submit','close','cancel','duplicate','delete','export','print','approve','reject','convert','void','archive'];
const actions = allOps.filter(o => actionKeywords.some(kw => o.path.toLowerCase().includes(kw) || (o.summary||'').toLowerCase().includes(kw) || (o.operationId||'').toLowerCase().includes(kw)));

fs.writeFileSync('d:/fresa/fresa-gold-frontend/.tmp-jobs-report.json', JSON.stringify({
  operations: allOps.sort((a,b)=>a.path.localeCompare(b.path)||a.method.localeCompare(b.method)),
  jobSchemas: schemaExpanded,
  jobSchemaNames: jobSchemas,
  jobEnums,
  masterFieldRefs: [...masterRefs].map(s=>JSON.parse(s)).sort((a,b)=>a.schema.localeCompare(b.schema)),
  actions,
  securitySchemes: spec.components?.securitySchemes,
  globalSecurity: spec.security,
}, null, 2));
console.log('ops', allOps.length, 'strict jobs tag', allOps.filter(o=>o.jobsTag).length);
