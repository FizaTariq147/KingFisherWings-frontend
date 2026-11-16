# Report Layout Audit

**Date:** 2026-11-16  
**Mode:** Read-only (no production code changes)  
**Product:** Freightnest (KingFisherWings-frontend)  
**Reference:** https://fresatechnologies.com/sample-report-formats/

---

## Executive verdict

Freightnest’s catalogue architecture is **rich in codes and thin in format-specific visual DNA**. Many “formats” are registry or catalogue rows that resolve to:

1. The same official sample PDF, or  
2. The same JSON shell (alias), or  
3. A shared template-v2 React document that mainly changes accent color / title, or  
4. html2canvas capture that cannot match native Fresa PDF typography and borders.

**Having a JSON configuration or registry entry does not mean a format is visually implemented.**

---

## 1. Architecture map

### Entry points

| Role | Path |
| --- | --- |
| Catalogue route | `/reports/catalog` → `src/features/reports/pages/ReportCatalogPage.tsx` |
| Route constant | `src/features/reports/api/reportCatalog.api.ts` (`REPORT_CATALOG_ROUTE`) |
| Reports hub menu | `src/features/reports/config/reportsMenu.ts` → `ReportsMenuPage` |
| Router wiring | `src/router/index.tsx` |

### Inventory layers

| Layer | Approx. size | Path |
| --- | ---: | --- |
| Full Fresa registry | **852** codes | `data/fresaReportRegistry.generated.ts` |
| Unique JSON layout objects | **~795** | family `*FormatUiLayouts.generated.ts` + union |
| Official page inventory (QA) | **~461** | `qa/REPORT_OFFICIAL_FORMAT_AUDIT.json` |
| User-facing HAWB | **5** | `constants/hawbFormatCatalog.ts` + governance |

### Family catalogues (`list*` → browse strips)

| Family | Catalogue file | Strip / AutoPdf |
| --- | --- | --- |
| HAWB | `constants/hawbFormatCatalog.ts` | `HawbFormatBrowseStrip` / `HawbFormatAutoPdf` |
| HBL | `constants/hblFormatCatalog.ts` | `HblFormatBrowseStrip` / `HblFormatAutoPdf` |
| Invoice | `data/invoiceFormatPreviews.ts` | invoice AutoPdf / JSON renderer |
| Arrival | `constants/arrivalNoticeFormatCatalog.ts` | `ArrivalNoticeFormat*` |
| DO | `constants/deliveryOrderFormatCatalog.ts` | `DeliveryOrderFormat*` |
| WMS / Accounts / Quotation / Ops / Other | matching `constants/*FormatCatalog.ts` | matching strips |

### Official governance

- `utils/officialFormatGovernance.ts` — HAWB official five only in primary catalogue  
- HAWB extras remain resolvable via `getHawbFormatSpec` (historical deep links)  
- Shared-shell honesty: `data/sharedLayoutSource.ts`, `utils/catalogSharedLayoutHint.ts`, `?layouts=distinct`

### JSON layouts → paint path

```
code → resolveAnyFormatUiLayout / family get*UiLayout
    → InvoiceFormatLayoutByKind (invoiceLayouts/index.tsx)
    → JsonInvoiceLayoutRenderer
    → optional hawbAwbShell / hblBlShell blocks
```

### PDF pipeline priority

Documented in `constants/reportPreserveMatrix.ts` / `utils/generateCatalogLayoutPdf.ts`:

1. **Official sample browse** (CDN PDF + org stamp)  
2. **Backend pack** `POST /reports/generate`  
3. **template-v2** React docs (`templates/*`, `renderTemplateV2Pdf`)  
4. **JSON fallback** React capture (`captureReactDocumentPdf` / html2canvas)

### Branding

- SoT: `GET /organization/profile`  
- Resolvers: `resolveReportOrgChrome.ts`, `resolveReportCompanyBranding.ts`  
- Never use Fresa as registered company chrome  

### Backend adapters

`api/reportCatalog.api.ts` / `services/reportCatalog.service.ts`:  
templates list/import, bind-renderer, activate, generate, jobs poll.

---

## 2. Rendering modes by family (honesty)

| Family | Browse (typical) | Bound / fallback | Format-specific fidelity today |
| --- | --- | --- | --- |
| HAWB official 5 | Distinct Fresa samples + stamp | JSON `hawbAwbShell` variants (v2 skipped for official) | **Best of client paths** when sample used |
| HAWB extras | Same sample as nearest official | Aliased shell | **Not independent** |
| HBL official JSON (113) | Sample when available | Often Format-11 / FG shell aliases; classic BL families | Mixed; many codes not unique |
| HBL Jasper pilot | Dedicated `templates/hbl/jasperPilot/` | Pilot PDF | **Pilot-quality path** (still not pixel-Fresa) |
| Invoice | JSON layouts (82) | JSON / template-v2 | Shared renderer → similar charge-table DNA |
| Arrival | template-v2 preferred | Many codes → Jasper Format-1 shell | High alias rate |
| DO | Official sample when verified | Many → Format-17 shell | High alias rate |
| Manifest / daily ops | JSON / template-v2 | Shared ops shells | Landscape refs often flattened to A4 patterns |

---

## 3. Root causes of visual inaccuracy

### R1 — Shell aliasing (coverage ≠ fidelity)

Different codes map to one layout object (HBL → Format-11, Arrival → Jasper-1, DO → Format-17, HAWB Format-3+ → draft).  
Files: `data/hblFormatUiLayouts.ts`, `arrivalNoticeFormatUiLayouts.ts`, `deliveryOrderFormatUiLayouts.ts`, `hawbFormatUiLayouts.ts`.

### R2 — template-v2 is chrome-variant, not document-variant

Example: `templates/hawb/HawbTemplateDocument.tsx` `kindChrome()` changes accent/badge, not IATA grid geometry.  
Shared primitives: `templates/shared/*` (`DocPageChrome`, `BrandHeader`, `DataTable`).

### R3 — Single JSON paint engine

`JsonInvoiceLayoutRenderer` + `applySharedLayoutChrome` produce similar typography, spacing, and borders across families even when block trees differ slightly.

### R4 — Capture technology ceiling

`engines/pdf/captureReactDocumentPdf.ts` (html2canvas + jsPDF) cannot reproduce Fresa’s native PDF vector text, exact hairlines, or preprinted MediaBoxes reliably.

### R5 — Sample stamp ≠ redrawn layout

`stampOrgChromeOnSamplePdf.ts` overlays org name/logo on Fresa samples. Browse looks “Fresa-like” because it **is** the sample PDF, not a regenerated Freightnest layout. Bound paths then switch away from samples → fidelity cliff.

### R6 — Orientation / page size ignored

References include landscape manifests (≈792×612) and HAWB original1 (≈737×923). Client defaults often A4 portrait 595×842.

### R7 — Pagination / overflow immature

Print-CSS pilot exists (`engines/pdf/printCssPilot.ts`) mainly for arrival experiments; fleet remains single-canvas capture → clipping, footer collision, weak multi-page.

---

## 4. What “good” looks like (acceptance for redesign)

For each **official** format selected for fidelity work:

1. Independent layout structure (not title/color-only).  
2. Page size/orientation match reference (±1–2 pt).  
3. Section order and primary tables match reference.  
4. Registered org branding only (no Fresa letterhead).  
5. Preview blob === download blob.  
6. Visual evidence: page PNG vs local Fresa reference under `qa/fresa-references/pdfs/`.  
7. JSON existence alone is **insufficient** evidence of implementation.

---

## 5. Constraints to preserve

- HAWB user-facing count remains **exactly 5**.  
- Historical codes remain resolvable.  
- No DB/API schema changes in layout redesign phase.  
- Do not invent new official formats.  
- Backend packs remain the product path for exact look when available.

---

## 6. Evidence artifacts

- Architecture & duplication: this file + `REPORT_LAYOUT_DUPLICATION_AUDIT.md`  
- Reference probe: `qa/visual-evidence/reference-comparison-probe.json`  
- Prior HAWB reconciliation: `HAWB_OFFICIAL_FORMAT_RECONCILIATION.json`  
- Fidelity policy: `FRESA_FIDELITY_STRATEGY.md`  
- Local references: `qa/fresa-references/pdfs/`
