import fs from 'fs';

const res = await fetch('https://kingfisherwings-backend.onrender.com/docs-json');
const spec = await res.json();
fs.writeFileSync('scripts/_openapi-wh.json', JSON.stringify(spec));
const schemas = spec.components.schemas;

function typeOf(v) {
  if (!v) return '?';
  if (v.$ref) return v.$ref.replace('#/components/schemas/', '');
  if (v.anyOf) return 'anyOf(' + v.anyOf.map(typeOf).join('|') + ')';
  if (v.oneOf) return 'oneOf(' + v.oneOf.map(typeOf).join('|') + ')';
  if (v.allOf) return 'allOf(' + v.allOf.map(typeOf).join('+') + ')';
  if (v.type === 'array') return 'array<' + typeOf(v.items) + '>';
  if (v.enum) return 'enum[' + v.enum.join(',') + ']';
  return v.type || '?';
}

function dump(name) {
  const s = schemas[name];
  if (!s) {
    console.log('MISSING', name);
    return;
  }
  console.log('\n====', name, '====');
  console.log('required:', JSON.stringify(s.required || []));
  for (const [k, v] of Object.entries(s.properties || {})) {
    const ex = v.example != null ? ' ex=' + JSON.stringify(v.example) : '';
    const desc = v.description ? ' — ' + String(v.description).slice(0, 90) : '';
    console.log(' ', k + ':', typeOf(v) + ex + desc);
  }
}

[
  'UpsertWarehouseBookingFormDto',
  'WhStockLineInputDto',
  'BookingFormPartyDto',
  'PortalQuotationRequestDto',
  'PortalQuotationEstimateDto',
  'CreateQuotationDto',
  'CreateQuotationLineDto',
  'CargoPackageDto',
  'PortalCustomerLineDto',
  'PortalEstimateSnapshotDto',
].forEach(dump);
