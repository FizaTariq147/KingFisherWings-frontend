# Staging test — flow release set

Release set: `INVOICE_FLOW_TAX_INVOICE_1`, `QUOTATION_FLOW_1`.  
Nothing in this checklist marks a code accepted. Soft gate shows **approximate, not final** until a real sign-off and rebuild.

## Environment for this checklist

| Variable | Soft staging | Hard (accepted only) | Kill switch |
|---|---|---|---|
| `VITE_REPORTS_ENGINE` | `v2` | `v2` | unset or `legacy` |
| `VITE_REPORTS_GATE` | unset / `soft` | `hard` | any |
| `VITE_REPORTS_FLOW_STAGING` | unset | unset | unset |

Restart the Vite / hosted app after changing env vars.

## Exact records to use

### Invoices

| Number | Id |
|---|---|
| INV/26/00102 | `d7280830-7eea-463e-a21e-cc59d2900807` |
| INV/26/00094 | `78e04303-9ecf-484f-916d-91a88c16e7a1` |

### Quotations (one per type)

| Type | Number | Id |
|---|---|---|
| FCL | QT/FE/26/00119 | `3a66be78-c5c0-4fc1-8020-ee06b46b9692` |
| Air | QT/AE/26/00105 | `bba3d296-270b-427b-92c2-a42a86f849b8` |
| LCL | QT/LE/26/00063 | `7ca53052-0cf3-47c4-8c21-6037dbaea8dd` |

## A. Soft gate — invoice

1. Open invoice **INV/26/00102**.
2. Confirm **Generate PDF** still produces the classic invoice (no flow layout from that button unless a non-classic company style is set).
3. Open **Formats** / Reports catalogue. Find **Tax Invoice (flow layout)** (`INVOICE_FLOW_TAX_INVOICE_1`). Badge should say approximate, not final.
4. Generate / preview the flow format. Compare Sub Total, Tax, Rounding, Discount, Total and each line amount with classic Generate PDF and with the record.
5. Repeat for **INV/26/00094** (this invoice has `tax_amount` and null `tax_total` — flow Tax uses `tax_amount`; classic VAT uses `tax_total`).

## B. Soft gate — quotations

For each of FCL / Air / LCL ids above:

1. Open the quotation detail screen.
2. Open Formats / catalogue → **Quotation (flow layout)** (`QUOTATION_FLOW_1`).
3. Generate the flow PDF. Confirm fields that have values on screen (Client, dates, POL/POD, Incoterms, Commodity, Carrier, Valid until, etc.) appear when held; blanks stay blank.
4. Compare charge totals with classic quotation Generate PDF.

## C. Fallback

1. With engine `v2`, force a flow/v2 render failure (stop the flow renderer or use a broken code path in a local build).
2. Confirm the UI returns the **classic** PDF and shows:  
   `Showing the classic invoice. The selected format could not be built.`

## D. Generate PDF unchanged

1. On INV/26/00102 and QT/FE/26/00119, use the screen **Generate PDF** action with default company style.
2. Confirm output is still the classic KingFisher face (not the Fresa sample, not a silent flow swap).

## E. Hard gate

1. Set `VITE_REPORTS_GATE=hard` and rebuild/restart.  
   Without accepted rows in the **deployed** `status.json`, flow and v2 codes show as not available / are withheld from the catalogue.
2. Status-path proof (already run in CI tooling, not a production accept): temporary signoff → `report:status` → hard catalogue lists **only** `INVOICE_FLOW_TAX_INVOICE_1` and `QUOTATION_FLOW_1`. See `reports/flow-spike/status-path-proof.json`. Do **not** commit that temporary signoff.

## F. Kill switch (no code deploy)

1. Set `VITE_REPORTS_ENGINE` to unset or `legacy` on the host and restart the frontend process / CDN build that reads that env.
2. Confirm **no** flow or v2 format appears in Formats / catalogue, and Generate PDF stays classic.
3. Restore `VITE_REPORTS_ENGINE=v2` when finished.

## G. Credit / debit notes

1. Confirm `CREDIT_NOTE_FLOW_1` / `DEBIT_NOTE_FLOW_1` do **not** appear unless soft gate **and** `VITE_REPORTS_FLOW_STAGING=1`.
2. Label when shown: `staging only: no real records tested`. Synthetic notes never count toward release.
