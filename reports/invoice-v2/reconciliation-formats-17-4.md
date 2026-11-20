# Money reconciliation for Formats 17 and 4

Nothing is accepted.

The 10 downloaded invoices do not include a discount, a rounding amount, or a three-line invoice that also has tax. `INV/26/00101` has three lines and no tax. The other 15 records are synthetic anonymized copies, marked synthetic below.

Records compared: 25. Subtotal, every line amount, and the total match on all 25 for both formats.

The only disagreement is the tax figure: 50 sheets (every record, both formats). Classic always prints a VAT row from `tax_total`, and prints 0.00 when `tax_total` is null. Formats 17 and 4 have no tax row, so that figure is not on the v2 PDF. On the 10 real invoices `tax_total` is null, so the classic VAT row is 0.00. Where a line has tax, that tax is inside the line amount, and those line amounts match.

Discount and rounding are on neither PDF (12 sheets). Classic hardcodes Discount to 0.00 and has no rounding row. Formats 17 and 4 have no discount or rounding row. No row was added.

| Code | Record | Kind | One PDF has it |
|---|---|---|---|
| INVOICE_REPORT_FORMAT_17_INVOICE_JASPER | INV/26/00102 | real | tax 0.00 classic=true v2=false |
| INVOICE_REPORT_FORMAT_17_INVOICE_JASPER | INV/26/00093 | real | tax 0.00 classic=true v2=false |
| INVOICE_REPORT_FORMAT_17_INVOICE_JASPER | INV/26/00101 | real | tax 0.00 classic=true v2=false |
| INVOICE_REPORT_FORMAT_17_INVOICE_JASPER | INV/26/00100 | real | tax 0.00 classic=true v2=false |
| INVOICE_REPORT_FORMAT_17_INVOICE_JASPER | INV/26/00099 | real | tax 0.00 classic=true v2=false |
| INVOICE_REPORT_FORMAT_17_INVOICE_JASPER | INV/26/00097 | real | tax 0.00 classic=true v2=false |
| INVOICE_REPORT_FORMAT_17_INVOICE_JASPER | INV/26/00094 | real | tax 0.00 classic=true v2=false |
| INVOICE_REPORT_FORMAT_17_INVOICE_JASPER | INV/26/00095 | real | tax 0.00 classic=true v2=false |
| INVOICE_REPORT_FORMAT_17_INVOICE_JASPER | INV/26/00098 | real | tax 0.00 classic=true v2=false |
| INVOICE_REPORT_FORMAT_17_INVOICE_JASPER | INV/26/00089 | real | tax 0.00 classic=true v2=false |
| INVOICE_REPORT_FORMAT_17_INVOICE_JASPER | SYN-01 | synthetic | tax 0.00 classic=true v2=false |
| INVOICE_REPORT_FORMAT_17_INVOICE_JASPER | SYN-02 | synthetic | tax 16.20 classic=true v2=false |
| INVOICE_REPORT_FORMAT_17_INVOICE_JASPER | SYN-03 | synthetic | tax 490.50 classic=true v2=false |
| INVOICE_REPORT_FORMAT_17_INVOICE_JASPER | SYN-04 | synthetic | tax 15.00 classic=true v2=false |
| INVOICE_REPORT_FORMAT_17_INVOICE_JASPER | SYN-05 | synthetic | tax 0.00 classic=true v2=false |
| INVOICE_REPORT_FORMAT_17_INVOICE_JASPER | SYN-06 | synthetic | tax 15.50 classic=true v2=false |
| INVOICE_REPORT_FORMAT_17_INVOICE_JASPER | SYN-07 | synthetic | tax 6.65 classic=true v2=false |
| INVOICE_REPORT_FORMAT_17_INVOICE_JASPER | SYN-08 | synthetic | tax 0.00 classic=true v2=false |
| INVOICE_REPORT_FORMAT_17_INVOICE_JASPER | SYN-09 | synthetic | tax 7.10 classic=true v2=false |
| INVOICE_REPORT_FORMAT_17_INVOICE_JASPER | SYN-10 | synthetic | tax 1404.00 classic=true v2=false |
| INVOICE_REPORT_FORMAT_17_INVOICE_JASPER | SYN-11 | synthetic | tax 29.75 classic=true v2=false |
| INVOICE_REPORT_FORMAT_17_INVOICE_JASPER | SYN-12 | synthetic | tax 28.00 classic=true v2=false |
| INVOICE_REPORT_FORMAT_17_INVOICE_JASPER | SYN-13 | synthetic | tax 0.00 classic=true v2=false |
| INVOICE_REPORT_FORMAT_17_INVOICE_JASPER | SYN-14 | synthetic | tax 170.50 classic=true v2=false |
| INVOICE_REPORT_FORMAT_17_INVOICE_JASPER | SYN-15 | synthetic | tax 384.00 classic=true v2=false |
| INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE | INV/26/00102 | real | tax 0.00 classic=true v2=false |
| INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE | INV/26/00093 | real | tax 0.00 classic=true v2=false |
| INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE | INV/26/00101 | real | tax 0.00 classic=true v2=false |
| INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE | INV/26/00100 | real | tax 0.00 classic=true v2=false |
| INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE | INV/26/00099 | real | tax 0.00 classic=true v2=false |
| INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE | INV/26/00097 | real | tax 0.00 classic=true v2=false |
| INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE | INV/26/00094 | real | tax 0.00 classic=true v2=false |
| INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE | INV/26/00095 | real | tax 0.00 classic=true v2=false |
| INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE | INV/26/00098 | real | tax 0.00 classic=true v2=false |
| INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE | INV/26/00089 | real | tax 0.00 classic=true v2=false |
| INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE | SYN-01 | synthetic | tax 0.00 classic=true v2=false |
| INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE | SYN-02 | synthetic | tax 16.20 classic=true v2=false |
| INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE | SYN-03 | synthetic | tax 490.50 classic=true v2=false |
| INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE | SYN-04 | synthetic | tax 15.00 classic=true v2=false |
| INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE | SYN-05 | synthetic | tax 0.00 classic=true v2=false |
| INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE | SYN-06 | synthetic | tax 15.50 classic=true v2=false |
| INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE | SYN-07 | synthetic | tax 6.65 classic=true v2=false |
| INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE | SYN-08 | synthetic | tax 0.00 classic=true v2=false |
| INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE | SYN-09 | synthetic | tax 7.10 classic=true v2=false |
| INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE | SYN-10 | synthetic | tax 1404.00 classic=true v2=false |
| INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE | SYN-11 | synthetic | tax 29.75 classic=true v2=false |
| INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE | SYN-12 | synthetic | tax 28.00 classic=true v2=false |
| INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE | SYN-13 | synthetic | tax 0.00 classic=true v2=false |
| INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE | SYN-14 | synthetic | tax 170.50 classic=true v2=false |
| INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE | SYN-15 | synthetic | tax 384.00 classic=true v2=false |

These amounts are on neither PDF. The classic discount is hardcoded to 0, and neither layout prints a rounding row.

| Code | Record | Kind | On neither PDF |
|---|---|---|---|
| INVOICE_REPORT_FORMAT_17_INVOICE_JASPER | SYN-04 | synthetic | discount 40.00 |
| INVOICE_REPORT_FORMAT_17_INVOICE_JASPER | SYN-05 | synthetic | rounding 0.04 |
| INVOICE_REPORT_FORMAT_17_INVOICE_JASPER | SYN-06 | synthetic | discount 15.00 |
| INVOICE_REPORT_FORMAT_17_INVOICE_JASPER | SYN-09 | synthetic | rounding -0.03 |
| INVOICE_REPORT_FORMAT_17_INVOICE_JASPER | SYN-12 | synthetic | discount 20.00 |
| INVOICE_REPORT_FORMAT_17_INVOICE_JASPER | SYN-15 | synthetic | discount 100.00; rounding 0.05 |
| INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE | SYN-04 | synthetic | discount 40.00 |
| INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE | SYN-05 | synthetic | rounding 0.04 |
| INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE | SYN-06 | synthetic | discount 15.00 |
| INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE | SYN-09 | synthetic | rounding -0.03 |
| INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE | SYN-12 | synthetic | discount 20.00 |
| INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE | SYN-15 | synthetic | discount 100.00; rounding 0.05 |

