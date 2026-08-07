const fs = require('fs');
const spec = JSON.parse(
  fs.readFileSync(
    'C:/Users/Star/.cursor/projects/d-fresa-fresa-gold-frontend/agent-tools/b3241ed5-9bc0-4eae-9254-82cf2b0e5932.txt',
    'utf8',
  ),
);
const keys = Object.keys(spec.paths).filter((p) => /dispute|portal-admin/i.test(p));
for (const p of keys) {
  console.log('\n' + p, Object.keys(spec.paths[p]));
  for (const [m, op] of Object.entries(spec.paths[p])) {
    if (!op || typeof op !== 'object') continue;
    console.log(
      m.toUpperCase(),
      op.summary,
      'params:',
      JSON.stringify((op.parameters || []).map((x) => ({ in: x.in, name: x.name, required: x.required }))),
    );
    if (op.requestBody) {
      const ref =
        op.requestBody.content?.['application/json']?.schema?.$ref ||
        JSON.stringify(op.requestBody.content?.['application/json']?.schema);
      console.log(' body:', ref);
    }
  }
}
