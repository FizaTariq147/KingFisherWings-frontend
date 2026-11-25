# Default PDF style

Nothing here is accepted. The settings screen is not built. `defaultPdfStyle` is not a stored field in this frontend.

## Field

`defaultPdfStyle` is one value per company and per document type.

Document types that Generate PDF already distinguishes: `invoice`, `quotation`, `credit_note`, `debit_note`.

| | |
|---|---|
| Scope | One company, one document type |
| Name | `defaultPdfStyle` |
| Missing value | `classic` |

## Allowed values

| Value | Meaning |
|---|---|
| `classic` | The current Generate PDF. This is the default. |
| A report code | An exact catalogue code, for example `INVOICE_REPORT_FORMAT_17_INVOICE_JASPER`. |

Any other string is rejected. A code is stored only if it is in the report catalogue for that document type. Invoice codes are the 26 v2 invoice specs. Quotation, credit note, and debit note stay `classic` until those families have an accepted layout. Storing a code does not mark it accepted.

## API

This repo has no route that reads or writes `defaultPdfStyle`. Organization settings that do exist are `GET` and `PATCH` under `/organization/settings/…`, and number formats are per document type at `/organization/number-formats/:documentType`. The style should follow that shape.

| Action | Route |
|---|---|
| Read | `GET /organization/companies/:companyId/pdf-style/:documentType` |
| Write | `PUT /organization/companies/:companyId/pdf-style/:documentType` |

Body and response:

```json
{ "documentType": "invoice", "defaultPdfStyle": "classic" }
```

`PUT` returns the stored row. `GET` returns `{ "documentType": "invoice", "defaultPdfStyle": "classic" }` when nothing has been saved. The company payload and `GET /organization/profile` do not include this field today.

## What the frontend reads today

`readDefaultPdfStyle` in `src/features/reports/engine/reportsEngine.ts` returns the string property `defaultPdfStyle` when an object already has one. Otherwise it returns `classic`. It does not create the field and it does not call an API.

Generate PDF on the invoice detail page (`src/features/invoices/pages/InvoiceDetailPage.tsx`) calls that function on the invoice's company, then on the organization profile. The first value that is not `classic` is the style. `Company` and `OrganizationProfile` do not declare `defaultPdfStyle`. No screen writes it. With the engine on `v2` and a non-classic style, Generate PDF tries that code and, if the build throws, shows the classic PDF and the notice "Showing the classic invoice. The selected format could not be built."

## Settings screen

Not built. When it is added it needs:

- The company the invoice belongs to.
- The document type.
- A choice of `classic` or a catalogue code for that document type.
- Save through the `PUT` above, then read it back with the `GET`.
- No way to mark a code accepted, and no change to the classic generator.
