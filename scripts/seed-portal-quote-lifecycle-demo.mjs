/**
 * Seed customer-portal quotation demo data across job types + lifecycle gates.
 *
 * Creates portal quote requests, advances them through staff send / customer
 * accept / booking-form / convert (where applicable), and writes a results JSON.
 *
 * Usage:
 *   npm run seed:portal-quotes
 *
 * Environment (also loads .env.e2e / .env if present):
 *   API_BASE_URL            default https://kingfisherwings-backend.onrender.com
 *   E2E_TENANT_SLUG         required
 *   E2E_STAFF_EMAIL         required
 *   E2E_STAFF_PASSWORD      required
 *   E2E_PORTAL_EMAIL        required (customer portal user)
 *   E2E_PORTAL_PASSWORD     required
 *   SEED_KEYS               optional comma list (e.g. air-export-form,air-import-sent)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const FIXTURE = path.join(__dirname, 'fixtures', 'portal-quote-lifecycle-demo.json');
const OUT = path.join(ROOT, '.tmp-portal-quote-lifecycle-seed-results.json');
const TIMEOUT_MS = 90_000;

loadEnvFile(path.join(ROOT, '.env.e2e'));
loadEnvFile(path.join(ROOT, '.env'));

const BASE = process.env.API_BASE_URL || 'https://kingfisherwings-backend.onrender.com';
const TENANT_SLUG = process.env.E2E_TENANT_SLUG || '';
const STAFF_EMAIL = process.env.E2E_STAFF_EMAIL || '';
const STAFF_PASSWORD = process.env.E2E_STAFF_PASSWORD || '';
const PORTAL_EMAIL = process.env.E2E_PORTAL_EMAIL || '';
const PORTAL_PASSWORD = process.env.E2E_PORTAL_PASSWORD || '';

const MODE_CONVERT = new Set([
  'SEA_FCL_EXPORT',
  'SEA_FCL_IMPORT',
  'SEA_LCL_EXPORT',
  'SEA_LCL_IMPORT',
  'LAND',
  'ROAD_FREIGHT',
  'COURIER',
]);

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
    if (!(key in process.env) || process.env[key] === '') {
      process.env[key] = val;
    }
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
  for (const key of ['items', 'results', 'records', 'ports', 'airports', 'charge_codes', 'chargeCodes']) {
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

function validUntilPlusDays(days = 30) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
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

async function soft(label, fn) {
  try {
    return await fn();
  } catch (err) {
    log('warn', `${label}: ${err.message}`);
    return null;
  }
}

function usesModeConvert(jobType) {
  const jt = String(jobType || '')
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_');
  if (MODE_CONVERT.has(jt)) return true;
  return jt.startsWith('SEA_FCL_') || jt.startsWith('SEA_LCL_') || jt.startsWith('ROAD_');
}

function isAir(jobType) {
  return String(jobType || '')
    .toUpperCase()
    .startsWith('AIR_');
}

function buildBookingFormBody(fixtureForm, jobType, suffix) {
  const form = structuredClone(fixtureForm);
  if (form.date_of_request === 'USE_TODAY') form.date_of_request = todayIso();
  form.client_booking_no = `CUST-BK-${suffix}`;
  form.voyage_ref = `DEMO-VOY-${suffix.slice(-4)}`;
  form.sq_bl_booking_reference = `SQ-${suffix}`;
  form.mark_complete = true;
  form.consent_accepted = true;
  if (isAir(jobType)) {
    delete form.pol;
    delete form.pod;
    form.origin_airport_code = form.origin_airport_code || 'DXB';
    form.dest_airport_code = form.dest_airport_code || 'LHR';
    form.gross_weight_kg = form.gross_weight_kg || 120;
    form.chargeable_weight_kg = form.chargeable_weight_kg || 150;
    form.volume_cbm = form.volume_cbm || 1.2;
    form.pieces = form.pieces || 4;
  }
  return form;
}

function formatBookingFormMessageBody({ quotationId, quoteNumber, jobType, jobId, dto }) {
  const payload = {
    v: 2,
    quotationId,
    quoteNumber,
    jobType,
    jobId: jobId || undefined,
    submittedAt: new Date().toISOString(),
    ...dto,
  };
  const shipper = (dto.parties || []).find((p) => p.party_kind === 'SHIPPER');
  const consignee = (dto.parties || []).find((p) => p.party_kind === 'CONSIGNEE');
  return [
    'CUSTOMER BOOKING FORM (UpsertNvoccBookingFormDto)',
    `Quote: ${quoteNumber || quotationId}`,
    `Job type: ${jobType || '—'}`,
    `Shipper: ${shipper?.full_name || '—'}`,
    `Consignee: ${consignee?.full_name || '—'}`,
    `Mark complete: ${dto.mark_complete ? 'YES' : 'draft'}`,
    '---KF_PORTAL_BOOKING_FORM_JSON---',
    JSON.stringify(payload),
    '---END_KF_PORTAL_BOOKING_FORM_JSON---',
  ].join('\n');
}

async function loginStaff() {
  log('auth', `Staff login (${TENANT_SLUG} / ${STAFF_EMAIL})…`);
  const res = await request('POST', '/auth/login', {
    body: {
      tenant_slug: TENANT_SLUG,
      email: STAFF_EMAIL,
      password: STAFF_PASSWORD,
    },
  });
  if (!res.ok) fail('Staff login', res);
  const token = unwrapToken(res.json);
  if (!token) throw new Error('Staff login: no access token');
  return token;
}

async function loginPortal() {
  log('auth', `Portal login (${TENANT_SLUG} / ${PORTAL_EMAIL})…`);
  const res = await request('POST', '/portal/auth/login', {
    body: {
      tenant_slug: TENANT_SLUG,
      email: PORTAL_EMAIL,
      password: PORTAL_PASSWORD,
    },
  });
  if (!res.ok) fail('Portal login', res);
  const token = unwrapToken(res.json);
  if (!token) throw new Error('Portal login: no access token');
  return token;
}

async function loadRefs(staffToken) {
  const portsRes = await request('GET', '/masters/ports', {
    token: staffToken,
    query: { page: 1, limit: 100, is_active: true },
  });
  const ports = unwrapList(portsRes.json);
  const portA = ports[0];
  const portB = ports.find((p) => pickId(p) && pickId(p) !== pickId(portA)) || ports[1];

  const airportsRes = await request('GET', '/masters/airports', {
    token: staffToken,
    query: { page: 1, limit: 100, is_active: true },
  });
  const airports = unwrapList(airportsRes.json);
  const airA = airports[0];
  const airB = airports.find((a) => pickId(a) && pickId(a) !== pickId(airA)) || airports[1];

  const chargesRes = await request('GET', '/masters/charge-codes', {
    token: staffToken,
    query: { page: 1, limit: 100, is_active: true },
  });
  const charges = unwrapList(chargesRes.json);
  const charge = charges[0];

  const containersRes = await request('GET', '/masters/container-types', {
    token: staffToken,
    query: { page: 1, limit: 50, is_active: true },
  });
  const containers = unwrapList(containersRes.json);

  // Map airport IATA → ports-master UUID (API rejects airport UUIDs on origin_port_id).
  const airOriginPortId = resolvePortIdForAirport(airA, ports) || pickId(portA);
  const airDestPortId =
    resolvePortIdForAirport(airB, ports) ||
    (pickId(portB) !== airOriginPortId ? pickId(portB) : pickId(portA));

  return {
    originPortId: pickId(portA),
    destPortId: pickId(portB),
    airOriginPortId,
    airDestPortId,
    originAirportId: pickId(airA),
    destAirportId: pickId(airB),
    chargeCodeId: pickId(charge),
    containerTypeId: pickId(containers[0]),
    portCount: ports.length,
    airportCount: airports.length,
    chargeCount: charges.length,
  };
}

function portCodeMatchesAirportCode(portCode, airportCode) {
  if (!portCode?.trim() || !airportCode?.trim()) return false;
  const p = String(portCode).trim().toLowerCase();
  const a = String(airportCode).trim().toLowerCase();
  return p === a || p.endsWith(a) || p.includes(a);
}

function resolvePortIdForAirport(airport, ports) {
  if (!airport || !ports?.length) return null;
  const linked = airport.linked_port_id || airport.linkedPortId || airport.port_id || airport.portId;
  if (linked && typeof linked === 'string' && linked !== pickId(airport)) {
    const hit = ports.find((p) => pickId(p) === linked);
    if (hit) return pickId(hit);
  }
  const code =
    airport.iata_code || airport.iataCode || airport.code || airport.icao_code || airport.icaoCode;
  if (code) {
    const byCode = ports.find((p) =>
      portCodeMatchesAirportCode(p.code || p.un_locode || p.unLocode || p.port_code, code),
    );
    if (byCode) return pickId(byCode);
  }
  const name = String(airport.name || airport.airport_name || airport.city || '')
    .split('—')[0]
    ?.trim()
    .toLowerCase();
  if (name && name.length >= 3) {
    const byName = ports.find((p) => {
      const pn = String(p.name || p.port_name || p.city || '').toLowerCase();
      return pn.includes(name) || name.includes(pn);
    });
    if (byName) return pickId(byName);
  }
  return null;
}

/**
 * API validates origin_port_id / dest_port_id against the ports master only.
 * Air UI picks airports, then maps to a linked/matching port UUID — never send
 * an airport row id (that yields "Origin port not found").
 */
function buildRequestBody(payload, refs, suffix) {
  const body = {
    ...payload,
    special_requirements: `${payload.special_requirements || 'DEMO'} [${suffix}]`,
    valid_until: validUntilPlusDays(30),
  };

  // Prefer air-mapped ports when present; otherwise any two distinct ports.
  const originId = isAir(payload.job_type)
    ? refs.airOriginPortId || refs.originPortId
    : refs.originPortId;
  const destId = isAir(payload.job_type)
    ? refs.airDestPortId || refs.destPortId
    : refs.destPortId;

  if (originId) body.origin_port_id = originId;
  if (destId) body.dest_port_id = destId;

  if (refs.containerTypeId && String(payload.job_type).includes('FCL')) {
    body.container_type_id = refs.containerTypeId;
    body.container_count = body.container_count || 1;
  }

  return body;
}

async function portalRequestQuote(portalToken, body) {
  const res = await request('POST', '/portal/quotations/request', {
    token: portalToken,
    body,
  });
  if (!res.ok) fail(`Portal request ${body.job_type}`, res);
  const entity = unwrapEntity(res.json);
  const id = pickId(entity) || entity?.quotation_id || entity?.quotationId;
  if (!id) throw new Error(`Portal request ${body.job_type}: no quotation id`);
  return { id, entity, number: entity?.quotation_number || entity?.quote_no || entity?.number };
}

async function staffEnsureLinesAndSend(staffToken, quotationId, refs, currency = 'USD') {
  // Prefer tariff; fall back to a single demo line.
  const tariff = await request('POST', `/quotations/${quotationId}/apply-tariff`, {
    token: staffToken,
    body: {},
  });
  if (!tariff.ok && refs.chargeCodeId) {
    const lineRes = await request('POST', `/quotations/${quotationId}/lines`, {
      token: staffToken,
      body: {
        charge_code_id: refs.chargeCodeId,
        description: 'DEMO Freight / service charge',
        quantity: 1,
        unit_price: 250,
        currency_code: currency,
        unit: 'SHPT',
      },
    });
    if (!lineRes.ok) {
      log('warn', `Add line failed for ${quotationId}: HTTP ${lineRes.status}`);
    }
  }

  for (const [label, pathSuffix, body] of [
    ['submit', 'submit', undefined],
    ['approve', 'approve', { comments: 'DEMO seed internal approve' }],
    ['send', 'send', undefined],
  ]) {
    const res = await request('POST', `/quotations/${quotationId}/${pathSuffix}`, {
      token: staffToken,
      body,
    });
    if (!res.ok && res.status !== 409) {
      // Some tenants auto-transition; try next step anyway.
      log('warn', `Staff ${label} ${quotationId}: HTTP ${res.status}`);
    }
  }

  const detail = await request('GET', `/quotations/${quotationId}`, { token: staffToken });
  return unwrapEntity(detail.json);
}

async function portalAccept(portalToken, quotationId) {
  const res = await request('POST', `/portal/quotations/${quotationId}/accept`, {
    token: portalToken,
    body: {},
  });
  if (!res.ok && res.status !== 409) fail(`Portal accept ${quotationId}`, res);
  return unwrapEntity(res.json);
}

async function portalReject(portalToken, quotationId) {
  const res = await request('POST', `/portal/quotations/${quotationId}/reject`, {
    token: portalToken,
    body: {
      reason: 'No Longer Required',
      notes: 'DEMO seed reject path',
    },
  });
  if (!res.ok && res.status !== 409) fail(`Portal reject ${quotationId}`, res);
  return unwrapEntity(res.json);
}

async function portalSubmitBookingForm(portalToken, { quotationId, quoteNumber, jobType, jobId }, formDto) {
  // Prefer compliance endpoints when a booking/shipment id exists; else portal message.
  const detail = await request('GET', `/portal/quotations/${quotationId}`, { token: portalToken });
  const q = unwrapEntity(detail.json) || {};
  const bookingId = q.booking_id || q.bookingId || jobId;
  const shipmentId = q.job_id || q.jobId || q.shipment_id || q.shipmentId;
  const air = isAir(jobType);

  if (air && shipmentId) {
    await soft('air compliance put', async () => {
      const put = await request('PUT', `/portal/shipments/${shipmentId}/compliance-form`, {
        token: portalToken,
        body: { ...formDto, mark_complete: false },
      });
      if (!put.ok && put.status !== 404) fail('Air compliance put', put);
      const sub = await request('POST', `/portal/shipments/${shipmentId}/compliance-form/submit`, {
        token: portalToken,
        body: { ...formDto, mark_complete: true, consent_accepted: true },
      });
      if (!sub.ok && sub.status !== 404) fail('Air compliance submit', sub);
    });
  } else if (!air && bookingId) {
    await soft('booking compliance put', async () => {
      const put = await request('PUT', `/portal/bookings/${bookingId}/compliance-form`, {
        token: portalToken,
        body: { ...formDto, mark_complete: false },
      });
      if (!put.ok && put.status !== 404) fail('Booking compliance put', put);
      const sub = await request('POST', `/portal/bookings/${bookingId}/compliance-form/submit`, {
        token: portalToken,
        body: { ...formDto, mark_complete: true, consent_accepted: true },
      });
      if (!sub.ok && sub.status !== 404) fail('Booking compliance submit', sub);
    });
  }

  const subject = `[Customer booking form] ${quoteNumber || quotationId.slice(0, 8)} — ready for BOOKING_FORM_COMPLETE`;
  const body = formatBookingFormMessageBody({
    quotationId,
    quoteNumber,
    jobType,
    jobId: shipmentId || bookingId,
    dto: formDto,
  });
  const msg = await request('POST', '/portal/messages', {
    token: portalToken,
    body: {
      subject: subject.slice(0, 200),
      body,
      job_id: shipmentId && /^[0-9a-f-]{36}$/i.test(shipmentId) ? shipmentId : undefined,
    },
  });
  if (!msg.ok) fail(`Portal booking-form message ${quotationId}`, msg);
  return unwrapEntity(msg.json);
}

async function staffConvert(staffToken, quotationId) {
  const res = await request('POST', `/quotations/${quotationId}/convert-to-job`, {
    token: staffToken,
    body: {},
  });
  if (!res.ok && res.status !== 409) {
    log('warn', `Convert ${quotationId}: HTTP ${res.status} ${JSON.stringify(res.json).slice(0, 200)}`);
  }
  const detail = await request('GET', `/quotations/${quotationId}`, { token: staffToken });
  return unwrapEntity(detail.json);
}

async function advanceToStage({
  plan,
  payloads,
  bookingFormFixture,
  portalToken,
  staffToken,
  refs,
  suffix,
}) {
  const jobType = plan.jobType;
  const payload = payloads[jobType];
  if (!payload) throw new Error(`No request payload for ${jobType}`);

  const body = buildRequestBody(payload, refs, `${plan.key}-${suffix}`);
  log(plan.key, `Request ${jobType} → target ${plan.stage}`);
  const created = await portalRequestQuote(portalToken, body);
  const result = {
    key: plan.key,
    jobType,
    targetStage: plan.stage,
    quotationId: created.id,
    quotationNumber: created.number,
    status: 'requested',
    jobId: null,
    errors: [],
  };

  if (plan.stage === 'requested') return result;

  const sent = await soft(`${plan.key} staff send`, () =>
    staffEnsureLinesAndSend(staffToken, created.id, refs, payload.currency_code || 'USD'),
  );
  result.status = sent?.status || 'sent';
  result.quotationNumber = sent?.quotation_number || sent?.quote_no || result.quotationNumber;
  if (plan.stage === 'sent') return result;

  if (plan.stage === 'rejected') {
    await portalReject(portalToken, created.id);
    result.status = 'REJECTED';
    return result;
  }

  await portalAccept(portalToken, created.id);
  result.status = 'APPROVED';
  if (plan.stage === 'approved') return result;

  const formDto = buildBookingFormBody(bookingFormFixture, jobType, `${plan.key}-${suffix}`);
  await portalSubmitBookingForm(
    portalToken,
    {
      quotationId: created.id,
      quoteNumber: result.quotationNumber,
      jobType,
    },
    formDto,
  );
  result.status = 'APPROVED+BOOKING_FORM';
  if (plan.stage === 'booking_form_complete') return result;

  if (plan.stage === 'converted') {
    if (usesModeConvert(jobType)) {
      const converted = await staffConvert(staffToken, created.id);
      result.status = converted?.status || 'CONVERTED';
      result.jobId = converted?.job_id || converted?.jobId || null;
    } else {
      result.errors.push('converted stage skipped — gated Air/NVOCC (no auto convert)');
    }
  }

  return result;
}

async function main() {
  const missing = [];
  if (!TENANT_SLUG) missing.push('E2E_TENANT_SLUG');
  if (!STAFF_EMAIL) missing.push('E2E_STAFF_EMAIL');
  if (!STAFF_PASSWORD) missing.push('E2E_STAFF_PASSWORD');
  if (!PORTAL_EMAIL) missing.push('E2E_PORTAL_EMAIL');
  if (!PORTAL_PASSWORD) missing.push('E2E_PORTAL_PASSWORD');
  if (missing.length) {
    console.error(`Missing credentials: ${missing.join(', ')}`);
    console.error('Set them in the environment or .env.e2e before running.');
    process.exit(1);
  }

  if (!fs.existsSync(FIXTURE)) {
    console.error(`Fixture missing: ${FIXTURE}`);
    process.exit(1);
  }

  const fixture = JSON.parse(fs.readFileSync(FIXTURE, 'utf8'));
  const suffix = uniqueSuffix();
  const onlyKeys = (process.env.SEED_KEYS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const plans = onlyKeys.length
    ? fixture.seedPlan.filter((p) => onlyKeys.includes(p.key))
    : fixture.seedPlan;
  if (!plans.length) {
    console.error(
      onlyKeys.length
        ? `No seedPlan entries matched SEED_KEYS=${onlyKeys.join(',')}`
        : 'Fixture seedPlan is empty',
    );
    process.exit(1);
  }

  log('start', `API ${BASE}`);
  log('start', `Tenant ${TENANT_SLUG} · seed ${suffix}`);
  if (onlyKeys.length) log('start', `SEED_KEYS filter: ${onlyKeys.join(', ')}`);

  const staffToken = await loginStaff();
  const portalToken = await loginPortal();
  const refs = await loadRefs(staffToken);
  log(
    'refs',
    `ports=${refs.portCount} airports=${refs.airportCount} charges=${refs.chargeCount} ` +
      `origin=${refs.originPortId || '—'} dest=${refs.destPortId || '—'} ` +
      `airPorts=${refs.airOriginPortId || '—'}/${refs.airDestPortId || '—'}`,
  );

  const results = [];
  for (const plan of plans) {
    try {
      const row = await advanceToStage({
        plan,
        payloads: fixture.requestPayloadsByJobType,
        bookingFormFixture: fixture.bookingFormComplete,
        portalToken,
        staffToken,
        refs,
        suffix,
      });
      results.push(row);
      log(
        'ok',
        `${row.key} ${row.jobType} → ${row.status}` +
          (row.quotationNumber ? ` (${row.quotationNumber})` : ` (${row.quotationId})`) +
          (row.jobId ? ` job=${row.jobId}` : ''),
      );
    } catch (err) {
      const row = {
        key: plan.key,
        jobType: plan.jobType,
        targetStage: plan.stage,
        error: err.message,
      };
      results.push(row);
      log('fail', `${plan.key}: ${err.message}`);
    }
  }

  const summary = {
    seededAt: new Date().toISOString(),
    apiBase: BASE,
    tenantSlug: TENANT_SLUG,
    suffix,
    fixture: path.relative(ROOT, FIXTURE),
    refs: {
      originPortId: refs.originPortId,
      destPortId: refs.destPortId,
      chargeCodeId: refs.chargeCodeId,
      containerTypeId: refs.containerTypeId,
    },
    counts: {
      total: results.length,
      ok: results.filter((r) => !r.error).length,
      failed: results.filter((r) => r.error).length,
    },
    results,
    howToTest: fixture.manualUiChecklist,
  };

  fs.writeFileSync(OUT, JSON.stringify(summary, null, 2));
  console.log('\n── Seed complete ──');
  console.log(`Wrote ${OUT}`);
  console.log(`OK ${summary.counts.ok} / Failed ${summary.counts.failed}`);
  console.log('\nPortal: /portal/quotes');
  console.log('Staff:  /quotations  (filter search DEMO or quote numbers above)');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
