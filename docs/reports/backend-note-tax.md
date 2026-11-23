# Backend note: classic VAT vs line tax_amount

Classic `invoiceToPdfModel` sets `vatAmount = invoice.tax_total ?? 0`.
It does not read `invoice.tax_amount` or sum line `tax_amount`.
Flow prints Tax from header/line `tax_amount` and never uses `tax_total`.

Real invoices where classic would print VAT 0.00 while lines (or header tax_amount) contain tax:

- **INV/26/00093** — header tax_amount=45, tax_total=null, line tax sum=45, classic VAT=0, flow Tax=45
- **INV/26/00097** — header tax_amount=3.5, tax_total=null, line tax sum=3.5, classic VAT=0, flow Tax=3.5
- **INV/26/00094** — header tax_amount=7628.35, tax_total=null, line tax sum=7628.35, classic VAT=0, flow Tax=7628.35
- **INV/26/00095** — header tax_amount=2839.45, tax_total=null, line tax sum=2839.45, classic VAT=0, flow Tax=2839.45
- **INV/26/00098** — header tax_amount=76000, tax_total=null, line tax sum=76000, classic VAT=0, flow Tax=76000
- **INV/26/00089** — header tax_amount=4.5, tax_total=null, line tax sum=4.5, classic VAT=0, flow Tax=4.5

Do not change the classic generator. Backend should populate `tax_total` when VAT must appear on classic PDFs, or clients should prefer flow for tax_amount-backed totals.

