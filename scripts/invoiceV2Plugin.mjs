/**
 * Dev-server route that draws an invoice spec with the open record.
 * Registered for `vite` serve only. Classic Generate PDF does not call it.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fillInvoiceSpans } from '../tools/reports/invoice-bindings.mjs';
import { renderSpec } from '../tools/reports/render-spec.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

export function invoiceV2Plugin() {
  return {
    name: 'invoice-v2',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url || '/', 'http://localhost');
        if (url.pathname !== '/__reports/invoice-v2' || req.method !== 'POST') {
          next();
          return;
        }
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
          if (!code || !fs.existsSync(specPath)) {
            res.statusCode = 404;
            res.end('No v2 spec for this code');
            return;
          }
          const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
          const filled = fillInvoiceSpans(spec, body);
          const org = body.organization || {};
          const outPath = path.join(os.tmpdir(), `invoice-v2-${Date.now()}.pdf`);
          await renderSpec(code, {
            spec,
            values: filled.values,
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
          res.end(error instanceof Error ? error.message : 'Invoice v2 failed');
        }
      });
    },
  };
}
