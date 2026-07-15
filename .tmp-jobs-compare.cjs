const fs = require('fs');
const data = JSON.parse(fs.readFileSync('.tmp-jobs-swagger-schemas.json', 'utf8'));
const o = JSON.parse(
  fs.readFileSync(
    'C:/Users/Star/.cursor/projects/d-fresa-fresa-gold-frontend/agent-tools/204550b3-f49b-4600-91d3-20010b78a05e.txt',
    'utf8',
  ),
);

let exact = 0;
let loose = 0;
const tagSet = new Set();
for (const methods of Object.values(o.paths || {})) {
  for (const op of Object.values(methods)) {
    if (!op || !op.operationId) continue;
    const tags = op.tags || [];
    tags.forEach((t) => tagSet.add(t));
    if (tags.includes('Jobs')) exact++;
    if (tags.some((t) => String(t).toLowerCase() === 'jobs')) loose++;
  }
}
console.log('exact Jobs:', exact);
console.log('loose jobs:', loose);
console.log(
  'job-like tags:',
  [...tagSet].filter((t) => /job/i.test(t)).join(', '),
);

console.log('\n=== OPS METHOD PATH bodyRef ===');
for (const x of data.ops) {
  console.log(x.method + ' ' + x.path + ' ' + (x.bodyRef || '-'));
}

console.log('\n=== DTO props (* = required) ===');
for (const name of Object.keys(data.schemas).sort()) {
  const s = data.schemas[name];
  if (!s || !s.props) {
    console.log('\n### ' + name + ': (no props) ' + JSON.stringify(s)?.slice(0, 160));
    continue;
  }
  const keys = Object.entries(s.props).map(([k, v]) => k + (v.required ? '*' : ''));
  console.log(
    '\n### ' + name + ' required=[' + (s.required || []).join(',') + ']',
  );
  console.log(keys.join(', '));
}

const apiSrc = fs.readFileSync('src/features/jobs/api/job.api.ts', 'utf8');
const jobApiPaths = new Set();
const re = /`(\/jobs\/[^`]+)`/g;
let m;
while ((m = re.exec(apiSrc))) {
  jobApiPaths.add(m[1].replace(/\$\{([^}]+)\}/g, '{$1}'));
}
const re2 = /'(\/jobs[^']*)'/g;
while ((m = re2.exec(apiSrc))) jobApiPaths.add(m[1]);
const re3 = /"(\/jobs[^"]*)"/g;
while ((m = re3.exec(apiSrc))) jobApiPaths.add(m[1]);

const swaggerPaths = [...new Set(data.ops.map((x) => x.path))].sort();
const missingPaths = swaggerPaths.filter((p) => !jobApiPaths.has(p));

console.log('\n=== JOB_API paths (' + jobApiPaths.size + ') ===');
[...jobApiPaths].sort().forEach((p) => console.log('  ' + p));

console.log('\n=== MISSING from JOB_API (' + missingPaths.length + ') ===');
missingPaths.forEach((p) => {
  const methods = data.ops
    .filter((op) => op.path === p)
    .map((op) => op.method)
    .join(',');
  console.log('  ' + methods + ' ' + p);
});
