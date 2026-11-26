# Phase 0.5 — Renderer Usage Matrix

**Mode:** Audit only.  
**Principle:** Do not assume one engine for all reports.

---

## 1. Installed engines (package.json)

| Package | Version | Role |
|---|---|---|
| `pdf-lib` | ^1.17.1 | Vector draw / merge / measured / sparse / classic / reference-accurate |
| `@pdf-lib/fontkit` | (transitive/ co-used) | Custom font embed in measured path |
| `jspdf` | ^4.2.1 | Page assembly after canvas capture; some fixtures |
| `html2canvas` | ^1.4.1 | React DOM → raster |
| `playwright` | ^1.61.0 | HTML print pilots (Node / local Vite) |
| `pdfmake` | ^0.3.15 | Browser invoice **flow** docs |
| `jsbarcode` | ^3.12.3 | CODE128 bitstrings |
| `qrcode` | ^1.5.4 | **Installed; no report-drawer imports found** |

---

## 2. Engine → key functions

| Engine | Important entry functions / files |
|---|---|
| **pdf-lib measured** | `generateOfficialMeasuredPdf` — `templates/official/generateOfficialMeasuredPdf.ts` |
| **pdf-lib sparse HAWB** | `generateHawbSparsePdf` — `templates/hawb/official/generateHawbSparsePdf.ts` |
| **pdf-lib reference-accurate** | `drawReferenceForm` / `generateReferenceAccuratePdf` — `templates/referenceAccurate/` |
| **pdf-lib classic invoice** | `generateInvoicePdf` — `features/invoices/utils/generateInvoicePdf.ts` |
| **pdf-lib classic quotation** | `generateQuotationPdf` — wraps invoice drawer |
| **pdf-lib T&C merge** | `appendOfficialCustomerTermsPdf` |
| **pdfmake flow** | `renderInvoiceFlowPdf` — `features/reports/flow/renderInvoiceFlowPdf.ts` (`INVOICE_FLOW_*` keys) |
| **html2canvas + jsPDF** | `captureReactDocumentPdf` — template-v2; `generateInvoiceFormatPreviewPdf` — JSON shells; HAWB React **fallback** inside `generateHawbOfficialPdf` |
| **Playwright HTML** | `renderPlaywrightHtmlPdf.ts`; client `hawbDraft2PrintClient.ts` → `POST /api/reports/hawb-draft2-pdf` |
| **Catalogue router** | `generateCatalogLayoutPdf` — picks among the above |

---

## 3. Family → actual Generate path (freightnest catalogue)

| Family (enrichment) | Primary runtime path | Fallback | Notes |
|---|---|---|---|
| **invoice** (measured codes) | pdf-lib `generateOfficialMeasuredPdf` | JSON html2canvas if no face | Format-map ~measured for many |
| **invoice** (JSON-only) | html2canvas JSON shell | — | Large share of 538 json_shell rows |
| **invoice flow keys** | **pdfmake** browser | classic pdf-lib via invoice UI choice | Not in 852 registry |
| **hbl** (measured) | pdf-lib measured | Jasper / classic capture | Letterhead barcode possible |
| **hbl** Jasper pilot | reference-accurate and/or pilot paths | classic | `HBL_DRAFT_REPORT_FORMAT_JASPER` |
| **hawb** official Draft/1/2 | pdf-lib measured via `generateHawbOfficialPdf` | html2canvas if face missing; Draft-2 Playwright first | Format-map stale |
| **hawb** official Originals | pdf-lib sparse | — | Preprinted-style |
| **hawb** Draft-3…27 | JSON alias / unmapped | sample browse only when allowed | Hidden from primary list |
| **mawb** | measured if face else JSON | — | |
| **arrival_notice / delivery_order / cargo_manifest / wms** | measured when face exists else JSON | — | |
| **quotation** | JSON / template-v2; classic quotation button separate | FCL may be reference-accurate pilot | |
| **ops_list / ledger / voucher / financial_statement** | mostly JSON / list shells; some measured | Excel paths for xlsx formats | |
| **ops_form / other** | mixed JSON / measured / unmapped | — | |

---

## 4. Browser vs Node

| Path | Where it runs |
|---|---|
| Catalogue Generate in app | **Browser** (pdf-lib, html2canvas, pdfmake flow) |
| Playwright HTML pilots | **Node** Playwright or local Vite print API |
| `tools/reports/render-spec.mjs` / verify-pool | **Node** offline harness (not catalogue UI) |

---

## 5. Format-map vs runtime (inventory caveat)

format-map `generate_path` counts (1016 rows):

| Path | Rows |
|---|---:|
| json_shell_fallback | 538 |
| measured_fresa_face | 412 |
| unmapped | 62 |
| reference_accurate | 4 |

Use as **inventory**, not as live HAWB truth (HAWB five mislabeled).

---

## 6. Labels

| Claim | Label |
|---|---|
| Matrix of engines and key files | **Verified** |
| Every one of 852 codes exercised end-to-end this phase | **Not done** (unresolved runtime coverage) |
| pdfmake limited to flow invoice family | **Verified** for `renderInvoiceFlowPdf` purpose |
