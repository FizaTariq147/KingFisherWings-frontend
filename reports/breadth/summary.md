# Breadth wiring summary

Nothing here is accepted. No threshold or sign-off changed. Classic generators were not touched.

- Census rows: 401, unique codes: 393, excluded: BARCODE_AWB_REPORT_FORMAT, STANDARD_INVOICE_RPM_REF_79
- Wire rule: at least 50% of a spec's data fields resolve to a binding path, plus every code in invoiceV2Codes.ts
- **Wired: 92** (26 invoice v2 codes forced in)
- **Browse-only: 301**
- Format 10 (INVOICE_REPORT_FORMAT_10_STANDARD_INVOICE) wired: yes
- Empty-record leaks across wired codes: 0 (0 code(s) held back as browse-only for leaking)
- Sample record: reports/output/invoice-v2/batch-live.json (INV/26/00102)
- Arithmetic profile source: batch-live.json invoices

## Browse-only reasons

- data fields have too little source (below 50%): 299
- excluded from the breadth pass: 2

## Wired by module

- invoice: 65
- shipment: 11
- delivery_order: 8
- arrival_notice: 3
- manifest: 2
- credit_debit: 2
- voucher: 1

## Wired by registry family

- unregistered: 47
- commercial: 26
- sea_docs: 15
- air_docs: 3
- finance: 1

## Arithmetic (money layouts with a totals profile)

- Wired money layouts: 67
- With a totals profile: 26
- Without a totals profile (not measured): 41
- Mismatch on at least one sample invoice: 21
  - INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA: mismatch 15/15: no total printed
  - INVOICE_REPORT_FORMAT_11_STANDARD_INVOICE_LAND: mismatch 15/15: no total printed
  - INVOICE_REPORT_FORMAT_13_STANDARD_INVOICE_USA: mismatch 15/15: no total printed
  - INVOICE_REPORT_FORMAT_14_INVOICE: mismatch 6/15: subtotal does not reach the total
  - INVOICE_REPORT_FORMAT_16_STANDARD_TAX_INVOICE_PREPRINTED: mismatch 6/15: subtotal does not reach the total
  - INVOICE_REPORT_FORMAT_17_INVOICE_JASPER: mismatch 6/15: subtotal does not reach the total
  - INVOICE_REPORT_FORMAT_18_LAND_FREIGHT_TRANSPORTATION_INVOICE: mismatch 15/15: no total printed
  - INVOICE_REPORT_FORMAT_19_DEBIT_NOTE_VIETNAM: mismatch 15/15: no total printed
  - INVOICE_REPORT_FORMAT_2_TAX_INVOICE_INDIA: mismatch 15/15: no total printed
  - INVOICE_REPORT_FORMAT_20_TAX_INVOICE_INDIA: mismatch 15/15: no total printed
  - INVOICE_REPORT_FORMAT_21_WAREHOUSE_INVOICE: mismatch 15/15: no total printed
  - INVOICE_REPORT_FORMAT_3_SUMMARY_INVOICE: mismatch 15/15: no total printed
  - INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE: mismatch 6/15: subtotal does not reach the total
  - INVOICE_REPORT_FORMAT_5_TAX_INVOICE_INDIA: mismatch 15/15: no total printed
  - INVOICE_REPORT_FORMAT_6_SIMPLE_INVOICE_INDIA: mismatch 15/15: no total printed
  - INVOICE_REPORT_FORMAT_7_SIMPLE_INVOICE: mismatch 15/15: no total printed
  - PROFORMA_INVOICE_ALL_CHARGES_REPORT_FORMAT: mismatch 15/15: no total printed
  - PROFORMA_INVOICE_REPORT_FORMAT_1_PROFORMA_INVOICE_ALL_CHARGES: mismatch 15/15: no total printed
  - PROFORMA_INVOICE_REPORT_FORMAT_2_PROFORMA_INVOICE_ALL_CHARGES: mismatch 15/15: no total printed
  - PURCHASE_INVOICE_REPORT_FORMAT_1: mismatch 15/15: no total printed
  - PURCHASE_INVOICE_REPORT_FORMAT_2: mismatch 15/15: no total printed

## Failures

- No forced code failed.

## Notes

- Static labels outside reports/label-allowlist.json are not painted by the renderer when values are supplied. That list was built from invoice specs, so non-invoice layouts show fewer printed labels than their references.
- Samples are approximate, not final. Document numbers for delivery order, arrival notice and manifest map to the job number because the record has no separate number.
