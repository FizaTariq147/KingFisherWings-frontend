import fs from 'node:fs';

const code = process.argv[2] || 'INVOICE_REPORT_FORMAT_8_STANDARD_INVOICE_ARABIC';
const j = JSON.parse(fs.readFileSync(`reports/specs/${code}.json`, 'utf8'));
const h = j.page.height;
const spans = j.spans || [];

const branding = spans.filter((s) => s.role === 'branding' || s.brandingKind);
console.log('branding', branding.length);
for (const s of branding.slice(0, 50)) {
  console.log(
    JSON.stringify({
      t: s.text,
      x: s.x,
      y: s.y,
      size: s.size,
      kind: s.brandingKind,
      role: s.role,
      color: s.color,
    }),
  );
}

console.log('images', (j.images || []).length);
for (const im of j.images || []) {
  console.log(
    JSON.stringify({
      x: im.x,
      y: im.y,
      w: im.width,
      h: im.height,
      cls: im.proposedClass,
      name: im.name || im.file || '',
    }),
  );
}

console.log('TOP');
for (const s of spans.filter((s) => s.y > h - 110).sort((a, b) => b.y - a.y || a.x - b.x)) {
  console.log(
    JSON.stringify({
      t: s.text,
      x: s.x,
      y: s.y,
      size: s.size,
      role: s.role,
      kind: s.brandingKind,
      color: s.color,
    }),
  );
}

console.log('FOOTER');
for (const s of spans.filter((s) => s.y < 55).sort((a, b) => a.x - b.x)) {
  console.log(
    JSON.stringify({
      t: s.text,
      x: s.x,
      y: s.y,
      size: s.size,
      role: s.role,
      kind: s.brandingKind,
    }),
  );
}

console.log('slots', JSON.stringify(j.slots || {}, null, 2).slice(0, 2500));
