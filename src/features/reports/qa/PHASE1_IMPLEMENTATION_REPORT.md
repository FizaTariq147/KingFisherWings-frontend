# Phase 1 Implementation Report — PDF Rendering Foundation

**Date:** 2026-11-16  
**Scope:** Reusable page geometry, typography, document structure CSS, capture/print wiring, PDF MediaBox inspection  
**Not in scope:** Format-specific Fresa layout redraw (Phase 2+), new report formats, schema/API changes, GitHub push

---

## 1. Rendering architecture

### Engine assessment (decision)

| Approach | Status in repo | Verdict for Phase 1 |
| --- | --- | --- |
| **html2canvas + jsPDF** (client catalogue / template-v2 / Jasper pilot) | Active | **Reuse** — primary catalogue preview/download path |
| **HTML/CSS `@page` print pilot** (Arrival Notice) | Active | **Reuse + strengthen** with shared foundation CSS |
| **Backend Puppeteer** (product report packs) | Active (Nest packs) | **Leave unchanged** — product print remains server-side |
| **Browser-native `window.print`** | Used conceptually by print pilot | Supported via foundation `@page` CSS; no new runtime required |
| **New client PDF engine** (e.g. extra React-PDF / pdfmake) | Not present | **Not introduced** — no concrete fidelity gain over existing stack for Phase 1 |

**Conclusion:** Prefer existing `html2canvas` + `jspdf` + `pdf-lib` (inspect) + print CSS. Phase 1 centralizes geometry/typography/structure so later format work does not fork page math.

### Pipeline (unchanged product priority)

1. Official sample browse (when unbound)  
2. Backend pack (`POST /reports/generate`)  
3. Template-v2 React → `captureReactDocumentPdf`  
4. JSON layout html2canvas fallback  
5. HBL Jasper pilot remains config-driven native path  

Preview modal and download both consume the **same** `generateCatalogLayoutPdf` / capture blob — no second layout pass.

```
PageGeometry / Typography / Structure CSS
        │
        ├─► captureReactDocumentPdf (html2canvas → jsPDF)
        ├─► printCssPilot / buildDocumentPrintCss (@page HTML)
        ├─► docStyles page boxes (template-v2)
        └─► HBL Jasper page box (FRESA-REF-0001 A4)
```

---

## 2. Dependencies

| Package | Action |
| --- | --- |
| `html2canvas` | **Reused** |
| `jspdf` | **Reused** |
| `pdf-lib` | **Reused** (MediaBox inspection + byte identity) |
| Puppeteer / Chromium | **Not added** on frontend |
| New PDF libraries | **None** |

---

## 3. Files modified / added

### New
- `engines/pdf/pageGeometry.ts` — A4/A5/Letter/Legal/Custom, margins, mm↔pt, host/jsPDF helpers  
- `engines/pdf/documentTypography.ts` — size/weight/line-height/align/wrap CSS tokens  
- `engines/pdf/documentStructure.ts` — tables, thead repeat, breaks, header/footer slots  
- `engines/pdf/buildDocumentPrintCss.ts` — combined print stylesheet builder  
- `engines/pdf/inspectPdfBlob.ts` — actual PDF page inspection  
- `engines/pdf/createGeometryFixturePdf.ts` — representative fixtures + shared preview/download blob helper  
- `engines/pdf/documentBrandingContract.ts` — org-profile-only branding rule  
- `engines/pdf/phase1PdfFoundation.test.ts` — geometry + MediaBox tests  
- `qa/phase1-fixtures/*` — inspected PDF fixtures  
- `qa/PHASE1_IMPLEMENTATION_REPORT.md` — this report  

### Updated
- `engines/pdf/captureReactDocumentPdf.ts` — resolves `PageGeometry`; legacy `landscape`/`widthMm` preserved  
- `engines/pdf/printCssPilot.ts` — Arrival Notice CSS built on foundation  
- `engines/preview/renderTemplateV2Pdf.ts` — landscape families pass `PAGE_A4_LANDSCAPE`  
- `engines/index.ts` — exports foundation modules  
- `templates/shared/docStyles.ts` — A4 page boxes from geometry  
- `templates/hbl/jasperPilot/hblJasperPilot.config.ts` — page box from `resolvePageGeometry` (still 595×842)  
- `utils/generateCatalogLayoutPdf.ts` — preview/download equivalence note  

### Explicitly preserved
- All format codes / HAWB five selectable formats / historical HAWB resolution  
- HBL Jasper pilot behavior and APIs  
- Organization profile branding resolver  
- No PostgreSQL / Nest schema changes  
- Unrelated modules untouched  
- Local-only (no GitHub push)

---

## 4. Before / after PDF evidence

### Before
- Page sizes were hard-coded ad hoc (`210`/`297` mm, Jasper `595×842` literals, print CSS `@page` string).  
- No shared MediaBox inspection harness.  
- No reusable Custom/Letter/Legal/A5 helpers for catalogue capture.

### After (actual PDF MediaBox via `pdf-lib`)

| Fixture | Pages | MediaBox (pt) | Notes |
| --- | --- | --- | --- |
| `a4-portrait-multipage.pdf` | 2 | 595×842 | Multi-page + header/footer/table |
| `a4-landscape.pdf` | 1 | 842×595 | Landscape orientation |
| `a5-portrait.pdf` | 1 | 420×595 | A5 |
| `letter-portrait.pdf` | 1 | 612×792 | Letter |
| `legal-portrait.pdf` | 1 | 612×1008 | Legal |
| `hawb-original1-custom.pdf` | 1 | 737×923 | Custom (HAWB Original-1 ref size) |
| `header-footer-table.pdf` | 2 | 595×842 | Chrome + table columns |
| `preview-download-same-blob.pdf` | 1 | 595×842 | Same Blob reference for preview & download |

Jasper config MediaBox remains **595×842 pt** (aligned with FRESA-REF-0001), now sourced from Phase 1 geometry.

**No Fresa-level visual fidelity claim** — fixtures prove geometry/foundation only.

---

## 5. Test results

```
npx vitest run \
  src/features/reports/engines/pdf/phase1PdfFoundation.test.ts \
  src/features/reports/templates/hbl/jasperPilot/hblJasperPilot.config.test.ts \
  src/features/reports/constants/hawbFormatCatalog.test.ts \
  src/features/reports/utils/reportCompanyBranding.test.ts \
  src/features/reports/utils/catalogFormatStatus.test.ts \
  src/features/reports/utils/officialFormatGovernance.test.ts
```

| Suite | Result |
| --- | --- |
| `phase1PdfFoundation.test.ts` | **PASSED** (geometry, CSS, MediaBox, equivalence, HAWB=5, branding contract, Jasper box) |
| Jasper config regression | **PASSED** |
| HAWB catalogue = 5 | **PASSED** |
| Org branding regression | **PASSED** |
| Catalogue honesty (Phase 0) | **PASSED** |
| Official governance | **PASSED** |

Covered checks:
- Page dimensions & orientation (inspected PDF, not TS-only)  
- Font token CSS (sizes/weights/line-height/align/wrap)  
- Table fixed layout + thead repeat CSS  
- Header/footer slots + multi-page fixtures  
- Preview/download byte identity (`pdfBlobsAreIdentical` + same Blob ref)  
- Branding contract: org profile only; Fresa identity forbidden  
- Existing report paths / Jasper / HAWB five preserved  

---

## 6. Branding

- Contract: `documentBrandingContract.ts` → `organization_profile` only.  
- Runtime resolver unchanged: `resolveReportCompanyBranding.ts`.  
- Fixtures use neutral footer copy (“registered org branding only”) — **no Fresa logos**.

---

## 7. Remaining limitations

1. Catalogue formats still largely share shells / sample PDFs — Phase 1 does **not** redraw Format-N layouts.  
2. Client capture remains **raster** (html2canvas); selectable-text fidelity for catalogue still depends on print CSS / backend Puppeteer packs.  
3. Running header/footer CSS (`position: running()`) is print-engine dependent; jsPDF fixtures draw chrome manually.  
4. Font “embedding” in client jsPDF fixtures uses built-in Helvetica; browser CSS uses system Arial/Helvetica stacks (no new webfont package).  
5. Template-v2 documents still apply their own visual styles; foundation provides page box + shared CSS contract for gradual adoption.  
6. **Do not claim Fresa-level visual fidelity** until Phase 2+ format-specific reference comparisons complete.

---

## 8. Local-only confirmation

- Changes are **local workspace only**.  
- **No** `git push`, **No** GitHub PR, **No** remote deploy.  
- **No** PostgreSQL / NestJS API / schema changes.  
- **No** new report format codes.
