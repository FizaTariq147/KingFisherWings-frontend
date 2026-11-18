# Full-run summary (Round 8)

Nothing is accepted. Thresholds are unchanged except for one new fail rule: raster fails when the masked fraction exceeds 25%. Geometry 0.1 pt, text 0.5 pt, and raster 0.5% are unchanged.

Source: `reports/full-run.csv` after remesure. Excel and the two scanned files stay out of scope.

## Counts by class

| Class | Documents | Instances |
|---|---|---|
| raster | 208 | 208 |
| static position or string | 15 | 318 |
| dynamic position or string | 9 | 11 |
| geometry mismatch | 3 | 3 |

Pagination failures from Round 7 are gone after checker fixes (the four references failed their own rules).

Verified: 399. Clean on all layers: **188**.

| Layer | Pass | Fail |
|---|---|---|
| page | 399 | 0 |
| geometry | 396 | 3 |
| static | 384 | 15 |
| dynamic | 390 | 9 |
| raster | 191 | 208 |

Pagination: 79 multi-page pass, 320 single-page.

## Raster split

Of the raster failures with metrics:

| Bucket | Meaning | Count |
|---|---|---|
| R1 | non-text ratio > 0.5% | 48 |
| R2 | non-text ≤ 0.5% (text-driven; T unset) | 157 |

## Masked fraction

Eight documents exceed 15% (all also exceed 25% and fail raster):

| Code | Masked fraction |
|---|---|
| HBL_DRAFT_REPORT_FORMAT_127 | 0.8887 |
| HBL_DRAFT_REPORT_FORMAT_130 | 0.8887 |
| HBL_DRAFT_REPORT_FORMAT_118 | 0.8791 |
| HBL_DRAFT_REPORT_FORMAT_132 | 0.8685 |
| FG_HBL_FORMAT10_RPM_REF_472 | 0.8680 |
| HBL_DRAFT_REPORT_FORMAT_122 | 0.8643 |
| MAWB_DRAFT_REPORT_FORMAT | 0.8402 |
| HBL_DRAFT_REPORT_FORMAT_129 | 0.7798 |

`HBL_DRAFT_REPORT_FORMAT_122`: the logo slot is a near-full-page form background image (554×780.1 pt) also classed as decorative Fresa branding. That slot is applied on every page, ~5.64M masked pixels. Output draws nothing there.

## 20 slowest or riskiest causes

1. Near-full-page images taken as the logo slot (masked fraction > 25%).
2. Tall left-edge “decorative branding” strips not drawn (R1 dominant).
3. Poppler substituting Helvetica for non-embedded ArialUnicodeMS.
4. Embedded Arabic CID ArialUnicodeMS drawn as Arimo without Arabic outlines.
5. Arabic presentation-form strings failing position/string checks.
6. Dynamic addresses containing Arabic comma `،` failing position/string.
7. Near-white 2 pt filled rects missing on round-trip (`#fbfbfb` / `#f9f9f9`).
8. Short projecting-cap rules missing (Advance Shipping Note).
9. Render-mode 2 (fill+stroke) titles with high text blur.
10. High text-ink (>1) where differing pixels exceed reference ink.
11. Non-text vector mismatches from undrawn form artwork.
12. Color-filled backgrounds classified as “other” in heatmaps.
13. Branding-mask pixel counts dominated by mis-slotted form images.
14. Default overflow mode `clip` cutting long live values.
15. Number fields shrunk below 4 pt under overflow stress.
16. Wrap hitting maxLines on HBL Draft 15 under overflow.
17. Static Arabic bilingual labels (15 docs / 318 spans).
18. Geometry hairlines and micro-fills (3 docs).
19. Unmasked non-letterhead images still compared on the full page.
20. Single-page pagination invariants still false for many forms (not a failure class).

## Artifacts

- `reports/full-run.csv` — masked_fraction column added
- `reports/rehearsal-raster.csv` — masked_fraction column added
- `reports/output/round8/r1/` — 10 worst R1 heatmaps
- `reports/output/round8/calibration/` — 20 side-by-side crops
- `reports/output/round8/live/` — overflow renders
- `reports/output/round8/arabic.json` — Arabic font report
