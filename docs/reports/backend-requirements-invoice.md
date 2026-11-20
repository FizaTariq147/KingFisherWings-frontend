# Invoice fields the frontend cannot fill

Nothing here is accepted. The resolver leaves a value blank when the current frontend model has no source. Table and column are blank where this repo has no schema.

The binding dictionary resolves 133 of 1,016 dynamic spans on the 26 invoice specs. The other 883 are in `reports/invoice-unresolved.csv` (`code`, `span`, `label`, `proposed_binding`). `proposed_binding` is empty. Those labels are not in the dictionary, and a nearest static label was a demo value or a caption the dictionary does not name.

## Binding paths with no source

| Path | Why it stays blank | Table | Column |
|---|---|---|---|
| party.notify | `Job` has shipper and consignee names. It has no notify-party name. | | |
| cargo.netWeight | `Job` and `JobCargo` have gross weight. They have no net weight. | | |
| shipment.igm | No IGM number on `Invoice` or `Job`. | | |
| invoice.narration | `Invoice` has `remarks`. It has no narration column. | | |

`invoice.amount` is read from `Invoice.subtotal`. `invoice.tax` is `tax_total`. `invoice.total` is `total_amount`. The API resource is the invoice. The database table name is not in this repo, so the table cell stays blank.

## Labels the dictionary does not bind

These captions repeat on the invoice specs. No current field was mapped to them.

| Label on the spec | Table | Column |
|---|---|---|
| SubTotal | | |
| Taxable | | |

These are now filled from the record when the field exists.

| Label | Source |
|---|---|
| Shipment No. | `Job.shipment_number` |
| Reference No. | `Job.client_reference_no` |
| Remarks | `Invoice.remarks` |
| Qty | `InvoiceLine.quantity` |
| Rate | `InvoiceLine.unit_price` |
| Currency | `Invoice.currency_code` |
| Per-line tax | `InvoiceLine.tax_amount` when the column is a single tax. SGST, CGST, and IGST stay blank. |
| Amount in words | Derived from `Invoice.total_amount` and `Invoice.currency_code`. INR uses lakh and crore. |
| Voyage / Flight No. | `Job.voyage_number`, sea voyage, invoice shipment voyage or flight, booking `voyage_ref`, then the linked bill voyage |
| Ref No. | `Job.client_reference_no`, else `Job.reference_no` |
| INCO Terms | `Job.incoterms` |
| Customer P/O No. | `Invoice.lpo_number` |
| Balance | `Invoice.outstanding_balance` |
| Due date | `Invoice.due_date` |
| Department | `Job.department_name` |
| Place of Origin | `Job.origin_port_code` |
| MAWB / MBL | Sea `mbl_number`, else air `mawb_number` |
| HAWB / HBL | Sea `hbl_number`, the agent's HBL, the invoice shipment `hbl_number` or `hawb_number`, then `bl_awb`, then the linked bill `bl_number` |
| Vessel | `Job.vessel_name`, sea vessel, invoice shipment `vessel_name` or `vessel_flight`, then the linked bill vessel |
| Shipper | `Job.shipper_name`, else `Job.shipper.name`. The billed party is not copied into shipper. |
| Consignee | `Job.consignee_name`, else `Job.consignee.name` |
| Container | `Job.primary_container_number` and container numbers on the job and on the sea leg |

Charge description, quantity, rate, and line amount are drawn from `Invoice.lines` (`description`, `quantity`, `unit_price`, `line_total`). Extra lines continue on the next page. India SGST, CGST, and IGST are not separate fields. `Invoice` has one `tax_total`. Those columns are not drawn. The codes are listed in `reports/invoice-v2/gst-blocked.md`.

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
