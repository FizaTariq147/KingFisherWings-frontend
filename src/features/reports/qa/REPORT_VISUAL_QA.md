# REPORT_VISUAL_QA — Template-v2 & legacy visual differentiation

**Phase:** 6  
**Evidence date:** 2026-11-11  
**Method:** Static inspection of React templates + `generateCatalogLayoutPdf` routing + JSON shell usage. No pixel screenshot capture in this pass (no browser automation run).

## Verdict

Most shipping templates (HBL, HAWB, delivery order, manifest, ops list) have **recognizable** structure beyond a title change. Commercial siblings (invoice / purchase / quotation / voucher) and ledger / financial statement are **not** fully distinct. Production readiness is **not** claimed for visual Fresa fidelity.

## Family matrix

| Family | Distinct structure? | Evidence path | Severity if weak |
|--------|---------------------|---------------|------------------|
| HBL | Yes vs invoice; **variants mostly color-only in v2** | `templates/hbl/HblTemplateDocument.tsx` | medium (classic family docs are stronger) |
| HAWB | Yes vs invoice; draft vs original diverge | `templates/hawb/HawbTemplateDocument.tsx` | low within verified CDN samples |
| MAWB | **No** — same as HAWB | `engines/preview/renderTemplateV2Pdf.ts` (`case 'mawb'`) | medium |
| Commercial invoice | Yes vs shipping | `templates/invoice/InvoiceTemplateDocument.tsx` | — |
| Purchase invoice | **No** — `purchase` boolean recolors commercial | same file | medium |
| Arrival notice | Mild (callout ± charges) | `templates/arrivalNotice/ArrivalNoticeTemplateDocument.tsx` | medium vs HBL |
| Delivery order | **Yes** — release banner, no charges | `templates/deliveryOrder/DeliveryOrderTemplateDocument.tsx` | — |
| Cargo manifest | **Yes** — landscape dense table | `templates/manifest/ManifestTemplateDocument.tsx` | weak vs ops list |
| Voucher | Almost no vs invoice | `templates/voucher/VoucherTemplateDocument.tsx` | medium |
| Customer ledger | Yes vs invoice; weak vs FS | `templates/ledger/LedgerTemplateDocument.tsx` | — |
| Financial statement | Almost no vs ledger | `templates/financialStatement/FinancialStatementTemplateDocument.tsx` | medium |
| Operational list | Yes vs invoice; weak vs manifest | `templates/opsList/OpsListTemplateDocument.tsx` | — |
| Quotation | **No** — invoice clone | `templates/quotation/QuotationTemplateDocument.tsx` | medium |

## Generic collapse engines

1. Shared kit: `BrandHeader`, `PartyTriple`, `ChargesTable` (always titled “Charges”), `DataTable` — `templates/shared/`.
2. Legacy JSON: `JsonInvoiceLayoutRenderer` + `chargeTable` for ops lists, leftover, later AN/DO rows.
3. Catalogue browse for HBL/HAWB prefers **CDN samples** (distinct); v2 is fallback.
4. Leftover HBL JSON uses invoice blocks, not `hblBlShell`.

## Intentional sharing (not errors)

- Many HBL Format-N codes → Format-11 / FG shells via `hblFormatUiLayouts.ts`.
- HAWB Format-3…N → base draft sample + stamp (`sampleIsFallback`).
- Many registry codes → one BE pack shell (`sea.hbl_draft`, `air.hawb_draft`).

## Failures (visual)

| Report ID | File | Issue | Severity | Recommended correction |
|-----------|------|-------|----------|------------------------|
| MAWB_* | `renderTemplateV2Pdf.ts` | Renders HAWB template | medium | Dedicated MAWB chrome (follow-up) |
| purchase_invoice | `InvoiceTemplateDocument.tsx` | Color/subtitle only | medium | Follow-up structure; not Phase-6 rewrite |
| quotation | `QuotationTemplateDocument.tsx` | Invoice DNA | medium | Follow-up |
| voucher | `VoucherTemplateDocument.tsx` | Charges table = invoice | medium | Journal Dr/Cr face (follow-up) |
| financial_statement | `FinancialStatementTemplateDocument.tsx` | Same VM as ledger | medium | Separate statement mapping when API exists |
| HBL v2 variants | `HblTemplateDocument.tsx` | Accent-only variants | low | Prefer classic family / samples for variant QA |

## Introduced by recent modernization?

Visual template-v2 debt: **yes** (new templates).  
CDN sample preference for distinctness: **yes**.  
JSON charge-table collapse: **pre-existing**.
