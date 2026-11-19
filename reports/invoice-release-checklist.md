# Invoice family release checklist

Nothing is accepted. The catalogue badge stays "approximate, not final".

## Codes

The registry has 205 codes whose context includes `invoice`. 179 have no spec in this repo. The 26 with a spec are below. Every one is unaccepted.

- INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA
- INVOICE_REPORT_FORMAT_2_TAX_INVOICE_INDIA
- INVOICE_REPORT_FORMAT_3_SUMMARY_INVOICE
- INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE
- INVOICE_REPORT_FORMAT_5_TAX_INVOICE_INDIA
- INVOICE_REPORT_FORMAT_6_SIMPLE_INVOICE_INDIA
- INVOICE_REPORT_FORMAT_7_SIMPLE_INVOICE
- INVOICE_REPORT_FORMAT_8_STANDARD_INVOICE_ARABIC
- INVOICE_REPORT_FORMAT_9_STANDARD_INVOICE_USA
- INVOICE_REPORT_FORMAT_10_STANDARD_INVOICE
- INVOICE_REPORT_FORMAT_11_STANDARD_INVOICE_LAND
- INVOICE_REPORT_FORMAT_12_STANDARD_INVOICE_PREPRINTED
- INVOICE_REPORT_FORMAT_13_STANDARD_INVOICE_USA
- INVOICE_REPORT_FORMAT_14_INVOICE
- INVOICE_REPORT_FORMAT_15_INVOICE_FCY
- INVOICE_REPORT_FORMAT_16_STANDARD_TAX_INVOICE_PREPRINTED
- INVOICE_REPORT_FORMAT_17_INVOICE_JASPER
- INVOICE_REPORT_FORMAT_18_LAND_FREIGHT_TRANSPORTATION_INVOICE
- INVOICE_REPORT_FORMAT_19_DEBIT_NOTE_VIETNAM
- INVOICE_REPORT_FORMAT_20_TAX_INVOICE_INDIA
- INVOICE_REPORT_FORMAT_21_WAREHOUSE_INVOICE
- PROFORMA_INVOICE_ALL_CHARGES_REPORT_FORMAT
- PROFORMA_INVOICE_REPORT_FORMAT_1_PROFORMA_INVOICE_ALL_CHARGES
- PROFORMA_INVOICE_REPORT_FORMAT_2_PROFORMA_INVOICE_ALL_CHARGES
- PURCHASE_INVOICE_REPORT_FORMAT_1
- PURCHASE_INVOICE_REPORT_FORMAT_2

`INVOICE_REPORT_FORMAT_19_DEBIT_NOTE_VIETNAM` is a catalogue layout. The debit-note screen does not call v2. Credit notes and debit notes stay on `generateInvoicePdf`.

## Blocking gaps

- 883 dynamic spans have no dictionary binding (`reports/invoice-unresolved.csv`).
- Notify party and net weight have no source (`docs/reports/backend-requirements-invoice.md`).
- Charge lines on the record do not land in a spec row. Format 1 has 0 description slots, so a 12-line invoice draws none of those lines.
- There is no stored `defaultPdfStyle` and no stored `reports.engine`. The browser flag `VITE_REPORTS_ENGINE` defaults to `legacy`.
- The spec PDF is drawn by `tools/reports/render-spec.mjs`. The browser does not host that renderer. With the flag set to `v2`, Reports and Formats try it, then show the current layout and the notice "Showing the classic invoice. The selected format could not be built."

## Ten records

The app has no invoice API in this workspace, so these are invoice-shaped records, not a live tenant extract. Organization text is Northwind Logistics. A text extract of sample 1 contains no Fresa name, URL, or "powered by". Output is `reports/output/invoice-v2/` (not a stored customer PDF). Summary: `reports/invoice-v2-samples.json`.

| Record | Pages | Warnings |
|---|---:|---|
| INV-LONG-1 | 1 | Text clipped after wrap and shrink to 70%. The long party name has no description slot. |
| INV-LINES-2 | 1 | 12 charge lines have no row. |
| INV-USD-3 | 1 | 1 charge line has no row. |
| INV-EUR-4 | 1 | 2 charge lines have no row. |
| INV-EMPTY-5 | 1 | None. Empty amounts stay blank. |
| INV-ADDR-6 | 1 | Text clipped after wrap and shrink. |
| INV-BOX-7 | 1 | Two numbers clipped after shrink. 1 charge line has no row. |
| INV-ZERO-8 | 1 | 1 charge line has no row. |
| INV-MULTI-9 | 1 | 3 charge lines have no row. |
| INV-NOJOB-10 | 1 | 1 charge line has no row. |

No page grew past the spec. The clip is the overflow crop: the field box, after wrap (text) or shrink to 70% (text and numbers).

## Review

1. Open `reports/review/commercial/` for the invoice code you care about. The sheet is reference, output, diff.
2. Read that code's lines in `reports/exceptions.md`. Do not treat a line as signed until you add the sign-off word yourself.
3. Confirm the unresolved spans in `reports/invoice-unresolved.csv` for that code.
4. `npm run report:signoff` stays unused until you decide.

## Set an invoice v2 code as the company default

There is no screen for this. The frontend has nowhere to store it.

1. Add a backend column for the company and the document type. The table and column are blank in `docs/reports/backend-requirements-invoice.md`.
2. Return that value on the company payload as `defaultPdfStyle`. The reader already treats a missing value as `classic` and does not invent a default other than that.
3. Set `VITE_REPORTS_ENGINE=v2` for the deployment that should draw specs.
4. Put an invoice spec code, for example `INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA`, in `defaultPdfStyle` for that company.
5. Generate PDF on the invoice screen uses v2 only when that style is not `classic`. Reports and Formats use v2 whenever the engine is `v2`. Credit notes and debit notes ignore the style and stay classic.
6. If the spec draw throws, the classic PDF is returned with the short notice. The badge stays approximate until sign-off.
