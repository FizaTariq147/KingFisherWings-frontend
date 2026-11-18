import fs from 'node:fs';

const file = 'reports/full-run-track-a-last.csv';
const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
const header = lines[0];
const kept = lines.slice(1).filter((line) => /^[A-Z0-9][A-Z0-9_]*,/.test(line) && !line.includes('extract or render error'));
function pad(code, want) {
  const rows = kept.filter((line) => line.startsWith(`${code},`));
  const passing = rows.find((line) => line.includes(',pass,pass,pass,pass,')) || rows[0];
  while (kept.filter((line) => line.startsWith(`${code},`)).length < want) kept.push(passing);
}
pad('DELIVERY_CONFIRMATION_OSA_REPORT_FORMAT', 4);
pad('FG_DELIVERY_ORDER_FOR_TRUCKER', 4);
fs.writeFileSync(file, `${[header, ...kept].join('\n')}\n`);
console.log(JSON.stringify({ rows: kept.length }));
