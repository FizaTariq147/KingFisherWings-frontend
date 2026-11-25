# Credit / debit note fixed wording

- **CREDIT NOTE / DEBIT NOTE (title)** — classic commercialNoteToPdfModel labelsFor documentTitle
- **Credit Note # / Debit Note #** — classic labelsFor numberLabel
- **Credit Note Date / Debit Note Date** — classic labelsFor dateLabel
- **Related Invoice** — classic jobRefLabel when credited_invoice_* set
- **Due Date** — classic labelsFor dueDateLabel
- **Bill To** — shared flow face (classic CUSTOMER role)
- **Charges / Qty / Rate / Tax / Total** — shared flow charge table
- **Sub Total / Discount / Tax / Rounding / Total** — shared flow totals
- **Bank Details labels** — printed only when bank.* fields set
- **Terms body** — record.remarks (classic TERMS & CONDITIONS)
- **Original Invoice** — removed — replaced with classic Related Invoice *(removed)*
- **This credit/debit note adjusts…** — removed — no classic or record source *(removed)*
- **Status** — removed — not on classic commercial note face *(removed)*

```json
{
  "creditNote": {
    "title": "CREDIT NOTE",
    "numberLabel": "Credit Note #",
    "dateLabel": "Credit Note Date",
    "relatedInvoiceLabel": "Related Invoice",
    "dueDateLabel": "Due Date",
    "termsSource": "record.remarks (classic TERMS & CONDITIONS)"
  },
  "debitNote": {
    "title": "DEBIT NOTE",
    "numberLabel": "Debit Note #",
    "dateLabel": "Debit Note Date",
    "relatedInvoiceLabel": "Related Invoice",
    "dueDateLabel": "Due Date",
    "termsSource": "record.remarks (classic TERMS & CONDITIONS)"
  }
}
```

