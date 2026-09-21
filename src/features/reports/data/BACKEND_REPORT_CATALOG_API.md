# FRESA Report Catalog — Backend API Contract

**Status:** Live on Swagger tag **Reports — Catalog**  
Base: `https://kingfisherwings-backend.onrender.com` (tenant Bearer auth)

Frontend catalog UI: `/reports/catalog` (FRESA-like **Sample report formats** browse)  
Client: `src/features/reports/api/reportCatalog.api.ts` + `reportCatalog.service.ts`

Restart the API after deploy so Swagger picks up new routes.

---

## Preserve existing report functionality (do not regress)

Catalog work is **additive only**. Backend must keep all previously implemented report/PDF behaviour working:

| Must keep unchanged | Notes |
|---------------------|--------|
| `POST /invoices/:id/pdf` | Default invoice PDF (staff + existing clients) |
| `POST /quotations/:id/pdf` | Default quotation PDF |
| Portal / vendor PDF flows | Existing download/generate paths |
| Live catalog endpoints below | `GET/POST /reports/templates*`, generate, jobs, download — keep contracts stable |
| Already-bound packs / activated templates | Do not unbind or rename keys without a migration |
| Existing `ops.*` / `sea.*` (and any shipped) pack keys | Keep generating; new packs are additive |

**Do not:** replace default invoice/quotation PDF buttons with catalog Format-N; remove or break `/reports/*` routes already in use; require FE to invent `renderer_key` values.

FE preserve reference: `src/features/reports/utils/documentPdfPreserve.ts`.

---

## Backend requirements (checklist)

FE status (do not re-do on BE / do not regress catalogue Generate):
- Catalogue browse, strips, Import registry (**852** codes)
- Client layout PDF for **all 852** codes (`*FormatUiLayouts.json` + `generateCatalogLayoutPdf`) — **do not remove**
- Master index: `src/features/reports/data/fresaReportCatalogComplete.json` (layoutStore + suggestedPackKey)
- Covered document store: `src/features/reports/data/fresaCoveredDocumentReports.json` (**787** rows with full JSON layouts embedded; additive)
- Analytics hub links (`covered_analytics` = 65)
- Document formats covered on FE (`covered_document_pdf` = **787**) via client JSON layouts
- Preserve: `POST /invoices|quotations/:id/pdf` + live `POST /reports/generate` when pack bound

**BE optional (additive):** live FRESA-like PDF bytes via Puppeteer packs (`suggestedPackKey` in complete catalog JSON). Client layout PDF already closes the FE document gap — packs are print-parity only, not a blocker for catalogue coverage.

### A. Preserve (must not break)

| Keep unchanged | Notes |
|----------------|--------|
| `POST /invoices/:id/pdf` | Default staff/portal invoice PDF |
| `POST /quotations/:id/pdf` | Default quotation PDF |
| Portal / vendor PDF flows | Existing download paths |
| Existing `/reports/*` contracts | List, detail, import, bind, activate, generate, jobs, download |
| Already-bound pack keys | Additive only — no rename/remove without migration |

### B. API contract hardening

| # | Requirement |
|---|-------------|
| 1 | `GET /reports/templates` — search matches **name + code + description** (case-insensitive; space tokens = AND); support `include_inactive`, `family`, `context`, paging (`limit` max 200) |
| 2 | `GET /reports/templates/:idOrCode` — return parameter schema for Generate form |
| 3 | `POST /reports/templates/import` — accept full FE registry (**852** codes); new rows `renderer_key=pending.{CODE}` until bound |
| 4 | `GET /reports/templates/renderers` — expose **every** implemented pack (`ops.*`, `sea.*`, `air.*`, `commercial.*`, `finance.*`, `wms.*`, `other.*`) |
| 5 | `POST /reports/templates/:code/bind-renderer` — `{ renderer_key, activate?: true }`; key must be from `/renderers` |
| 6 | `POST /reports/templates/:code/activate` — only if renderer is **not** `pending.*` |
| 7 | `POST /reports/generate` → job poll → download — real PDF bytes; clear 4xx if pack/data missing (**no fake PDF**) |

### C. Puppeteer packs (priority shells — one pack → many codes)

Ship in this order (matches FE `reportRollout.constants.ts` / `fresaPdfParity.constants.ts`):

| Phase | Family | Formats left (~) | Suggested pack keys / shells |
|------:|--------|-----------------:|------------------------------|
| 1 | `ops_list` | 113 | `ops.list_generic` — DSR, pending/job status, one-off lists (column config per code) |
| 2 | `sea_docs` | 256 | `sea.hbl_draft`, `sea.arrival_notice`, `sea.cargo_manifest`, `sea.delivery_order`, letter shells (FCR, VGM, ISF, stuffing, …) |
| 3 | `air_docs` + `quotation` | 75 + 18 | `air.hawb_draft`, `air.mawb_draft`, `air.delivery_order`, air arrival/manifest; quotation shell |
| 4 | `commercial` | 205 | Start `commercial.invoice_tax_india_1`; then invoice / proforma / debit / credit shells (**additive** — do not replace default invoice PDF) |
| 5 | `finance` (vouchers/letters) | 44 | `finance.journal_voucher`, `finance.payment_voucher`, `finance.receipt_voucher`, `finance.outstanding_letter`, GL listing |
| 6 | `wms` | 46 | `wms.asn`, `wms.grn`, `wms.gdo` (+ ASN location/summary variants) |
| — | `other` | 30 | Booking confirmation, pre-alert shells |

**Per pack checklist**

1. HTML/CSS matching FRESA sample (margins, header, logo, tables, field placement).  
2. Register on `GET /reports/templates/renderers`.  
3. Data loader from template params: `job_id`, `invoice_id`, `quotation_id`, `party_id`, date range, `branch_id`, ASN id, list filters + tenant branding (logo, legal name, address, GSTIN/VAT, bank).  
4. Smoke: bind → activate → generate → download → visual check vs FRESA sample.  
5. Prefer **one pack → many template codes** when layouts share structure.  
6. Regression: default invoice/quotation PDFs + previously activated packs still work.

### D. Auto-map `pending.{CODE}` → pack (recommended)

On import/activate, if a rule matches set real `renderer_key`; unmatched stay `pending.{CODE}` / inactive. Never overwrite an already-bound real pack with `pending.*`.

```text
HBL_DRAFT_* / FG_HBL_*                   → sea.hbl_draft / sea.hbl_original
ARRIVAL_NOTICE_* / FG_ARRIVAL_*          → sea.arrival_notice | air.arrival_notice
DELIVERY_* / FG_DELIVERY_* / PROOF_OF_*  → sea.delivery_order | air.delivery_order
HAWB_* / MAWB_*                          → air.hawb_draft / air.mawb_draft
*_LIST_* / DAILY_STATUS_* / JOB_STATUS_* → ops.list_generic
INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA → commercial.invoice_tax_india_1
INVOICE_REPORT_FORMAT_*                  → commercial.invoice_* (per shell)
PROFORMA_* / DEBIT_NOTE_* / CREDIT_NOTE_* → commercial.*
JOURNAL_* / PAYMENT_* / RECEIPT_* / OUTSTANDING_LETTER_* → finance.*
ADVANCE_SHIPPING_NOTE* / WMS_GRN_* / WMS_GDO_* → wms.asn* / wms.grn / wms.gdo
BOOKING_CONFIRMATION_* / PRE_ALERT_*     → other.* (or sea/air pre-alert shells)
QUOTATION_REPORT_FORMAT_*                → commercial.quotation or ops.quotation shell
```

### E. Explicit non-goals

- No Jasper upload; do not scrape Fresa sample site into the API.  
- FE client layout PDF closes catalogue document coverage (`covered_document_pdf`); BE packs remain optional for live print parity and must not rely on FE mock data.  
- Do not replace module analytics screens (P&L, trial balance, AR/AP aging, WMS stock) — those are `covered_analytics` on FE hubs.

FE handoff: `src/features/reports/constants/fresaPdfParity.constants.ts`,  
`src/features/reports/data/fresaReportRegistry.json` (852),  
`src/features/reports/data/REPORT_GAP_MATRIX.md`.

---

## Dynamic catalog search (required for correct FE search)

Catalog UI search must be driven by the templates API. Do **not** break existing list/generate/download behaviour — only make `search` reliable and complete.

### Endpoints

| Method | Path | Role in search flow |
|--------|------|---------------------|
| `GET` | `/reports/templates` | **Primary search** — `?search=&family=&context=&include_inactive=&page=&limit=` |
| `GET` | `/reports/templates/:idOrCode` | Detail after user selects a row |
| `POST` | `/reports/templates/import` | Ensure all FRESA format codes exist so search can find them |
| `GET` | `/reports/templates/renderers` | Pack keys (unchanged) |
| `POST` | `/reports/generate` | Generate after select (unchanged) |
| `GET` | `/reports/jobs/:jobId` | Poll (unchanged) |
| `GET` | `/reports/jobs/:jobId/download` | Download (unchanged) |

### `GET /reports/templates` search contract

- `search` — case-insensitive match on **`name`**, **`code`**, and **`description`**
- Space-separated tokens = **AND** (every token must match)
- `include_inactive=true` must return matching inactive/pending formats (FE shows them in catalog)
- `family`, `context`, `page`, `limit` (max 200) — unchanged
- Empty `search` = full list (existing behaviour)
- Unknown/empty results → `data: []`, `meta.total: 0` (never 500)

Example:

```http
GET /reports/templates?search=hbl%20draft&include_inactive=true&page=1&limit=200
```

### Correct flow (preserve existing PDFs)

1. User types in `/reports/catalog` → FE debounces → URL `q`  
2. FE calls `GET /reports/templates?search={q}&include_inactive=true` (+ family/context)  
3. List + strips show matches  
4. Select code → `GET /reports/templates/:code`  
5. If pack bound → `POST /reports/generate` → poll → download  
6. Keep `POST /invoices/:id/pdf` and `POST /quotations/:id/pdf` unchanged  

### Backend checklist so search is complete

1. `POST /reports/templates/import` — full FE registry (**852** codes: Invoice, Accounts, WMS, Arrival, DO, HAWB, HBL, Ops, Quotation, Other, leftover)  
2. Search indexes `name` + `code` + `description` (not code-only)  
3. Stable `meta.total` / `meta.totalPages` for multi-page browse  

Until every format code is imported, FE may still merge local format catalogs as a fallback.

---

## Exact FRESA UI for every report — how

| Surface | “Like FRESA?” | Owner |
|---------|---------------|--------|
| Catalog browse (names, sections) | FRESA-like listing | Frontend (done) |
| Generated PDF / print layout | Pixel match to FRESA samples | **Backend Puppeteer packs only** |

Until a pack exists, imported rows stay `renderer_key=pending.{CODE}` / inactive and Generate correctly fails.

---

## Backend workstream A — Priority families + Puppeteer packs

Implement packs in **kingfisherwings-backend** in this order (matches FE `reportRollout.constants.ts`). **Ship new packs without removing or renaming existing ones.**

| Phase | Family | Formats left (~) | Pack approach |
|-------|--------|-----------------:|---------------|
| 1 | `ops_list` | 113 | Shared list/table HTML shell; column config per code |
| 2 | `sea_docs` | 256 | HBL + Arrival Notice + Delivery Order + manifest shells; many codes → few packs |
| 3 | `air_docs` (+ quotation) | 75 + 18 | HAWB/MAWB / air notice / air DO / quotation shells |
| 4 | `commercial` | 205 | Invoice-format packs (**additive**; keep `POST /invoices/:id/pdf`) |
| 5 | `finance` (vouchers/letters) | 44 | Outstanding letter / journal / payment / receipt / GL listing packs |
| 6 | `wms` | 46 | ASN / GRN / GDO packs |
| — | `other` | 30 | Booking confirmation / pre-alert shells |

Per pack checklist:

1. HTML/CSS matching FRESA sample (margins, headers, logos, tables, field placement).
2. Register key so it appears on `GET /reports/templates/renderers`.
3. Query/data loader for parameters from template schema.
4. Smoke: bind → activate → `POST /reports/generate` → download → visual diff vs FRESA sample.
5. Prefer **one pack → many template codes** when layouts share structure (e.g. all HBL Draft-* → `sea.hbl_draft`).
6. Regression check: existing invoice/quotation PDFs and previously activated catalog templates still work.

---

## Backend workstream B — Expose packs + map `pending.{CODE}`

### Expose

- Every implemented pack key must be returned by `GET /reports/templates/renderers`.
- FE dropdown only lists those keys (never invents `renderer_key`).

### Map imported templates

On import, new rows typically get `renderer_key=pending.{CODE}`. To make a format generate FRESA-like PDFs:

**Option 1 — Manual (FE already supports)**  
`POST /reports/templates/:code/bind-renderer` with `{ "renderer_key": "<from /renderers>", "activate": true }`.

**Option 2 — Backend auto-bind (recommended for scale)**  
Maintain a map `template_code → renderer_key` (or regex/family rules), e.g.:

```text
HBL_DRAFT_* / FG_HBL_*                   → sea.hbl_draft / sea.hbl_original
ARRIVAL_NOTICE_* / FG_ARRIVAL_*          → sea.arrival_notice | air.arrival_notice
DELIVERY_* / FG_DELIVERY_* / PROOF_OF_*  → sea.delivery_order | air.delivery_order
HAWB_*                                   → air.hawb_draft
DSR_* / OPS_LIST_* / JOB_LIST_*          → ops.list_generic
INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA → commercial.invoice_tax_india_1
INVOICE_REPORT_FORMAT_*                  → commercial.invoice_* (per format pack)
JOURNAL_/PAYMENT_/RECEIPT_* / *_AGING_*  → finance.*
ADVANCE_SHIPPING_NOTE*                   → wms.asn*
```

On `POST …/import` or `POST …/activate`, if a rule matches, set real `renderer_key` instead of leaving `pending.*`. Unmatched codes stay pending. Do not overwrite an already-bound real pack key with `pending.*`.

### Activate gate

- Only activate when `renderer_key` is a real pack (not `pending.*`).
- Generate must fail clearly if pack missing — FE must not fake PDF bytes.

---

## FE vs BE split (PDF “like FRESA”)

| Layer | Responsibility |
|-------|----------------|
| **Frontend** | List/import templates; FRESA-style sectioned browse; schema-driven params; bind pack keys from `/renderers`; generate → poll → **PdfReadyModal** (no `/files` redirect). Demo JSON layouts are preview-only. |
| **Backend** | Implement/expand Puppeteer packs; map `pending.{CODE}` → packs; render PDF bytes that match FRESA samples — without breaking default document PDFs or existing packs. |

---

## Endpoints (live)

### 1. `GET /reports/templates`

Paginated template list. Params: `page`, `limit` (max 200), `search`, `family`, `context`, `include_inactive`.

FE browse loads multiple pages (capped) for sectioned listing.

**Search:** `search` must match `name` + `code` + `description` (case-insensitive; space-separated tokens = AND). See **Dynamic catalog search** above. Do not change response shape.

### 2. `GET /reports/templates/:idOrCode`

Detail + parameter schema (UUID or `code`).

### 3. `POST /reports/templates/import` → **201**

Import FRESA registry (inactive unless pack-protected). Body: array or `{ templates: [] }`.  
New rows typically get `renderer_key=pending.{CODE}` until bound.

### 4. `GET /reports/templates/renderers`

List **implemented** Puppeteer data-pack keys (for bind / activate). Not Jasper upload.

### 5. `POST /reports/templates/:code/bind-renderer` → **201**

`BindRendererDto`:

```json
{
  "renderer_key": "ops.delivered_jobs_period",
  "activate": true,
  "formats": ["PDF"]
}
```

- `renderer_key` required — must be from `/renderers`
- `activate: true` — one-shot bind + activate for FE

### 6. `POST /reports/templates/:code/activate` → **201**

Optional `ActivateTemplateDto`:

```json
{ "renderer_key": "ops.delivered_jobs_period" }
```

If still `pending.*`, pass `renderer_key` to bind+activate.

### 7. `POST /reports/templates/:code/deactivate` → **201**

### 8. `POST /reports/generate` → **201**

`ReportGenerateDto`: `format` required; `template_id` and/or `code`; `parameters`; `context`.

### 9. `GET /reports/jobs/:jobId`

### 10. `GET /reports/jobs/:jobId/download`

---

## Frontend flow (unchanged — catalog generate remains additive)

1. **Import registry** (batched)  
2. **Include inactive** (default on) → sectioned Live browse by API family  
3. Select format → Pick pack from **Puppeteer pack** dropdown (`GET …/renderers`)  
4. **Bind pack + Activate**  
5. **Generate** → poll → **PdfReadyModal** (preview / download)

Only templates whose codes map to an existing pack can render FRESA-like PDFs. Other FRESA names stay pending until backend adds more packs.

**Preserve:** `src/features/reports/utils/documentPdfPreserve.ts` (quotation/invoice pdf-lib + existing `POST …/pdf`). Catalog Format-N must never replace those defaults.

---

## Dynamic commercial invoice formats (Format-1 first)

Layouts are **backend Puppeteer packs**. FE never hardcodes FRESA invoice HTML/React.  
Default `POST /invoices/:id/pdf` + client pdf-lib stay unchanged. Catalog Format-N is **additive**.

### Shared payload: `InvoiceFormatPayload`

One JSON view-model drives every commercial invoice format. Each format is only a `format_key` / template `code` + HTML pack.

```ts
type InvoiceFormatPayload = {
  format_key: string; // e.g. commercial.invoice_tax_india_1
  template_code: string; // e.g. INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA
  company: {
    name: string;
    address_lines: string[];
    logo_url?: string;
    website?: string;
    gstin?: string; // or vat_number mapped
  };
  bill_to: {
    name: string;
    address_lines: string[];
    phone?: string;
    gstin?: string;
  };
  invoice: {
    number: string;
    invoice_date: string;
    due_date?: string;
    status?: string;
    currency_code: string;
    exchange_rate: number;
    remarks?: string;
    narration?: string;
  };
  shipment?: {
    shipper?: string;
    consignee?: string;
    job_no?: string;
    shipment_no?: string;
    mbl_mawb?: string;
    hbl_hawb?: string;
    place_of_receipt?: string;
    por?: string;
    pol?: string;
    pod?: string;
    place_of_delivery?: string;
    vessel_voyage?: string;
    etd?: string;
    eta?: string;
    igm?: string;
    reference_no?: string;
    inco_terms?: string;
  };
  containers: Array<{
    container_no: string;
    type?: string;
    pieces?: string;
    gross_weight?: string;
    volume?: string;
    volume_weight?: string;
  }>;
  lines: Array<{
    description: string;
    sac_hsn?: string;
    qty: number;
    amount_per_qty: number;
    currency: string;
    exchange_rate: number;
    fcy_amount: number;
    taxable_amount: number;
    non_taxable_amount: number;
    sgst_rate?: number;
    sgst_amount?: number;
    cgst_rate?: number;
    cgst_amount?: number;
    igst_rate?: number;
    igst_amount?: number;
    total_inr: number;
  }>;
  totals: {
    taxable: number;
    non_taxable: number;
    sgst: number;
    cgst: number;
    igst: number;
    grand_total: number;
    amount_in_words: string;
    tax_buckets?: Array<{ label: string; amount: number }>;
  };
  terms: string[];
  bank?: {
    beneficiary_name?: string;
    bank_name?: string;
    account_no?: string;
    iban?: string;
    swift?: string;
    address?: string;
  };
  footer?: {
    created_by?: string;
    generated_at?: string;
    timezone?: string;
  };
};
```

**Generate (preferred):**  
`POST /reports/generate` with  
`code=INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA`,  
`parameters.invoice_id` / context `invoice_id` — pack loads payload server-side.

**Optional debug:**  
`GET /invoices/:id/format-payload?format=INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA`

### Format-1 Tax Invoice India — pack checklist

Sample PDF: https://fresatechnologies.com/wp-content/uploads/report-formats/invoice-report-format-1-tax-invoice-india.pdf  

| # | Section |
|---|---------|
| 1 | Company header (logo, legal name, address, web) |
| 2 | Title bar TAX INVOICE |
| 3 | Bill To (name, address, phone, GSTIN) |
| 4 | Invoice No./Date, Due Date, status |
| 5 | Shipment grid (shipper, consignee, job/shipment, MBL/HBL, POR/POL/POD, vessel, ETD/ETA, currency, INCO, IGM, reference, narration, remarks) |
| 6 | Container table |
| 7 | Charges table with SAC + SGST/CGST/IGST columns |
| 8 | Tax summary + amount in words + grand total |
| 9 | Terms + bank details |
| 10 | Footer (computer-generated, created by, timezone) |

**Pack key:** `commercial.invoice_tax_india_1`  
**Template code:** `INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA`  
Expose on `GET /reports/templates/renderers` (expand allowed pattern beyond `ops.*` / `sea.*` if needed).  
Bind: `POST …/bind-renderer` `{ "renderer_key": "commercial.invoice_tax_india_1", "activate": true }`.

### GST / data gaps (current KingFisher models)

FE invoice/party types are **VAT-style** (`vat_rate`, `tax_total`, `vat_number`). Format-1 needs backend to supply or compute:

- Party/company **GSTIN** (map from `vat_number` or add field)
- Line **SAC/HSN**
- Per-line **SGST / CGST / IGST** rates and amounts (not a single VAT %)
- Taxable vs non-taxable split
- **Amount in words**
- Terms + bank details from company/branch settings
- Full shipment + container block from linked job

Until those exist, pack may render placeholders / zeros — do not invent GST math in the frontend.

### Smoke acceptance (Format-1)

1. Import registry (if needed) + bind `commercial.invoice_tax_india_1` + activate.  
2. `POST /reports/generate` with real `invoice_id`.  
3. Download PDF — structure matches FRESA sample; fields from KingFisher data.  
4. FE path: Invoice detail → **FRESA formats** → catalog with `invoice_id` locked → Generate → PdfReadyModal.

### Rollout (one pack at a time)

1. Format-1 Tax Invoice India ← **current**  
2. Format-2 Tax Invoice India  
3. Summary / Standard / Simple India  
4. Arabic / USA / Warehouse  
5. Format-22+  

Each = new pack + bind map; **zero new FE layout code**.

---

## FE reference

| Item | Path |
|------|------|
| API | `src/features/reports/api/reportCatalog.api.ts` |
| Service | `src/features/reports/services/reportCatalog.service.ts` |
| Hooks | `src/features/reports/hooks/useReportCatalog.ts` |
| Browse list | `src/features/reports/components/ReportCatalog/ReportCatalogBrowseList.tsx` |
| Panel | `src/features/reports/components/ReportCatalog/ReportGeneratePanel.tsx` |
| Page | `src/features/reports/pages/ReportCatalogPage.tsx` |
| Pack priority + Format-1 constants | `src/features/reports/constants/fresaPdfParity.constants.ts` |
| Preserve doc PDFs | `src/features/reports/utils/documentPdfPreserve.ts` |
| Invoice format-payload (optional) | `GET /invoices/:id/format-payload` via `invoiceService.getFormatPayload` |

**Catalog page wiring (live):** selecting a template mounts `ReportGeneratePanel` (bind / activate / `POST /reports/generate`). Format AutoPdf strips remain **preview-only**. **Import registry** calls `POST /reports/templates/import`. Search uses debounced `GET /reports/templates?search=` plus local format-catalog fallback. Default invoice/quotation PDF routes are untouched.

