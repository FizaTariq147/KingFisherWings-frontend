# Client pack — known differences and blanks

One page for reviewers. Flow PDFs contain no Fresa names or branding.

## INV/26/00102 (invoice)

Nearest Fresa reference: `INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA` (copied as `fresa-reference-nearest.pdf`).

### Differences
- Flow uses tax_amount; classic VAT uses tax_total when set.
- Flow layout is pdfmake Format-1-inspired, not a pixel match to the Fresa sample.
- Empty record fields stay blank — never filled from the Fresa sample.

### Blanks
- (none recorded for measured fields)

## INV/26/00094 (invoice)

Nearest Fresa reference: `INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA` (copied as `fresa-reference-nearest.pdf`).

### Differences
- Flow uses tax_amount; classic VAT uses tax_total when set.
- Flow layout is pdfmake Format-1-inspired, not a pixel match to the Fresa sample.
- Empty record fields stay blank — never filled from the Fresa sample.

### Blanks
- job context empty in record

## QT/FE/26/00119 (quotation-fcl)

Nearest Fresa reference: `FCL_QUOTATION_REPORT_FORMAT` (copied as `fresa-reference-nearest.pdf`).

### Differences
- Flow quotation is a commercial face (pdfmake), not the FCL Quotation Jasper/Fresa sample layout.
- Incoterms bind from incoterm or incoterms; blank when the record has neither.
- Carrier binds carrier_name or carrier_preference; blank when both empty.

### Blanks
- Incoterms empty in record
- Carrier empty in record
- Valid until empty in record
- Department name empty in record (job_type still prints under Job / Service)

## QT/AE/26/00105 (quotation-air)

Nearest Fresa reference: `FCL_QUOTATION_REPORT_FORMAT` (copied as `fresa-reference-nearest.pdf`).

### Differences
- Flow quotation is a commercial face (pdfmake), not the FCL Quotation Jasper/Fresa sample layout.
- Incoterms bind from incoterm or incoterms; blank when the record has neither.
- Carrier binds carrier_name or carrier_preference; blank when both empty.

### Blanks
- Incoterms empty in record
- Carrier empty in record
- Valid until empty in record
- Department name empty in record (job_type still prints under Job / Service)

## QT/LE/26/00063 (quotation-lcl)

Nearest Fresa reference: `FCL_QUOTATION_REPORT_FORMAT` (copied as `fresa-reference-nearest.pdf`).

### Differences
- Flow quotation is a commercial face (pdfmake), not the FCL Quotation Jasper/Fresa sample layout.
- Incoterms bind from incoterm or incoterms; blank when the record has neither.
- Carrier binds carrier_name or carrier_preference; blank when both empty.

### Blanks
- Incoterms empty in record
- Carrier empty in record
- Valid until empty in record
- Department name empty in record (job_type still prints under Job / Service)

