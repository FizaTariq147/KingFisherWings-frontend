const fs = require("fs");
const srcPath = "d:/fresa/fresa-gold-frontend/.tmp-kingfisher-docs-fetched.json";
const outPath = "d:/fresa/fresa-gold-frontend/.tmp-invoices-swagger-summary.json";
const REF = "$" + "ref";
let buf = fs.readFileSync(srcPath);
if (buf[0]===0xEF && buf[1]===0xBB && buf[2]===0xBF) buf = buf.slice(3);
const doc = JSON.parse(buf.toString("utf8"));
const schemas = doc.components && doc.components.schemas ? doc.components.schemas : {};

function resolveRef(ref) {
  if (!ref || typeof ref !== "string") return null;
  const m = ref.match(/^#\/components\/schemas\/(.+)$/);
  if (m) return schemas[m[1]] ? { name: m[1], schema: schemas[m[1]] } : { name: m[1], schema: null };
  return null;
}

function deepResolveSchema(schema, seen, depth) {
  seen = seen || new Set();
  depth = depth || 0;
  if (!schema || depth > 12) return schema;
  if (schema[REF]) {
    const r = resolveRef(schema[REF]);
    if (!r || !r.schema) {
      const o = { unresolved: true };
      o[REF] = schema[REF];
      return o;
    }
    if (seen.has(r.name)) {
      const o = { circular: true, schemaName: r.name };
      o[REF] = schema[REF];
      return o;
    }
    seen.add(r.name);
    const resolved = deepResolveSchema(r.schema, seen, depth + 1);
    return Object.assign({ schemaName: r.name }, resolved);
  }
  const out = Object.assign({}, schema);
  if (schema.properties) {
    out.properties = {};
    for (const k of Object.keys(schema.properties)) {
      out.properties[k] = deepResolveSchema(schema.properties[k], new Set(seen), depth + 1);
    }
  }
  if (schema.items) out.items = deepResolveSchema(schema.items, new Set(seen), depth + 1);
  if (schema.allOf) out.allOf = schema.allOf.map(function(s) { return deepResolveSchema(s, new Set(seen), depth + 1); });
  if (schema.oneOf) out.oneOf = schema.oneOf.map(function(s) { return deepResolveSchema(s, new Set(seen), depth + 1); });
  if (schema.anyOf) out.anyOf = schema.anyOf.map(function(s) { return deepResolveSchema(s, new Set(seen), depth + 1); });
  if (schema.additionalProperties && typeof schema.additionalProperties === "object") {
    out.additionalProperties = deepResolveSchema(schema.additionalProperties, new Set(seen), depth + 1);
  }
  return out;
}

function summarizeParam(p) {
  const s = p.schema || {};
  let resolved = s;
  let schemaName = null;
  if (s[REF]) {
    const r = resolveRef(s[REF]);
    schemaName = r && r.name ? r.name : null;
    resolved = r && r.schema ? deepResolveSchema(r.schema) : s;
  } else {
    resolved = deepResolveSchema(s);
  }
  return {
    name: p.name,
    in: p.in,
    required: !!p.required,
    description: p.description || undefined,
    schemaName: schemaName,
    type: resolved.type || (resolved.schemaName ? "object" : undefined),
    format: resolved.format,
    enum: resolved.enum,
    default: resolved.default,
    minimum: resolved.minimum,
    maximum: resolved.maximum,
    minLength: resolved.minLength,
    maxLength: resolved.maxLength,
    schema: resolved
  };
}

function collectSchemaNames(obj, set) {
  set = set || new Set();
  if (!obj || typeof obj !== "object") return set;
  if (obj[REF] && typeof obj[REF] === "string") {
    const m = obj[REF].match(/^#\/components\/schemas\/(.+)$/);
    if (m) set.add(m[1]);
  }
  if (obj.schemaName) set.add(obj.schemaName);
  const vals = Array.isArray(obj) ? obj : Object.values(obj);
  for (let i = 0; i < vals.length; i++) {
    const v = vals[i];
    if (v && typeof v === "object") collectSchemaNames(v, set);
  }
  return set;
}

const operations = [];
const relatedSchemaNames = new Set();
const methods = ["get","post","put","patch","delete","options","head","trace"];

for (const pathKey of Object.keys(doc.paths || {})) {
  const pathItem = doc.paths[pathKey];
  for (let mi = 0; mi < methods.length; mi++) {
    const method = methods[mi];
    const op = pathItem[method];
    if (!op) continue;
    if (!(op.tags || []).includes("Invoices")) continue;

    const params = (op.parameters || []).map(summarizeParam);
    params.forEach(function(p) { collectSchemaNames(p, relatedSchemaNames); });

    let requestBody = null;
    if (op.requestBody) {
      const content = op.requestBody.content || {};
      const ctKeys = Object.keys(content);
      const json = content["application/json"] || (ctKeys.length ? content[ctKeys[0]] : null);
      let schemaName = null;
      let resolved = null;
      if (json && json.schema) {
        if (json.schema[REF]) {
          const r = resolveRef(json.schema[REF]);
          schemaName = r && r.name ? r.name : null;
          resolved = r && r.schema ? deepResolveSchema(r.schema) : json.schema;
          if (schemaName) relatedSchemaNames.add(schemaName);
        } else {
          resolved = deepResolveSchema(json.schema);
          collectSchemaNames(json.schema, relatedSchemaNames);
        }
        collectSchemaNames(resolved, relatedSchemaNames);
      }
      requestBody = {
        required: !!op.requestBody.required,
        contentTypes: ctKeys,
        schemaName: schemaName,
        schema: resolved,
        requiredFields: (resolved && resolved.required) ? resolved.required : []
      };
    }

    const responses = {};
    const respKeys = Object.keys(op.responses || {});
    for (let ri = 0; ri < respKeys.length; ri++) {
      const code = respKeys[ri];
      const resp = op.responses[code];
      const content = resp.content || {};
      const ctKeys = Object.keys(content);
      const json = content["application/json"] || (ctKeys.length ? content[ctKeys[0]] : null);
      let schemaName = null;
      let schema = null;
      if (json && json.schema) {
        if (json.schema[REF]) {
          const r = resolveRef(json.schema[REF]);
          schemaName = r && r.name ? r.name : null;
          schema = r && r.schema ? deepResolveSchema(r.schema) : json.schema;
          if (schemaName) relatedSchemaNames.add(schemaName);
        } else {
          schema = deepResolveSchema(json.schema);
          collectSchemaNames(json.schema, relatedSchemaNames);
        }
        collectSchemaNames(schema, relatedSchemaNames);
      }
      responses[code] = { description: resp.description, schemaName: schemaName, schema: schema || undefined };
    }

    operations.push({
      method: method.toUpperCase(),
      path: pathKey,
      operationId: op.operationId || null,
      summary: op.summary || null,
      description: op.description || null,
      tags: op.tags,
      parameters: {
        path: params.filter(function(p) { return p.in === "path"; }),
        query: params.filter(function(p) { return p.in === "query"; }),
        header: params.filter(function(p) { return p.in === "header"; }),
        all: params
      },
      requestBody: requestBody,
      responses: responses,
      responseCodes: Object.keys(responses)
    });
  }
}

Object.keys(schemas).forEach(function(name) {
  if (/invoice/i.test(name)) relatedSchemaNames.add(name);
});

const relatedSchemas = {};
const names = Array.from(relatedSchemaNames).sort();
for (let i = 0; i < names.length; i++) {
  const name = names[i];
  const s = schemas[name];
  if (!s) { relatedSchemas[name] = { missing: true }; continue; }
  const props = s.properties ? {} : undefined;
  if (s.properties) {
    Object.keys(s.properties).forEach(function(k) {
      const v = s.properties[k];
      const resolved = deepResolveSchema(v);
      const entry = {
        type: resolved.type,
        format: resolved.format,
        enum: resolved.enum,
        nullable: resolved.nullable,
        description: resolved.description,
        schemaName: resolved.schemaName,
        items: resolved.items,
        allOf: resolved.allOf,
        oneOf: resolved.oneOf,
        anyOf: resolved.anyOf,
        default: resolved.default,
        example: resolved.example,
        minimum: resolved.minimum,
        maximum: resolved.maximum,
        minLength: resolved.minLength,
        maxLength: resolved.maxLength,
        properties: resolved.properties,
        required: resolved.required
      };
      if (v[REF]) entry[REF] = v[REF];
      if (typeof resolved.additionalProperties === "boolean") entry.additionalProperties = resolved.additionalProperties;
      else if (resolved.additionalProperties) entry.additionalProperties = true;
      props[k] = entry;
    });
  }
  relatedSchemas[name] = {
    type: s.type,
    required: s.required || [],
    enum: s.enum,
    description: s.description,
    properties: props,
    allOf: s.allOf,
    oneOf: s.oneOf,
    anyOf: s.anyOf,
    items: s.items
  };
}

const summary = {
  source: srcPath,
  tag: "Invoices",
  openapi: doc.openapi,
  info: doc.info,
  extractedAt: new Date().toISOString(),
  endpointCount: operations.length,
  endpoints: operations,
  relatedSchemaNames: names,
  relatedSchemas: relatedSchemas
};

fs.writeFileSync(outPath, JSON.stringify(summary, null, 2));
console.log("wrote " + outPath);
console.log("endpointCount=" + operations.length);
operations.forEach(function(o) { console.log(o.method + " " + o.path + " " + (o.operationId || "")); });
console.log("---DTOs---");
names.forEach(function(n) { console.log(n); });