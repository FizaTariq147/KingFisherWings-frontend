# Release pack: INVOICE_REPORT_FORMAT_10_STANDARD_INVOICE

Nothing here is accepted. No sign-off was run.

## Criteria

| Criterion | Result |
|---|---|
| Money fields reconcile with the classic PDF on 10 real invoices and 15 synthetic records | fail |
| Party and shipment fields are bound, or listed in docs/reports/backend-requirements-invoice.md with table and column | pass |
| Leak check is clean | pass (0 leaks, 55 suppressed) |
| Logo draws from the organization logo fetch. No bytes leaves the slot empty | pass |
| Lines paginate | pass |
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

Raster ratios: non-text 0, text ink 0.0703, masked fraction 0.095. Failure class: none.

## Money

A row fails when an amount is on one PDF and not the other. These layouts print a total and no tax row. Classic always prints a VAT row from `tax_total`, and 0.00 when that key is absent. Classic hardcodes Discount to 0.

| Record | Kind | Result |
|---|---|---|
| INV/26/00102 | real | tax 0.00 classic=true v2=false |
| INV/26/00093 | real | tax 0.00 classic=true v2=false |
| INV/26/00101 | real | tax 0.00 classic=true v2=false |
| INV/26/00100 | real | tax 0.00 classic=true v2=false |
| INV/26/00099 | real | tax 0.00 classic=true v2=false |
| INV/26/00097 | real | tax 0.00 classic=true v2=false |
| INV/26/00094 | real | subtotal 152567.00 classic=true v2=false; tax 0.00 classic=true v2=false |
| INV/26/00095 | real | tax 0.00 classic=true v2=false |
| INV/26/00098 | real | subtotal 1520000.00 classic=true v2=false; tax 0.00 classic=true v2=false |
| INV/26/00089 | real | tax 0.00 classic=true v2=false |
| SYN-01 | synthetic | tax 0.00 classic=true v2=false |
| SYN-02 | synthetic | subtotal 162.00 classic=true v2=false; tax 16.20 classic=true v2=false |
| SYN-03 | synthetic | subtotal 2725.00 classic=true v2=false; tax 490.50 classic=true v2=false |
| SYN-04 | synthetic | subtotal 300.00 classic=true v2=false; tax 15.00 classic=true v2=false |
| SYN-05 | synthetic | subtotal 73.00 classic=true v2=false; tax 0.00 classic=true v2=false |
| SYN-06 | synthetic | subtotal 155.00 classic=true v2=false; tax 15.50 classic=true v2=false |
| SYN-07 | synthetic | subtotal 133.00 classic=true v2=false; tax 6.65 classic=true v2=false |
| SYN-08 | synthetic | tax 0.00 classic=true v2=false |
| SYN-09 | synthetic | subtotal 71.00 classic=true v2=false; tax 7.10 classic=true v2=false |
| SYN-10 | synthetic | subtotal 7800.00 classic=true v2=false; tax 1404.00 classic=true v2=false |
| SYN-11 | synthetic | subtotal 595.00 classic=true v2=false; tax 29.75 classic=true v2=false |
| SYN-12 | synthetic | subtotal 140.00 classic=true v2=false; tax 28.00 classic=true v2=false |
| SYN-13 | synthetic | tax 0.00 classic=true v2=false |
| SYN-14 | synthetic | subtotal 3410.00 classic=true v2=false; tax 170.50 classic=true v2=false |
| SYN-15 | synthetic | subtotal 2560.00 classic=true v2=false; tax 384.00 classic=true v2=false |

## Blank ratio

Counts are the 10 real invoices. Blank ratio is bound-but-empty divided by 10.

| Field | Filled | Empty in the record | Not on this layout | Blank ratio |
|---|---:|---:|---:|---:|
| shipper | 3 | 7 | 0 | 0.70 |
| consignee | 1 | 9 | 0 | 0.90 |
| vessel | 0 | 9 | 1 | 0.90 |
| voyage | 0 | 9 | 1 | 0.90 |
| HBL | 2 | 8 | 0 | 0.80 |
| container | 0 | 8 | 2 | 0.80 |
| bill-to | 2 | 0 | 8 | 0.00 |
| quantity | 10 | 0 | 0 | 0.00 |
| rate | 10 | 0 | 0 | 0.00 |
| currency | 10 | 0 | 0 | 0.00 |
| subtotal | 9 | 0 | 1 | 0.00 |
| tax | 10 | 0 | 0 | 0.00 |
| total | 10 | 0 | 0 | 0.00 |
| amount in words | 10 | 0 | 0 | 0.00 |

## What a customer sees

### INV/26/00102

No tax. INV/26/00102 has header tax_amount 0 and one line with tax 0.

| Empty box | Why | Count |
|---|---|---:|
| Department | empty in the record | 5 |
| Shipment No. | empty in the record | 2 |
| Terms and conditions | no source | 2 |
| AED | no source | 1 |
| ACCOUNT | no source | 1 |
| BUR DUBAI, | no source | 1 |
| DUBAI UAE | no source | 1 |
| Place of Receipt | empty in the record | 1 |
| Payment shall be made for full amount on or prior to due date, free of charges,  | empty in the record | 1 |
| Telex Released issued in USA: Please note that a local service charge of $50 app | empty in the record | 1 |

### INV/26/00094

Has tax. INV/26/00094 has header tax_amount 7628.35 and line tax 7600 and 28.35. tax_total is absent.

| Empty box | Why | Count |
|---|---|---:|
| MAWB/MBL No. | empty in the record | 6 |
| ETD | empty in the record | 5 |
| Department | empty in the record | 5 |
| Shipper | empty in the record | 5 |
| Consignee | empty in the record | 5 |
| ETA | empty in the record | 5 |
| AED | no source | 2 |
| Shipment No. | empty in the record | 2 |
| Job No. | empty in the record | 2 |
| HAWB/HBL No. | empty in the record | 2 |
| Terms and conditions | no source | 2 |
| ACCOUNT | no source | 1 |
| BUR DUBAI, | no source | 1 |
| DUBAI UAE | no source | 1 |
| Place of Receipt | empty in the record | 1 |
| Telex Released issued in USA: Please note that a local service charge of $50 app | empty in the record | 1 |


## Logo and pages

The header image is a letterhead band, not a separate logo box. On a live invoice the organization logo is drawn inside that band, at the left, in its own proportions, from `fetchOrganizationLogoBytes`. No bytes leaves the band empty. The sample letterhead art is not copied.

A 40-line invoice produced 6 page(s). Every charge line is present.

## Currency and exchange rate

Counts are dynamic spans on the 10 real invoices whose nearest label matches currency, exchange, FCY, amount in USD, amount (AED), or total amt (USD). `invoice.exchange_rate` is on every downloaded invoice (the value is 1) and is not a binding in `invoice-bindings.mjs`.

| Label | Filled spans | Empty spans | Sample filled value |
|---|---:|---:|---|
| (no matching span) | 0 | 0 | — |

## Review sheet

`reports/review/commercial/INVOICE_REPORT_FORMAT_10_STANDARD_INVOICE.png` is in git.

## Generate PDF fallback

Generate PDF calls `generateInvoicePdfChoice`. When `VITE_REPORTS_ENGINE=v2` and the company or organization payload carries a non-classic `defaultPdfStyle`, that code is built first. A thrown error returns the classic PDF and the notice: "Showing the classic invoice. The selected format could not be built."

The unit test `Generate PDF falls back to classic and shows a notice when the selected style throws` forces that error for this path. A classic style does not call v2.

