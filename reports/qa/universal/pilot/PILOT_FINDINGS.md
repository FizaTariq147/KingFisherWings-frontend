# Phase 1 Pilot Findings

Generated at: 2026-11-27T04:56:09.288Z

## Phase 1.1 remediation (this lineage)

- Phase 1 baseline FAILs: **7 → 0** (invoice Formats 2/14/15/17 AL NASER; Formats 4/8 Trading Division).
- Letterhead wrap restores extractable `Trading Division` on Formats 2/4/8 long_party.
- Format 1 long_party suffix remains **unresolved** (narrow slot) — stem only.
- See `PHASE1_1_DEFECT_TRIAGE.md`, `PHASE1_1_FIX_EVIDENCE.md`, `PHASE1_1_REGRESSION_RESULTS.md`.
- Remaining: **FAIL 0 · WARNING 22 · REVIEW_REQUIRED 16 · GENERATION_FAILED 0**.

## Summary

| Metric | Value |
|---|---:|
| Codes in inventory | 29 |
| Generation attempts | 65 |
| Generation OK | 65 |
| Generation failed | 0 |
| Verdict REVIEW_REQUIRED | 16 |
| Verdict WARNING | 22 |
| Verdict FAIL | 0 |

## Acceptance criteria check

1. Actual generation paths invoked: **yes** (`generateHawbOfficialPdf` / `generateOfficialMeasuredPdf`).
2. PDFs inspected automatically: **yes** (pdfjs layout QA).
3. Known problems detected or REVIEW: **yes** (collisions as warnings; images/barcodes → review; visual diff → review/fail).
4. Dynamic data false failures: mitigated via letterhead/footer masks + no auto-PASS on raster.
5. Reference comparison difference images: where pdftoppm + refs available (see PILOT_VISUAL_COMPARISON.md).
6. Production generators unchanged: **yes** (pilot only writes under reports/qa/universal/pilot/).

## Per-result verdicts (base / long_party)

| Code | Fixture | Verdict |
|---|---|---|
| HAWB_DRAFT_REPORT_FORMAT | base | REVIEW_REQUIRED |
| HAWB_DRAFT_REPORT_FORMAT | long_party | REVIEW_REQUIRED |
| HAWB_DRAFT_REPORT_FORMAT_1 | base | WARNING |
| HAWB_DRAFT_REPORT_FORMAT_1 | long_party | WARNING |
| HAWB_DRAFT_REPORT_FORMAT_2 | base | REVIEW_REQUIRED |
| HAWB_DRAFT_REPORT_FORMAT_2 | long_party | REVIEW_REQUIRED |
| HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_1 | base | WARNING |
| HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_1 | long_party | WARNING |
| HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_2 | base | WARNING |
| HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_2 | long_party | WARNING |
| INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA | base | WARNING |
| INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA | long_party | WARNING |
| INVOICE_REPORT_FORMAT_2_TAX_INVOICE_INDIA | base | WARNING |
| INVOICE_REPORT_FORMAT_2_TAX_INVOICE_INDIA | long_party | WARNING |
| INVOICE_REPORT_FORMAT_3_SUMMARY_INVOICE | base | REVIEW_REQUIRED |
| INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE | base | REVIEW_REQUIRED |
| INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE | long_party | WARNING |
| INVOICE_REPORT_FORMAT_5_TAX_INVOICE_INDIA | base | WARNING |
| INVOICE_REPORT_FORMAT_6_SIMPLE_INVOICE_INDIA | base | WARNING |
| INVOICE_REPORT_FORMAT_7_SIMPLE_INVOICE | base | REVIEW_REQUIRED |
| INVOICE_REPORT_FORMAT_8_STANDARD_INVOICE_ARABIC | base | WARNING |
| INVOICE_REPORT_FORMAT_8_STANDARD_INVOICE_ARABIC | long_party | WARNING |
| INVOICE_REPORT_FORMAT_9_STANDARD_INVOICE_USA | base | REVIEW_REQUIRED |
| INVOICE_REPORT_FORMAT_10_STANDARD_INVOICE | base | REVIEW_REQUIRED |
| INVOICE_REPORT_FORMAT_11_STANDARD_INVOICE_LAND | base | REVIEW_REQUIRED |
| INVOICE_REPORT_FORMAT_12_STANDARD_INVOICE_PREPRINTED | base | REVIEW_REQUIRED |
| INVOICE_REPORT_FORMAT_13_STANDARD_INVOICE_USA | base | REVIEW_REQUIRED |
| INVOICE_REPORT_FORMAT_14_INVOICE | base | REVIEW_REQUIRED |
| INVOICE_REPORT_FORMAT_15_INVOICE_FCY | base | REVIEW_REQUIRED |
| INVOICE_REPORT_FORMAT_16_STANDARD_TAX_INVOICE_PREPRINTED | base | REVIEW_REQUIRED |
| INVOICE_REPORT_FORMAT_17_INVOICE_JASPER | base | REVIEW_REQUIRED |
| INVOICE_REPORT_FORMAT_18_LAND_FREIGHT_TRANSPORTATION_INVOICE | base | WARNING |
| INVOICE_REPORT_FORMAT_19_DEBIT_NOTE_VIETNAM | base | WARNING |
| INVOICE_REPORT_FORMAT_20_TAX_INVOICE_INDIA | base | WARNING |
| INVOICE_REPORT_FORMAT_21_WAREHOUSE_INVOICE | base | WARNING |
| PROFORMA_INVOICE_ALL_CHARGES_REPORT_FORMAT | base | WARNING |
| PROFORMA_INVOICE_REPORT_FORMAT_1_PROFORMA_INVOICE_ALL_CHARGES | base | WARNING |
| PROFORMA_INVOICE_REPORT_FORMAT_2_PROFORMA_INVOICE_ALL_CHARGES | base | WARNING |

## Next

Stop for approval before expanding beyond HAWB official five + measured invoices.
