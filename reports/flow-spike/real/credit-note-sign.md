# Credit note — sign, original invoice, tax, wording

Real records via `GET /credit-notes`: **0** (below 5 → synthetic anonymized copies from real invoices).

## Sign convention

- Record amounts on synthetic copies (and any future real notes) are stored **positive** as on the source invoice (`subtotal`, `tax_*`, `total_amount`, line `line_total` ≥ 0).
- Classic prints amounts as stored (`commercialNoteToPdfModel` → `generateInvoicePdf`); no sign flip.
- Flow prints amounts as stored via `tax_amount ?? tax_total`.

## Tax fields

- Classic VAT: `tax_total (commercialNoteToPdfModel vatAmount = note.tax_total)`
- Flow tax: `tax_amount ?? tax_total (flow-doc noteTotals)`

## Wording (listed only — no jurisdiction decision)

```json
{
  "classic": {
    "documentTitle": "CREDIT NOTE",
    "documentSubtitle": "CREDIT NOTE / STATEMENT OF CHARGES",
    "relatedInvoiceLabel": "Related Invoice",
    "source": "src/features/invoices/utils/commercialNoteToPdfModel.ts labelsFor()"
  },
  "flow": {
    "title": "CREDIT NOTE",
    "originalInvoiceLabel": "Original Invoice:",
    "termsLine": "This credit note adjusts the original invoice. Please apply it against the outstanding balance.",
    "source": "tools/reports/flow-doc.mjs buildCreditOrDebit()"
  },
  "jurisdictionDecision": "not decided — listed wording only"
}
```

## Per-record original invoice + tax

```json
[
  {
    "id": "syn-credit-1",
    "number": "CN/SYN/26/00001",
    "amountsPositive": true,
    "total_amount": "120",
    "tax_amount": "0",
    "originalInvoice": "INV/26/00102"
  },
  {
    "id": "syn-credit-2",
    "number": "CN/SYN/26/00002",
    "amountsPositive": true,
    "total_amount": "945",
    "tax_amount": "45",
    "originalInvoice": "INV/26/00093"
  },
  {
    "id": "syn-credit-3",
    "number": "CN/SYN/26/00003",
    "amountsPositive": true,
    "total_amount": "1831",
    "tax_amount": "0",
    "originalInvoice": "INV/26/00101"
  },
  {
    "id": "syn-credit-4",
    "number": "CN/SYN/26/00004",
    "amountsPositive": true,
    "total_amount": "1200",
    "tax_amount": "0",
    "originalInvoice": "INV/26/00100"
  },
  {
    "id": "syn-credit-5",
    "number": "CN/SYN/26/00005",
    "amountsPositive": true,
    "total_amount": "22",
    "tax_amount": "0",
    "originalInvoice": "INV/26/00099"
  },
  {
    "id": "syn-credit-6",
    "number": "CN/SYN/26/00006",
    "amountsPositive": true,
    "total_amount": "0",
    "tax_amount": "0",
    "originalInvoice": "INV/26/00088"
  },
  {
    "id": "syn-credit-7",
    "number": "CN/SYN/26/00007",
    "amountsPositive": true,
    "total_amount": "94.5",
    "tax_amount": "4.5",
    "originalInvoice": "INV/26/00089"
  },
  {
    "id": "syn-credit-8",
    "number": "CN/SYN/26/00008",
    "amountsPositive": true,
    "total_amount": "0",
    "tax_amount": "0",
    "originalInvoice": "INV/26/00091"
  },
  {
    "id": "syn-credit-9",
    "number": "CN/SYN/26/00009",
    "amountsPositive": true,
    "total_amount": "59628.45",
    "tax_amount": "2839.45",
    "originalInvoice": "INV/26/00095"
  },
  {
    "id": "syn-credit-10",
    "number": "CN/SYN/26/00010",
    "amountsPositive": true,
    "total_amount": "1596000",
    "tax_amount": "76000",
    "originalInvoice": "INV/26/00098"
  }
]
```

## Differences vs classic / record

- syn-credit-2 tax: classic uses tax_total only (null/absent on record → prints 0); flow uses tax_amount=45 (tax_total vs tax_amount field mapping)
- syn-credit-7 tax: classic uses tax_total only (null/absent on record → prints 0); flow uses tax_amount=4.5 (tax_total vs tax_amount field mapping)
- syn-credit-9 tax: classic uses tax_total only (null/absent on record → prints 0); flow uses tax_amount=2839.45 (tax_total vs tax_amount field mapping)
- syn-credit-10 tax: classic uses tax_total only (null/absent on record → prints 0); flow uses tax_amount=76000 (tax_total vs tax_amount field mapping)
