# Fresa sample-report-formats — page gap note

Source: [Fresa Sample Report Formats](https://fresatechnologies.com/sample-report-formats/)  
Audited: 2026-10-20 via `audit-fresa-format-diversity.mjs` + `audit-report-layout-coverage.mjs`.

## Summary

| Check | Result |
|-------|--------|
| Registry templates | **852** |
| Client JSON layouts (`*FormatUiLayouts.json`) | **852/852** |
| Curated Fresa marketing sample names (diversity audit) | **77/77** matched |
| Registry codes missing layouts | **0** |
| Catalog-only codes without JSON layouts | **3** (analytics) |

## Catalog-only analytics (no client layout PDF)

These live in `otherReportsFormatCatalog.ts` as KPI / exception list tiles — not document PDFs:

1. `JOB_FINANCE_BY_SHIPMENT_DATE_REPORT_FORMAT`
2. `EXCEPTION_REPORT_FORMAT`
3. `KPI_STATUS_BY_COMPLETED_DATE_REPORT_FORMAT`

**Disposition:** keep as analytics / module-report entry points (`covered_analytics`). Do not invent fake document layouts.

## Entity-bound field coverage (this pass)

Layout chrome is complete; the product gap is **live data** into layout slots when opening Reports from a detail page:

| Slot | Expected when entity-bound | Prior gap |
|------|----------------------------|-----------|
| Doc / job / shipment / quote / invoice numbers | From open record | OK for quote/invoice/job; shipment_id ignored |
| Shipper / consignee / bill-to | Party masters | Partial (names only until party enrich) |
| Route (POL/POD), ETD/ETA, commodity | Job / shipment | Job OK; shipment not hydrated |
| Charge / line rows | Invoice / quotation lines | Mapped when present on record |
| Demo placeholders | Must not show when `entityBound` | Enforced in merge path |

## Out of scope (this pass)

- Pixel re-layout of all 852 Fresa PDFs
- Backend Puppeteer pack binding for every code
- Changing default `POST /quotations|invoices/:id/pdf` paths

## Related

- [`REPORT_GAP_MATRIX.md`](./REPORT_GAP_MATRIX.md) — family counts + document vs analytics coverage
- [`FRESA_FORMAT_DIVERSITY_AUDIT.json`](./FRESA_FORMAT_DIVERSITY_AUDIT.json) — name / skeleton audit
