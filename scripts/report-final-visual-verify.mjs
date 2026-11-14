/**
 * Final visual verification: registered org branding + 5 official HAWB formats.
 * Requires: Vite on PLAYWRIGHT_BASE_URL (default http://localhost:5173), .env.e2e staff creds.
 *
 * Run: node scripts/report-final-visual-verify.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173';

const OUT_BRANDING = path.join(root, 'src/features/reports/qa/visual-evidence/branding');
const OUT_HAWB = path.join(root, 'src/features/reports/qa/visual-evidence/hawb');
const MANIFEST = path.join(root, 'src/features/reports/qa/visual-evidence/FINAL_VISUAL_VERIFY_MANIFEST.json');

const OFFICIAL_HAWB = [
  { code: 'HAWB_DRAFT_REPORT_FORMAT', variant: 'draft', name: 'HAWB Draft Report Format' },
  { code: 'HAWB_DRAFT_REPORT_FORMAT_1', variant: 'draft1', name: 'HAWB Draft Report Format-1' },
  { code: 'HAWB_DRAFT_REPORT_FORMAT_2', variant: 'draft2', name: 'HAWB Draft Report Format-2' },
  {
    code: 'HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_1',
    variant: 'original1',
    name: 'HAWB Original Pre Printed Report Format-1',
  },
  {
    code: 'HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_2',
    variant: 'original2',
    name: 'HAWB Original Pre Printed Report Format-2',
  },
];

const HBL_JASPER = 'HBL_DRAFT_REPORT_FORMAT_JASPER';

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env) || process.env[key] === '') process.env[key] = value;
  }
}

loadEnvFile(path.join(root, '.env.e2e'));

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

async function pdfTextFingerprint(bytes) {
  const doc = await getDocument({ data: new Uint8Array(bytes), useSystemFonts: true }).promise;
  const page = await doc.getPage(1);
  const vp = page.getViewport({ scale: 1 });
  const tc = await page.getTextContent();
  const text = tc.items.map((i) => (i.str || '').trim()).filter(Boolean).join(' ');
  return {
    pageCount: doc.numPages,
    widthPt: Math.round(vp.width),
    heightPt: Math.round(vp.height),
    textLength: text.length,
    textSnippet: text.slice(0, 280),
    textLower: text.toLowerCase(),
  };
}

async function loginStaff(page) {
  const slug = process.env.E2E_TENANT_SLUG?.trim();
  const email = process.env.E2E_STAFF_EMAIL?.trim();
  const password = process.env.E2E_STAFF_PASSWORD?.trim();
  if (!slug || !email || !password) {
    throw new Error('Missing E2E_TENANT_SLUG / E2E_STAFF_EMAIL / E2E_STAFF_PASSWORD in .env.e2e');
  }

  await page.goto('/login', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /Admin Login/i }).click({ timeout: 30_000 });
  await page.getByRole('button', { name: 'Staff / User' }).click();
  await page.locator('#kf-tenant-slug').waitFor({ state: 'visible' });
  await page.locator('#kf-tenant-slug').fill(slug);
  await page.locator('#kf-email').fill(email);
  await page.locator('#kf-pw').fill(password);
  await page.locator('input[type="checkbox"]').last().check({ force: true });

  const loginResponsePromise = page.waitForResponse(
    (res) => res.url().includes('/auth/login') && res.request().method() === 'POST',
    { timeout: 120_000 },
  );
  await page.getByRole('button', { name: /Sign In/i }).click();
  const loginRes = await loginResponsePromise;
  if (!loginRes.ok()) {
    const bodyText = await loginRes.text().catch(() => '');
    throw new Error(`Staff login failed HTTP ${loginRes.status()} ${bodyText.slice(0, 200)}`);
  }
  await page.waitForURL(/\/(dashboard|change-password|admin\/users)/, { timeout: 120_000 });
  const body = await loginRes.json().catch(() => null);
  const token =
    body?.access_token ||
    body?.accessToken ||
    body?.data?.access_token ||
    body?.data?.accessToken ||
    null;
  return { slug, email, token };
}

async function fetchOrgProfile(page, token) {
  const result = await page.evaluate(async (accessToken) => {
    const headers = { Accept: 'application/json' };
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
    const res = await fetch('/backend/organization/profile', {
      credentials: 'include',
      headers,
    });
    const text = await res.text();
    let json = null;
    try {
      json = JSON.parse(text);
    } catch {
      /* ignore */
    }
    return { status: res.status, ok: res.ok, json, text: text.slice(0, 500) };
  }, token);
  return result;
}

async function countHawbInSelector(page) {
  await page.goto('/reports/catalog?view=strips&family=air_docs&q=HAWB', {
    waitUntil: 'domcontentloaded',
  });
  await page.waitForTimeout(2500);
  return page.evaluate(() => {
    const strip = document.querySelector('[data-hawb-browse-strip], [data-testid="hawb-format-strip"]');
    const links = Array.from(
      document.querySelectorAll('a[href*="HAWB_"], button[data-code*="HAWB_"], [data-report-code*="HAWB_"]'),
    );
    const codes = new Set();
    for (const el of links) {
      const href = el.getAttribute('href') || '';
      const code =
        el.getAttribute('data-code') ||
        el.getAttribute('data-report-code') ||
        (href.match(/code=([^&]+)/)?.[1] ?? '');
      if (/^HAWB_/i.test(decodeURIComponent(code))) codes.add(decodeURIComponent(code).toUpperCase());
    }
    const listRows = Array.from(document.querySelectorAll('[data-report-code]'))
      .map((el) => (el.getAttribute('data-report-code') || '').toUpperCase())
      .filter((c) => c.startsWith('HAWB_'));
    for (const c of listRows) codes.add(c);
    const bodyText = document.body?.innerText || '';
    const named = [
      'HAWB Draft Report Format',
      'HAWB Draft Report Format-1',
      'HAWB Draft Report Format-2',
      'HAWB Original Pre Printed Report Format-1',
      'HAWB Original Pre Printed Report Format-2',
    ].filter((n) => bodyText.includes(n));
    return {
      stripPresent: Boolean(strip),
      uniqueCodes: [...codes].sort(),
      codeCount: codes.size,
      namedHits: named,
      namedCount: named.length,
    };
  });
}

async function openFormatAndCapture(page, code, outDir, fileStem) {
  ensureDir(outDir);
  const url = `/reports/catalog?code=${encodeURIComponent(code)}`;
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  // Wait for PDF modal / canvas / iframe / object
  const pdfReady = page
    .locator(
      '[role="dialog"] canvas, [role="dialog"] iframe, [role="dialog"] embed, [role="dialog"] object, canvas.pdf-page, [data-pdf-viewer]',
    )
    .first();
  const errorEl = page.locator('text=/Could not open|No HAWB|No HBL|failed/i').first();

  let opened = false;
  try {
    await pdfReady.waitFor({ state: 'visible', timeout: 90_000 });
    opened = true;
  } catch {
    opened = false;
  }

  const shotPath = path.join(outDir, `${fileStem}-preview.png`);
  await page.screenshot({ path: shotPath, fullPage: true });

  let pdfPath = null;
  let fingerprint = null;
  let brandingChecks = null;

  // Try to download via viewer Download button if present
  const downloadBtn = page.getByRole('button', { name: /download/i }).first();
  if (opened && (await downloadBtn.isVisible().catch(() => false))) {
    try {
      const [download] = await Promise.all([
        page.waitForEvent('download', { timeout: 30_000 }),
        downloadBtn.click(),
      ]);
      pdfPath = path.join(outDir, `${fileStem}.pdf`);
      await download.saveAs(pdfPath);
      const bytes = fs.readFileSync(pdfPath);
      fingerprint = await pdfTextFingerprint(bytes);
    } catch {
      /* download optional */
    }
  }

  const errText = opened ? null : (await errorEl.textContent().catch(() => null));

  return {
    code,
    opened,
    screenshot: path.relative(root, shotPath).replace(/\\/g, '/'),
    pdf: pdfPath ? path.relative(root, pdfPath).replace(/\\/g, '/') : null,
    error: errText,
    fingerprint,
    brandingChecks,
  };
}

async function main() {
  ensureDir(OUT_BRANDING);
  ensureDir(OUT_HAWB);

  const manifest = {
    generatedAt: new Date().toISOString(),
    baseURL,
    dualCompany: {
      status: 'blocked',
      reason: '',
      companiesAttempted: [],
    },
    branding: [],
    hawb: [],
    hawbSelector: null,
    limitations: [],
  };

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    acceptDownloads: true,
    baseURL,
  });
  const page = await context.newPage();
  page.setDefaultTimeout(60_000);

  let login;
  try {
    login = await loginStaff(page);
  } catch (err) {
    manifest.limitations.push(`Login failed: ${err instanceof Error ? err.message : String(err)}`);
    manifest.dualCompany.reason =
      'Could not authenticate the single available E2E tenant; dual-company and live PDF capture blocked.';
    fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));
    await browser.close();
    console.error(JSON.stringify(manifest, null, 2));
    process.exit(1);
  }

  const profileRes = await fetchOrgProfile(page, login.token);
  const profile = profileRes.json?.data || profileRes.json || null;
  const companyName =
    (profile?.display_name || profile?.name || '').trim() || null;
  const logoUrl = (profile?.logo_url || '').trim() || null;

  manifest.dualCompany.companiesAttempted.push({
    tenantSlug: login.slug,
    profileHttpStatus: profileRes.status,
    profileLoaded: Boolean(profileRes.ok && companyName),
    companyName: companyName || null,
    logoUrlPresent: Boolean(logoUrl),
    logoUrlHost: logoUrl ? (() => { try { return new URL(logoUrl).host; } catch { return 'relative-or-invalid'; } })() : null,
  });

  if (!profileRes.ok || !companyName) {
    manifest.limitations.push(
      `GET /organization/profile failed or empty (HTTP ${profileRes.status}). Live branding PDF checks incomplete.`,
    );
  }

  // Only one E2E tenant configured — second company unavailable.
  const secondSlug = process.env.E2E_TENANT_SLUG_2?.trim();
  const secondEmail = process.env.E2E_STAFF_EMAIL_2?.trim();
  const secondPassword = process.env.E2E_STAFF_PASSWORD_2?.trim();
  if (!secondSlug || !secondEmail || !secondPassword) {
    manifest.dualCompany.status = 'partial_single_company_only';
    manifest.dualCompany.reason =
      'Only one authorized E2E tenant is configured (.env.e2e). No E2E_TENANT_SLUG_2 / E2E_STAFF_EMAIL_2 / E2E_STAFF_PASSWORD_2 for a second registered company. Dual-company isolation was not executed. Do not fabricate a second company.';
    manifest.limitations.push(manifest.dualCompany.reason);
  } else {
    manifest.dualCompany.status = 'credentials_present_but_not_run_in_this_script_path';
    manifest.dualCompany.reason = 'Second tenant env vars present — extend script to switch session.';
  }

  // Branding: HBL Jasper + one HAWB under the single registered company
  const hblCapture = await openFormatAndCapture(
    page,
    HBL_JASPER,
    OUT_BRANDING,
    'company1-hbl-jasper',
  );
  if (hblCapture.fingerprint && companyName) {
    const hasName = hblCapture.fingerprint.textLower.includes(companyName.toLowerCase());
    const hasFresaBrand =
      /\bfresa technologies\b/i.test(hblCapture.fingerprint.textLower) &&
      !/\bfresa demo\b/i.test(hblCapture.fingerprint.textSnippet);
    hblCapture.brandingChecks = {
      companyNameExpected: companyName,
      companyNameFoundInPdfText: hasName,
      logoUrlExpected: logoUrl,
      suspiciousFresaProductBranding: hasFresaBrand,
      note: 'Sample/demo party text may still contain FRESA DEMO fixture strings from official sample PDFs; product branding stamp should use registered org.',
    };
  }
  manifest.branding.push({ kind: 'hbl_jasper', ...hblCapture, companyName, logoUrl });

  const hawbBrandCapture = await openFormatAndCapture(
    page,
    OFFICIAL_HAWB[0].code,
    OUT_BRANDING,
    'company1-hawb-draft',
  );
  if (hawbBrandCapture.fingerprint && companyName) {
    const hasName = hawbBrandCapture.fingerprint.textLower.includes(companyName.toLowerCase());
    hawbBrandCapture.brandingChecks = {
      companyNameExpected: companyName,
      companyNameFoundInPdfText: hasName,
      logoUrlExpected: logoUrl,
    };
  }
  manifest.branding.push({ kind: 'hawb_draft', ...hawbBrandCapture, companyName, logoUrl });

  // HAWB five formats
  for (const row of OFFICIAL_HAWB) {
    const capture = await openFormatAndCapture(
      page,
      row.code,
      OUT_HAWB,
      row.code.toLowerCase(),
    );
    capture.officialName = row.name;
    capture.expectedVariant = row.variant;
    if (capture.fingerprint && companyName) {
      capture.brandingChecks = {
        companyNameExpected: companyName,
        companyNameFoundInPdfText: capture.fingerprint.textLower.includes(
          companyName.toLowerCase(),
        ),
      };
    }
    manifest.hawb.push(capture);
  }

  // Distinctness among captured HAWB PDFs
  const fps = manifest.hawb.map((h) => h.fingerprint?.textSnippet || h.fingerprint?.textLength);
  const sizes = manifest.hawb.map((h) =>
    h.fingerprint ? `${h.fingerprint.widthPt}x${h.fingerprint.heightPt}` : null,
  );
  manifest.hawbDistinctness = {
    uniqueSnippets: new Set(fps.filter(Boolean)).size,
    uniquePageSizes: new Set(sizes.filter(Boolean)).size,
    pageSizes: sizes,
  };

  try {
    manifest.hawbSelector = await countHawbInSelector(page);
  } catch (err) {
    manifest.hawbSelector = {
      error: err instanceof Error ? err.message : String(err),
    };
  }

  // Deep-link historical Format-3 still resolvable (not in selector)
  try {
    await page.goto('/reports/catalog?code=HAWB_DRAFT_REPORT_FORMAT_3', {
      waitUntil: 'domcontentloaded',
    });
    await page.waitForTimeout(2000);
    const histShot = path.join(OUT_HAWB, 'historical-format3-deep-link.png');
    await page.screenshot({ path: histShot, fullPage: true });
    manifest.historicalFormat3 = {
      resolvableDeepLink: true,
      screenshot: path.relative(root, histShot).replace(/\\/g, '/'),
      note: 'Deep-link preserved; must not appear in official selector count of 5.',
    };
  } catch (err) {
    manifest.historicalFormat3 = {
      resolvableDeepLink: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }

  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));
  await browser.close();
  console.log(JSON.stringify({ ok: true, manifest: path.relative(root, MANIFEST) }, null, 2));
  console.log(
    JSON.stringify(
      {
        dualCompany: manifest.dualCompany.status,
        brandingCaptures: manifest.branding.length,
        hawbCaptures: manifest.hawb.length,
        hawbOpened: manifest.hawb.filter((h) => h.opened).length,
        limitations: manifest.limitations,
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
