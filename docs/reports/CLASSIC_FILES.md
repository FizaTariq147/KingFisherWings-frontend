# Classic Generate PDF files

These files draw the classic quotation, invoice, credit note, and debit note PDFs. `npm run report:guard-classic` hashes every path below and fails if one changes. Do not edit, move, rename, or refactor them.

`defaultPdfStyle` is not a field on the frontend organization or company models. Generate PDF on the four screens calls these files. Credit notes and debit notes use the invoice generator through `commercialNoteToPdfModel`.

- src/features/invoices/utils/generateInvoicePdf.ts
- src/features/organization/utils/embedOrganizationPdfLogo.ts
- src/features/files/utils/sanitizePdfText.ts
- src/features/quotations/utils/generateQuotationPdf.ts
- src/features/invoices/utils/invoiceToPdfModel.ts
- src/features/invoices/utils/commercialNoteToPdfModel.ts
