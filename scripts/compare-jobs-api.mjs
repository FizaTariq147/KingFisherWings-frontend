import fs from 'fs';

const spec = JSON.parse(
  fs.readFileSync(
    process.argv[2] ||
      'C:/Users/fizat/.cursor/projects/d-KingFisherWings-frontend/agent-tools/0111a093-a9bf-4a3f-bfc3-6d2850aab6f1.txt',
    'utf8',
  ),
);
const feApi = fs.readFileSync('src/features/jobs/api/job.api.ts', 'utf8');
const svc = fs.readFileSync('src/features/jobs/services/job.service.ts', 'utf8');

function norm(path) {
  return path.replace(/\{[^}]+\}/g, '{id}');
}

const fePaths = new Set();
for (const m of feApi.matchAll(/(?:['`])(\/jobs[^'"`$]*)(?:['`])/g)) {
  fePaths.add(norm(m[1]));
}
for (const m of feApi.matchAll(/`(\/jobs\/\$\{[^}]+\}[^`]*)`/g)) {
  fePaths.add(norm(m[1].replace(/\$\{[^}]+\}/g, '{id}')));
}

const ops = [];
for (const [path, methods] of Object.entries(spec.paths)) {
  if (!path.startsWith('/jobs')) continue;
  for (const method of Object.keys(methods)) {
    if (method === 'parameters') continue;
    ops.push({ method: method.toUpperCase(), path: norm(path) });
  }
}

function covered(apiPath) {
  if (fePaths.has(apiPath)) return true;
  const slug = apiPath.split('/').pop();
  return svc.includes(apiPath) || svc.includes(`'${slug}'`) || feApi.includes(slug);
}

const missing = ops.filter((op) => !covered(op.path));
console.log('OpenAPI job ops:', ops.length);
console.log('Frontend paths:', fePaths.size);
console.log('Missing:', missing.length);
missing.forEach((op) => console.log(op.method, op.path));
if (missing.length === 0) process.exit(0);
process.exit(1);
