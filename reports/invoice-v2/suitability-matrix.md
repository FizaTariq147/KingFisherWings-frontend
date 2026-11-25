# Invoice v2 suitability matrix

Nothing is accepted. No totals row was added to a layout.

Suitable means the rows that layout already prints add up to the printed total. `suitable for arithmetic, tax not shown` is a note, not a block: the code stays openable.

A tax row is a totals label with a live amount beside it. A line-tax column is a charge column labeled tax or VAT, and not SGST, CGST, or IGST. GST-blocked codes need that split and do not draw it.

Pagination uses the repeating charge band. `no charge band` means the spec has no three-cell charge row for the repeater to copy.

## Real invoices with tax

- INV/26/00093
- INV/26/00097
- INV/26/00094
- INV/26/00095
- INV/26/00098
- INV/26/00089

The other real invoices have header `tax_amount` 0 and line tax 0.

## tax_total

The downloaded `GET /invoices/:id` body has no `tax_total` key on any of these 10. The header field that is present is `tax_amount` (a string). Line objects have `tax_amount`.

`normalizeInvoice` in `src/features/invoices/utils/normalizeInvoice.ts` sets `tax_total` from `tax_total`, then `vat_amount`, then `taxTotal`. It does not copy header `tax_amount`. Classic still reads `tax_total` only. That file was not changed.

Line tax is present and `tax_total` is absent on: INV/26/00093, INV/26/00097, INV/26/00094, INV/26/00095, INV/26/00098, INV/26/00089.

## Ranked non-GST, non-preprinted codes

Ordered by how many of the 10 real invoices they suit, then by whether they show a tax figure.

| Rank | Code | Real invoices suited | Shows tax |
|---|---|---|---|
| 1 | INVOICE_REPORT_FORMAT_10_STANDARD_INVOICE | 10 | no |
| 2 | INVOICE_REPORT_FORMAT_15_INVOICE_FCY | 10 | no |
| 3 | INVOICE_REPORT_FORMAT_8_STANDARD_INVOICE_ARABIC | 10 | no |
| 4 | INVOICE_REPORT_FORMAT_9_STANDARD_INVOICE_USA | 10 | no |
| 5 | INVOICE_REPORT_FORMAT_17_INVOICE_JASPER | 4 | no |
| 6 | INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE | 4 | no |
| 7 | INVOICE_REPORT_FORMAT_11_STANDARD_INVOICE_LAND | 0 | no |
| 8 | INVOICE_REPORT_FORMAT_13_STANDARD_INVOICE_USA | 0 | no |
| 9 | INVOICE_REPORT_FORMAT_18_LAND_FREIGHT_TRANSPORTATION_INVOICE | 0 | no |
| 10 | INVOICE_REPORT_FORMAT_19_DEBIT_NOTE_VIETNAM | 0 | no |
| 11 | INVOICE_REPORT_FORMAT_21_WAREHOUSE_INVOICE | 0 | no |
| 12 | INVOICE_REPORT_FORMAT_3_SUMMARY_INVOICE | 0 | no |
| 13 | INVOICE_REPORT_FORMAT_7_SIMPLE_INVOICE | 0 | no |
| 14 | PROFORMA_INVOICE_ALL_CHARGES_REPORT_FORMAT | 0 | no |
| 15 | PROFORMA_INVOICE_REPORT_FORMAT_1_PROFORMA_INVOICE_ALL_CHARGES | 0 | no |
| 16 | PROFORMA_INVOICE_REPORT_FORMAT_2_PROFORMA_INVOICE_ALL_CHARGES | 0 | no |

## Real invoices

| Code | Record | Suitable | Reason | Tax row | Line tax | Subtotal | GST-blocked | Lines |
|---|---|---|---|---|---|---|---|---|
| INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA | INV/26/00102 | not suitable | this layout does not print a total | no | no | no | yes | fit (1 of 11) |
| INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA | INV/26/00093 | not suitable | this layout does not print a total | no | no | no | yes | fit (1 of 11) |
| INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA | INV/26/00101 | not suitable | this layout does not print a total | no | no | no | yes | fit (3 of 11) |
| INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA | INV/26/00100 | not suitable | this layout does not print a total | no | no | no | yes | fit (1 of 11) |
| INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA | INV/26/00099 | not suitable | this layout does not print a total | no | no | no | yes | fit (2 of 11) |
| INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA | INV/26/00097 | not suitable | this layout does not print a total | no | no | no | yes | fit (1 of 11) |
| INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA | INV/26/00094 | not suitable | this layout does not print a total | no | no | no | yes | fit (2 of 11) |
| INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA | INV/26/00095 | not suitable | this layout does not print a total | no | no | no | yes | fit (1 of 11) |
| INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA | INV/26/00098 | not suitable | this layout does not print a total | no | no | no | yes | fit (1 of 11) |
| INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA | INV/26/00089 | not suitable | this layout does not print a total | no | no | no | yes | fit (1 of 11) |
| INVOICE_REPORT_FORMAT_2_TAX_INVOICE_INDIA | INV/26/00102 | not suitable | this layout does not print a total | no | yes | no | yes | fit (1 of 4) |
| INVOICE_REPORT_FORMAT_2_TAX_INVOICE_INDIA | INV/26/00093 | not suitable | this layout does not print a total | no | yes | no | yes | fit (1 of 4) |
| INVOICE_REPORT_FORMAT_2_TAX_INVOICE_INDIA | INV/26/00101 | not suitable | this layout does not print a total | no | yes | no | yes | fit (3 of 4) |
| INVOICE_REPORT_FORMAT_2_TAX_INVOICE_INDIA | INV/26/00100 | not suitable | this layout does not print a total | no | yes | no | yes | fit (1 of 4) |
| INVOICE_REPORT_FORMAT_2_TAX_INVOICE_INDIA | INV/26/00099 | not suitable | this layout does not print a total | no | yes | no | yes | fit (2 of 4) |
| INVOICE_REPORT_FORMAT_2_TAX_INVOICE_INDIA | INV/26/00097 | not suitable | this layout does not print a total | no | yes | no | yes | fit (1 of 4) |
| INVOICE_REPORT_FORMAT_2_TAX_INVOICE_INDIA | INV/26/00094 | not suitable | this layout does not print a total | no | yes | no | yes | fit (2 of 4) |
| INVOICE_REPORT_FORMAT_2_TAX_INVOICE_INDIA | INV/26/00095 | not suitable | this layout does not print a total | no | yes | no | yes | fit (1 of 4) |
| INVOICE_REPORT_FORMAT_2_TAX_INVOICE_INDIA | INV/26/00098 | not suitable | this layout does not print a total | no | yes | no | yes | fit (1 of 4) |
| INVOICE_REPORT_FORMAT_2_TAX_INVOICE_INDIA | INV/26/00089 | not suitable | this layout does not print a total | no | yes | no | yes | fit (1 of 4) |
| INVOICE_REPORT_FORMAT_3_SUMMARY_INVOICE | INV/26/00102 | not suitable | this layout does not print a total | no | no | no | no | fit (1 of 18) |
| INVOICE_REPORT_FORMAT_3_SUMMARY_INVOICE | INV/26/00093 | not suitable | this layout does not print a total | no | no | no | no | fit (1 of 18) |
| INVOICE_REPORT_FORMAT_3_SUMMARY_INVOICE | INV/26/00101 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 18) |
| INVOICE_REPORT_FORMAT_3_SUMMARY_INVOICE | INV/26/00100 | not suitable | this layout does not print a total | no | no | no | no | fit (1 of 18) |
| INVOICE_REPORT_FORMAT_3_SUMMARY_INVOICE | INV/26/00099 | not suitable | this layout does not print a total | no | no | no | no | fit (2 of 18) |
| INVOICE_REPORT_FORMAT_3_SUMMARY_INVOICE | INV/26/00097 | not suitable | this layout does not print a total | no | no | no | no | fit (1 of 18) |
| INVOICE_REPORT_FORMAT_3_SUMMARY_INVOICE | INV/26/00094 | not suitable | this layout does not print a total | no | no | no | no | fit (2 of 18) |
| INVOICE_REPORT_FORMAT_3_SUMMARY_INVOICE | INV/26/00095 | not suitable | this layout does not print a total | no | no | no | no | fit (1 of 18) |
| INVOICE_REPORT_FORMAT_3_SUMMARY_INVOICE | INV/26/00098 | not suitable | this layout does not print a total | no | no | no | no | fit (1 of 18) |
| INVOICE_REPORT_FORMAT_3_SUMMARY_INVOICE | INV/26/00089 | not suitable | this layout does not print a total | no | no | no | no | fit (1 of 18) |
| INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE | INV/26/00102 | suitable | — | no | no | yes | no | fit (1 of 10) |
| INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE | INV/26/00093 | not suitable | the tax is not printed | no | no | yes | no | fit (1 of 10) |
| INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE | INV/26/00101 | suitable | — | no | no | yes | no | fit (3 of 10) |
| INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE | INV/26/00100 | suitable | — | no | no | yes | no | fit (1 of 10) |
| INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE | INV/26/00099 | suitable | — | no | no | yes | no | fit (2 of 10) |
| INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE | INV/26/00097 | not suitable | the tax is not printed | no | no | yes | no | fit (1 of 10) |
| INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE | INV/26/00094 | not suitable | the tax is not printed | no | no | yes | no | fit (2 of 10) |
| INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE | INV/26/00095 | not suitable | the tax is not printed | no | no | yes | no | fit (1 of 10) |
| INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE | INV/26/00098 | not suitable | the tax is not printed | no | no | yes | no | fit (1 of 10) |
| INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE | INV/26/00089 | not suitable | the tax is not printed | no | no | yes | no | fit (1 of 10) |
| INVOICE_REPORT_FORMAT_5_TAX_INVOICE_INDIA | INV/26/00102 | not suitable | this layout does not print a total | no | no | no | yes | fit (1 of 16) |
| INVOICE_REPORT_FORMAT_5_TAX_INVOICE_INDIA | INV/26/00093 | not suitable | this layout does not print a total | no | no | no | yes | fit (1 of 16) |
| INVOICE_REPORT_FORMAT_5_TAX_INVOICE_INDIA | INV/26/00101 | not suitable | this layout does not print a total | no | no | no | yes | fit (3 of 16) |
| INVOICE_REPORT_FORMAT_5_TAX_INVOICE_INDIA | INV/26/00100 | not suitable | this layout does not print a total | no | no | no | yes | fit (1 of 16) |
| INVOICE_REPORT_FORMAT_5_TAX_INVOICE_INDIA | INV/26/00099 | not suitable | this layout does not print a total | no | no | no | yes | fit (2 of 16) |
| INVOICE_REPORT_FORMAT_5_TAX_INVOICE_INDIA | INV/26/00097 | not suitable | this layout does not print a total | no | no | no | yes | fit (1 of 16) |
| INVOICE_REPORT_FORMAT_5_TAX_INVOICE_INDIA | INV/26/00094 | not suitable | this layout does not print a total | no | no | no | yes | fit (2 of 16) |
| INVOICE_REPORT_FORMAT_5_TAX_INVOICE_INDIA | INV/26/00095 | not suitable | this layout does not print a total | no | no | no | yes | fit (1 of 16) |
| INVOICE_REPORT_FORMAT_5_TAX_INVOICE_INDIA | INV/26/00098 | not suitable | this layout does not print a total | no | no | no | yes | fit (1 of 16) |
| INVOICE_REPORT_FORMAT_5_TAX_INVOICE_INDIA | INV/26/00089 | not suitable | this layout does not print a total | no | no | no | yes | fit (1 of 16) |
| INVOICE_REPORT_FORMAT_6_SIMPLE_INVOICE_INDIA | INV/26/00102 | not suitable | this layout does not print a total | no | no | no | yes | fit (1 of 14) |
| INVOICE_REPORT_FORMAT_6_SIMPLE_INVOICE_INDIA | INV/26/00093 | not suitable | this layout does not print a total | no | no | no | yes | fit (1 of 14) |
| INVOICE_REPORT_FORMAT_6_SIMPLE_INVOICE_INDIA | INV/26/00101 | not suitable | this layout does not print a total | no | no | no | yes | fit (3 of 14) |
| INVOICE_REPORT_FORMAT_6_SIMPLE_INVOICE_INDIA | INV/26/00100 | not suitable | this layout does not print a total | no | no | no | yes | fit (1 of 14) |
| INVOICE_REPORT_FORMAT_6_SIMPLE_INVOICE_INDIA | INV/26/00099 | not suitable | this layout does not print a total | no | no | no | yes | fit (2 of 14) |
| INVOICE_REPORT_FORMAT_6_SIMPLE_INVOICE_INDIA | INV/26/00097 | not suitable | this layout does not print a total | no | no | no | yes | fit (1 of 14) |
| INVOICE_REPORT_FORMAT_6_SIMPLE_INVOICE_INDIA | INV/26/00094 | not suitable | this layout does not print a total | no | no | no | yes | fit (2 of 14) |
| INVOICE_REPORT_FORMAT_6_SIMPLE_INVOICE_INDIA | INV/26/00095 | not suitable | this layout does not print a total | no | no | no | yes | fit (1 of 14) |
| INVOICE_REPORT_FORMAT_6_SIMPLE_INVOICE_INDIA | INV/26/00098 | not suitable | this layout does not print a total | no | no | no | yes | fit (1 of 14) |
| INVOICE_REPORT_FORMAT_6_SIMPLE_INVOICE_INDIA | INV/26/00089 | not suitable | this layout does not print a total | no | no | no | yes | fit (1 of 14) |
| INVOICE_REPORT_FORMAT_7_SIMPLE_INVOICE | INV/26/00102 | not suitable | this layout does not print a total | no | no | no | no | fit (1 of 23) |
| INVOICE_REPORT_FORMAT_7_SIMPLE_INVOICE | INV/26/00093 | not suitable | this layout does not print a total | no | no | no | no | fit (1 of 23) |
| INVOICE_REPORT_FORMAT_7_SIMPLE_INVOICE | INV/26/00101 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 23) |
| INVOICE_REPORT_FORMAT_7_SIMPLE_INVOICE | INV/26/00100 | not suitable | this layout does not print a total | no | no | no | no | fit (1 of 23) |
| INVOICE_REPORT_FORMAT_7_SIMPLE_INVOICE | INV/26/00099 | not suitable | this layout does not print a total | no | no | no | no | fit (2 of 23) |
| INVOICE_REPORT_FORMAT_7_SIMPLE_INVOICE | INV/26/00097 | not suitable | this layout does not print a total | no | no | no | no | fit (1 of 23) |
| INVOICE_REPORT_FORMAT_7_SIMPLE_INVOICE | INV/26/00094 | not suitable | this layout does not print a total | no | no | no | no | fit (2 of 23) |
| INVOICE_REPORT_FORMAT_7_SIMPLE_INVOICE | INV/26/00095 | not suitable | this layout does not print a total | no | no | no | no | fit (1 of 23) |
| INVOICE_REPORT_FORMAT_7_SIMPLE_INVOICE | INV/26/00098 | not suitable | this layout does not print a total | no | no | no | no | fit (1 of 23) |
| INVOICE_REPORT_FORMAT_7_SIMPLE_INVOICE | INV/26/00089 | not suitable | this layout does not print a total | no | no | no | no | fit (1 of 23) |
| INVOICE_REPORT_FORMAT_8_STANDARD_INVOICE_ARABIC | INV/26/00102 | suitable | — | no | no | no | no | fit (1 of 23) |
| INVOICE_REPORT_FORMAT_8_STANDARD_INVOICE_ARABIC | INV/26/00093 | suitable | suitable for arithmetic, tax not shown | no | no | no | no | fit (1 of 23) |
| INVOICE_REPORT_FORMAT_8_STANDARD_INVOICE_ARABIC | INV/26/00101 | suitable | — | no | no | no | no | fit (3 of 23) |
| INVOICE_REPORT_FORMAT_8_STANDARD_INVOICE_ARABIC | INV/26/00100 | suitable | — | no | no | no | no | fit (1 of 23) |
| INVOICE_REPORT_FORMAT_8_STANDARD_INVOICE_ARABIC | INV/26/00099 | suitable | — | no | no | no | no | fit (2 of 23) |
| INVOICE_REPORT_FORMAT_8_STANDARD_INVOICE_ARABIC | INV/26/00097 | suitable | suitable for arithmetic, tax not shown | no | no | no | no | fit (1 of 23) |
| INVOICE_REPORT_FORMAT_8_STANDARD_INVOICE_ARABIC | INV/26/00094 | suitable | suitable for arithmetic, tax not shown | no | no | no | no | fit (2 of 23) |
| INVOICE_REPORT_FORMAT_8_STANDARD_INVOICE_ARABIC | INV/26/00095 | suitable | suitable for arithmetic, tax not shown | no | no | no | no | fit (1 of 23) |
| INVOICE_REPORT_FORMAT_8_STANDARD_INVOICE_ARABIC | INV/26/00098 | suitable | suitable for arithmetic, tax not shown | no | no | no | no | fit (1 of 23) |
| INVOICE_REPORT_FORMAT_8_STANDARD_INVOICE_ARABIC | INV/26/00089 | suitable | suitable for arithmetic, tax not shown | no | no | no | no | fit (1 of 23) |
| INVOICE_REPORT_FORMAT_9_STANDARD_INVOICE_USA | INV/26/00102 | suitable | — | no | no | no | no | fit (1 of 16) |
| INVOICE_REPORT_FORMAT_9_STANDARD_INVOICE_USA | INV/26/00093 | suitable | suitable for arithmetic, tax not shown | no | no | no | no | fit (1 of 16) |
| INVOICE_REPORT_FORMAT_9_STANDARD_INVOICE_USA | INV/26/00101 | suitable | — | no | no | no | no | fit (3 of 16) |
| INVOICE_REPORT_FORMAT_9_STANDARD_INVOICE_USA | INV/26/00100 | suitable | — | no | no | no | no | fit (1 of 16) |
| INVOICE_REPORT_FORMAT_9_STANDARD_INVOICE_USA | INV/26/00099 | suitable | — | no | no | no | no | fit (2 of 16) |
| INVOICE_REPORT_FORMAT_9_STANDARD_INVOICE_USA | INV/26/00097 | suitable | suitable for arithmetic, tax not shown | no | no | no | no | fit (1 of 16) |
| INVOICE_REPORT_FORMAT_9_STANDARD_INVOICE_USA | INV/26/00094 | suitable | suitable for arithmetic, tax not shown | no | no | no | no | fit (2 of 16) |
| INVOICE_REPORT_FORMAT_9_STANDARD_INVOICE_USA | INV/26/00095 | suitable | suitable for arithmetic, tax not shown | no | no | no | no | fit (1 of 16) |
| INVOICE_REPORT_FORMAT_9_STANDARD_INVOICE_USA | INV/26/00098 | suitable | suitable for arithmetic, tax not shown | no | no | no | no | fit (1 of 16) |
| INVOICE_REPORT_FORMAT_9_STANDARD_INVOICE_USA | INV/26/00089 | suitable | suitable for arithmetic, tax not shown | no | no | no | no | fit (1 of 16) |
| INVOICE_REPORT_FORMAT_10_STANDARD_INVOICE | INV/26/00102 | suitable | — | no | no | no | no | fit (1 of 7) |
| INVOICE_REPORT_FORMAT_10_STANDARD_INVOICE | INV/26/00093 | suitable | suitable for arithmetic, tax not shown | no | no | no | no | fit (1 of 7) |
| INVOICE_REPORT_FORMAT_10_STANDARD_INVOICE | INV/26/00101 | suitable | — | no | no | no | no | fit (3 of 7) |
| INVOICE_REPORT_FORMAT_10_STANDARD_INVOICE | INV/26/00100 | suitable | — | no | no | no | no | fit (1 of 7) |
| INVOICE_REPORT_FORMAT_10_STANDARD_INVOICE | INV/26/00099 | suitable | — | no | no | no | no | fit (2 of 7) |
| INVOICE_REPORT_FORMAT_10_STANDARD_INVOICE | INV/26/00097 | suitable | suitable for arithmetic, tax not shown | no | no | no | no | fit (1 of 7) |
| INVOICE_REPORT_FORMAT_10_STANDARD_INVOICE | INV/26/00094 | suitable | suitable for arithmetic, tax not shown | no | no | no | no | fit (2 of 7) |
| INVOICE_REPORT_FORMAT_10_STANDARD_INVOICE | INV/26/00095 | suitable | suitable for arithmetic, tax not shown | no | no | no | no | fit (1 of 7) |
| INVOICE_REPORT_FORMAT_10_STANDARD_INVOICE | INV/26/00098 | suitable | suitable for arithmetic, tax not shown | no | no | no | no | fit (1 of 7) |
| INVOICE_REPORT_FORMAT_10_STANDARD_INVOICE | INV/26/00089 | suitable | suitable for arithmetic, tax not shown | no | no | no | no | fit (1 of 7) |
| INVOICE_REPORT_FORMAT_11_STANDARD_INVOICE_LAND | INV/26/00102 | not suitable | this layout does not print a total | no | no | no | no | fit (1 of 16) |
| INVOICE_REPORT_FORMAT_11_STANDARD_INVOICE_LAND | INV/26/00093 | not suitable | this layout does not print a total | no | no | no | no | fit (1 of 16) |
| INVOICE_REPORT_FORMAT_11_STANDARD_INVOICE_LAND | INV/26/00101 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 16) |
| INVOICE_REPORT_FORMAT_11_STANDARD_INVOICE_LAND | INV/26/00100 | not suitable | this layout does not print a total | no | no | no | no | fit (1 of 16) |
| INVOICE_REPORT_FORMAT_11_STANDARD_INVOICE_LAND | INV/26/00099 | not suitable | this layout does not print a total | no | no | no | no | fit (2 of 16) |
| INVOICE_REPORT_FORMAT_11_STANDARD_INVOICE_LAND | INV/26/00097 | not suitable | this layout does not print a total | no | no | no | no | fit (1 of 16) |
| INVOICE_REPORT_FORMAT_11_STANDARD_INVOICE_LAND | INV/26/00094 | not suitable | this layout does not print a total | no | no | no | no | fit (2 of 16) |
| INVOICE_REPORT_FORMAT_11_STANDARD_INVOICE_LAND | INV/26/00095 | not suitable | this layout does not print a total | no | no | no | no | fit (1 of 16) |
| INVOICE_REPORT_FORMAT_11_STANDARD_INVOICE_LAND | INV/26/00098 | not suitable | this layout does not print a total | no | no | no | no | fit (1 of 16) |
| INVOICE_REPORT_FORMAT_11_STANDARD_INVOICE_LAND | INV/26/00089 | not suitable | this layout does not print a total | no | no | no | no | fit (1 of 16) |
| INVOICE_REPORT_FORMAT_12_STANDARD_INVOICE_PREPRINTED | INV/26/00102 | suitable | — | no | no | no | no | fit (1 of 11) |
| INVOICE_REPORT_FORMAT_12_STANDARD_INVOICE_PREPRINTED | INV/26/00093 | suitable | suitable for arithmetic, tax not shown | no | no | no | no | fit (1 of 11) |
| INVOICE_REPORT_FORMAT_12_STANDARD_INVOICE_PREPRINTED | INV/26/00101 | suitable | — | no | no | no | no | fit (3 of 11) |
| INVOICE_REPORT_FORMAT_12_STANDARD_INVOICE_PREPRINTED | INV/26/00100 | suitable | — | no | no | no | no | fit (1 of 11) |
| INVOICE_REPORT_FORMAT_12_STANDARD_INVOICE_PREPRINTED | INV/26/00099 | suitable | — | no | no | no | no | fit (2 of 11) |
| INVOICE_REPORT_FORMAT_12_STANDARD_INVOICE_PREPRINTED | INV/26/00097 | suitable | suitable for arithmetic, tax not shown | no | no | no | no | fit (1 of 11) |
| INVOICE_REPORT_FORMAT_12_STANDARD_INVOICE_PREPRINTED | INV/26/00094 | suitable | suitable for arithmetic, tax not shown | no | no | no | no | fit (2 of 11) |
| INVOICE_REPORT_FORMAT_12_STANDARD_INVOICE_PREPRINTED | INV/26/00095 | suitable | suitable for arithmetic, tax not shown | no | no | no | no | fit (1 of 11) |
| INVOICE_REPORT_FORMAT_12_STANDARD_INVOICE_PREPRINTED | INV/26/00098 | suitable | suitable for arithmetic, tax not shown | no | no | no | no | fit (1 of 11) |
| INVOICE_REPORT_FORMAT_12_STANDARD_INVOICE_PREPRINTED | INV/26/00089 | suitable | suitable for arithmetic, tax not shown | no | no | no | no | fit (1 of 11) |
| INVOICE_REPORT_FORMAT_13_STANDARD_INVOICE_USA | INV/26/00102 | not suitable | this layout does not print a total | no | no | no | no | fit (1 of 30) |
| INVOICE_REPORT_FORMAT_13_STANDARD_INVOICE_USA | INV/26/00093 | not suitable | this layout does not print a total | no | no | no | no | fit (1 of 30) |
| INVOICE_REPORT_FORMAT_13_STANDARD_INVOICE_USA | INV/26/00101 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 30) |
| INVOICE_REPORT_FORMAT_13_STANDARD_INVOICE_USA | INV/26/00100 | not suitable | this layout does not print a total | no | no | no | no | fit (1 of 30) |
| INVOICE_REPORT_FORMAT_13_STANDARD_INVOICE_USA | INV/26/00099 | not suitable | this layout does not print a total | no | no | no | no | fit (2 of 30) |
| INVOICE_REPORT_FORMAT_13_STANDARD_INVOICE_USA | INV/26/00097 | not suitable | this layout does not print a total | no | no | no | no | fit (1 of 30) |
| INVOICE_REPORT_FORMAT_13_STANDARD_INVOICE_USA | INV/26/00094 | not suitable | this layout does not print a total | no | no | no | no | fit (2 of 30) |
| INVOICE_REPORT_FORMAT_13_STANDARD_INVOICE_USA | INV/26/00095 | not suitable | this layout does not print a total | no | no | no | no | fit (1 of 30) |
| INVOICE_REPORT_FORMAT_13_STANDARD_INVOICE_USA | INV/26/00098 | not suitable | this layout does not print a total | no | no | no | no | fit (1 of 30) |
| INVOICE_REPORT_FORMAT_13_STANDARD_INVOICE_USA | INV/26/00089 | not suitable | this layout does not print a total | no | no | no | no | fit (1 of 30) |
| INVOICE_REPORT_FORMAT_14_INVOICE | INV/26/00102 | suitable | — | no | no | yes | yes | fit (1 of 22) |
| INVOICE_REPORT_FORMAT_14_INVOICE | INV/26/00093 | not suitable | the tax is not printed | no | no | yes | yes | fit (1 of 22) |
| INVOICE_REPORT_FORMAT_14_INVOICE | INV/26/00101 | suitable | — | no | no | yes | yes | fit (3 of 22) |
| INVOICE_REPORT_FORMAT_14_INVOICE | INV/26/00100 | suitable | — | no | no | yes | yes | fit (1 of 22) |
| INVOICE_REPORT_FORMAT_14_INVOICE | INV/26/00099 | suitable | — | no | no | yes | yes | fit (2 of 22) |
| INVOICE_REPORT_FORMAT_14_INVOICE | INV/26/00097 | not suitable | the tax is not printed | no | no | yes | yes | fit (1 of 22) |
| INVOICE_REPORT_FORMAT_14_INVOICE | INV/26/00094 | not suitable | the tax is not printed | no | no | yes | yes | fit (2 of 22) |
| INVOICE_REPORT_FORMAT_14_INVOICE | INV/26/00095 | not suitable | the tax is not printed | no | no | yes | yes | fit (1 of 22) |
| INVOICE_REPORT_FORMAT_14_INVOICE | INV/26/00098 | not suitable | the tax is not printed | no | no | yes | yes | fit (1 of 22) |
| INVOICE_REPORT_FORMAT_14_INVOICE | INV/26/00089 | not suitable | the tax is not printed | no | no | yes | yes | fit (1 of 22) |
| INVOICE_REPORT_FORMAT_15_INVOICE_FCY | INV/26/00102 | suitable | — | no | no | no | no | no charge band |
| INVOICE_REPORT_FORMAT_15_INVOICE_FCY | INV/26/00093 | suitable | suitable for arithmetic, tax not shown | no | no | no | no | no charge band |
| INVOICE_REPORT_FORMAT_15_INVOICE_FCY | INV/26/00101 | suitable | — | no | no | no | no | no charge band |
| INVOICE_REPORT_FORMAT_15_INVOICE_FCY | INV/26/00100 | suitable | — | no | no | no | no | no charge band |
| INVOICE_REPORT_FORMAT_15_INVOICE_FCY | INV/26/00099 | suitable | — | no | no | no | no | no charge band |
| INVOICE_REPORT_FORMAT_15_INVOICE_FCY | INV/26/00097 | suitable | suitable for arithmetic, tax not shown | no | no | no | no | no charge band |
| INVOICE_REPORT_FORMAT_15_INVOICE_FCY | INV/26/00094 | suitable | suitable for arithmetic, tax not shown | no | no | no | no | no charge band |
| INVOICE_REPORT_FORMAT_15_INVOICE_FCY | INV/26/00095 | suitable | suitable for arithmetic, tax not shown | no | no | no | no | no charge band |
| INVOICE_REPORT_FORMAT_15_INVOICE_FCY | INV/26/00098 | suitable | suitable for arithmetic, tax not shown | no | no | no | no | no charge band |
| INVOICE_REPORT_FORMAT_15_INVOICE_FCY | INV/26/00089 | suitable | suitable for arithmetic, tax not shown | no | no | no | no | no charge band |
| INVOICE_REPORT_FORMAT_16_STANDARD_TAX_INVOICE_PREPRINTED | INV/26/00102 | suitable | — | no | no | yes | no | fit (1 of 9) |
| INVOICE_REPORT_FORMAT_16_STANDARD_TAX_INVOICE_PREPRINTED | INV/26/00093 | not suitable | the tax is not printed | no | no | yes | no | fit (1 of 9) |
| INVOICE_REPORT_FORMAT_16_STANDARD_TAX_INVOICE_PREPRINTED | INV/26/00101 | suitable | — | no | no | yes | no | fit (3 of 9) |
| INVOICE_REPORT_FORMAT_16_STANDARD_TAX_INVOICE_PREPRINTED | INV/26/00100 | suitable | — | no | no | yes | no | fit (1 of 9) |
| INVOICE_REPORT_FORMAT_16_STANDARD_TAX_INVOICE_PREPRINTED | INV/26/00099 | suitable | — | no | no | yes | no | fit (2 of 9) |
| INVOICE_REPORT_FORMAT_16_STANDARD_TAX_INVOICE_PREPRINTED | INV/26/00097 | not suitable | the tax is not printed | no | no | yes | no | fit (1 of 9) |
| INVOICE_REPORT_FORMAT_16_STANDARD_TAX_INVOICE_PREPRINTED | INV/26/00094 | not suitable | the tax is not printed | no | no | yes | no | fit (2 of 9) |
| INVOICE_REPORT_FORMAT_16_STANDARD_TAX_INVOICE_PREPRINTED | INV/26/00095 | not suitable | the tax is not printed | no | no | yes | no | fit (1 of 9) |
| INVOICE_REPORT_FORMAT_16_STANDARD_TAX_INVOICE_PREPRINTED | INV/26/00098 | not suitable | the tax is not printed | no | no | yes | no | fit (1 of 9) |
| INVOICE_REPORT_FORMAT_16_STANDARD_TAX_INVOICE_PREPRINTED | INV/26/00089 | not suitable | the tax is not printed | no | no | yes | no | fit (1 of 9) |
| INVOICE_REPORT_FORMAT_17_INVOICE_JASPER | INV/26/00102 | suitable | — | no | no | yes | no | fit (1 of 23) |
| INVOICE_REPORT_FORMAT_17_INVOICE_JASPER | INV/26/00093 | not suitable | the tax is not printed | no | no | yes | no | fit (1 of 23) |
| INVOICE_REPORT_FORMAT_17_INVOICE_JASPER | INV/26/00101 | suitable | — | no | no | yes | no | fit (3 of 23) |
| INVOICE_REPORT_FORMAT_17_INVOICE_JASPER | INV/26/00100 | suitable | — | no | no | yes | no | fit (1 of 23) |
| INVOICE_REPORT_FORMAT_17_INVOICE_JASPER | INV/26/00099 | suitable | — | no | no | yes | no | fit (2 of 23) |
| INVOICE_REPORT_FORMAT_17_INVOICE_JASPER | INV/26/00097 | not suitable | the tax is not printed | no | no | yes | no | fit (1 of 23) |
| INVOICE_REPORT_FORMAT_17_INVOICE_JASPER | INV/26/00094 | not suitable | the tax is not printed | no | no | yes | no | fit (2 of 23) |
| INVOICE_REPORT_FORMAT_17_INVOICE_JASPER | INV/26/00095 | not suitable | the tax is not printed | no | no | yes | no | fit (1 of 23) |
| INVOICE_REPORT_FORMAT_17_INVOICE_JASPER | INV/26/00098 | not suitable | the tax is not printed | no | no | yes | no | fit (1 of 23) |
| INVOICE_REPORT_FORMAT_17_INVOICE_JASPER | INV/26/00089 | not suitable | the tax is not printed | no | no | yes | no | fit (1 of 23) |
| INVOICE_REPORT_FORMAT_18_LAND_FREIGHT_TRANSPORTATION_INVOICE | INV/26/00102 | not suitable | this layout does not print a total | no | no | no | no | fit (1 of 20) |
| INVOICE_REPORT_FORMAT_18_LAND_FREIGHT_TRANSPORTATION_INVOICE | INV/26/00093 | not suitable | this layout does not print a total | no | no | no | no | fit (1 of 20) |
| INVOICE_REPORT_FORMAT_18_LAND_FREIGHT_TRANSPORTATION_INVOICE | INV/26/00101 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 20) |
| INVOICE_REPORT_FORMAT_18_LAND_FREIGHT_TRANSPORTATION_INVOICE | INV/26/00100 | not suitable | this layout does not print a total | no | no | no | no | fit (1 of 20) |
| INVOICE_REPORT_FORMAT_18_LAND_FREIGHT_TRANSPORTATION_INVOICE | INV/26/00099 | not suitable | this layout does not print a total | no | no | no | no | fit (2 of 20) |
| INVOICE_REPORT_FORMAT_18_LAND_FREIGHT_TRANSPORTATION_INVOICE | INV/26/00097 | not suitable | this layout does not print a total | no | no | no | no | fit (1 of 20) |
| INVOICE_REPORT_FORMAT_18_LAND_FREIGHT_TRANSPORTATION_INVOICE | INV/26/00094 | not suitable | this layout does not print a total | no | no | no | no | fit (2 of 20) |
| INVOICE_REPORT_FORMAT_18_LAND_FREIGHT_TRANSPORTATION_INVOICE | INV/26/00095 | not suitable | this layout does not print a total | no | no | no | no | fit (1 of 20) |
| INVOICE_REPORT_FORMAT_18_LAND_FREIGHT_TRANSPORTATION_INVOICE | INV/26/00098 | not suitable | this layout does not print a total | no | no | no | no | fit (1 of 20) |
| INVOICE_REPORT_FORMAT_18_LAND_FREIGHT_TRANSPORTATION_INVOICE | INV/26/00089 | not suitable | this layout does not print a total | no | no | no | no | fit (1 of 20) |
| INVOICE_REPORT_FORMAT_19_DEBIT_NOTE_VIETNAM | INV/26/00102 | not suitable | this layout does not print a total | no | no | no | no | fit (1 of 34) |
| INVOICE_REPORT_FORMAT_19_DEBIT_NOTE_VIETNAM | INV/26/00093 | not suitable | this layout does not print a total | no | no | no | no | fit (1 of 34) |
| INVOICE_REPORT_FORMAT_19_DEBIT_NOTE_VIETNAM | INV/26/00101 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 34) |
| INVOICE_REPORT_FORMAT_19_DEBIT_NOTE_VIETNAM | INV/26/00100 | not suitable | this layout does not print a total | no | no | no | no | fit (1 of 34) |
| INVOICE_REPORT_FORMAT_19_DEBIT_NOTE_VIETNAM | INV/26/00099 | not suitable | this layout does not print a total | no | no | no | no | fit (2 of 34) |
| INVOICE_REPORT_FORMAT_19_DEBIT_NOTE_VIETNAM | INV/26/00097 | not suitable | this layout does not print a total | no | no | no | no | fit (1 of 34) |
| INVOICE_REPORT_FORMAT_19_DEBIT_NOTE_VIETNAM | INV/26/00094 | not suitable | this layout does not print a total | no | no | no | no | fit (2 of 34) |
| INVOICE_REPORT_FORMAT_19_DEBIT_NOTE_VIETNAM | INV/26/00095 | not suitable | this layout does not print a total | no | no | no | no | fit (1 of 34) |
| INVOICE_REPORT_FORMAT_19_DEBIT_NOTE_VIETNAM | INV/26/00098 | not suitable | this layout does not print a total | no | no | no | no | fit (1 of 34) |
| INVOICE_REPORT_FORMAT_19_DEBIT_NOTE_VIETNAM | INV/26/00089 | not suitable | this layout does not print a total | no | no | no | no | fit (1 of 34) |
| INVOICE_REPORT_FORMAT_20_TAX_INVOICE_INDIA | INV/26/00102 | not suitable | this layout does not print a total | no | no | no | yes | fit (1 of 20) |
| INVOICE_REPORT_FORMAT_20_TAX_INVOICE_INDIA | INV/26/00093 | not suitable | this layout does not print a total | no | no | no | yes | fit (1 of 20) |
| INVOICE_REPORT_FORMAT_20_TAX_INVOICE_INDIA | INV/26/00101 | not suitable | this layout does not print a total | no | no | no | yes | fit (3 of 20) |
| INVOICE_REPORT_FORMAT_20_TAX_INVOICE_INDIA | INV/26/00100 | not suitable | this layout does not print a total | no | no | no | yes | fit (1 of 20) |
| INVOICE_REPORT_FORMAT_20_TAX_INVOICE_INDIA | INV/26/00099 | not suitable | this layout does not print a total | no | no | no | yes | fit (2 of 20) |
| INVOICE_REPORT_FORMAT_20_TAX_INVOICE_INDIA | INV/26/00097 | not suitable | this layout does not print a total | no | no | no | yes | fit (1 of 20) |
| INVOICE_REPORT_FORMAT_20_TAX_INVOICE_INDIA | INV/26/00094 | not suitable | this layout does not print a total | no | no | no | yes | fit (2 of 20) |
| INVOICE_REPORT_FORMAT_20_TAX_INVOICE_INDIA | INV/26/00095 | not suitable | this layout does not print a total | no | no | no | yes | fit (1 of 20) |
| INVOICE_REPORT_FORMAT_20_TAX_INVOICE_INDIA | INV/26/00098 | not suitable | this layout does not print a total | no | no | no | yes | fit (1 of 20) |
| INVOICE_REPORT_FORMAT_20_TAX_INVOICE_INDIA | INV/26/00089 | not suitable | this layout does not print a total | no | no | no | yes | fit (1 of 20) |
| INVOICE_REPORT_FORMAT_21_WAREHOUSE_INVOICE | INV/26/00102 | not suitable | this layout does not print a total | no | no | no | no | fit (1 of 8) |
| INVOICE_REPORT_FORMAT_21_WAREHOUSE_INVOICE | INV/26/00093 | not suitable | this layout does not print a total | no | no | no | no | fit (1 of 8) |
| INVOICE_REPORT_FORMAT_21_WAREHOUSE_INVOICE | INV/26/00101 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 8) |
| INVOICE_REPORT_FORMAT_21_WAREHOUSE_INVOICE | INV/26/00100 | not suitable | this layout does not print a total | no | no | no | no | fit (1 of 8) |
| INVOICE_REPORT_FORMAT_21_WAREHOUSE_INVOICE | INV/26/00099 | not suitable | this layout does not print a total | no | no | no | no | fit (2 of 8) |
| INVOICE_REPORT_FORMAT_21_WAREHOUSE_INVOICE | INV/26/00097 | not suitable | this layout does not print a total | no | no | no | no | fit (1 of 8) |
| INVOICE_REPORT_FORMAT_21_WAREHOUSE_INVOICE | INV/26/00094 | not suitable | this layout does not print a total | no | no | no | no | fit (2 of 8) |
| INVOICE_REPORT_FORMAT_21_WAREHOUSE_INVOICE | INV/26/00095 | not suitable | this layout does not print a total | no | no | no | no | fit (1 of 8) |
| INVOICE_REPORT_FORMAT_21_WAREHOUSE_INVOICE | INV/26/00098 | not suitable | this layout does not print a total | no | no | no | no | fit (1 of 8) |
| INVOICE_REPORT_FORMAT_21_WAREHOUSE_INVOICE | INV/26/00089 | not suitable | this layout does not print a total | no | no | no | no | fit (1 of 8) |
| PROFORMA_INVOICE_ALL_CHARGES_REPORT_FORMAT | INV/26/00102 | not suitable | this layout does not print a total | no | no | no | no | fit (1 of 11) |
| PROFORMA_INVOICE_ALL_CHARGES_REPORT_FORMAT | INV/26/00093 | not suitable | this layout does not print a total | no | no | no | no | fit (1 of 11) |
| PROFORMA_INVOICE_ALL_CHARGES_REPORT_FORMAT | INV/26/00101 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 11) |
| PROFORMA_INVOICE_ALL_CHARGES_REPORT_FORMAT | INV/26/00100 | not suitable | this layout does not print a total | no | no | no | no | fit (1 of 11) |
| PROFORMA_INVOICE_ALL_CHARGES_REPORT_FORMAT | INV/26/00099 | not suitable | this layout does not print a total | no | no | no | no | fit (2 of 11) |
| PROFORMA_INVOICE_ALL_CHARGES_REPORT_FORMAT | INV/26/00097 | not suitable | this layout does not print a total | no | no | no | no | fit (1 of 11) |
| PROFORMA_INVOICE_ALL_CHARGES_REPORT_FORMAT | INV/26/00094 | not suitable | this layout does not print a total | no | no | no | no | fit (2 of 11) |
| PROFORMA_INVOICE_ALL_CHARGES_REPORT_FORMAT | INV/26/00095 | not suitable | this layout does not print a total | no | no | no | no | fit (1 of 11) |
| PROFORMA_INVOICE_ALL_CHARGES_REPORT_FORMAT | INV/26/00098 | not suitable | this layout does not print a total | no | no | no | no | fit (1 of 11) |
| PROFORMA_INVOICE_ALL_CHARGES_REPORT_FORMAT | INV/26/00089 | not suitable | this layout does not print a total | no | no | no | no | fit (1 of 11) |
| PROFORMA_INVOICE_REPORT_FORMAT_1_PROFORMA_INVOICE_ALL_CHARGES | INV/26/00102 | not suitable | this layout does not print a total | no | no | no | no | fit (1 of 7) |
| PROFORMA_INVOICE_REPORT_FORMAT_1_PROFORMA_INVOICE_ALL_CHARGES | INV/26/00093 | not suitable | this layout does not print a total | no | no | no | no | fit (1 of 7) |
| PROFORMA_INVOICE_REPORT_FORMAT_1_PROFORMA_INVOICE_ALL_CHARGES | INV/26/00101 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 7) |
| PROFORMA_INVOICE_REPORT_FORMAT_1_PROFORMA_INVOICE_ALL_CHARGES | INV/26/00100 | not suitable | this layout does not print a total | no | no | no | no | fit (1 of 7) |
| PROFORMA_INVOICE_REPORT_FORMAT_1_PROFORMA_INVOICE_ALL_CHARGES | INV/26/00099 | not suitable | this layout does not print a total | no | no | no | no | fit (2 of 7) |
| PROFORMA_INVOICE_REPORT_FORMAT_1_PROFORMA_INVOICE_ALL_CHARGES | INV/26/00097 | not suitable | this layout does not print a total | no | no | no | no | fit (1 of 7) |
| PROFORMA_INVOICE_REPORT_FORMAT_1_PROFORMA_INVOICE_ALL_CHARGES | INV/26/00094 | not suitable | this layout does not print a total | no | no | no | no | fit (2 of 7) |
| PROFORMA_INVOICE_REPORT_FORMAT_1_PROFORMA_INVOICE_ALL_CHARGES | INV/26/00095 | not suitable | this layout does not print a total | no | no | no | no | fit (1 of 7) |
| PROFORMA_INVOICE_REPORT_FORMAT_1_PROFORMA_INVOICE_ALL_CHARGES | INV/26/00098 | not suitable | this layout does not print a total | no | no | no | no | fit (1 of 7) |
| PROFORMA_INVOICE_REPORT_FORMAT_1_PROFORMA_INVOICE_ALL_CHARGES | INV/26/00089 | not suitable | this layout does not print a total | no | no | no | no | fit (1 of 7) |
| PROFORMA_INVOICE_REPORT_FORMAT_2_PROFORMA_INVOICE_ALL_CHARGES | INV/26/00102 | not suitable | this layout does not print a total | no | no | no | no | fit (1 of 17) |
| PROFORMA_INVOICE_REPORT_FORMAT_2_PROFORMA_INVOICE_ALL_CHARGES | INV/26/00093 | not suitable | this layout does not print a total | no | no | no | no | fit (1 of 17) |
| PROFORMA_INVOICE_REPORT_FORMAT_2_PROFORMA_INVOICE_ALL_CHARGES | INV/26/00101 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 17) |
| PROFORMA_INVOICE_REPORT_FORMAT_2_PROFORMA_INVOICE_ALL_CHARGES | INV/26/00100 | not suitable | this layout does not print a total | no | no | no | no | fit (1 of 17) |
| PROFORMA_INVOICE_REPORT_FORMAT_2_PROFORMA_INVOICE_ALL_CHARGES | INV/26/00099 | not suitable | this layout does not print a total | no | no | no | no | fit (2 of 17) |
| PROFORMA_INVOICE_REPORT_FORMAT_2_PROFORMA_INVOICE_ALL_CHARGES | INV/26/00097 | not suitable | this layout does not print a total | no | no | no | no | fit (1 of 17) |
| PROFORMA_INVOICE_REPORT_FORMAT_2_PROFORMA_INVOICE_ALL_CHARGES | INV/26/00094 | not suitable | this layout does not print a total | no | no | no | no | fit (2 of 17) |
| PROFORMA_INVOICE_REPORT_FORMAT_2_PROFORMA_INVOICE_ALL_CHARGES | INV/26/00095 | not suitable | this layout does not print a total | no | no | no | no | fit (1 of 17) |
| PROFORMA_INVOICE_REPORT_FORMAT_2_PROFORMA_INVOICE_ALL_CHARGES | INV/26/00098 | not suitable | this layout does not print a total | no | no | no | no | fit (1 of 17) |
| PROFORMA_INVOICE_REPORT_FORMAT_2_PROFORMA_INVOICE_ALL_CHARGES | INV/26/00089 | not suitable | this layout does not print a total | no | no | no | no | fit (1 of 17) |
| PURCHASE_INVOICE_REPORT_FORMAT_1 | INV/26/00102 | not suitable | this layout does not print a total | no | no | no | yes | no charge band |
| PURCHASE_INVOICE_REPORT_FORMAT_1 | INV/26/00093 | not suitable | this layout does not print a total | no | no | no | yes | no charge band |
| PURCHASE_INVOICE_REPORT_FORMAT_1 | INV/26/00101 | not suitable | this layout does not print a total | no | no | no | yes | no charge band |
| PURCHASE_INVOICE_REPORT_FORMAT_1 | INV/26/00100 | not suitable | this layout does not print a total | no | no | no | yes | no charge band |
| PURCHASE_INVOICE_REPORT_FORMAT_1 | INV/26/00099 | not suitable | this layout does not print a total | no | no | no | yes | no charge band |
| PURCHASE_INVOICE_REPORT_FORMAT_1 | INV/26/00097 | not suitable | this layout does not print a total | no | no | no | yes | no charge band |
| PURCHASE_INVOICE_REPORT_FORMAT_1 | INV/26/00094 | not suitable | this layout does not print a total | no | no | no | yes | no charge band |
| PURCHASE_INVOICE_REPORT_FORMAT_1 | INV/26/00095 | not suitable | this layout does not print a total | no | no | no | yes | no charge band |
| PURCHASE_INVOICE_REPORT_FORMAT_1 | INV/26/00098 | not suitable | this layout does not print a total | no | no | no | yes | no charge band |
| PURCHASE_INVOICE_REPORT_FORMAT_1 | INV/26/00089 | not suitable | this layout does not print a total | no | no | no | yes | no charge band |
| PURCHASE_INVOICE_REPORT_FORMAT_2 | INV/26/00102 | not suitable | this layout does not print a total | no | no | no | yes | no charge band |
| PURCHASE_INVOICE_REPORT_FORMAT_2 | INV/26/00093 | not suitable | this layout does not print a total | no | no | no | yes | no charge band |
| PURCHASE_INVOICE_REPORT_FORMAT_2 | INV/26/00101 | not suitable | this layout does not print a total | no | no | no | yes | no charge band |
| PURCHASE_INVOICE_REPORT_FORMAT_2 | INV/26/00100 | not suitable | this layout does not print a total | no | no | no | yes | no charge band |
| PURCHASE_INVOICE_REPORT_FORMAT_2 | INV/26/00099 | not suitable | this layout does not print a total | no | no | no | yes | no charge band |
| PURCHASE_INVOICE_REPORT_FORMAT_2 | INV/26/00097 | not suitable | this layout does not print a total | no | no | no | yes | no charge band |
| PURCHASE_INVOICE_REPORT_FORMAT_2 | INV/26/00094 | not suitable | this layout does not print a total | no | no | no | yes | no charge band |
| PURCHASE_INVOICE_REPORT_FORMAT_2 | INV/26/00095 | not suitable | this layout does not print a total | no | no | no | yes | no charge band |
| PURCHASE_INVOICE_REPORT_FORMAT_2 | INV/26/00098 | not suitable | this layout does not print a total | no | no | no | yes | no charge band |
| PURCHASE_INVOICE_REPORT_FORMAT_2 | INV/26/00089 | not suitable | this layout does not print a total | no | no | no | yes | no charge band |

## Synthetic records

These 15 records are anonymized and marked synthetic. The downloaded invoices do not include a discount, a rounding amount, or a three-line invoice that also has tax.

| Code | Record | Suitable | Reason | Tax row | Line tax | Subtotal | GST-blocked | Lines |
|---|---|---|---|---|---|---|---|---|
| INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA | SYN-01 | not suitable | this layout does not print a total | no | no | no | yes | fit (3 of 11) |
| INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA | SYN-02 | not suitable | this layout does not print a total | no | no | no | yes | fit (4 of 11) |
| INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA | SYN-03 | not suitable | this layout does not print a total | no | no | no | yes | fit (5 of 11) |
| INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA | SYN-04 | not suitable | this layout does not print a total | no | no | no | yes | fit (3 of 11) |
| INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA | SYN-05 | not suitable | this layout does not print a total | no | no | no | yes | fit (6 of 11) |
| INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA | SYN-06 | not suitable | this layout does not print a total | no | no | no | yes | fit (3 of 11) |
| INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA | SYN-07 | not suitable | this layout does not print a total | no | no | no | yes | fit (8 of 11) |
| INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA | SYN-08 | not suitable | this layout does not print a total | no | no | no | yes | fit (3 of 11) |
| INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA | SYN-09 | not suitable | this layout does not print a total | no | no | no | yes | fit (3 of 11) |
| INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA | SYN-10 | not suitable | this layout does not print a total | no | no | no | yes | paginate (12 lines, 11 per page) |
| INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA | SYN-11 | not suitable | this layout does not print a total | no | no | no | yes | fit (3 of 11) |
| INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA | SYN-12 | not suitable | this layout does not print a total | no | no | no | yes | fit (4 of 11) |
| INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA | SYN-13 | not suitable | this layout does not print a total | no | no | no | yes | fit (3 of 11) |
| INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA | SYN-14 | not suitable | this layout does not print a total | no | no | no | yes | fit (3 of 11) |
| INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA | SYN-15 | not suitable | this layout does not print a total | no | no | no | yes | fit (3 of 11) |
| INVOICE_REPORT_FORMAT_2_TAX_INVOICE_INDIA | SYN-01 | not suitable | this layout does not print a total | no | yes | no | yes | fit (3 of 4) |
| INVOICE_REPORT_FORMAT_2_TAX_INVOICE_INDIA | SYN-02 | not suitable | this layout does not print a total | no | yes | no | yes | fit (4 of 4) |
| INVOICE_REPORT_FORMAT_2_TAX_INVOICE_INDIA | SYN-03 | not suitable | this layout does not print a total | no | yes | no | yes | paginate (5 lines, 4 per page) |
| INVOICE_REPORT_FORMAT_2_TAX_INVOICE_INDIA | SYN-04 | not suitable | this layout does not print a total | no | yes | no | yes | fit (3 of 4) |
| INVOICE_REPORT_FORMAT_2_TAX_INVOICE_INDIA | SYN-05 | not suitable | this layout does not print a total | no | yes | no | yes | paginate (6 lines, 4 per page) |
| INVOICE_REPORT_FORMAT_2_TAX_INVOICE_INDIA | SYN-06 | not suitable | this layout does not print a total | no | yes | no | yes | fit (3 of 4) |
| INVOICE_REPORT_FORMAT_2_TAX_INVOICE_INDIA | SYN-07 | not suitable | this layout does not print a total | no | yes | no | yes | paginate (8 lines, 4 per page) |
| INVOICE_REPORT_FORMAT_2_TAX_INVOICE_INDIA | SYN-08 | not suitable | this layout does not print a total | no | yes | no | yes | fit (3 of 4) |
| INVOICE_REPORT_FORMAT_2_TAX_INVOICE_INDIA | SYN-09 | not suitable | this layout does not print a total | no | yes | no | yes | fit (3 of 4) |
| INVOICE_REPORT_FORMAT_2_TAX_INVOICE_INDIA | SYN-10 | not suitable | this layout does not print a total | no | yes | no | yes | paginate (12 lines, 4 per page) |
| INVOICE_REPORT_FORMAT_2_TAX_INVOICE_INDIA | SYN-11 | not suitable | this layout does not print a total | no | yes | no | yes | fit (3 of 4) |
| INVOICE_REPORT_FORMAT_2_TAX_INVOICE_INDIA | SYN-12 | not suitable | this layout does not print a total | no | yes | no | yes | fit (4 of 4) |
| INVOICE_REPORT_FORMAT_2_TAX_INVOICE_INDIA | SYN-13 | not suitable | this layout does not print a total | no | yes | no | yes | fit (3 of 4) |
| INVOICE_REPORT_FORMAT_2_TAX_INVOICE_INDIA | SYN-14 | not suitable | this layout does not print a total | no | yes | no | yes | fit (3 of 4) |
| INVOICE_REPORT_FORMAT_2_TAX_INVOICE_INDIA | SYN-15 | not suitable | this layout does not print a total | no | yes | no | yes | fit (3 of 4) |
| INVOICE_REPORT_FORMAT_3_SUMMARY_INVOICE | SYN-01 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 18) |
| INVOICE_REPORT_FORMAT_3_SUMMARY_INVOICE | SYN-02 | not suitable | this layout does not print a total | no | no | no | no | fit (4 of 18) |
| INVOICE_REPORT_FORMAT_3_SUMMARY_INVOICE | SYN-03 | not suitable | this layout does not print a total | no | no | no | no | fit (5 of 18) |
| INVOICE_REPORT_FORMAT_3_SUMMARY_INVOICE | SYN-04 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 18) |
| INVOICE_REPORT_FORMAT_3_SUMMARY_INVOICE | SYN-05 | not suitable | this layout does not print a total | no | no | no | no | fit (6 of 18) |
| INVOICE_REPORT_FORMAT_3_SUMMARY_INVOICE | SYN-06 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 18) |
| INVOICE_REPORT_FORMAT_3_SUMMARY_INVOICE | SYN-07 | not suitable | this layout does not print a total | no | no | no | no | fit (8 of 18) |
| INVOICE_REPORT_FORMAT_3_SUMMARY_INVOICE | SYN-08 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 18) |
| INVOICE_REPORT_FORMAT_3_SUMMARY_INVOICE | SYN-09 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 18) |
| INVOICE_REPORT_FORMAT_3_SUMMARY_INVOICE | SYN-10 | not suitable | this layout does not print a total | no | no | no | no | fit (12 of 18) |
| INVOICE_REPORT_FORMAT_3_SUMMARY_INVOICE | SYN-11 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 18) |
| INVOICE_REPORT_FORMAT_3_SUMMARY_INVOICE | SYN-12 | not suitable | this layout does not print a total | no | no | no | no | fit (4 of 18) |
| INVOICE_REPORT_FORMAT_3_SUMMARY_INVOICE | SYN-13 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 18) |
| INVOICE_REPORT_FORMAT_3_SUMMARY_INVOICE | SYN-14 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 18) |
| INVOICE_REPORT_FORMAT_3_SUMMARY_INVOICE | SYN-15 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 18) |
| INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE | SYN-01 | suitable | — | no | no | yes | no | fit (3 of 10) |
| INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE | SYN-02 | not suitable | the tax is not printed | no | no | yes | no | fit (4 of 10) |
| INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE | SYN-03 | not suitable | the tax is not printed | no | no | yes | no | fit (5 of 10) |
| INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE | SYN-04 | not suitable | the subtotal does not add up to the total | no | no | yes | no | fit (3 of 10) |
| INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE | SYN-05 | not suitable | the rounding is not printed | no | no | yes | no | fit (6 of 10) |
| INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE | SYN-06 | not suitable | the subtotal does not add up to the total | no | no | yes | no | fit (3 of 10) |
| INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE | SYN-07 | not suitable | the tax is not printed | no | no | yes | no | fit (8 of 10) |
| INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE | SYN-08 | suitable | — | no | no | yes | no | fit (3 of 10) |
| INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE | SYN-09 | not suitable | the subtotal does not add up to the total | no | no | yes | no | fit (3 of 10) |
| INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE | SYN-10 | not suitable | the tax is not printed | no | no | yes | no | paginate (12 lines, 10 per page) |
| INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE | SYN-11 | not suitable | the tax is not printed | no | no | yes | no | fit (3 of 10) |
| INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE | SYN-12 | not suitable | the subtotal does not add up to the total | no | no | yes | no | fit (4 of 10) |
| INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE | SYN-13 | suitable | — | no | no | yes | no | fit (3 of 10) |
| INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE | SYN-14 | not suitable | the tax is not printed | no | no | yes | no | fit (3 of 10) |
| INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE | SYN-15 | not suitable | the subtotal does not add up to the total | no | no | yes | no | fit (3 of 10) |
| INVOICE_REPORT_FORMAT_5_TAX_INVOICE_INDIA | SYN-01 | not suitable | this layout does not print a total | no | no | no | yes | fit (3 of 16) |
| INVOICE_REPORT_FORMAT_5_TAX_INVOICE_INDIA | SYN-02 | not suitable | this layout does not print a total | no | no | no | yes | fit (4 of 16) |
| INVOICE_REPORT_FORMAT_5_TAX_INVOICE_INDIA | SYN-03 | not suitable | this layout does not print a total | no | no | no | yes | fit (5 of 16) |
| INVOICE_REPORT_FORMAT_5_TAX_INVOICE_INDIA | SYN-04 | not suitable | this layout does not print a total | no | no | no | yes | fit (3 of 16) |
| INVOICE_REPORT_FORMAT_5_TAX_INVOICE_INDIA | SYN-05 | not suitable | this layout does not print a total | no | no | no | yes | fit (6 of 16) |
| INVOICE_REPORT_FORMAT_5_TAX_INVOICE_INDIA | SYN-06 | not suitable | this layout does not print a total | no | no | no | yes | fit (3 of 16) |
| INVOICE_REPORT_FORMAT_5_TAX_INVOICE_INDIA | SYN-07 | not suitable | this layout does not print a total | no | no | no | yes | fit (8 of 16) |
| INVOICE_REPORT_FORMAT_5_TAX_INVOICE_INDIA | SYN-08 | not suitable | this layout does not print a total | no | no | no | yes | fit (3 of 16) |
| INVOICE_REPORT_FORMAT_5_TAX_INVOICE_INDIA | SYN-09 | not suitable | this layout does not print a total | no | no | no | yes | fit (3 of 16) |
| INVOICE_REPORT_FORMAT_5_TAX_INVOICE_INDIA | SYN-10 | not suitable | this layout does not print a total | no | no | no | yes | fit (12 of 16) |
| INVOICE_REPORT_FORMAT_5_TAX_INVOICE_INDIA | SYN-11 | not suitable | this layout does not print a total | no | no | no | yes | fit (3 of 16) |
| INVOICE_REPORT_FORMAT_5_TAX_INVOICE_INDIA | SYN-12 | not suitable | this layout does not print a total | no | no | no | yes | fit (4 of 16) |
| INVOICE_REPORT_FORMAT_5_TAX_INVOICE_INDIA | SYN-13 | not suitable | this layout does not print a total | no | no | no | yes | fit (3 of 16) |
| INVOICE_REPORT_FORMAT_5_TAX_INVOICE_INDIA | SYN-14 | not suitable | this layout does not print a total | no | no | no | yes | fit (3 of 16) |
| INVOICE_REPORT_FORMAT_5_TAX_INVOICE_INDIA | SYN-15 | not suitable | this layout does not print a total | no | no | no | yes | fit (3 of 16) |
| INVOICE_REPORT_FORMAT_6_SIMPLE_INVOICE_INDIA | SYN-01 | not suitable | this layout does not print a total | no | no | no | yes | fit (3 of 14) |
| INVOICE_REPORT_FORMAT_6_SIMPLE_INVOICE_INDIA | SYN-02 | not suitable | this layout does not print a total | no | no | no | yes | fit (4 of 14) |
| INVOICE_REPORT_FORMAT_6_SIMPLE_INVOICE_INDIA | SYN-03 | not suitable | this layout does not print a total | no | no | no | yes | fit (5 of 14) |
| INVOICE_REPORT_FORMAT_6_SIMPLE_INVOICE_INDIA | SYN-04 | not suitable | this layout does not print a total | no | no | no | yes | fit (3 of 14) |
| INVOICE_REPORT_FORMAT_6_SIMPLE_INVOICE_INDIA | SYN-05 | not suitable | this layout does not print a total | no | no | no | yes | fit (6 of 14) |
| INVOICE_REPORT_FORMAT_6_SIMPLE_INVOICE_INDIA | SYN-06 | not suitable | this layout does not print a total | no | no | no | yes | fit (3 of 14) |
| INVOICE_REPORT_FORMAT_6_SIMPLE_INVOICE_INDIA | SYN-07 | not suitable | this layout does not print a total | no | no | no | yes | fit (8 of 14) |
| INVOICE_REPORT_FORMAT_6_SIMPLE_INVOICE_INDIA | SYN-08 | not suitable | this layout does not print a total | no | no | no | yes | fit (3 of 14) |
| INVOICE_REPORT_FORMAT_6_SIMPLE_INVOICE_INDIA | SYN-09 | not suitable | this layout does not print a total | no | no | no | yes | fit (3 of 14) |
| INVOICE_REPORT_FORMAT_6_SIMPLE_INVOICE_INDIA | SYN-10 | not suitable | this layout does not print a total | no | no | no | yes | fit (12 of 14) |
| INVOICE_REPORT_FORMAT_6_SIMPLE_INVOICE_INDIA | SYN-11 | not suitable | this layout does not print a total | no | no | no | yes | fit (3 of 14) |
| INVOICE_REPORT_FORMAT_6_SIMPLE_INVOICE_INDIA | SYN-12 | not suitable | this layout does not print a total | no | no | no | yes | fit (4 of 14) |
| INVOICE_REPORT_FORMAT_6_SIMPLE_INVOICE_INDIA | SYN-13 | not suitable | this layout does not print a total | no | no | no | yes | fit (3 of 14) |
| INVOICE_REPORT_FORMAT_6_SIMPLE_INVOICE_INDIA | SYN-14 | not suitable | this layout does not print a total | no | no | no | yes | fit (3 of 14) |
| INVOICE_REPORT_FORMAT_6_SIMPLE_INVOICE_INDIA | SYN-15 | not suitable | this layout does not print a total | no | no | no | yes | fit (3 of 14) |
| INVOICE_REPORT_FORMAT_7_SIMPLE_INVOICE | SYN-01 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 23) |
| INVOICE_REPORT_FORMAT_7_SIMPLE_INVOICE | SYN-02 | not suitable | this layout does not print a total | no | no | no | no | fit (4 of 23) |
| INVOICE_REPORT_FORMAT_7_SIMPLE_INVOICE | SYN-03 | not suitable | this layout does not print a total | no | no | no | no | fit (5 of 23) |
| INVOICE_REPORT_FORMAT_7_SIMPLE_INVOICE | SYN-04 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 23) |
| INVOICE_REPORT_FORMAT_7_SIMPLE_INVOICE | SYN-05 | not suitable | this layout does not print a total | no | no | no | no | fit (6 of 23) |
| INVOICE_REPORT_FORMAT_7_SIMPLE_INVOICE | SYN-06 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 23) |
| INVOICE_REPORT_FORMAT_7_SIMPLE_INVOICE | SYN-07 | not suitable | this layout does not print a total | no | no | no | no | fit (8 of 23) |
| INVOICE_REPORT_FORMAT_7_SIMPLE_INVOICE | SYN-08 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 23) |
| INVOICE_REPORT_FORMAT_7_SIMPLE_INVOICE | SYN-09 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 23) |
| INVOICE_REPORT_FORMAT_7_SIMPLE_INVOICE | SYN-10 | not suitable | this layout does not print a total | no | no | no | no | fit (12 of 23) |
| INVOICE_REPORT_FORMAT_7_SIMPLE_INVOICE | SYN-11 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 23) |
| INVOICE_REPORT_FORMAT_7_SIMPLE_INVOICE | SYN-12 | not suitable | this layout does not print a total | no | no | no | no | fit (4 of 23) |
| INVOICE_REPORT_FORMAT_7_SIMPLE_INVOICE | SYN-13 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 23) |
| INVOICE_REPORT_FORMAT_7_SIMPLE_INVOICE | SYN-14 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 23) |
| INVOICE_REPORT_FORMAT_7_SIMPLE_INVOICE | SYN-15 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 23) |
| INVOICE_REPORT_FORMAT_8_STANDARD_INVOICE_ARABIC | SYN-01 | suitable | — | no | no | no | no | fit (3 of 23) |
| INVOICE_REPORT_FORMAT_8_STANDARD_INVOICE_ARABIC | SYN-02 | suitable | suitable for arithmetic, tax not shown | no | no | no | no | fit (4 of 23) |
| INVOICE_REPORT_FORMAT_8_STANDARD_INVOICE_ARABIC | SYN-03 | suitable | suitable for arithmetic, tax not shown | no | no | no | no | fit (5 of 23) |
| INVOICE_REPORT_FORMAT_8_STANDARD_INVOICE_ARABIC | SYN-04 | not suitable | the discount is not printed | no | no | no | no | fit (3 of 23) |
| INVOICE_REPORT_FORMAT_8_STANDARD_INVOICE_ARABIC | SYN-05 | not suitable | the rounding is not printed | no | no | no | no | fit (6 of 23) |
| INVOICE_REPORT_FORMAT_8_STANDARD_INVOICE_ARABIC | SYN-06 | not suitable | the discount is not printed | no | no | no | no | fit (3 of 23) |
| INVOICE_REPORT_FORMAT_8_STANDARD_INVOICE_ARABIC | SYN-07 | suitable | suitable for arithmetic, tax not shown | no | no | no | no | fit (8 of 23) |
| INVOICE_REPORT_FORMAT_8_STANDARD_INVOICE_ARABIC | SYN-08 | suitable | — | no | no | no | no | fit (3 of 23) |
| INVOICE_REPORT_FORMAT_8_STANDARD_INVOICE_ARABIC | SYN-09 | not suitable | the rounding is not printed | no | no | no | no | fit (3 of 23) |
| INVOICE_REPORT_FORMAT_8_STANDARD_INVOICE_ARABIC | SYN-10 | suitable | suitable for arithmetic, tax not shown | no | no | no | no | fit (12 of 23) |
| INVOICE_REPORT_FORMAT_8_STANDARD_INVOICE_ARABIC | SYN-11 | suitable | suitable for arithmetic, tax not shown | no | no | no | no | fit (3 of 23) |
| INVOICE_REPORT_FORMAT_8_STANDARD_INVOICE_ARABIC | SYN-12 | not suitable | the discount is not printed | no | no | no | no | fit (4 of 23) |
| INVOICE_REPORT_FORMAT_8_STANDARD_INVOICE_ARABIC | SYN-13 | suitable | — | no | no | no | no | fit (3 of 23) |
| INVOICE_REPORT_FORMAT_8_STANDARD_INVOICE_ARABIC | SYN-14 | suitable | suitable for arithmetic, tax not shown | no | no | no | no | fit (3 of 23) |
| INVOICE_REPORT_FORMAT_8_STANDARD_INVOICE_ARABIC | SYN-15 | not suitable | the lines do not add up to the total | no | no | no | no | fit (3 of 23) |
| INVOICE_REPORT_FORMAT_9_STANDARD_INVOICE_USA | SYN-01 | suitable | — | no | no | no | no | fit (3 of 16) |
| INVOICE_REPORT_FORMAT_9_STANDARD_INVOICE_USA | SYN-02 | suitable | suitable for arithmetic, tax not shown | no | no | no | no | fit (4 of 16) |
| INVOICE_REPORT_FORMAT_9_STANDARD_INVOICE_USA | SYN-03 | suitable | suitable for arithmetic, tax not shown | no | no | no | no | fit (5 of 16) |
| INVOICE_REPORT_FORMAT_9_STANDARD_INVOICE_USA | SYN-04 | not suitable | the discount is not printed | no | no | no | no | fit (3 of 16) |
| INVOICE_REPORT_FORMAT_9_STANDARD_INVOICE_USA | SYN-05 | not suitable | the rounding is not printed | no | no | no | no | fit (6 of 16) |
| INVOICE_REPORT_FORMAT_9_STANDARD_INVOICE_USA | SYN-06 | not suitable | the discount is not printed | no | no | no | no | fit (3 of 16) |
| INVOICE_REPORT_FORMAT_9_STANDARD_INVOICE_USA | SYN-07 | suitable | suitable for arithmetic, tax not shown | no | no | no | no | fit (8 of 16) |
| INVOICE_REPORT_FORMAT_9_STANDARD_INVOICE_USA | SYN-08 | suitable | — | no | no | no | no | fit (3 of 16) |
| INVOICE_REPORT_FORMAT_9_STANDARD_INVOICE_USA | SYN-09 | not suitable | the rounding is not printed | no | no | no | no | fit (3 of 16) |
| INVOICE_REPORT_FORMAT_9_STANDARD_INVOICE_USA | SYN-10 | suitable | suitable for arithmetic, tax not shown | no | no | no | no | fit (12 of 16) |
| INVOICE_REPORT_FORMAT_9_STANDARD_INVOICE_USA | SYN-11 | suitable | suitable for arithmetic, tax not shown | no | no | no | no | fit (3 of 16) |
| INVOICE_REPORT_FORMAT_9_STANDARD_INVOICE_USA | SYN-12 | not suitable | the discount is not printed | no | no | no | no | fit (4 of 16) |
| INVOICE_REPORT_FORMAT_9_STANDARD_INVOICE_USA | SYN-13 | suitable | — | no | no | no | no | fit (3 of 16) |
| INVOICE_REPORT_FORMAT_9_STANDARD_INVOICE_USA | SYN-14 | suitable | suitable for arithmetic, tax not shown | no | no | no | no | fit (3 of 16) |
| INVOICE_REPORT_FORMAT_9_STANDARD_INVOICE_USA | SYN-15 | not suitable | the lines do not add up to the total | no | no | no | no | fit (3 of 16) |
| INVOICE_REPORT_FORMAT_10_STANDARD_INVOICE | SYN-01 | suitable | — | no | no | no | no | fit (3 of 7) |
| INVOICE_REPORT_FORMAT_10_STANDARD_INVOICE | SYN-02 | suitable | suitable for arithmetic, tax not shown | no | no | no | no | fit (4 of 7) |
| INVOICE_REPORT_FORMAT_10_STANDARD_INVOICE | SYN-03 | suitable | suitable for arithmetic, tax not shown | no | no | no | no | fit (5 of 7) |
| INVOICE_REPORT_FORMAT_10_STANDARD_INVOICE | SYN-04 | not suitable | the discount is not printed | no | no | no | no | fit (3 of 7) |
| INVOICE_REPORT_FORMAT_10_STANDARD_INVOICE | SYN-05 | not suitable | the rounding is not printed | no | no | no | no | fit (6 of 7) |
| INVOICE_REPORT_FORMAT_10_STANDARD_INVOICE | SYN-06 | not suitable | the discount is not printed | no | no | no | no | fit (3 of 7) |
| INVOICE_REPORT_FORMAT_10_STANDARD_INVOICE | SYN-07 | suitable | suitable for arithmetic, tax not shown | no | no | no | no | paginate (8 lines, 7 per page) |
| INVOICE_REPORT_FORMAT_10_STANDARD_INVOICE | SYN-08 | suitable | — | no | no | no | no | fit (3 of 7) |
| INVOICE_REPORT_FORMAT_10_STANDARD_INVOICE | SYN-09 | not suitable | the rounding is not printed | no | no | no | no | fit (3 of 7) |
| INVOICE_REPORT_FORMAT_10_STANDARD_INVOICE | SYN-10 | suitable | suitable for arithmetic, tax not shown | no | no | no | no | paginate (12 lines, 7 per page) |
| INVOICE_REPORT_FORMAT_10_STANDARD_INVOICE | SYN-11 | suitable | suitable for arithmetic, tax not shown | no | no | no | no | fit (3 of 7) |
| INVOICE_REPORT_FORMAT_10_STANDARD_INVOICE | SYN-12 | not suitable | the discount is not printed | no | no | no | no | fit (4 of 7) |
| INVOICE_REPORT_FORMAT_10_STANDARD_INVOICE | SYN-13 | suitable | — | no | no | no | no | fit (3 of 7) |
| INVOICE_REPORT_FORMAT_10_STANDARD_INVOICE | SYN-14 | suitable | suitable for arithmetic, tax not shown | no | no | no | no | fit (3 of 7) |
| INVOICE_REPORT_FORMAT_10_STANDARD_INVOICE | SYN-15 | not suitable | the lines do not add up to the total | no | no | no | no | fit (3 of 7) |
| INVOICE_REPORT_FORMAT_11_STANDARD_INVOICE_LAND | SYN-01 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 16) |
| INVOICE_REPORT_FORMAT_11_STANDARD_INVOICE_LAND | SYN-02 | not suitable | this layout does not print a total | no | no | no | no | fit (4 of 16) |
| INVOICE_REPORT_FORMAT_11_STANDARD_INVOICE_LAND | SYN-03 | not suitable | this layout does not print a total | no | no | no | no | fit (5 of 16) |
| INVOICE_REPORT_FORMAT_11_STANDARD_INVOICE_LAND | SYN-04 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 16) |
| INVOICE_REPORT_FORMAT_11_STANDARD_INVOICE_LAND | SYN-05 | not suitable | this layout does not print a total | no | no | no | no | fit (6 of 16) |
| INVOICE_REPORT_FORMAT_11_STANDARD_INVOICE_LAND | SYN-06 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 16) |
| INVOICE_REPORT_FORMAT_11_STANDARD_INVOICE_LAND | SYN-07 | not suitable | this layout does not print a total | no | no | no | no | fit (8 of 16) |
| INVOICE_REPORT_FORMAT_11_STANDARD_INVOICE_LAND | SYN-08 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 16) |
| INVOICE_REPORT_FORMAT_11_STANDARD_INVOICE_LAND | SYN-09 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 16) |
| INVOICE_REPORT_FORMAT_11_STANDARD_INVOICE_LAND | SYN-10 | not suitable | this layout does not print a total | no | no | no | no | fit (12 of 16) |
| INVOICE_REPORT_FORMAT_11_STANDARD_INVOICE_LAND | SYN-11 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 16) |
| INVOICE_REPORT_FORMAT_11_STANDARD_INVOICE_LAND | SYN-12 | not suitable | this layout does not print a total | no | no | no | no | fit (4 of 16) |
| INVOICE_REPORT_FORMAT_11_STANDARD_INVOICE_LAND | SYN-13 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 16) |
| INVOICE_REPORT_FORMAT_11_STANDARD_INVOICE_LAND | SYN-14 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 16) |
| INVOICE_REPORT_FORMAT_11_STANDARD_INVOICE_LAND | SYN-15 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 16) |
| INVOICE_REPORT_FORMAT_12_STANDARD_INVOICE_PREPRINTED | SYN-01 | suitable | — | no | no | no | no | fit (3 of 11) |
| INVOICE_REPORT_FORMAT_12_STANDARD_INVOICE_PREPRINTED | SYN-02 | suitable | suitable for arithmetic, tax not shown | no | no | no | no | fit (4 of 11) |
| INVOICE_REPORT_FORMAT_12_STANDARD_INVOICE_PREPRINTED | SYN-03 | suitable | suitable for arithmetic, tax not shown | no | no | no | no | fit (5 of 11) |
| INVOICE_REPORT_FORMAT_12_STANDARD_INVOICE_PREPRINTED | SYN-04 | not suitable | the discount is not printed | no | no | no | no | fit (3 of 11) |
| INVOICE_REPORT_FORMAT_12_STANDARD_INVOICE_PREPRINTED | SYN-05 | not suitable | the rounding is not printed | no | no | no | no | fit (6 of 11) |
| INVOICE_REPORT_FORMAT_12_STANDARD_INVOICE_PREPRINTED | SYN-06 | not suitable | the discount is not printed | no | no | no | no | fit (3 of 11) |
| INVOICE_REPORT_FORMAT_12_STANDARD_INVOICE_PREPRINTED | SYN-07 | suitable | suitable for arithmetic, tax not shown | no | no | no | no | fit (8 of 11) |
| INVOICE_REPORT_FORMAT_12_STANDARD_INVOICE_PREPRINTED | SYN-08 | suitable | — | no | no | no | no | fit (3 of 11) |
| INVOICE_REPORT_FORMAT_12_STANDARD_INVOICE_PREPRINTED | SYN-09 | not suitable | the rounding is not printed | no | no | no | no | fit (3 of 11) |
| INVOICE_REPORT_FORMAT_12_STANDARD_INVOICE_PREPRINTED | SYN-10 | suitable | suitable for arithmetic, tax not shown | no | no | no | no | paginate (12 lines, 11 per page) |
| INVOICE_REPORT_FORMAT_12_STANDARD_INVOICE_PREPRINTED | SYN-11 | suitable | suitable for arithmetic, tax not shown | no | no | no | no | fit (3 of 11) |
| INVOICE_REPORT_FORMAT_12_STANDARD_INVOICE_PREPRINTED | SYN-12 | not suitable | the discount is not printed | no | no | no | no | fit (4 of 11) |
| INVOICE_REPORT_FORMAT_12_STANDARD_INVOICE_PREPRINTED | SYN-13 | suitable | — | no | no | no | no | fit (3 of 11) |
| INVOICE_REPORT_FORMAT_12_STANDARD_INVOICE_PREPRINTED | SYN-14 | suitable | suitable for arithmetic, tax not shown | no | no | no | no | fit (3 of 11) |
| INVOICE_REPORT_FORMAT_12_STANDARD_INVOICE_PREPRINTED | SYN-15 | not suitable | the lines do not add up to the total | no | no | no | no | fit (3 of 11) |
| INVOICE_REPORT_FORMAT_13_STANDARD_INVOICE_USA | SYN-01 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 30) |
| INVOICE_REPORT_FORMAT_13_STANDARD_INVOICE_USA | SYN-02 | not suitable | this layout does not print a total | no | no | no | no | fit (4 of 30) |
| INVOICE_REPORT_FORMAT_13_STANDARD_INVOICE_USA | SYN-03 | not suitable | this layout does not print a total | no | no | no | no | fit (5 of 30) |
| INVOICE_REPORT_FORMAT_13_STANDARD_INVOICE_USA | SYN-04 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 30) |
| INVOICE_REPORT_FORMAT_13_STANDARD_INVOICE_USA | SYN-05 | not suitable | this layout does not print a total | no | no | no | no | fit (6 of 30) |
| INVOICE_REPORT_FORMAT_13_STANDARD_INVOICE_USA | SYN-06 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 30) |
| INVOICE_REPORT_FORMAT_13_STANDARD_INVOICE_USA | SYN-07 | not suitable | this layout does not print a total | no | no | no | no | fit (8 of 30) |
| INVOICE_REPORT_FORMAT_13_STANDARD_INVOICE_USA | SYN-08 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 30) |
| INVOICE_REPORT_FORMAT_13_STANDARD_INVOICE_USA | SYN-09 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 30) |
| INVOICE_REPORT_FORMAT_13_STANDARD_INVOICE_USA | SYN-10 | not suitable | this layout does not print a total | no | no | no | no | fit (12 of 30) |
| INVOICE_REPORT_FORMAT_13_STANDARD_INVOICE_USA | SYN-11 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 30) |
| INVOICE_REPORT_FORMAT_13_STANDARD_INVOICE_USA | SYN-12 | not suitable | this layout does not print a total | no | no | no | no | fit (4 of 30) |
| INVOICE_REPORT_FORMAT_13_STANDARD_INVOICE_USA | SYN-13 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 30) |
| INVOICE_REPORT_FORMAT_13_STANDARD_INVOICE_USA | SYN-14 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 30) |
| INVOICE_REPORT_FORMAT_13_STANDARD_INVOICE_USA | SYN-15 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 30) |
| INVOICE_REPORT_FORMAT_14_INVOICE | SYN-01 | suitable | — | no | no | yes | yes | fit (3 of 22) |
| INVOICE_REPORT_FORMAT_14_INVOICE | SYN-02 | not suitable | the tax is not printed | no | no | yes | yes | fit (4 of 22) |
| INVOICE_REPORT_FORMAT_14_INVOICE | SYN-03 | not suitable | the tax is not printed | no | no | yes | yes | fit (5 of 22) |
| INVOICE_REPORT_FORMAT_14_INVOICE | SYN-04 | not suitable | the subtotal does not add up to the total | no | no | yes | yes | fit (3 of 22) |
| INVOICE_REPORT_FORMAT_14_INVOICE | SYN-05 | not suitable | the rounding is not printed | no | no | yes | yes | fit (6 of 22) |
| INVOICE_REPORT_FORMAT_14_INVOICE | SYN-06 | not suitable | the subtotal does not add up to the total | no | no | yes | yes | fit (3 of 22) |
| INVOICE_REPORT_FORMAT_14_INVOICE | SYN-07 | not suitable | the tax is not printed | no | no | yes | yes | fit (8 of 22) |
| INVOICE_REPORT_FORMAT_14_INVOICE | SYN-08 | suitable | — | no | no | yes | yes | fit (3 of 22) |
| INVOICE_REPORT_FORMAT_14_INVOICE | SYN-09 | not suitable | the subtotal does not add up to the total | no | no | yes | yes | fit (3 of 22) |
| INVOICE_REPORT_FORMAT_14_INVOICE | SYN-10 | not suitable | the tax is not printed | no | no | yes | yes | fit (12 of 22) |
| INVOICE_REPORT_FORMAT_14_INVOICE | SYN-11 | not suitable | the tax is not printed | no | no | yes | yes | fit (3 of 22) |
| INVOICE_REPORT_FORMAT_14_INVOICE | SYN-12 | not suitable | the subtotal does not add up to the total | no | no | yes | yes | fit (4 of 22) |
| INVOICE_REPORT_FORMAT_14_INVOICE | SYN-13 | suitable | — | no | no | yes | yes | fit (3 of 22) |
| INVOICE_REPORT_FORMAT_14_INVOICE | SYN-14 | not suitable | the tax is not printed | no | no | yes | yes | fit (3 of 22) |
| INVOICE_REPORT_FORMAT_14_INVOICE | SYN-15 | not suitable | the subtotal does not add up to the total | no | no | yes | yes | fit (3 of 22) |
| INVOICE_REPORT_FORMAT_15_INVOICE_FCY | SYN-01 | suitable | — | no | no | no | no | no charge band |
| INVOICE_REPORT_FORMAT_15_INVOICE_FCY | SYN-02 | suitable | suitable for arithmetic, tax not shown | no | no | no | no | no charge band |
| INVOICE_REPORT_FORMAT_15_INVOICE_FCY | SYN-03 | suitable | suitable for arithmetic, tax not shown | no | no | no | no | no charge band |
| INVOICE_REPORT_FORMAT_15_INVOICE_FCY | SYN-04 | not suitable | the discount is not printed | no | no | no | no | no charge band |
| INVOICE_REPORT_FORMAT_15_INVOICE_FCY | SYN-05 | not suitable | the rounding is not printed | no | no | no | no | no charge band |
| INVOICE_REPORT_FORMAT_15_INVOICE_FCY | SYN-06 | not suitable | the discount is not printed | no | no | no | no | no charge band |
| INVOICE_REPORT_FORMAT_15_INVOICE_FCY | SYN-07 | suitable | suitable for arithmetic, tax not shown | no | no | no | no | no charge band |
| INVOICE_REPORT_FORMAT_15_INVOICE_FCY | SYN-08 | suitable | — | no | no | no | no | no charge band |
| INVOICE_REPORT_FORMAT_15_INVOICE_FCY | SYN-09 | not suitable | the rounding is not printed | no | no | no | no | no charge band |
| INVOICE_REPORT_FORMAT_15_INVOICE_FCY | SYN-10 | suitable | suitable for arithmetic, tax not shown | no | no | no | no | no charge band |
| INVOICE_REPORT_FORMAT_15_INVOICE_FCY | SYN-11 | suitable | suitable for arithmetic, tax not shown | no | no | no | no | no charge band |
| INVOICE_REPORT_FORMAT_15_INVOICE_FCY | SYN-12 | not suitable | the discount is not printed | no | no | no | no | no charge band |
| INVOICE_REPORT_FORMAT_15_INVOICE_FCY | SYN-13 | suitable | — | no | no | no | no | no charge band |
| INVOICE_REPORT_FORMAT_15_INVOICE_FCY | SYN-14 | suitable | suitable for arithmetic, tax not shown | no | no | no | no | no charge band |
| INVOICE_REPORT_FORMAT_15_INVOICE_FCY | SYN-15 | not suitable | the lines do not add up to the total | no | no | no | no | no charge band |
| INVOICE_REPORT_FORMAT_16_STANDARD_TAX_INVOICE_PREPRINTED | SYN-01 | suitable | — | no | no | yes | no | fit (3 of 9) |
| INVOICE_REPORT_FORMAT_16_STANDARD_TAX_INVOICE_PREPRINTED | SYN-02 | not suitable | the tax is not printed | no | no | yes | no | fit (4 of 9) |
| INVOICE_REPORT_FORMAT_16_STANDARD_TAX_INVOICE_PREPRINTED | SYN-03 | not suitable | the tax is not printed | no | no | yes | no | fit (5 of 9) |
| INVOICE_REPORT_FORMAT_16_STANDARD_TAX_INVOICE_PREPRINTED | SYN-04 | not suitable | the subtotal does not add up to the total | no | no | yes | no | fit (3 of 9) |
| INVOICE_REPORT_FORMAT_16_STANDARD_TAX_INVOICE_PREPRINTED | SYN-05 | not suitable | the rounding is not printed | no | no | yes | no | fit (6 of 9) |
| INVOICE_REPORT_FORMAT_16_STANDARD_TAX_INVOICE_PREPRINTED | SYN-06 | not suitable | the subtotal does not add up to the total | no | no | yes | no | fit (3 of 9) |
| INVOICE_REPORT_FORMAT_16_STANDARD_TAX_INVOICE_PREPRINTED | SYN-07 | not suitable | the tax is not printed | no | no | yes | no | fit (8 of 9) |
| INVOICE_REPORT_FORMAT_16_STANDARD_TAX_INVOICE_PREPRINTED | SYN-08 | suitable | — | no | no | yes | no | fit (3 of 9) |
| INVOICE_REPORT_FORMAT_16_STANDARD_TAX_INVOICE_PREPRINTED | SYN-09 | not suitable | the subtotal does not add up to the total | no | no | yes | no | fit (3 of 9) |
| INVOICE_REPORT_FORMAT_16_STANDARD_TAX_INVOICE_PREPRINTED | SYN-10 | not suitable | the tax is not printed | no | no | yes | no | paginate (12 lines, 9 per page) |
| INVOICE_REPORT_FORMAT_16_STANDARD_TAX_INVOICE_PREPRINTED | SYN-11 | not suitable | the tax is not printed | no | no | yes | no | fit (3 of 9) |
| INVOICE_REPORT_FORMAT_16_STANDARD_TAX_INVOICE_PREPRINTED | SYN-12 | not suitable | the subtotal does not add up to the total | no | no | yes | no | fit (4 of 9) |
| INVOICE_REPORT_FORMAT_16_STANDARD_TAX_INVOICE_PREPRINTED | SYN-13 | suitable | — | no | no | yes | no | fit (3 of 9) |
| INVOICE_REPORT_FORMAT_16_STANDARD_TAX_INVOICE_PREPRINTED | SYN-14 | not suitable | the tax is not printed | no | no | yes | no | fit (3 of 9) |
| INVOICE_REPORT_FORMAT_16_STANDARD_TAX_INVOICE_PREPRINTED | SYN-15 | not suitable | the subtotal does not add up to the total | no | no | yes | no | fit (3 of 9) |
| INVOICE_REPORT_FORMAT_17_INVOICE_JASPER | SYN-01 | suitable | — | no | no | yes | no | fit (3 of 23) |
| INVOICE_REPORT_FORMAT_17_INVOICE_JASPER | SYN-02 | not suitable | the tax is not printed | no | no | yes | no | fit (4 of 23) |
| INVOICE_REPORT_FORMAT_17_INVOICE_JASPER | SYN-03 | not suitable | the tax is not printed | no | no | yes | no | fit (5 of 23) |
| INVOICE_REPORT_FORMAT_17_INVOICE_JASPER | SYN-04 | not suitable | the subtotal does not add up to the total | no | no | yes | no | fit (3 of 23) |
| INVOICE_REPORT_FORMAT_17_INVOICE_JASPER | SYN-05 | not suitable | the rounding is not printed | no | no | yes | no | fit (6 of 23) |
| INVOICE_REPORT_FORMAT_17_INVOICE_JASPER | SYN-06 | not suitable | the subtotal does not add up to the total | no | no | yes | no | fit (3 of 23) |
| INVOICE_REPORT_FORMAT_17_INVOICE_JASPER | SYN-07 | not suitable | the tax is not printed | no | no | yes | no | fit (8 of 23) |
| INVOICE_REPORT_FORMAT_17_INVOICE_JASPER | SYN-08 | suitable | — | no | no | yes | no | fit (3 of 23) |
| INVOICE_REPORT_FORMAT_17_INVOICE_JASPER | SYN-09 | not suitable | the subtotal does not add up to the total | no | no | yes | no | fit (3 of 23) |
| INVOICE_REPORT_FORMAT_17_INVOICE_JASPER | SYN-10 | not suitable | the tax is not printed | no | no | yes | no | fit (12 of 23) |
| INVOICE_REPORT_FORMAT_17_INVOICE_JASPER | SYN-11 | not suitable | the tax is not printed | no | no | yes | no | fit (3 of 23) |
| INVOICE_REPORT_FORMAT_17_INVOICE_JASPER | SYN-12 | not suitable | the subtotal does not add up to the total | no | no | yes | no | fit (4 of 23) |
| INVOICE_REPORT_FORMAT_17_INVOICE_JASPER | SYN-13 | suitable | — | no | no | yes | no | fit (3 of 23) |
| INVOICE_REPORT_FORMAT_17_INVOICE_JASPER | SYN-14 | not suitable | the tax is not printed | no | no | yes | no | fit (3 of 23) |
| INVOICE_REPORT_FORMAT_17_INVOICE_JASPER | SYN-15 | not suitable | the subtotal does not add up to the total | no | no | yes | no | fit (3 of 23) |
| INVOICE_REPORT_FORMAT_18_LAND_FREIGHT_TRANSPORTATION_INVOICE | SYN-01 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 20) |
| INVOICE_REPORT_FORMAT_18_LAND_FREIGHT_TRANSPORTATION_INVOICE | SYN-02 | not suitable | this layout does not print a total | no | no | no | no | fit (4 of 20) |
| INVOICE_REPORT_FORMAT_18_LAND_FREIGHT_TRANSPORTATION_INVOICE | SYN-03 | not suitable | this layout does not print a total | no | no | no | no | fit (5 of 20) |
| INVOICE_REPORT_FORMAT_18_LAND_FREIGHT_TRANSPORTATION_INVOICE | SYN-04 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 20) |
| INVOICE_REPORT_FORMAT_18_LAND_FREIGHT_TRANSPORTATION_INVOICE | SYN-05 | not suitable | this layout does not print a total | no | no | no | no | fit (6 of 20) |
| INVOICE_REPORT_FORMAT_18_LAND_FREIGHT_TRANSPORTATION_INVOICE | SYN-06 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 20) |
| INVOICE_REPORT_FORMAT_18_LAND_FREIGHT_TRANSPORTATION_INVOICE | SYN-07 | not suitable | this layout does not print a total | no | no | no | no | fit (8 of 20) |
| INVOICE_REPORT_FORMAT_18_LAND_FREIGHT_TRANSPORTATION_INVOICE | SYN-08 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 20) |
| INVOICE_REPORT_FORMAT_18_LAND_FREIGHT_TRANSPORTATION_INVOICE | SYN-09 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 20) |
| INVOICE_REPORT_FORMAT_18_LAND_FREIGHT_TRANSPORTATION_INVOICE | SYN-10 | not suitable | this layout does not print a total | no | no | no | no | fit (12 of 20) |
| INVOICE_REPORT_FORMAT_18_LAND_FREIGHT_TRANSPORTATION_INVOICE | SYN-11 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 20) |
| INVOICE_REPORT_FORMAT_18_LAND_FREIGHT_TRANSPORTATION_INVOICE | SYN-12 | not suitable | this layout does not print a total | no | no | no | no | fit (4 of 20) |
| INVOICE_REPORT_FORMAT_18_LAND_FREIGHT_TRANSPORTATION_INVOICE | SYN-13 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 20) |
| INVOICE_REPORT_FORMAT_18_LAND_FREIGHT_TRANSPORTATION_INVOICE | SYN-14 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 20) |
| INVOICE_REPORT_FORMAT_18_LAND_FREIGHT_TRANSPORTATION_INVOICE | SYN-15 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 20) |
| INVOICE_REPORT_FORMAT_19_DEBIT_NOTE_VIETNAM | SYN-01 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 34) |
| INVOICE_REPORT_FORMAT_19_DEBIT_NOTE_VIETNAM | SYN-02 | not suitable | this layout does not print a total | no | no | no | no | fit (4 of 34) |
| INVOICE_REPORT_FORMAT_19_DEBIT_NOTE_VIETNAM | SYN-03 | not suitable | this layout does not print a total | no | no | no | no | fit (5 of 34) |
| INVOICE_REPORT_FORMAT_19_DEBIT_NOTE_VIETNAM | SYN-04 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 34) |
| INVOICE_REPORT_FORMAT_19_DEBIT_NOTE_VIETNAM | SYN-05 | not suitable | this layout does not print a total | no | no | no | no | fit (6 of 34) |
| INVOICE_REPORT_FORMAT_19_DEBIT_NOTE_VIETNAM | SYN-06 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 34) |
| INVOICE_REPORT_FORMAT_19_DEBIT_NOTE_VIETNAM | SYN-07 | not suitable | this layout does not print a total | no | no | no | no | fit (8 of 34) |
| INVOICE_REPORT_FORMAT_19_DEBIT_NOTE_VIETNAM | SYN-08 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 34) |
| INVOICE_REPORT_FORMAT_19_DEBIT_NOTE_VIETNAM | SYN-09 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 34) |
| INVOICE_REPORT_FORMAT_19_DEBIT_NOTE_VIETNAM | SYN-10 | not suitable | this layout does not print a total | no | no | no | no | fit (12 of 34) |
| INVOICE_REPORT_FORMAT_19_DEBIT_NOTE_VIETNAM | SYN-11 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 34) |
| INVOICE_REPORT_FORMAT_19_DEBIT_NOTE_VIETNAM | SYN-12 | not suitable | this layout does not print a total | no | no | no | no | fit (4 of 34) |
| INVOICE_REPORT_FORMAT_19_DEBIT_NOTE_VIETNAM | SYN-13 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 34) |
| INVOICE_REPORT_FORMAT_19_DEBIT_NOTE_VIETNAM | SYN-14 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 34) |
| INVOICE_REPORT_FORMAT_19_DEBIT_NOTE_VIETNAM | SYN-15 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 34) |
| INVOICE_REPORT_FORMAT_20_TAX_INVOICE_INDIA | SYN-01 | not suitable | this layout does not print a total | no | no | no | yes | fit (3 of 20) |
| INVOICE_REPORT_FORMAT_20_TAX_INVOICE_INDIA | SYN-02 | not suitable | this layout does not print a total | no | no | no | yes | fit (4 of 20) |
| INVOICE_REPORT_FORMAT_20_TAX_INVOICE_INDIA | SYN-03 | not suitable | this layout does not print a total | no | no | no | yes | fit (5 of 20) |
| INVOICE_REPORT_FORMAT_20_TAX_INVOICE_INDIA | SYN-04 | not suitable | this layout does not print a total | no | no | no | yes | fit (3 of 20) |
| INVOICE_REPORT_FORMAT_20_TAX_INVOICE_INDIA | SYN-05 | not suitable | this layout does not print a total | no | no | no | yes | fit (6 of 20) |
| INVOICE_REPORT_FORMAT_20_TAX_INVOICE_INDIA | SYN-06 | not suitable | this layout does not print a total | no | no | no | yes | fit (3 of 20) |
| INVOICE_REPORT_FORMAT_20_TAX_INVOICE_INDIA | SYN-07 | not suitable | this layout does not print a total | no | no | no | yes | fit (8 of 20) |
| INVOICE_REPORT_FORMAT_20_TAX_INVOICE_INDIA | SYN-08 | not suitable | this layout does not print a total | no | no | no | yes | fit (3 of 20) |
| INVOICE_REPORT_FORMAT_20_TAX_INVOICE_INDIA | SYN-09 | not suitable | this layout does not print a total | no | no | no | yes | fit (3 of 20) |
| INVOICE_REPORT_FORMAT_20_TAX_INVOICE_INDIA | SYN-10 | not suitable | this layout does not print a total | no | no | no | yes | fit (12 of 20) |
| INVOICE_REPORT_FORMAT_20_TAX_INVOICE_INDIA | SYN-11 | not suitable | this layout does not print a total | no | no | no | yes | fit (3 of 20) |
| INVOICE_REPORT_FORMAT_20_TAX_INVOICE_INDIA | SYN-12 | not suitable | this layout does not print a total | no | no | no | yes | fit (4 of 20) |
| INVOICE_REPORT_FORMAT_20_TAX_INVOICE_INDIA | SYN-13 | not suitable | this layout does not print a total | no | no | no | yes | fit (3 of 20) |
| INVOICE_REPORT_FORMAT_20_TAX_INVOICE_INDIA | SYN-14 | not suitable | this layout does not print a total | no | no | no | yes | fit (3 of 20) |
| INVOICE_REPORT_FORMAT_20_TAX_INVOICE_INDIA | SYN-15 | not suitable | this layout does not print a total | no | no | no | yes | fit (3 of 20) |
| INVOICE_REPORT_FORMAT_21_WAREHOUSE_INVOICE | SYN-01 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 8) |
| INVOICE_REPORT_FORMAT_21_WAREHOUSE_INVOICE | SYN-02 | not suitable | this layout does not print a total | no | no | no | no | fit (4 of 8) |
| INVOICE_REPORT_FORMAT_21_WAREHOUSE_INVOICE | SYN-03 | not suitable | this layout does not print a total | no | no | no | no | fit (5 of 8) |
| INVOICE_REPORT_FORMAT_21_WAREHOUSE_INVOICE | SYN-04 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 8) |
| INVOICE_REPORT_FORMAT_21_WAREHOUSE_INVOICE | SYN-05 | not suitable | this layout does not print a total | no | no | no | no | fit (6 of 8) |
| INVOICE_REPORT_FORMAT_21_WAREHOUSE_INVOICE | SYN-06 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 8) |
| INVOICE_REPORT_FORMAT_21_WAREHOUSE_INVOICE | SYN-07 | not suitable | this layout does not print a total | no | no | no | no | fit (8 of 8) |
| INVOICE_REPORT_FORMAT_21_WAREHOUSE_INVOICE | SYN-08 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 8) |
| INVOICE_REPORT_FORMAT_21_WAREHOUSE_INVOICE | SYN-09 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 8) |
| INVOICE_REPORT_FORMAT_21_WAREHOUSE_INVOICE | SYN-10 | not suitable | this layout does not print a total | no | no | no | no | paginate (12 lines, 8 per page) |
| INVOICE_REPORT_FORMAT_21_WAREHOUSE_INVOICE | SYN-11 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 8) |
| INVOICE_REPORT_FORMAT_21_WAREHOUSE_INVOICE | SYN-12 | not suitable | this layout does not print a total | no | no | no | no | fit (4 of 8) |
| INVOICE_REPORT_FORMAT_21_WAREHOUSE_INVOICE | SYN-13 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 8) |
| INVOICE_REPORT_FORMAT_21_WAREHOUSE_INVOICE | SYN-14 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 8) |
| INVOICE_REPORT_FORMAT_21_WAREHOUSE_INVOICE | SYN-15 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 8) |
| PROFORMA_INVOICE_ALL_CHARGES_REPORT_FORMAT | SYN-01 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 11) |
| PROFORMA_INVOICE_ALL_CHARGES_REPORT_FORMAT | SYN-02 | not suitable | this layout does not print a total | no | no | no | no | fit (4 of 11) |
| PROFORMA_INVOICE_ALL_CHARGES_REPORT_FORMAT | SYN-03 | not suitable | this layout does not print a total | no | no | no | no | fit (5 of 11) |
| PROFORMA_INVOICE_ALL_CHARGES_REPORT_FORMAT | SYN-04 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 11) |
| PROFORMA_INVOICE_ALL_CHARGES_REPORT_FORMAT | SYN-05 | not suitable | this layout does not print a total | no | no | no | no | fit (6 of 11) |
| PROFORMA_INVOICE_ALL_CHARGES_REPORT_FORMAT | SYN-06 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 11) |
| PROFORMA_INVOICE_ALL_CHARGES_REPORT_FORMAT | SYN-07 | not suitable | this layout does not print a total | no | no | no | no | fit (8 of 11) |
| PROFORMA_INVOICE_ALL_CHARGES_REPORT_FORMAT | SYN-08 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 11) |
| PROFORMA_INVOICE_ALL_CHARGES_REPORT_FORMAT | SYN-09 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 11) |
| PROFORMA_INVOICE_ALL_CHARGES_REPORT_FORMAT | SYN-10 | not suitable | this layout does not print a total | no | no | no | no | paginate (12 lines, 11 per page) |
| PROFORMA_INVOICE_ALL_CHARGES_REPORT_FORMAT | SYN-11 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 11) |
| PROFORMA_INVOICE_ALL_CHARGES_REPORT_FORMAT | SYN-12 | not suitable | this layout does not print a total | no | no | no | no | fit (4 of 11) |
| PROFORMA_INVOICE_ALL_CHARGES_REPORT_FORMAT | SYN-13 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 11) |
| PROFORMA_INVOICE_ALL_CHARGES_REPORT_FORMAT | SYN-14 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 11) |
| PROFORMA_INVOICE_ALL_CHARGES_REPORT_FORMAT | SYN-15 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 11) |
| PROFORMA_INVOICE_REPORT_FORMAT_1_PROFORMA_INVOICE_ALL_CHARGES | SYN-01 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 7) |
| PROFORMA_INVOICE_REPORT_FORMAT_1_PROFORMA_INVOICE_ALL_CHARGES | SYN-02 | not suitable | this layout does not print a total | no | no | no | no | fit (4 of 7) |
| PROFORMA_INVOICE_REPORT_FORMAT_1_PROFORMA_INVOICE_ALL_CHARGES | SYN-03 | not suitable | this layout does not print a total | no | no | no | no | fit (5 of 7) |
| PROFORMA_INVOICE_REPORT_FORMAT_1_PROFORMA_INVOICE_ALL_CHARGES | SYN-04 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 7) |
| PROFORMA_INVOICE_REPORT_FORMAT_1_PROFORMA_INVOICE_ALL_CHARGES | SYN-05 | not suitable | this layout does not print a total | no | no | no | no | fit (6 of 7) |
| PROFORMA_INVOICE_REPORT_FORMAT_1_PROFORMA_INVOICE_ALL_CHARGES | SYN-06 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 7) |
| PROFORMA_INVOICE_REPORT_FORMAT_1_PROFORMA_INVOICE_ALL_CHARGES | SYN-07 | not suitable | this layout does not print a total | no | no | no | no | paginate (8 lines, 7 per page) |
| PROFORMA_INVOICE_REPORT_FORMAT_1_PROFORMA_INVOICE_ALL_CHARGES | SYN-08 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 7) |
| PROFORMA_INVOICE_REPORT_FORMAT_1_PROFORMA_INVOICE_ALL_CHARGES | SYN-09 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 7) |
| PROFORMA_INVOICE_REPORT_FORMAT_1_PROFORMA_INVOICE_ALL_CHARGES | SYN-10 | not suitable | this layout does not print a total | no | no | no | no | paginate (12 lines, 7 per page) |
| PROFORMA_INVOICE_REPORT_FORMAT_1_PROFORMA_INVOICE_ALL_CHARGES | SYN-11 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 7) |
| PROFORMA_INVOICE_REPORT_FORMAT_1_PROFORMA_INVOICE_ALL_CHARGES | SYN-12 | not suitable | this layout does not print a total | no | no | no | no | fit (4 of 7) |
| PROFORMA_INVOICE_REPORT_FORMAT_1_PROFORMA_INVOICE_ALL_CHARGES | SYN-13 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 7) |
| PROFORMA_INVOICE_REPORT_FORMAT_1_PROFORMA_INVOICE_ALL_CHARGES | SYN-14 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 7) |
| PROFORMA_INVOICE_REPORT_FORMAT_1_PROFORMA_INVOICE_ALL_CHARGES | SYN-15 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 7) |
| PROFORMA_INVOICE_REPORT_FORMAT_2_PROFORMA_INVOICE_ALL_CHARGES | SYN-01 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 17) |
| PROFORMA_INVOICE_REPORT_FORMAT_2_PROFORMA_INVOICE_ALL_CHARGES | SYN-02 | not suitable | this layout does not print a total | no | no | no | no | fit (4 of 17) |
| PROFORMA_INVOICE_REPORT_FORMAT_2_PROFORMA_INVOICE_ALL_CHARGES | SYN-03 | not suitable | this layout does not print a total | no | no | no | no | fit (5 of 17) |
| PROFORMA_INVOICE_REPORT_FORMAT_2_PROFORMA_INVOICE_ALL_CHARGES | SYN-04 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 17) |
| PROFORMA_INVOICE_REPORT_FORMAT_2_PROFORMA_INVOICE_ALL_CHARGES | SYN-05 | not suitable | this layout does not print a total | no | no | no | no | fit (6 of 17) |
| PROFORMA_INVOICE_REPORT_FORMAT_2_PROFORMA_INVOICE_ALL_CHARGES | SYN-06 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 17) |
| PROFORMA_INVOICE_REPORT_FORMAT_2_PROFORMA_INVOICE_ALL_CHARGES | SYN-07 | not suitable | this layout does not print a total | no | no | no | no | fit (8 of 17) |
| PROFORMA_INVOICE_REPORT_FORMAT_2_PROFORMA_INVOICE_ALL_CHARGES | SYN-08 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 17) |
| PROFORMA_INVOICE_REPORT_FORMAT_2_PROFORMA_INVOICE_ALL_CHARGES | SYN-09 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 17) |
| PROFORMA_INVOICE_REPORT_FORMAT_2_PROFORMA_INVOICE_ALL_CHARGES | SYN-10 | not suitable | this layout does not print a total | no | no | no | no | fit (12 of 17) |
| PROFORMA_INVOICE_REPORT_FORMAT_2_PROFORMA_INVOICE_ALL_CHARGES | SYN-11 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 17) |
| PROFORMA_INVOICE_REPORT_FORMAT_2_PROFORMA_INVOICE_ALL_CHARGES | SYN-12 | not suitable | this layout does not print a total | no | no | no | no | fit (4 of 17) |
| PROFORMA_INVOICE_REPORT_FORMAT_2_PROFORMA_INVOICE_ALL_CHARGES | SYN-13 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 17) |
| PROFORMA_INVOICE_REPORT_FORMAT_2_PROFORMA_INVOICE_ALL_CHARGES | SYN-14 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 17) |
| PROFORMA_INVOICE_REPORT_FORMAT_2_PROFORMA_INVOICE_ALL_CHARGES | SYN-15 | not suitable | this layout does not print a total | no | no | no | no | fit (3 of 17) |
| PURCHASE_INVOICE_REPORT_FORMAT_1 | SYN-01 | not suitable | this layout does not print a total | no | no | no | yes | no charge band |
| PURCHASE_INVOICE_REPORT_FORMAT_1 | SYN-02 | not suitable | this layout does not print a total | no | no | no | yes | no charge band |
| PURCHASE_INVOICE_REPORT_FORMAT_1 | SYN-03 | not suitable | this layout does not print a total | no | no | no | yes | no charge band |
| PURCHASE_INVOICE_REPORT_FORMAT_1 | SYN-04 | not suitable | this layout does not print a total | no | no | no | yes | no charge band |
| PURCHASE_INVOICE_REPORT_FORMAT_1 | SYN-05 | not suitable | this layout does not print a total | no | no | no | yes | no charge band |
| PURCHASE_INVOICE_REPORT_FORMAT_1 | SYN-06 | not suitable | this layout does not print a total | no | no | no | yes | no charge band |
| PURCHASE_INVOICE_REPORT_FORMAT_1 | SYN-07 | not suitable | this layout does not print a total | no | no | no | yes | no charge band |
| PURCHASE_INVOICE_REPORT_FORMAT_1 | SYN-08 | not suitable | this layout does not print a total | no | no | no | yes | no charge band |
| PURCHASE_INVOICE_REPORT_FORMAT_1 | SYN-09 | not suitable | this layout does not print a total | no | no | no | yes | no charge band |
| PURCHASE_INVOICE_REPORT_FORMAT_1 | SYN-10 | not suitable | this layout does not print a total | no | no | no | yes | no charge band |
| PURCHASE_INVOICE_REPORT_FORMAT_1 | SYN-11 | not suitable | this layout does not print a total | no | no | no | yes | no charge band |
| PURCHASE_INVOICE_REPORT_FORMAT_1 | SYN-12 | not suitable | this layout does not print a total | no | no | no | yes | no charge band |
| PURCHASE_INVOICE_REPORT_FORMAT_1 | SYN-13 | not suitable | this layout does not print a total | no | no | no | yes | no charge band |
| PURCHASE_INVOICE_REPORT_FORMAT_1 | SYN-14 | not suitable | this layout does not print a total | no | no | no | yes | no charge band |
| PURCHASE_INVOICE_REPORT_FORMAT_1 | SYN-15 | not suitable | this layout does not print a total | no | no | no | yes | no charge band |
| PURCHASE_INVOICE_REPORT_FORMAT_2 | SYN-01 | not suitable | this layout does not print a total | no | no | no | yes | no charge band |
| PURCHASE_INVOICE_REPORT_FORMAT_2 | SYN-02 | not suitable | this layout does not print a total | no | no | no | yes | no charge band |
| PURCHASE_INVOICE_REPORT_FORMAT_2 | SYN-03 | not suitable | this layout does not print a total | no | no | no | yes | no charge band |
| PURCHASE_INVOICE_REPORT_FORMAT_2 | SYN-04 | not suitable | this layout does not print a total | no | no | no | yes | no charge band |
| PURCHASE_INVOICE_REPORT_FORMAT_2 | SYN-05 | not suitable | this layout does not print a total | no | no | no | yes | no charge band |
| PURCHASE_INVOICE_REPORT_FORMAT_2 | SYN-06 | not suitable | this layout does not print a total | no | no | no | yes | no charge band |
| PURCHASE_INVOICE_REPORT_FORMAT_2 | SYN-07 | not suitable | this layout does not print a total | no | no | no | yes | no charge band |
| PURCHASE_INVOICE_REPORT_FORMAT_2 | SYN-08 | not suitable | this layout does not print a total | no | no | no | yes | no charge band |
| PURCHASE_INVOICE_REPORT_FORMAT_2 | SYN-09 | not suitable | this layout does not print a total | no | no | no | yes | no charge band |
| PURCHASE_INVOICE_REPORT_FORMAT_2 | SYN-10 | not suitable | this layout does not print a total | no | no | no | yes | no charge band |
| PURCHASE_INVOICE_REPORT_FORMAT_2 | SYN-11 | not suitable | this layout does not print a total | no | no | no | yes | no charge band |
| PURCHASE_INVOICE_REPORT_FORMAT_2 | SYN-12 | not suitable | this layout does not print a total | no | no | no | yes | no charge band |
| PURCHASE_INVOICE_REPORT_FORMAT_2 | SYN-13 | not suitable | this layout does not print a total | no | no | no | yes | no charge band |
| PURCHASE_INVOICE_REPORT_FORMAT_2 | SYN-14 | not suitable | this layout does not print a total | no | no | no | yes | no charge band |
| PURCHASE_INVOICE_REPORT_FORMAT_2 | SYN-15 | not suitable | this layout does not print a total | no | no | no | yes | no charge band |
