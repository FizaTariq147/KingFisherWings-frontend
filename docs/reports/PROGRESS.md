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
| 0.5 Code map, status file, layout recount | Done. |
| 1 Pilot extraction | Four pilots through round 3. None accepted. Other layouts not started. |
| 2–8 | Not started. |

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

## Cleanup before Phase 1

`node tools/reports/review-map.mjs`

```
ignoreRows 108
duplicate_of_mapped 107
no_mapped_file 1
variant_layout 0
familySectionDisagreements 1
nameMatchSample 30
noReferenceCodes 418
noReferenceGroups 32
```

The 107 duplicates are the same path and the same SHA-256 as the file already mapped to that code, so the fingerprint was skipped. `reports/references/ignore-variants.csv` has a header and no rows. The remaining ignore row is the Fresa Gold brochure, which has no mapped code. Nothing was registered.

`reports/references/map-review.csv` has one family/section disagreement: `OUTSTANDING_LETTER_REPORT_FORMAT_5_OUTSTANDING_LETTER_WITH_INVOICES` is family `finance`, module `accounts`, and the Fresa section is `Invoice Formats`. The same file has a seeded sample of 30 normalized-name matches.

`reports/references/no-reference-groups.csv` groups the 418 codes. The largest groups are commercial/invoice/INVOICE 54, air HAWB draft 25, ops pending shipments 25, arrival notice 25, daily status 20, job status 20, cargo manifest 20, and advance shipping note 20.

## Phase 1 pilots

Pilots only: Tax Invoice India 1, HBL Jasper, Arrival Notice Jasper. No other layout, Excel file, or scanned file was extracted. Nothing is accepted.

`node tools/reports/extract.mjs --pilots`

```
INVOICE spans 205, dynamic 65, lines 269, rects 38, images 1, characters 2355, pdftotext words missing 0, warnings []
HBL spans 87, dynamic 29, lines 93, rects 28, images 2, characters 2457, pdftotext words missing 1 (24.000CBM), warnings []
ARRIVAL spans 126, dynamic 45, lines 424, rects 67, images 2, characters 1860, pdftotext words missing 1 (:07-FEB-19), warnings []
```

`node tools/reports/validate-spec.mjs` on each draft: valid, 0 errors.

The pdfjs line `Warning: TT: undefined function: 32` is `console.log`, not `console.warn`. A scan of the 401 pinned PDFs printed it for one file only: `fg_hbl_format33_rpm_ref_684.pdf`. That file still produced 39 text items, 860 characters, and 0 words missing against `pdftotext`. The three pilots did not print it. Empty text items are positioning gaps. Zero-width text items are 0. Font names were read (invoice: ArialMT, Arial-BoldMT, Consolas; HBL and arrival: Helvetica, Helvetica-Bold, subset Arial Unicode). Those fonts were not copied. Show-text fill colors on the invoice are black and white, but the show-text operator count does not equal the span count, so each span kept the default black. That loses white text on colored bars.

Dynamic spans and guessed bindings are in `reports/specs/<CODE>.dynamic.csv`. Bindings that were filled: invoice `invoice.tax` 2, `company.name` 2, `cargo.marks` 1 (60 of 65 blank); HBL `company.name` 1, `cargo.containerNo` 1 (27 of 29 blank); arrival 45 of 45 blank. HBL used the format-6 variant. Invoice and arrival are singleton layouts, so their dynamic marks are demo-value guesses.

Rendered PDFs: `reports/output/<CODE>.pdf`. Six layers from `node tools/reports/diff-pilot.mjs`:

Tax Invoice India 1: page pass (594 x 841.9). Geometry fail, 269/269 lines, 1 of 38 rects unmatched (a white rect at y -280.1, 792 x 1122, outside the page, not drawn). Static text fail, 0 of 140 missed on position, 140 font or size mismatches (Helvetica instead of Arial/Consolas). Dynamic text fail, 0 of 65 missed on position, 65 font or size mismatches, wrap/clip not implemented. Raster fail, 36,848 pixels, 1.70% at 150 dpi after logo and company masks (limit 0.5%). Pagination not exercised: both files are 1 page.

HBL Jasper: page pass (595 x 842). Geometry pass, 93 lines and 28 rects. Static text fail, 0 of 58 missed on position, 16 font or size mismatches. Dynamic text fail, 0 of 29 missed on position, 25 font or size mismatches, wrap/clip not implemented. Raster fail, 11,451 pixels, 0.53%. Pagination not exercised.

Arrival Notice Jasper: page pass (595 x 842). Geometry pass, 424 lines and 67 rects. Static text fail, 0 of 81 missed on position, 30 font or size mismatches. Dynamic text fail, 0 of 45 missed on position, 36 font or size mismatches, wrap/clip not implemented. Raster fail, 28,670 pixels, 1.32%. Pagination not exercised.

Poppler printed `No display font for 'Symbol'` and `No display font for 'ArialUnicode'` while rasterizing. The dev review page is `/reports/spec-review` and is registered only when `import.meta.env.DEV`. The dev server returned the pilot list, the HBL spec, the HBL reference PNG, and a compiled page module. The route still sits behind the reports permission, so the signed-in click path was not exercised.

## Pilot round 2

Same three pilots plus `TRIAL_BALANCE_REPORT_FORMAT_1_TRIAL_BALANCE_SUMMARY` (`reports/references/files/trial-balance-report-format-1-trial-balance-summary.pdf`). No other layout was extracted. Nothing is accepted. Scaling was not started.

Comparator and threshold changes. No numeric limit was raised. Geometry stays 0.1 pt, text position stays 0.5 pt, size stays 0.5 pt, raster stays 0.5% (ratio 0.005), pixelmatch stays 0.1, raster stays `pdftoppm -png -r 150` for both files, masks stay logo and company only.

- Font identity is the mapped family and weight (`reports/font-map.json`), not the raw PDF font name.
- A text-width check was added at 0.5 pt (reference span width against the re-extracted rendered width).
- A line also has to match width within 0.1 pt, stroke color, and dash. A rectangle also has to match stroke color and dash. Fill matching is unchanged.
- Elements fully outside the page box are dropped before either side is compared. The invoice dropped 6, which removes the off-page white rectangle from round 1.

`reports/spec.schema.json` now allows `stroke: null` for a fill-only rectangle. That is a schema correction, not a tolerance change.

Bundled fonts, not copied from the reference PDFs: Arimo regular and bold (Arial and Helvetica), Noto Sans regular and bold (Unicode fallback), Liberation Mono regular and bold (Consolas). Map: `reports/font-map.json`. `@pdf-lib/fontkit` is required to embed them. Each golden span is drawn with horizontal scaling so its advance matches the reference span width.

`node tools/reports/extract.mjs --pilots`

```
INVOICE pages 1, spans 236, dynamic 65, lines 269, rects 34, images 1, characters 2311, droppedOutside 6, colors #000000 #ffffff, curves 32, nonAxisPaths 1, pdftotext words missing 29
HBL pages 1, spans 88, dynamic 29, lines 93, rects 27, images 2, characters 2456, xobjects 2, lineStyle 108, undecodedText 6, textRenderMode 4, pdftotext words missing 1 (24.000CBM)
ARRIVAL pages 1, spans 126, dynamic 45, lines 424, rects 66, images 2, characters 1860, curves 189, nonAxisPaths 18, xobjects 2, lineStyle 451, undecodedText 2, textRenderMode 11, pdftotext words missing 1 (:07-FEB-19)
TRIAL BALANCE pages 3, spans 624, dynamic 302, lines 51, rects 0, images 0, characters 4916, page 3 spans 0, markedContent 784/162/2, pdftotext words missing 4
```

Shading ops recorded: 0 on all four. Dash is stored when `setDash` appears; geometry passed with dash equality, so these four did not show a dash mismatch. CMYK and opacity: 0. Curves, non-axis paths, form XObject markers, line cap/join, marked content, undecoded show-text, and nonzero text render mode are counted and not reconstructed. Image bytes are not copied. The missing `pdftotext` words are split tokens (`<h3>T` + `AX INVOICE</h3>`, `LTD` split from `PVT L`), not dropped glyphs.

`node tools/reports/validate-spec.mjs` on each spec: valid, 0 errors.

`node tools/reports/render-spec.mjs <CODE>` and the same command with `--overflow`. Overflow modes actually applied: invoice clip 59, shrink 4, wrap 2; HBL clip 19, wrap 10, shrink 0; arrival clip 34, wrap 7, shrink 4; trial balance clip 269, shrink 33, wrap 0. Shrink and wrap run only when the span's binding has a number, currency, date, or text format. Unbound dynamic spans use clip. Golden renders keep the reference demo strings. Invoice white text: 5 spans, all 5 re-extracted as `#ffffff`.

Spans whose reference advance is more than 0.5 pt away from the bundled font's natural width, and which the renderer therefore scales: invoice 17 of 236, HBL 40 of 88, arrival 53 of 126, trial balance 242 of 624. After that scaling, the 0.5 pt width check failed on 0 spans.

`node tools/reports/diff-pilot.mjs` for each code. Poppler again printed `No display font for 'Symbol'` and `No display font for 'ArialUnicode'` on the reference files.

Tax Invoice India 1: page pass (594 x 841.9, 1 page). Geometry pass, 0 unmatched lines, 0 unmatched rects. Static text pass, 171 spans, 0 failures. Dynamic text pass, 65 spans, 0 failures. Raster fail, 30,390 pixels, 1.40% (limit 0.5%). Heatmap `reports/output/raster/INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA-page-1-diff.png`. Pagination not a multi-page pass. Single-page invariants: header present, summary after last row (last row y 427.9, summary top 230.6), no-overflow fail. Spans past the right edge: `p1s21` `.fresatechnologies.com` (535.5 + 81.4), `p1s121` `eight` (581.1 + 18.9), `p1s236` `echnologies` (563.2 + 36.2). Page width is 594. They intersect the page, so they were kept.

HBL Jasper: page pass (595 x 842, 1 page). Geometry pass, 0 unmatched lines, 0 unmatched rects. Static text pass, 59 spans, 0 failures. Dynamic text pass, 29 spans, 0 failures. Raster fail, 38,693 pixels, 1.78%. Heatmap `reports/output/raster/HBL_DRAFT_REPORT_FORMAT_JASPER-page-1-diff.png`. Pagination not a multi-page pass. Single-page invariants: no overflow, header present, summary-after-last-row fail (last row y 170.7, summary top 194.7). The detail band is y 170.7–594.7 and the summary band is y 101–235.8, so they overlap. The highest span inside the summary percentage band sits above the lowest detail span.

Arrival Notice Jasper: page pass (595 x 842, 1 page). Geometry pass, 0 unmatched lines, 0 unmatched rects. Static text pass, 81 spans, 0 failures. Dynamic text pass, 45 spans, 0 failures. Raster fail, 45,442 pixels, 2.09%. Heatmap `reports/output/raster/ARRIVAL_NOTICE_REPORT_FORMAT_1_CARGO_ARRIVAL_NOTICE_JASPER-page-1-diff.png`. Pagination not a multi-page pass. Single-page invariants: no overflow, header present, summary after last row (last row y 387.5, summary top 200.4).

Trial balance: page pass (595 x 842, 3 pages). Geometry pass, 0 unmatched lines, 0 unmatched rects. Static text pass, 322 spans, 0 failures. Dynamic text pass, 302 spans, 0 failures. Raster fail, 100,147 pixels, 1.53% across three pages. Heatmaps `reports/output/raster/TRIAL_BALANCE_REPORT_FORMAT_1_TRIAL_BALANCE_SUMMARY-page-1-diff.png`, `page-2-diff.png`, `page-3-diff.png`. Pagination exercised and failed: header repeats false, footer repeats false, summary after last row false, row break true. Page 3 has no spans, lines, rectangles, or images (marked content only). The printed footer says page 1 of 2 and page 2 of 2. The blank third page has no header and no footer, and the summary check looks at that last page, so GRAND TOTAL on page 2 does not satisfy it. Row break is true only inside the percentile detail bands. Page 2's detail band is y 487.4–671.9, so rows below y 487 are outside that check.

Raster causes, from the heatmaps and the capture gaps. Every pilot's text edges differ because Arimo, Noto Sans, and Liberation Mono are substitutes, and horizontal scaling stretches a span to its reference advance. That matches the width check and still changes the glyph shapes wherever the reference width came from TJ adjustments or character spacing rather than the font's own advances. HBL and arrival barcodes stay red: they are images or nonzero text-render-mode drawing, and image bytes are not copied. Arrival also leaves 189 curves and 18 non-axis paths undrawn. Invoice leaves 32 curves undrawn, and three spans run past the right edge. Trial balance page 2 shows the stretched column text. Trial balance page 3 is blank on both sides. Poppler also has no display font for Symbol and Arial Unicode while rasterizing the references.

Bindings. Dictionary `reports/binding-dictionary.csv` (63 rows) targets only the paths in `src/features/reports/contracts/reportBindings.ts` (invoice, bill of lading, arrival notice). A dynamic span takes the nearest static label on the same line to its left, otherwise the nearest label above. A label of at least 4 characters that is a unique prefix of one dictionary key is accepted, so a truncated `Bill T` can match `bill to`. Exact keys added for labels the prefix rule cannot see: `hbl ha`, `gst18 sgst9`, `gst18 cgst9`. There is no trial-balance contract.

`node tools/reports/build-bindings.mjs` → dictionary 63, unresolved 360. `npx vitest run src/features/reports/contracts/reportBindings.test.ts` → 1 passed.

Resolved dynamic spans: invoice 18 of 65, HBL 13 of 29, arrival 17 of 45, trial balance 33 of 302. The trial-balance matches are labels that already exist on the three contracts, such as `total`. The other 269 trial-balance spans stay unresolved.

Unresolved spans, all of them, are in `reports/output/unresolved-bindings.csv`:

| Pilot | No static label | Label not in the dictionary |
|---|---|---|
| Tax Invoice India 1 | 2 | 45 |
| HBL Jasper | 0 | 16 |
| Arrival Notice Jasper | 0 | 28 |
| Trial balance | 155 | 114 |

Invoice examples of unresolved labels: no label on the first date, `User :`, `AX INVOICE</h3>`, `WEB : www`, `Shipment No.`, `Due Date`, `Reference No.`, `IGM No.`, `SEAL FEE`. Those strings are not paths on the three contracts, so they were left unresolved.

## Pilot round 3

Same four pilots. Nothing accepted. No other layout was rendered. Thresholds are unchanged: geometry 0.1 pt, text position 0.5 pt, text width 0.5 pt, raster ratio 0.005, pixelmatch 0.1, `pdftoppm -png -r 150`.

Checker changes, all stricter or additive:

- A span fails the width check when its rendered horizontal scale differs from the reference Tz, even if the advances match. Fit-to-width scaling is a failure. This round had 0 such failures.
- Natural width delta is reported per span and does not change the 0.5 pt tolerance. A font mapping is listed when its mean absolute natural delta exceeds 0.5% of the reference glyph advance.
- Arial Unicode is compared as Arimo. Noto is accepted on that span only for a glyph outside Latin.
- Geometry fails when a captured path is not redrawn within 0.1 pt, and when a curve, non-axis path, unresolved XObject, shading, opacity, undecoded show-text, nonzero text render mode, or unknown operator remains. Marked content is recorded and is not a geometry element. Line cap and line join are compared.
- Raster pixels are classified. The 0.5% limit is unchanged.
- Pagination ignores trailing blank pages. Golden output still keeps them, so the page-count check still sees them. `--live` omits trailing blank pages. Row break and summary-after-last-row run only on layouts classified as tables. Detail bands come from repeating column edges.
- CI compares `reports/ci-baseline.json` and fails when a passing layer starts failing, a mismatch count rises, or the raster ratio rises. The workflow is `.github/workflows/report-pilots.yml`.

`node tools/reports/extract.mjs --pilots` then render, then `node tools/reports/diff-pilot.mjs` for each code. `node --test tools/reports/round3.test.mjs` — 2 passed. `node tools/reports/census.mjs` — 401 PDFs, 0 failures.

Tax Invoice India 1, form: page pass. Geometry pass (1 path redrawn, uncaptured 0). Static text fail, 14 width failures, all over 0.5 pt and none from horizontal scale. Dynamic text pass, 65 spans. Raster fail, 37,068 px, 1.71%. Causes: text glyph 80.93%, text position 3.25%, vector 15.82%, image/barcode 0, color 0. Pagination not a multi-page pass. Header present. Three spans still cross the right edge (`p1s21`, `p1s121`, `p1s236`). Font over 0.5% natural deviation: Consolas to Liberation Mono, 11 spans, mean 7.82%.

HBL Jasper, form: page pass. Geometry fail, 0 unmatched lines, rects, and paths, 10 uncaptured (6 undecoded show-text, 4 nonzero text render mode). Static text pass, 59 spans. Dynamic text pass, 29 spans. Raster fail, 22,561 px, 1.04%. Causes: text glyph 68.44%, text position 0.37%, vector 2.57%, image/barcode 28.62%, color 0. No font mapping over 0.5%.

Arrival Notice Jasper, form: page pass. Geometry fail, 30 paths redrawn, 13 uncaptured (2 undecoded show-text, 11 nonzero text render mode). Static text fail, 2 width failures. Dynamic text pass, 45 spans. Raster fail, 38,996 px, 1.79%. Causes: text glyph 54.97%, text position 0.35%, vector 2.45%, image/barcode 42.02%, color 0, other 0.22%. Fonts over 0.5%: Arial Unicode to Arimo 0.81% (66 spans), Helvetica to Arimo 0.58% (26 spans).

Trial balance, table: page pass, 3 pages including the blank page. Geometry pass. Static text fail, 68 failures. Dynamic text fail, 134 failures. Of the 202 text failures, 182 are position or string and 20 are width. Raster fail, 37,427 px, 0.57%. Causes: text glyph 92.72%, text position 1.16%, vector 6.11%. Pagination exercised and failed. The trailing blank page is ignored (1). Footer repeats on the two content pages. Header does not repeat. Row break passes inside the column-aligned detail band. Summary-after-last-row fails: last detail y 150, summary top y 699.9. The row template has 29 rows and 196 filled cells; 14 of those cells sit on a column whose header mapped to `ledger.debit`, `ledger.openingBalance`, or `ledger.closingBalance`. Fonts over 0.5%: Arial Unicode to Arimo 4.71%, Arial Bold to Arimo Bold 22.15%, Arial to Arimo 12.74%.

Images, bytes not copied:

| Pilot | Box | Proposed class | Demo value used |
|---|---|---|---|
| Invoice | 27.4, 784.6, 82 × 39.6 | logo | |
| HBL | 360, 627, 155.4 × 75 | logo | |
| HBL | 380, 795, 194 × 17 | barcode | PLMAAJEA00081 |
| Arrival | 21, 742.7, 552 × 77.3 | logo | |
| Arrival | 350, 211, 220 × 35 | barcode | Yours faithfully , |

The arrival barcode's nearest text is the closing line, so the generated bars are not the reference payload. No QR image appears in these four pilots. Proposed allowed differences, for a decision: logo (already masked), barcode generated from the bound value, QR generated from the bound value, decorative Fresa branding. Class `other` is proposed as not allowed. The wide arrival header matched the logo rule because it sits in the top band.

`reports/label-inventory.csv` has 1,343 labels from 401 PDFs. `reports/binding-proposals.csv` proposes paths for the top 300. 225 of those are new fields the contracts do not have (`ledger.debit`, `ledger.credit`, `document.user`, `company.website`, `invoice.dueDate`, `shipment.number`, and slug fields where the nearest text was a value such as `inr` or `1`). Resolved 270, unresolved 171 (167 outside the top 300, 4 with no label). Files: `reports/output/pilot-bindings-resolved.csv`, `reports/output/pilot-bindings-unresolved.csv`.

Capability census, 401 PDFs, 509 pages, extraction only. Files using each feature: curves 110 (5,776 ops), images 359 (449), nonzero text render mode 227 (6,710), word spacing 78 (2,041), character spacing 20 (957), TJ 60 (4,928), dash 29 (82). Shading, CMYK, opacity, and non-100 Tz: 0. The common unsupported features are nonzero text render mode and the curves that are still uncaptured outside these four pilots.

