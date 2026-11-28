# Phase 1.2.1 — Reference source verification

All four review targets have a **verified pinned reference** under `reports/references/files/`. No unrelated PDF was substituted.

| Label | Report code | Fixture | Generated PDF | Reference PDF | Verified | Source of path |
|---|---|---|---|---|---|---|
| FORMAT3 | `INVOICE_REPORT_FORMAT_3_SUMMARY_INVOICE` | base | `reports/qa/universal/pilot/generated/INVOICE_REPORT_FORMAT_3_SUMMARY_INVOICE__base.pdf` | `reports/references/files/invoice-report-format-3-summary-invoice.pdf` | **yes** | `PILOT_VISUAL_COMPARISON.md` |
| FORMAT21 | `INVOICE_REPORT_FORMAT_21_WAREHOUSE_INVOICE` | base | `…/INVOICE_REPORT_FORMAT_21_WAREHOUSE_INVOICE__base.pdf` | `reports/references/files/invoice-report-format-21-warehouse-invoice.pdf` | **yes** | `PILOT_VISUAL_COMPARISON.md` |
| FORMAT4 | `INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE` | long_party | `…/INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE__long_party.pdf` | `reports/references/files/invoice-report-format-4-standard-tax-invoice.pdf` | **yes** | `PILOT_VISUAL_COMPARISON.md` |
| HAWB_DRAFT1 | `HAWB_DRAFT_REPORT_FORMAT_1` | long_party | `…/HAWB_DRAFT_REPORT_FORMAT_1__long_party.pdf` | `reports/references/files/hawb-draft-report-format-1.pdf` | **yes** | Pilot HAWB pin / same file as Phase 1 visual |

## Notes

- References are local pinned copies used by the Phase 1 pilot — not live CDN fetches.
- Format 4 / Draft-1 comparisons use **long_party generated** vs **base sample reference** (sample PDFs do not include the long-party fixture). Masked residual is therefore partly dynamic-content by design.
- Unavailable: none for this pack.
