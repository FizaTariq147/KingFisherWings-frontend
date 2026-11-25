const fs = require('fs');
const path = require('path');
// Find pinned HBL HKG pdf
const files = [
  'reports/references/files/fg_hbl_hkg_rpm_ref_245.pdf',
  'reports/references/files/FG_HBL_HKG.pdf',
];
for (const f of files) console.log(f, fs.existsSync(f));
const dir = 'reports/references/files';
const hits = fs.readdirSync(dir).filter(n => /hbl.*hkg|hkg.*hbl/i.test(n));
console.log('hits', hits);
