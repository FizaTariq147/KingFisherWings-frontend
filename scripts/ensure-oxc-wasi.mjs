/**
 * Windows-only advisory: Smart App Control / WDAC may block native oxc `.node`
 * binaries. Do NOT nest `npm install` here — that deadlocks the parent install
 * and breaks CI/Render.
 *
 * If Vite fails with App Control blocking *.node, run once locally:
 *   npm install @oxc-parser/binding-wasm32-wasi@0.127.0 --force --no-save
 */
import { createRequire } from 'node:module';

if (process.platform !== 'win32') {
  process.exit(0);
}

const require = createRequire(import.meta.url);
const PKG = '@oxc-parser/binding-wasm32-wasi';

try {
  require.resolve(PKG);
} catch {
  console.warn(
    `[ensure-oxc-wasi] Optional ${PKG} not present. If Vite fails because App Control blocked oxc *.node, run:\n` +
      `  npm install ${PKG}@0.127.0 --force --no-save`,
  );
}

process.exit(0);
