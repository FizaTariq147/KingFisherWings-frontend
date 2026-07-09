import fs from 'fs';
const spec = JSON.parse(fs.readFileSync('D:/fresa/fresa-gold-frontend/docs/openapi.json','utf8'));
const tenantPaths = {};
for (const [p,m] of Object.entries(spec.paths||{})) if(p.toLowerCase().includes('tenant')) tenantPaths[p]=m;
const refs=new Set();
function collect(o){ if(!o||typeof o!=='object')return; if(o.$ref)refs.add(o.$ref); for(const v of Object.values(o)) Array.isArray(v)?v.forEach(collect):collect(v);}
for(const m of Object.values(tenantPaths)) collect(m);
const sn=r=>r&&r.startsWith('#/components/schemas/')?r.slice(21):null;
const endpointSchemas=new Set();
for(const r of refs){ const n=sn(r); if(n) endpointSchemas.add(n); }
const toResolve=[...endpointSchemas];
const all=new Set(toResolve);
while(toResolve.length){
  const name=toResolve.pop();
  const s=spec.components?.schemas?.[name];
  if(!s) continue;
  refs.clear(); collect(s);
  for(const r of refs){ const n=sn(r); if(n&&!all.has(n)){ all.add(n); toResolve.push(n);} }
}
const wanted=new Set(['CreateTenantDto','UpdateTenantDto','PaginationMetaResponse',...all]);
for(const k of Object.keys(spec.components?.schemas||{})) if(k.toLowerCase().includes('tenant')) wanted.add(k);
const schemas={};
for(const name of [...wanted].sort()){
  const s=spec.components?.schemas?.[name];
  if(s) schemas[name]=s;
}
const out={paths:tenantPaths,components:{securitySchemes:spec.components?.securitySchemes||{},schemas},tenantEndpointReferencedSchemas:[...endpointSchemas].sort(),transitiveSchemaClosure:[...all].sort()};
fs.writeFileSync('D:/fresa/fresa-gold-frontend/docs/tenant-openapi-extract.json', JSON.stringify(out,null,2));
console.log(JSON.stringify({endpointSchemas:[...endpointSchemas].sort(),transitive:[...all].sort(),schemaKeys:Object.keys(schemas).sort()},null,2));
