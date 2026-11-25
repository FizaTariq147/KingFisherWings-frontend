# BE brief: Documentation — Fresa parity

## Docs BE Phase 1 (Slice A1) — shipped / FE wired

| Area | Endpoint / behavior | FE |
|------|---------------------|----|
| MPCI filters | `GET /documentation/mpci/filings` — `department_id`, `filing_status` (alias of `status`), `search`, `from_date`/`to_date`, `job_id`, page/limit | UAE MPCI Monitor |
| Closed shipment/BL | `GET .../delivery-orders/closed-jobs` (+ `from_date`, `to_date`, `job_type`); `PATCH /documentation/jobs/:jobId/shipment-bl-status` body `{ shipment_status?, bl_status? }` (≥1) | Update Shipment & BL — Closed Job |
| Job doc fields | `PATCH /documentation/jobs/:jobId/doc-fields` — `portnet_ref_no`, `saber_certificate_no`, `ra_code`, `overseas_agent_party_id`, `vgm_cutoff_date`, `voyage_number` | Job Customs → Documentation fields |
| Follow-up delete | `DELETE /crm/follow-ups/:id`; `DELETE /ops/:entityType/:entityId/follow-ups/:followUpId` (soft-delete) | CRM Follow-ups + Ops continuum |

Reuse (no new hub tiles): SABER/RA via references; overseas agent on org tab; VGM/voyage on sea detail; Get Job Charges remains `POST /jobs/:id/get-job-charges` on Costing.

## Deferred (later phases — not FE Phase 1)

- ASYCUDA LK, SCMTR, Dubai exit/entry certificate
- Vendor INV OCR under `/documentation`
- Bulk sales invoice print/email
- Extra reports: air-tonnage, CAL, gate-pass, container-storage
- Container v-weight-from-dimensions
- Documentation Get Job Charges façade (use jobs API)

## Existing hub tiles (unchanged Phase 1)

BOE, Bayan, CCN, CGM, eQO, IAL, uploads, bulk costs, charge templates, Update DO, Job Download, air tracking, Reports (summary / jobs-list / ETA / ETD / manifest).
