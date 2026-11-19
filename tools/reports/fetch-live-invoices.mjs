/**
 * Download up to 10 staff invoices for the v2 comparison sheets.
 * Credentials stay in .env.e2e. The JSON is local output, not a commit.
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

const listed = unwrap(await api('/invoices?limit=10&page=1', token));
const rows = Array.isArray(listed) ? listed : listed?.items || listed?.invoices || [];
const organization = unwrap(await api('/organization/profile', token));
const invoices = [];
for (const row of rows.slice(0, 10)) {
  const id = row.id;
  const invoice = unwrap(await api(`/invoices/${id}`, token));
  let job = null;
  let party = null;
  if (invoice?.job_id) {
    try {
      job = unwrap(await api(`/jobs/${invoice.job_id}`, token));
    } catch {
      job = null;
    }
  }
  if (invoice?.party_id) {
    try {
      party = unwrap(await api(`/parties/${invoice.party_id}`, token));
    } catch {
      party = null;
    }
  }
  invoices.push({ id, invoice, job, party });
}
const outDir = path.join(root, 'reports/output/invoice-v2');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'live.json'), JSON.stringify({ organization, invoices }, null, 2));
console.log(JSON.stringify({
  count: invoices.length,
  numbers: invoices.map((row) => row.invoice?.invoice_number || row.id),
  lines: invoices.map((row) => (row.invoice?.lines || []).length),
}));
