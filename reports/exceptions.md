# Exceptions

Nothing in this list is accepted. Each line is a document that cannot pass a stated check without changing a threshold, a status value, or `reports/signoff.csv`. A human can approve or reject each reason.

`npm run report:signoff -- <code> <reviewer>` writes a `reports/signoff.csv` row only when every layer passes, or when the code's line in this file contains the word `approved`. No line below contains that word. The command was not run.

Counts are the 399-document runs. Before is Track A3 (`reports/full-run-track-a-before-a4.csv`). After is Track A4 (`reports/full-run-track-a-last.csv`).

| | Documents | Clean | R1 | R2 | Static position | Geometry-only raster |
|---|---:|---:|---:|---:|---:|---:|
| Before (Track A3) | 399 | 336 | 41 | 7 | 11 | not measured |
| After (Track A4) | 399 | 343 | 31 | 7 | 11 | 10 |

Static width stayed 13. Dynamic width stayed 4. Dynamic position stayed 1. Ten R1 documents became clean. Three documents that were clean now fail only the new geometry-only raster. No document that passed an existing layer failed that layer.

## Classification

56 documents still fail at least one layer. 18 more pass every layer only because a form background is copied in at compare time. Each line is one cause and one reason a person can accept or reject. No line here contains a sign-off word.

Cause counts overlap when one document fails more than one layer.

| Cause | Documents |
|---|---:|
| Arabic joins | 13 |
| Arabic-comma address widths | 5 |
| Rule antialiasing with matching coordinates | 10 |
| Text-ink above T | 7 |
| Form background overlay | 18 |
| Other | 24 |

### Arabic joins

The reference stores the PDF glyph advance. Noto Naskh's ink does not meet the next glyph, so the measured width and sometimes the next origin fall outside 0.5 pt. Scaling the glyph would hide the gap and was not done.

- INVOICE_REPORT_FORMAT_8_STANDARD_INVOICE_ARABIC — Arabic joins — static width only; raster passes (text-ink 0.1243). Title 72.5 vs 71.9 pt.
- FG_KSA_INVOICE_ARABIC_RPM_REF_1161 — Arabic joins — static width and static position. Largest interior gap 8.92 pt.
- FG_STANDARD_INVOICE_ARABIC_RPM_REF_464 — Arabic joins — static width and static position. Gap 4.3 pt.
- FG_STANDARD_INVOICE_ARABIC_OMAN_RPM_REF_747 — Arabic joins — static width and static position. Gap 2.7 pt.
- FG_STANDARD_INVOICE_ARABIC_FORMAT1_RPM_REF_939 — Arabic joins — static width and static position. Gap 3.87 pt.
- FG_STANDARD_INVOICE_ARABIC_FORMAT1_RPM_REF_941 — Arabic joins — static width and static position. Gap 3.87 pt.
- FG_STANDARD_INVOICE_ARABIC_FORMAT2_RPM_REF_1171 — Arabic joins — static width and static position. Gap 4.3 pt.
- FG_STANDARD_INVOICE_ARABIC_FORMAT3_RPM_REF_1183 — Arabic joins — static width and static position. Gap 4.3 pt.
- FG_STANDARD_INVOICE_ARABIC_FORMAT4_RPM_REF_1215 — Arabic joins — static width and static position. Gap 4.3 pt.
- FG_STANDARD_INVOICE_ARABIC_FORMAT5_RPM_REF_1385 — Arabic joins — static width and static position. Gap 4.3 pt.
- FG_STANDARD_INVOICE_ARABIC_FORMAT7_RPM_REF_1400 — Arabic joins — static width and static position. Gap 4.3 pt.
- STUFFING_REPORT_FORMAT — Arabic joins — Arabic comma width 2.6 vs 1.7 pt. This document also fails rule antialiasing and raster R1.
- FG_PROOF_OF_DELIVERY_RPM_REF_847 — Arabic joins — static width and static position on Arabic labels (one label 94.3 vs 247.1 pt). This document also fails raster R1 on a rotated page.

### Arabic-comma address widths

The address string matches after the Arabic comma is ignored, and the drawn Noto Naskh comma is about 0.8 pt shorter than the reference advance.

- CARTING_CONFIRMATION_REPORT_FORMAT — Arabic-comma address widths — dynamic width only. Masked raster passes (non-text 0.0018).
- LOADING_CONFIRMATION_REPORT_FORMAT — Arabic-comma address widths — dynamic width only. Masked raster passes (non-text 0.0024).
- PICKUP_CONFIRMATION_REPORT_FORMAT — Arabic-comma address widths — dynamic width only. Masked raster passes (non-text 0.0018).
- FREIGHT_MANIFEST_FOR_GROUPAGE_IMPORTS_LCL_REPORT_FORMAT — Arabic-comma address widths — dynamic width only. Masked raster passes (non-text 0.0029).
- STUFFING_REPORT_JASPER_REPORT_FORMAT — Arabic-comma address widths — dynamic position on the same Dubai address. This document also fails raster R1 (non-text 0.0247, text-ink 0.5979) on a rotated page.

### Rule antialiasing with matching coordinates

These ten pass the vector geometry check at 0.1 pt. The geometry-only raster, which keeps path paint and drops text and images, still differs by more than 0.5% of the page. The A4 segment list shows the same endpoints on both sides. The leftover pixels are one-pixel coverage of those rules. The 0.5% limit and the 0.1 pt tolerance were not moved.

| Document | What differs | Masked raster |
|---|---|---|
| AIR_QUOTATION_REPORT_FORMAT | Rule coverage. Masked non-text 0.0059, text-ink 0.0548. | Fails |
| ADVANCE_SHIPPING_NOTE_FORMAT_1 | Rule coverage. Masked non-text 0, text-ink 0.0769. | Passes |
| OUTSTANDING_LETTER_REPORT_FORMAT_4_OUTSTANDING_LETTER_WITH_BL_DETAILS | Rule coverage. Masked non-text 0.0081, text-ink 0.0986. | Fails |
| TRUCK_CARGO_PICKUP_REQUEST_REPORT_FORMAT | Rule coverage. Masked non-text 0.0116, text-ink 0.0964. | Fails |
| DAILY_STATUS_REPORT_FORMAT_1 | Rule coverage. Masked non-text 0.0077, text-ink 0.0365. | Fails |
| DAILY_STATUS_REPORT_FORMAT_2 | Rule coverage. Masked non-text 0.0148, text-ink 0.0251. | Fails |
| STATEMENT_OF_ACCOUNTS_REPORT_FORMAT | Rule coverage. Masked non-text 0.0078, text-ink 0.0829. | Fails |
| STUFFING_REPORT_FORMAT | Rule coverage, and the Arabic-join width above. Masked non-text 0.0055, text-ink 0.0352. | Fails |
| FG_STANDARD_INVOICE_TANZANIA_RPM_REF_1431 | Rule coverage. Masked non-text 0, text-ink 0.1055. | Passes |
| FG_TAX_INVOICE_INDIA_FORMAT4_RPM_REF_1007 | Rule coverage. Masked non-text 0, text-ink 0.1333. | Passes |

ADVANCE_SHIPPING_NOTE_FORMAT_1, FG_STANDARD_INVOICE_TANZANIA_RPM_REF_1431, and FG_TAX_INVOICE_INDIA_FORMAT4_RPM_REF_1007 were clean before this check existed. Page, vector geometry, static text, dynamic text, and the masked raster still pass.

### Text-ink above T

Non-text is at or under 0.5%. Text-ink is above T = 0.40 because the open font is heavier than the reference. Raster fails on that limit alone.

- HBL_DRAFT_REPORT_FORMAT_33 — text-ink above T — non-text 0.0019, text-ink 1.1686.
- HBL_DRAFT_REPORT_FORMAT_29 — text-ink above T — non-text 0.0036, text-ink 0.9752.
- HBL_DRAFT_REPORT_FORMAT_148 — text-ink above T — non-text 0, text-ink 0.5256.
- HBL_DRAFT_REPORT_FORMAT_151 — text-ink above T — non-text 0, text-ink 0.4765.
- HBL_DRAFT_REPORT_FORMAT_141 — text-ink above T — non-text 0, text-ink 0.4753.
- HBL_DRAFT_REPORT_FORMAT_25 — text-ink above T — non-text 0, text-ink 0.4451.
- HBL_DRAFT_REPORT_FORMAT_97 — text-ink above T — non-text 0, text-ink 0.4411.

### Form background overlay

These 18 pass page, geometry, static text, dynamic text, and raster only because the reference form background is painted under both rasters for the compare. The shipped PDF does not contain that image. Accepting the line means accepting a document that omits the preprinted form.

- FG_HBL_FORMAT10_RPM_REF_472 — form background overlay — pass depends on the compare-time copy of the reference form.
- HBL_DRAFT_REPORT_FORMAT_116 — form background overlay — pass depends on the compare-time copy of the reference form.
- HBL_DRAFT_REPORT_FORMAT_117 — form background overlay — pass depends on the compare-time copy of the reference form.
- HBL_DRAFT_REPORT_FORMAT_118 — form background overlay — pass depends on the compare-time copy of the reference form.
- HBL_DRAFT_REPORT_FORMAT_122 — form background overlay — pass depends on the compare-time copy of the reference form.
- HBL_DRAFT_REPORT_FORMAT_127 — form background overlay — pass depends on the compare-time copy of the reference form.
- HBL_DRAFT_REPORT_FORMAT_129 — form background overlay — pass depends on the compare-time copy of the reference form.
- HBL_DRAFT_REPORT_FORMAT_130 — form background overlay — pass depends on the compare-time copy of the reference form.
- HBL_DRAFT_REPORT_FORMAT_132 — form background overlay — pass depends on the compare-time copy of the reference form.
- HBL_DRAFT_REPORT_FORMAT_142 — form background overlay — pass depends on the compare-time copy of the reference form.
- HBL_DRAFT_REPORT_FORMAT_171 — form background overlay — pass depends on the compare-time copy of the reference form.
- HBL_DRAFT_REPORT_FORMAT_172 — form background overlay — pass depends on the compare-time copy of the reference form.
- HBL_DRAFT_REPORT_FORMAT_52 — form background overlay — pass depends on the compare-time copy of the reference form.
- HBL_DRAFT_REPORT_FORMAT_59 — form background overlay — pass depends on the compare-time copy of the reference form.
- HBL_DRAFT_REPORT_FORMAT_6 — form background overlay — pass depends on the compare-time copy of the reference form.
- HBL_DRAFT_REPORT_FORMAT_7 — form background overlay — pass depends on the compare-time copy of the reference form.
- HBL_DRAFT_REPORT_FORMAT_99 — form background overlay — pass depends on the compare-time copy of the reference form.
- MAWB_DRAFT_REPORT_FORMAT — form background overlay — pass depends on the compare-time copy of the reference form.

### Other

These fail raster R1. Vector geometry passes, and the geometry-only raster passes, so the extra pixels are not the rule paint. Eighteen are rotated pages: the page box matches and the leftover non-text sits outside the path layer the geometry-only check keeps. Six more are unrotated and sit just over 0.5% non-text with a passing geometry-only raster. Text-ink is also above T on most of the rotated pages; the failure class stays R1 because non-text is the first raster limit.

Rotated, geometry-only raster passes:

- INVOICE_REPORT_FORMAT_2_TAX_INVOICE_INDIA — other — non-text 0.0266, text-ink 0.5112.
- CARGO_MANIFEST_AIR_JASPER_REPORT_FORMAT — other — non-text 0.0196, text-ink 0.7115.
- CARGO_MANIFEST_AIR_LC_JASPER_REPORT_FORMAT — other — non-text 0.0188, text-ink 0.5265.
- PROFIT_AND_LOSS_REPORT_FORMAT_1_LANDSCAPE — other — non-text 0.0152, text-ink 0.6208.
- PROFIT_AND_LOSS_REPORT_FORMAT_3_SUMMARY_PERIODWISE — other — non-text 0.0184, text-ink 0.4086.
- CARGO_MANIFEST_REPORT_FORMAT — other — non-text 0.0313, text-ink 0.6616.
- CONTAINER_LOAD_PLAN_REPORT_FORMAT — other — non-text 0.0287, text-ink 0.5859.
- CONTAINER_OUTTURN_REPORT_FORMAT — other — non-text 0.0255, text-ink 0.529.
- FREIGHT_MANIFEST_LCL_EXPORTS_REPORT_FORMAT — other — non-text 0.0314, text-ink 0.6433.
- OUTSTANDING_LETTER_REPORT_FORMAT_2_OUTSTANDING_LETTER_JASPER — other — non-text 0.0245, text-ink 0.4408.
- AP_AGING_SUMMARY_REPORT_FORMAT — other — non-text 0.0114, text-ink 0.3754 (under T).
- AR_AGING_SUMMARY_REPORT_FORMAT — other — non-text 0.0162, text-ink 0.5259.
- GL_LISTING_SORT_BY_CUSTOMER_CODE_VOUCHER_REPORT_FORMAT — other — non-text 0.0338, text-ink 0.5605.
- GL_REPORT_VOUCHER_REPORT_FORMAT — other — non-text 0.0191, text-ink 0.5523.
- STUFFING_REPORT_JASPER_REPORT_FORMAT — other — also listed under Arabic-comma address widths. Non-text 0.0247, text-ink 0.5979.
- FG_TAX_INVOICE_INDIA_RPM_REF_237 — other — non-text 0.0259, text-ink 0.531.
- FG_TAX_INVOICE_INDIA_FORMAT1_RPM_REF_796 — other — non-text 0.019, text-ink 0.5588.
- FG_PROOF_OF_DELIVERY_RPM_REF_847 — other — also listed under Arabic joins. Non-text 0.0257, text-ink 0.711.

Unrotated, geometry-only raster passes, non-text just over 0.5%:

- ARRIVAL_INFORMATION_RPM_REF_839 — other — non-text 0.0055, text-ink 0.3961.
- CARGO_ARRIVAL_NOTICE_AIR_RPM_REF_49 — other — non-text 0.0059, text-ink 0.3645.
- CARGO_ARRIVAL_NOTICE_SEA_RPM_REF_27 — other — non-text 0.0059, text-ink 0.3517.
- CARGO_ARRIVAL_NOTICE_SEA_FORMAT2_RPM_REF_592 — other — non-text 0.0057, text-ink 0.3718.
- CARGO_ARRIVAL_NOTICE_SEA_FORMAT_3_RPM_REF_1376 — other — non-text 0.0056, text-ink 0.3604.
- HBL_DRAFT_REPORT_FORMAT_36 — other — non-text 0.0093, text-ink 0.7205.


## Arabic glyphs

Each presentation-form glyph is drawn at the reference x, using that glyph's own advance. There is no uniform spacing and no horizontal scale. Joins break on all 12 documents: the next glyph starts after the reference advance, and Noto Naskh's drawn ink does not meet the previous glyph. Crops are `reports/output/track-a2/arabic/<code>-ref.png` and `-out.png`. Widths are in `reports/output/track-a2/arabic/widths.json`.

| Document | Max interior gap | Width misses | Also |
|---|---:|---:|---|
| INVOICE_REPORT_FORMAT_8_STANDARD_INVOICE_ARABIC | 4.3 pt | title 72.5 vs 71.9; سعر 12.3 vs 11.5 | position cleared on this run |
| FG_KSA_INVOICE_ARABIC_RPM_REF_1161 | 8.92 pt | title 72.5 vs 71.9, plus date labels | static position |
| FG_STANDARD_INVOICE_ARABIC_RPM_REF_464 | 4.3 pt | outside 0.5 pt | static position |
| FG_STANDARD_INVOICE_ARABIC_FORMAT1_RPM_REF_939 | 3.87 pt | outside 0.5 pt | position failure added on this run |
| FG_STANDARD_INVOICE_ARABIC_FORMAT1_RPM_REF_941 | 3.87 pt | outside 0.5 pt | position failure added on this run |
| FG_STANDARD_INVOICE_ARABIC_OMAN_RPM_REF_747 | 2.7 pt | outside 0.5 pt | static position |
| FG_STANDARD_INVOICE_ARABIC_FORMAT2_RPM_REF_1171 | 4.3 pt | outside 0.5 pt | static position |
| FG_STANDARD_INVOICE_ARABIC_FORMAT3_RPM_REF_1183 | 4.3 pt | outside 0.5 pt | static position |
| FG_STANDARD_INVOICE_ARABIC_FORMAT4_RPM_REF_1215 | 4.3 pt | outside 0.5 pt | static position |
| FG_STANDARD_INVOICE_ARABIC_FORMAT5_RPM_REF_1385 | 4.3 pt | outside 0.5 pt | static position |
| FG_STANDARD_INVOICE_ARABIC_FORMAT7_RPM_REF_1400 | 4.3 pt | outside 0.5 pt | static position |
| STUFFING_REPORT_FORMAT | 3.1 pt | Arabic comma 2.6 vs 1.7 | raster R1, non-text 0.0065 |

Reason: the reference advance is the PDF glyph width, not the ink width of Noto Naskh. Closing the gap would mean scaling or a different advance, which this track does not do.

## Arabic comma in dynamic addresses

These four are the dynamic width failures. They are not a general width bug. The rendered address is about 0.8 pt shorter than the reference because the Arabic comma is drawn from Noto Naskh.

- CARTING_CONFIRMATION_REPORT_FORMAT
- LOADING_CONFIRMATION_REPORT_FORMAT
- PICKUP_CONFIRMATION_REPORT_FORMAT
- FREIGHT_MANIFEST_FOR_GROUPAGE_IMPORTS_LCL_REPORT_FORMAT

STUFFING_REPORT_JASPER_REPORT_FORMAT fails dynamic position on the same Dubai address, and it is also raster R1 (non-text 0.0351, text-ink 2.73).

## Vietnamese delivery orders

D_O_FCL_VIETNAM_RPM_REF_411 and D_O_LCL_VIETNAM_WITHOUT_STAMP_RPM_REF_427 now pass every layer. Noto Sans already contains U+1EA0–U+1EF9. fontkit was decomposing U+1ECB into U+0069 plus a combining dot with an empty ToUnicode entry, so the checker read "Kính đề nghi giao cho". Those code points are now embedded as the precomposed glyph. Text-ink is 0.3882 and 0.379, both under T = 0.40. They are not exceptions.

## Raster R1

41 documents. Non-text is above 0.5% at 150 dpi. Masks and limits were not changed. Track A3 did not find one cause that covers all 41, so no raster limit moved and the 41 were not re-rendered.

On the 10 worst, stripping text and images from both content streams still leaves a geometry-only mismatch above 0.5% (0.012 to 0.094). The text-only mismatch is the font raster. The top differing segments are strokes of width 0.5 or 1 pt, not filled rects converted to strokes. Spec line and rect coordinates are stored to 0.1 pt and colors as `#rrggbb`, not at full PDF precision. That rounding was left in place so the geometry check stays on the same numbers.

18 of the 41 use a rotated page. Their stroke coordinates are in the unrotated media box while the rendered page uses the rotated size, so those strokes do not land on the reference rows. The other 23 R1 documents are not rotated, so rotation is not the cause for the whole class. For every differing non-text pixel, distance to the nearest text span box and to the nearest allowed image box:

| Distance | Pixels |
|---|---:|
| 0-1 px | 66,175 |
| 2-3 px | 99,245 |
| 4-8 px | 224,804 |
| over 8 px | 2,068,544 |

Pixels farther than 8 px from both: fills 62,694, strokes 800,458, clip 0, images 0, other 1,205,392. Clip is 0 because the spec does not record clip paths. None of the far pixels sit in an image box. The per-document histogram is `reports/output/track-a2/r1-histogram.md`. Crops of the 10 worst are `reports/output/track-a2/r1/worst/`.

Worst 10 by pixels over 8 px: GL_REPORT_VOUCHER_REPORT_FORMAT (196,521), OUTSTANDING_LETTER_REPORT_FORMAT_2_OUTSTANDING_LETTER_JASPER (193,007), STUFFING_REPORT_JASPER_REPORT_FORMAT (142,540), FREIGHT_MANIFEST_LCL_EXPORTS_REPORT_FORMAT (121,882), CARGO_MANIFEST_REPORT_FORMAT (121,135), CONTAINER_LOAD_PLAN_REPORT_FORMAT (112,442), FG_TAX_INVOICE_INDIA_FORMAT1_RPM_REF_796 (104,281), CONTAINER_OUTTURN_REPORT_FORMAT (81,583), INVOICE_REPORT_FORMAT_2_TAX_INVOICE_INDIA (68,794), GL_LISTING_SORT_BY_CUSTOMER_CODE_VOUCHER_REPORT_FORMAT (65,926).

The other 31 R1 documents are in the histogram table. Several also have text-ink above T = 0.40 (container outturn 3.94, GL voucher 3.64, and the other rows in the after CSV whose `text_ink` column is above 0.40). Both limits would have to move for those to pass.

FG_PROOF_OF_DELIVERY_RPM_REF_847 is in this R1 set and also fails static width and static position on Arabic labels (one label 94.3 vs 247.1 on the shipment-number line).

## Track A4

Page boxes now match the reference on all 391 documents: `/Rotate`, MediaBox, CropBox, and UserUnit. Before the renderer change, 146 documents differed (127 by 0.02 or 0.04 pt of MediaBox rounding, 18 by a missing `/Rotate` 90 and a swapped MediaBox, and `ADVANCE_SHIPPING_NOTE_FORMAT_1` by a CropBox equal to the MediaBox). No UserUnit differed.

Line and rect coordinates and widths are stored to 0.0001 pt. Geometry colors are stored as `r,g,b` with 6 decimal places. The geometry check still uses 0.1 pt and does not round either side before the compare.

The geometry-only raster strips text and images from both content streams and diffs at 150 dpi. It fails above 0.5% of page pixels. It does not change the masked raster rule. Ten documents pass the vector geometry check and fail this raster:

- AIR_QUOTATION_REPORT_FORMAT
- ADVANCE_SHIPPING_NOTE_FORMAT_1
- OUTSTANDING_LETTER_REPORT_FORMAT_4_OUTSTANDING_LETTER_WITH_BL_DETAILS
- TRUCK_CARGO_PICKUP_REQUEST_REPORT_FORMAT
- DAILY_STATUS_REPORT_FORMAT_1
- DAILY_STATUS_REPORT_FORMAT_2
- STATEMENT_OF_ACCOUNTS_REPORT_FORMAT
- STUFFING_REPORT_FORMAT
- FG_STANDARD_INVOICE_TANZANIA_RPM_REF_1431
- FG_TAX_INVOICE_INDIA_FORMAT4_RPM_REF_1007

The three that were previously clean are ADVANCE_SHIPPING_NOTE_FORMAT_1, FG_STANDARD_INVOICE_TANZANIA_RPM_REF_1431, and FG_TAX_INVOICE_INDIA_FORMAT4_RPM_REF_1007. Their masked raster still passes.

On the 23 non-rotated R1 documents, after the page-box and precision render and before the paint fixes, 22 still failed the geometry-only raster. Every top segment had the same coordinates on both sides. Twenty-one of those documents were filled rules stored as lines and drawn as strokes. The remaining pixels on SHIPMENT_FREIGHT_MANIFEST_REPORT_FORMAT were a gray filled path (`0.917647`) drawn black, because path colors were parsed as hex. DELIVERY_ORDER_REPORT_FORMAT_13 then had a white rounded path painted over a gray bar that the reference paints later. Those three causes are general and are fixed: filled rules are filled, path colors use the stored components, and shapes are painted in content-stream order. Ten of the 23 are now clean. Seven of the 23 still fail the geometry-only raster; the remaining difference is one-pixel coverage of rules whose coordinates already match, which is not a further general fix. Segment list: `reports/output/track-a4/plain23/segments.json`.

The 18 rotated documents still fail raster R1. Their page boxes match, vector geometry passes, and the geometry-only raster passes. GL_REPORT_VOUCHER_REPORT_FORMAT non-text moved from 0.0485 to 0.0191 and text-ink from 3.6388 to 0.5523. Both limits still fail. Nothing is accepted.

## Text-ink above T (raster R2)

Non-text is at or under 0.5%. Text-ink is above T = 0.40, so raster fails. The open font is heavier than the reference.

| Document | Non-text | Text-ink |
|---|---:|---:|
| HBL_DRAFT_REPORT_FORMAT_33 | 0.0019 | 1.1714 |
| HBL_DRAFT_REPORT_FORMAT_29 | 0.0039 | 0.9942 |
| HBL_DRAFT_REPORT_FORMAT_148 | 0 | 0.5256 |
| HBL_DRAFT_REPORT_FORMAT_151 | 0 | 0.4765 |
| HBL_DRAFT_REPORT_FORMAT_141 | 0 | 0.4753 |
| HBL_DRAFT_REPORT_FORMAT_25 | 0 | 0.4451 |
| HBL_DRAFT_REPORT_FORMAT_97 | 0 | 0.4411 |

## Form background overlay

These 18 pass page, geometry, static, dynamic, and raster only because the reference form background is copied under both rasters at compare time. The background is not in the shipped PDF. Approving the exception means accepting that the shipped file does not contain that image.

- FG_HBL_FORMAT10_RPM_REF_472
- HBL_DRAFT_REPORT_FORMAT_116
- HBL_DRAFT_REPORT_FORMAT_117
- HBL_DRAFT_REPORT_FORMAT_118
- HBL_DRAFT_REPORT_FORMAT_122
- HBL_DRAFT_REPORT_FORMAT_127
- HBL_DRAFT_REPORT_FORMAT_129
- HBL_DRAFT_REPORT_FORMAT_130
- HBL_DRAFT_REPORT_FORMAT_132
- HBL_DRAFT_REPORT_FORMAT_142
- HBL_DRAFT_REPORT_FORMAT_171
- HBL_DRAFT_REPORT_FORMAT_172
- HBL_DRAFT_REPORT_FORMAT_52
- HBL_DRAFT_REPORT_FORMAT_59
- HBL_DRAFT_REPORT_FORMAT_6
- HBL_DRAFT_REPORT_FORMAT_7
- HBL_DRAFT_REPORT_FORMAT_99
- MAWB_DRAFT_REPORT_FORMAT
