import fs from 'node:fs';

const env = Object.fromEntries(
  fs.readFileSync('.env.e2e', 'utf8')
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
  return { ok: response.ok, status: response.status, body };
}

function rowsOf(body) {
  const data = body?.data ?? body;
  if (Array.isArray(data)) return data;
  for (const key of ['quotations', 'creditNotes', 'debitNotes', 'credit_notes', 'debit_notes', 'invoices', 'items', 'rows']) {
    if (Array.isArray(data?.[key])) return data[key];
  }
  return [];
}

const login = await api('/auth/login', null, {
  method: 'POST',
  body: JSON.stringify({
    tenant_slug: env.E2E_TENANT_SLUG,
    email: env.E2E_STAFF_EMAIL,
    password: env.E2E_STAFF_PASSWORD,
  }),
});
const token = login.body.access_token || login.body.accessToken || login.body?.data?.access_token;
if (!token) throw new Error('no token');

const probes = [
  '/credit-notes?limit=50&page=1',
  '/debit-notes?limit=50&page=1',
  '/invoices?limit=50&page=1&document_type=credit_note',
  '/invoices?limit=50&page=1&type=CREDIT_NOTE',
  '/invoices?limit=100&page=1',
  '/quotations?limit=100&page=1',
  '/quotations?limit=50&page=1&job_type=AIR_EXPORT',
  '/quotations?limit=50&page=1&job_type=SEA_LCL_EXPORT',
  '/quotations?limit=50&page=1&job_type=AIR_IMPORT',
  '/quotations?limit=50&page=1&job_type=SEA_LCL_IMPORT',
  '/quotations?limit=50&page=1&mode=AIR',
  '/quotations?limit=50&page=1&mode=LCL',
];

for (const pathname of probes) {
  const result = await api(pathname, token);
  const rows = rowsOf(result.body);
  const types = [...new Set(rows.map((row) => row.document_type || row.type || row.invoice_type || row.job_type || row.note_type || row.mode).filter(Boolean))];
  const sample = rows[0] ? Object.keys(rows[0]).slice(0, 30) : null;
  const total = result.body?.data?.total ?? result.body?.total ?? result.body?.meta?.total ?? null;
  console.log(JSON.stringify({
    path: pathname,
    ok: result.ok,
    status: result.status,
    count: rows.length,
    total,
    types: types.slice(0, 30),
    sampleKeys: sample,
  }));
}

// Scan all quotation pages for air/LCL
const jobTypes = new Map();
for (let page = 1; page <= 20; page += 1) {
  const result = await api(`/quotations?limit=50&page=${page}`, token);
  if (!result.ok) break;
  const rows = rowsOf(result.body);
  if (!rows.length) break;
  for (const row of rows) {
    const jt = row.job_type || 'UNKNOWN';
    jobTypes.set(jt, (jobTypes.get(jt) || 0) + 1);
  }
  if (rows.length < 50) break;
}
console.log(JSON.stringify({ quotationJobTypeCounts: Object.fromEntries(jobTypes) }));

// Scan invoices for any credit/debit-like flags
const invoiceFlags = { total: 0, withCredit: 0, withDebit: 0, types: new Map() };
for (let page = 1; page <= 10; page += 1) {
  const result = await api(`/invoices?limit=50&page=${page}`, token);
  if (!result.ok) break;
  const rows = rowsOf(result.body);
  if (!rows.length) break;
  invoiceFlags.total += rows.length;
  for (const row of rows) {
    const t = row.document_type || row.type || row.invoice_type || 'invoice';
    invoiceFlags.types.set(t, (invoiceFlags.types.get(t) || 0) + 1);
    const blob = JSON.stringify(row).toLowerCase();
    if (blob.includes('credit')) invoiceFlags.withCredit += 1;
    if (blob.includes('debit')) invoiceFlags.withDebit += 1;
  }
  if (rows.length < 50) break;
}
console.log(JSON.stringify({
  invoiceScan: {
    total: invoiceFlags.total,
    withCredit: invoiceFlags.withCredit,
    withDebit: invoiceFlags.withDebit,
    types: Object.fromEntries(invoiceFlags.types),
  },
}));
