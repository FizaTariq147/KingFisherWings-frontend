/**
 * Seed Documentation module test data via live API.
 *
 * Creates: BOE record, charge template (+ optional apply), CGM vessel, bulk cost batch.
 *
 * Usage:
 *   node scripts/seed-documentation-test-data.mjs
 *
 * Environment (optional):
 *   API_BASE_URL          default https://kingfisherwings-backend.onrender.com
 *   E2E_TENANT_SLUG       default kingfisher-wings
 *   E2E_TENANT_PASSWORD   default Kingfish@2026
 *   DOC_SEED_APPLY_TEMPLATE  set to "1" to apply charge template to first job
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const BASE = process.env.API_BASE_URL || 'https://kingfisherwings-backend.onrender.com';
const TENANT_SLUG = process.env.E2E_TENANT_SLUG || 'kingfisher-wings';
const TENANT_PASSWORD = process.env.E2E_TENANT_PASSWORD || 'Kingfish@2026';
const APPLY_TEMPLATE = process.env.DOC_SEED_APPLY_TEMPLATE === '1';
const OUT = path.join(ROOT, '.tmp-documentation-seed-results.json');
const TIMEOUT_MS = 90_000;

function log(step, message) {
  console.log(`[${step}] ${message}`);
}

function unwrapEntity(json) {
  if (!json || typeof json !== 'object') return json;
  if ('data' in json) {
    const nested = json.data;
    if (nested && typeof nested === 'object' && 'data' in nested && Object.keys(nested).length <= 2) {
      return nested.data;
    }
    return nested;
  }
  return json;
}

function unwrapToken(json) {
  if (!json || typeof json !== 'object') return null;
  const candidates = [json, json.data, json.result].filter(Boolean);
  for (const c of candidates) {
    if (typeof c !== 'object') continue;
    const t = c.access_token || c.accessToken || c.token;
    if (typeof t === 'string' && t.length > 20) return t;
    if (c.data && typeof c.data === 'object') {
      const nested = c.data.access_token || c.data.accessToken;
      if (typeof nested === 'string') return nested;
    }
  }
  return null;
}

function unwrapList(json) {
  if (Array.isArray(json)) return json;
  if (!json || typeof json !== 'object') return [];
  if (Array.isArray(json.data)) return json.data;
  const nested = json.data && typeof json.data === 'object' ? json.data : json;
  for (const key of ['items', 'results', 'records', 'jobs', 'parties', 'ports', 'templates']) {
    if (Array.isArray(nested[key])) return nested[key];
  }
  return [];
}

function pickId(entity) {
  return entity?.id && typeof entity.id === 'string' ? entity.id : null;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function uniqueSuffix() {
  return Date.now().toString(36).toUpperCase();
}

async function request(method, urlPath, { token, body, query } = {}) {
  const url = new URL(BASE + urlPath);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null || v === '') continue;
      url.searchParams.set(k, String(v));
    }
  }

  const headers = { Accept: 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    const text = await res.text();
    let json = null;
    try {
      json = JSON.parse(text);
    } catch {
      json = { raw: text.slice(0, 500) };
    }
    return { status: res.status, ok: res.ok, json, text: text.slice(0, 500), url: url.toString() };
  } finally {
    clearTimeout(timer);
  }
}

function fail(label, res) {
  const detail =
    res.json?.message ||
    res.json?.error ||
    (typeof res.json?.raw === 'string' ? res.json.raw : null) ||
    res.text ||
    `HTTP ${res.status}`;
  throw new Error(`${label} failed (${res.status}): ${detail}`);
}

async function login() {
  log('auth', `Tenant login (${TENANT_SLUG})…`);
  const res = await request('POST', '/auth/tenant-login', {
    body: { tenant_slug: TENANT_SLUG, password: TENANT_PASSWORD },
  });
  if (!res.ok) fail('Login', res);
  const token = unwrapToken(res.json);
  if (!token) throw new Error('Login succeeded but no access token in response.');
  log('auth', 'OK');
  return token;
}

async function fetchPrerequisites(token) {
  log('lookup', 'Fetching jobs, parties, ports, charge codes…');

  const [jobsRes, partiesRes, portsRes, chargesRes] = await Promise.all([
    request('GET', '/jobs', { token, query: { page: 1, limit: 10 } }),
    request('GET', '/parties', { token, query: { page: 1, limit: 5 } }),
    request('GET', '/masters/ports', { token, query: { page: 1, limit: 5 } }),
    request('GET', '/masters/charge-codes', { token, query: { page: 1, limit: 5 } }),
  ]);

  if (!jobsRes.ok) fail('List jobs', jobsRes);
  if (!partiesRes.ok) fail('List parties', partiesRes);
  if (!portsRes.ok) fail('List ports', portsRes);
  if (!chargesRes.ok) fail('List charge codes', chargesRes);

  const jobs = unwrapList(jobsRes.json);
  const parties = unwrapList(partiesRes.json);
  const ports = unwrapList(portsRes.json);
  const chargeCodes = unwrapList(chargesRes.json);

  const seaJob = jobs.find((j) => j.job_type === 'SEA_FCL_EXPORT') || jobs[0];
  const secondJob = jobs.find((j) => j.id !== seaJob?.id) || jobs[1] || seaJob;
  const party = parties[0];
  const pol = ports[0];
  const pod = ports[1] || ports[0];
  const ofr = chargeCodes.find((c) => c.code === 'OFR') || chargeCodes[0];
  const thc = chargeCodes.find((c) => c.code === 'THC') || chargeCodes[1] || chargeCodes[0];

  if (!seaJob?.id) throw new Error('No jobs found — create at least one job before seeding documentation data.');

  const refs = {
    jobId: seaJob.id,
    jobNumber: seaJob.job_number,
    secondJobId: secondJob?.id,
    partyId: party?.id,
    partyName: party?.name,
    polId: pol?.id,
    polName: pol?.name,
    podId: pod?.id,
    podName: pod?.name,
    ofrChargeId: ofr?.id,
    thcChargeId: thc?.id,
  };

  log('lookup', `Job: ${refs.jobNumber} (${refs.jobId})`);
  if (refs.partyName) log('lookup', `Party: ${refs.partyName}`);
  if (refs.polName && refs.podName) log('lookup', `Ports: ${refs.polName} → ${refs.podName}`);

  return refs;
}

async function seedBoe(token, refs, suffix) {
  const body = {
    boe_number: `BOE-SEED-${suffix}`,
    boe_date: todayIso(),
    boe_type: 'IMPORT',
    status: 'OPEN',
    job_id: refs.jobId,
    party_id: refs.partyId,
    port_id: refs.polId,
    customs_office: 'Jebel Ali Customs',
  };

  log('boe', `Creating ${body.boe_number}…`);
  const res = await request('POST', '/documentation/boe', { token, body });
  if (!res.ok) fail('Create BOE', res);
  const record = unwrapEntity(res.json);
  const id = pickId(record) || record?.boe_id;
  log('boe', `Created ${body.boe_number}${id ? ` (id: ${id})` : ''}`);
  return { boeNumber: body.boe_number, id, record };
}

async function seedChargeTemplate(token, refs, suffix) {
  const body = {
    name: `Doc Seed Template ${suffix}`,
    description: 'Auto-seeded charge template for Documentation module testing',
    job_types: ['SEA_FCL_EXPORT', 'SEA_FCL_IMPORT'],
    is_active: true,
    lines: [
      {
        charge_code_id: refs.ofrChargeId,
        description: 'Ocean Freight (seed)',
        sale_or_cost: 'SALE',
        dr_cr: 'DR',
        currency_code: 'USD',
        default_amount: 1850,
        sort_order: 1,
      },
      {
        charge_code_id: refs.thcChargeId,
        description: 'Terminal Handling (seed)',
        sale_or_cost: 'COST',
        dr_cr: 'DR',
        currency_code: 'AED',
        default_amount: 450,
        sort_order: 2,
      },
    ],
  };

  log('charge-template', `Creating "${body.name}"…`);
  const res = await request('POST', '/documentation/charge-templates', { token, body });
  if (!res.ok) fail('Create charge template', res);
  const record = unwrapEntity(res.json);
  const id = pickId(record);
  log('charge-template', `Created template${id ? ` (id: ${id})` : ''}`);

  let applyResult = null;
  if (APPLY_TEMPLATE && id) {
    log('charge-template', `Applying to job ${refs.jobId}…`);
    const applyRes = await request('POST', `/documentation/charge-templates/${id}/apply`, {
      token,
      body: { job_id: refs.jobId },
    });
    if (!applyRes.ok) fail('Apply charge template', applyRes);
    applyResult = unwrapEntity(applyRes.json);
    log('charge-template', 'Applied to job');
  }

  return { templateId: id, templateName: body.name, applyResult, record };
}

async function seedCgmVessel(token, refs, suffix) {
  const body = {
    vessel_name: `SEED VESSEL ${suffix}`,
    voyage_number: `V${suffix.slice(-4)}`,
    pol_id: refs.polId,
    pod_id: refs.podId,
    etd: todayIso(),
    eta: todayIso(),
    remarks: 'Seeded by scripts/seed-documentation-test-data.mjs',
  };

  log('cgm', `Creating ${body.vessel_name} / ${body.voyage_number}…`);
  const res = await request('POST', '/documentation/edi/cgm/vessels', { token, body });
  if (!res.ok) fail('Create CGM vessel', res);
  const record = unwrapEntity(res.json);
  const id = pickId(record);
  log('cgm', `Created CGM vessel${id ? ` (id: ${id})` : ''}`);
  return { cgmVesselId: id, vesselName: body.vessel_name, voyageNumber: body.voyage_number, record };
}

async function seedBulkCost(token, refs, suffix) {
  const lines = [
    {
      job_id: refs.jobId,
      charge_code_id: refs.thcChargeId,
      description: `Seed bulk cost line 1 (${suffix})`,
      currency_code: 'AED',
      fcy_amount: 1250,
      sale_or_cost: 'COST',
      dr_cr: 'DR',
    },
  ];

  if (refs.secondJobId && refs.secondJobId !== refs.jobId) {
    lines.push({
      job_id: refs.secondJobId,
      description: `Seed bulk cost line 2 (${suffix})`,
      currency_code: 'AED',
      fcy_amount: 380,
      sale_or_cost: 'COST',
      dr_cr: 'DR',
    });
  }

  const body = {
    voyage_number: `V-SEED-${suffix}`,
    prorate_method: 'BY_WEIGHT',
    lines,
  };

  log('bulk-cost', 'Previewing batch…');
  const previewRes = await request('POST', '/documentation/bulk-costs/preview', { token, body });
  if (!previewRes.ok) fail('Bulk cost preview', previewRes);
  const preview = unwrapEntity(previewRes.json);
  log('bulk-cost', 'Preview OK — creating batch…');

  const createRes = await request('POST', '/documentation/bulk-costs', { token, body });
  if (!createRes.ok) fail('Create bulk cost batch', createRes);
  const record = unwrapEntity(createRes.json);
  const id = pickId(record);
  log('bulk-cost', `Created batch${id ? ` (id: ${id})` : ''}`);
  return { bulkCostId: id, voyageNumber: body.voyage_number, preview, record };
}

async function verifyDashboard(token, boeNumber) {
  log('verify', 'Checking BOE dashboard…');
  const res = await request('GET', '/documentation/boe/dashboard', {
    token,
    query: { search: boeNumber, page: 1, limit: 10 },
  });
  if (!res.ok) {
    log('verify', `Dashboard check skipped (${res.status})`);
    return null;
  }
  const items = unwrapList(res.json);
  const found = items.some((row) => String(row.boe_number || '').includes(boeNumber));
  log('verify', found ? 'BOE visible on dashboard' : 'BOE not found on dashboard (may need time to index)');
  return { found, count: items.length };
}

async function main() {
  const suffix = uniqueSuffix();
  const startedAt = new Date().toISOString();
  const results = {
    startedAt,
    baseUrl: BASE,
    tenantSlug: TENANT_SLUG,
    suffix,
    steps: {},
    errors: [],
  };

  console.log('');
  console.log('Documentation seed — KingFisher Wings');
  console.log(`API: ${BASE}`);
  console.log(`Tenant: ${TENANT_SLUG}`);
  console.log('');

  try {
    const token = await login();
    const refs = await fetchPrerequisites(token);

    results.refs = refs;

    results.steps.boe = await seedBoe(token, refs, suffix);
    results.steps.chargeTemplate = await seedChargeTemplate(token, refs, suffix);
    results.steps.cgmVessel = await seedCgmVessel(token, refs, suffix);
    results.steps.bulkCost = await seedBulkCost(token, refs, suffix);
    results.steps.dashboard = await verifyDashboard(token, results.steps.boe.boeNumber);

    results.success = true;
    results.finishedAt = new Date().toISOString();

    console.log('');
    console.log('Seed complete.');
    console.log('');
    console.log('Summary:');
    console.log(`  BOE number:       ${results.steps.boe.boeNumber}`);
    if (results.steps.chargeTemplate.templateId) {
      console.log(`  Charge template:  ${results.steps.chargeTemplate.templateName}`);
      console.log(`  Template ID:      ${results.steps.chargeTemplate.templateId}`);
    }
    if (results.steps.cgmVessel.cgmVesselId) {
      console.log(`  CGM vessel:       ${results.steps.cgmVessel.vesselName} / ${results.steps.cgmVessel.voyageNumber}`);
      console.log(`  CGM ID:           ${results.steps.cgmVessel.cgmVesselId}`);
    }
    if (results.steps.bulkCost.bulkCostId) {
      console.log(`  Bulk cost batch:  ${results.steps.bulkCost.bulkCostId}`);
    }
    console.log('');
    console.log('UI checks:');
    console.log('  /documentation/boe-dashboard');
    console.log('  /documentation/charge-template-list');
    console.log('  /documentation/cgm-edi-vessel-list');
    console.log('  /documentation/bulk-cost-entry');
    console.log('');
  } catch (error) {
    results.success = false;
    results.finishedAt = new Date().toISOString();
    results.errors.push(error instanceof Error ? error.message : String(error));
    console.error('');
    console.error('Seed failed:', error instanceof Error ? error.message : error);
    if (String(error).includes('403')) {
      console.error('');
      console.error('Hint: 403 usually means one of:');
      console.error('  • Missing permission documentation.manage on the tenant user');
      console.error('  • REQUIRES_2FA_SETUP middleware blocking ERP routes');
      console.error('Ask backend to grant documentation permissions (or use a staff user with them), then re-run.');
    }
    process.exitCode = 1;
  } finally {
    fs.mkdirSync(path.dirname(OUT), { recursive: true });
    fs.writeFileSync(OUT, JSON.stringify(results, null, 2));
    log('output', `Results written to ${path.relative(ROOT, OUT)}`);
  }
}

main();
