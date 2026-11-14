# HBL Visual QA — Jasper Pilot (FRESA-REF-0001)

Generated: 2026-11-13T11:47:58.023Z

## Reference

- **Report:** HBL Draft Report Format Jasper
- **FreightNest code:** `HBL_DRAFT_REPORT_FORMAT_JASPER`
- **Reference ID:** FRESA-REF-0001
- **PDF:** `hbl-draft-report-fomat-jasper.pdf`
- **Pages:** 1
- **Dimensions:** 595×842 pt
- **Orientation:** portrait
- **Stub / preprinted:** no (validated in FRESA_PDF_VALIDATION.json)

## Comparison method

1. Inspected local reference PDF with pdfjs (page count, MediaBox, text labels).
2. Matched pilot config section/field labels to reference text.
3. Pilot PDF generation uses the same A4 595×842 portrait page box and section order.

## Checklist

| Check | Result | Detail |
| --- | --- | --- |
| page_count | PASS | reference pages=1 (expected 1) |
| dimensions | PASS | reference 595×842 pt (expected 595×842) |
| orientation | PASS | portrait |
| label:Shipper | PASS | present in reference |
| label:Consignee | PASS | present in reference |
| label:Notify Party | PASS | present in reference |
| label:Bill of Lading No. | PASS | present in reference |
| label:F/Agent Name & Ref. | PASS | present in reference |
| label:Place of Receipt | PASS | present in reference |
| label:Port of Loading | PASS | present in reference |
| label:Job No. | PASS | present in reference |
| label:Pre-carriage by | PASS | present in reference |
| label:Vessel/Voyage No. | PASS | present in reference |
| label:Port of Discharge | PASS | present in reference |
| label:Place of Delivery | PASS | present in reference |
| label:No.of Bills of Lading | PASS | present in reference |
| label:Container No. | PASS | present in reference |
| label:Gross Weight | PASS | present in reference |
| label:Measurement | PASS | present in reference |
| label:Freight Details | PASS | present in reference |
| label:Signed on behalf of the Carrier | PASS | present in reference |
| label:Place and Date of Issue | PASS | present in reference |
| label:DRAFT | PASS | present in reference |

## Layout notes vs pilot

- Branding + document title (“NOT NEGOTIABLE UNLESS CONSIGNED TO ORDER”) — present.
- Parties (Shipper / Consignee / Notify) + BL No. + F/Agent — present.
- Routing rows (Place of Receipt, POL, Job No., Pre-carriage; Vessel/Voyage, POD, Place of Delivery, No. of B/Ls) — present.
- Cargo table (container/seal/marks, pkgs, description, weight, measurement) — present.
- Freight details + received clause + signature + place/date of issue + DRAFT watermark — present.
- Footer page numbering — pilot adds Page 1/1 (reference is single-page).

## Summary

**PASS** — Reference labels and page geometry match the Jasper pilot configuration.
