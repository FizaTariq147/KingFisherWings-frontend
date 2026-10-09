/**
 * Windows Smart App Control (and similar WDAC policies) often block the native
 * `@oxc-parser/binding-win32-x64-msvc` `.node` binary. Tailwind v4 / Vite then
 * fail to load config. Ensure the WASI/WASM binding is present so oxc-parser
 * can fall back (see oxc-parser src-js/bindings.js).
 *
 * The wasm package declares `"cpu": ["wasm32"]`, so a normal `npm i` on x64
 * skips it — we force-install when missing.
 */
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const PKG = '@oxc-parser/binding-wasm32-wasi';
const VERSION = '0.127.0';

function hasWasi() {
  try {
    require.resolve(PKG);
    return true;
  } catch {
    return false;
  }
}

if (hasWasi()) {
  process.exit(0);
}

console.warn(
  `[ensure-oxc-wasi] Installing ${PKG}@${VERSION} (WASM fallback for blocked native oxc bindings)…`,
);

const result = spawnSync(
  'npm',
  ['install', `${PKG}@${VERSION}`, '--no-save', '--force'],
  { stdio: 'inherit', shell: true },
);

if (result.status !== 0 || !hasWasi()) {
  console.error(
    `[ensure-oxc-wasi] Failed to install ${PKG}. If Vite fails with "Application Control policy has blocked this file", either:\n` +
      `  1) run: npm install ${PKG}@${VERSION} --force\n` +
      `  2) turn off Smart App Control (Windows Security → App & browser control), or allowlist *.node binaries.`,
  );
  process.exit(result.status || 1);
}
