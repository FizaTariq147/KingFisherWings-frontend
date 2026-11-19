# Invoice v2 field coverage

Counts are dynamic spans. (a) bound and filled. (b) bound, empty in the record. (c) not bound, and a source exists on the invoice, job, shipment, or party. (d) no source.
Synthetic records are not stored invoices. They reuse the first downloaded invoice and add lines.
The logo is not a span. The catalogue draws it with `fetchOrganizationLogoBytes`, the same fetch the classic generator uses. No bytes leaves the slot empty. These records have an organization logo URL, so the slot is filled when that fetch returns bytes.
Labels that named a field already on the invoice, job, shipment, or party are bound: voyage, flight, ref no, INCO terms, customer P/O, balance, due date, department, place of origin, and MAWB/MBL/HAWB/HBL. (c) is what remains unbound after that. Amount in words is derived from the total and the currency.

## INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA

| Record | Kind | (a) | (b) | (c) | (d) |
|---|---|---:|---:|---:|---:|
| INV/26/00102 | real | 45 | 25 | 0 | 27 |
| INV/26/00093 | real | 24 | 46 | 0 | 27 |
| INV/26/00101 | real | 39 | 41 | 0 | 39 |
| INV/26/00100 | real | 26 | 44 | 0 | 27 |
| INV/26/00099 | real | 51 | 24 | 0 | 33 |
| INV/26/00097 | real | 24 | 46 | 0 | 27 |
| INV/26/00094 | real | 33 | 42 | 0 | 33 |
| INV/26/00095 | real | 28 | 42 | 0 | 27 |
| INV/26/00098 | real | 28 | 42 | 0 | 27 |
| INV/26/00089 | real | 24 | 46 | 0 | 27 |
| EXTRA-USD-6 | synthetic | 70 | 25 | 0 | 57 |
| EXTRA-EUR-8 | synthetic | 80 | 25 | 0 | 69 |
| EXTRA-INR-12 | synthetic | 100 | 25 | 0 | 93 |
| EXTRA-AED-5 | synthetic | 65 | 25 | 0 | 51 |
| EXTRA-GBP-7 | synthetic | 75 | 25 | 0 | 63 |

Named fields on this layout:

| Record | Kind | bill-to | shipper | consignee | vessel | voyage | container | HBL | quantity | rate | currency | per-line tax | amount in words | logo |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| INV/26/00102 | real | filled | filled | filled | empty in the record | empty in the record | filled | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| INV/26/00093 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | filled | filled | profile has a logo file |
| INV/26/00101 | real | filled | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| INV/26/00100 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| INV/26/00099 | real | filled | not on this layout | empty in the record | not on this layout | empty in the record | filled | filled | filled | filled | filled | empty in the record | filled | profile has a logo file |
| INV/26/00097 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | filled | filled | profile has a logo file |
| INV/26/00094 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | not drawn; SGST/CGST blocked | filled | profile has a logo file |
| INV/26/00095 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | not drawn; SGST/CGST blocked | filled | profile has a logo file |
| INV/26/00098 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | not drawn; SGST/CGST blocked | filled | profile has a logo file |
| INV/26/00089 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | filled | filled | profile has a logo file |
| EXTRA-USD-6 | synthetic | filled | filled | filled | empty in the record | empty in the record | filled | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| EXTRA-EUR-8 | synthetic | filled | filled | filled | empty in the record | empty in the record | filled | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| EXTRA-INR-12 | synthetic | filled | filled | filled | empty in the record | empty in the record | filled | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| EXTRA-AED-5 | synthetic | filled | filled | filled | empty in the record | empty in the record | filled | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| EXTRA-GBP-7 | synthetic | filled | filled | filled | empty in the record | empty in the record | filled | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |

## INVOICE_REPORT_FORMAT_2_TAX_INVOICE_INDIA

| Record | Kind | (a) | (b) | (c) | (d) |
|---|---|---:|---:|---:|---:|
| INV/26/00102 | real | 13 | 2 | 0 | 12 |
| INV/26/00093 | real | 5 | 10 | 0 | 12 |
| INV/26/00101 | real | 17 | 4 | 0 | 18 |
| INV/26/00100 | real | 5 | 10 | 0 | 12 |
| INV/26/00099 | real | 17 | 1 | 0 | 15 |
| INV/26/00097 | real | 5 | 10 | 0 | 12 |
| INV/26/00094 | real | 8 | 10 | 0 | 15 |
| INV/26/00095 | real | 5 | 10 | 0 | 12 |
| INV/26/00098 | real | 5 | 10 | 0 | 12 |
| INV/26/00089 | real | 5 | 10 | 0 | 12 |
| EXTRA-USD-6 | synthetic | 28 | 2 | 0 | 27 |
| EXTRA-EUR-8 | synthetic | 34 | 2 | 0 | 33 |
| EXTRA-INR-12 | synthetic | 46 | 2 | 0 | 45 |
| EXTRA-AED-5 | synthetic | 25 | 2 | 0 | 24 |
| EXTRA-GBP-7 | synthetic | 31 | 2 | 0 | 30 |

Named fields on this layout:

| Record | Kind | bill-to | shipper | consignee | vessel | voyage | container | HBL | quantity | rate | currency | per-line tax | amount in words | logo |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| INV/26/00102 | real | not on this layout | not on this layout | not on this layout | empty in the record | empty in the record | not on this layout | empty in the record | filled | filled | filled | empty in the record | not on this layout | profile has a logo file |
| INV/26/00093 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | filled | not on this layout | profile has a logo file |
| INV/26/00101 | real | not on this layout | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | empty in the record | not on this layout | profile has a logo file |
| INV/26/00100 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | empty in the record | not on this layout | profile has a logo file |
| INV/26/00099 | real | not on this layout | not on this layout | empty in the record | filled | empty in the record | not on this layout | not on this layout | filled | filled | filled | empty in the record | not on this layout | profile has a logo file |
| INV/26/00097 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | filled | not on this layout | profile has a logo file |
| INV/26/00094 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | not drawn; SGST/CGST blocked | not on this layout | profile has a logo file |
| INV/26/00095 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | not drawn; SGST/CGST blocked | not on this layout | profile has a logo file |
| INV/26/00098 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | not drawn; SGST/CGST blocked | not on this layout | profile has a logo file |
| INV/26/00089 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | filled | not on this layout | profile has a logo file |
| EXTRA-USD-6 | synthetic | not on this layout | not on this layout | not on this layout | empty in the record | empty in the record | not on this layout | empty in the record | filled | filled | filled | empty in the record | not on this layout | profile has a logo file |
| EXTRA-EUR-8 | synthetic | not on this layout | not on this layout | not on this layout | empty in the record | empty in the record | not on this layout | empty in the record | filled | filled | filled | empty in the record | not on this layout | profile has a logo file |
| EXTRA-INR-12 | synthetic | not on this layout | not on this layout | not on this layout | empty in the record | empty in the record | not on this layout | empty in the record | filled | filled | filled | empty in the record | not on this layout | profile has a logo file |
| EXTRA-AED-5 | synthetic | not on this layout | not on this layout | not on this layout | empty in the record | empty in the record | not on this layout | empty in the record | filled | filled | filled | empty in the record | not on this layout | profile has a logo file |
| EXTRA-GBP-7 | synthetic | not on this layout | not on this layout | not on this layout | empty in the record | empty in the record | not on this layout | empty in the record | filled | filled | filled | empty in the record | not on this layout | profile has a logo file |

## INVOICE_REPORT_FORMAT_3_SUMMARY_INVOICE

| Record | Kind | (a) | (b) | (c) | (d) |
|---|---|---:|---:|---:|---:|
| INV/26/00102 | real | 43 | 20 | 0 | 23 |
| INV/26/00093 | real | 14 | 49 | 0 | 23 |
| INV/26/00101 | real | 33 | 38 | 0 | 23 |
| INV/26/00100 | real | 17 | 46 | 0 | 23 |
| INV/26/00099 | real | 42 | 25 | 0 | 23 |
| INV/26/00097 | real | 14 | 49 | 0 | 23 |
| INV/26/00094 | real | 19 | 48 | 0 | 23 |
| INV/26/00095 | real | 15 | 48 | 0 | 23 |
| INV/26/00098 | real | 15 | 48 | 0 | 23 |
| INV/26/00089 | real | 14 | 49 | 0 | 23 |
| EXTRA-USD-6 | synthetic | 63 | 20 | 0 | 23 |
| EXTRA-EUR-8 | synthetic | 71 | 20 | 0 | 23 |
| EXTRA-INR-12 | synthetic | 87 | 20 | 0 | 23 |
| EXTRA-AED-5 | synthetic | 59 | 20 | 0 | 23 |
| EXTRA-GBP-7 | synthetic | 67 | 20 | 0 | 23 |

Named fields on this layout:

| Record | Kind | bill-to | shipper | consignee | vessel | voyage | container | HBL | quantity | rate | currency | per-line tax | amount in words | logo |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| INV/26/00102 | real | filled | filled | filled | empty in the record | empty in the record | filled | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| INV/26/00093 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | filled | filled | profile has a logo file |
| INV/26/00101 | real | filled | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| INV/26/00100 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| INV/26/00099 | real | filled | not on this layout | empty in the record | not on this layout | empty in the record | filled | filled | filled | filled | filled | empty in the record | filled | profile has a logo file |
| INV/26/00097 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | filled | filled | profile has a logo file |
| INV/26/00094 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | not on this layout | filled | profile has a logo file |
| INV/26/00095 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | not on this layout | filled | profile has a logo file |
| INV/26/00098 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | not on this layout | filled | profile has a logo file |
| INV/26/00089 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | filled | filled | profile has a logo file |
| EXTRA-USD-6 | synthetic | filled | filled | filled | empty in the record | empty in the record | filled | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| EXTRA-EUR-8 | synthetic | filled | filled | filled | empty in the record | empty in the record | filled | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| EXTRA-INR-12 | synthetic | filled | filled | filled | empty in the record | empty in the record | filled | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| EXTRA-AED-5 | synthetic | filled | filled | filled | empty in the record | empty in the record | filled | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| EXTRA-GBP-7 | synthetic | filled | filled | filled | empty in the record | empty in the record | filled | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |

## INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE

| Record | Kind | (a) | (b) | (c) | (d) |
|---|---|---:|---:|---:|---:|
| INV/26/00102 | real | 35 | 7 | 0 | 11 |
| INV/26/00093 | real | 12 | 30 | 0 | 11 |
| INV/26/00101 | real | 28 | 26 | 0 | 17 |
| INV/26/00100 | real | 12 | 30 | 0 | 11 |
| INV/26/00099 | real | 35 | 13 | 0 | 14 |
| INV/26/00097 | real | 12 | 30 | 0 | 11 |
| INV/26/00094 | real | 19 | 29 | 0 | 14 |
| INV/26/00095 | real | 13 | 29 | 0 | 11 |
| INV/26/00098 | real | 13 | 29 | 0 | 11 |
| INV/26/00089 | real | 12 | 30 | 0 | 11 |
| EXTRA-USD-6 | synthetic | 65 | 7 | 0 | 26 |
| EXTRA-EUR-8 | synthetic | 77 | 7 | 0 | 32 |
| EXTRA-INR-12 | synthetic | 101 | 7 | 0 | 44 |
| EXTRA-AED-5 | synthetic | 59 | 7 | 0 | 23 |
| EXTRA-GBP-7 | synthetic | 71 | 7 | 0 | 29 |

Named fields on this layout:

| Record | Kind | bill-to | shipper | consignee | vessel | voyage | container | HBL | quantity | rate | currency | per-line tax | amount in words | logo |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| INV/26/00102 | real | filled | filled | filled | empty in the record | empty in the record | not on this layout | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| INV/26/00093 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | filled | filled | profile has a logo file |
| INV/26/00101 | real | filled | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| INV/26/00100 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| INV/26/00099 | real | not on this layout | filled | empty in the record | not on this layout | empty in the record | not on this layout | not on this layout | filled | filled | filled | empty in the record | filled | profile has a logo file |
| INV/26/00097 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | filled | filled | profile has a logo file |
| INV/26/00094 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | not on this layout | filled | profile has a logo file |
| INV/26/00095 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | not on this layout | filled | profile has a logo file |
| INV/26/00098 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | not on this layout | filled | profile has a logo file |
| INV/26/00089 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | filled | filled | profile has a logo file |
| EXTRA-USD-6 | synthetic | filled | filled | filled | empty in the record | empty in the record | not on this layout | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| EXTRA-EUR-8 | synthetic | filled | filled | filled | empty in the record | empty in the record | not on this layout | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| EXTRA-INR-12 | synthetic | filled | filled | filled | empty in the record | empty in the record | not on this layout | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| EXTRA-AED-5 | synthetic | filled | filled | filled | empty in the record | empty in the record | not on this layout | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| EXTRA-GBP-7 | synthetic | filled | filled | filled | empty in the record | empty in the record | not on this layout | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |

## INVOICE_REPORT_FORMAT_5_TAX_INVOICE_INDIA

| Record | Kind | (a) | (b) | (c) | (d) |
|---|---|---:|---:|---:|---:|
| INV/26/00102 | real | 57 | 13 | 0 | 25 |
| INV/26/00093 | real | 18 | 52 | 0 | 25 |
| INV/26/00101 | real | 44 | 36 | 0 | 33 |
| INV/26/00100 | real | 20 | 50 | 0 | 25 |
| INV/26/00099 | real | 57 | 18 | 0 | 29 |
| INV/26/00097 | real | 18 | 52 | 0 | 25 |
| INV/26/00094 | real | 23 | 52 | 0 | 29 |
| INV/26/00095 | real | 18 | 52 | 0 | 25 |
| INV/26/00098 | real | 18 | 52 | 0 | 25 |
| INV/26/00089 | real | 18 | 52 | 0 | 25 |
| EXTRA-USD-6 | synthetic | 82 | 13 | 0 | 45 |
| EXTRA-EUR-8 | synthetic | 92 | 13 | 0 | 53 |
| EXTRA-INR-12 | synthetic | 112 | 13 | 0 | 69 |
| EXTRA-AED-5 | synthetic | 77 | 13 | 0 | 41 |
| EXTRA-GBP-7 | synthetic | 87 | 13 | 0 | 49 |

Named fields on this layout:

| Record | Kind | bill-to | shipper | consignee | vessel | voyage | container | HBL | quantity | rate | currency | per-line tax | amount in words | logo |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| INV/26/00102 | real | filled | filled | not on this layout | empty in the record | empty in the record | filled | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| INV/26/00093 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | filled | filled | profile has a logo file |
| INV/26/00101 | real | filled | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| INV/26/00100 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| INV/26/00099 | real | filled | filled | empty in the record | not on this layout | empty in the record | filled | not on this layout | filled | filled | filled | empty in the record | filled | profile has a logo file |
| INV/26/00097 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | filled | filled | profile has a logo file |
| INV/26/00094 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | not drawn; SGST/CGST blocked | filled | profile has a logo file |
| INV/26/00095 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | not drawn; SGST/CGST blocked | filled | profile has a logo file |
| INV/26/00098 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | not drawn; SGST/CGST blocked | filled | profile has a logo file |
| INV/26/00089 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | filled | filled | profile has a logo file |
| EXTRA-USD-6 | synthetic | filled | filled | not on this layout | empty in the record | empty in the record | filled | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| EXTRA-EUR-8 | synthetic | filled | filled | not on this layout | empty in the record | empty in the record | filled | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| EXTRA-INR-12 | synthetic | filled | filled | not on this layout | empty in the record | empty in the record | filled | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| EXTRA-AED-5 | synthetic | filled | filled | not on this layout | empty in the record | empty in the record | filled | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| EXTRA-GBP-7 | synthetic | filled | filled | not on this layout | empty in the record | empty in the record | filled | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |

## INVOICE_REPORT_FORMAT_6_SIMPLE_INVOICE_INDIA

| Record | Kind | (a) | (b) | (c) | (d) |
|---|---|---:|---:|---:|---:|
| INV/26/00102 | real | 29 | 4 | 0 | 21 |
| INV/26/00093 | real | 29 | 4 | 0 | 21 |
| INV/26/00101 | real | 39 | 4 | 0 | 33 |
| INV/26/00100 | real | 31 | 2 | 0 | 21 |
| INV/26/00099 | real | 34 | 4 | 0 | 27 |
| INV/26/00097 | real | 29 | 4 | 0 | 21 |
| INV/26/00094 | real | 34 | 4 | 0 | 27 |
| INV/26/00095 | real | 29 | 4 | 0 | 21 |
| INV/26/00098 | real | 29 | 4 | 0 | 21 |
| INV/26/00089 | real | 29 | 4 | 0 | 21 |
| EXTRA-USD-6 | synthetic | 54 | 4 | 0 | 51 |
| EXTRA-EUR-8 | synthetic | 64 | 4 | 0 | 63 |
| EXTRA-INR-12 | synthetic | 84 | 4 | 0 | 87 |
| EXTRA-AED-5 | synthetic | 49 | 4 | 0 | 45 |
| EXTRA-GBP-7 | synthetic | 59 | 4 | 0 | 57 |

Named fields on this layout:

| Record | Kind | bill-to | shipper | consignee | vessel | voyage | container | HBL | quantity | rate | currency | per-line tax | amount in words | logo |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| INV/26/00102 | real | filled | filled | not on this layout | empty in the record | empty in the record | not on this layout | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| INV/26/00093 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | filled | filled | profile has a logo file |
| INV/26/00101 | real | filled | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| INV/26/00100 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| INV/26/00099 | real | filled | not on this layout | empty in the record | not on this layout | empty in the record | not on this layout | not on this layout | filled | filled | filled | empty in the record | filled | profile has a logo file |
| INV/26/00097 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | filled | filled | profile has a logo file |
| INV/26/00094 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | not drawn; SGST/CGST blocked | filled | profile has a logo file |
| INV/26/00095 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | not drawn; SGST/CGST blocked | filled | profile has a logo file |
| INV/26/00098 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | not drawn; SGST/CGST blocked | filled | profile has a logo file |
| INV/26/00089 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | filled | filled | profile has a logo file |
| EXTRA-USD-6 | synthetic | filled | filled | not on this layout | empty in the record | empty in the record | not on this layout | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| EXTRA-EUR-8 | synthetic | filled | filled | not on this layout | empty in the record | empty in the record | not on this layout | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| EXTRA-INR-12 | synthetic | filled | filled | not on this layout | empty in the record | empty in the record | not on this layout | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| EXTRA-AED-5 | synthetic | filled | filled | not on this layout | empty in the record | empty in the record | not on this layout | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| EXTRA-GBP-7 | synthetic | filled | filled | not on this layout | empty in the record | empty in the record | not on this layout | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |

## INVOICE_REPORT_FORMAT_7_SIMPLE_INVOICE

| Record | Kind | (a) | (b) | (c) | (d) |
|---|---|---:|---:|---:|---:|
| INV/26/00102 | real | 27 | 4 | 0 | 17 |
| INV/26/00093 | real | 26 | 5 | 0 | 17 |
| INV/26/00101 | real | 40 | 5 | 0 | 17 |
| INV/26/00100 | real | 29 | 2 | 0 | 17 |
| INV/26/00099 | real | 34 | 4 | 0 | 17 |
| INV/26/00097 | real | 26 | 5 | 0 | 17 |
| INV/26/00094 | real | 34 | 4 | 0 | 17 |
| INV/26/00095 | real | 27 | 4 | 0 | 17 |
| INV/26/00098 | real | 27 | 4 | 0 | 17 |
| INV/26/00089 | real | 26 | 5 | 0 | 17 |
| EXTRA-USD-6 | synthetic | 62 | 4 | 0 | 17 |
| EXTRA-EUR-8 | synthetic | 76 | 4 | 0 | 17 |
| EXTRA-INR-12 | synthetic | 104 | 4 | 0 | 17 |
| EXTRA-AED-5 | synthetic | 55 | 4 | 0 | 17 |
| EXTRA-GBP-7 | synthetic | 69 | 4 | 0 | 17 |

Named fields on this layout:

| Record | Kind | bill-to | shipper | consignee | vessel | voyage | container | HBL | quantity | rate | currency | per-line tax | amount in words | logo |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| INV/26/00102 | real | filled | filled | not on this layout | empty in the record | empty in the record | not on this layout | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| INV/26/00093 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | filled | filled | profile has a logo file |
| INV/26/00101 | real | filled | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| INV/26/00100 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| INV/26/00099 | real | filled | not on this layout | empty in the record | not on this layout | empty in the record | not on this layout | filled | filled | filled | filled | empty in the record | filled | profile has a logo file |
| INV/26/00097 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | filled | filled | profile has a logo file |
| INV/26/00094 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | not on this layout | filled | profile has a logo file |
| INV/26/00095 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | not on this layout | filled | profile has a logo file |
| INV/26/00098 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | not on this layout | filled | profile has a logo file |
| INV/26/00089 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | filled | filled | profile has a logo file |
| EXTRA-USD-6 | synthetic | filled | filled | not on this layout | empty in the record | empty in the record | not on this layout | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| EXTRA-EUR-8 | synthetic | filled | filled | not on this layout | empty in the record | empty in the record | not on this layout | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| EXTRA-INR-12 | synthetic | filled | filled | not on this layout | empty in the record | empty in the record | not on this layout | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| EXTRA-AED-5 | synthetic | filled | filled | not on this layout | empty in the record | empty in the record | not on this layout | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| EXTRA-GBP-7 | synthetic | filled | filled | not on this layout | empty in the record | empty in the record | not on this layout | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |

## INVOICE_REPORT_FORMAT_8_STANDARD_INVOICE_ARABIC

| Record | Kind | (a) | (b) | (c) | (d) |
|---|---|---:|---:|---:|---:|
| INV/26/00102 | real | 42 | 31 | 0 | 11 |
| INV/26/00093 | real | 15 | 58 | 0 | 11 |
| INV/26/00101 | real | 54 | 37 | 0 | 11 |
| INV/26/00100 | real | 19 | 54 | 0 | 11 |
| INV/26/00099 | real | 57 | 25 | 0 | 11 |
| INV/26/00097 | real | 15 | 58 | 0 | 11 |
| INV/26/00094 | real | 27 | 55 | 0 | 11 |
| INV/26/00095 | real | 18 | 55 | 0 | 11 |
| INV/26/00098 | real | 18 | 55 | 0 | 11 |
| INV/26/00089 | real | 15 | 58 | 0 | 11 |
| EXTRA-USD-6 | synthetic | 87 | 31 | 0 | 11 |
| EXTRA-EUR-8 | synthetic | 105 | 31 | 0 | 11 |
| EXTRA-INR-12 | synthetic | 141 | 31 | 0 | 11 |
| EXTRA-AED-5 | synthetic | 78 | 31 | 0 | 11 |
| EXTRA-GBP-7 | synthetic | 96 | 31 | 0 | 11 |

Named fields on this layout:

| Record | Kind | bill-to | shipper | consignee | vessel | voyage | container | HBL | quantity | rate | currency | per-line tax | amount in words | logo |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| INV/26/00102 | real | filled | filled | filled | empty in the record | empty in the record | not on this layout | empty in the record | filled | filled | filled | empty in the record | not on this layout | profile has a logo file |
| INV/26/00093 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | filled | not on this layout | profile has a logo file |
| INV/26/00101 | real | filled | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | empty in the record | not on this layout | profile has a logo file |
| INV/26/00100 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | empty in the record | not on this layout | profile has a logo file |
| INV/26/00099 | real | not on this layout | filled | empty in the record | filled | empty in the record | not on this layout | not on this layout | filled | filled | filled | empty in the record | not on this layout | profile has a logo file |
| INV/26/00097 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | filled | not on this layout | profile has a logo file |
| INV/26/00094 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | not on this layout | not on this layout | profile has a logo file |
| INV/26/00095 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | not on this layout | not on this layout | profile has a logo file |
| INV/26/00098 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | not on this layout | not on this layout | profile has a logo file |
| INV/26/00089 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | filled | not on this layout | profile has a logo file |
| EXTRA-USD-6 | synthetic | filled | filled | filled | empty in the record | empty in the record | not on this layout | empty in the record | filled | filled | filled | empty in the record | not on this layout | profile has a logo file |
| EXTRA-EUR-8 | synthetic | filled | filled | filled | empty in the record | empty in the record | not on this layout | empty in the record | filled | filled | filled | empty in the record | not on this layout | profile has a logo file |
| EXTRA-INR-12 | synthetic | filled | filled | filled | empty in the record | empty in the record | not on this layout | empty in the record | filled | filled | filled | empty in the record | not on this layout | profile has a logo file |
| EXTRA-AED-5 | synthetic | filled | filled | filled | empty in the record | empty in the record | not on this layout | empty in the record | filled | filled | filled | empty in the record | not on this layout | profile has a logo file |
| EXTRA-GBP-7 | synthetic | filled | filled | filled | empty in the record | empty in the record | not on this layout | empty in the record | filled | filled | filled | empty in the record | not on this layout | profile has a logo file |

## INVOICE_REPORT_FORMAT_9_STANDARD_INVOICE_USA

| Record | Kind | (a) | (b) | (c) | (d) |
|---|---|---:|---:|---:|---:|
| INV/26/00102 | real | 46 | 18 | 0 | 11 |
| INV/26/00093 | real | 27 | 37 | 0 | 11 |
| INV/26/00101 | real | 52 | 22 | 0 | 11 |
| INV/26/00100 | real | 27 | 37 | 0 | 11 |
| INV/26/00099 | real | 53 | 16 | 0 | 11 |
| INV/26/00097 | real | 27 | 37 | 0 | 11 |
| INV/26/00094 | real | 33 | 36 | 0 | 11 |
| INV/26/00095 | real | 28 | 36 | 0 | 11 |
| INV/26/00098 | real | 28 | 36 | 0 | 11 |
| INV/26/00089 | real | 27 | 37 | 0 | 11 |
| EXTRA-USD-6 | synthetic | 71 | 18 | 0 | 11 |
| EXTRA-EUR-8 | synthetic | 81 | 18 | 0 | 11 |
| EXTRA-INR-12 | synthetic | 101 | 18 | 0 | 11 |
| EXTRA-AED-5 | synthetic | 66 | 18 | 0 | 11 |
| EXTRA-GBP-7 | synthetic | 76 | 18 | 0 | 11 |

Named fields on this layout:

| Record | Kind | bill-to | shipper | consignee | vessel | voyage | container | HBL | quantity | rate | currency | per-line tax | amount in words | logo |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| INV/26/00102 | real | filled | filled | filled | empty in the record | empty in the record | not on this layout | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| INV/26/00093 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | filled | filled | profile has a logo file |
| INV/26/00101 | real | filled | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| INV/26/00100 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| INV/26/00099 | real | filled | not on this layout | empty in the record | not on this layout | empty in the record | not on this layout | not on this layout | filled | filled | filled | empty in the record | filled | profile has a logo file |
| INV/26/00097 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | filled | filled | profile has a logo file |
| INV/26/00094 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | not on this layout | filled | profile has a logo file |
| INV/26/00095 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | not on this layout | filled | profile has a logo file |
| INV/26/00098 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | not on this layout | filled | profile has a logo file |
| INV/26/00089 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | filled | filled | profile has a logo file |
| EXTRA-USD-6 | synthetic | filled | filled | filled | empty in the record | empty in the record | not on this layout | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| EXTRA-EUR-8 | synthetic | filled | filled | filled | empty in the record | empty in the record | not on this layout | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| EXTRA-INR-12 | synthetic | filled | filled | filled | empty in the record | empty in the record | not on this layout | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| EXTRA-AED-5 | synthetic | filled | filled | filled | empty in the record | empty in the record | not on this layout | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| EXTRA-GBP-7 | synthetic | filled | filled | filled | empty in the record | empty in the record | not on this layout | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |

## INVOICE_REPORT_FORMAT_10_STANDARD_INVOICE

| Record | Kind | (a) | (b) | (c) | (d) |
|---|---|---:|---:|---:|---:|
| INV/26/00102 | real | 39 | 12 | 0 | 7 |
| INV/26/00093 | real | 11 | 40 | 0 | 7 |
| INV/26/00101 | real | 30 | 33 | 0 | 9 |
| INV/26/00100 | real | 11 | 40 | 0 | 7 |
| INV/26/00099 | real | 42 | 15 | 0 | 8 |
| INV/26/00097 | real | 11 | 40 | 0 | 7 |
| INV/26/00094 | real | 18 | 39 | 0 | 8 |
| INV/26/00095 | real | 12 | 39 | 0 | 7 |
| INV/26/00098 | real | 12 | 39 | 0 | 7 |
| INV/26/00089 | real | 11 | 40 | 0 | 7 |
| EXTRA-USD-6 | synthetic | 69 | 12 | 0 | 12 |
| EXTRA-EUR-8 | synthetic | 81 | 12 | 0 | 14 |
| EXTRA-INR-12 | synthetic | 105 | 12 | 0 | 18 |
| EXTRA-AED-5 | synthetic | 63 | 12 | 0 | 11 |
| EXTRA-GBP-7 | synthetic | 75 | 12 | 0 | 13 |

Named fields on this layout:

| Record | Kind | bill-to | shipper | consignee | vessel | voyage | container | HBL | quantity | rate | currency | per-line tax | amount in words | logo |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| INV/26/00102 | real | filled | filled | filled | empty in the record | empty in the record | not on this layout | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| INV/26/00093 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | filled | filled | profile has a logo file |
| INV/26/00101 | real | filled | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| INV/26/00100 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| INV/26/00099 | real | not on this layout | filled | empty in the record | not on this layout | empty in the record | not on this layout | filled | filled | filled | filled | empty in the record | filled | profile has a logo file |
| INV/26/00097 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | filled | filled | profile has a logo file |
| INV/26/00094 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | not on this layout | filled | profile has a logo file |
| INV/26/00095 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | not on this layout | filled | profile has a logo file |
| INV/26/00098 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | not on this layout | filled | profile has a logo file |
| INV/26/00089 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | filled | filled | profile has a logo file |
| EXTRA-USD-6 | synthetic | filled | filled | filled | empty in the record | empty in the record | not on this layout | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| EXTRA-EUR-8 | synthetic | filled | filled | filled | empty in the record | empty in the record | not on this layout | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| EXTRA-INR-12 | synthetic | filled | filled | filled | empty in the record | empty in the record | not on this layout | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| EXTRA-AED-5 | synthetic | filled | filled | filled | empty in the record | empty in the record | not on this layout | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| EXTRA-GBP-7 | synthetic | filled | filled | filled | empty in the record | empty in the record | not on this layout | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |

## INVOICE_REPORT_FORMAT_11_STANDARD_INVOICE_LAND

| Record | Kind | (a) | (b) | (c) | (d) |
|---|---|---:|---:|---:|---:|
| INV/26/00102 | real | 52 | 21 | 0 | 20 |
| INV/26/00093 | real | 29 | 44 | 0 | 20 |
| INV/26/00101 | real | 59 | 34 | 0 | 20 |
| INV/26/00100 | real | 32 | 41 | 0 | 20 |
| INV/26/00099 | real | 57 | 26 | 0 | 20 |
| INV/26/00097 | real | 29 | 44 | 0 | 20 |
| INV/26/00094 | real | 40 | 43 | 0 | 20 |
| INV/26/00095 | real | 30 | 43 | 0 | 20 |
| INV/26/00098 | real | 30 | 43 | 0 | 20 |
| INV/26/00089 | real | 29 | 44 | 0 | 20 |
| EXTRA-USD-6 | synthetic | 102 | 21 | 0 | 20 |
| EXTRA-EUR-8 | synthetic | 122 | 21 | 0 | 20 |
| EXTRA-INR-12 | synthetic | 162 | 21 | 0 | 20 |
| EXTRA-AED-5 | synthetic | 92 | 21 | 0 | 20 |
| EXTRA-GBP-7 | synthetic | 112 | 21 | 0 | 20 |

Named fields on this layout:

| Record | Kind | bill-to | shipper | consignee | vessel | voyage | container | HBL | quantity | rate | currency | per-line tax | amount in words | logo |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| INV/26/00102 | real | filled | filled | filled | empty in the record | empty in the record | filled | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| INV/26/00093 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | filled | filled | profile has a logo file |
| INV/26/00101 | real | filled | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| INV/26/00100 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| INV/26/00099 | real | filled | not on this layout | empty in the record | not on this layout | empty in the record | filled | filled | filled | filled | filled | empty in the record | filled | profile has a logo file |
| INV/26/00097 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | filled | filled | profile has a logo file |
| INV/26/00094 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | not on this layout | filled | profile has a logo file |
| INV/26/00095 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | not on this layout | filled | profile has a logo file |
| INV/26/00098 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | not on this layout | filled | profile has a logo file |
| INV/26/00089 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | filled | filled | profile has a logo file |
| EXTRA-USD-6 | synthetic | filled | filled | filled | empty in the record | empty in the record | filled | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| EXTRA-EUR-8 | synthetic | filled | filled | filled | empty in the record | empty in the record | filled | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| EXTRA-INR-12 | synthetic | filled | filled | filled | empty in the record | empty in the record | filled | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| EXTRA-AED-5 | synthetic | filled | filled | filled | empty in the record | empty in the record | filled | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| EXTRA-GBP-7 | synthetic | filled | filled | filled | empty in the record | empty in the record | filled | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |

## INVOICE_REPORT_FORMAT_12_STANDARD_INVOICE_PREPRINTED

| Record | Kind | (a) | (b) | (c) | (d) |
|---|---|---:|---:|---:|---:|
| INV/26/00102 | real | 31 | 7 | 0 | 8 |
| INV/26/00093 | real | 6 | 32 | 0 | 8 |
| INV/26/00101 | real | 21 | 27 | 0 | 10 |
| INV/26/00100 | real | 8 | 30 | 0 | 8 |
| INV/26/00099 | real | 40 | 3 | 0 | 9 |
| INV/26/00097 | real | 6 | 32 | 0 | 8 |
| INV/26/00094 | real | 11 | 32 | 0 | 9 |
| INV/26/00095 | real | 6 | 32 | 0 | 8 |
| INV/26/00098 | real | 6 | 32 | 0 | 8 |
| INV/26/00089 | real | 6 | 32 | 0 | 8 |
| EXTRA-USD-6 | synthetic | 56 | 7 | 0 | 13 |
| EXTRA-EUR-8 | synthetic | 66 | 7 | 0 | 15 |
| EXTRA-INR-12 | synthetic | 86 | 7 | 0 | 19 |
| EXTRA-AED-5 | synthetic | 51 | 7 | 0 | 12 |
| EXTRA-GBP-7 | synthetic | 61 | 7 | 0 | 14 |

Named fields on this layout:

| Record | Kind | bill-to | shipper | consignee | vessel | voyage | container | HBL | quantity | rate | currency | per-line tax | amount in words | logo |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| INV/26/00102 | real | not on this layout | not on this layout | not on this layout | empty in the record | empty in the record | filled | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| INV/26/00093 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | filled | filled | profile has a logo file |
| INV/26/00101 | real | not on this layout | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| INV/26/00100 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| INV/26/00099 | real | not on this layout | not on this layout | empty in the record | not on this layout | empty in the record | filled | filled | filled | filled | filled | empty in the record | filled | profile has a logo file |
| INV/26/00097 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | filled | filled | profile has a logo file |
| INV/26/00094 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | not on this layout | filled | profile has a logo file |
| INV/26/00095 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | not on this layout | filled | profile has a logo file |
| INV/26/00098 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | not on this layout | filled | profile has a logo file |
| INV/26/00089 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | filled | filled | profile has a logo file |
| EXTRA-USD-6 | synthetic | not on this layout | not on this layout | not on this layout | empty in the record | empty in the record | filled | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| EXTRA-EUR-8 | synthetic | not on this layout | not on this layout | not on this layout | empty in the record | empty in the record | filled | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| EXTRA-INR-12 | synthetic | not on this layout | not on this layout | not on this layout | empty in the record | empty in the record | filled | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| EXTRA-AED-5 | synthetic | not on this layout | not on this layout | not on this layout | empty in the record | empty in the record | filled | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| EXTRA-GBP-7 | synthetic | not on this layout | not on this layout | not on this layout | empty in the record | empty in the record | filled | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |

## INVOICE_REPORT_FORMAT_13_STANDARD_INVOICE_USA

| Record | Kind | (a) | (b) | (c) | (d) |
|---|---|---:|---:|---:|---:|
| INV/26/00102 | real | 15 | 4 | 0 | 10 |
| INV/26/00093 | real | 12 | 7 | 0 | 10 |
| INV/26/00101 | real | 23 | 4 | 0 | 10 |
| INV/26/00100 | real | 14 | 5 | 0 | 10 |
| INV/26/00099 | real | 19 | 4 | 0 | 10 |
| INV/26/00097 | real | 12 | 7 | 0 | 10 |
| INV/26/00094 | real | 16 | 7 | 0 | 10 |
| INV/26/00095 | real | 12 | 7 | 0 | 10 |
| INV/26/00098 | real | 12 | 7 | 0 | 10 |
| INV/26/00089 | real | 12 | 7 | 0 | 10 |
| EXTRA-USD-6 | synthetic | 35 | 4 | 0 | 10 |
| EXTRA-EUR-8 | synthetic | 43 | 4 | 0 | 10 |
| EXTRA-INR-12 | synthetic | 59 | 4 | 0 | 10 |
| EXTRA-AED-5 | synthetic | 31 | 4 | 0 | 10 |
| EXTRA-GBP-7 | synthetic | 39 | 4 | 0 | 10 |

Named fields on this layout:

| Record | Kind | bill-to | shipper | consignee | vessel | voyage | container | HBL | quantity | rate | currency | per-line tax | amount in words | logo |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| INV/26/00102 | real | filled | filled | not on this layout | empty in the record | empty in the record | not on this layout | empty in the record | filled | filled | not on this layout | empty in the record | filled | profile has a logo file |
| INV/26/00093 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | not on this layout | filled | filled | profile has a logo file |
| INV/26/00101 | real | filled | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | not on this layout | empty in the record | filled | profile has a logo file |
| INV/26/00100 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | not on this layout | empty in the record | filled | profile has a logo file |
| INV/26/00099 | real | filled | not on this layout | empty in the record | not on this layout | empty in the record | not on this layout | not on this layout | filled | filled | not on this layout | empty in the record | filled | profile has a logo file |
| INV/26/00097 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | not on this layout | filled | filled | profile has a logo file |
| INV/26/00094 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | not on this layout | not on this layout | filled | profile has a logo file |
| INV/26/00095 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | not on this layout | not on this layout | filled | profile has a logo file |
| INV/26/00098 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | not on this layout | not on this layout | filled | profile has a logo file |
| INV/26/00089 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | not on this layout | filled | filled | profile has a logo file |
| EXTRA-USD-6 | synthetic | filled | filled | not on this layout | empty in the record | empty in the record | not on this layout | empty in the record | filled | filled | not on this layout | empty in the record | filled | profile has a logo file |
| EXTRA-EUR-8 | synthetic | filled | filled | not on this layout | empty in the record | empty in the record | not on this layout | empty in the record | filled | filled | not on this layout | empty in the record | filled | profile has a logo file |
| EXTRA-INR-12 | synthetic | filled | filled | not on this layout | empty in the record | empty in the record | not on this layout | empty in the record | filled | filled | not on this layout | empty in the record | filled | profile has a logo file |
| EXTRA-AED-5 | synthetic | filled | filled | not on this layout | empty in the record | empty in the record | not on this layout | empty in the record | filled | filled | not on this layout | empty in the record | filled | profile has a logo file |
| EXTRA-GBP-7 | synthetic | filled | filled | not on this layout | empty in the record | empty in the record | not on this layout | empty in the record | filled | filled | not on this layout | empty in the record | filled | profile has a logo file |

## INVOICE_REPORT_FORMAT_14_INVOICE

| Record | Kind | (a) | (b) | (c) | (d) |
|---|---|---:|---:|---:|---:|
| INV/26/00102 | real | 28 | 3 | 0 | 12 |
| INV/26/00093 | real | 15 | 16 | 0 | 12 |
| INV/26/00101 | real | 36 | 5 | 0 | 20 |
| INV/26/00100 | real | 15 | 16 | 0 | 12 |
| INV/26/00099 | real | 33 | 3 | 0 | 16 |
| INV/26/00097 | real | 15 | 16 | 0 | 12 |
| INV/26/00094 | real | 22 | 14 | 0 | 16 |
| INV/26/00095 | real | 17 | 14 | 0 | 12 |
| INV/26/00098 | real | 17 | 14 | 0 | 12 |
| INV/26/00089 | real | 15 | 16 | 0 | 12 |
| EXTRA-USD-6 | synthetic | 53 | 3 | 0 | 32 |
| EXTRA-EUR-8 | synthetic | 63 | 3 | 0 | 40 |
| EXTRA-INR-12 | synthetic | 83 | 3 | 0 | 56 |
| EXTRA-AED-5 | synthetic | 48 | 3 | 0 | 28 |
| EXTRA-GBP-7 | synthetic | 58 | 3 | 0 | 36 |

Named fields on this layout:

| Record | Kind | bill-to | shipper | consignee | vessel | voyage | container | HBL | quantity | rate | currency | per-line tax | amount in words | logo |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| INV/26/00102 | real | filled | filled | not on this layout | empty in the record | empty in the record | filled | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| INV/26/00093 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | filled | filled | profile has a logo file |
| INV/26/00101 | real | filled | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| INV/26/00100 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| INV/26/00099 | real | not on this layout | filled | empty in the record | not on this layout | empty in the record | filled | not on this layout | filled | filled | filled | empty in the record | filled | profile has a logo file |
| INV/26/00097 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | filled | filled | profile has a logo file |
| INV/26/00094 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | not drawn; SGST/CGST blocked | filled | profile has a logo file |
| INV/26/00095 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | not drawn; SGST/CGST blocked | filled | profile has a logo file |
| INV/26/00098 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | not drawn; SGST/CGST blocked | filled | profile has a logo file |
| INV/26/00089 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | filled | filled | profile has a logo file |
| EXTRA-USD-6 | synthetic | filled | filled | not on this layout | empty in the record | empty in the record | filled | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| EXTRA-EUR-8 | synthetic | filled | filled | not on this layout | empty in the record | empty in the record | filled | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| EXTRA-INR-12 | synthetic | filled | filled | not on this layout | empty in the record | empty in the record | filled | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| EXTRA-AED-5 | synthetic | filled | filled | not on this layout | empty in the record | empty in the record | filled | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| EXTRA-GBP-7 | synthetic | filled | filled | not on this layout | empty in the record | empty in the record | filled | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |

## INVOICE_REPORT_FORMAT_15_INVOICE_FCY

| Record | Kind | (a) | (b) | (c) | (d) |
|---|---|---:|---:|---:|---:|
| INV/26/00102 | real | 20 | 16 | 0 | 11 |
| INV/26/00093 | real | 7 | 29 | 0 | 11 |
| INV/26/00101 | real | 18 | 18 | 0 | 13 |
| INV/26/00100 | real | 7 | 29 | 0 | 11 |
| INV/26/00099 | real | 24 | 12 | 0 | 12 |
| INV/26/00097 | real | 7 | 29 | 0 | 11 |
| INV/26/00094 | real | 9 | 27 | 0 | 12 |
| INV/26/00095 | real | 9 | 27 | 0 | 11 |
| INV/26/00098 | real | 9 | 27 | 0 | 11 |
| INV/26/00089 | real | 7 | 29 | 0 | 11 |
| EXTRA-USD-6 | synthetic | 20 | 16 | 0 | 16 |
| EXTRA-EUR-8 | synthetic | 20 | 16 | 0 | 18 |
| EXTRA-INR-12 | synthetic | 20 | 16 | 0 | 22 |
| EXTRA-AED-5 | synthetic | 20 | 16 | 0 | 15 |
| EXTRA-GBP-7 | synthetic | 20 | 16 | 0 | 17 |

Named fields on this layout:

| Record | Kind | bill-to | shipper | consignee | vessel | voyage | container | HBL | quantity | rate | currency | per-line tax | amount in words | logo |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| INV/26/00102 | real | filled | filled | not on this layout | empty in the record | empty in the record | filled | empty in the record | not on this layout | filled | not on this layout | empty in the record | filled | profile has a logo file |
| INV/26/00093 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | not on this layout | filled | not on this layout | not on this layout | filled | profile has a logo file |
| INV/26/00101 | real | filled | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | not on this layout | filled | not on this layout | empty in the record | filled | profile has a logo file |
| INV/26/00100 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | not on this layout | filled | not on this layout | empty in the record | filled | profile has a logo file |
| INV/26/00099 | real | not on this layout | filled | empty in the record | not on this layout | empty in the record | filled | filled | not on this layout | filled | not on this layout | empty in the record | filled | profile has a logo file |
| INV/26/00097 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | not on this layout | filled | not on this layout | not on this layout | filled | profile has a logo file |
| INV/26/00094 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | not on this layout | filled | not on this layout | not on this layout | filled | profile has a logo file |
| INV/26/00095 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | not on this layout | filled | not on this layout | not on this layout | filled | profile has a logo file |
| INV/26/00098 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | not on this layout | filled | not on this layout | not on this layout | filled | profile has a logo file |
| INV/26/00089 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | not on this layout | filled | not on this layout | not on this layout | filled | profile has a logo file |
| EXTRA-USD-6 | synthetic | filled | filled | not on this layout | empty in the record | empty in the record | filled | empty in the record | not on this layout | filled | not on this layout | empty in the record | filled | profile has a logo file |
| EXTRA-EUR-8 | synthetic | filled | filled | not on this layout | empty in the record | empty in the record | filled | empty in the record | not on this layout | filled | not on this layout | empty in the record | filled | profile has a logo file |
| EXTRA-INR-12 | synthetic | filled | filled | not on this layout | empty in the record | empty in the record | filled | empty in the record | not on this layout | filled | not on this layout | empty in the record | filled | profile has a logo file |
| EXTRA-AED-5 | synthetic | filled | filled | not on this layout | empty in the record | empty in the record | filled | empty in the record | not on this layout | filled | not on this layout | empty in the record | filled | profile has a logo file |
| EXTRA-GBP-7 | synthetic | filled | filled | not on this layout | empty in the record | empty in the record | filled | empty in the record | not on this layout | filled | not on this layout | empty in the record | filled | profile has a logo file |

## INVOICE_REPORT_FORMAT_16_STANDARD_TAX_INVOICE_PREPRINTED

| Record | Kind | (a) | (b) | (c) | (d) |
|---|---|---:|---:|---:|---:|
| INV/26/00102 | real | 41 | 7 | 0 | 10 |
| INV/26/00093 | real | 18 | 30 | 0 | 10 |
| INV/26/00101 | real | 34 | 26 | 0 | 16 |
| INV/26/00100 | real | 18 | 30 | 0 | 10 |
| INV/26/00099 | real | 41 | 13 | 0 | 13 |
| INV/26/00097 | real | 18 | 30 | 0 | 10 |
| INV/26/00094 | real | 25 | 29 | 0 | 13 |
| INV/26/00095 | real | 19 | 29 | 0 | 10 |
| INV/26/00098 | real | 19 | 29 | 0 | 10 |
| INV/26/00089 | real | 18 | 30 | 0 | 10 |
| EXTRA-USD-6 | synthetic | 71 | 7 | 0 | 25 |
| EXTRA-EUR-8 | synthetic | 83 | 7 | 0 | 31 |
| EXTRA-INR-12 | synthetic | 107 | 7 | 0 | 43 |
| EXTRA-AED-5 | synthetic | 65 | 7 | 0 | 22 |
| EXTRA-GBP-7 | synthetic | 77 | 7 | 0 | 28 |

Named fields on this layout:

| Record | Kind | bill-to | shipper | consignee | vessel | voyage | container | HBL | quantity | rate | currency | per-line tax | amount in words | logo |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| INV/26/00102 | real | filled | filled | filled | empty in the record | empty in the record | not on this layout | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| INV/26/00093 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | filled | filled | profile has a logo file |
| INV/26/00101 | real | filled | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| INV/26/00100 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| INV/26/00099 | real | not on this layout | filled | empty in the record | not on this layout | empty in the record | not on this layout | not on this layout | filled | filled | filled | empty in the record | filled | profile has a logo file |
| INV/26/00097 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | filled | filled | profile has a logo file |
| INV/26/00094 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | not on this layout | filled | profile has a logo file |
| INV/26/00095 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | not on this layout | filled | profile has a logo file |
| INV/26/00098 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | not on this layout | filled | profile has a logo file |
| INV/26/00089 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | filled | filled | profile has a logo file |
| EXTRA-USD-6 | synthetic | filled | filled | filled | empty in the record | empty in the record | not on this layout | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| EXTRA-EUR-8 | synthetic | filled | filled | filled | empty in the record | empty in the record | not on this layout | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| EXTRA-INR-12 | synthetic | filled | filled | filled | empty in the record | empty in the record | not on this layout | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| EXTRA-AED-5 | synthetic | filled | filled | filled | empty in the record | empty in the record | not on this layout | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| EXTRA-GBP-7 | synthetic | filled | filled | filled | empty in the record | empty in the record | not on this layout | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |

## INVOICE_REPORT_FORMAT_17_INVOICE_JASPER

| Record | Kind | (a) | (b) | (c) | (d) |
|---|---|---:|---:|---:|---:|
| INV/26/00102 | real | 28 | 3 | 0 | 7 |
| INV/26/00093 | real | 15 | 16 | 0 | 7 |
| INV/26/00101 | real | 36 | 5 | 0 | 11 |
| INV/26/00100 | real | 15 | 16 | 0 | 7 |
| INV/26/00099 | real | 33 | 3 | 0 | 9 |
| INV/26/00097 | real | 15 | 16 | 0 | 7 |
| INV/26/00094 | real | 22 | 14 | 0 | 9 |
| INV/26/00095 | real | 17 | 14 | 0 | 7 |
| INV/26/00098 | real | 17 | 14 | 0 | 7 |
| INV/26/00089 | real | 15 | 16 | 0 | 7 |
| EXTRA-USD-6 | synthetic | 53 | 3 | 0 | 17 |
| EXTRA-EUR-8 | synthetic | 63 | 3 | 0 | 21 |
| EXTRA-INR-12 | synthetic | 83 | 3 | 0 | 29 |
| EXTRA-AED-5 | synthetic | 48 | 3 | 0 | 15 |
| EXTRA-GBP-7 | synthetic | 58 | 3 | 0 | 19 |

Named fields on this layout:

| Record | Kind | bill-to | shipper | consignee | vessel | voyage | container | HBL | quantity | rate | currency | per-line tax | amount in words | logo |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| INV/26/00102 | real | filled | filled | not on this layout | empty in the record | empty in the record | filled | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| INV/26/00093 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | filled | filled | profile has a logo file |
| INV/26/00101 | real | filled | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| INV/26/00100 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| INV/26/00099 | real | not on this layout | filled | empty in the record | not on this layout | empty in the record | filled | not on this layout | filled | filled | filled | empty in the record | filled | profile has a logo file |
| INV/26/00097 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | filled | filled | profile has a logo file |
| INV/26/00094 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | not on this layout | filled | profile has a logo file |
| INV/26/00095 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | not on this layout | filled | profile has a logo file |
| INV/26/00098 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | not on this layout | filled | profile has a logo file |
| INV/26/00089 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | filled | filled | profile has a logo file |
| EXTRA-USD-6 | synthetic | filled | filled | not on this layout | empty in the record | empty in the record | filled | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| EXTRA-EUR-8 | synthetic | filled | filled | not on this layout | empty in the record | empty in the record | filled | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| EXTRA-INR-12 | synthetic | filled | filled | not on this layout | empty in the record | empty in the record | filled | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| EXTRA-AED-5 | synthetic | filled | filled | not on this layout | empty in the record | empty in the record | filled | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| EXTRA-GBP-7 | synthetic | filled | filled | not on this layout | empty in the record | empty in the record | filled | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |

## INVOICE_REPORT_FORMAT_18_LAND_FREIGHT_TRANSPORTATION_INVOICE

| Record | Kind | (a) | (b) | (c) | (d) |
|---|---|---:|---:|---:|---:|
| INV/26/00102 | real | 26 | 1 | 0 | 22 |
| INV/26/00093 | real | 21 | 6 | 0 | 22 |
| INV/26/00101 | real | 32 | 1 | 0 | 24 |
| INV/26/00100 | real | 21 | 6 | 0 | 22 |
| INV/26/00099 | real | 29 | 1 | 0 | 23 |
| INV/26/00097 | real | 21 | 6 | 0 | 22 |
| INV/26/00094 | real | 24 | 6 | 0 | 23 |
| INV/26/00095 | real | 21 | 6 | 0 | 22 |
| INV/26/00098 | real | 21 | 6 | 0 | 22 |
| INV/26/00089 | real | 21 | 6 | 0 | 22 |
| EXTRA-USD-6 | synthetic | 41 | 1 | 0 | 27 |
| EXTRA-EUR-8 | synthetic | 47 | 1 | 0 | 29 |
| EXTRA-INR-12 | synthetic | 59 | 1 | 0 | 33 |
| EXTRA-AED-5 | synthetic | 38 | 1 | 0 | 26 |
| EXTRA-GBP-7 | synthetic | 44 | 1 | 0 | 28 |

Named fields on this layout:

| Record | Kind | bill-to | shipper | consignee | vessel | voyage | container | HBL | quantity | rate | currency | per-line tax | amount in words | logo |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| INV/26/00102 | real | filled | filled | not on this layout | empty in the record | empty in the record | not on this layout | empty in the record | not on this layout | filled | not on this layout | empty in the record | filled | profile has a logo file |
| INV/26/00093 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | not on this layout | filled | not on this layout | filled | filled | profile has a logo file |
| INV/26/00101 | real | filled | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | not on this layout | filled | not on this layout | empty in the record | filled | profile has a logo file |
| INV/26/00100 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | not on this layout | filled | not on this layout | empty in the record | filled | profile has a logo file |
| INV/26/00099 | real | filled | not on this layout | empty in the record | not on this layout | empty in the record | not on this layout | not on this layout | not on this layout | filled | not on this layout | empty in the record | filled | profile has a logo file |
| INV/26/00097 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | not on this layout | filled | not on this layout | filled | filled | profile has a logo file |
| INV/26/00094 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | not on this layout | filled | not on this layout | not on this layout | filled | profile has a logo file |
| INV/26/00095 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | not on this layout | filled | not on this layout | not on this layout | filled | profile has a logo file |
| INV/26/00098 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | not on this layout | filled | not on this layout | not on this layout | filled | profile has a logo file |
| INV/26/00089 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | not on this layout | filled | not on this layout | filled | filled | profile has a logo file |
| EXTRA-USD-6 | synthetic | filled | filled | not on this layout | empty in the record | empty in the record | not on this layout | empty in the record | not on this layout | filled | not on this layout | empty in the record | filled | profile has a logo file |
| EXTRA-EUR-8 | synthetic | filled | filled | not on this layout | empty in the record | empty in the record | not on this layout | empty in the record | not on this layout | filled | not on this layout | empty in the record | filled | profile has a logo file |
| EXTRA-INR-12 | synthetic | filled | filled | not on this layout | empty in the record | empty in the record | not on this layout | empty in the record | not on this layout | filled | not on this layout | empty in the record | filled | profile has a logo file |
| EXTRA-AED-5 | synthetic | filled | filled | not on this layout | empty in the record | empty in the record | not on this layout | empty in the record | not on this layout | filled | not on this layout | empty in the record | filled | profile has a logo file |
| EXTRA-GBP-7 | synthetic | filled | filled | not on this layout | empty in the record | empty in the record | not on this layout | empty in the record | not on this layout | filled | not on this layout | empty in the record | filled | profile has a logo file |

## INVOICE_REPORT_FORMAT_19_DEBIT_NOTE_VIETNAM

| Record | Kind | (a) | (b) | (c) | (d) |
|---|---|---:|---:|---:|---:|
| INV/26/00102 | real | 23 | 5 | 0 | 6 |
| INV/26/00093 | real | 4 | 24 | 0 | 6 |
| INV/26/00101 | real | 25 | 11 | 0 | 8 |
| INV/26/00100 | real | 8 | 20 | 0 | 6 |
| INV/26/00099 | real | 27 | 5 | 0 | 7 |
| INV/26/00097 | real | 4 | 24 | 0 | 6 |
| INV/26/00094 | real | 8 | 24 | 0 | 7 |
| INV/26/00095 | real | 4 | 24 | 0 | 6 |
| INV/26/00098 | real | 4 | 24 | 0 | 6 |
| INV/26/00089 | real | 4 | 24 | 0 | 6 |
| EXTRA-USD-6 | synthetic | 43 | 5 | 0 | 11 |
| EXTRA-EUR-8 | synthetic | 51 | 5 | 0 | 13 |
| EXTRA-INR-12 | synthetic | 67 | 5 | 0 | 17 |
| EXTRA-AED-5 | synthetic | 39 | 5 | 0 | 10 |
| EXTRA-GBP-7 | synthetic | 47 | 5 | 0 | 12 |

Named fields on this layout:

| Record | Kind | bill-to | shipper | consignee | vessel | voyage | container | HBL | quantity | rate | currency | per-line tax | amount in words | logo |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| INV/26/00102 | real | not on this layout | not on this layout | not on this layout | empty in the record | empty in the record | not on this layout | empty in the record | not on this layout | filled | filled | empty in the record | not on this layout | profile has a logo file |
| INV/26/00093 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | not on this layout | filled | filled | filled | not on this layout | profile has a logo file |
| INV/26/00101 | real | not on this layout | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | not on this layout | filled | filled | empty in the record | not on this layout | profile has a logo file |
| INV/26/00100 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | not on this layout | filled | filled | empty in the record | not on this layout | profile has a logo file |
| INV/26/00099 | real | not on this layout | not on this layout | empty in the record | not on this layout | empty in the record | not on this layout | not on this layout | not on this layout | filled | filled | empty in the record | not on this layout | profile has a logo file |
| INV/26/00097 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | not on this layout | filled | filled | filled | not on this layout | profile has a logo file |
| INV/26/00094 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | not on this layout | filled | filled | not on this layout | not on this layout | profile has a logo file |
| INV/26/00095 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | not on this layout | filled | filled | not on this layout | not on this layout | profile has a logo file |
| INV/26/00098 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | not on this layout | filled | filled | not on this layout | not on this layout | profile has a logo file |
| INV/26/00089 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | not on this layout | filled | filled | filled | not on this layout | profile has a logo file |
| EXTRA-USD-6 | synthetic | not on this layout | not on this layout | not on this layout | empty in the record | empty in the record | not on this layout | empty in the record | not on this layout | filled | filled | empty in the record | not on this layout | profile has a logo file |
| EXTRA-EUR-8 | synthetic | not on this layout | not on this layout | not on this layout | empty in the record | empty in the record | not on this layout | empty in the record | not on this layout | filled | filled | empty in the record | not on this layout | profile has a logo file |
| EXTRA-INR-12 | synthetic | not on this layout | not on this layout | not on this layout | empty in the record | empty in the record | not on this layout | empty in the record | not on this layout | filled | filled | empty in the record | not on this layout | profile has a logo file |
| EXTRA-AED-5 | synthetic | not on this layout | not on this layout | not on this layout | empty in the record | empty in the record | not on this layout | empty in the record | not on this layout | filled | filled | empty in the record | not on this layout | profile has a logo file |
| EXTRA-GBP-7 | synthetic | not on this layout | not on this layout | not on this layout | empty in the record | empty in the record | not on this layout | empty in the record | not on this layout | filled | filled | empty in the record | not on this layout | profile has a logo file |

## INVOICE_REPORT_FORMAT_20_TAX_INVOICE_INDIA

| Record | Kind | (a) | (b) | (c) | (d) |
|---|---|---:|---:|---:|---:|
| INV/26/00102 | real | 62 | 15 | 0 | 31 |
| INV/26/00093 | real | 22 | 55 | 0 | 31 |
| INV/26/00101 | real | 48 | 39 | 0 | 43 |
| INV/26/00100 | real | 24 | 53 | 0 | 31 |
| INV/26/00099 | real | 61 | 21 | 0 | 37 |
| INV/26/00097 | real | 22 | 55 | 0 | 31 |
| INV/26/00094 | real | 27 | 55 | 0 | 37 |
| INV/26/00095 | real | 22 | 55 | 0 | 31 |
| INV/26/00098 | real | 22 | 55 | 0 | 31 |
| INV/26/00089 | real | 22 | 55 | 0 | 31 |
| EXTRA-USD-6 | synthetic | 87 | 15 | 0 | 61 |
| EXTRA-EUR-8 | synthetic | 97 | 15 | 0 | 73 |
| EXTRA-INR-12 | synthetic | 117 | 15 | 0 | 97 |
| EXTRA-AED-5 | synthetic | 82 | 15 | 0 | 55 |
| EXTRA-GBP-7 | synthetic | 92 | 15 | 0 | 67 |

Named fields on this layout:

| Record | Kind | bill-to | shipper | consignee | vessel | voyage | container | HBL | quantity | rate | currency | per-line tax | amount in words | logo |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| INV/26/00102 | real | filled | filled | not on this layout | empty in the record | empty in the record | filled | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| INV/26/00093 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | filled | filled | profile has a logo file |
| INV/26/00101 | real | filled | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| INV/26/00100 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| INV/26/00099 | real | filled | filled | empty in the record | not on this layout | empty in the record | filled | not on this layout | filled | filled | filled | empty in the record | filled | profile has a logo file |
| INV/26/00097 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | filled | filled | profile has a logo file |
| INV/26/00094 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | not drawn; SGST/CGST blocked | filled | profile has a logo file |
| INV/26/00095 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | not drawn; SGST/CGST blocked | filled | profile has a logo file |
| INV/26/00098 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | not drawn; SGST/CGST blocked | filled | profile has a logo file |
| INV/26/00089 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | filled | filled | profile has a logo file |
| EXTRA-USD-6 | synthetic | filled | filled | not on this layout | empty in the record | empty in the record | filled | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| EXTRA-EUR-8 | synthetic | filled | filled | not on this layout | empty in the record | empty in the record | filled | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| EXTRA-INR-12 | synthetic | filled | filled | not on this layout | empty in the record | empty in the record | filled | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| EXTRA-AED-5 | synthetic | filled | filled | not on this layout | empty in the record | empty in the record | filled | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| EXTRA-GBP-7 | synthetic | filled | filled | not on this layout | empty in the record | empty in the record | filled | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |

## INVOICE_REPORT_FORMAT_21_WAREHOUSE_INVOICE

| Record | Kind | (a) | (b) | (c) | (d) |
|---|---|---:|---:|---:|---:|
| INV/26/00102 | real | 54 | 13 | 0 | 19 |
| INV/26/00093 | real | 6 | 61 | 0 | 19 |
| INV/26/00101 | real | 29 | 44 | 0 | 23 |
| INV/26/00100 | real | 9 | 58 | 0 | 19 |
| INV/26/00099 | real | 51 | 19 | 0 | 21 |
| INV/26/00097 | real | 6 | 61 | 0 | 19 |
| INV/26/00094 | real | 10 | 60 | 0 | 21 |
| INV/26/00095 | real | 7 | 60 | 0 | 19 |
| INV/26/00098 | real | 7 | 60 | 0 | 19 |
| INV/26/00089 | real | 6 | 61 | 0 | 19 |
| EXTRA-USD-6 | synthetic | 69 | 13 | 0 | 29 |
| EXTRA-EUR-8 | synthetic | 75 | 13 | 0 | 33 |
| EXTRA-INR-12 | synthetic | 87 | 13 | 0 | 41 |
| EXTRA-AED-5 | synthetic | 66 | 13 | 0 | 27 |
| EXTRA-GBP-7 | synthetic | 72 | 13 | 0 | 31 |

Named fields on this layout:

| Record | Kind | bill-to | shipper | consignee | vessel | voyage | container | HBL | quantity | rate | currency | per-line tax | amount in words | logo |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| INV/26/00102 | real | not on this layout | not on this layout | filled | empty in the record | empty in the record | filled | empty in the record | filled | not on this layout | not on this layout | empty in the record | filled | profile has a logo file |
| INV/26/00093 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | not on this layout | not on this layout | filled | filled | profile has a logo file |
| INV/26/00101 | real | not on this layout | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | not on this layout | not on this layout | empty in the record | filled | profile has a logo file |
| INV/26/00100 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | not on this layout | empty in the record | filled | profile has a logo file |
| INV/26/00099 | real | not on this layout | not on this layout | empty in the record | not on this layout | empty in the record | filled | filled | filled | filled | not on this layout | empty in the record | filled | profile has a logo file |
| INV/26/00097 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | not on this layout | not on this layout | filled | filled | profile has a logo file |
| INV/26/00094 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | not on this layout | not on this layout | not on this layout | filled | profile has a logo file |
| INV/26/00095 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | not on this layout | not on this layout | not on this layout | filled | profile has a logo file |
| INV/26/00098 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | not on this layout | not on this layout | not on this layout | filled | profile has a logo file |
| INV/26/00089 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | not on this layout | not on this layout | filled | filled | profile has a logo file |
| EXTRA-USD-6 | synthetic | not on this layout | not on this layout | filled | empty in the record | empty in the record | filled | empty in the record | filled | filled | not on this layout | empty in the record | filled | profile has a logo file |
| EXTRA-EUR-8 | synthetic | not on this layout | not on this layout | filled | empty in the record | empty in the record | filled | empty in the record | filled | filled | not on this layout | empty in the record | filled | profile has a logo file |
| EXTRA-INR-12 | synthetic | not on this layout | not on this layout | filled | empty in the record | empty in the record | filled | empty in the record | filled | filled | not on this layout | empty in the record | filled | profile has a logo file |
| EXTRA-AED-5 | synthetic | not on this layout | not on this layout | filled | empty in the record | empty in the record | filled | empty in the record | filled | filled | not on this layout | empty in the record | filled | profile has a logo file |
| EXTRA-GBP-7 | synthetic | not on this layout | not on this layout | filled | empty in the record | empty in the record | filled | empty in the record | filled | filled | not on this layout | empty in the record | filled | profile has a logo file |

## PROFORMA_INVOICE_ALL_CHARGES_REPORT_FORMAT

| Record | Kind | (a) | (b) | (c) | (d) |
|---|---|---:|---:|---:|---:|
| INV/26/00102 | real | 46 | 13 | 0 | 18 |
| INV/26/00093 | real | 16 | 43 | 0 | 18 |
| INV/26/00101 | real | 40 | 29 | 0 | 28 |
| INV/26/00100 | real | 16 | 43 | 0 | 18 |
| INV/26/00099 | real | 45 | 19 | 0 | 23 |
| INV/26/00097 | real | 16 | 43 | 0 | 18 |
| INV/26/00094 | real | 21 | 43 | 0 | 23 |
| INV/26/00095 | real | 16 | 43 | 0 | 18 |
| INV/26/00098 | real | 16 | 43 | 0 | 18 |
| INV/26/00089 | real | 16 | 43 | 0 | 18 |
| EXTRA-USD-6 | synthetic | 71 | 13 | 0 | 43 |
| EXTRA-EUR-8 | synthetic | 81 | 13 | 0 | 53 |
| EXTRA-INR-12 | synthetic | 101 | 13 | 0 | 73 |
| EXTRA-AED-5 | synthetic | 66 | 13 | 0 | 38 |
| EXTRA-GBP-7 | synthetic | 76 | 13 | 0 | 48 |

Named fields on this layout:

| Record | Kind | bill-to | shipper | consignee | vessel | voyage | container | HBL | quantity | rate | currency | per-line tax | amount in words | logo |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| INV/26/00102 | real | filled | filled | filled | empty in the record | empty in the record | filled | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| INV/26/00093 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | filled | filled | profile has a logo file |
| INV/26/00101 | real | filled | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| INV/26/00100 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| INV/26/00099 | real | filled | not on this layout | empty in the record | not on this layout | empty in the record | filled | not on this layout | filled | filled | filled | empty in the record | filled | profile has a logo file |
| INV/26/00097 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | filled | filled | profile has a logo file |
| INV/26/00094 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | not on this layout | filled | profile has a logo file |
| INV/26/00095 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | not on this layout | filled | profile has a logo file |
| INV/26/00098 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | not on this layout | filled | profile has a logo file |
| INV/26/00089 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | filled | filled | profile has a logo file |
| EXTRA-USD-6 | synthetic | filled | filled | filled | empty in the record | empty in the record | filled | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| EXTRA-EUR-8 | synthetic | filled | filled | filled | empty in the record | empty in the record | filled | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| EXTRA-INR-12 | synthetic | filled | filled | filled | empty in the record | empty in the record | filled | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| EXTRA-AED-5 | synthetic | filled | filled | filled | empty in the record | empty in the record | filled | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| EXTRA-GBP-7 | synthetic | filled | filled | filled | empty in the record | empty in the record | filled | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |

## PROFORMA_INVOICE_REPORT_FORMAT_1_PROFORMA_INVOICE_ALL_CHARGES

| Record | Kind | (a) | (b) | (c) | (d) |
|---|---|---:|---:|---:|---:|
| INV/26/00102 | real | 39 | 13 | 0 | 16 |
| INV/26/00093 | real | 14 | 38 | 0 | 16 |
| INV/26/00101 | real | 34 | 28 | 0 | 26 |
| INV/26/00100 | real | 14 | 38 | 0 | 16 |
| INV/26/00099 | real | 38 | 19 | 0 | 21 |
| INV/26/00097 | real | 14 | 38 | 0 | 16 |
| INV/26/00094 | real | 19 | 38 | 0 | 21 |
| INV/26/00095 | real | 14 | 38 | 0 | 16 |
| INV/26/00098 | real | 14 | 38 | 0 | 16 |
| INV/26/00089 | real | 14 | 38 | 0 | 16 |
| EXTRA-USD-6 | synthetic | 64 | 13 | 0 | 41 |
| EXTRA-EUR-8 | synthetic | 74 | 13 | 0 | 51 |
| EXTRA-INR-12 | synthetic | 94 | 13 | 0 | 71 |
| EXTRA-AED-5 | synthetic | 59 | 13 | 0 | 36 |
| EXTRA-GBP-7 | synthetic | 69 | 13 | 0 | 46 |

Named fields on this layout:

| Record | Kind | bill-to | shipper | consignee | vessel | voyage | container | HBL | quantity | rate | currency | per-line tax | amount in words | logo |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| INV/26/00102 | real | filled | filled | filled | empty in the record | empty in the record | filled | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| INV/26/00093 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | filled | filled | profile has a logo file |
| INV/26/00101 | real | filled | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| INV/26/00100 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| INV/26/00099 | real | filled | not on this layout | empty in the record | not on this layout | empty in the record | filled | not on this layout | filled | filled | filled | empty in the record | filled | profile has a logo file |
| INV/26/00097 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | filled | filled | profile has a logo file |
| INV/26/00094 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | not on this layout | filled | profile has a logo file |
| INV/26/00095 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | not on this layout | filled | profile has a logo file |
| INV/26/00098 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | not on this layout | filled | profile has a logo file |
| INV/26/00089 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | filled | filled | profile has a logo file |
| EXTRA-USD-6 | synthetic | filled | filled | filled | empty in the record | empty in the record | filled | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| EXTRA-EUR-8 | synthetic | filled | filled | filled | empty in the record | empty in the record | filled | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| EXTRA-INR-12 | synthetic | filled | filled | filled | empty in the record | empty in the record | filled | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| EXTRA-AED-5 | synthetic | filled | filled | filled | empty in the record | empty in the record | filled | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| EXTRA-GBP-7 | synthetic | filled | filled | filled | empty in the record | empty in the record | filled | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |

## PROFORMA_INVOICE_REPORT_FORMAT_2_PROFORMA_INVOICE_ALL_CHARGES

| Record | Kind | (a) | (b) | (c) | (d) |
|---|---|---:|---:|---:|---:|
| INV/26/00102 | real | 15 | 2 | 0 | 7 |
| INV/26/00093 | real | 13 | 4 | 0 | 7 |
| INV/26/00101 | real | 25 | 2 | 0 | 17 |
| INV/26/00100 | real | 15 | 2 | 0 | 7 |
| INV/26/00099 | real | 20 | 2 | 0 | 12 |
| INV/26/00097 | real | 13 | 4 | 0 | 7 |
| INV/26/00094 | real | 18 | 4 | 0 | 12 |
| INV/26/00095 | real | 13 | 4 | 0 | 7 |
| INV/26/00098 | real | 13 | 4 | 0 | 7 |
| INV/26/00089 | real | 13 | 4 | 0 | 7 |
| EXTRA-USD-6 | synthetic | 40 | 2 | 0 | 32 |
| EXTRA-EUR-8 | synthetic | 50 | 2 | 0 | 42 |
| EXTRA-INR-12 | synthetic | 70 | 2 | 0 | 62 |
| EXTRA-AED-5 | synthetic | 35 | 2 | 0 | 27 |
| EXTRA-GBP-7 | synthetic | 45 | 2 | 0 | 37 |

Named fields on this layout:

| Record | Kind | bill-to | shipper | consignee | vessel | voyage | container | HBL | quantity | rate | currency | per-line tax | amount in words | logo |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| INV/26/00102 | real | filled | filled | not on this layout | empty in the record | empty in the record | not on this layout | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| INV/26/00093 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | filled | filled | profile has a logo file |
| INV/26/00101 | real | filled | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| INV/26/00100 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| INV/26/00099 | real | filled | not on this layout | empty in the record | not on this layout | empty in the record | not on this layout | not on this layout | filled | filled | filled | empty in the record | filled | profile has a logo file |
| INV/26/00097 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | filled | filled | profile has a logo file |
| INV/26/00094 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | not on this layout | filled | profile has a logo file |
| INV/26/00095 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | not on this layout | filled | profile has a logo file |
| INV/26/00098 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | not on this layout | filled | profile has a logo file |
| INV/26/00089 | real | filled | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | filled | filled | filled | filled | filled | profile has a logo file |
| EXTRA-USD-6 | synthetic | filled | filled | not on this layout | empty in the record | empty in the record | not on this layout | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| EXTRA-EUR-8 | synthetic | filled | filled | not on this layout | empty in the record | empty in the record | not on this layout | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| EXTRA-INR-12 | synthetic | filled | filled | not on this layout | empty in the record | empty in the record | not on this layout | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| EXTRA-AED-5 | synthetic | filled | filled | not on this layout | empty in the record | empty in the record | not on this layout | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |
| EXTRA-GBP-7 | synthetic | filled | filled | not on this layout | empty in the record | empty in the record | not on this layout | empty in the record | filled | filled | filled | empty in the record | filled | profile has a logo file |

## PURCHASE_INVOICE_REPORT_FORMAT_1

| Record | Kind | (a) | (b) | (c) | (d) |
|---|---|---:|---:|---:|---:|
| INV/26/00102 | real | 1 | 20 | 0 | 17 |
| INV/26/00093 | real | 1 | 20 | 0 | 17 |
| INV/26/00101 | real | 1 | 20 | 0 | 19 |
| INV/26/00100 | real | 1 | 20 | 0 | 17 |
| INV/26/00099 | real | 9 | 12 | 0 | 18 |
| INV/26/00097 | real | 1 | 20 | 0 | 17 |
| INV/26/00094 | real | 1 | 20 | 0 | 18 |
| INV/26/00095 | real | 1 | 20 | 0 | 17 |
| INV/26/00098 | real | 1 | 20 | 0 | 17 |
| INV/26/00089 | real | 1 | 20 | 0 | 17 |
| EXTRA-USD-6 | synthetic | 1 | 20 | 0 | 22 |
| EXTRA-EUR-8 | synthetic | 1 | 20 | 0 | 24 |
| EXTRA-INR-12 | synthetic | 1 | 20 | 0 | 28 |
| EXTRA-AED-5 | synthetic | 1 | 20 | 0 | 21 |
| EXTRA-GBP-7 | synthetic | 1 | 20 | 0 | 23 |

Named fields on this layout:

| Record | Kind | bill-to | shipper | consignee | vessel | voyage | container | HBL | quantity | rate | currency | per-line tax | amount in words | logo |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| INV/26/00102 | real | not on this layout | not on this layout | not on this layout | empty in the record | empty in the record | not on this layout | empty in the record | not on this layout | not on this layout | not on this layout | empty in the record | filled | profile has a logo file |
| INV/26/00093 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | not on this layout | not on this layout | not on this layout | not drawn; SGST/CGST blocked | filled | profile has a logo file |
| INV/26/00101 | real | not on this layout | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | not on this layout | not on this layout | not on this layout | empty in the record | filled | profile has a logo file |
| INV/26/00100 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | not on this layout | not on this layout | not on this layout | empty in the record | filled | profile has a logo file |
| INV/26/00099 | real | not on this layout | not on this layout | empty in the record | not on this layout | empty in the record | not on this layout | filled | not on this layout | not on this layout | not on this layout | empty in the record | filled | profile has a logo file |
| INV/26/00097 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | not on this layout | not on this layout | not on this layout | not drawn; SGST/CGST blocked | filled | profile has a logo file |
| INV/26/00094 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | not on this layout | not on this layout | not on this layout | not drawn; SGST/CGST blocked | filled | profile has a logo file |
| INV/26/00095 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | not on this layout | not on this layout | not on this layout | not drawn; SGST/CGST blocked | filled | profile has a logo file |
| INV/26/00098 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | not on this layout | not on this layout | not on this layout | not drawn; SGST/CGST blocked | filled | profile has a logo file |
| INV/26/00089 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | not on this layout | not on this layout | not on this layout | not drawn; SGST/CGST blocked | filled | profile has a logo file |
| EXTRA-USD-6 | synthetic | not on this layout | not on this layout | not on this layout | empty in the record | empty in the record | not on this layout | empty in the record | not on this layout | not on this layout | not on this layout | empty in the record | filled | profile has a logo file |
| EXTRA-EUR-8 | synthetic | not on this layout | not on this layout | not on this layout | empty in the record | empty in the record | not on this layout | empty in the record | not on this layout | not on this layout | not on this layout | empty in the record | filled | profile has a logo file |
| EXTRA-INR-12 | synthetic | not on this layout | not on this layout | not on this layout | empty in the record | empty in the record | not on this layout | empty in the record | not on this layout | not on this layout | not on this layout | empty in the record | filled | profile has a logo file |
| EXTRA-AED-5 | synthetic | not on this layout | not on this layout | not on this layout | empty in the record | empty in the record | not on this layout | empty in the record | not on this layout | not on this layout | not on this layout | empty in the record | filled | profile has a logo file |
| EXTRA-GBP-7 | synthetic | not on this layout | not on this layout | not on this layout | empty in the record | empty in the record | not on this layout | empty in the record | not on this layout | not on this layout | not on this layout | empty in the record | filled | profile has a logo file |

## PURCHASE_INVOICE_REPORT_FORMAT_2

| Record | Kind | (a) | (b) | (c) | (d) |
|---|---|---:|---:|---:|---:|
| INV/26/00102 | real | 1 | 24 | 0 | 19 |
| INV/26/00093 | real | 1 | 24 | 0 | 19 |
| INV/26/00101 | real | 1 | 24 | 0 | 21 |
| INV/26/00100 | real | 5 | 20 | 0 | 19 |
| INV/26/00099 | real | 9 | 16 | 0 | 20 |
| INV/26/00097 | real | 1 | 24 | 0 | 19 |
| INV/26/00094 | real | 1 | 24 | 0 | 20 |
| INV/26/00095 | real | 1 | 24 | 0 | 19 |
| INV/26/00098 | real | 1 | 24 | 0 | 19 |
| INV/26/00089 | real | 1 | 24 | 0 | 19 |
| EXTRA-USD-6 | synthetic | 1 | 24 | 0 | 24 |
| EXTRA-EUR-8 | synthetic | 1 | 24 | 0 | 26 |
| EXTRA-INR-12 | synthetic | 1 | 24 | 0 | 30 |
| EXTRA-AED-5 | synthetic | 1 | 24 | 0 | 23 |
| EXTRA-GBP-7 | synthetic | 1 | 24 | 0 | 25 |

Named fields on this layout:

| Record | Kind | bill-to | shipper | consignee | vessel | voyage | container | HBL | quantity | rate | currency | per-line tax | amount in words | logo |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| INV/26/00102 | real | not on this layout | not on this layout | not on this layout | empty in the record | empty in the record | not on this layout | empty in the record | not on this layout | not on this layout | not on this layout | empty in the record | filled | profile has a logo file |
| INV/26/00093 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | not on this layout | not on this layout | not on this layout | not drawn; SGST/CGST blocked | filled | profile has a logo file |
| INV/26/00101 | real | not on this layout | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | not on this layout | not on this layout | not on this layout | empty in the record | filled | profile has a logo file |
| INV/26/00100 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | not on this layout | not on this layout | not on this layout | empty in the record | filled | profile has a logo file |
| INV/26/00099 | real | not on this layout | not on this layout | empty in the record | not on this layout | empty in the record | not on this layout | filled | not on this layout | not on this layout | not on this layout | empty in the record | filled | profile has a logo file |
| INV/26/00097 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | not on this layout | not on this layout | not on this layout | not drawn; SGST/CGST blocked | filled | profile has a logo file |
| INV/26/00094 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | not on this layout | not on this layout | not on this layout | not drawn; SGST/CGST blocked | filled | profile has a logo file |
| INV/26/00095 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | not on this layout | not on this layout | not on this layout | not drawn; SGST/CGST blocked | filled | profile has a logo file |
| INV/26/00098 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | not on this layout | not on this layout | not on this layout | not drawn; SGST/CGST blocked | filled | profile has a logo file |
| INV/26/00089 | real | not on this layout | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | empty in the record | not on this layout | not on this layout | not on this layout | not drawn; SGST/CGST blocked | filled | profile has a logo file |
| EXTRA-USD-6 | synthetic | not on this layout | not on this layout | not on this layout | empty in the record | empty in the record | not on this layout | empty in the record | not on this layout | not on this layout | not on this layout | empty in the record | filled | profile has a logo file |
| EXTRA-EUR-8 | synthetic | not on this layout | not on this layout | not on this layout | empty in the record | empty in the record | not on this layout | empty in the record | not on this layout | not on this layout | not on this layout | empty in the record | filled | profile has a logo file |
| EXTRA-INR-12 | synthetic | not on this layout | not on this layout | not on this layout | empty in the record | empty in the record | not on this layout | empty in the record | not on this layout | not on this layout | not on this layout | empty in the record | filled | profile has a logo file |
| EXTRA-AED-5 | synthetic | not on this layout | not on this layout | not on this layout | empty in the record | empty in the record | not on this layout | empty in the record | not on this layout | not on this layout | not on this layout | empty in the record | filled | profile has a logo file |
| EXTRA-GBP-7 | synthetic | not on this layout | not on this layout | not on this layout | empty in the record | empty in the record | not on this layout | empty in the record | not on this layout | not on this layout | not on this layout | empty in the record | filled | profile has a logo file |

