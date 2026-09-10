# FRESA report catalog — gap matrix (Phase 0)

Generated from the local registry in `src/features/reports/data/fresaReportRegistry.json`.

## Architecture preserve rules

- Quotation / invoice / statement **document PDFs** (`pdf-lib` + existing `POST .../pdf`) stay the default.
- Module analytics report pages under `/quotations/reports`, `/gl/*`, etc. stay primary for KPIs.
- Catalog generate is **additive** via `/reports/*` APIs.

## Family counts

| Family | Count | Rollout phase |
|--------|------:|:-------------:|
| Ops lists | 110 | 1 |
| Sea documents | 134 | 2 |
| Air documents | 75 | 3 |
| Quotations | 18 | 3 |
| Commercial / invoices | 99 | 4 |
| Finance & GL | 91 | 5 |
| WMS | 58 | 6 |
| Other | 22 | — |
| **Total** | **607** | |

Gap status (approx.): net_new 381 · partial_document_pdf 161 · partial_analytics 65.

See catalog UI **Gap matrix** toggle, or regenerate via `node scripts/generate-fresa-report-registry.mjs`.

## Rollout waves

| Phase | Family | FE constant |
|-------|--------|-------------|
| 1 | Ops lists | `ACTIVE_REPORT_ROLLOUT_PHASE = 1` |
| 2 | Sea docs | raise after backend pack |
| 3 | Air + quotation formats | |
| 4 | Commercial invoice formats | parallel to default invoice PDF |
| 5 | Finance | wrap GL where possible |
| 6 | WMS | |

## Backend API contract

See plan: `GET /reports/templates`, `GET /reports/templates/:id`, `POST /reports/generate`, `GET /reports/jobs/:id`, download.
