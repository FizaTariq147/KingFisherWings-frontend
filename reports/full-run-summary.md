# Full-run summary

Nothing is accepted. Thresholds, masks, and status values are unchanged. Source: `reports/full-run-track-a-last.csv` (Track A4). Excel and the two scanned files stay out of scope.

399 document rows. 391 unique codes. Duplicate census rows: `FG_DELIVERY_ORDER_FOR_TRUCKER` and `DELIVERY_CONFIRMATION_OSA_REPORT_FORMAT`, four rows each.

## Counts by checker class

| Class | Rows |
|---|---:|
| Clean | 343 |
| Raster R1 | 31 |
| Raster R2 | 7 |
| Static width | 13 |
| Static position or string | 11 |
| Dynamic width | 4 |
| Dynamic position or string | 1 |
| Geometry-only raster | 10 |

A row can carry more than one class. Page failures: 0. Geometry mismatches: 0. Pagination failures: 0.

Before this run (Track A3, `reports/full-run-track-a-before-a4.csv`): 399 documents, clean 336, R1 41, R2 7, static position 11. Static width 13, dynamic width 4, and dynamic position 1 were already at those counts. Geometry-only raster was not measured.

No document gained raster R1. No document that passed an existing layer failed that layer. Three previously clean documents fail only the geometry-only raster.

## Counts by cause

These overlap. The list is `reports/exceptions.md`.

| Cause | Documents |
|---|---:|
| Arabic joins | 13 |
| Arabic-comma address widths | 5 |
| Rule antialiasing with matching coordinates | 10 |
| Text-ink above T | 7 |
| Form background overlay | 18 |
| Other | 24 |

The 18 form-background documents pass every layer. The pass uses a compare-time copy of the reference form. They are not in the 56 failing rows.

Of the 10 geometry-only failures, the masked raster still passes for `ADVANCE_SHIPPING_NOTE_FORMAT_1`, `FG_STANDARD_INVOICE_TANZANIA_RPM_REF_1431`, and `FG_TAX_INVOICE_INDIA_FORMAT4_RPM_REF_1007`. The other seven also fail raster R1.

## Checker changes

Items 1–8 were already shipped. Items 9 and 10 shipped in Track A4 and were not changed for this summary:

9. Vector geometry compares in displayed coordinates, unrounded, tolerance 0.1 pt.
10. Additive geometry-only raster at 150 dpi, fail above 0.5% of page pixels. The masked raster rule is unchanged.
