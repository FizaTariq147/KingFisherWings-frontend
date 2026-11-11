# Phase 7 — Financial Validation

**Generated:** 2026-11-11  
**Rule:** Never generate missing balances or tax amounts from layout defaults. Compare report output to source values on the PDF data object.

## Verdict

Fixture **pass-through** checks **passed** for commercial invoice, purchase invoice, vouchers, ledger empty balances, and entity-bound VAT non-invention.  
**Not claimed:** reconciliation against live staging/production API responses (no live backend call in this pass).

## Method

1. Sanitized fixtures mirror `InvoiceFormatPdfData` / catalog resolve shapes (`qa/fixtures/sanitizedCatalogPdfFixtures.ts`).
2. Map via existing mappers (`mapToInvoiceDocViewModel`, `mapToPurchaseInvoiceViewModel`, `mapToVoucherViewModel`, `mapToLedgerViewModel`).
3. Assert output fields equal fixture source strings/arrays — no recomputed tax/total.
4. Entity-bound invoice PDF model path: omit `tax` → `vatAmount` stays 0 (layout `vatRate` must not invent VAT).

Tests: `qa/phase7FinancialValidation.test.ts` + overlapping cases in `qa/phase6Regression.test.ts`.

## Checklist results

| Check | Source fixture field | Report output | Status |
|-------|----------------------|---------------|--------|
| Invoice subtotal | `1350.00` | `model.subtotal` | **Verified** |
| VAT / taxes | `67.50` | `model.tax` | **Verified** |
| Discounts | `0.00` | `model.discount` | **Verified** |
| Grand total | `1417.50` | `model.total` | **Verified** |
| Currency (AED) | `currencyCode` | `model.currencyCode` | **Verified** |
| Purchase subtotal / tax / total | `800.00` / `40.00` / `840.00` | purchase model | **Verified** (no recomputation) |
| Payment voucher Debit | table cell `840.00` | `entryRows[0][2]` | **Verified** |
| Payment voucher Credit | table cell `840.00` | `entryRows[1][3]` | **Verified** |
| Receipt voucher currency / total | USD / `500.00` | receipt model | **Verified** |
| Opening balance | omitted | `undefined` | **Verified** (not invented) |
| Running balance | not supplied as invented series | N/A — rows pass through only | **Verified** (no invention) |
| Closing balance | omitted | `undefined` | **Verified** (not invented) |
| Entity-bound missing tax → VAT | no `tax` on data | `vatAmount === 0`, `grandTotal === 200` | **Verified** |

## Failures

None in this unit pass for financial pass-through.

| Report ID | File | Evidence | Severity | Proposed correction |
|-----------|------|----------|----------|---------------------|
| — | — | — | — | — |

## Blocked / untested

| Item | Reason |
|------|--------|
| Live API invoice/voucher/ledger payloads | No staging fetch; fixtures only |
| Multi-currency edge cases beyond AED + USD fixtures | Only two currencies exercised |
| Discount non-zero entity path | Fixture discount is `0.00`; non-zero discount still requires API to supply `discount` (Phase 6 note) |
| Trial balance / P&L numeric rollups vs GL | Markup family only; no GL source compare |

## Integrity rule confirmation

- Layout `vatRate` is **not** applied when `entityBound: true` (`invoiceFormatToInvoicePdfModel`).
- Ledger opening/closing only when explicitly present on data (no cell-derived invention).
- Purchase enrichment family remains `purchase_invoice` / `invoice.purchase` (regression covered).
