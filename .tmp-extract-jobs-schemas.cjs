const fs = require('fs');
const o = JSON.parse(
  fs.readFileSync(
    'C:/Users/Star/.cursor/projects/d-fresa-fresa-gold-frontend/agent-tools/204550b3-f49b-4600-91d3-20010b78a05e.txt',
    'utf8',
  ),
);
const schemas = o.components.schemas;

function flatten(s) {
  if (!s) return null;
  if (s.$ref) return { $ref: s.$ref.split('/').pop() };
  if (s.allOf) return { allOf: s.allOf.map((x) => flatten(x)) };
  if (s.type === 'object' || s.properties) {
    const props = {};
    for (const [k, v] of Object.entries(s.properties || {})) {
      props[k] = {
        type: v.type,
        format: v.format,
        enum: v.enum,
        required: (s.required || []).includes(k),
        nullable: v.nullable,
        items: v.items ? flatten(v.items) : undefined,
        $ref: v.$ref ? v.$ref.split('/').pop() : undefined,
        description: v.description,
      };
    }
    return { required: s.required || [], props };
  }
  return { type: s.type, format: s.format, enum: s.enum };
}

const names = Object.keys(schemas)
  .filter((k) => /Job|BillOfLading|Stuffing|PreAlert|Cargo|Container|Milestone|SiDto|Vgm/i.test(k))
  .sort();

const outSchemas = {};
for (const n of names) outSchemas[n] = flatten(schemas[n]);

const ops = [];
for (const [path, methods] of Object.entries(o.paths || {})) {
  for (const [method, op] of Object.entries(methods)) {
    if (!op || !op.operationId) continue;
    const tags = op.tags || [];
    if (!tags.some((t) => String(t).toLowerCase() === 'jobs')) continue;
    const body = op.requestBody?.content?.['application/json']?.schema;
    let bodyRef = null;
    if (body?.$ref) bodyRef = body.$ref.split('/').pop();
    else if (body) bodyRef = 'inline';
    ops.push({
      method: method.toUpperCase(),
      path,
      operationId: op.operationId,
      summary: op.summary || '',
      bodyRef,
      params: (op.parameters || []).map((p) => ({
        in: p.in,
        name: p.name,
        required: !!p.required,
      })),
    });
  }
}
ops.sort((a, b) => a.path.localeCompare(b.path) || a.method.localeCompare(b.method));

fs.writeFileSync(
  'd:/fresa/fresa-gold-frontend/.tmp-jobs-swagger-schemas.json',
  JSON.stringify({ count: ops.length, ops, schemaNames: names, schemas: outSchemas }, null, 2),
);
console.log('ops', ops.length);
console.log(ops.map((x) => x.method + ' ' + x.path + ' body=' + (x.bodyRef || '-')).join('\n'));
console.log('\nCreateJobDto keys:', Object.keys(outSchemas.CreateJobDto?.props || {}));
console.log('CreateJobNoteDto:', JSON.stringify(outSchemas.CreateJobNoteDto, null, 2));
console.log('GenerateJobDocumentDto:', JSON.stringify(outSchemas.GenerateJobDocumentDto, null, 2));
console.log('CreateJobCargoDto:', JSON.stringify(outSchemas.CreateJobCargoDto, null, 2));
console.log('UpdateAirJobDetailDto:', JSON.stringify(outSchemas.UpdateAirJobDetailDto, null, 2));
console.log('CreateBillOfLadingDto:', JSON.stringify(outSchemas.CreateBillOfLadingDto, null, 2));
console.log('UpdateJobMilestoneDto:', JSON.stringify(outSchemas.UpdateJobMilestoneDto, null, 2));
