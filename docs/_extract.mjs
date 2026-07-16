import { readFileSync, writeFileSync } from 'node:fs';

const raw = readFileSync(
  'C:/Users/Star/.cursor/projects/d-fresa-fresa-gold-frontend/agent-tools/b51df064-79e6-4bdc-bec2-7c8a49626497.txt',
  'utf8',
);
const spec = JSON.parse(raw);
const out = {
  CreateTenantDto: spec.components.schemas.CreateTenantDto,
  CreateCompanyDto: spec.components.schemas.CreateCompanyDto,
  companiesPaths: Object.fromEntries(
    Object.entries(spec.paths).filter(([p]) => p.includes('compan')),
  ),
};
writeFileSync('docs/_schema-extract.json', JSON.stringify(out, null, 2));
console.log('written');
