/**
 * Seed warehouse VIDEO DEMO data: WAREHOUSE job + WMS item + GRN (+ optional scan).
 *
 * Usage:
 *   npm run seed:warehouse-video
 *
 * Env (loads .env.e2e / .env):
 *   E2E_TENANT_SLUG, E2E_STAFF_EMAIL, E2E_STAFF_PASSWORD
 *   API_BASE_URL (optional)
 *   SEED_WH_POST_GRN=1  → also POST the GRN after create
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const FIXTURE = path.join(__dirname, 'fixtures', 'warehouse-video-demo.json');
const OUT = path.join(ROOT, '.tmp-warehouse-video-seed-results.json');
const TIMEOUT_MS = 90_000;

loadEnvFile(path.join(ROOT, '.env.e2e'));
loadEnvFile(path.join(ROOT, '.env'));

const BASE = process.env.API_BASE_URL || 'https://kingfisherwings-backend.onrender.com';
const TENANT_SLUG = process.env.E2E_TENANT_SLUG || '';
const STAFF_EMAIL = process.env.E2E_STAFF_EMAIL || '';
const STAFF_PASSWORD = process.env.E2E_STAFF_PASSWORD || '';
const POST_GRN = process.env.SEED_WH_POST_GRN === '1';

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const text = fs.readFileSync(filePath, 'utf8');
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env) || process.env[key] === '') process.env[key] = val;
  }
}

function log(step, message) {
  console.log(`[${step}] ${message}`);
}

function fail(label, res) {
  const detail =
    res?.json?.message ||
    res?.json?.error ||
    (typeof res?.json === 'object' ? JSON.stringify(res.json).slice(0, 400) : res?.text) ||
    `HTTP ${res?.status}`;
  throw new Error(`${label}: ${detail}`);
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
  for (const c of [json, json.data, json.result].filter(Boolean)) {
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
  for (const key of ['items', 'results', 'records', 'jobs', 'parties', 'warehouses']) {
    if (Array.isArray(nested[key])) return nested[key];
  }
  return [];
}

function pickId(entity) {
  return entity?.id && typeof entity.id === 'string' ? entity.id : null;
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
    return { status: res.status, ok: res.ok, json, text: text.slice(0, 500) };
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  const missing = [];
  if (!TENANT_SLUG) missing.push('E2E_TENANT_SLUG');
  if (!STAFF_EMAIL) missing.push('E2E_STAFF_EMAIL');
  if (!STAFF_PASSWORD) missing.push('E2E_STAFF_PASSWORD');
  if (missing.length) {
    console.error(`Missing credentials: ${missing.join(', ')}`);
    process.exit(1);
  }
  if (!fs.existsSync(FIXTURE)) {
    console.error(`Fixture missing: ${FIXTURE}`);
    process.exit(1);
  }

  const fixture = JSON.parse(fs.readFileSync(FIXTURE, 'utf8'));
  const suffix = uniqueSuffix();
  const barcodeHint = `KF-WH-${suffix}`;

  log('start', `API ${BASE}`);
  log('start', `Tenant ${TENANT_SLUG} · seed ${suffix}`);

  log('auth', `Staff login (${STAFF_EMAIL})…`);
  const login = await request('POST', '/auth/login', {
    body: { tenant_slug: TENANT_SLUG, email: STAFF_EMAIL, password: STAFF_PASSWORD },
  });
  if (!login.ok) fail('Staff login', login);
  const token = unwrapToken(login.json);
  if (!token) throw new Error('No access token');

  // Parties (list shape: { data: [...] })
  const partiesRes = await request('GET', '/parties', {
    token,
    query: { page: 1, limit: 100 },
  });
  if (!partiesRes.ok) fail('List parties', partiesRes);
  const parties = unwrapList(partiesRes.json);
  const party =
    parties.find((p) =>
      /al\s*noor|al\s*maha|demo|acme|trading/i.test(String(p.name || p.party_name || '')),
    ) || parties[0];
  const partyId = pickId(party);
  if (!partyId) {
    throw new Error(
      `No party found (HTTP ${partiesRes.status}, count=${parties.length}) — create a customer party first`,
    );
  }
  log('refs', `Party ${party.name || party.party_name || partyId}`);

  // Warehouse master
  let warehouses = unwrapList(
    (await request('GET', '/masters/warehouses', { token, query: { page: 1, limit: 50 } })).json,
  );
  if (!warehouses.length) {
    warehouses = unwrapList(
      (await request('GET', '/wms/warehouses', { token, query: { page: 1, limit: 50 } })).json,
    );
  }
  let warehouseId = pickId(warehouses[0]);
  if (!warehouseId) {
    log('warn', 'No warehouse master — creating via /masters/warehouses');
    const whBody = {
      code: fixture.masters.warehouse.code,
      name: fixture.masters.warehouse.name,
      address: fixture.masters.warehouse.address,
      is_active: true,
    };
    const whRes = await request('POST', '/masters/warehouses', { token, body: whBody });
    if (!whRes.ok) fail('Create warehouse', whRes);
    warehouseId = pickId(unwrapEntity(whRes.json));
  }
  log('refs', `Warehouse ${warehouseId}`);

  // WMS item
  const itemCode = `${fixture.masters.item.code}-${suffix.slice(-4)}`;
  const itemBody = {
    ...fixture.masters.item,
    code: itemCode,
    name: fixture.masters.item.name,
  };
  log('item', `Creating ${itemCode}…`);
  let itemRes = await request('POST', '/wms/items', { token, body: itemBody });
  let itemId = itemRes.ok ? pickId(unwrapEntity(itemRes.json)) : null;
  if (!itemRes.ok) {
    const listed = unwrapList(
      (await request('GET', '/wms/items', { token, query: { page: 1, limit: 100 } })).json,
    );
    const existing = listed.find((i) => String(i.code || '').startsWith('SKU-ELEC'));
    itemId = pickId(existing);
    if (!itemId) fail('Create WMS item', itemRes);
    log('warn', `Item create failed — reusing ${existing.code}`);
  } else {
    log('item', `Created ${itemId}`);
  }

  // Job
  const jobBody = {
    job_type: 'WAREHOUSE',
    shipper_id: partyId,
    billing_party_id: partyId,
    commodity: fixture.job.commodity,
    hs_code: fixture.job.hs_code,
    gross_weight: fixture.job.gross_weight,
    volume_cbm: fixture.job.volume_cbm,
    pieces: fixture.job.pieces,
    incoterms: fixture.job.incoterms,
    customer_remarks: fixture.job.customer_remarks,
    notes: `${fixture.job.notes} [${suffix}] barcode=${barcodeHint}`,
    tags: ['VIDEO-DEMO', 'WAREHOUSE', suffix],
  };
  log('job', 'Creating WAREHOUSE job…');
  const jobRes = await request('POST', '/jobs', { token, body: jobBody });
  if (!jobRes.ok) fail('Create job', jobRes);
  const job = unwrapEntity(jobRes.json);
  const jobId = pickId(job);
  const jobNumber = job?.job_number || job?.jobNumber || jobId;
  const barcode =
    job?.barcode || job?.barcode_value || jobNumber || barcodeHint;
  log('job', `Created ${jobNumber} (${jobId}) · barcode ${barcode}`);

  // Best-effort patch barcode / notes
  await request('PATCH', `/jobs/${jobId}`, {
    token,
    body: {
      barcode: String(barcode),
      barcode_value: String(barcode),
      notes: jobBody.notes,
    },
  });

  // GRN
  const grnBody = {
    warehouse_id: warehouseId,
    party_id: partyId,
    job_id: jobId,
    received_at: fixture.grn.received_at,
    remarks: `${fixture.grn.remarks} · job ${jobNumber}`,
    lines: [
      {
        item_id: itemId,
        quantity: fixture.grn.lines[0].quantity,
        cbm: fixture.grn.lines[0].cbm,
        unit_cost: fixture.grn.lines[0].unit_cost,
        batch_code: `BATCH-${suffix.slice(-6)}`,
        remarks: fixture.grn.lines[0].remarks,
      },
    ],
  };
  log('grn', 'Creating GRN…');
  const grnRes = await request('POST', '/wms/grns', { token, body: grnBody });
  let grnId = null;
  let grnPosted = false;
  if (grnRes.ok) {
    grnId = pickId(unwrapEntity(grnRes.json));
    log('grn', `Created ${grnId}`);
    if (POST_GRN && grnId) {
      const post = await request('POST', `/wms/grns/${grnId}/post`, { token, body: {} });
      if (post.ok) {
        grnPosted = true;
        log('grn', 'Posted');
      } else {
        log('warn', `GRN post failed HTTP ${post.status}`);
      }
    }
  } else {
    log('warn', `GRN create failed: ${JSON.stringify(grnRes.json).slice(0, 200)}`);
  }

  // Optional scan event
  const scanBody = {
    ...fixture.gatekeeperScan.scan.body,
    barcode: String(barcode),
    notes: `${fixture.gatekeeperScan.scan.body.notes} · ${jobNumber}`,
  };
  const scanRes = await request('POST', '/jobs/scan', { token, body: scanBody });
  if (scanRes.ok) log('scan', 'Gate scan recorded');
  else log('warn', `Scan HTTP ${scanRes.status} (film lookup-only is fine)`);

  const summary = {
    seededAt: new Date().toISOString(),
    apiBase: BASE,
    tenantSlug: TENANT_SLUG,
    suffix,
    cast: fixture.cast,
    ids: {
      partyId,
      warehouseId,
      itemId,
      jobId,
      jobNumber,
      barcode,
      grnId,
      grnPosted,
    },
    videoShots: fixture.videoStoryboard.map((s) => ({
      shot: s.shot,
      title: s.title,
      route: s.route,
    })),
    filmNow: [
      `1. Open job: /jobs/air-export/${jobId} → Overview → download barcode sticker PDF`,
      `2. Barcode value to scan: ${barcode}`,
      `3. Gatekeeper: /jobs/barcode-scan → paste ${barcode}`,
      grnId
        ? `4. GRN: /warehouse/grns/${grnId}${grnPosted ? ' (posted)' : ' → Post on camera'}`
        : '4. Create GRN manually if seed GRN failed',
      '5. Storage/invoice: /warehouse/storage or job Invoices tab',
      '6. Driver handoff card lines: see scripts/fixtures/warehouse-video-demo.json → driverHandoffCard',
    ],
    driverHandoffCard: {
      ...fixture.driverHandoffCard,
      lines: fixture.driverHandoffCard.lines.map((line) =>
        line.replace('KF-WH-DEMO-001', String(barcode)),
      ),
    },
    checklist: fixture.manualUiChecklist,
  };

  fs.writeFileSync(OUT, JSON.stringify(summary, null, 2));
  console.log('\n── Warehouse video seed complete ──');
  console.log(`Wrote ${OUT}`);
  console.log(`Job ${jobNumber} · barcode ${barcode}`);
  console.log(`Job URL: /jobs/air-export/${jobId}`);
  console.log(`Scan UI: /jobs/barcode-scan`);
  for (const line of summary.filmNow) console.log(`  ${line}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
