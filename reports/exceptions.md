# Exceptions

Nothing in this list is accepted. Each line is a document that cannot pass a stated check without changing a threshold, a status value, or `reports/signoff.csv`. A human can approve or reject each reason.

Counts are the 399-document runs. Before is Track A (`reports/full-run-track-a-before-a2.csv`). After is Track A2 (`reports/full-run-track-a-last.csv`).

| | Documents | Clean | R1 | R2 | Static position |
|---|---:|---:|---:|---:|---:|
| Before | 399 | 334 | 41 | 7 | 12 |
| After | 399 | 334 | 41 | 7 | 13 |

No previously clean document failed a layer. Static width stayed 13. Dynamic width stayed 4. Dynamic position stayed 1.

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

## Vietnamese text the subset drops

- D_O_FCL_VIETNAM_RPM_REF_411
- D_O_LCL_VIETNAM_WITHOUT_STAMP_RPM_REF_427

Reason: the Noto Sans subset drops U+1ECB, so "Kính đề nghị giao cho" is extracted as "Kính đề nghi giao cho" and the following word shifts. Routing those spans to Arimo was tried and reverted: the checker expects Noto Sans for TimesNewRomanPS-BoldMT, and the Arimo widths and raster then failed. Keeping Arimo would be a checker change.

## Raster R1

41 documents. Non-text is above 0.5% at 150 dpi. Masks and limits were not changed. For every differing non-text pixel, distance to the nearest text span box and to the nearest allowed image box:

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
