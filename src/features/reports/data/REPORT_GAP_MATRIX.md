# FRESA report catalog — gap matrix (Phase 0)

Generated from the local registry in `src/features/reports/data/fresaReportRegistry.json`.

## Architecture preserve rules

- Quotation / invoice / statement **document PDFs** (`pdf-lib` + existing `POST .../pdf`) stay the default.
- Module analytics report pages under `/quotations/reports`, `/gl/*`, `/warehouse/stock` stay primary for KPIs.
- Catalog generate is **additive** via `/reports/*` APIs + client layout PDF fallback.
- `covered_analytics` = module screen is the live implementation; catalogue still offers layout preview PDF.

## Family counts

| Family | Count |
|--------|------:|
| air_docs | 75 |
| commercial | 205 |
| finance | 93 |
| ops_list | 114 |
| other | 30 |
| quotation | 18 |
| sea_docs | 256 |
| wms | 61 |
| **Total** | **852** |

Gap status: partial_document_pdf 787 · covered_analytics 65.

Analytics gap close: 65 → covered_analytics · 51 existingPath updates.

## Backend remaining

Live FRESA Puppeteer packs (`partial_document_pdf` → `covered_document_pdf`) still require backend pack bind/activate.
