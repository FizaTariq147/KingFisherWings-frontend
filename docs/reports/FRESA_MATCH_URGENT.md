# FRESA sample comparison (this session)

Compared with `node tools/reports/diff-pilot.mjs` against pinned files under `reports/references/files/`. Nothing is accepted. This is **not** 100% FRESA matching.

The harness redraws the extracted spec using the **reference PDF’s own demo strings**. It does not prove a live Kingfisher invoice, job, or arrival notice. Catalogue Generate still uses the reference-accurate forms, which leave Fresa demo parties and amounts blank.

Simplified HTML pilots no longer override these three codes. Those faces are not the FRESA layout. The measured reference form remains the catalogue path.

## Comparison (harness vs pinned FRESA PDF)

| Report | FRESA fields matched | Layout matched | Data matched | Remaining issues |
|---|---|---|---|---|
| `INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA` | Static text pass (173 spans, 0 failures). Dynamic text pass (56 spans, 0 failures) against the sample’s own values. | Page pass 594×841.9 pt, 1 page. Geometry pass (0 unmatched lines/rects/paths). | Not live data. Spec still contains FRESA demo name, email, and “Powered by Fresa”. | Raster mismatches 23,730 px (ratio 0.0109). Causes: text glyph 83.5%, color 10.3%, vector 3.9%. Consolas mapped to Liberation Mono. Not a multi-page fixture. |
| `HBL_DRAFT_REPORT_FORMAT_JASPER` | Static text pass (62 spans). Dynamic text pass (20 spans) against sample values. | Page pass 595×842 pt. Geometry pass. | Not live data. Branding spans still include FRESA DEMO DUBAI / INDIA and fresa emails. | Raster mismatches 9,882 px (ratio 0.0045). Image/barcode is 45.8% of those pixels (CODE_128 not copied as the sample graphic). Poppler: no display font for Symbol / ArialUnicode. |
| `ARRIVAL_NOTICE_REPORT_FORMAT_1_CARGO_ARRIVAL_NOTICE_JASPER` | Static text pass (85 spans). Dynamic text pass (35 spans) against sample values. | Page pass 595×842 pt. Geometry pass. | Not live data. Sample still has FRESA cheque line, company name, and “Powered By : Fresa Technologies”. | Raster mismatches 18,905 px (ratio 0.0087). Image/barcode 56.3% (letterhead + CODE_128). Same missing display fonts. |

## Generated files for review

Harness PDFs (spec redraw, demo values):

- `reports/output/INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA.pdf`
- `reports/output/HBL_DRAFT_REPORT_FORMAT_JASPER.pdf`
- `reports/output/ARRIVAL_NOTICE_REPORT_FORMAT_1_CARGO_ARRIVAL_NOTICE_JASPER.pdf`

Pinned references:

- `reports/references/files/invoice-report-format-1-tax-invoice-india.pdf` (or the path recorded in the manifest)
- `reports/references/files/hbl-draft-report-fomat-jasper.pdf`
- `reports/references/files/arrival-notice-report-format-1-cargo-arrival-notice-jasper.pdf`

## Not completed

Every other catalogue code. The 399-document verify is a separate harness and is not a FRESA visual sign-off. Job List Summary’s FRESA sample is an XLSX, not this PDF compare.

## What blocks an exact match

1. Production must not print FRESA company names, emails, or “Powered by Fresa”. Those strings are in the sample and in the spec redraw.
2. Embedded sample fonts are not copied (Arimo / Liberation substitutes). Glyph edges differ.
3. Logos, letterheads, and barcodes are not byte-copied from the sample.
4. Live records do not contain every sample field (notify, SGST/CGST/IGST split, net weight). Empty stays empty.
