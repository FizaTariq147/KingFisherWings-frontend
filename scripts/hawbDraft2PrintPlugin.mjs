/**
 * Dev and preview print route for HAWB Draft 2 only.
 * The browser posts record data. This process prints the existing Draft-2 face.
 * Caller HTML is rejected by the renderer.
 */
export function hawbDraft2PrintPlugin() {
  const handle = (loadModule) => async (req, res, next) => {
    const path = (req.url || '').split('?')[0];
    if (path !== '/api/reports/hawb-draft2-pdf' || req.method !== 'POST') {
      next();
      return;
    }
    try {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const raw = Buffer.concat(chunks).toString('utf8');
      if (raw.length > 2_000_000) {
        res.statusCode = 413;
        res.end('Payload too large');
        return;
      }
      const body = JSON.parse(raw);
      if (body && Object.prototype.hasOwnProperty.call(body, 'html') && body.html) {
        res.statusCode = 400;
        res.end('HTML is not accepted');
        return;
      }
      const mod = await loadModule(
        '/src/features/reports/engines/pdf/playwrightHtml/renderPlaywrightHtmlPdf.ts',
      );
      const bytes = await mod.renderPlaywrightHtmlPdf({
        code: 'HAWB_DRAFT_REPORT_FORMAT_2',
        data: body.data || {},
      });
      res.statusCode = 200;
      res.setHeader('content-type', 'application/pdf');
      res.setHeader('cache-control', 'no-store');
      res.end(Buffer.from(bytes));
    } catch (error) {
      res.statusCode = 400;
      res.setHeader('content-type', 'text/plain');
      res.end(error instanceof Error ? error.message : 'Draft 2 print failed');
    }
  };

  return {
    name: 'hawb-draft2-print',
    configureServer(server) {
      server.middlewares.use(handle((id) => server.ssrLoadModule(id)));
    },
    configurePreviewServer(server) {
      server.middlewares.use(handle((id) => server.ssrLoadModule(id)));
    },
  };
}
