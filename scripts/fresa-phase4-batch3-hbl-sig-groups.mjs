import fs from 'node:fs';

const layouts = JSON.parse(
  fs.readFileSync('src/features/reports/data/hblFormatUiLayouts.json', 'utf8'),
);

function blockSig(l) {
  return l.blocks
    .map((b) => (b.type === 'fieldGrid' ? `fieldGrid:c${b.cols || 2}` : b.type))
    .join('>');
}

const bySig = {};
for (const l of layouts) {
  if (!l.blocks.some((b) => b.type === 'hblFreightSignature')) continue;
  const s = blockSig(l);
  (bySig[s] ||= []).push(l.code);
}

const entries = Object.entries(bySig).sort((a, b) => b[1].length - a[1].length);
console.log('hblFreightSignature signature groups:', entries.length);
for (const [s, codes] of entries.slice(0, 10)) {
  const drafts = codes.filter((c) => c.includes('HBL_DRAFT'));
  console.log('\n', codes.length, s);
  console.log(' drafts', drafts.length, drafts.slice(0, 15).join(', '));
}

const target =
  'companyHeader>formatBadge>docTitle>partyNotifyGrid>fieldGrid:c3>hblCargoTable>hblFreightSignature>termsBank>colorfulFooter';
console.log('\nFormat-11 exact siblings', (bySig[target] || []).length);
console.log((bySig[target] || []).join('\n'));
