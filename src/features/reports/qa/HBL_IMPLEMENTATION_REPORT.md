# HBL Implementation Report — Phase 3 Jasper Pilot

**Code:** `HBL_DRAFT_REPORT_FORMAT_JASPER`  
**Reference:** FRESA-REF-0001 · `hbl-draft-report-fomat-jasper.pdf`  
**Date:** 2026-11-13  
**Scope:** This pilot only. No other report formats changed.

## Step 1 — Reference verification

| Check | Result |
| --- | --- |
| Report name | HBL Draft Report Format Jasper |
| FreightNest mapping | `HBL_DRAFT_REPORT_FORMAT_JASPER` (FRESA_REFERENCE_MAPPING.json) |
| PDF filename | `hbl-draft-report-fomat-jasper.pdf` |
| Page count | 1 |
| Dimensions | 595×842 pt |
| Orientation | Portrait |
| Stub / preprinted | No (`likelyBlankOrStub: false`, `likelyPreprintedForm: false`) |
| Mapping ambiguous? | No — STOP not required |

Sources: `FRESA_REFERENCE_INVENTORY.json`, `FRESA_REFERENCE_MAPPING.json`, `FRESA_PDF_VALIDATION.json`.

## Step 2 — Existing implementation (reused)

| Concern | Location |
| --- | --- |
| HBL catalogue | `hblFormatCatalog.ts` |
| Shared classic model builder | `buildBlDraftClassicModel` in `generateBlDraftPdf.ts` |
| Classic Jasper family (other codes) | `BlFamilyJasperDocument` / `generateHblFamilyClassicPdf` |
| Context → PDF data | `resolveCatalogContextPdfData` |
| Sample PDF fetch/stamp | `generateHblSamplePdf` (fallback only for this pilot) |
| PDF viewer | `PdfViewerModal` + `usePdfViewer` |
| Customer terms append | `appendOfficialCustomerTermsPdf` |

Did **not** create a parallel catalogue architecture. Did **not** alias this code to `FG_HBL_HKG` for the pilot path.

## Step 3–4 — Config-driven template

Independent composition under:

`src/features/reports/templates/hbl/jasperPilot/`

- `hblJasperPilot.config.ts` — sections, fields, visibility, order, column templates, typography, borders, spacing, table widths, page/margins/orientation, page-break policy
- `HblJasperPilotDocument.tsx` — renders from config
- `mapToHblJasperPilotModel.ts` — real data mapping, no fabricated fillers
- `generateHblJasperPilotPdf.ts` — A4 595×842 capture
- `HblJasperPilotPreview.tsx` — A4 canvas, zoom, print, PDF download
- `hblJasperPilot.print.css` — document/print CSS separated from app chrome
- `hblJasperPilotLayout.ts` — catalogue-compatible JSON layout entry (own code, not HKG)

## Step 5 — Preview

`HblFormatAutoPdf` for Jasper shows:

- Config-driven A4 document canvas with zoom controls
- Loading / error states
- PDF modal (print / download) via existing `PdfViewerModal`
- App UI chrome kept outside `hblJasperPilot.print.css`

## Step 6 — Real data

Uses `resolveCatalogContextPdfData` (jobs / shipments / parties / org chrome).  
Missing fields stay blank. Classic defaults (`DRAFT`, `PREPAID`, `1(ONE)`, `—`) are stripped unless preview supplies them.

## Step 7 — PDF vs reference

Visual QA script: `node scripts/hbl-jasper-visual-qa.mjs` → `HBL_VISUAL_QA.md`  
Reference page geometry and all required section labels **PASS**.  
Pilot PDF uses the same MediaBox and section order; sample PDF retained as generation fallback.

## Step 8 — Regression

See `HBL_REGRESSION_TEST_RESULTS.md`.

## Modified / added files

### Added

- `src/features/reports/templates/hbl/jasperPilot/hblJasperPilot.types.ts`
- `src/features/reports/templates/hbl/jasperPilot/hblJasperPilot.config.ts`
- `src/features/reports/templates/hbl/jasperPilot/hblJasperPilot.config.test.ts`
- `src/features/reports/templates/hbl/jasperPilot/hblJasperPilotLayout.ts`
- `src/features/reports/templates/hbl/jasperPilot/hblJasperPilot.print.css`
- `src/features/reports/templates/hbl/jasperPilot/HblJasperPilotDocument.tsx`
- `src/features/reports/templates/hbl/jasperPilot/HblJasperPilotPreview.tsx`
- `src/features/reports/templates/hbl/jasperPilot/mapToHblJasperPilotModel.ts`
- `src/features/reports/templates/hbl/jasperPilot/generateHblJasperPilotPdf.ts`
- `src/features/reports/templates/hbl/jasperPilot/index.ts`
- `scripts/hbl-jasper-visual-qa.mjs`
- `src/features/reports/qa/HBL_IMPLEMENTATION_REPORT.md`
- `src/features/reports/qa/HBL_DATA_MAPPING_AUDIT.json`
- `src/features/reports/qa/HBL_VISUAL_QA.md`
- `src/features/reports/qa/HBL_REGRESSION_TEST_RESULTS.md`

### Modified

- `src/features/reports/data/hblFormatUiLayouts.ts` — Jasper owns its layout; leftover alias unchanged
- `src/features/reports/constants/hblFormatCatalog.ts` — pilot catalogue spec + official sample URL
- `src/features/reports/components/ReportCatalog/HblFormatAutoPdf.tsx` — Jasper pilot preview/PDF path
- `src/features/reports/utils/generateCatalogLayoutPdf.ts` — Jasper pilot generate path

## Constraints honored

- Local only; no push / commit / deploy
- No backend changes
- No other report format configs or IDs changed
- Existing sample PDF path retained as fallback until pilot generation succeeds
- Stop after this one HBL pilot — awaiting approval before additional formats
