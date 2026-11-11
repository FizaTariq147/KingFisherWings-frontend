# REPORT_PDF_REGRESSION — PDF path verification

**Phase:** 6  
**Method:** Static analysis of capture/print pipelines + unit test of print-CSS HTML builder.  
**Not run:** full browser html2canvas capture matrix, Playwright PDF, multi-page fixture with production logos.

## Engines in scope

| Engine | Path | Selectable text | Used for |
|--------|------|-----------------|----------|
| html2canvas + jsPDF | `engines/pdf/captureReactDocumentPdf.ts`, `generateInvoiceFormatPreviewPdf.tsx` | No (raster) | Template-v2 + legacy JSON preview |
| pdf-lib stamp | `stampOrgChromeOnSamplePdf.ts` | Yes (source PDF) | HBL/HAWB CDN samples |
| pdf-lib default invoice | `invoices/utils/generateInvoicePdf.ts` | Yes | Preserved default invoice |
| Print-CSS pilot | `engines/pdf/printCssPilot.ts` | Yes (when printed) | Arrival Notice pilot only |
| BE Puppeteer | `POST /reports/generate` | Yes | Product packs |

## Checklist (code-level)

| Check | html2canvas capture | Arrival print-CSS pilot | Evidence |
|-------|---------------------|-------------------------|----------|
| A4 portrait | Default `210×297mm` in capture | `@page { size: A4 portrait }` | `captureReactDocumentPdf.ts`, `printCssPilot.ts` |
| A4 landscape | `landscape: true` → 297×210 | Not in pilot (AN is portrait) | Manifest/ops list templates |
| Multi-page | Slice loop on canvas height | Browser print pagination | Capture while-loop; pilot relies on print |
| Footer positioning | In-document SignatureBlock only | `.an-pilot-footer { position: fixed; bottom: 0 }` | Pilot stronger for repeating footer |
| Repeating table headers | **Not supported** (single canvas) | `thead { display: table-header-group }` | Pilot better |
| Page breaks | Weak (image slices) | Native print | Pilot better |
| Font loading | System stack inline | Same in HTML | No webfont wait in capture |
| Image / logo | `waitForImages` + CORS | Text company name in pilot HTML (logo optional) | Capture attempts logo `<img>` |
| Long descriptions | Clipped by table cell CSS | Flows in HTML | — |
| Missing optional values | `—` / N/A patterns | `—` via escapeHtml | Mappings |
| Large tables | Single tall canvas → multi page images | Native table | Capture may blur |

## Arrival Notice: print-CSS vs html2canvas

| Criterion | Winner | Notes |
|-----------|--------|-------|
| Selectable text | print-CSS | Capture is bitmap |
| A4 accuracy | print-CSS | `@page` vs mm CSS + raster scale |
| Repeating headers | print-CSS | thead group |
| Footer each page | print-CSS | fixed footer |
| In-app one-click preview today | html2canvas / template-v2 | Pilot is HTML string builder + unit test only |
| Migration of entire system | **Forbidden** | Keep pilot gated |

Unit evidence: `engines/pdf/printCssPilot.test.ts` asserts `@page`, `thead` repeat, and format code in HTML.

## Failures

| Report ID | File | Issue | Severity | Recommended correction |
|-----------|------|-------|----------|------------------------|
| ARRIVAL_NOTICE_* (capture) | `captureReactDocumentPdf.ts` | No repeating thead / selectable text | medium | Keep pilot; do not migrate fleet |
| ALL template-v2 PDF | html2canvas | Raster quality / page-break fragility | medium | Existing known limit |
| Multi-page footer | capture path | Footer not repeated per page | medium | Pilot pattern for future AN only |

## Regression gate

Do **not** replace html2canvas globally. Do **not** migrate all reports to Playwright. Pilot remains Arrival Notice documentation + HTML builder until explicitly approved.
