/**
 * Blocks destructive Fresa registry scripts until explicitly unlocked.
 * Set FRESA_ALLOW_DESTRUCTIVE=1 to run the underlying script.
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const kind = process.argv[2] || 'unknown';

const MAP = {
  'fix-shells': 'scripts/fix-visual-shell-collisions.mjs',
  'purge-leftover': 'scripts/purge-leftover-hbl-hawb-clones.mjs',
  uniquify: 'scripts/uniquify-duplicate-layout-signatures.mjs',
};

const target = MAP[kind];
if (!target) {
  console.error(`Unknown quarantine kind: ${kind}`);
  process.exit(2);
}

if (process.env.FRESA_ALLOW_DESTRUCTIVE !== '1') {
  console.error(
    JSON.stringify(
      {
        blocked: true,
        kind,
        target,
        reason:
          'Destructive registry rewrite is quarantined. Visual uniqueness is not Fresa fidelity. Set FRESA_ALLOW_DESTRUCTIVE=1 only after audit.',
      },
      null,
      2,
    ),
  );
  process.exit(1);
}

const r = spawnSync(process.execPath, [path.join(root, target)], {
  cwd: root,
  stdio: 'inherit',
  env: process.env,
});
process.exit(r.status ?? 1);
