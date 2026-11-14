# Report Regression Results

**Date:** 2026-11-14  
**Branch:** `develop` (local only — no commit/push)

## Vitest (required 5 files)

```
npx vitest run \
  src/features/reports/constants/hawbFormatCatalog.test.ts \
  src/features/reports/utils/reportCompanyBranding.test.ts \
  src/features/reports/utils/reportDistinctLayout.test.ts \
  src/features/reports/utils/officialFormatGovernance.test.ts \
  src/features/reports/qa/fresaOfficialSampleCatalogue.test.ts
```

**Result: 5 files / 22 tests PASSED** (2026-11-14 ~10:09 local)

Confirmed:

- HAWB selector catalogue length = 5
- Branding resolves from org profile; missing logo safe
- HBL Jasper keeps own layout code
- Five distinct `hawbAwbShell` variants

## TypeScript (`npx tsc -b`)

| Metric | Value |
| --- | --- |
| Total errors | **243** |
| Reports / bl-draft related | **33** |
| Errors in branding/HAWB git-diff files | **0** |
| BlFamily `Cannot find name 'logo'` remaining | **0** (fixed confirmed) |

Classification artifact: `visual-evidence/tsc-error-classification.json`  
Raw log: `visual-evidence/tsc-build-errors.txt`

Reports-module errors that remain (examples) are **outside** the branding/HAWB touch set (e.g. `AccountsFormatAutoPdf.tsx` unused `boundLabel`, `otherReportsFormatCatalog.ts` missing `samplePdfUrl`, `legacy/invoiceLayouts/*` missing modules). Not fixed in this verification pass (unrelated scope).

## Production build (`npm run build`)

**FAIL** — blocked by the same TypeScript project errors. Output tail saved under `visual-evidence/npm-build-output.txt`. No branding-diff file introduced new build-breaking TS errors in the classified set.

## Live visual verification

Script: `scripts/report-final-visual-verify.mjs`  
Manifest: `visual-evidence/FINAL_VISUAL_VERIFY_MANIFEST.json`

| Check | Result |
| --- | --- |
| Login + org profile | PASS (`KingFisher Logistic Solutions LLC`) |
| HBL Jasper PDF download | PASS |
| 5 official HAWB PDF downloads | PASS (all opened) |
| HAWB company name stamp | PASS (pdf text) |
| Dual-company | **PARTIAL** — only one E2E tenant |
| Selector named official HAWB | 5 |
| Historical Format-3 deep-link | Resolvable |

## Acceptance snapshot

| Criterion | Status |
| --- | --- |
| Registered logo/name on reports | **Met for name** under company 1; logo URL resolved; graphical logo may omit on CORS |
| HAWB catalogue = 5 | **Met** (unit + live named hits) |
| Distinct HAWB layouts | **Met** (distinct PDFs/sizes/text) |
| HBL Jasper functional | **Met** (PDF + unit) |
| PDF visual evidence | **Met** (downloaded PDFs + page1 PNGs) |
| Dual-company proof | **Not met** — missing second authorized tenant credentials |
| Clean `tsc` / `npm run build` | **Not met** — 243 pre-existing project errors; 0 in branding diff |

## Limitations

1. No second company credentials → isolation not demonstrated.
2. Unrelated monorepo TS failures block production build.
3. Modal preview screenshots in headless Chromium are blank iframes; PDF files + rasters are the evidence.
