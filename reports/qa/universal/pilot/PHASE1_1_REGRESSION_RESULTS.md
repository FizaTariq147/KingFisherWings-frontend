# Phase 1.1 — Regression Results

Command: `npm run report:pilot-phase1`  
Timestamp: 2026-11-26T09:22:45.723Z (from regenerated `PILOT_FINDINGS.md`)

## Headline comparison

| Metric | Phase 1 baseline | Phase 1.1 after fixes |
|---|---:|---:|
| Codes | 29 | 29 |
| Generations | 65 | 65 |
| Generation OK | 65 | 65 |
| GENERATION_FAILED | 0 | 0 |
| FAIL | 7 | **0** |
| WARNING | 18 | **22** |
| REVIEW_REQUIRED | 13 | **16** |

WARNING/REVIEW counts rose because former FAILs (Formats 2/14/15/17 and long_party 4/8) now land in WARNING or REVIEW after leak/assertion fixes — not because new defects were introduced as FAIL.

## Verification checklist

| Check | Result |
|---|---|
| All 65 generations succeed | **Pass** |
| Format 2/14/15/17 Fresa identity leaks resolved | **Pass** (`fresaIdentityHits: []` on regenerated PDFs) |
| Long-party Formats 4 & 8 behave correctly | **Pass** (capacity-fitting stem present; no FAIL) |
| No previously passing report regresses to FAIL | **Pass** (FAIL empty) |
| Business data mappings intact (Zoyan / LIVE parties / long stem) | **Pass** |
| Generation entry points unchanged | **Pass** (`generateHawbOfficialPdf` / `generateOfficialMeasuredPdf`) |

## Remaining FAIL

**None.**

## Remaining WARNING (22)

| Code | Fixture | Dominant codes |
|---|---|---|
| HAWB_DRAFT_REPORT_FORMAT_1 | base | text_bbox_collision |
| HAWB_DRAFT_REPORT_FORMAT_1 | long_party | text_outside_page |
| HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_1 | base / long_party | region_overflow_heuristic |
| HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_2 | base / long_party | text_bbox_collision, region_overflow_heuristic |
| INVOICE_REPORT_FORMAT_1 | base / long_party | text_outside_page, text_bbox_collision |
| INVOICE_REPORT_FORMAT_2 | base / long_party | text_outside_page, text_bbox_collision |
| INVOICE_REPORT_FORMAT_4 | long_party | text_outside_page |
| INVOICE_REPORT_FORMAT_5 | base | text_outside_page, text_bbox_collision |
| INVOICE_REPORT_FORMAT_6 | base | text_outside_page, text_bbox_collision |
| INVOICE_REPORT_FORMAT_8 | base / long_party | text_bbox_collision (± text_outside_page) |
| INVOICE_REPORT_FORMAT_18 | base | text_outside_page, text_bbox_collision |
| INVOICE_REPORT_FORMAT_19 | base | text_outside_page, text_bbox_collision |
| INVOICE_REPORT_FORMAT_20 | base | text_outside_page, text_bbox_collision |
| INVOICE_REPORT_FORMAT_21 | base | text_bbox_collision |
| PROFORMA_INVOICE_ALL_CHARGES_REPORT_FORMAT | base | text_outside_page, text_bbox_collision |
| PROFORMA_INVOICE_REPORT_FORMAT_1_… | base | text_outside_page, text_bbox_collision |
| PROFORMA_INVOICE_REPORT_FORMAT_2_… | base | text_outside_page, text_bbox_collision |

Classification: collision/overflow heuristics and long chrome — **not** auto-PASS.

## Remaining REVIEW_REQUIRED (16)

| Code | Fixture | Driver |
|---|---|---|
| HAWB_DRAFT_REPORT_FORMAT | base / long_party | masked raster residual / visualInspectionRequired |
| HAWB_DRAFT_REPORT_FORMAT_2 | base / long_party | masked raster residual |
| INVOICE_REPORT_FORMAT_3 | base | visual review (diff ~20%) |
| INVOICE_REPORT_FORMAT_4 | base | visual review |
| INVOICE_REPORT_FORMAT_7 | base | visual review |
| INVOICE_REPORT_FORMAT_9 … 13 | base | visual review |
| INVOICE_REPORT_FORMAT_14 | base | visual review (post-leak fix) |
| INVOICE_REPORT_FORMAT_15 | base | visual review (post-leak fix) |
| INVOICE_REPORT_FORMAT_16 | base | visual review |
| INVOICE_REPORT_FORMAT_17 | base | visual review (post-leak fix) |

## Artifacts refreshed

- `PILOT_FINDINGS.md` / `PILOT_FINDINGS.json`
- `PILOT_LAYOUT_QA_RESULTS.json`
- `PILOT_VISUAL_COMPARISON.md`
- `PILOT_GENERATION_RESULTS.json`
- `generated/*.pdf`

## Stop

Phase 1.1 complete. Do not expand pilot families without approval.
