# Backend requirements — 100% Fresa visual parity

**Goal:** Every catalogue report PDF/XLSX must look **identical** to the matching Fresa Gold sample (same layout, same colors, same typography, same spacing/tables/borders), with **only** the company logo / legal identity swapped to **KingFisher Wings / tenant org**.

**Reference samples:** https://fresatechnologies.com/sample-report-formats/  
**FE product path:** `POST /reports/generate` → poll → download (catalogue Generate prefers packs; client html2canvas is Dev-only).

Frontend **cannot** deliver 100% Fresa look. Backend Puppeteer (PDF) / Excel (XLSX) packs are mandatory.

---

## Non-negotiable visual acceptance

For each format code bound to a pack, side-by-side QA vs the Fresa sample PDF/XLSX must pass:

| Check | Required |
|-------|----------|
| Page size / orientation | Same as sample (A4 / Letter / landscape where sample is) |
| Margins & column geometry | Same (±1–2mm print tolerance only) |
| Colors | Same hex/CMYK for headers, table fills, rules, accents (copy from sample; do not invent KF theme colors into the form body) |
| Typography | Same family/size/weight hierarchy (or closest embedded web-safe fonts that match metrics) |
| Tables / grids | Same column count, borders, header row style |
| Field placement | Labels and values in the same positions (shipper, consignee, notify, cargo, charges, totals, signatures) |
| Preprinted / form chrome | Boxes, stamps, barcode slots, “ORIGINAL”/“DRAFT” ribbons match sample |
| Logo slot | **Only allowed brand difference:** KingFisher / tenant logo + org name/address/tax IDs — **never** Fresa logo or Fresa company text |
| Empty vs filled | Entity-bound generate fills live data; never leave Fresa demo/sample company names |

**Fail the pack** if colors are “close enough KF blue”, layout is “simplified”, or tables are rebuilt in a different structure.

---

## Preserve (do not break while shipping packs)

| Keep | Notes |
|------|--------|
| `POST /invoices/:id/pdf` | Default invoice button |
| `POST /quotations/:id/pdf` | Default quotation button |
| Classic BL draft path | Until `sea.hbl_*` packs pass visual QA |
| Existing `/reports/*` contracts | Additive packs only |
| Module analytics hubs | Not document PDFs |

Catalogue Format-N is **additive** — never replace default invoice/quotation Generate PDF.

---

## API contract (required)

| # | Endpoint | Requirement |
|---|----------|-------------|
| 1 | `GET /reports/templates` | Search name+code+description; `family`, `context`, `include_inactive`, paging |
| 2 | `GET /reports/templates/:idOrCode` | Parameter schema for Generate |
| 3 | `POST /reports/templates/import` | Import all **852** FE registry codes as `pending.{CODE}` until bound |
| 4 | `GET /reports/templates/renderers` | List **every** implemented pack key |
| 5 | `POST /reports/templates/:code/bind-renderer` | `{ renderer_key, activate?: true }` — key must exist on `/renderers` |
| 6 | `POST /reports/templates/:code/activate` | Reject `pending.*` |
| 7 | `POST /reports/generate` | Real PDF/XLSX bytes from pack + live context; **no stub/fake PDF** |
| 8 | `GET /reports/jobs/:id` + `/download` | Poll + file download |

Generate body must accept context: `job_id`, `quotation_id`, `invoice_id`, `party_id`, `shipment_id` (+ list filters from schema).

Missing required entity → **clear 4xx** (`invoice_id required`, `job not found`). Never invent demo text when entity-bound.

---

## Branding injection (every pack)

Resolve from tenant organization / company profile on each generate:

- `logo_url` or `logo_base64` (fallback: platform KingFisher logo)
- `legal_name` / `trade_name`
- address, phone, email, web
- `tax_id` / `vat_number` / `gstin`
- bank details when the Fresa sample shows them

Replace **only** the sample’s logo + company identity blocks. Keep Fresa form colors/layout.

FE reference: `src/features/reports/constants/reportBranding.constants.ts`.

---

## Context data loaders (required for dynamic data)

| Loader | Used by | Must include |
|--------|---------|--------------|
| `loadInvoiceReportContext(invoice_id)` | Invoice Format 1–21, debit/credit | Header, bill-to, lines, tax, totals, currency, job refs |
| `loadQuotationReportContext(quotation_id)` | Quotation formats | Parties, lane, lines, validity, currency |
| `loadJobDocumentContext(job_id)` | HBL/HAWB/MAWB, arrival, DO, manifests, pre-alert | Parties, route, dates, containers, cargo, charges, houses, BL/AWB numbers |
| `loadShipmentReportContext(shipment_id)` | Manifests / linked docs | Resolve job(s) → job loader |
| `runOpsListQuery(code, filters)` | MY REPORTS | Real filtered rows (dates, branch, status, etc.) — not empty shells |
| WMS / GL loaders | ASN/GRN/GDO, vouchers | Document + lines |

---

## Pack shells (one pack → many codes) — rollout for 100% coverage

Source taxonomy: `fresaReportCatalogComplete.json` (**852** codes).  
Shell keys: `src/features/reports/constants/fresaCorePackShells.constants.ts`.

### Phase 1 — pipeline (must smoke with entity deep-link)

| Pack key | Sample to match | Context |
|----------|-----------------|---------|
| `sea.hbl_draft` | HBL Draft Report Format (Jasper / Format-*) | `job_id` |
| `air.hawb_draft` | HAWB Draft Report Format* | `job_id` |
| `commercial.invoice_tax_india_1` | Invoice Report Format-1 Tax Invoice India | `invoice_id` (**additive**) |
| `ops.list_generic` | MY REPORTS XLSX lists | filters only |

### Phase 2 — core docs

`sea.hbl_original`, `sea.arrival_notice`, `sea.cargo_manifest`, `sea.delivery_order`,  
`air.mawb_draft`, `air.arrival_notice`, `air.delivery_order`, air manifests,  
`quotation.shell` (air/sea quotation samples).

### Phase 3 — commercial / finance (additive)

Per-invoice Format 2–21 shells (or shared shell + format variant CSS), proforma, debit/credit,  
`finance.journal_voucher`, `finance.payment_voucher`, `finance.receipt_voucher`, `finance.outstanding_letter`.

### Phase 4 — lists complete

All `ops_list` / `*_LIST_*` codes on `ops.list_generic` with **per-code column config** matching Fresa XLSX headers/colors.

### Phase 5 — WMS + other + long tail

`wms.asn`, `wms.grn`, `wms.gdo`, booking confirmation, pre-alert; map every remaining `pending.{CODE}` to a shell.

### Auto-map on import

```text
HBL_DRAFT_* / FG_HBL_*              → sea.hbl_draft / sea.hbl_original
ARRIVAL_NOTICE_*                     → sea.arrival_notice | air.arrival_notice
DELIVERY_* / PROOF_OF_*              → sea.delivery_order | air.delivery_order
HAWB_* / MAWB_*                      → air.hawb_draft / air.mawb_draft
*_LIST_* / DAILY_STATUS_*            → ops.list_generic
INVOICE_REPORT_FORMAT_1_TAX_*        → commercial.invoice_tax_india_1
INVOICE_REPORT_FORMAT_*              → commercial.invoice_* variant
QUOTATION_*                          → quotation.shell
JOURNAL_* / PAYMENT_* / RECEIPT_*    → finance.*
ASN / GRN / GDO                      → wms.*
```

Never overwrite an already-bound real pack with `pending.*`.

---

## Per-pack build checklist (mandatory)

1. Download the matching PDF/XLSX from the Fresa sample page.  
2. Rebuild as HTML/CSS (Puppeteer) or Excel template — **pixel match** colors, borders, fonts, spacing.  
3. Wire logo + org identity slots to tenant branding.  
4. Wire data loader for the pack’s context ids.  
5. Register on `GET /reports/templates/renderers`.  
6. Bind + activate template code(s).  
7. `POST /reports/generate` with real `job_id` / `invoice_id` / filters.  
8. Visual QA: overlay or side-by-side vs Fresa sample → **pass/fail**.  
9. Regression: default invoice/quotation PDF + prior packs still work.

---

## Definition of done (product)

- [ ] All **852** registry codes either bound to a visually QA’d pack or explicitly `covered_analytics` (no fake document PDF).  
- [ ] Entity-bound generate uses **that** invoice/quotation/job only.  
- [ ] Side-by-side vs Fresa samples passes for each shipped pack (layout + **same colors** + same UI).  
- [ ] Logo/identity is KingFisher/tenant only.  
- [ ] Unbound/`pending` formats return clear errors — never stub success.  
- [ ] Default invoice/quotation PDFs and classic BL still work.

Until the checklist above is complete on **backend**, reports are **not** 100% Fresa — FE only routes to packs.

---

## FE files for BE handoff

| File | Role |
|------|------|
| `src/features/reports/data/BACKEND_REPORT_CATALOG_API.md` | Full API contract |
| `src/features/reports/constants/fresaCorePackShells.constants.ts` | Pack keys |
| `src/features/reports/constants/reportBranding.constants.ts` | KF branding fields |
| `src/features/reports/constants/reportPreserveMatrix.ts` | Preserve + layout freeze |
| `src/features/reports/data/fresaReportCatalogComplete.json` | 852 codes + suggestedPackKey |
| `src/features/reports/utils/documentPdfPreserve.ts` | Do not replace default PDFs |
