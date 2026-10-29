/**
 * Batch 14.1 follow-up: render correct Inv-4 / ASN / Vietnam FCL portrait controls.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const HARNESS_URL = 'http://127.0.0.1:5199/';
const harnessDir = path.join(root, 'scripts/fresa-phase3');

const CODES = [
  { code: 'INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE', expect: 'portrait' },
  { code: 'ARRIVAL_NOTICE_REPORT_FORMAT_4_ARRIVAL_NOTICE_USA', expect: 'portrait' },
  {
    code: 'ARRIVAL_NOTICE_REPORT_FORMAT_10_SEA_ARRIVAL_NOTICE_FCL_VIETNAM',
    expect: 'portrait',
  },
];

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function inspect(buf) {
  const doc = await getDocument({ data: new Uint8Array(buf), useSystemFonts: true }).promise;
  const page = await doc.getPage(1);
  const vp = page.getViewport({ scale: 1 });
  return vp.width >= vp.height ? 'landscape' : 'portrait';
}

function startVite() {
  const viteBin = path.join(root, 'node_modules/vite/bin/vite.js');
  const child = spawn(process.execPath, [viteBin, '--config', path.join(harnessDir, 'vite.config.mjs')], {
    cwd: root,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, BROWSER: 'none' },
  });
  let log = '';
  child.stdout.on('data', (d) => {
    log += d.toString();
  });
  child.stderr.on('data', (d) => {
    log += d.toString();
  });
  return {
    child,
    getLog: () => log,
    stop: () => {
      try {
        spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
      } catch {
        /* ignore */
      }
    },
  };
}

async function waitForHarness(page, vite) {
  const start = Date.now();
  while (Date.now() - start < 180000) {
    if (vite.child.exitCode != null) throw new Error(vite.getLog());
    try {
      await page.goto(HARNESS_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForFunction(() => window.__FRESA_PHASE3_READY === true, null, { timeout: 20000 });
      return;
    } catch {
      await sleep(2000);
    }
  }
  throw new Error('harness timeout\n' + vite.getLog());
}

const vite = startVite();
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const out = [];
try {
  await waitForHarness(page, vite);
  for (const { code, expect } of CODES) {
    const gen = await page.evaluate(async (formatCode) => {
      if (!window.__FRESA_PHASE3.hasLayout(formatCode)) return { ok: false, error: 'no_layout' };
      return window.__FRESA_PHASE3.generate(formatCode, { appendCustomerTerms: false });
    }, code);
    if (!gen?.ok) {
      out.push({ code, expect, status: 'fail', error: gen?.error || 'generate failed' });
      continue;
    }
    const rendered = await inspect(Buffer.from(gen.base64, 'base64'));
    out.push({
      code,
      expect,
      rendered,
      status: rendered === expect ? 'pass' : 'fail',
    });
    console.log(code, rendered, rendered === expect ? 'pass' : 'FAIL');
  }
} finally {
  await browser.close().catch(() => {});
  vite.stop();
}
fs.writeFileSync(
  path.join(root, 'tmp/fresa-references/PHASE4_BATCH14_1_CONTROL_RERENDER.json'),
  JSON.stringify({ generatedAt: new Date().toISOString(), out }, null, 2),
);
console.log(JSON.stringify(out, null, 2));
