# Classic Generate PDF files

These files draw the classic quotation, invoice, credit note, and debit note PDFs. `npm run report:guard-classic` hashes every path below and fails if one changes. Do not edit, move, rename, or refactor them.

`defaultPdfStyle` is not a field on the frontend organization or company models. Generate PDF on the four screens calls these files. Credit notes and debit notes use the invoice generator through `commercialNoteToPdfModel`.

- src/features/invoices/utils/generateInvoicePdf.ts
- src/features/organization/utils/embedOrganizationPdfLogo.ts
- src/features/files/utils/sanitizePdfText.ts
- src/features/quotations/utils/generateQuotationPdf.ts
- src/features/invoices/utils/invoiceToPdfModel.ts
- src/features/invoices/utils/commercialNoteToPdfModel.ts

Hashes after `fc23abc0` and `df1f07c4`. The guard compares these with `reports/classic-snapshots/hashes.json`.

| File | SHA-256 |
|---|---|
| src/features/invoices/utils/generateInvoicePdf.ts | 7c900210e55cb1058388d56b159bcfba7bb7ea9c5eb16aecaa0777cf9e00e9a7 |
| src/features/organization/utils/embedOrganizationPdfLogo.ts | 8cf393c2d661b458cc94df7edbda47e2cfd00264f7fdc92fcd7cc7e5e02e00ea |
| src/features/files/utils/sanitizePdfText.ts | 2ad296a108931960b02fe6ef07e196159c258bb8e0afe140adfd3fd62b266eb7 |
| src/features/quotations/utils/generateQuotationPdf.ts | 616873b791ac6a80e6fd4dc21ef5ffbfb19c153d660f498390d9e119c316d26e |
| src/features/invoices/utils/invoiceToPdfModel.ts | 322e7a4a3bf01afffe67fc4863beb9825c85a497cd3849ec4ec4277eb54001f4 |
| src/features/invoices/utils/commercialNoteToPdfModel.ts | f33c7a35ac623fba1fe9c9af0eeba09e840912b85287362e909a916fd81df927 |
