const fs = require('fs');
const path = require('path');
const dir = 'reports/specs';
const air = [];
const ocean = [];
const noLogo = [];
for (const f of fs.readdirSync(dir).filter(n => /^(FG_HBL_|HBL_)/i.test(n) && n.endsWith('.json') && !n.includes('dynamic'))) {
  try {
    const spec = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const code = f.replace(/\.json$/i, '');
    const text = (spec.spans||[]).map(s => s.text||'').join(' ');
    const isAir = /air waybill|house air/i.test(text);
    const hasLogo = (spec.images||[]).some(i => i.proposedClass === 'logo') || Boolean(spec.slots?.logo);
    if (isAir) air.push(code);
    else ocean.push(code);
    if (!hasLogo) noLogo.push(code);
  } catch {}
}
console.log(JSON.stringify({ airCount: air.length, oceanCount: ocean.length, noLogoCount: noLogo.length, airSample: air.slice(0,25), noLogoSample: noLogo.slice(0,20) }, null, 2));
