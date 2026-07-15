const fs = require('fs');
const data = JSON.parse(fs.readFileSync('.tmp-jobs-swagger-schemas.json', 'utf8'));
const o = JSON.parse(
  fs.readFileSync(
    'C:/Users/Star/.cursor/projects/d-fresa-fresa-gold-frontend/agent-tools/204550b3-f49b-4600-91d3-20010b78a05e.txt',
    'utf8',
  ),
);
const schemas = o.components.schemas;
const bodyRefs = [...new Set(data.ops.map((x) => x.bodyRef).filter(Boolean))].sort();
console.log('bodyRefs from ops:', bodyRefs.length);
const missing = bodyRefs.filter((n) => !data.schemas[n]);
console.log('missing from out schemas:', missing);

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
        description: v.description,
      };
    }
    return { required: s.required || [], props };
  }
  return { type: s.type, format: s.format, enum: s.enum };
}

console.log('\n=== missing bodyRef DTO props ===');
for (const n of missing) {
  const s = flatten(schemas[n]);
  if (!s || !s.props) {
    console.log('\n### ' + n + ': ' + JSON.stringify(s));
    continue;
  }
  const keys = Object.entries(s.props).map(([k, v]) => k + (v.required ? '*' : ''));
  console.log('\n### ' + n + ' required=[' + (s.required || []).join(',') + ']');
  console.log(keys.join(', '));
}
