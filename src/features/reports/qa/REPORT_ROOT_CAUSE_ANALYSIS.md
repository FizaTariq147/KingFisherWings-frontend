# Report Root Cause Analysis

**Date:** 2026-11-14  
**Branch:** `develop`  
**Rule:** Inspected runtime sources — not audit-doc claims alone.

## Problem 1 — Registered company logo / name not consistent

### Actual root cause
1. Classic HBL family documents (`BlFamily*Document`, `blFamilyShared.BrandHeader`) still hardcode `@/assets/logo.png` and fallback text `KingFisher Wings`, ignoring org chrome / `logoUrl`.
2. `InvoiceFormatLayoutByKind` did not forward `data.logoUrl` into chrome when `chrome` prop is omitted.
3. Org chrome resolver was improved earlier, but several PDF capture paths never passed `logoUrl` into the classic BL model.

### Affected files
- `src/features/shared/bl-draft/families/BlFamily*.tsx`
- `src/features/shared/bl-draft/families/blFamilyShared.tsx`
- `src/features/shared/bl-draft/BlDraftClassicDocument.tsx`
- `src/features/shared/bl-draft/generateBlDraftPdf.ts`
- `src/features/reports/components/ReportCatalog/invoiceLayouts/index.tsx`
- `src/features/reports/utils/resolveReportOrgChrome.ts` (authoritative source)

### Incorrect behavior
PDFs often show the product KF asset / name instead of `GET /organization/profile` `display_name` + `logo_url`.

### Required correction
Centralize branding via org chrome; thread `logoUrl` + company fields into every capture path; omit logo/name when missing (no fabrication).

### Regression risks
Blank headers when org profile incomplete; classic family visual change vs prior KF defaults.

---

## Problem 2 — HAWB shows ~30 formats vs 5 official

### Actual root cause
`listHawbFormats()` builds `ALL_HAWB_FORMATS` by merging `HAWB_FORMAT_CATALOG` (5) with **every** `HAWB_*` code from `FRESA_REPORT_REGISTRY` and inventing specs with `sampleIsFallback: true` that reuse the same draft/original PDF.

`HawbFormatBrowseStrip` and catalogue strips call `listHawbFormats()` — so the UI exposes ~30 entries.

JSON layouts are already only 5 (`hawbFormatUiLayouts.generated.ts`); the strip was the authoritative wrong list.

### Affected files
- `src/features/reports/constants/hawbFormatCatalog.ts`
- `src/features/reports/components/ReportCatalog/HawbFormatBrowseStrip.tsx`
- `src/features/reports/pages/ReportCatalogPage.tsx` (hawbStripCodes)
- `src/features/reports/utils/officialFormatGovernance.ts`

### Incorrect behavior
User-facing HAWB selector lists Format-3…N as if they were official distinct formats.

### Required correction
User-facing `listHawbFormats()` returns **only** the 5 official catalogue rows. Keep `getHawbFormatSpec` / historical resolution for deep links without presenting extras as official.

### Regression risks
Deep links to Format-3…N still resolve for PDF if code is known, but strip/search no longer list them as official.

---

## Problem 3 — Formats look almost identical

### Actual root cause
1. **HAWB extras** aliased to the same sample PDF + same JSON shell (`resolveHawbLayoutCode` → base draft/original).
2. **Entity-bound HAWB** preferred template-v2 (`HawbTemplateDocument`) which mostly varies accent colors, **skipping** the structurally distinct `hawbAwbShell` variants (`draft` / `draft1` / `draft2` / `original1` / `original2`) already in JSON layouts.
3. Broader families still use shared-shell aliases (documented honesty); fixing HAWB official path + branding is the high-impact correction without inventing formats.

### Affected files
- `src/features/reports/utils/generateCatalogLayoutPdf.ts`
- `src/features/reports/components/ReportCatalog/HawbFormatAutoPdf.tsx`
- `src/features/reports/data/hawbFormatUiLayouts.ts`
- `src/features/reports/components/ReportCatalog/invoiceLayouts/HawbAwbShell.tsx`
- `src/features/reports/templates/hawb/HawbTemplateDocument.tsx`

### Incorrect behavior
Selecting different HAWB codes (especially extras, or live-data path) yields near-identical documents.

### Required correction
Expose only 5 official HAWBs; for those codes prefer official sample (browse) and **JSON hawbAwbShell** (entity-bound) over color-only template-v2.

### Regression risks
Entity-bound HAWB PDFs switch from template-v2 chrome to IATA shell layout — intentional fidelity improvement.
