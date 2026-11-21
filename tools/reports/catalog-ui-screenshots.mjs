/**
 * Capture before/after catalogue strips screenshots into reports/catalog-ui/.
 * Before = legacy horizontal strip cards; After = CatalogStripsView markup.
 * Usage: node tools/reports/catalog-ui-screenshots.mjs
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '../../reports/catalog-ui');
mkdirSync(outDir, { recursive: true });

const chrome = `
  :root {
    --color-neutral-50: #f8fafc;
    --color-neutral-100: #f1f5f9;
    --color-neutral-200: #e2e8f0;
    --color-neutral-400: #94a3b8;
    --color-neutral-500: #64748b;
    --color-neutral-600: #475569;
    --color-neutral-700: #334155;
    --color-neutral-800: #1e293b;
    --color-neutral-900: #0f172a;
    --color-primary-50: #eff6ff;
    --color-primary-600: #2563eb;
    --color-primary-800: #1e40af;
    --color-success-50: #f0fdf4;
    --color-success-700: #15803d;
    --color-warning-50: #fffbeb;
    --color-warning-800: #92400e;
    --color-secondary: #0ea5e9;
    --btn-primary-bg: #0A2942;
    --btn-primary-text: #fff;
    --btn-secondary-bg: #fff;
    --btn-secondary-text: #1e293b;
    --btn-secondary-border: #c9d3df;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: "Segoe UI", system-ui, sans-serif;
    background: #f1f5f9;
    color: #0f172a;
  }
  .page { padding: 16px; max-width: 960px; margin: 0 auto; }
  .title { font-size: 20px; font-weight: 700; margin: 0 0 4px; }
  .sub { font-size: 13px; color: #64748b; margin: 0 0 16px; }
  .banner {
    border: 1px solid #bfdbfe; background: #eff6ff; color: #1e3a5f;
    padding: 8px 12px; border-radius: 2px; font-size: 13px; margin-bottom: 12px;
  }
  /* BEFORE: horizontal strip cards */
  .strip {
    border: 1px solid #e2e8f0; background: #fff; border-radius: 8px;
    padding: 14px; margin-bottom: 12px; box-shadow: 0 1px 2px rgb(0 0 0 / 4%);
  }
  .strip h3 {
    margin: -14px -14px 10px; padding: 10px 14px; background: #f8fafc;
    border-bottom: 1px solid #e2e8f0; font-size: 11px; letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  .cards { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 4px; }
  .card {
    min-width: 148px; max-width: 160px; border: 1px solid #e2e8f0;
    border-radius: 6px; padding: 10px; background: #f8fafc; position: relative;
  }
  .card::before {
    content: ""; position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: #0A2942;
  }
  .card .badge { font-size: 10px; font-weight: 700; color: #1e40af; text-transform: uppercase; }
  .card .name { font-size: 11px; font-weight: 600; margin-top: 4px; line-height: 1.3; }
  .card .hint { font-size: 9px; color: #92400e; margin-top: 6px; }
  /* AFTER: single-column list */
  .list {
    border: 1px solid #e2e8f0; background: #fff; border-radius: 8px; overflow: hidden;
    box-shadow: 0 1px 2px rgb(0 0 0 / 4%);
  }
  .list-head { background: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 12px; }
  .filters { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
  .filters input, .filters select {
    height: 40px; border: 1px solid #e2e8f0; border-radius: 6px; padding: 0 12px; font-size: 14px;
  }
  .filters input { flex: 1; min-width: 160px; }
  .sec {
    display: flex; justify-content: space-between; align-items: center;
    background: #f1f5f9; border-bottom: 1px solid #e2e8f0; padding: 10px 12px;
    font-size: 11px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
  }
  .row {
    display: flex; gap: 12px; padding: 12px; border-bottom: 1px solid #f1f5f9; background: #fff;
  }
  .thumb {
    width: 120px; height: 170px; border: 1px solid #e2e8f0; border-radius: 4px;
    background: linear-gradient(180deg, #fff 0%, #e2e8f0 100%); flex-shrink: 0;
    display: flex; align-items: flex-start; justify-content: center; padding-top: 8px;
    font-size: 9px; color: #94a3b8;
  }
  .meta { min-width: 0; flex: 1; }
  .name-line { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
  .name-line strong { font-size: 14px; }
  .tag {
    font-size: 10px; text-transform: uppercase; border: 1px solid #e2e8f0;
    background: #f8fafc; color: #475569; padding: 2px 6px; border-radius: 2px; font-weight: 600;
  }
  .chip {
    font-size: 10px; text-transform: uppercase; font-weight: 700;
    background: #fffbeb; color: #92400e; padding: 2px 6px; border-radius: 2px;
  }
  .code { font-family: ui-monospace, monospace; font-size: 11px; color: #94a3b8; margin-top: 4px; }
  .reason { font-size: 11px; color: #92400e; margin-top: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .actions { display: flex; gap: 8px; margin-top: 8px; flex-wrap: wrap; }
  .btn {
    height: 28px; padding: 0 10px; border-radius: 2px; font-size: 12px; font-weight: 600; border: 0; cursor: default;
  }
  .btn-primary { background: #0A2942; color: #fff; }
  .btn-secondary { background: #fff; color: #1e293b; border: 1px solid #c9d3df; }
`;

const beforeHtml = `<!doctype html><html><head><meta charset="utf-8"><style>${chrome}</style></head>
<body><div class="page">
  <p class="title">Report format catalogue</p>
  <p class="sub">Family strips (before) — horizontal cards per module</p>
  <div class="banner">Showing formats compatible with <strong>Invoice (live data)</strong></div>
  <div class="strip"><h3>Invoice Formats <span style="float:right;font-weight:400;color:#64748b">42 formats</span></h3>
    <div class="cards">
      <div class="card"><div class="badge">#1</div><div class="name">Tax Invoice Format 1</div><div class="hint">approximate, not final</div></div>
      <div class="card"><div class="badge">#4</div><div class="name">Standard Tax Invoice</div><div class="hint">not suitable for this invoice: the tax is not printed</div></div>
      <div class="card"><div class="badge">#10</div><div class="name">Standard Invoice</div><div class="hint">suitable for arithmetic, tax not shown</div></div>
      <div class="card"><div class="badge">#17</div><div class="name">Invoice Jasper</div><div class="hint">Browse-only · below coverage</div></div>
    </div>
  </div>
  <div class="strip"><h3>Sea Documents (Extra)</h3>
    <div class="cards">
      <div class="card"><div class="badge">#1</div><div class="name">Sea Draft Browse</div><div class="hint">Historical / Unverified</div></div>
    </div>
  </div>
</div></body></html>`;

const afterHtml = `<!doctype html><html><head><meta charset="utf-8"><style>${chrome}</style></head>
<body><div class="page">
  <p class="title">Report format catalogue</p>
  <p class="sub">Family strips (after) — recommended / other / not suitable</p>
  <div class="list">
    <div class="list-head">
      <div>Formats for <strong>Invoice (live data)</strong></div>
      <div class="filters">
        <input value="" placeholder="Search by name or code" readonly />
        <select><option>All families</option></select>
      </div>
    </div>
    <div class="sec"><span>Recommended</span><span>(2)</span></div>
    <div class="row">
      <div class="thumb">Our preview</div>
      <div class="meta">
        <div class="name-line"><strong>Tax Invoice Format 1</strong><span class="tag">Commercial / invoices</span><span class="chip">Approximate</span></div>
        <div class="code">INVOICE_REPORT_FORMAT_1_TAX_INVOICE</div>
        <div class="actions"><span class="btn btn-primary">Preview</span><span class="btn btn-secondary">Generate</span></div>
      </div>
    </div>
    <div class="row">
      <div class="thumb">Our preview</div>
      <div class="meta">
        <div class="name-line"><strong>Standard Invoice</strong><span class="tag">Commercial / invoices</span><span class="chip">Approximate</span></div>
        <div class="code">INVOICE_REPORT_FORMAT_10_STANDARD_INVOICE</div>
        <div class="actions"><span class="btn btn-primary">Preview</span><span class="btn btn-secondary">Generate</span></div>
      </div>
    </div>
    <div class="sec"><span>▸ Sea documents</span><span>(1)</span></div>
    <div class="sec"><span>▸ Not suitable</span><span>(1)</span></div>
    <div class="row">
      <div class="thumb">Our preview</div>
      <div class="meta">
        <div class="name-line"><strong>Standard Tax Invoice</strong><span class="tag">Commercial / invoices</span><span class="chip">Approximate</span></div>
        <div class="code">INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE</div>
        <div class="reason">not suitable for this invoice: the tax is not printed</div>
        <div class="actions"><span class="btn btn-primary">Preview</span><span class="btn btn-secondary">Generate</span></div>
      </div>
    </div>
  </div>
</div></body></html>`;

async function shot(page, html, fileBase) {
  await page.setContent(html, { waitUntil: 'domcontentloaded' });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.screenshot({ path: join(outDir, `${fileBase}-desktop.png`), fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: join(outDir, `${fileBase}-390.png`), fullPage: true });
}

const browser = await chromium.launch();
const page = await browser.newPage();
await shot(page, beforeHtml, 'before');
await shot(page, afterHtml, 'after');
await browser.close();
console.log(JSON.stringify({ ok: true, outDir, files: ['before-desktop.png', 'before-390.png', 'after-desktop.png', 'after-390.png'] }));
