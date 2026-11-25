# Backend requirements: Format 1 Tax Invoice India

Format 1 prints Indian GST split columns (SAC, taxable / non-taxable, SGST %, SGST, CGST %, CGST, IGST/UGST %, IGST/UGST, total INR). The frontend must not invent those figures from a single `tax_total`.

Nothing here is accepted. Classic Generate PDF is unchanged.

## What Format 1 needs per line

| Field | Purpose on Format 1 |
|---|---|
| `sac_code` (or HSN/SAC) | SAC Code column |
| `quantity` | Qty |
| `unit_price` | Amount / Qty |
| `currency_code` (per line, optional) | Currency when a line is not in invoice currency |
| `exchange_rate` (per line, optional) | Ex. Rate |
| `fcy_amount` (optional) | FCY Amount; otherwise `quantity * unit_price` in line currency |
| `taxable_amount` | Taxable Amount |
| `non_taxable_amount` | Non Taxable Amount |
| `is_taxable` / non-taxable flag | Chooses taxable vs non-taxable column |
| `sgst_rate`, `sgst_amount` | SGST % and SGST |
| `cgst_rate`, `cgst_amount` | CGST % and CGST |
| `igst_rate`, `igst_amount` (or UGST) | I/UGST % and amount |
| `line_total` | Total Amount (INR) |
| `tax_code` / tax rate id | Tax summary labels such as GST18-SGST9% |

## What Format 1 needs on the invoice / parties

| Field | Purpose |
|---|---|
| Supplier GSTIN | Organization tax identity (profile) |
| Supplier PAN | Organization tax identity (profile) |
| Supplier state code | Place-of-supply / GST split rules |
| Customer GSTIN | Bill To GSTIN No. |
| Customer state code | Place of supply |
| Place of supply | Determines CGST+SGST vs IGST |
| Header non-taxable total | Totals row Non Taxable Amount |
| Header SGST / CGST / IGST totals | Tax Amount (INR) summary box |

## What exists on the current invoice API (frontend types / live GET bodies)

| Need | Present today? | Notes |
|---|---|---|
| Line `quantity`, `unit_price`, `tax_amount`, `line_total` | yes | |
| Line `is_taxable`, `tax_rate`, `tax_percent` | yes on live bodies | Not a GST split |
| Line `sac_code` | no | |
| Line `sgst_*` / `cgst_*` / `igst_*` | no | |
| Line per-line `currency_code` / `exchange_rate` | no | Header has `currency_code`, `exchange_rate` |
| Header `tax_total` | often absent | Classic VAT uses `tax_total ?? 0` |
| Header `tax_amount` | yes on some live bodies | Not copied into `tax_total` by `normalizeInvoice` |
| Header `non_taxable_amount` | no | |
| Header place of supply / state codes | no | |
| Party `vat_number`, `phone`, `address` | yes | Used as customer GSTIN / phone / address |
| Organization `vat_number` | yes | Treated as GSTIN when present |
| Organization PAN | no dedicated field | `cr_number` exists; not a PAN |
| Organization default bank account | yes via `/organization/bank-accounts` | `bank_name`, `account_name`, `account_number`, `iban`, `swift_code` |
| Created-by email / name on invoice | id only on many bodies | Email/name needed for "Created By" / User |

## Frontend behaviour until the API grows

- Format 1 `taxMode` is `split`: explicit SGST/CGST/IGST fields paint when present.
- Missing split fields stay blank. The binder does not allocate `tax_amount` or `tax_total` across SGST/CGST/IGST.
- Catalogue suitability still treats missing tax print as a visibility note where arithmetic otherwise holds.
