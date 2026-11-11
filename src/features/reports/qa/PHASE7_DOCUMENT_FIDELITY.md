# Phase 7 — Document Fidelity

**Generated:** 2026-11-11  
**Scope:** MAWB/HAWB separation; purchase invoice, quotation, voucher layouts; fixture-backed markup verification.  
**Constraint:** Architecture from Phases 0–6 preserved. No plan-file edits. No backend contract changes. No invented financial/business fields.

## Verdict

Document-structure work for Tasks 1–2 is **implemented and unit-verified** (static React markup).  
**Production readiness is not claimed** — live html2canvas PDF capture and page screenshots remain **blocked** in this Node/vitest pass (see `PHASE7_LIVE_PDF_TEST_RESULTS.md`).

## Audit → implement (confirmed defects only)

| Finding | Severity | Action |
|---------|----------|--------|
| MAWB routed through HAWB template | high | Distinct `MawbTemplateDocument` + `mapToMawbViewModel` (`mawb.standard`) |
| Purchase / quotation / voucher shared commercial-invoice DNA | medium | Dedicated templates: `purchase_invoice.ap`, `quotation.offer`, `voucher.payment\|receipt\|journal` |
| Arrival Format-11+ alias target `ARRIVAL_NOTICE_REPORT_FORMAT_1` missing from JSON store | high | Alias to real Format-1 shell `ARRIVAL_NOTICE_REPORT_FORMAT_1_CARGO_ARRIVAL_NOTICE_JASPER` |

No unnecessary JSON migration. No report formats removed.

## Task 1 — MAWB ≠ HAWB

| Aspect | HAWB | MAWB |
|--------|------|------|
| Template | `templates/hawb/HawbTemplateDocument.tsx` | `templates/mawb/MawbTemplateDocument.tsx` |
| Marker | `data-report-template="hawb.*"` | `data-report-template="mawb.standard"` |
| Mapping | `mapToHawbViewModel` / `job.hawb` | `mapToMawbViewModel` (consolidator + house-ref table; airline from `vesselFlight` slot) |
| Shared | `BrandHeader`, `DocPageChrome`, `DataTable`, `KeyValueGrid`, `SignatureBlock` only | Same shared primitives; document chrome is master/consolidator, not IATA house copy-set |

Evidence: `phase7DocumentFidelity.test.ts` (MAWB vs HAWB markup), `phase6Regression.test.ts` (template marker).

**Not verified against a Fresa CDN MAWB sample PDF** — registry mapping notes internal design; no claim of pixel/Fresa-identical MAWB.

## Task 2 — Purchase / Quotation / Voucher

| Family | Template marker | Distinct face |
|--------|-----------------|---------------|
| Purchase invoice | `purchase_invoice.ap` | Vendor / AP; not bill-to commercial invoice |
| Quotation | `quotation.offer` | Offer + validity chrome; “not a tax invoice” |
| Payment voucher | `voucher.payment` | Dr/Cr accounting entry face |
| Receipt voucher | `voucher.receipt` | Receipt band + Dr/Cr |

Data contracts and totals remain pass-through from `InvoiceFormatPdfData` (no layout-default recomputation).

## Fixture coverage (markup)

Sanitized fixtures: `qa/fixtures/sanitizedCatalogPdfFixtures.ts` (backend-shaped field names; demo values only).

| Report ID | Orientation / notes | Markup verified |
|-----------|---------------------|-----------------|
| `HBL_DRAFT_REPORT_FORMAT_11` | Portrait | Yes |
| `HAWB_DRAFT_REPORT_FORMAT_1` | Portrait | Yes (vs MAWB) |
| `MAWB_DRAFT_REPORT_FORMAT` | Portrait | Yes |
| `INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA` | Portrait | Financial suite |
| `PURCHASE_INVOICE_REPORT_FORMAT_1` | Portrait | Yes |
| `QUOTATION_REPORT_FORMAT_1` | Portrait | Yes |
| `ARRIVAL_NOTICE_REPORT_FORMAT_1_CARGO_ARRIVAL_NOTICE_JASPER` | Portrait + print-CSS HTML | Yes |
| `ARRIVAL_NOTICE_REPORT_FORMAT_11` | Alias layout | Yes (alias) |
| `DELIVERY_ORDER_REPORT_FORMAT_10` | Portrait | Yes |
| `CARGO_MANIFEST_REPORT_FORMAT` | Landscape | Yes |
| `PAYMENT_VOUCHER_REPORT_FORMAT_1` | Portrait | Yes |
| `RECEIPT_VOUCHER_REPORT_FORMAT_1` | Portrait (USD) | Yes |
| `STATEMENT_OF_ACCOUNTS_REPORT_FORMAT` | Empty balances | Yes |
| `PROFIT_AND_LOSS_REPORT_FORMAT_1_LANDSCAPE` | Landscape | Yes |
| `DAILY_STATUS_REPORT_FORMAT_1` | Landscape ops list | Yes |

Also exercised: long description / large table (`fixtureArrivalBound`), missing optional (`fixtureMissingOptional`), empty dataset (`fixtureEmptyDataset`) — present in fixture module; empty/missing mapped in financial + DO regression paths.

## Failures (document fidelity)

| Report ID | File | Evidence | Severity | Proposed correction |
|-----------|------|----------|----------|---------------------|
| `ARRIVAL_NOTICE_REPORT_FORMAT_11` (+ bare `FORMAT_N`) | `data/arrivalNoticeFormatUiLayouts.ts` | Alias resolved to non-existent `ARRIVAL_NOTICE_REPORT_FORMAT_1`; `getArrivalNoticeFormatUiLayout` returned `undefined` | high | **Fixed:** resolve to `ARRIVAL_NOTICE_REPORT_FORMAT_1_CARGO_ARRIVAL_NOTICE_JASPER` |

## Blocked / untested (fidelity)

- Pixel comparison to Fresa sample PDFs for MAWB / purchase / quotation / voucher.
- Browser-rendered page screenshots of template-v2 documents.
- Live entity payloads from production/staging APIs (fixtures are sanitized shapes only).

## Test command

```bash
npx vitest run src/features/reports/qa
```

**Result (this pass):** 21/21 passed (phase6Regression + phase7DocumentFidelity + phase7FinancialValidation).
