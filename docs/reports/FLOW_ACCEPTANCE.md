# Flow engine acceptance

`INVOICE_FLOW_*` codes use engine `flow` (pdfmake). They are **not** part of the 399 absolute-spec verify set. The six layers (page / geometry / static / dynamic / raster / pagination) do not apply.

## Acceptance criteria

`npm run report:signoff -- <flow-code> <reviewer>` may append a sign-off row only when all of the following hold:

1. **Money reconciliation** — `reports/flow-spike/reconcile-25.json` exists and `summary.recordPass === summary.total` for the 10 real + 15 synthetic invoices (every printed totals row matches the record).
2. **Leak check** — `npm run report:leak-check` is clean (no Fresa / powered-by / raw HTML leaks on wired invoice codes, including flow).
3. **Artifacts for the current template hash** — `reports/flow-spike/demo-vs-reference.png` and `reports/flow-spike/contact-sheet.png` exist, and `reports/flow-spike/template-hash.txt` matches a fresh hash of the flow template sources (`invoice-flow-doc.mjs`, `invoice-flow-options.mjs`, `invoice-flow-style` / style constants, `invoiceFlowStyle.ts`).
4. **Reviewer** — the sign-off command is given a reviewer name; that name is written into `reports/signoff.csv`.

Nothing in this process marks a code `accepted` in catalogue status by itself. Status / threshold / mask / signoff policy elsewhere is unchanged except for this flow-only eligibility path.

## Adding a flow code (title or columns only)

1. Add an entry to `FLOW_INVOICE_OPTIONS` in both:
   - `src/features/reports/flow/invoiceFlowOptions.ts`
   - `tools/reports/invoice-flow-options.mjs`
2. Set `title`, `columns` (preset `format1` / `simple` or an explicit column list), `showContainers`, `showBank`, `showTerms`, `taxMode`, `currency`, `catalogName`.
3. Add the code to `reports/invoice-v2-applicability.json` and `reports/invoice-v2-totals.json` (flow totals profile: subtotal/tax/discount/rounding/total true).
4. Catalogue registration is automatic via `listFlowCatalogEntries()`.
5. Re-run `node tools/reports/flow-spike.mjs` and `node tools/reports/flow-reconcile.mjs`, then refresh the template hash.

## Soft gate

Until signed off, the catalogue shows **approximate, not final**. Failure falls back to the classic invoice PDF.
