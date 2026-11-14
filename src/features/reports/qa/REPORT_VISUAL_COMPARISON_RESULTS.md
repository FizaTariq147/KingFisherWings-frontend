# Report Visual Comparison Results

**Date:** 2026-11-14  
**Method:** Live local Vite (`http://localhost:5173`) + E2E staff login (`demo-trade-house`) + catalogue Generate/Download + pdfjs text fingerprints + first-page PNG rasters.

**Manifest:** `visual-evidence/FINAL_VISUAL_VERIFY_MANIFEST.json`  
**Raster index:** `visual-evidence/pdf-page-raster-results.json`

## Dual-company branding

| Item | Result |
| --- | --- |
| Company 1 | **Verified** — `GET /organization/profile` → **KingFisher Logistic Solutions LLC**, `logo_url` host `cdn.demo-trade.ae` |
| Company 2 | **Blocked** — `.env.e2e` has only one tenant. No `E2E_TENANT_SLUG_2` / `E2E_STAFF_EMAIL_2` / `E2E_STAFF_PASSWORD_2`. Did not fabricate a second company. |
| HBL Jasper PDF | Downloaded + page1 PNG: registered company name in header/agent/signature; no Fresa product chrome |
| HAWB Draft PDF | Downloaded + page1 PNG: org stamp text includes **KingFisher Logistic Solutions LLC**; official sample still contains Fresa Demo *fixture party* strings (expected sample content) |

Evidence:

- `visual-evidence/branding/company1-hbl-jasper.pdf` + `company1-hbl-jasper-page1.png`
- `visual-evidence/branding/company1-hawb-draft.pdf` + `company1-hawb-draft-page1.png`
- Browser modal screenshots (`*-preview.png`) are headless iframe blanks — **not** used as layout proof; downloaded PDF rasters are authoritative.

### Branding checks (company 1)

| Check | HBL Jasper | HAWB Draft |
| --- | --- | --- |
| Profile company name in PDF | Yes (visible on page1 raster) | Yes (pdf text + stamp) |
| Logo URL from profile | Present (`https://cdn.demo-trade.ae/logo.png`) | Same |
| Graphical logo on page | Not clearly visible on HBL page1 (likely CORS/load omit) | Stamp may omit image if CORS blocks; name stamp present |
| Fresa *product* branding as registered company | No | No (sample body may still say FRESA DEMO as demo parties) |
| Preview vs download same branding source | Same generate path (`resolveReportOrgChrome`) | Same |

## HAWB five official formats

| Official format | Code | Variant | PDF | Page size | Company stamp | Distinct |
| --- | --- | --- | --- | --- | --- | --- |
| HAWB Draft | `HAWB_DRAFT_REPORT_FORMAT` | draft | `hawb/…_format.pdf` | 595×845 | Yes | Yes |
| HAWB Draft-1 | `…_FORMAT_1` | draft1 | `…_format_1.pdf` | 595×842 · 10 pages | Yes | Yes (notify party layout) |
| HAWB Draft-2 | `…_FORMAT_2` | draft2 | `…_format_2.pdf` | 595×845 | Yes | Yes (Air Waybill title) |
| HAWB Original-1 | `…_ORIGINAL_…_1` | original1 | `…_format_1.pdf` | **737×923** | Yes | Yes (preprinted MediaBox) |
| HAWB Original-2 | `…_ORIGINAL_…_2` | original2 | `…_format_2.pdf` | 595×845 | Yes | Yes |

Selector UI named hits = **5** official names (manifest `hawbSelector.namedCount`).  
Historical `HAWB_DRAFT_REPORT_FORMAT_3` deep-link still opens (`hawb/historical-format3-deep-link.png`); not counted as official.

Page1 rasters: `visual-evidence/hawb/*-page1.png`.

## Limitations (honest)

1. Second registered company context unavailable → dual-company isolation not proven.
2. Headless modal iframe screenshots blank; use downloaded PDF + page1 PNG.
3. Graphical logo embed can fail silently on CORS for remote `logo_url`; name/address branding still applied.
4. Unbound HAWB browse uses official Fresa sample PDFs (demo party text remains) + org chrome stamp — not a live-entity JSON shell render in this pass.
