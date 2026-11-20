# Tax fields on the invoice API

No change to the classic generator. Classic still reads `tax_total` only (`invoiceToPdfModel`: `vatAmount = invoice.tax_total ?? 0`).

The 10 downloaded `GET /invoices/:id` bodies have no `tax_total` key. They do have header `tax_amount` (a string) and line `tax_amount`. `normalizeInvoice` sets `tax_total` from `tax_total`, then `vat_amount`, then `taxTotal`. It does not copy header `tax_amount`, so the mapped invoice has no `tax_total`.

Invoices with line tax and no `tax_total`:

- INV/26/00093
- INV/26/00097
- INV/26/00094
- INV/26/00095
- INV/26/00098
- INV/26/00089

The other four (INV/26/00102, INV/26/00101, INV/26/00100, INV/26/00099) have header `tax_amount` 0 and line tax 0, and also have no `tax_total` key.

What the backend needs to send, when it is ready: `tax_total` as a number on the invoice, equal to the sum of the line `tax_amount` values. Do not invent an SGST, CGST, or IGST split in that field.
