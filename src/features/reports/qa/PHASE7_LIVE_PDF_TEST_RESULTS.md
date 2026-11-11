# Phase 7 — Live PDF Test Results

**Generated:** 2026-11-11  
**Engines:** default in-app = html2canvas + jsPDF (`engines/pdf/captureReactDocumentPdf.ts`); Arrival Notice print-CSS pilot = `engines/pdf/printCssPilot.ts`.

## Verdict

| Bucket | Count / status |
|--------|----------------|
| Verified (static markup / HTML string) | All 15 fixture report families in unit tests |
| Verified (live html2canvas PDF bytes + page screenshots) | **0 — blocked** |
| Verified (print-CSS as printable PDF in browser) | **0 — blocked**; HTML structure unit-tested only |
| Untested | Multi-page raster pagination, font embedding, logo fetch under real CDN |

**Do not treat successful unit markup or “PDF file created” as visual correctness.** No production readiness claim.

## Why live capture is blocked here

Vitest runs in Node. `html2canvas` requires a DOM + layout engine. This pass did **not** run Playwright/Puppeteer browser automation or capture page screenshots of generated PDFs. Therefore footer overlap, clipped content, missing fonts/logos, and orientation defects cannot be asserted from binary evidence in this environment.

## Matrix (representative fixtures)

| Report ID | Engine path | Single / multi | Orientation | Markup / mapping | Live PDF + screenshots |
|-----------|-------------|----------------|-------------|------------------|------------------------|
| HBL_DRAFT_REPORT_FORMAT_11 | template-v2 → html2canvas | Single (+ large table fixture available) | Portrait | **Verified** | **Blocked** |
| HAWB_DRAFT_REPORT_FORMAT_1 | template-v2 → html2canvas | Single | Portrait | **Verified** | **Blocked** |
| MAWB_DRAFT_REPORT_FORMAT | template-v2 → html2canvas | Single | Portrait | **Verified** | **Blocked** |
| INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA | template-v2 → html2canvas | Single | Portrait | **Verified** (totals) | **Blocked** |
| PURCHASE_INVOICE_REPORT_FORMAT_1 | template-v2 → html2canvas | Single | Portrait | **Verified** | **Blocked** |
| QUOTATION_REPORT_FORMAT_1 | template-v2 → html2canvas | Single | Portrait | **Verified** | **Blocked** |
| ARRIVAL_NOTICE_REPORT_FORMAT_1_CARGO_ARRIVAL_NOTICE_JASPER | html2canvas default + print-CSS pilot HTML | Multi-row / long description fixture | Portrait | **Verified** HTML `@page` + repeating `thead` | **Blocked** (no printed PDF / screenshots) |
| ARRIVAL_NOTICE_REPORT_FORMAT_11 | JSON alias → Format-1 shell | — | Portrait | **Verified** alias | **Blocked** |
| DELIVERY_ORDER_REPORT_FORMAT_10 | template-v2 → html2canvas | Single | Portrait | **Verified** | **Blocked** |
| CARGO_MANIFEST_REPORT_FORMAT | template-v2 → html2canvas | Large table | Landscape | **Verified** marker | **Blocked** |
| PAYMENT_VOUCHER_REPORT_FORMAT_1 | template-v2 → html2canvas | Single | Portrait | **Verified** | **Blocked** |
| RECEIPT_VOUCHER_REPORT_FORMAT_1 | template-v2 → html2canvas | Single (USD) | Portrait | **Verified** | **Blocked** |
| STATEMENT_OF_ACCOUNTS_REPORT_FORMAT | template-v2 → html2canvas | Empty balances | Portrait | **Verified** | **Blocked** |
| PROFIT_AND_LOSS_REPORT_FORMAT_1_LANDSCAPE | template-v2 → html2canvas | Statement | Landscape | **Verified** | **Blocked** |
| DAILY_STATUS_REPORT_FORMAT_1 | template-v2 → html2canvas | Ops list | Landscape | **Verified** | **Blocked** |

## Visual checklist (required for live pass)

| Check | html2canvas | Arrival print-CSS | This pass |
|-------|-------------|-------------------|-----------|
| Footer overlap | Inspect PDF pages | Inspect print preview / PDF | **Untested** |
| Header alignment | Inspect | Inspect | **Untested** |
| Page breaks | Inspect multi-page | `@page` + avoid-break CSS in HTML only | HTML **verified**; paint **untested** |
| Repeating table headers | Often weak in raster | `thead { display: table-header-group }` in pilot HTML | HTML **verified**; paint **untested** |
| Clipped content | Inspect | Inspect | **Untested** |
| Orientation | Capture options / chrome | `@page { size: A4 portrait }` | Markup orientation attrs **verified**; PDF **untested** |
| Missing fonts | Inspect glyphs | Browser print fonts | **Untested** |
| Missing logos | Inspect | Inspect | **Untested** (fixtures omit live logo URLs) |
| Text readability | Inspect | Inspect | **Untested** |

## Arrival Notice: print-CSS vs html2canvas

| Aspect | Evidence |
|--------|----------|
| Pilot HTML includes A4 portrait `@page` | `phase7DocumentFidelity.test.ts` |
| Pilot HTML includes repeating `thead` rule | same |
| Pilot HTML includes footer class `an-pilot-footer` | same |
| In-app Generate still defaults to html2canvas | `ArrivalNoticeFormatAutoPdf` / catalog path; pilot is additive |
| Side-by-side printed PDF comparison | **Blocked** |

## Failures (live PDF)

| Report ID | File | Evidence | Severity | Proposed correction |
|-----------|------|----------|----------|---------------------|
| *(fleet)* | `engines/pdf/captureReactDocumentPdf.ts` | No browser harness in this Phase 7 run → no page screenshots | high (process) | Add Playwright (or manual) matrix: fixture → PDF → per-page PNG; attach under `qa/artifacts/` |
| ARRIVAL_NOTICE_* | `engines/pdf/printCssPilot.ts` | HTML unit-only; no print-to-PDF artifact | medium | Optional browser print of pilot HTML vs html2canvas capture for Format-1 Jasper |

## How to complete live verification (local, not done here)

1. Serve the app; open Report Catalog Generate for each report ID above with `FIXTURE_BY_REPORT` payloads (or real sanitized job/invoice entities).
2. Download PDF via existing html2canvas path; open in a PDF viewer; screenshot each page.
3. For Arrival Notice, also open print-CSS pilot HTML and print to PDF; compare page 1–N for footer/header/table header behavior.
4. Record pass/fail per checklist row into this file and `PHASE7_REGRESSION_RESULTS.json` under `livePdf`.

Until that evidence exists, live PDF results remain **blocked**, not passed.
