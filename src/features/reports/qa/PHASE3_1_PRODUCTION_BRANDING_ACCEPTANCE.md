# Phase 3.1 — Production PDF Branding Acceptance

**Date:** 2026-11-16
**Baseline:** `PHASE3_BRANDING_SEPARATION_REPORT.md`
**Harness:** `scripts/phase3-1-branding/` → http://127.0.0.1:5203/
**Artifacts:** `qa/phase3-1-branding/`
**Registered org fixture:** `Phase31 Audit Org LLC`

---

## Overall acceptance: **YES**

All formats **advertised as implemented** (`native_layout`) produced Freightnest PDFs with **no Fresa branding markers** and verified organization branding inputs.

### Advertised implemented inventory

| Code | Family | Catalogue status |
| --- | --- | --- |
| `HAWB_DRAFT_REPORT_FORMAT` | hawb | Native Layout (`native_layout`) |
| `HAWB_DRAFT_REPORT_FORMAT_1` | hawb | Native Layout (`native_layout`) |
| `HAWB_DRAFT_REPORT_FORMAT_2` | hawb | Native Layout (`native_layout`) |
| `HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_1` | hawb | Native Layout (`native_layout`) |
| `HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_2` | hawb | Native Layout (`native_layout`) |
| `HBL_DRAFT_REPORT_FORMAT_JASPER` | hbl_jasper | Native Layout (`native_layout`) |

Only `native_layout` (five official HAWB + HBL Jasper pilot) is advertised as implemented. Other families were audited as Freightnest Generate representatives, not as native claims.

---

## Per-format results (Generate / entity-bound)

| Format | Generation source | Pages | Fresa logo detected | Org branding verified | Preview/download | Verdict |
| --- | --- | ---: | --- | --- | --- | --- |
| `HAWB_DRAFT_REPORT_FORMAT` | generateHawbOfficialPdf | 1 | NO | YES | YES | **PASS** |
| `HAWB_DRAFT_REPORT_FORMAT_1` | generateHawbOfficialPdf | 9 | NO | YES | YES | **PASS** |
| `HAWB_DRAFT_REPORT_FORMAT_2` | generateHawbOfficialPdf | 1 | NO | YES | YES | **PASS** |
| `HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_1` | generateHawbOfficialPdf | 1 | NO | YES | YES | **PASS** |
| `HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_2` | generateHawbOfficialPdf | 1 | NO | YES | YES | **PASS** |
| `HBL_DRAFT_REPORT_FORMAT_JASPER` | generateHblJasperPilotPdf | 1 | NO | YES | YES | **PASS** |
| `HBL_DRAFT_REPORT_FORMAT_11` | generateCatalogLayoutPdf:generic | 2 | NO | YES | YES | **PASS** |
| `INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA` | generateCatalogLayoutPdf:generic | 2 | NO | YES | YES | **PASS** |
| `ARRIVAL_NOTICE_REPORT_FORMAT_1_CARGO_ARRIVAL_NOTICE_JASPER` | generateCatalogLayoutPdf:generic | 2 | NO | YES | YES | **PASS** |
| `ARRIVAL_NOTICE_REPORT_FORMAT_11` | generateCatalogLayoutPdf:generic | 2 | NO | YES | YES | **PASS** |
| `DELIVERY_ORDER_REPORT_FORMAT_17` | generateCatalogLayoutPdf:generic | 1 | NO | YES | YES | **PASS** |
| `ADVANCE_SHIPPING_NOTE` | generateCatalogLayoutPdf:generic | 1 | NO | YES | YES | **PASS** |

## Missing organization logo

| Format | Fresa logo detected | Org branding (name, no logo) | Verdict |
| --- | --- | --- | --- |
| `HAWB_DRAFT_REPORT_FORMAT` | NO | YES | **PASS** |
| `HAWB_DRAFT_REPORT_FORMAT_1` | NO | YES | **PASS** |

Empty `logoUrl` must omit the logo and must **not** fall back to Fresa. Organization name is still supplied from the registered profile fields.

## Browse mode (Fresa references allowed)

| Format | Source | Pages | Fresa markers | Verdict |
| --- | --- | ---: | --- | --- |
| `HAWB_DRAFT_REPORT_FORMAT` | fresa_cdn_sample_hawb | 1 | YES (pdfjs text) | **PASS** |
| `HBL_DRAFT_REPORT_FORMAT_JASPER` | fresa_cdn_sample_hbl | 1 | YES (pdfjs text) | **PASS** |
| `DELIVERY_ORDER_REPORT_FORMAT_17` | fresa_cdn_sample_catalog | 1 | YES (pdfjs text) | **PASS** |
| `ADVANCE_SHIPPING_NOTE` | fresa_cdn_sample_catalog | 1 | YES (pdfjs text) | **PASS** |

## Silent fallback / honesty checks

- No Generate run used a `fresa_cdn_sample*` source or embedded Fresa byte/text/metadata markers.
- Catalogue honesty: DO `DELIVERY_ORDER_REPORT_FORMAT_17` / WMS `ADVANCE_SHIPPING_NOTE` remain `official_sample` for browse; Generate uses Freightnest template-v2/JSON when available (not claimed as `native_layout`).
- Arrival `ARRIVAL_NOTICE_REPORT_FORMAT_11` is `shared_layout` (not native).

## Inspection method

For every generated PDF:
1. **pdf-lib** — page count, MediaBox, metadata (title/author/subject/keywords/creator/producer)
2. **Raw byte scan** — `fresa`, `fresatechnologies.com`, `www.fresa`
3. **pdfjs text extraction** — Fresa strings when a text layer exists
4. **Image signature counts** — JPEG/PNG markers (proxy for embedded XObjects)
5. **Source gate** — production function name (`generateHawbOfficialPdf`, Jasper, `generateCatalogLayoutPdf` + `freightnest_generate`)
6. **Org branding proof** — harness records company name / logoUrl actually passed into the generator (html2canvas PDFs have no text layer)
7. **Preview/download** — single returned blob reused for both (byte-identical)

## Limitations

- Some official Fresa CDN samples embed logos as images **without** the string `fresa` in PDF bytes; browse rows may show “NO (image-only)” while still being genuine Fresa samples (source = `fresa_cdn_sample*`).
- Production capture PDFs are image-only; organization name verification uses generator input proof, not OCR.
- Backend pack PDFs are out of FE scope for this audit.

## Artifact index

- `qa/phase3-1-branding/acceptance-manifest.json`
- `qa/phase3-1-branding/production/*.pdf`
- `qa/phase3-1-branding/no-logo/*.pdf`
- `qa/phase3-1-branding/browse/*.pdf`
