# Phase 1 release notes

Nothing in this release is accepted. No threshold, mask, status value, or sign-off row was changed. The classic invoice generator is unchanged.

## What ships

The v2 invoice renderer stays behind `VITE_REPORTS_ENGINE`. Credit notes, debit notes, and quotations stay on the classic generator.

Phase 1 release set:

- INVOICE_REPORT_FORMAT_10_STANDARD_INVOICE

It is not accepted. The catalogue badge stays "approximate, not final" until the steps under "How a code becomes accepted" have been run and a new build has been made.

## Not in phase 1

These stay gated. Hard mode withholds them because their status is not `accepted`.

### INVOICE_REPORT_FORMAT_9_STANDARD_INVOICE_USA

- The span under `32.AMOUNT IN USD` is the repeating cell `line-0-p1s96` (sample span `p1s96`, sample text `275.000`). It was painted with the line quantity. On INV/26/00102 that quantity is 10. The cause was the charge-row rule that treated any sample with three decimals as a quantity column. Quantity is now taken from a qty or quantity header. A column whose header names a currency is money: the line amount when that currency is the invoice currency, otherwise the line amount times `exchange_rate`. When `exchange_rate` is missing, the other currency column is left blank.
- `34.Amount (AED)` is the repeating cell `line-0-p1s98` (sample span `p1s98`). It was already filled with the line total, because it is the rightmost amount cell. It is not an exchange conversion unless `exchange_rate` is a real rate. On the ten downloaded invoices `exchange_rate` is `"1"`.
- The layout has no Sub Total, VAT, or Discount row, so those classic figures are not printed.
- Applicability currency is USD, so only INV/26/00101 and INV/26/00100 are the matching real invoices.

### INVOICE_REPORT_FORMAT_15_INVOICE_FCY

- Charge lines are not drawn. `chargeRows` keeps a row only when it has at least three numeric dynamic spans. Format 15's charge rows have two (rate and USD total) at y 404.2, 392.2, 380.2, and 368.2. The single-number rows at y 356.2 and y 212.7 are totals. `layoutRepeatingCharges` therefore returns no band, and the fallback in `fillInvoiceSpans` also skips a row with fewer than four numeric spans. INV/26/00101's three charge amounts (1,560.00, 55.00, 216.00) are never written.
- The 40-line invoice stays on one page and draws no "Charge line NN" descriptions, for the same reason. This is the missing charge band, not an overflow rule.
- `Total Amt (USD)` and the exchange-rate sentence are static text. `invoice.exchange_rate` is not bound on this layout.
- Lowering the three-cell rule was not applied. A two-cell rule would also pick up totals rows on other layouts, and that is not a safe general change in this session.

## Production environment

Build-time defaults (baked into the JS bundle; changing them **requires a rebuild**):

| Variable | Production build default |
|---|---|
| `VITE_REPORTS_ENGINE` | `v2` |
| `VITE_REPORTS_GATE` | `hard` |

`VITE_*` values are fixed at build time. They are **not** a runtime kill switch. They apply only when the runtime config omits a field, or before the runtime file is loaded.

There is no settings/API field for reports engine today. Runtime control is the static file:

**`public/reports-config.json`** (served as `/reports-config.json`)

```json
{ "engine": "v2", "gate": "soft", "disabledCodes": [] }
```

The app fetches it once at start with `cache: 'no-store'`. If the fetch fails or is unreachable, **engine defaults to `legacy`** (safe off). Successful responses may omit fields; omitted fields fall back to the build-time `VITE_*` defaults.

Hard mode (runtime or build gate `hard`) previews and generates a non-flow v2 invoice code only when `reports/status.json` says `accepted`. Flow codes always require `accepted` to generate (even under soft gate). Formats 9 and 15 stay withheld until accepted under hard gate.

## Turning v2 on and off

### Runtime (no rebuild) — preferred kill switch

| Action | Exact change | Result | Rebuild? |
|---|---|---|---|
| Turn **all** v2/flow off for everyone | Set `"engine": "legacy"` in `public/reports-config.json` on the host (CDN/static root). Reload the app (new sessions fetch the file). | Catalogue lists **no** gated v2/flow codes. Generate stays classic. | **No** |
| Disable **one** code | Add its code to `"disabledCodes"` (e.g. `["INVOICE_FLOW_TAX_INVOICE_1"]`). Leave `"engine": "v2"`. | That code is hidden from the catalogue and not generatable. Others unchanged. | **No** |
| Turn v2 **back on** | Set `"engine": "v2"` and clear or trim `disabledCodes`. Reload. | Catalogue follows gate + status again. | **No** |

**Cache lifetime:** the fetch uses `cache: 'no-store'`, so the browser does not keep a stale copy of `/reports-config.json`. Users must reload (or open a new tab) so the app re-runs boot and re-fetches. No CDN purge of the JS bundle is required for a config-only flip; ensure the static host serves the updated JSON immediately (no long-lived CDN cache on that path, or purge that one object).

**What still needs a rebuild**

| Change | Rebuild required? |
|---|---|
| Flip `public/reports-config.json` (`engine` / `gate` / `disabledCodes`) | No |
| Change `VITE_REPORTS_ENGINE` / `VITE_REPORTS_GATE` / `VITE_REPORTS_FLOW_STAGING` | Yes |
| Change `reports/status.json` (acceptance) | Yes — status is imported into the bundle via `reportConformanceStatus.ts` |
| Code / classic generator changes | Yes |

### Build-time defaults (require rebuild)

| `VITE_REPORTS_ENGINE` | Used when |
|---|---|
| unset or `legacy` | Runtime file omits `engine`, or as the soft default before load |
| `v2` | Runtime file omits `engine` and the build was shipped with v2 |

| Runtime / build `gate` | Result for non-flow v2 specs |
|---|---|
| unset or `soft` | Spec can be previewed while not accepted (badge: approximate). |
| `hard` | Spec only when status is `accepted`; otherwise "format not available yet". |

Flow release codes (`INVOICE_FLOW_TAX_INVOICE_1`, `QUOTATION_FLOW_1`): generatable only when **accepted** in `status.json` **and** runtime `engine` is `v2` **and** the code is not in `disabledCodes`. Credit/debit flow codes additionally require `VITE_REPORTS_FLOW_STAGING=1` under soft gate and are labelled `staging only: no real records tested`.

Proof that a runtime flip hides the catalogue without rebuild: `node tools/reports/prove-runtime-kill-switch.mjs` → `reports/output/runtime-kill-switch-proof/proof.json`.

## Fallback (tested)

If a selected flow / v2 render throws while being built, Generate returns the classic PDF and shows:

`Showing the classic invoice. The selected format could not be built.`

Covered by `generateWithFallback` / `invoiceV2Gate` unit tests (forced throw → classic blob + notice). With runtime or build engine `legacy`, `attemptV2` is false and classic runs with no notice.

## How a code becomes accepted

`npm run report:signoff -- <code> <reviewer>` does not change what the app shows. It appends or updates one row in `reports/signoff.csv` only when every acceptance layer passes, or when that code's own line in `reports/exceptions.md` contains the word approved. It does not write `reports/status.json`.

`reports/status.json` is regenerated by `npm run report:status` (`tools/reports/build-status.mjs`). A sign-off row that has a reviewer, a date, and a reference hash becomes `accepted`. A row with no reviewer becomes `in_progress`. Every other catalogue code stays `reference_only`.

The app reads that file through the static import in `src/features/reports/utils/reportConformanceStatus.ts`. Vite includes the JSON in the frontend build. There is no runtime request for it. A new status reaches production only when the frontend is built again after `npm run report:status`.

With `VITE_REPORTS_GATE=hard`, `invoiceV2HardBlocked` then allows that code. Soft mode does not wait for this.

Do not run sign-off to invent an accepted row. Nothing in this pack is accepted.

## Fallback

If a selected v2 invoice throws while it is being built, Generate PDF returns the classic PDF and shows: "Showing the classic invoice. The selected format could not be built."

A hard-gated code that is not accepted is not attempted. Generate stays on classic and does not show that failure notice.

## Manual staging test

1. Deploy with `VITE_REPORTS_ENGINE` unset. Open an invoice and use Generate PDF. The file is the classic invoice.
2. Set `VITE_REPORTS_ENGINE=v2` and leave `VITE_REPORTS_GATE` unset. Open Formats for an invoice. Format 10 shows "approximate, not final" and can be previewed.
3. Force the preview to fail (stop the dev renderer, or pick a code whose spec cannot be built). The screen shows the classic invoice and the notice in Fallback.
4. Set `VITE_REPORTS_GATE=hard` without a rebuilt `accepted` status. The same code shows "format not available yet" and Generate does not run v2.
5. Do not mark a code accepted from this checklist.

## Flow tax vs classic (`tax_amount` vs `tax_total`)

Flow prints header and line **`tax_amount` only** — never `tax_total`. Classic Generate PDF (commercial notes and the classic invoice VAT figure) still reads **`tax_total`**.

On these six live invoices the header has `tax_amount` set and `tax_total` null/absent, so classic Tax prints 0 while flow Tax prints `tax_amount`:

- INV/26/00089
- INV/26/00093
- INV/26/00094
- INV/26/00095
- INV/26/00097
- INV/26/00098

This is an intentional field-mapping difference, not an invented amount. Nothing here is accepted.
