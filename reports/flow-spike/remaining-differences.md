# Flow vs Format 1 reference — remaining differences

- Flow is not absolute Format-1 geometry: field positions and charge-table column counts still differ from the fixed-position reference.
- Reference browser print chrome and Fresa company branding stay masked; they are not rendered by flow.
- Amount-in-words now uses correct major/minor units (e.g. Dirhams/Fils for AED); phrasing may still differ from the reference “Rupee … Only” singular form.
- Masked pixel mismatches remain high at 150 dpi because layout is flow-based, not fixed-position.

## Other modules vs references

- **Quotation**: look taken from FCL quotation (Arimo, ~7.9pt, soft header fill). Air quotation reference exists but is a second look, not a second template.
- **Debit note**: look taken from overseas debit note / Format-19 (8pt body, 14pt title).
- **Credit note**: no dedicated credit-note PDF in `reports/references/files`; shares the debit-note flow look. Original invoice number prints when the record has `credited_invoice_number`.
