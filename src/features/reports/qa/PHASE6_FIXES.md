# Phase 6 — Confirmed defect fixes applied

Audit-first. Only confirmed defects were patched. Architecture was not redesigned.

| Defect | Severity | Recent? | Fix |
|--------|----------|---------|-----|
| HAWB CDN sample used when `entityBound` | critical | yes | Skip sample when entity bound (`preferOfficialSamplePdf`, `generateCatalogLayoutPdf`, `HawbFormatAutoPdf`, Generate panel) |
| Arrival Format-11+ no alias | high | no | Alias to Format-1 in `arrivalNoticeFormatUiLayouts.ts` (intentional sharing, same pattern as HBL/HAWB) |
| Ledger opening/closing invented from cells | high | yes | Stop inventing; only pass `data.total` as closing when present |
| Invoice VAT invented when entityBound | high | no | Do not apply layout `vatRate` when entityBound |
| DO `deliveryInstructions` ← commodity | medium | yes | Removed inventing mapping |
| purchase_invoice `templateType` | medium | yes | `invoice.purchase` in enrichReportMeta |
| Original packs stamped as draft | medium | no | Registry JSON + generated: `sea.hbl_original` / `air.hawb_final` (3 codes) |

## Not fixed (documented only)

- Purchase/quotation/voucher visual DNA collapse (follow-up, not rewrite)
- MAWB → HAWB template (follow-up)
- html2canvas multi-page / selectable text (pilot only; no fleet migration)
- Discount field still requires API to supply `discount` on PDF data
- Orphan JSON codes not in 852 registry (pending confirmation)

## Production readiness

**Not claimed.** Critical sample/live-data path is fixed in code; full browser PDF matrix and live backend fixture verification were not executed in this Phase 6 pass.
