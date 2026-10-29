/**
 * Phase 4 Batch 14.1 — Render + effective-orientation regression for applied landscape codes.
 * Reuses Phase 3 harness (generateCatalogLayoutPdf). No layout edits.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outRoot = path.join(root, 'tmp/fresa-references');
const applyPath = path.join(outRoot, 'PHASE4_BATCH14_1_APPLY.json');
const auditPath = path.join(outRoot, 'PHASE4_BATCH14_ORIENTATION_AUDIT.json');
const harnessDir = path.join(root, 'scripts/fresa-phase3');
const HARNESS_URL = 'http://127.0.0.1:5199/';
const outDir = path.join(outRoot, 'phase4-batch14-1-renders');

const PORTRAIT_CONTROLS = [
  'INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA',
  'INVOICE_REPORT_FORMAT_3_SUMMARY_INVOICE',
  'INVOICE_REPORT_FORMAT_4_SUMMARY_INVOICE_WITH_TAX',
  'INVOICE_REPORT_FORMAT_2_TAX_INVOICE_INDIA', // expect landscape (unchanged)
  'HBL_DRAFT_REPORT_FORMAT_11',
];

// Prefer common ASN code used in Phase 4; fall back if missing in harness
const ASN_CANDIDATES = [
  'ARRIVAL_NOTICE_REPORT_FORMAT_4',
  'ARRIVAL_NOTICE_REPORT_FORMAT_1',
  'ARRIVAL_NOTICE_VIETNAM_FCL_REPORT_FORMAT',
];

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function csvEscape(v) {
  const s = String(v ?? '');
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

async function inspectPdfBuf(buf) {
  const data = new Uint8Array(buf);
  const doc = await getDocument({ data, useSystemFonts: true }).promise;
  const page = await doc.getPage(1);
  const rotate = Number(page.rotate || 0) % 360;
  const view = page.view || [0, 0, 0, 0];
  const mediaW = Math.abs((view[2] ?? 0) - (view[0] ?? 0));
  const mediaH = Math.abs((view[3] ?? 0) - (view[1] ?? 0));
  const vp = page.getViewport({ scale: 1 });
  const effW = vp.width;
  const effH = vp.height;
  return {
    pageCount: doc.numPages,
    mediaBox: `${Math.round(mediaW * 10) / 10}x${Math.round(mediaH * 10) / 10}`,
    rotate,
    effectiveBox: `${Math.round(effW * 10) / 10}x${Math.round(effH * 10) / 10}`,
    effectiveOrientation: effW >= effH ? 'landscape' : 'portrait',
  };
}

function ensureRolldownBinding() {
  const nestedDir = path.join(root, 'node_modules/vite/node_modules/@rolldown');
  const nestedBinding = path.join(nestedDir, 'binding-win32-x64-msvc');
  const topBinding = path.join(root, 'node_modules/@rolldown/binding-win32-x64-msvc');
  const nestedPkg = path.join(nestedBinding, 'package.json');
  const want = '1.0.3';
  try {
    if (fs.existsSync(nestedPkg)) {
      const ver = JSON.parse(fs.readFileSync(nestedPkg, 'utf8')).version;
      if (ver === want) return;
    }
  } catch {
    /* repair below */
  }
  if (!fs.existsSync(topBinding)) {
    console.warn('[b14.1] Missing rolldown binding — Vite may fail');
    return;
  }
  try {
    fs.mkdirSync(nestedDir, { recursive: true });
    fs.rmSync(nestedBinding, { recursive: true, force: true });
    fs.cpSync(topBinding, nestedBinding, { recursive: true });
    console.log('[b14.1] Restored vite nested Rolldown Windows binding');
  } catch (e) {
    console.warn(`[b14.1] Rolldown binding repair skipped: ${e.message}`);
  }
}

function startVite() {
  ensureRolldownBinding();
  const viteBin = path.join(root, 'node_modules/vite/bin/vite.js');
  const child = spawn(
    process.execPath,
    [viteBin, '--config', path.join(harnessDir, 'vite.config.mjs')],
    {
      cwd: root,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, BROWSER: 'none' },
      shell: false,
    },
  );
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
        if (process.platform === 'win32') {
          spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
        } else {
          child.kill('SIGTERM');
        }
      } catch {
        /* ignore */
      }
    },
  };
}

async function waitForHarness(page, vite, timeoutMs = 180_000) {
  const start = Date.now();
  let lastErr = '';
  while (Date.now() - start < timeoutMs) {
    if (vite.child.exitCode != null) {
      throw new Error(`Vite exited early: ${vite.getLog()}`);
    }
    try {
      await page.goto(HARNESS_URL, { waitUntil: 'domcontentloaded', timeout: 15_000 });
      await page.waitForFunction(() => window.__FRESA_PHASE3_READY === true, null, {
        timeout: 20_000,
      });
      return;
    } catch (err) {
      lastErr = err instanceof Error ? err.message : String(err);
      await sleep(2000);
    }
  }
  throw new Error(`Harness not ready: ${lastErr}\n${vite.getLog()}`);
}

function readLayoutOrientation(code, store) {
  const p = path.join(root, 'src/features/reports/data', store);
  const layouts = JSON.parse(fs.readFileSync(p, 'utf8'));
  const row = layouts.find((r) => r.code === code);
  if (!row) return { found: false, orientation: '' };
  return {
    found: true,
    orientation: row.orientation === 'landscape' ? 'landscape' : 'portrait',
    explicit: row.orientation === 'landscape' || row.orientation === 'portrait',
  };
}

function syncCheck(storeBase) {
  const jsonPath = path.join(root, 'src/features/reports/data', `${storeBase}.json`);
  const genPath = path.join(root, 'src/features/reports/data', `${storeBase}.generated.ts`);
  const rows = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const text = fs.readFileSync(genPath, 'utf8');
  const genCount = (text.match(/"code":/g) || []).length;
  return { json: rows.length, generated: genCount, ok: rows.length === genCount };
}

async function main() {
  const apply = JSON.parse(fs.readFileSync(applyPath, 'utf8'));
  const audit = JSON.parse(fs.readFileSync(auditPath, 'utf8'));
  const auditByCode = Object.fromEntries(
    (audit.recommendedCorrectionBatch || []).map((r) => [r.freightnest_code, r]),
  );

  ensureDir(outDir);

  const sync = {
    accounts: syncCheck('accountsFormatUiLayouts'),
    other: syncCheck('otherReportsFormatUiLayouts'),
  };

  const landscapeTargets = apply.results.filter((r) => r.action === 'changed' || r.action === 'already_correct');
  const renderCodes = [...landscapeTargets.map((r) => r.code)];

  // Resolve ASN portrait control
  let asnCode = '';
  for (const c of ASN_CANDIDATES) {
    for (const store of ['arrivalNoticeFormatUiLayouts.json', 'wmsFormatUiLayouts.json']) {
      const p = path.join(root, 'src/features/reports/data', store);
      if (!fs.existsSync(p)) continue;
      const layouts = JSON.parse(fs.readFileSync(p, 'utf8'));
      if (layouts.some((r) => r.code === c)) {
        asnCode = c;
        break;
      }
    }
    if (asnCode) break;
  }

  const controlExpect = {
    INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA: 'portrait',
    INVOICE_REPORT_FORMAT_3_SUMMARY_INVOICE: 'portrait',
    INVOICE_REPORT_FORMAT_4_SUMMARY_INVOICE_WITH_TAX: 'portrait',
    INVOICE_REPORT_FORMAT_2_TAX_INVOICE_INDIA: 'landscape',
    HBL_DRAFT_REPORT_FORMAT_11: 'portrait',
  };
  if (asnCode) controlExpect[asnCode] = 'portrait';

  const vite = startVite();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const rows = [];

  try {
    await waitForHarness(page, vite);
    console.log('[b14.1] harness ready');

    const allCodes = [...renderCodes, ...PORTRAIT_CONTROLS, ...(asnCode ? [asnCode] : [])];
    const seen = new Set();

    for (const code of allCodes) {
      if (seen.has(code)) continue;
      seen.add(code);

      const applyRow = apply.results.find((r) => r.code === code);
      const evidence = auditByCode[code];
      const isControl = !applyRow;
      const store =
        applyRow?.store ||
        (code.startsWith('INVOICE_')
          ? 'invoiceFormatUiLayouts.json'
          : code.startsWith('HBL_')
            ? 'hblFormatUiLayouts.json'
            : code.startsWith('ARRIVAL_')
              ? 'arrivalNoticeFormatUiLayouts.json'
              : '');

      const cfg = store ? readLayoutOrientation(code, store) : { found: false, orientation: '' };
      const previous = applyRow?.previous ?? (isControl ? cfg.orientation : '');
      const next = applyRow?.next ?? cfg.orientation;
      const expectedRef = evidence?.expected || controlExpect[code] || '';

      let renderedOrientation = '';
      let renderStatus = 'skipped';
      let renderError = '';
      let renderMeta = null;
      let refOrientation = expectedRef;
      let notes = [];

      if (evidence?.reference_path && fs.existsSync(path.join(root, evidence.reference_path))) {
        try {
          const refMeta = await inspectPdfBuf(fs.readFileSync(path.join(root, evidence.reference_path)));
          refOrientation = refMeta.effectiveOrientation;
          notes.push(`ref ${refMeta.effectiveBox} rot=${refMeta.rotate}`);
        } catch (e) {
          notes.push(`ref inspect failed: ${e.message}`);
        }
      }

      try {
        const has = await page.evaluate((formatCode) => window.__FRESA_PHASE3.hasLayout(formatCode), code);
        if (!has) {
          renderStatus = 'no_layout';
          renderError = 'Harness hasLayout=false';
        } else {
          const gen = await page.evaluate(async (formatCode) => {
            return window.__FRESA_PHASE3.generate(formatCode, { appendCustomerTerms: false });
          }, code);
          if (!gen?.ok || !gen.base64) {
            renderStatus = 'failed';
            renderError = gen?.error || 'generate failed';
          } else {
            const buf = Buffer.from(gen.base64, 'base64');
            const slug = code.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 80);
            fs.writeFileSync(path.join(outDir, `${slug}.pdf`), buf);
            renderMeta = await inspectPdfBuf(buf);
            renderedOrientation = renderMeta.effectiveOrientation;
            renderStatus = 'ok';
            notes.push(`fn ${renderMeta.effectiveBox} rot=${renderMeta.rotate}`);
          }
        }
      } catch (e) {
        renderStatus = 'failed';
        renderError = e instanceof Error ? e.message : String(e);
      }

      const expectOrient = isControl ? controlExpect[code] : 'landscape';
      let validationStatus = 'fail';
      if (renderStatus !== 'ok') {
        validationStatus = `render_${renderStatus}`;
      } else if (renderedOrientation === expectOrient) {
        validationStatus = 'pass';
      } else {
        validationStatus = 'orientation_mismatch';
      }

      if (applyRow?.action === 'skipped') validationStatus = 'skipped_apply';

      rows.push({
        report_code: code,
        role: isControl ? 'portrait_control' : 'batch_target',
        reference_pdf: evidence?.reference_path || '',
        audit_classification: evidence ? 'orientation_mismatch→landscape_apply' : 'control',
        previous_orientation: previous,
        new_orientation: next,
        configured_orientation: cfg.orientation,
        reference_effective_orientation: refOrientation,
        rendered_orientation: renderedOrientation,
        render_status: renderStatus,
        validation_status: validationStatus,
        store,
        notes: [renderError, ...notes].filter(Boolean).join(' | '),
      });

      console.log(`[b14.1] ${code} → ${validationStatus} (rendered=${renderedOrientation || '—'})`);
    }
  } finally {
    await browser.close().catch(() => {});
    vite.stop();
  }

  const targetRows = rows.filter((r) => r.role === 'batch_target');
  const controlRows = rows.filter((r) => r.role === 'portrait_control');
  const summary = {
    generatedAt: new Date().toISOString(),
    sync,
    targets: {
      total: targetRows.length,
      pass: targetRows.filter((r) => r.validation_status === 'pass').length,
      fail: targetRows.filter((r) => r.validation_status !== 'pass').length,
    },
    controls: {
      total: controlRows.length,
      pass: controlRows.filter((r) => r.validation_status === 'pass').length,
      fail: controlRows.filter((r) => r.validation_status !== 'pass').length,
    },
    portraitGuardsConfig: apply.portraitGuards,
    invoiceFormat2StillLandscape: apply.invoiceFormat2StillLandscape,
    rows,
  };

  fs.writeFileSync(path.join(outRoot, 'PHASE4_BATCH14_1_VALIDATE.json'), JSON.stringify(summary, null, 2));

  const headers = [
    'report_code',
    'reference_pdf',
    'audit_classification',
    'previous_orientation',
    'new_orientation',
    'rendered_orientation',
    'validation_status',
    'notes',
  ];
  // CSV: one row per intended report code (21) — controls go in MD only extras section
  const intendedOrder = apply.results.map((r) => r.code);
  const csvRows = intendedOrder.map((code) => {
    const r = rows.find((x) => x.report_code === code) || {
      report_code: code,
      reference_pdf: auditByCode[code]?.reference_path || '',
      audit_classification: 'orientation_mismatch',
      previous_orientation: 'portrait',
      new_orientation: 'landscape',
      rendered_orientation: '',
      validation_status: 'missing',
      notes: 'not validated',
    };
    return headers.map((h) => csvEscape(r[h] ?? r[h.replace('report_code', 'report_code')])).join(',');
  });
  // fix mapping
  const csvBody = intendedOrder.map((code) => {
    const r = rows.find((x) => x.report_code === code);
    const applyRow = apply.results.find((x) => x.code === code);
    const vals = {
      report_code: code,
      reference_pdf: r?.reference_pdf || applyRow?.reference_path || '',
      audit_classification: 'orientation_mismatch',
      previous_orientation: applyRow?.previous || r?.previous_orientation || '',
      new_orientation: applyRow?.next || r?.new_orientation || '',
      rendered_orientation: r?.rendered_orientation || '',
      validation_status: r?.validation_status || 'missing',
      notes: r?.notes || applyRow?.reason || '',
    };
    return headers.map((h) => csvEscape(vals[h])).join(',');
  });
  fs.writeFileSync(
    path.join(outRoot, 'PHASE4_BATCH14_1_ORIENTATION_REGRESSION.csv'),
    `${headers.join(',')}\n${csvBody.join('\n')}\n`,
  );

  console.log(
    JSON.stringify(
      {
        csv: 'tmp/fresa-references/PHASE4_BATCH14_1_ORIENTATION_REGRESSION.csv',
        targets: summary.targets,
        controls: summary.controls,
        sync,
      },
      null,
      2,
    ),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
