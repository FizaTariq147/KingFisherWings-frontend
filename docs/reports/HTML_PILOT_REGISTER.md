# How to register another HTML/CSS pilot template

Hybrid Option C only. Do not migrate JSON-spec reports wholesale. Do not mark accepted.

## Steps

1. **Agree the catalogue code** with backend (exact `FRESA` / registry code).
2. **Add the code** to `HTML_CSS_PILOT_CODES` in  
   [`src/features/reports/engines/pdf/playwrightHtml/playwrightHtmlCodes.ts`](../src/features/reports/engines/pdf/playwrightHtml/playwrightHtmlCodes.ts).
3. **Create** `src/features/reports/htmlPilots/<CODE>/buildHtml.ts` that:
   - Reuses an existing mapper / `InvoiceFormatPdfData`
   - Escapes all dynamic text (`escapeHtml`)
   - Leaves missing fields blank
   - Refuses Fresa identity text
4. **Register** the builder in `resolveHtmlPilotTemplate`  
   ([`htmlPilotRegistry.ts`](../src/features/reports/engines/pdf/playwrightHtml/htmlPilotRegistry.ts)).
5. **Set** `renderer: 'playwright_html'` for that code in  
   [`enrichReportMeta.ts`](../src/features/reports/registry/enrichReportMeta.ts).
6. **Add** smoke tests in `htmlPilots.smoke.test.ts` and extend the QA fixture list.
7. **Run** `node tools/reports/html-pilot-qa.mjs` and fill `qa-notes.md`.
8. **Run** `npm run report:guard-classic` and `npm run report:leak-check`.

## Fallthrough

`generateCatalogLayoutPdf` tries the HTML pilot first for allowlisted codes. If the Vite print service is down, it falls through to the previous generator for that code.

## Dev print route

`POST /api/reports/html-pilot-pdf` with `{ code, data }` (no caller HTML). Plugin: `scripts/htmlPilotPrintPlugin.mjs`.
