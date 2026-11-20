# Release pack: INVOICE_REPORT_FORMAT_15_INVOICE_FCY

Nothing here is accepted. No sign-off was run.

## Criteria

| Criterion | Result |
|---|---|
| Money fields reconcile with the classic PDF on 10 real invoices and 15 synthetic records | fail |
| Party and shipment fields are bound, or listed in docs/reports/backend-requirements-invoice.md with table and column | pass |
| Leak check is clean | pass (0 leaks, 80 suppressed) |
| Logo draws from the organization logo fetch. No bytes leaves the slot empty | pass |
| Lines paginate | fail |
| Blank ratio on the 10 real invoices is reported per field | pass |
| Review sheet is in git | pass |

## Six layers

From `reports/full-run-track-a-last.csv`. The reference for this code is one page.

| Layer | Result |
|---|---|
| Page | pass |
| Static geometry | pass |
| Static text | pass |
| Dynamic text | pass |
| Raster | pass |
| Pagination | single-page |

Page, geometry, static text, dynamic text, and raster pass. Pagination is single-page, which is not a failure: the pinned reference has one page, so the multi-page check was not exercised.

Raster ratios: non-text 0, text ink 0.0568, masked fraction 0.1127. Failure class: none.

## Money

A row fails when an amount is on one PDF and not the other. These layouts print a total and no tax row. Classic always prints a VAT row from `tax_total`, and 0.00 when that key is absent. Classic hardcodes Discount to 0.

| Record | Kind | Result |
|---|---|---|
| INV/26/00102 | real | tax 0.00 classic=true v2=false |
| INV/26/00093 | real | tax 0.00 classic=true v2=false |
| INV/26/00101 | real | tax 0.00 classic=true v2=false; line 1 1560.00 classic=true v2=false; line 2 55.00 classic=true v2=false; line 3 216.00 classic=true v2=false |
| INV/26/00100 | real | tax 0.00 classic=true v2=false |
| INV/26/00099 | real | tax 0.00 classic=true v2=false; line 2 2.00 classic=true v2=false |
| INV/26/00097 | real | tax 0.00 classic=true v2=false |
| INV/26/00094 | real | subtotal 152567.00 classic=true v2=false; tax 0.00 classic=true v2=false; line 1 159600.00 classic=true v2=false; line 2 595.35 classic=true v2=false |
| INV/26/00095 | real | tax 0.00 classic=true v2=false |
| INV/26/00098 | real | tax 0.00 classic=true v2=false |
| INV/26/00089 | real | tax 0.00 classic=true v2=false |
| SYN-01 | synthetic | tax 0.00 classic=true v2=false; line 2 80.00 classic=true v2=false; line 3 15.00 classic=true v2=false |
| SYN-02 | synthetic | subtotal 162.00 classic=true v2=false; tax 16.20 classic=true v2=false; line 1 88.00 classic=true v2=false; line 2 66.00 classic=true v2=false; line 3 13.20 classic=true v2=false; line 4 11.00 classic=true v2=false |
| SYN-03 | synthetic | subtotal 2725.00 classic=true v2=false; tax 490.50 classic=true v2=false; line 1 1180.00 classic=true v2=false; line 2 1180.00 classic=true v2=false; line 3 295.00 classic=true v2=false; line 4 472.00 classic=true v2=false; line 5 88.50 classic=true v2=false |
| SYN-04 | synthetic | subtotal 300.00 classic=true v2=false; tax 15.00 classic=true v2=false; line 1 210.00 classic=true v2=false; line 2 52.50 classic=true v2=false; line 3 52.50 classic=true v2=false |
| SYN-05 | synthetic | subtotal 73.00 classic=true v2=false; tax 0.00 classic=true v2=false; line 2 18.00 classic=true v2=false; line 3 14.00 classic=true v2=false; line 4 4.00 classic=true v2=false; line 5 6.00 classic=true v2=false; line 6 1.00 classic=true v2=false |
| SYN-06 | synthetic | subtotal 155.00 classic=true v2=false; tax 15.50 classic=true v2=false; line 1 132.00 classic=true v2=false; line 2 27.50 classic=true v2=false; line 3 11.00 classic=true v2=false |
| SYN-07 | synthetic | subtotal 133.00 classic=true v2=false; tax 6.65 classic=true v2=false; line 1 10.50 classic=true v2=false; line 2 21.00 classic=true v2=false; line 3 31.50 classic=true v2=false; line 4 42.00 classic=true v2=false; line 5 15.75 classic=true v2=false; line 6 8.40 classic=true v2=false; line 7 6.30 classic=true v2=false; line 8 4.20 classic=true v2=false |
| SYN-08 | synthetic | tax 0.00 classic=true v2=false; line 1 1000.00 classic=true v2=false; line 2 400.00 classic=true v2=false; line 3 90.00 classic=true v2=false |
| SYN-09 | synthetic | subtotal 71.00 classic=true v2=false; tax 7.10 classic=true v2=false; line 1 44.00 classic=true v2=false; line 2 24.20 classic=true v2=false; line 3 9.90 classic=true v2=false |
| SYN-10 | synthetic | subtotal 7800.00 classic=true v2=false; tax 1404.00 classic=true v2=false; line 1 118.00 classic=true v2=false; line 2 236.00 classic=true v2=false; line 3 354.00 classic=true v2=false; line 4 472.00 classic=true v2=false; line 5 590.00 classic=true v2=false; line 6 708.00 classic=true v2=false; line 7 826.00 classic=true v2=false; line 8 944.00 classic=true v2=false; line 9 1062.00 classic=true v2=false; line 10 1180.00 classic=true v2=false; line 11 1298.00 classic=true v2=false; line 12 1416.00 classic=true v2=false |
| SYN-11 | synthetic | subtotal 595.00 classic=true v2=false; tax 29.75 classic=true v2=false; line 1 525.00 classic=true v2=false; line 2 84.00 classic=true v2=false; line 3 15.75 classic=true v2=false |
| SYN-12 | synthetic | subtotal 140.00 classic=true v2=false; tax 28.00 classic=true v2=false; line 1 108.00 classic=true v2=false; line 2 36.00 classic=true v2=false; line 3 14.40 classic=true v2=false; line 4 9.60 classic=true v2=false |
| SYN-13 | synthetic | tax 0.00 classic=true v2=false; line 2 30.00 classic=true v2=false; line 3 5.00 classic=true v2=false |
| SYN-14 | synthetic | subtotal 3410.00 classic=true v2=false; tax 170.50 classic=true v2=false; line 1 3150.00 classic=true v2=false; line 2 262.50 classic=true v2=false; line 3 168.00 classic=true v2=false |
| SYN-15 | synthetic | subtotal 2560.00 classic=true v2=false; tax 384.00 classic=true v2=false; line 1 2300.00 classic=true v2=false; line 2 575.00 classic=true v2=false; line 3 69.00 classic=true v2=false |

## Blank ratio

Counts are the 10 real invoices. Blank ratio is bound-but-empty divided by 10.

| Field | Filled | Empty in the record | Not on this layout | Blank ratio |
|---|---:|---:|---:|---:|
| shipper | 3 | 7 | 0 | 0.70 |
| consignee | 0 | 9 | 1 | 0.90 |
| vessel | 0 | 9 | 1 | 0.90 |
| voyage | 0 | 9 | 1 | 0.90 |
| HBL | 2 | 8 | 0 | 0.80 |
| container | 2 | 8 | 0 | 0.80 |
| bill-to | 2 | 0 | 8 | 0.00 |
| quantity | 0 | 0 | 10 | 0.00 |
| rate | 10 | 0 | 0 | 0.00 |
| currency | 0 | 0 | 10 | 0.00 |
| subtotal | 9 | 0 | 1 | 0.00 |
| tax | 10 | 0 | 0 | 0.00 |
| total | 10 | 0 | 0 | 0.00 |
| amount in words | 10 | 0 | 0 | 0.00 |

## What a customer sees

### INV/26/00102

No tax. INV/26/00102 has header tax_amount 0 and one line with tax 0.

| Empty box | Why | Count |
|---|---|---:|
| FREIGHT CHARGE | empty in the record | 5 |
| SEAL FEE | empty in the record | 4 |
| 4G LOGISTICS INDIA PVT LTD | no source | 3 |
| DUE DATE | empty in the record | 2 |
| Sale invoice | no source | 1 |
| 28-JAN-19 | no source | 1 |
| 125 PACKAGES | no source | 1 |
| CUSTOMS BROKER | no source | 1 |
| 20.000 CBM | no source | 1 |
| 1 | no source | 1 |
| Total Amt (USD) | no source | 1 |
| SHIPMENT | empty in the record | 1 |

### INV/26/00094

Has tax. INV/26/00094 has header tax_amount 7628.35 and line tax 7600 and 28.35. tax_total is absent.

| Empty box | Why | Count |
|---|---|---:|
| FREIGHT CHARGE | empty in the record | 5 |
| ORIGIN | empty in the record | 4 |
| SEAL FEE | empty in the record | 4 |
| BILL OF LADING | empty in the record | 4 |
| 4G LOGISTICS INDIA PVT LTD | no source | 3 |
| SHIPPERS REFERENCE | empty in the record | 3 |
| oening | no source | 1 |
| OCEAN-FRT | no source | 1 |
| 28-JAN-19 | no source | 1 |
| 125 PACKAGES | no source | 1 |
| CUSTOMS BROKER | no source | 1 |
| 20.000 CBM | no source | 1 |
| CONTAINERS | empty in the record | 1 |
| GOODS DESCRIPTION | empty in the record | 1 |
| 1 | no source | 1 |
| Total Amt (USD) | no source | 1 |
| SHIPPER | empty in the record | 1 |
| SHIPMENT | empty in the record | 1 |
| JOB NUMBER | empty in the record | 1 |
| ETD | empty in the record | 1 |
| GROSS WEIGHT | empty in the record | 1 |


## Logo and pages

The header image is a letterhead band, not a separate logo box. On a live invoice the organization logo is drawn inside that band, at the left, in its own proportions, from `fetchOrganizationLogoBytes`. No bytes leaves the band empty. The sample letterhead art is not copied.

A 40-line invoice produced 1 page(s). Missing lines: Charge line 01, Charge line 02, Charge line 03, Charge line 04, Charge line 05, Charge line 06, Charge line 07, Charge line 08, Charge line 09, Charge line 10, Charge line 11, Charge line 12, Charge line 13, Charge line 14, Charge line 15, Charge line 16, Charge line 17, Charge line 18, Charge line 19, Charge line 20, Charge line 21, Charge line 22, Charge line 23, Charge line 24, Charge line 25, Charge line 26, Charge line 27, Charge line 28, Charge line 29, Charge line 30, Charge line 31, Charge line 32, Charge line 33, Charge line 34, Charge line 35, Charge line 36, Charge line 37, Charge line 38, Charge line 39, Charge line 40.

## Currency and exchange rate

Counts are dynamic spans on the 10 real invoices whose nearest label matches currency, exchange, FCY, amount in USD, amount (AED), or total amt (USD). `invoice.exchange_rate` is on every downloaded invoice (the value is 1) and is not a binding in `invoice-bindings.mjs`.

| Label | Filled spans | Empty spans | Sample filled value |
|---|---:|---:|---|
| (no matching span) | 0 | 0 | — |

The layout's money labels are static: `Total Amt (USD)` and `USD`. The sentence `6. Exchange rate applied is subject to upward revisions.` is static text, not a field. No dynamic span next to those labels was filled, so neither the USD total nor `invoice.exchange_rate` is bound on this code. `invoice.exchange_rate` is 1 on every real invoice and is not a path in `invoice-bindings.mjs`.

`reports/invoice-v2-applicability.json` now marks this code `currency: USD`. By currency it is appropriate for INV/26/00101 and INV/26/00100 only. INV/26/00100 matches on line amount and total, and disagrees only on the classic VAT row of 0.00. INV/26/00101's three line amounts are not on this PDF. The other eight real invoices are AED or PKR.

This code also does not paginate. The 40-line invoice stayed on one page and none of the charge descriptions were drawn. The spec has no repeating charge band the row layout could copy.

## Review sheet

`reports/review/commercial/INVOICE_REPORT_FORMAT_15_INVOICE_FCY.png` is in git.

## Generate PDF fallback

Generate PDF calls `generateInvoicePdfChoice`. When `VITE_REPORTS_ENGINE=v2` and the company or organization payload carries a non-classic `defaultPdfStyle`, that code is built first. A thrown error returns the classic PDF and the notice: "Showing the classic invoice. The selected format could not be built."

The unit test `Generate PDF falls back to classic and shows a notice when the selected style throws` forces that error for this path. A classic style does not call v2.

