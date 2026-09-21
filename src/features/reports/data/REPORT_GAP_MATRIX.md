# FRESA report catalog — gap matrix

Generated from `fresaReportRegistry.json` + permanent JSON layouts.
Master index: `fresaReportCatalogComplete.json` (852 reports).

## Architecture preserve rules

- Quotation / invoice **document PDFs** (`pdf-lib` + existing `POST .../pdf`) stay the default.
- Module analytics screens stay primary for KPIs (`covered_analytics`).
- Catalog generate is **additive** via `/reports/*` + client layout PDF fallback.
- Do not change `ReportGeneratePanel` live generate / bind / activate behaviour.

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

Gap status: covered_document_pdf 787 · covered_analytics 65.

Client layout PDF: **852/852** codes have matchable JSON UI layouts (`*FormatUiLayouts.json`).

## FE document coverage

`covered_document_pdf` means a permanent client JSON layout PDF is available via catalogue Generate.
Default `POST /invoices|quotations/:id/pdf` paths stay preserved.

Full store (787 rows + embedded layouts, additive): `fresaCoveredDocumentReports.json`.
Runtime layouts remain the 13 `*FormatUiLayouts.json` files (**852/852** — do not remove).

## Optional backend (additive)

Live FRESA Puppeteer packs remain optional for print parity. Bind/activate via `GET /reports/templates/renderers` + `suggestedPackKey` in the complete catalog JSON — do not invent `renderer_key` values on the FE.
