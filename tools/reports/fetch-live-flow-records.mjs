/**
 * Fetch up to 10 real quotations (mixed air / FCL / LCL), credit notes and
 * debit notes from the same backend as the live invoices (.env.e2e).
 *
 * Endpoints used:
 *   POST /auth/login
 *   GET  /quotations?limit=&page=&job_type=  + GET /quotations/:id
 *   GET  /credit-notes?limit=10&page=1       + GET /credit-notes/:id
 *   GET  /debit-notes?limit=10&page=1        + GET /debit-notes/:id
 *   GET  /invoices?limit=10&page=1           + GET /invoices/:id  (CN/DN seed only)
 *   GET  /organization/profile
 *   GET  /jobs/:id, /parties/:id when linked
 *
 * Writes reports/output/flow-real/live.json (local only, not committed).
 * When credit-notes or debit-notes return fewer than 5 rows, anonymized
 * synthetic copies are built from real invoice money fields and marked
 * synthetic: true.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const env = Object.fromEntries(
  fs.readFileSync(path.join(root, '.env.e2e'), 'utf8')
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith('#') && line.includes('='))
    .map((line) => {
      const index = line.indexOf('=');
      return [line.slice(0, index).trim(), line.slice(index + 1).trim().replace(/^"|"$/g, '')];
    }),
);
const base = 'https://kingfisherwings-backend.onrender.com';

async function api(pathname, token, options = {}) {
  const response = await fetch(`${base}${pathname}`, {
    ...options,
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = { raw: text.slice(0, 200) };
  }
  if (!response.ok) {
    const message = body?.message || body?.error || response.status;
    throw new Error(`${pathname} ${response.status} ${message}`);
  }
  return body;
}

function unwrap(body) {
  if (body && typeof body === 'object' && 'data' in body) return body.data;
  return body;
}

function listRows(body, keys) {
  const data = unwrap(body);
  if (Array.isArray(data)) return data;
  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

async function loadPartyJob(token, partyId, jobId) {
  let party = null;
  let job = null;
  if (partyId) {
    try {
      party = unwrap(await api(`/parties/${partyId}`, token));
    } catch {
      party = null;
    }
  }
  if (jobId) {
    try {
      job = unwrap(await api(`/jobs/${jobId}`, token));
    } catch {
      job = null;
    }
  }
  return { party, job };
}

function anonymizeParty(party, index) {
  if (!party) return { name: `Synthetic Party ${index + 1}` };
  return {
    id: `syn-party-${index + 1}`,
    name: `Synthetic Party ${index + 1}`,
    address: party.address ? 'Anonymized Address Line' : undefined,
    city: party.city ? 'Anonymized City' : undefined,
    phone: party.phone ? '+00000000000' : undefined,
    email: party.email ? 'synthetic@example.test' : undefined,
    vat_number: party.vat_number ? 'SYN-VAT' : undefined,
  };
}

function noteFromInvoice(invoice, kind, index) {
  const prefix = kind === 'credit' ? 'CN' : 'DN';
  const numberField = kind === 'credit' ? 'credit_note_number' : 'debit_note_number';
  const lines = (invoice.lines || []).map((line, lineIndex) => ({
    id: `syn-line-${index}-${lineIndex}`,
    description: line.description || line.charge_code || `Charge ${lineIndex + 1}`,
    charge_code: line.charge_code,
    quantity: line.quantity,
    unit_price: line.unit_price,
    tax_amount: line.tax_amount,
    line_total: line.line_total,
  }));
  return {
    id: `syn-${kind}-${index + 1}`,
    [numberField]: `${prefix}/SYN/26/${String(index + 1).padStart(5, '0')}`,
    invoice_date: invoice.invoice_date,
    due_date: invoice.due_date,
    currency_code: invoice.currency_code,
    party_name: `Synthetic Party ${index + 1}`,
    party_id: null,
    job_id: null,
    credited_invoice_id: invoice.id,
    credited_invoice_number: invoice.invoice_number,
    status: 'POSTED',
    remarks: 'Synthetic anonymized copy built from a real invoice (no live credit/debit notes on API).',
    subtotal: invoice.subtotal,
    tax_total: invoice.tax_total,
    tax_amount: invoice.tax_amount,
    discount: invoice.discount_amount ?? invoice.discount ?? 0,
    rounding: invoice.rounding ?? 0,
    total_amount: invoice.total_amount,
    vat_rate: invoice.vat_rate,
    lines,
  };
}

const login = await api('/auth/login', null, {
  method: 'POST',
  body: JSON.stringify({
    tenant_slug: env.E2E_TENANT_SLUG,
    email: env.E2E_STAFF_EMAIL,
    password: env.E2E_STAFF_PASSWORD,
  }),
});
const token = login.access_token || login.accessToken || unwrap(login)?.access_token || unwrap(login)?.accessToken;
if (!token) throw new Error('Login did not return an access token');

const organization = unwrap(await api('/organization/profile', token));

async function fetchQuotationDetail(id) {
  try {
    return unwrap(await api(`/quotations/${id}`, token));
  } catch {
    try {
      return unwrap(await api(`/quotations/${id}/detail`, token));
    } catch {
      return null;
    }
  }
}

/** Prefer diversity: 4 FCL, 3 air, 3 LCL (up to 10). */
async function fetchQuotations() {
  const buckets = [
    { label: 'FCL', types: ['SEA_FCL_EXPORT', 'SEA_FCL_IMPORT'], take: 4 },
    { label: 'AIR', types: ['AIR_EXPORT', 'AIR_IMPORT'], take: 3 },
    { label: 'LCL', types: ['SEA_LCL_EXPORT', 'SEA_LCL_IMPORT'], take: 3 },
  ];
  const picked = [];
  const seen = new Set();
  for (const bucket of buckets) {
    for (const jobType of bucket.types) {
      if (picked.filter((row) => bucket.types.includes(row.job_type)).length >= bucket.take) break;
      const listed = listRows(await api(`/quotations?limit=20&page=1&job_type=${jobType}`, token), ['quotations']);
      for (const row of listed) {
        if (seen.has(row.id)) continue;
        if (picked.filter((item) => bucket.types.includes(item.job_type)).length >= bucket.take) break;
        seen.add(row.id);
        picked.push(row);
      }
    }
  }
  while (picked.length < 10) {
    const listed = listRows(await api('/quotations?limit=20&page=1', token), ['quotations']);
    let added = false;
    for (const row of listed) {
      if (seen.has(row.id)) continue;
      seen.add(row.id);
      picked.push(row);
      added = true;
      if (picked.length >= 10) break;
    }
    if (!added) break;
  }

  const rows = [];
  for (const row of picked.slice(0, 10)) {
    const quotation = (await fetchQuotationDetail(row.id)) || row;
    const partyId = quotation?.customer_id || quotation?.party_id;
    const { party, job } = await loadPartyJob(token, partyId, quotation?.job_id);
    rows.push({
      id: row.id,
      quotation,
      party,
      job,
      synthetic: false,
      bucket: /AIR/.test(quotation.job_type || '') ? 'air' : /LCL/.test(quotation.job_type || '') ? 'lcl' : /FCL/.test(quotation.job_type || '') ? 'fcl' : 'other',
    });
  }
  return rows;
}

async function fetchNotes(kind) {
  const pathBase = kind === 'credit' ? '/credit-notes' : '/debit-notes';
  const listKey = kind === 'credit' ? 'creditNotes' : 'debitNotes';
  const listed = listRows(await api(`${pathBase}?limit=10&page=1`, token), [listKey, 'credit_notes', 'debit_notes']);
  const rows = [];
  for (const row of listed.slice(0, 10)) {
    const id = row.id;
    let note = null;
    try {
      note = unwrap(await api(`${pathBase}/${id}`, token));
    } catch {
      note = row;
    }
    const { party, job } = await loadPartyJob(token, note?.party_id, note?.job_id);
    const entry = { id, party, job, synthetic: false, closestEndpoint: pathBase };
    if (kind === 'credit') entry.creditNote = note;
    else entry.debitNote = note;
    rows.push(entry);
  }
  return { real: rows, endpoint: pathBase };
}

async function fetchInvoiceSeeds(count) {
  const listed = listRows(await api('/invoices?limit=20&page=1', token), ['invoices']);
  const seeds = [];
  for (const row of listed.slice(0, count)) {
    let invoice = row;
    try {
      invoice = unwrap(await api(`/invoices/${row.id}`, token)) || row;
    } catch {
      invoice = row;
    }
    const { party, job } = await loadPartyJob(token, invoice?.party_id, invoice?.job_id);
    seeds.push({ invoice, party, job });
  }
  return seeds;
}

const quotations = await fetchQuotations();
const creditFetch = await fetchNotes('credit');
const debitFetch = await fetchNotes('debit');

let creditNotes = creditFetch.real;
let debitNotes = debitFetch.real;
const notes = {
  creditNotes: {
    endpoint: creditFetch.endpoint,
    realCount: creditFetch.real.length,
    belowFive: creditFetch.real.length < 5,
  },
  debitNotes: {
    endpoint: debitFetch.endpoint,
    realCount: debitFetch.real.length,
    belowFive: debitFetch.real.length < 5,
  },
};

if (creditNotes.length < 5 || debitNotes.length < 5) {
  const seeds = await fetchInvoiceSeeds(10);
  if (creditNotes.length < 5) {
    creditNotes = seeds.slice(0, 10).map((seed, index) => ({
      id: `syn-credit-${index + 1}`,
      creditNote: noteFromInvoice(seed.invoice, 'credit', index),
      party: anonymizeParty(seed.party, index),
      job: null,
      invoice: { id: seed.invoice.id, invoice_number: seed.invoice.invoice_number },
      synthetic: true,
      closestEndpoint: '/credit-notes (empty — synthetic from GET /invoices/:id)',
      sourceInvoiceNumber: seed.invoice.invoice_number,
    }));
  }
  if (debitNotes.length < 5) {
    debitNotes = seeds.slice(0, 10).map((seed, index) => ({
      id: `syn-debit-${index + 1}`,
      debitNote: noteFromInvoice(seed.invoice, 'debit', index),
      party: anonymizeParty(seed.party, index),
      job: null,
      invoice: { id: seed.invoice.id, invoice_number: seed.invoice.invoice_number },
      synthetic: true,
      closestEndpoint: '/debit-notes (empty — synthetic from GET /invoices/:id)',
      sourceInvoiceNumber: seed.invoice.invoice_number,
    }));
  }
}

const outDir = path.join(root, 'reports/output/flow-real');
fs.mkdirSync(outDir, { recursive: true });
const payload = {
  fetchedAt: new Date().toISOString(),
  endpoints: {
    quotations: 'GET /quotations?limit=&page=&job_type= + GET /quotations/:id',
    creditNotes: 'GET /credit-notes?limit=10&page=1 + GET /credit-notes/:id',
    debitNotes: 'GET /debit-notes?limit=10&page=1 + GET /debit-notes/:id',
    invoiceSeedForSyntheticNotes: 'GET /invoices?limit=20&page=1 + GET /invoices/:id',
  },
  notes,
  organization,
  quotations,
  creditNotes,
  debitNotes,
};
fs.writeFileSync(path.join(outDir, 'live.json'), `${JSON.stringify(payload, null, 2)}\n`);

console.log(JSON.stringify({
  quotations: {
    count: quotations.length,
    buckets: {
      air: quotations.filter((row) => row.bucket === 'air').length,
      fcl: quotations.filter((row) => row.bucket === 'fcl').length,
      lcl: quotations.filter((row) => row.bucket === 'lcl').length,
      other: quotations.filter((row) => row.bucket === 'other').length,
    },
    numbers: quotations.map((row) => row.quotation?.quotation_number),
    jobTypes: quotations.map((row) => row.quotation?.job_type),
  },
  creditNotes: {
    realCount: notes.creditNotes.realCount,
    usedCount: creditNotes.length,
    synthetic: creditNotes.filter((row) => row.synthetic).length,
    endpoint: notes.creditNotes.endpoint,
  },
  debitNotes: {
    realCount: notes.debitNotes.realCount,
    usedCount: debitNotes.length,
    synthetic: debitNotes.filter((row) => row.synthetic).length,
    endpoint: notes.debitNotes.endpoint,
  },
}, null, 2));
