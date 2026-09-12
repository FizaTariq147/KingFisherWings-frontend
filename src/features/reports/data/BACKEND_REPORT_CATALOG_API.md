# FRESA Report Catalog — Backend API Contract

**Status:** Live on Swagger tag **Reports — Catalog**  
Base: `https://kingfisherwings-backend.onrender.com` (tenant Bearer auth)

Frontend catalog UI: `/reports/catalog` (FRESA-like **Sample report formats** browse)  
Client: `src/features/reports/api/reportCatalog.api.ts` + `reportCatalog.service.ts`

Do **not** change existing document PDF APIs (`POST /quotations/:id/pdf`, `POST /invoices/:id/pdf`, portal/vendor PDF flows). Catalog templates are additive.

**Rendering:** There is **no Jasper upload** and the frontend owns **zero** per-report PDF layouts. Templates bind to **Puppeteer data packs** from `GET /reports/templates/renderers` (historically `ops.*` / `sea.*`; commercial invoice packs use `commercial.*` e.g. `commercial.invoice_tax_india_1`).

Restart the API after deploy so Swagger picks up new routes.

---

## Exact FRESA UI for every report — how

| Surface | “Like FRESA?” | Owner |
|---------|---------------|--------|
| Catalog browse (names, sections) | FRESA-like listing | Frontend (done) |
| Generated PDF / print layout | Pixel match to FRESA samples | **Backend Puppeteer packs only** |

Do **not** scrape https://fresatechnologies.com/sample-report-formats/ into the app. Do **not** build ~600 React/Jasper layouts in KingFisher Wings FE.

Until a pack exists, imported rows stay `renderer_key=pending.{CODE}` / inactive and Generate correctly fails.

FE constants for this handoff: `src/features/reports/constants/fresaPdfParity.constants.ts`

---

## Backend workstream A — Priority families + Puppeteer packs

Implement packs in **kingfisherwings-backend** in this order (matches FE `reportRollout.constants.ts`):

| Phase | Family | Registry ~count | Pack approach |
|-------|--------|-----------------|---------------|
| 1 | `ops_list` | 110 | Shared list/table HTML shell; column config per code |
| 2 | `sea_docs` | 134 | HBL shell + Arrival Notice shell; many codes → few packs |
| 3 | `air_docs` (+ quotation) | 75 + 18 | HAWB/MAWB / air notice shells |
| 4 | `commercial` | 99 | Invoice-format packs (**additive**; keep `POST /invoices/:id/pdf`) |
| 5 | `finance` | 91 | Aging / SOA / trial balance / outstanding letter packs |
| 6 | `wms` | 58 | ASN / warehouse note packs |

Per pack checklist:

1. HTML/CSS matching FRESA sample (margins, headers, logos, tables, field placement).
2. Register key so it appears on `GET /reports/templates/renderers` (`ops.*` or `sea.*`).
3. Query/data loader for parameters from template schema.
4. Smoke: bind → activate → `POST /reports/generate` → download → visual diff vs FRESA sample.
5. Prefer **one pack → many template codes** when layouts share structure (e.g. all HBL Draft-* → `sea.hbl_draft`).

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
HBL_DRAFT_*                              → sea.hbl_draft
ARRIVAL_NOTICE_SEA_*                     → sea.arrival_notice
DSR_* / OPS_LIST_*                       → ops.list_generic
INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA → commercial.invoice_tax_india_1
INVOICE_REPORT_FORMAT_*                  → commercial.invoice_* (per format pack)
```

On `POST …/import` or `POST …/activate`, if a rule matches, set real `renderer_key` instead of leaving `pending.*`. Unmatched codes stay pending.

### Activate gate

- Only activate when `renderer_key` is a real pack (not `pending.*`).
- Generate must fail clearly if pack missing — FE must not fake PDF bytes.

---

## FE vs BE split (PDF “like FRESA”)

| Layer | Responsibility |
|-------|----------------|
| **Frontend** | List/import templates; FRESA-style sectioned browse; schema-driven params; bind pack keys from `/renderers`; generate → poll → **PdfReadyModal** (no `/files` redirect). |
| **Backend** | Implement/expand Puppeteer packs; map `pending.{CODE}` → packs; render PDF bytes that match FRESA samples. |

---

## Endpoints (live)

### 1. `GET /reports/templates`

Paginated template list. Params: `page`, `limit` (max 200), `search`, `family`, `context`, `include_inactive`.

FE browse loads multiple pages (capped) for sectioned listing.

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

## Frontend flow (unchanged — no per-report layouts)

1. **Import registry** (batched)  
2. **Include inactive** (default on) → sectioned Live browse by API family  
3. Select format → Pick pack from **Puppeteer pack** dropdown (`GET …/renderers`)  
4. **Bind pack + Activate**  
5. **Generate** → poll → **PdfReadyModal** (preview / download)

Only templates whose codes map to an existing pack can render FRESA-like PDFs. Other FRESA names stay pending until backend adds more packs.

Preserve: `src/features/reports/utils/documentPdfPreserve.ts` (quotation/invoice pdf-lib).

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

