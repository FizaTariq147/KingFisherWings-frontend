# Invoice fields the frontend cannot fill

Nothing here is accepted. The resolver leaves a value blank when the current frontend model has no source. Table and column are blank where this repo has no schema.

The binding dictionary resolves 133 of 1,016 dynamic spans on the 26 invoice specs. The other 883 are in `reports/invoice-unresolved.csv` (`code`, `span`, `label`, `proposed_binding`). `proposed_binding` is empty. Those labels are not in the dictionary, and a nearest static label was a demo value or a caption the dictionary does not name.

## Binding paths with no source

| Path | Why it stays blank | Table | Column |
|---|---|---|---|
| party.notify | `Job` has shipper and consignee names. It has no notify-party name. | | |
| cargo.netWeight | `Job` and `JobCargo` have gross weight. They have no net weight. | | |

`invoice.amount` is read from `Invoice.subtotal`. `invoice.tax` is `tax_total`. `invoice.total` is `total_amount`. The API resource is the invoice. The database table name is not in this repo, so the table cell stays blank.

## Labels the dictionary does not bind

These captions repeat on the invoice specs. No current field was mapped to them.

| Label on the spec | Table | Column |
|---|---|---|
| Shipment No. | | |
| Reference No. | | |
| IGM No. | | |
| Narration | | |
| Remarks | | |
| Qty | | |
| SubTotal | | |
| Taxable | | |

Charge description, quantity, rate, and line amount exist on `Invoice.lines` (`description`, `quantity`, `unit_price`, `line_total`). The specs do not bind those line slots, so extra lines are not drawn. India SGST, CGST, and IGST are not separate fields. `Invoice` has one `tax_total`.

| Needed value | Table | Column |
|---|---|---|
| SGST amount | | |
| CGST amount | | |
| IGST amount | | |
| Per-line tax split | | |

## Company style

`defaultPdfStyle` is not on `OrganizationProfile` or `Company`. Generate PDF stays classic until a stored value exists.

| Needed value | Table | Column |
|---|---|---|
| Default PDF style per company and document type | | |
| `reports.engine` (`legacy` or `v2`) | | |
