/**
 * Dev-server routes that draw a report spec with the open record.
 *   /__reports/v2          any wired spec, filled by fillSpecSpans
 *   /__reports/invoice-v2  the original invoice route, filled by fillInvoiceSpans
 * Registered for `vite` serve only. Classic Generate PDF does not call them.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fillInvoiceSpans } from '../tools/reports/invoice-bindings.mjs';
import { fillSpecSpans } from '../tools/reports/fill-spec-spans.mjs';
import { renderSpec } from '../tools/reports/render-spec.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const ROUTES = new Map([
  ['/__reports/v2', fillSpecSpans],
  ['/__reports/invoice-v2', fillInvoiceSpans],
]);

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

async function handle(req, res, fill) {
  try {
    const raw = await readBody(req);
    if (raw.length > 2_000_000) {
      res.statusCode = 413;
      res.end('Payload too large');
      return;
    }
    const body = JSON.parse(raw || '{}');
    const code = String(body.code || '');
    const specPath = path.join(root, 'reports/specs', `${code}.json`);
    if (!code || !/^[A-Za-z0-9_]+$/.test(code) || !fs.existsSync(specPath)) {
      res.statusCode = 404;
      res.end('No v2 spec for this code');
      return;
    }
    const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
    const filled = fill(spec, body);
    const org = body.organization || {};
    const outPath = path.join(os.tmpdir(), `reports-v2-${Date.now()}.pdf`);
    let logoBytes = null;
    if (body.logoBase64) {
      logoBytes = Buffer.from(String(body.logoBase64), 'base64');
    }
    await renderSpec(code, {
      spec,
      values: filled.values,
      logoBytes,
      organization: {
        name: org.display_name || org.name || '',
        address: [org.address, org.city, org.country_code].filter(Boolean).join(', '),
        phone: org.phone || '',
        email: org.email || '',
        website: org.website || '',
      },
      outputPath: outPath,
      quietArtifacts: true,
    });
    const bytes = fs.readFileSync(outPath);
    fs.rmSync(outPath, { force: true });
    res.statusCode = 200;
    res.setHeader('content-type', 'application/pdf');
    res.setHeader('cache-control', 'no-store');
    res.end(bytes);
  } catch (error) {
    res.statusCode = 500;
    res.setHeader('content-type', 'text/plain');
    res.end(error instanceof Error ? error.message : 'Report v2 failed');
  }
}

export function invoiceV2Plugin() {
  return {
    name: 'invoice-v2',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url || '/', 'http://localhost');
        const fill = ROUTES.get(url.pathname);
        if (!fill || req.method !== 'POST') {
          next();
          return;
        }
        await handle(req, res, fill);
      });
    },
  };
}
