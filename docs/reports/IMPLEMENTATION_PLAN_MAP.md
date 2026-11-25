# Map: FRESA Implementation Plan ↔ Kingfisher frontend

Source plan: `Implemntation for report.md` (team guide for catalog, providers, contracts, templates, Playwright renderer).

This repo is the **React frontend only**. NestJS / Prisma / Playwright PDF service live in the backend. Frontend owns discovery UI, client layouts, and browser-side PDF paths.

## Layer map (plan §1)

| Plan layer | Plan owner | Frontend today | Gap |
|---|---|---|---|
| 1. Report Catalog | Shared / BE API | Local registry (852 codes) + permanent JSON layouts (~770 listed) + `/reports/dashboard` Fresa 4-column index + `/reports/catalog` | Full BE catalog API + permissions still optional; FE lists layouts without Import |
| 2. Data Providers | Backend | `resolveCatalogContextPdfData`, `loadInvoiceFlowRecord`, HTML pilot preview | No Nest providers in this repo |
| 3. Report Data Contracts | Shared | Partial: flow record, HTML pilot payload, invoice format data | Not one typed contract per FRESA code |
| 4. Document Templates | Frontend | JSON UI layouts, measured native PDFs, referenceAccurate, HTML pilots, pdfmake flow | Not HTML/CSS-per-code as plan §6; many codes share shells |
| 5. PDF Renderer | Backend Playwright | FE: pdf-lib / pdfmake / print capture; BE packs optional | Single Playwright service is BE work |

## Inventory & specs (plan §2–3)

| Plan deliverable | Status here |
|---|---|
| REPORT-INVENTORY / manifest | Done: `reports/references/manifest.csv`, layouts, code-map (Phase 0 in `PROGRESS.md`) |
| Reference samples pinned | Done: `reports/references/files/` |
| Per-report `report-specs/*.md` | Partial: pilots / measured faces only; not every FRESA link |
| Family clustering | Partial: layout fingerprints (376 unique PDF layouts) |

## Architecture vs plan §4–5

| Plan item | Frontend | Backend (out of repo) |
|---|---|---|
| `GET /reports`, categories, preview/pdf | Browse/enrich via `reportCatalog.service` | Expected; FE works offline from local registry |
| Provider interface + Prisma | — | Required for exact data parity |
| Playwright HTML→PDF | HTML pilots + print client (dev/local) | Production path still pack / FE client |
| Multi-company security | Auth context on API calls | Company scope must stay on BE |

## Frontend UI (plan §6) — current routes

| Route | Role |
|---|---|
| `/reports/dashboard` | Fresa-style index (Sea / Air / Accounts / My Reports); click → format screen |
| `/reports/formats/:code` | One format; **auto-opens** client PDF when a layout/flow path exists |
| `/reports/catalog` | Full catalogue + strips + generate panel |

**Default listing rule:** Formats with a registered FE layout (or client flow code) appear without Import registry, Bind pack, or Activate. Live API only enriches id/active metadata when available.

## Priority (plan §10) vs FE

| Priority | Plan examples | FE state (honest) |
|---|---|---|
| P0 engine pilots | List, HBL, invoice, arrival, multi-page | Pilots exist; none `accepted` in `reports/status.json` |
| P1 freight docs | HBL/HAWB/AN/DO/… | Many listed + client PDF; visual QA incomplete |
| P2 accounts | Invoices, vouchers, TB, P&L | Layout shells + flow invoice/quotation; finance rules are BE |
| P3 ops lists / WMS | DSR, ASN, … | Listed where layouts exist |

## “Same as sample” (plan §1.1 / §7)

Generate never returns a stamped Fresa sample as the product PDF. Client generate uses org branding + open record (or empty slots). Exact overlay QA is still open for almost all codes.

## What “listed by default” means in product

1. Dashboard / catalogue show the permanent layout set without a user Import step.
2. Opening a format auto-builds the Freightnest PDF in the browser when a client path exists (no Activate / Bind required for that path).
3. Optional BE pack remains additive when bound; it is not a gate to see the name in the list.

## Backend handoff (from the same plan)

See plan §§5, 9, 15–16. FE needs stable: report codes, filter DTOs, typed payloads, preview/pdf endpoints, company scope. Do not invent payload keys in templates without an approved contract.
