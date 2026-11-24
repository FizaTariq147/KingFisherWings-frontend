# Backend plan — Hybrid Option C HTML pilots (for Hafsa)

Frontend branch: `reports/integration`. Nothing accepted. Do not create a second reporting module.

Backend owner reported the requirements below complete. This repo now calls `POST /reports/:code/preview` for the three pilot codes only. The body carries record context and filters. `companyId` is stripped before send. The mapper copies display fields the templates already render and leaves notify, net weight, and the SGST/CGST/IGST split blank. A 404 or 501 keeps the previous catalogue hydration. HTML print stays on the Vite plugin. HBL Jasper and Tax Invoice India still draw through the measured reference forms when that path is selected.

## Goal

Support three HTML/CSS Playwright pilots that **reuse existing data providers and normalized payloads**. Frontend templates must not invent database fields.

| Pilot | Code | Record scope |
|---|---|---|
| HBL Draft | `HBL_DRAFT_REPORT_FORMAT_JASPER` | One job / house BL |
| Sales Invoice | `INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA` | One sales invoice |
| Job List | `JOB_LIST_SUMMARY_REPORT_FORMAT` | Filtered job list |

## Do

1. Extend the existing Nest reports module (`/reports/templates`, `/reports/generate`, jobs).
2. Confirm or expose payload JSON matching what the frontend already maps:
   - HBL → parties, routing, containers, cargo (same shape as catalogue `InvoiceFormatPdfData` / BL classic model)
   - Invoice → header, lines (`description`, `quantity`, `unit_price`, `line_total`, `tax_amount` when present), totals (`subtotal`, `tax_total` / `tax_amount`, `total_amount`)
   - Job list → rows with stable columns (job, customer, POL, POD, ETD, status)
3. Keep calculations in providers. Templates receive display-ready values only.
4. Resolve `companyId` / branch from authenticated context only. Verify record ownership.
5. Leave missing fields null/omitted (notify, net weight, SGST/CGST/IGST split, freight terms when absent). Never invent values.
6. Optional later: server Playwright/Puppeteer consuming the same HTML artifacts. Until then, frontend/dev print plugin (`/api/reports/html-pilot-pdf`) is the HTML path; existing packs remain for other codes.

## Do not

- Duplicate providers or recalculate invoice totals in HTML
- Trust `companyId` from the request body
- Expose permanent public PDF URLs
- Mark reports accepted from the backend
- Change thresholds / sign-off / classic invoice PDF endpoints

## Suggested sequence

1. Audit Prisma models for Jobs, HBL, Invoice lines, Parties, Org profile.
2. Freeze three payload JSON fixtures (company-safe sample data).
3. Provider unit tests for each pilot payload.
4. Optional `POST /reports/:code/preview` returning payload only for the three codes.
5. Wire server render only after frontend templates stabilize.

## Missing-field matrix (frontend leaves blank)

| Field | Status |
|---|---|
| Notify party | Often missing on job |
| Net weight | Not on current cargo model |
| SGST / CGST / IGST | Only single tax total / tax_amount |
| Freight terms | Only when stored on record |

## Security checklist

- [ ] Company scope on every query
- [ ] Branch scope where product uses branches
- [ ] Permission to generate / download
- [ ] Audit who generated the report
- [ ] Escape / sanitize text before any server HTML assembly
- [ ] Cache keys include company, code, filters, template version
