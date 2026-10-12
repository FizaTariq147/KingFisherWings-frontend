import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('src');

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === 'node_modules' || ent.name === 'dist' || ent.name === '.git') continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else if (/\.(tsx|ts)$/.test(ent.name)) out.push(p);
  }
  return out;
}

const primary = (px = 'px-5', py = 'py-1.5') =>
  `inline-flex items-center justify-center gap-1.5 rounded-sm bg-[var(--btn-primary-bg)] ${px} ${py} text-sm font-medium text-[var(--btn-primary-text)] transition-colors hover:bg-[var(--btn-primary-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--btn-primary-ring)] focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-[var(--btn-disabled-opacity,0.45)]`;

const replacements = [
  [
    'flex items-center gap-1.5 bg-[#0A2942] hover:opacity-90 disabled:opacity-60 text-white text-sm px-5 py-1.5 rounded transition-opacity',
    primary(),
  ],
  [
    'flex items-center gap-1.5 bg-[#0A2942] hover:opacity-90 disabled:opacity-50 text-white text-sm px-5 py-1.5 rounded transition-opacity shrink-0',
    `${primary()} shrink-0`,
  ],
  [
    'flex items-center gap-1.5 bg-[#0A2942] hover:opacity-90 disabled:opacity-50 text-white text-sm px-3 py-1.5 rounded transition-opacity',
    primary('px-3'),
  ],
  [
    'flex items-center gap-1.5 bg-[#0A2942] hover:opacity-90 text-white text-sm px-5 py-1.5 rounded transition-opacity mb-0.5',
    `${primary()} mb-0.5`,
  ],
  [
    'flex items-center gap-1.5 bg-[#0A2942] hover:opacity-90 text-white text-sm px-5 py-1.5 rounded transition-opacity',
    primary(),
  ],
  [
    'flex items-center gap-1.5 bg-[#0A2942] hover:opacity-90 text-white text-sm px-4 py-1.5 rounded transition-opacity',
    primary('px-4'),
  ],
  [
    'bg-[#0A2942] hover:opacity-90 text-white text-sm px-5 py-1.5 rounded transition-opacity',
    primary(),
  ],
  [
    'bg-[#0A2942] hover:opacity-90 text-white text-sm px-4 py-2 rounded transition-opacity',
    primary('px-4', 'py-2'),
  ],
  [
    'flex items-center gap-1.5 bg-[#FF751F] hover:opacity-90 text-white text-sm px-4 py-1.5 rounded transition-opacity',
    primary('px-4'),
  ],
  [
    'bg-[#FF751F] hover:opacity-90 text-white text-sm px-4 py-1.5 rounded transition-opacity',
    primary('px-4'),
  ],
  [
    'inline-flex items-center gap-1.5 rounded bg-[#0A2942] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90',
    primary('px-4', 'py-2'),
  ],
  [
    'rounded bg-[#0A2942] px-4 py-2 text-sm text-white hover:opacity-90 disabled:opacity-50',
    primary('px-4', 'py-2'),
  ],
];

let changedFiles = 0;
for (const file of walk(root)) {
  let src = fs.readFileSync(file, 'utf8');
  let next = src;
  for (const [from, to] of replacements) {
    if (next.includes(from)) next = next.split(from).join(to);
  }
  if (next !== src) {
    fs.writeFileSync(file, next);
    changedFiles += 1;
    console.log(path.relative(root, file));
  }
}
console.log('CHANGED', changedFiles);
