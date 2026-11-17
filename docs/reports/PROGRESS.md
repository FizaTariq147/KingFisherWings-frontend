# Report format progress

Phase 0 is the inventory. No report code is accepted.

## Repo map

This workspace is the React frontend. There is no NestJS app and no PostgreSQL schema here.

| Piece | Path |
|---|---|
| Catalogue registry (852 codes) | `src/features/reports/data/fresaReportRegistry.generated.ts` |
| Registry load and schema | `src/features/reports/registry/reportRegistryV2.ts`, `src/features/reports/registry/reportRegistry.schema.ts`, `src/features/reports/registry/enrichReportMeta.ts` |
| Sample URL catalogues | `src/features/reports/data/fresaExtractedSampleEntries.generated.ts`, `src/features/reports/data/fresaOfficialSampleCatalogue.ts`, `src/features/reports/constants/hblOfficialCatalog.generated.ts` |
| Catalogue page | `src/features/reports/pages/ReportCatalogPage.tsx` |
| Catalogue lists | `src/features/reports/components/ReportCatalog/FresaSamplePageTable.tsx`, `src/features/reports/components/ReportCatalog/ReportCatalogBrowseList.tsx` |
| Generate panel | `src/features/reports/components/ReportCatalog/ReportGeneratePanel.tsx` |
| Existing format badge | `src/features/reports/utils/catalogFormatStatus.ts`, `src/features/reports/components/ReportCatalog/FormatStatusBadge.tsx` |
| Conformance badge | `src/features/reports/utils/reportConformanceStatus.ts` |
| Catalogue generate | `src/features/reports/utils/generateCatalogLayoutPdf.ts` |
| Record hydration | `src/features/reports/utils/resolveCatalogContextPdfData.ts` |
| Organization profile | `src/features/reports/utils/resolveReportOrgChrome.ts`, `src/features/organization/services/organization.service.ts` |
| Classic invoice PDF (left unchanged) | `src/features/invoices/utils/generateInvoicePdf.ts` |
| Classic quotation PDF (left unchanged) | `src/features/quotations/utils/generateQuotationPdf.ts` |
| Six current templates | `src/features/reports/templates/referenceAccurate/`, `src/features/reports/templates/hawb/official/`, `src/features/reports/engines/pdf/playwrightHtml/` |
| Reports buttons | `src/features/jobs/pages/JobDetailPage.tsx` (Reports), `src/features/shipments/pages/ShipmentDetailPage.tsx` (`openShipmentReportsCatalog`), `src/features/quotations/pages/QuotationDetailPage.tsx` (`buildCatalogHref`), `src/features/invoices/pages/InvoiceDetailPage.tsx` (Generate PDF, Formats, Reports catalog) |
| Older local pins | `src/features/reports/qa/fresa-references/pdfs`, `src/features/reports/qa/fresa-references/xlsx` |
| Phase 0 tool | `tools/reports/build-manifest.mjs` (`npm run report:manifest`) |
| Phase 0 outputs | `reports/references/manifest.csv`, `reports/references/layouts.csv`, `reports/references/unmatched.csv`, `reports/references/files/`, `reports/references/text/`, `reports/references/png/` |

## Decisions

- Conformance status is computed in the browser from the report code. The six pilot codes are `in_progress`. Every other code is `reference_only`. Nothing is `accepted`.
- The catalogue still shows Generate. Non-accepted rows say "approximate, not final".
- A scanned PDF (fewer than 8 extracted text items) is `needs_manual` in the manifest. That overrides the default status.
- The same file URL is kept once. A later numbered-list heading replaces the four-column table heading, because the list name is the tighter section.
- A filename that already matches a registered code wins over a nearby URL match. That stops a neighbor entry from stealing the code.
- When a local pin under `src/features/reports/qa/fresa-references` has the same file name, the manifest copies it and logs `local-pin`. Anything else is downloaded. Nothing was skipped without a log line.
- Layout identity is the page size plus lines and rectangles, mapped through the PDF transformation matrix and rounded to 1 pt. Label text is the delta column, not part of the identity. There is no wider distance match: two files that differ by one rule stay in different layouts.
- 150 dpi PNGs and the saved HTML page are generated locally and left out of git. The PDFs, workbooks, text extracts, and CSV files are the pin.
- Poppler `pdftotext` and `pdftoppm` were on PATH and produced a text file and at least one PNG for every PDF.

## Phase status

| Phase | Status |
|---|---|
| 0 Inventory and clustering | Done. Waiting for confirmation before Phase 1. |
| 1–8 | Not started. |

Counts from `reports/references/summary.json`:

| Count | Value |
|---|---|
| Registered catalogue codes | 852 |
| Files linked on the Fresa page | 451 |
| Files pinned | 451 |
| Download failures | 0 |
| PDF | 402 |
| Excel | 49 |
| Scanned (`needs_manual`) | 3 |
| Unique PDF layouts | **376** |
| Layouts with more than one file | 18 |
| Median extracted shapes on page 1 | 86 |
| Pinned files with no registered code | 135 |
| Catalogue codes with no pinned file | 545 |
| PDFs missing a text extract | 0 |
| PDFs missing a 150 dpi PNG | 0 |

Excel workbooks are not part of the 376. They have no page geometry.

The three `needs_manual` files are `BARCODE_AWB_REPORT_FORMAT`, `STANDARD_INVOICE_RPM_REF_79`, and the Fresa Gold brochure `FRESA_GOLD_PROFILE_20260727` (not a report format).

## Open questions

- This repo cannot add a backend `generate(code, recordId)` payload. The status badge is client-side. Confirm that is enough until a backend repo is in the workspace.
- 376 of 402 PDFs are their own layout at a 1 pt geometry rounding. Eighteen clusters have more than one member, and some of those mix families (a MAWB draft sits with several HBL files; an arrival confirmation sits with delivery confirmations). Phase 1 should review those clusters before treating one cluster as one spec. I did not loosen the match to force a smaller number.
- 545 registered codes have no file on the sample page. 135 pinned files have no registered code. I did not invent those links. `ADVANCE_SHIPPING_NOTE_LOCATION_WISE_.pdf` (link text "Location Wise- 1") has no separate code, so it shares `ADVANCE_SHIPPING_NOTE_LOCATION_WISE`.
- `reports/references/png/` is about 142 MB and is gitignored. Say if those rasters should be committed.
- Catalogue gating stays soft. Hard gating is Phase 7 and was not implemented.

## Verification log

`node --test tools/reports/build-manifest.test.mjs`

```
✔ section headings follow the table column and the later list (7.4989ms)
ℹ tests 1
ℹ pass 1
ℹ fail 0
```

`npx vitest run src/features/reports/utils/reportConformanceStatus.test.ts --reporter=dot`

```
Test Files  1 passed (1)
     Tests  1 passed (1)
```

`node tools/reports/build-manifest.mjs` (final run, 2026-11-17)

```
{
  "pageLinks": 451,
  "pinned": 451,
  "downloadFailed": 0,
  "pdf": 402,
  "xlsx": 49,
  "scanned": 3,
  "uniqueLayouts": 376,
  "multiMemberLayouts": 18,
  "medianShapes": 86,
  "catalogueCodes": 852,
  "referenceWithoutCode": 135,
  "codeWithoutReference": 545,
  "missingText": 0,
  "missingPng": 0
}
```

pdfjs printed `Warning: TT: undefined function: 32` once. Text extraction still completed. `reports/references/failures.log` is empty.

The catalogue badge was not clicked in a browser. No dev server was running, and the catalogue requires a signed-in session. The status values are covered by the unit test; the list components render that status next to the existing format badge and do not remove Generate.
