const fs = require('fs');
const path = require('path');
const files = fs.readdirSync('reports/references/files').filter(n => /hbl.*format.?1|format1.*hbl|fg_hbl_format1/i.test(n));
console.log('pins', files);
const catalog = JSON.parse(fs.readFileSync('src/features/reports/constants/hblOfficialCatalog.generated.ts','utf8').replace(/^[\s\S]*?=\s*/,'').replace(/;\s*$/,'').replace(/,\s*]/g,']'));
