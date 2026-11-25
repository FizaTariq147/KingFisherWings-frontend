# HTML/CSS pilot audit (Hybrid Option C)

Nothing here is accepted. Classic generators are unchanged. JSON-spec renderer is unchanged.

**Branch:** `reports/integration`  
**Scope:** Three allowlisted codes only. All other reports keep their current generator when `renderer` is omitted.

## Pilot codes

| Role | Catalogue code | Today’s generator (before HTML pilot) |
|---|---|---|
| HBL Draft | `HBL_DRAFT_REPORT_FORMAT_JASPER` | `isReferenceAccuratePdfCode` → pdf-lib reference form; else HBL Jasper React/html2canvas pilot |
| Sales Invoice | `INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA` | Reference-accurate pdf-lib form (catalogue). Classic `generateInvoicePdf` on invoice screen stays separate and frozen |
| Job List | `JOB_LIST_SUMMARY_REPORT_FORMAT` | Catalogue router → template_v2 / JSON layout / sample browse. Not Excel (`ACTIVITY_COMPLETED_JOBS_LIST_REPORT_FORMAT` stays on its Excel path) |

## Integration point

[`src/features/reports/utils/generateCatalogLayoutPdf.ts`](../src/features/reports/utils/generateCatalogLayoutPdf.ts) is the single catalogue PDF router.

Existing Playwright precedent: `HAWB_DRAFT_REPORT_FORMAT_2` via [`engines/pdf/playwrightHtml/`](../src/features/reports/engines/pdf/playwrightHtml/) + Vite plugin `scripts/hawbDraft2PrintPlugin.mjs`.

**Smallest safe hook:** early allowlist branch for the three P0 codes only. On Playwright failure, fall through to the existing generator for that code.

Registry schema already supports optional `renderer: 'playwright_html'` ([`reportRegistry.schema.ts`](../src/features/reports/registry/reportRegistry.schema.ts)). Omitted = current path.

## Payload reuse (no new providers)

| Code | Mapper / contract | Source type |
|---|---|---|
| HBL Jasper | `mapToHblJasperPilotModel` | `InvoiceFormatPdfData` / BL classic model |
| Tax Invoice India 1 | `InvoiceFormatPdfData` fields (invoiceNumber, lines, tax, total, billTo*, company*) | Same catalogue context used by referenceAccurate |
| Job List Summary | `mapToOpsListViewModel` | `tableHeaders` / `tableRows` on `InvoiceFormatPdfData` |

## Known blanks (never invent)

From [`backend-requirements-invoice.md`](./backend-requirements-invoice.md) and BL proposals:

- `party.notify` / notify lines when job has none
- `cargo.netWeight`
- India SGST / CGST / IGST split (only `tax_total` / `tax_amount` exists)
- Freight terms when not on the record

Missing values render as empty cells.

## QA harnesses to reuse

| Script | Role |
|---|---|
| `npm run report:guard-classic` | Classic invoice/quotation/CN/DN frozen |
| `npm run report:leak-check` | No Fresa identity in invoice specs |
| `tools/reports/diff-pilot.mjs` / `verify-pool.mjs` | Spec raster compare (JSON path; do not loosen thresholds) |
| `tools/reports/html-pilot-qa.mjs` | New: HTML pilot reference/generated/diff evidence |

## Out of scope for this audit

- Migrating other JSON/spec reports to HTML
- Changing classic Generate PDF
- Marking any code `accepted`
- Editing `status.json` / `signoff.csv` / thresholds / masks
