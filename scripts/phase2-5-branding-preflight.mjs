/**
 * Phase 2.5 — Branding preflight gate (before Draft / Draft-2 visual compare).
 *
 * Reuses the Phase 3.1 production branding harness + shared inspect helpers.
 * Does NOT change Phase 3 workflow or duplicate branding resolvers.
 *
 * Verifies Draft and Draft-2 production PDFs:
 * - Use registered org branding inputs (Phase 3.1 harness fixture)
 * - Contain no Fresa sample PDF / embedded Fresa branding markers
 *
 * Run: node scripts/phase2-5-branding-preflight.mjs
 * Exit 0 only when both Draft and Draft-2 PASS (visual compare may proceed).
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import {
  PHASE31_ORG_NAME,
  inspectPdfBranding,
  verdictGenerateBranding,
} from './lib/phase31BrandingInspect.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const HARNESS = 'http://127.0.0.1:5203/';
const OUT = path.join(root, 'src/features/reports/qa/phase2-5-hawb');
const PREFLIGHT_JSON = path.join(OUT, 'branding-preflight.json');
const PREFLIGHT_MD = path.join(OUT, 'BRANDING_PREFLIGHT.md');

/** Formats that must pass branding before Phase 2.5 visual compare. */
const PREFLIGHT_CODES = [
  { code: 'HAWB_DRAFT_REPORT_FORMAT', variant: 'draft' },
  { code: 'HAWB_DRAFT_REPORT_FORMAT_2', variant: 'draft2' },
];

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function startPhase31Vite() {
  const viteBin = path.join(root, 'node_modules/vite/bin/vite.js');
  const log = [];
  const child = spawn(
    process.execPath,
    [viteBin, '--config', path.join(root, 'scripts/phase3-1-branding/vite.config.mjs')],
    { cwd: root, env: { ...process.env, FORCE_COLOR: '0' } },
  );
  child.stdout.on('data', (d) => log.push(String(d)));
  child.stderr.on('data', (d) => log.push(String(d)));
  return {
    child,
    getLog: () => log.join(''),
    stop: () => {
      try {
        child.kill('SIGTERM');
      } catch {
        /* ignore */
      }
    },
  };
}

async function waitReady(page, vite, ms = 120000) {
  const start = Date.now();
  let last = '';
  while (Date.now() - start < ms) {
    try {
      await page.goto(HARNESS, { waitUntil: 'networkidle', timeout: 15000 });
      const ready = await page.evaluate(() => Boolean(window.__P31_READY && window.__P31));
      if (ready) return;
    } catch (e) {
      last = e instanceof Error ? e.message : String(e);
    }
    await page.waitForTimeout(500);
  }
  throw new Error(`Phase 3.1 harness not ready. ${last}\n${vite.getLog()}`);
}

function writeMarkdown(result) {
  const lines = [];
  lines.push('# Phase 2.5 — Branding Preflight (Draft / Draft-2)');
  lines.push('');
  lines.push(`**Generated:** ${result.generatedAt}`);
  lines.push(`**Harness:** Phase 3.1 (\`${HARNESS}\`) — reused, not duplicated`);
  lines.push(`**Org fixture:** \`${PHASE31_ORG_NAME}\``);
  lines.push(`**Gate:** ${result.gatePass ? '**PASS** — visual compare may proceed' : '**FAIL** — do not visually compare'}`);
  lines.push('');
  lines.push('| Format | Source | Pages | Fresa detected | Org branding | Verdict |');
  lines.push('| --- | --- | ---: | --- | --- | --- |');
  for (const r of result.formats) {
    lines.push(
      `| \`${r.code}\` (${r.variant}) | ${r.source || r.error || '—'} | ${r.inspect?.pageCount ?? '—'} | ${r.inspect?.fresaLogoDetected ? 'YES' : 'NO'} | ${r.orgBrandingVerified ? 'YES' : 'NO'} | **${r.verdict}** |`,
    );
  }
  lines.push('');
  lines.push('## Rule');
  lines.push('');
  lines.push(
    'Before Draft / Draft-2 pixel SBS/diff comparison, production PDFs must use registered Freightnest organization branding and must not be (or embed) a Fresa sample PDF.',
  );
  lines.push('');
  lines.push('Artifacts under `qa/phase2-5-hawb/branding-preflight/`.');
  lines.push('');
  fs.writeFileSync(PREFLIGHT_MD, lines.join('\n'), 'utf8');
}

/**
 * Run Draft + Draft-2 branding preflight via Phase 3.1 harness.
 * @returns {Promise<{ gatePass: boolean, formats: object[], generatedAt: string }>}
 */
export async function runPhase25BrandingPreflight() {
  ensureDir(OUT);
  ensureDir(path.join(OUT, 'branding-preflight'));

  const vite = startPhase31Vite();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const formats = [];

  try {
    await waitReady(page, vite);

    for (const { code, variant } of PREFLIGHT_CODES) {
      console.log('[p25-preflight]', variant, code);
      const result = await page.evaluate(
        async (c) => window.__P31.generate({ code: c, mode: 'generate' }),
        code,
      );

      if (!result?.ok || !result.base64) {
        formats.push({
          code,
          variant,
          ok: false,
          source: result?.source || 'error',
          error: result?.error || 'generate failed',
          brandingProof: result?.brandingProof || null,
          inspect: null,
          orgBrandingVerified: false,
          verdict: 'FAIL',
          reason: 'generate_failed',
        });
        continue;
      }

      const buf = Buffer.from(result.base64, 'base64');
      const pdfPath = path.join(OUT, 'branding-preflight', `${variant}-branded-production.pdf`);
      fs.writeFileSync(pdfPath, buf);

      const inspect = await inspectPdfBranding(buf, { orgName: PHASE31_ORG_NAME });
      const gate = verdictGenerateBranding({
        ok: true,
        source: result.source,
        brandingProof: result.brandingProof,
        inspect,
        expectedOrgName: PHASE31_ORG_NAME,
      });

      formats.push({
        code,
        variant,
        ok: true,
        source: result.source,
        error: null,
        brandingProof: result.brandingProof,
        inspect,
        orgBrandingVerified: gate.pass,
        verdict: gate.verdict,
        reason: gate.reason,
        file: path.relative(root, pdfPath).replace(/\\/g, '/'),
      });
    }
  } finally {
    await browser.close();
    vite.stop();
  }

  const gatePass = formats.length === PREFLIGHT_CODES.length && formats.every((f) => f.verdict === 'PASS');
  const payload = {
    generatedAt: new Date().toISOString(),
    requirement:
      'Before Draft/Draft-2 visual compare: registered org branding, no Fresa sample/logo in production PDF',
    harness: 'scripts/phase3-1-branding (Phase 3.1)',
    orgName: PHASE31_ORG_NAME,
    gatePass,
    formats,
  };

  fs.writeFileSync(PREFLIGHT_JSON, JSON.stringify(payload, null, 2));
  writeMarkdown(payload);
  console.log('[p25-preflight] gatePass=', gatePass, '→', path.relative(root, PREFLIGHT_JSON));
  return payload;
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  runPhase25BrandingPreflight()
    .then((r) => {
      process.exit(r.gatePass ? 0 : 1);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
