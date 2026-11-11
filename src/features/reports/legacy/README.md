# Legacy report layouts

Preserved unused React invoice layout experiments moved out of the live
catalogue path. Live rendering uses:

- `JsonInvoiceLayoutRenderer` + `*FormatUiLayouts.json`
- `templates/*` (template-v2 specialized documents)
- Official Fresa sample PDFs for HBL/HAWB browse

Do not delete these files without confirming no external references.
Default `POST /invoices|quotations/:id/pdf` paths are unrelated and must stay.
