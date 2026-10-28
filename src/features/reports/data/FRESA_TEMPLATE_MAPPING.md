# Report → template mapping (local)

- Total layouts: **702**
- Unique block signatures: **702**
- Identical-structure groups: **0**

## Root cause

Many formats share the same JsonInvoiceLayoutRenderer block pipeline. Uniqueness was previously faked via optional-block injection / theme swaps, or entire families (HAWB extras, HBL Format-23+) cloned one shell. Catalogue PDF path is generateInvoiceFormatPreviewPdf → InvoiceFormatLayoutByKind → JsonInvoiceLayoutRenderer.

- Renderer: `src/features/reports/components/ReportCatalog/JsonInvoiceLayoutRenderer.tsx`
- PDF: `src/features/reports/utils/generateInvoiceFormatPreviewPdf.tsx`

## Largest identical groups

