# REPORT_DATA_MAPPING_AUDIT — Financial & operational field correctness

**Phase:** 6  
**Evidence:** Code inspection of `mappings/fromCatalogPdfData.ts`, `resolveCatalogContextPdfData.ts`, `invoiceFormatToInvoicePdfModel.ts`, `generateInvoiceFormatLayoutPdf.ts`.  
**No live backend invoice/job fixtures were executed in this pass.**

## Verdict

Template-v2 mappings **pass through** string fields from catalogue context when present. They do **not** independently verify arithmetic against backend. Several fields are missing, heuristic, or hardcoded — **do not assume calculations are correct because the PDF renders**.

## Field coverage

| Concern | Source of truth in FE | Verified against backend? | Finding |
|---------|----------------------|---------------------------|---------|
| Invoice subtotal | `data.subtotal` from context / invoice record | Partial — mapped when API returns it | OK when entityBound + invoice hydrate |
| Tax | `data.tax` / `tax_total` | Partial | OK when provided |
| Discount | `invoiceFormatToInvoicePdfModel` sets `discount: 0` | **No** | Pre-existing defect |
| Grand total | `data.total` or `subtotal + vat` recompute | **Risky** | Recompute when tax missing |
| Currency | `currencyCode` | Pass-through | OK |
| Debit / credit | Not in `resolveCatalogContextPdfData` | **Missing** | Ledger cannot show true Dr/Cr from API |
| Opening / closing balance | Heuristic from first/last table cell | **Invented** | Recent mapping defect |
| Running balance | Not computed | N/A | Not implemented |
| Shipment weight / pkgs | `tableRows` / commodity only | Pass-through if present | No dedicated weight field in view models |
| Dates / identifiers | jobNumber, shipmentNumber, etd, eta, referenceNo | Pass-through | OK when context resolves |

## Failures

| Report ID | File path | Issue | Severity | Recommended correction | Recent? |
|-----------|-----------|-------|----------|------------------------|---------|
| INVOICE_* / commercial | `utils/invoiceFormatToInvoicePdfModel.ts` | `discount: 0` always; may recompute VAT from `vatRate` when tax absent | high | When `entityBound`, never invent discount/VAT; require backend totals | no |
| ledger / financial_statement | `mappings/fromCatalogPdfData.ts` | opening/closing from table cell heuristics | high | Omit or N/A unless API fields exist | **yes** |
| DELIVERY_ORDER_* | `mappings/fromCatalogPdfData.ts` | `deliveryInstructions: data.commodity` | medium | Do not map commodity → instructions | **yes** |
| HAWB_* entity-bound | `generateCatalogLayoutPdf.ts` | Sample PDF used instead of live mapped data | critical | Skip sample when `entityBound` | **yes** |
| All template-v2 | `mappings/types.ts` | No discount / weight / balance fields on view models | medium | Extend only when API provides values | yes |

## Sample PDF vs transaction data

| Path | Live data? | Risk |
|------|------------|------|
| HBL unbound sample | Demo/sample only | Expected for browse |
| HBL bound → `hblMode: 'classic'` | Uses catalogue context overlay | OK if classic model filled |
| HAWB sample (bound or not) | **Stamp only** — no field overlay into Fresa PDF | **Critical** when entityBound |
| Pack generate | Backend loaders | Preferred for live product print when pack ready |

## Recommendation

Treat catalogue Generate with `job_id`/`invoice_id` as **pack-first** for product print; keep CDN samples for unbound browse only.
