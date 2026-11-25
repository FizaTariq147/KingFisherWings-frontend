# Release pack: INVOICE_REPORT_FORMAT_17_INVOICE_JASPER

Nothing here is accepted. No sign-off was run.

## Criteria

| Criterion | Result |
|---|---|
| Money fields bound and reconcile with the classic PDF on 10 real invoices | fail |
| Party and shipment fields are bound, or listed in docs/reports/backend-requirements-invoice.md with table and column | pass |
| Leak check is clean | pass |
| Logo draws from the organization logo fetch. No bytes leaves the slot empty | pass |
| Lines paginate | pass |
| Blank ratio on the 10 real invoices is reported per field | pass |
| Review sheet is in git | pass |

## Six layers

From `reports/full-run-track-a-last.csv`. The reference for this code is one page.

| Layer | Result |
|---|---|
| Page | pass |
| Static geometry | pass |
| Static text | pass |
| Dynamic text | pass |
| Raster | pass |
| Pagination | single-page |

Page, geometry, static text, dynamic text, and raster pass. Pagination is single-page, which is not a failure: the pinned reference has one page, so the multi-page check was not exercised.

Raster ratios: non-text 0, text ink 0.079, masked fraction 0.1127. Failure class: none.

## Money

| Invoice | Classic PDF and this v2 PDF |
|---|---|
| INV/26/00102 | pass |
| INV/26/00093 | pass |
| INV/26/00101 | pass |
| INV/26/00100 | pass |
| INV/26/00099 | pass |
| INV/26/00097 | pass |
| INV/26/00094 | pass |
| INV/26/00095 | fail |
| INV/26/00098 | pass |
| INV/26/00089 | pass |

## Blank ratio

Counts are the 10 real invoices. Blank ratio is bound-but-empty divided by 10.

| Field | Filled | Empty in the record | Not on this layout | Blank ratio |
|---|---:|---:|---:|---:|
| shipper | 3 | 7 | 0 | 0.70 |
| consignee | 0 | 9 | 1 | 0.90 |
| vessel | 1 | 9 | 0 | 0.90 |
| voyage | 1 | 9 | 0 | 0.90 |
| HBL | 0 | 8 | 2 | 0.80 |
| container | 2 | 8 | 0 | 0.80 |
| bill-to | 2 | 0 | 8 | 0.00 |
| quantity | 10 | 0 | 0 | 0.00 |
| rate | 7 | 0 | 3 | 0.00 |
| currency | 10 | 0 | 0 | 0.00 |
| subtotal | 10 | 0 | 0 | 0.00 |
| tax | 9 | 0 | 1 | 0.00 |
| total | 10 | 0 | 0 | 0.00 |
| amount in words | 10 | 0 | 0 | 0.00 |

## Resolver misses and empty fields

Checked on the 10 real invoices against the invoice, the linked job, the invoice shipment, sea and air legs, bills of lading, the booking form, and parties.

| Field | Resolver miss | Genuinely empty |
|---|---|---|
| Shipper | None. `Job.shipper.name` is now used when `shipper_name` is blank. The billed party is not treated as the shipper. | INV/26/00093, INV/26/00100, INV/26/00097, INV/26/00094, INV/26/00095, INV/26/00098, INV/26/00089 |
| Consignee | None. `Job.consignee.name` is now used when `consignee_name` is blank. | Every real invoice except INV/26/00102 |
| Vessel | None. Invoice shipment `vessel_name` and `vessel_flight`, and the linked bill vessel, are now read. | Every real invoice except INV/26/00099 |
| Voyage | INV/26/00099 stores the voyage on the booking `voyage_ref`. That is now bound. | The other nine real invoices |
| HBL | INV/26/00102 has no house-bill column. Its invoice shipment `bl_awb` is now bound. | The other real invoices except INV/26/00099, which already had `hbl_number` |
| Container | None. Numbers on the job and on the sea leg are now joined. | Every real invoice except INV/26/00102 and INV/26/00099 |

## What a customer sees

Typical invoice: INV/26/00102. It has a linked job, a shipper, a consignee, and a container. Empty boxes on this code:

| Empty box | Why | Count |
|---|---|---:|
| 4G LOGISTICS INDIA PVT LTD | no source | 3 |
| DUE DATE | empty in the record | 1 |
| SHIPMENT | empty in the record | 1 |
| 4G LOGISTICS INDIA PVT LTD | empty in the record | 1 |
| Bank Details | empty in the record | 1 |

## Logo and pages

The header image is a letterhead band, not a separate logo box. On a live invoice the organization logo is drawn inside that band, at the left, in its own proportions, from `fetchOrganizationLogoBytes` (the same fetch the classic generator uses). No bytes leaves the band empty. The sample letterhead art is not copied.

A 40-line invoice produced 2 page(s). Every charge line is present.

## Review sheet

`reports/review/commercial/INVOICE_REPORT_FORMAT_17_INVOICE_JASPER.png` is in git.

## Generate PDF fallback

Generate PDF calls `generateInvoicePdfChoice`. When `VITE_REPORTS_ENGINE=v2` and the company or organization payload carries a non-classic `defaultPdfStyle`, that code is built first. A thrown error returns the classic PDF and the notice: "Showing the classic invoice. The selected format could not be built."

The unit test `Generate PDF falls back to classic and shows a notice when the selected style throws` forces that error for this path. A classic style does not call v2.

## How a company sets this code as the default invoice style

There is no settings screen for this. `OrganizationProfile` and company records in this frontend have no stored default style. Generate PDF stays classic until a payload already contains `defaultPdfStyle`.

1. Store `defaultPdfStyle` as exactly `INVOICE_REPORT_FORMAT_17_INVOICE_JASPER` on the company, or on the organization profile if the company has none.
2. Run the app with `VITE_REPORTS_ENGINE=v2`.
3. Open an invoice and click Generate PDF.
4. If the format builds, that PDF is the file. If it throws, the classic PDF is shown with the notice above.

Choosing the code under Formats previews that invoice only. It does not save a company default.

