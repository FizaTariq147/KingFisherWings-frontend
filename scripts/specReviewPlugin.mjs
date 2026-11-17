/**
 * Dev-server routes for the three pilot specs.
 * Not registered for preview or production builds.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PILOTS = [
  'INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA',
  'HBL_DRAFT_REPORT_FORMAT_JASPER',
  'ARRIVAL_NOTICE_REPORT_FORMAT_1_CARGO_ARRIVAL_NOTICE_JASPER',
];

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function send(res, status, body, type) {
  res.statusCode = status;
  res.setHeader('content-type', type);
  res.setHeader('cache-control', 'no-store');
  res.end(body);
}

export function specReviewPlugin() {
  return {
    name: 'spec-review',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url || '/', 'http://localhost');
        if (!url.pathname.startsWith('/__spec-review')) {
          next();
          return;
        }
        try {
          if (url.pathname === '/__spec-review/pilots' && req.method === 'GET') {
            send(res, 200, JSON.stringify({ pilots: PILOTS }), 'application/json');
            return;
          }
          const code = url.searchParams.get('code') || '';
          if (!PILOTS.includes(code)) {
            send(res, 404, 'Unknown pilot', 'text/plain');
            return;
          }
          const specPath = path.join(root, 'reports/specs', `${code}.json`);
          if (url.pathname === '/__spec-review/spec' && req.method === 'GET') {
            send(res, 200, fs.readFileSync(specPath), 'application/json');
            return;
          }
          if (url.pathname === '/__spec-review/png' && req.method === 'GET') {
            const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
            const stem = path.basename(String(spec.source || ''), '.pdf');
            const png = path.join(root, 'reports/references/png', `${stem}-1.png`);
            if (!fs.existsSync(png)) {
              send(res, 404, 'Reference PNG is not on disk', 'text/plain');
              return;
            }
            send(res, 200, fs.readFileSync(png), 'image/png');
            return;
          }
          if (url.pathname === '/__spec-review/spec' && req.method === 'POST') {
            const raw = await readBody(req);
            if (raw.length > 8_000_000) {
              send(res, 413, 'Payload too large', 'text/plain');
              return;
            }
            const body = JSON.parse(raw);
            if (body.code !== code) {
              send(res, 400, 'Code mismatch', 'text/plain');
              return;
            }
            const current = JSON.parse(fs.readFileSync(specPath, 'utf8'));
            const edits = new Map((body.spans || []).map((span) => [span.id, span]));
            current.spans = current.spans.map((span) => {
              const edited = edits.get(span.id);
              if (!edited) return span;
              const role = edited.role === 'dynamic' ? 'dynamic' : 'static';
              return {
                ...span,
                role,
                binding: role === 'dynamic' ? String(edited.binding || '') : '',
              };
            });
            current.bindings = current.spans
              .filter((span) => span.role === 'dynamic' && span.binding)
              .map((span) => ({ id: span.id, path: span.binding }));
            fs.writeFileSync(specPath, `${JSON.stringify(current, null, 2)}\n`);
            send(res, 200, JSON.stringify({ saved: true }), 'application/json');
            return;
          }
          next();
        } catch (error) {
          send(res, 500, error instanceof Error ? error.message : 'spec review failed', 'text/plain');
        }
      });
    },
  };
}
