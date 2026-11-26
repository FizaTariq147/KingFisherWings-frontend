/**
 * Windows-only advisory: Smart App Control / WDAC may block native oxc `.node`
 * binaries. Do NOT nest `npm install` here — that deadlocks the parent install
 * and breaks CI/Render.
 *
 * If Vite fails with App Control blocking *.node, `npm run dev` auto-falls back
 * via scripts/run-vite.mjs. To preinstall the fallback:
 *   npm i -D @oxc-resolver/binding-wasm32-wasi@11.24.2 --force
 */
import { createRequire } from 'node:module';

if (process.platform !== 'win32') {
  process.exit(0);
}

const require = createRequire(import.meta.url);
const NEEDED = ['@oxc-resolver/binding-wasm32-wasi', '@oxc-parser/binding-wasm32-wasi'];

for (const pkg of NEEDED) {
  try {
    require.resolve(pkg);
  } catch {
    console.warn(
      `[ensure-oxc-wasi] Optional ${pkg} not present.\n` +
        `  If Vite fails because App Control blocked oxc *.node, run:\n` +
        `  npm install ${pkg} --save-dev --force`,
    );
  }
}

process.exit(0);
