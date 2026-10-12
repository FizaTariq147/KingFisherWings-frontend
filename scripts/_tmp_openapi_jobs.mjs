import fs from 'fs';

const j = JSON.parse(
  fs.readFileSync(
    'C:/Users/fizat/.cursor/projects/d-KingFisherWings-frontend/agent-tools/82dac76f-9d9e-4404-ae61-c55f5e68dc4e.txt',
    'utf8',
  ),
);

const paths = [
  '/jobs/status-options',
  '/jobs/{id}/change-status',
  '/jobs/{id}/reopen',
  '/jobs/{id}/stop',
  '/jobs/{id}/close',
  '/jobs/{id}/detail',
  '/jobs/{id}/detail/{tab}',
  '/jobs/{id}/organization/client-reference',
  '/jobs/{id}/dimensions',
  '/jobs/{id}/gpum',
  '/jobs/{id}/containers/storage-charges/calculate',
  '/jobs/{id}/containers/storage-charges/confirm-to-costing',
  '/jobs/{id}/charges/{chargeId}/attachments',
  '/documentation/jobs',
  '/documentation/jobs/create-wizard',
  '/documentation/jobs/create',
  '/operations/import-cargo-delivery',
  '/operations/import-cargo-delivery/{jobId}',
  '/operations/dashboard',
  '/operations/closed-job-report',
  '/operations/closed-job-report/download',
  '/organization/settings/job-date',
];

function refOf(schema) {
  if (!schema) return '';
  if (schema.$ref) return schema.$ref;
  if (schema.type === 'array' && schema.items) {
    return `array<${schema.items.$ref || schema.items.type || ''}>`;
  }
  if (schema.properties) return `props:${Object.keys(schema.properties).slice(0, 25).join(',')}`;
  if (schema.allOf) return `allOf:${schema.allOf.map((x) => x.$ref || x.type).join('+')}`;
  return schema.type || '';
}

for (const p of paths) {
  const op = j.paths[p];
  if (!op) {
    console.log(p + ': MISSING');
    continue;
  }
  console.log('\n' + p);
  for (const m of Object.keys(op)) {
    const o = op[m];
    const params = (o.parameters || []).map((x) => {
      const s = x.schema || {};
      return `${x.name}:${x.in}${s.enum ? `[${s.enum.join('|')}]` : ''}`;
    });
    const body = o.requestBody?.content?.['application/json']?.schema;
    const resp = o.responses?.['200'] || o.responses?.['201'] || o.responses?.['204'];
    const rschema = resp?.content?.['application/json']?.schema;
    console.log(
      `  ${m.toUpperCase()} params=${JSON.stringify(params)} body=${refOf(body)} resp=${refOf(rschema)} | ${o.summary || o.operationId || ''}`,
    );
  }
}

const comps = j.components?.schemas || {};
const names = Object.keys(comps).filter((k) =>
  /JobStatus|ChangeJob|JobDetail|Gpum|ClientReference|Dimension|JobDate|StorageCharge|ImportCargo|ClosedJob|CreateWizard|DocumentationJob|JobAction|JobTab/i.test(
    k,
  ),
);
console.log('\n--- SCHEMAS ---');
for (const n of names.slice(0, 50)) {
  console.log('\n' + n + ': ' + JSON.stringify(comps[n]).slice(0, 1200));
}
