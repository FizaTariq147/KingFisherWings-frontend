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
| Code map | `tools/reports/build-code-map.mjs` (`npm run report:code-map`) |
| Status | `tools/reports/build-status.mjs` (`npm run report:status`), `reports/signoff.csv`, `reports/status.json` |
| Layout counts | `tools/reports/fingerprint-counts.mjs` (`npm run report:layout-counts`) |
| Phase 0 outputs | `reports/references/manifest.csv`, `reports/references/layouts.csv`, `reports/references/unmatched.csv`, `reports/references/code-map.csv`, `reports/references/files/`, `reports/references/text/`, `reports/references/png/` |

## Decisions

- Conformance status is read from `reports/status.json`. That file is generated from `reports/signoff.csv`. A row with reviewer, date, and reference hash is `accepted`. A code with no reviewer is `in_progress`. Every other catalogue code is `reference_only`. Nothing is accepted.
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
| 0 Inventory and clustering | Done. |
| 0.5 Code map, status file, layout recount | Done. Waiting for confirmation before Phase 1. |
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

The three scanned files are marked `needs_manual`. `BARCODE_AWB_REPORT_FORMAT` and `STANDARD_INVOICE_RPM_REF_79` stay in the report list. The Fresa Gold brochure is the third scanned file and is removed from the report list.

## Phase 0.5 counts

Code map (`reports/references/code-map.csv`): 852 catalogue codes, each with at most one file. 419 have a file (1 manual override, 104 `rpm_ref`, 314 normalized name). No file is used twice. Proposed code `ADVANCE_SHIPPING_NOTE_LOCATION_WISE_1` has the Location Wise- 1 PDF, so `ADVANCE_SHIPPING_NOTE_LOCATION_WISE` keeps only the base PDF.

The 545 codes that had no phase-0 filename match:

| Triage | Count |
|---|---|
| name_mismatch (proposed reference filled in) | 124 |
| no_reference | 418 |
| unknown | 3 |

The references that had no registered code. This is the original 135, plus the Location Wise- 1 file once it stopped sharing a registered code:

| Triage | Count |
|---|---|
| ignore | 108 |
| should_register | 28 |

Ignore means do not add a new catalogue code. One of those is the brochure. The rest are files that are now the reference for a code that already exists. `should_register` means the file still has no catalogue code. The 23 generic invoices and notices from the first pass are in that 28, along with Location Wise- 1.

Layouts, same 402 PDFs, detail-row rules removed from the second hash. `layouts.csv` was not changed:

| Fingerprint | Layouts |
|---|---|
| Strict (phase 0) | 376 |
| Detail-row lines excluded | 374 |

Status: 0 accepted, 6 in progress, 846 reference only.

## Open questions

- This repo cannot add a backend `generate(code, recordId)` payload. The status badge is client-side. Confirm that is enough until a backend repo is in the workspace.
- 376 of 402 PDFs are their own layout at a 1 pt geometry rounding. Eighteen clusters have more than one member, and some of those mix families (a MAWB draft sits with several HBL files; an arrival confirmation sits with delivery confirmations). Phase 1 should review those clusters before treating one cluster as one spec. I did not loosen the match to force a smaller number.
- 545 registered codes had no phase-0 filename match. 135 pinned files had no registered code. The code map and the triage CSVs below are that split. `ADVANCE_SHIPPING_NOTE_LOCATION_WISE_1` is a proposed code for the Location Wise- 1 file. It is not in the 852-code registry.
- The 402 PDFs and 49 Excel files were committed in `ce4a25f0` as normal git objects, not Git LFS. This phase removes the Fresa Gold brochure from that pin. PNGs stay gitignored.
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

### Phase 0.5

`node tools/reports/build-code-map.mjs`

```
catalogueCodes 852
mappedToReference 419
override 1
rpm_ref 104
normalized_name 314
codesWithoutReference 545 (name_mismatch 124, no_reference 418, unknown 3)
referencesWithoutCode 136 (should_register 28, ignore 108)
```

`node tools/reports/build-status.mjs`

```
codes 852
accepted 0
inProgress 6
reference_only 846
```

`node tools/reports/fingerprint-counts.mjs`

```
pdfs 402
strictLayouts 376
detailRowNormalizedLayouts 374
failed 0
```

`npx vitest run src/features/reports/utils/reportConformanceStatus.test.ts` — 1 passed.
`node --test tools/reports/build-manifest.test.mjs` — 1 passed.

pdfjs printed `Warning: TT: undefined function: 32` once during the fingerprint recount. Both hashes were still produced for all 402 PDFs.
