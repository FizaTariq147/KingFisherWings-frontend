/**
 * Windows App Control / WDAC often blocks oxc-resolver's native `.node` binary.
 * Detect that and re-run Vite with NAPI_RS_FORCE_WASI=true (wasm fallback).
 */
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const env = { ...process.env };
const viteArgs = process.argv.slice(2);

if (process.platform === 'win32' && env.NAPI_RS_FORCE_WASI !== 'true') {
  try {
    // Clear any prior force so we truly test the native path.
    delete require.cache[require.resolve('oxc-resolver')];
    require('oxc-resolver');
  } catch (err) {
    const msg = String(err?.cause?.message || err?.message || err);
    if (/Application Control|native binding|ERR_DLOPEN_FAILED/i.test(msg)) {
      env.NAPI_RS_FORCE_WASI = 'true';
      console.warn(
        '[vite] Native oxc-resolver blocked by Windows Application Control.\n' +
          '       Falling back to @oxc-resolver/binding-wasm32-wasi (NAPI_RS_FORCE_WASI=true).',
      );
    } else {
      throw err;
    }
  }
}

const child = spawn(process.execPath, ['./node_modules/vite/bin/vite.js', ...viteArgs], {
  stdio: 'inherit',
  env,
});

child.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 1);
});
