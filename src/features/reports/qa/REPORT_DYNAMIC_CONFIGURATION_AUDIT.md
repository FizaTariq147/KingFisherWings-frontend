# Dynamic Report Configuration Audit

**Date:** 2026-11-14

## Architecture (preserve — do not duplicate)

| Layer | Location | Role |
| --- | --- | --- |
| Registry | `fresaReportRegistry` / generated | 852 codes, families, params |
| Family catalogues | `*FormatCatalog.ts` | User-facing lists + sample URLs |
| JSON layouts | `*FormatUiLayouts*.ts` | Theme, branding shell, blocks, demo |
| Shared renderer | `JsonInvoiceLayoutRenderer` | Block composition |
| Family shells | `HblBlShell`, `HawbAwbShell`, … | Reference-shaped forms |
| Template v2 | `engines/preview/renderTemplateV2Pdf` | React docs + mappings |
| Classic HBL families | `generateHblFamilyClassicPdf` | Live-data fallback |
| Jasper pilot | `templates/hbl/jasperPilot` | Config-driven HBL_DRAFT_REPORT_FORMAT_JASPER |
| Data resolver | `resolveCatalogContextPdfData` | Jobs/shipments/parties → InvoiceFormatPdfData |
| Org chrome | `resolveReportOrgChrome` / `applySharedLayoutChrome` | Registered company branding |
| Sample path | `generateHblSamplePdf` / HAWB / DO-WMS | Official CDN PDF + stamp |
| Preview | `PdfViewerModal`, Jasper `HblJasperPilotPreview` | Zoom / print / download |
| PDF capture | html2canvas + jsPDF / pdf-lib stamp | Client layout PDFs |

## Configuration capabilities (existing)

`InvoiceFormatUiLayout` already covers paper, orientation, theme, branding, demo field maps, and ordered `blocks` (visibility via block presence). Jasper pilot extends this with explicit section/field visibility, column templates, typography, borders, spacing, table widths, margins, page-break policy.

Conceptual `ReportLayoutConfig` in the brief maps onto:

- Existing `InvoiceFormatUiLayout` for most families
- `HblJasperPilotConfig` for the Jasper pilot

**Do not invent a second parallel schema** — extend these backward-compatibly when needed.

## Data-driven rules

- Fields map through `InvoiceFormatPdfData` / classic BL model / template-v2 view models.
- No invented API endpoints.
- Branding from organization profile only (this task).
- Missing values: blank (not fabricated PREPAID/DRAFT/em-dash on Jasper pilot; other classic paths may still use `—` in shared family docs — residual).

## Gaps

1. Many Format-N codes share one JSON shell (alias honesty already documented in Phase 2).
2. Catalogue still lists unverified HAWB extras (cleanup awaits approval).
3. Not every family has Jasper-level section config yet — incremental, not a rewrite.
4. Print CSS isolation exists for Jasper (`hblJasperPilot.print.css`); other families rely on Tailwind/inline capture styles.

## Safe branding integration point

All families should continue to receive chrome via:

1. `resolveReportOrgChrome()`
2. Merge onto `InvoiceFormatPdfData` (`companyName`, `logoUrl`, …)
3. `applySharedLayoutChrome` for JSON layouts
4. `logoUrl` into template-v2 / Jasper

No per-report hardcoded company identity going forward.
