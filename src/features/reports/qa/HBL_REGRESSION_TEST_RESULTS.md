# HBL Regression Test Results — Jasper Pilot

**Code:** `HBL_DRAFT_REPORT_FORMAT_JASPER`  
**Date:** 2026-11-13

## Vitest (relevant)

| Suite | Result |
| --- | --- |
| `jasperPilot/hblJasperPilot.config.test.ts` | PASS |
| `qa/phase6Regression.test.ts` | PASS |
| `qa/sharedShellHonesty.test.ts` | PASS |
| `qa/fresaOfficialSampleCatalogue.test.ts` | PASS |
| `utils/preferOfficialSamplePdf.test.ts` | PASS |

**Aggregate:** 5 files, **35 tests passed**.

## ESLint

Scoped to Jasper pilot + `HblFormatAutoPdf.tsx` + wired catalogue files: **clean** (`--max-warnings 0`).

## Visual QA

`node scripts/hbl-jasper-visual-qa.mjs` → **PASS** (see `HBL_VISUAL_QA.md`).  
Reference PDF FRESA-REF-0001: 1 page, 595×842 pt portrait; required section labels present.

## TypeScript (`tsc -b`)

Project-wide `tsc -b` fails on **pre-existing** errors outside this pilot (users, vendor-job-offers, zipDistances, sales pages, etc.).  
No Jasper pilot / HBL catalogue wiring files appeared in that failure set.

## Playwright

No existing HBL / report-catalogue e2e specs in `e2e/`. Not run for this pilot.

## Production build

Not declared green: full `tsc -b` already red from unrelated modules. Pilot changes are ESLint-clean and Vitest-covered.

## Catalogue / unrelated modules

- Other HBL formats still use sample → classic fallback (unchanged).
- Jasper no longer aliases to `FG_HBL_HKG` for layout resolution; leftover `LEFTOVER_HBL_DRAFT_JASPER` still maps to HKG.
- No backend or non-HBL ERP modules modified.
