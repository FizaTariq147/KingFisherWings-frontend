# API coverage gaps (OpenAPI vs FE)

Generated: 2026-10-13

Compares backend OpenAPI operations to normalized API path strings found under `src/` (*api*.ts, services, axios calls, and common `/shipments`, `/jobs`, etc. prefixes). Path params normalized to `:id`.

## Summary counts

| Metric | Count |
| --- | ---: |
| OpenAPI operations | 1552 |
| Unique normalized FE paths | 1374 |
| Operations with FE path match | 1302 (83.9%) |
| **Operations with no FE mention** | **250** |
| FE API-like paths not in OpenAPI (path only) | 192 |

Path-level match (normalized `:id`); a path string in FE counts as coverage for every HTTP method on that OpenAPI path. SPA routes (`/dashboard`, `/login`, `/operations/shipments/*` UI) are excluded from FE extraction heuristics.

**Priority ERP tags with no missing paths:** Shipments, Operations, CRM Enquiries, CRM Leads, Invoices, Documentation — EDI, Documentation — All Jobs, NVOCC — Jobs, Jobs — Air Workflow, Jobs — Customs Clearance

### Top tags by missing operations (staff modules first)

- **Jobs**: 25 missing
- **Job Offers**: 5 missing
- **Quotations**: 3 missing
- **Masters — Organization Groups**: 3 missing
- **Organization — Settings**: 2 missing
- **Masters — Ports**: 4 missing
- **Masters — Airports**: 4 missing
- **Masters — ContainerTypes**: 4 missing
- **Masters — Air Pallet Types**: 4 missing
- **Masters — Countries**: 3 missing
- **Masters — Currencies**: 3 missing
- **Masters — HsCodes**: 3 missing
- **Masters — Airlines**: 3 missing
- **Masters — ShippingLines**: 3 missing
- **Masters — Vessels**: 3 missing

*(Portal / public / health tags listed in separate section below.)*

## Missing by tag (METHOD path — summary)

### Jobs (25)

- **PUT** `/jobs/{id}/containers/bulk` — Multiple update containers
- **GET** `/jobs/{id}/containers/export` — Export containers as CSV
- **PATCH** `/jobs/{id}/containers/job-details` — Update job details from Container tab
- **POST** `/jobs/{id}/containers/sync-from-sub-jobs` — Update master containers from sub-job details (Fresa)
- **POST** `/jobs/{id}/containers/upload` — Upload containers Excel/CSV (preview unless confirm=true)
- **GET** `/jobs/{id}/containers/upload-sample` — Download container upload sample Excel
- **POST** `/jobs/{id}/containers/upload/confirm` — Confirm previewed container upload rows
- **POST** `/jobs/{id}/containers/upload/paste` — Paste CSV text for container upload
- **DELETE** `/jobs/{id}/dimensions/{lineId}` — Soft-delete dimension line
- **PATCH** `/jobs/{id}/dimensions/{lineId}` — Update dimension line
- **PUT** `/jobs/{id}/dimensions/bulk` — Multiple update dimension lines
- **GET** `/jobs/{id}/dimensions/export` — Export dimension lines as CSV
- **POST** `/jobs/{id}/dimensions/sync-to-cargo` — Sync dimension lines into JobCargo (create/update linked rows)
- **POST** `/jobs/{id}/dimensions/upload` — Upload dimensions Excel/CSV/text (preview unless confirm=true)
- **GET** `/jobs/{id}/dimensions/upload-sample` — Download dimension upload sample Excel
- **POST** `/jobs/{id}/dimensions/upload/confirm` — Confirm previewed dimension upload rows
- **POST** `/jobs/{id}/dimensions/upload/paste` — Paste EDI Format / CSV text (Fresa upload paste flow)
- **GET** `/jobs/{id}/organizations` — List job organizations (Organization tab)
- **POST** `/jobs/{id}/organizations` — Add organization — select existing party or create new
- **DELETE** `/jobs/{id}/organizations/{orgType}` — Unlink organization type from job
- **PUT** `/jobs/{id}/organizations/{orgType}` — Replace organization party for a type
- **POST** `/jobs/{id}/organizations/copy-from` — Copy organizations from parent (or source_job_id)
- **POST** `/jobs/{id}/organizations/refresh-snapshots` — Re-freeze party address/name snapshots from current master party data
- **GET** `/jobs/job-offers` — List vendor job offers (feature-detect path)
- **POST** `/jobs/job-offers` — Pass a job to a vendor (body.job_id required)

### Job Offers (5)

- **GET** `/job-offers` — List vendor job offers for this tenant
- **POST** `/job-offers` — Pass a job to a vendor with optional seeded cost (proposed_total / lines).
- **POST** `/job-offers/{id}/accept` — Accept vendor counter-offer (after vendor negotiates). Auto-generates purchase invoice.
- **POST** `/job-offers/{id}/counter-offer` — Negotiate / revise cost offer and send back to vendor (vendor can then approve)
- **POST** `/job-offers/{id}/negotiate` — Negotiate / revise cost offer and send back to vendor (vendor can then approve)

### Quotations (3)

- **GET** `/quotations/{id}/booking-form` — Get booking form for quotation (job-scoped; creates provisional job if needed)
- **PUT** `/quotations/{id}/booking-form` — Upsert booking form for quotation (via provisional/linked job)
- **POST** `/quotations/{id}/booking-form/complete` — Complete booking form for quotation

### Masters — Organization Groups (3)

- **DELETE** `/masters/organization-groups/{id}` — Soft-delete a record
- **GET** `/masters/organization-groups/{id}` — Get a record by id
- **PATCH** `/masters/organization-groups/{id}` — Update a record

### Organization — Settings (2)

- **GET** `/organization/settings/dimensions` — Dimension calculation settings (volumetric divisor)
- **PATCH** `/organization/settings/dimensions` — Update volumetric weight divisor (cm → kg)

### Masters — Ports (4)

- **DELETE** `/masters/ports/{id}` — Soft-delete a port
- **GET** `/masters/ports/{id}` — Get a port record by id
- **PATCH** `/masters/ports/{id}` — Update a port
- **POST** `/masters/ports/seed-defaults` — Seed world sea ports (UN/LOCODE) for this tenant

### Masters — Airports (4)

- **DELETE** `/masters/airports/{id}` — Soft-delete an airport
- **GET** `/masters/airports/{id}` — Get an airport by id
- **PATCH** `/masters/airports/{id}` — Update an airport
- **POST** `/masters/airports/seed-defaults` — Seed world airports (IATA) for this tenant

### Masters — ContainerTypes (4)

- **DELETE** `/masters/container-types/{id}` — Soft-delete a container type
- **GET** `/masters/container-types/{id}` — Get a container type by id
- **PATCH** `/masters/container-types/{id}` — Update a container type
- **POST** `/masters/container-types/seed-defaults` — Seed container types with ISO specs for this tenant

### Masters — Air Pallet Types (4)

- **DELETE** `/masters/air-pallet-types/{id}` — AirPalletTypesController_remove
- **GET** `/masters/air-pallet-types/{id}` — AirPalletTypesController_findOne
- **PATCH** `/masters/air-pallet-types/{id}` — AirPalletTypesController_update
- **POST** `/masters/air-pallet-types/seed-defaults` — Seed air pallet / ULD types with specs for this tenant

### Masters — Countries (3)

- **DELETE** `/masters/countries/{id}` — Soft-delete a country
- **GET** `/masters/countries/{id}` — Get a country by id
- **PATCH** `/masters/countries/{id}` — Update a country

### Masters — Currencies (3)

- **DELETE** `/masters/currencies/{id}` — Soft-delete a currency
- **GET** `/masters/currencies/{id}` — Get a currency by id
- **PATCH** `/masters/currencies/{id}` — Update a currency

### Masters — HsCodes (3)

- **DELETE** `/masters/hs-codes/{id}` — Soft-delete an HS code
- **GET** `/masters/hs-codes/{id}` — Get an HS code by id
- **PATCH** `/masters/hs-codes/{id}` — Update an HS code

### Masters — Airlines (3)

- **DELETE** `/masters/airlines/{id}` — Soft-delete a record
- **GET** `/masters/airlines/{id}` — Get a record by id
- **PATCH** `/masters/airlines/{id}` — Update a record

### Masters — ShippingLines (3)

- **DELETE** `/masters/shipping-lines/{id}` — Soft-delete a record
- **GET** `/masters/shipping-lines/{id}` — Get a record by id
- **PATCH** `/masters/shipping-lines/{id}` — Update a record

### Masters — Vessels (3)

- **DELETE** `/masters/vessels/{id}` — Soft-delete a record
- **GET** `/masters/vessels/{id}` — Get a record by id
- **PATCH** `/masters/vessels/{id}` — Update a record

### Masters — Truckers (3)

- **DELETE** `/masters/truckers/{id}` — Soft-delete a record
- **GET** `/masters/truckers/{id}` — Get a record by id
- **PATCH** `/masters/truckers/{id}` — Update a record

### Masters — Courier Vendors (3)

- **DELETE** `/masters/courier-vendors/{id}` — Soft-delete a courier vendor
- **GET** `/masters/courier-vendors/{id}` — Get a courier vendor by id
- **PATCH** `/masters/courier-vendors/{id}` — Update a courier vendor

### Masters — Warehouses (3)

- **DELETE** `/masters/warehouses/{id}` — Soft-delete a record
- **GET** `/masters/warehouses/{id}` — Get a record by id
- **PATCH** `/masters/warehouses/{id}` — Update a record

### Masters — ChargeCodes (3)

- **DELETE** `/masters/charge-codes/{id}` — Soft-delete a record
- **GET** `/masters/charge-codes/{id}` — Get a record by id
- **PATCH** `/masters/charge-codes/{id}` — Update a record

### Masters — Banks (3)

- **DELETE** `/masters/banks/{id}` — Soft-delete a record
- **GET** `/masters/banks/{id}` — Get a record by id
- **PATCH** `/masters/banks/{id}` — Update a record

### Masters — Holidays (3)

- **DELETE** `/masters/holidays/{id}` — Soft-delete a record
- **GET** `/masters/holidays/{id}` — Get a record by id
- **PATCH** `/masters/holidays/{id}` — Update a record

### Masters — UnitsOfMeasure (3)

- **DELETE** `/masters/units-of-measure/{id}` — Soft-delete a record
- **GET** `/masters/units-of-measure/{id}` — Get a record by id
- **PATCH** `/masters/units-of-measure/{id}` — Update a record

### Masters — TaxRates (3)

- **DELETE** `/masters/tax-rates/{id}` — Soft-delete a record
- **GET** `/masters/tax-rates/{id}` — Get a record by id
- **PATCH** `/masters/tax-rates/{id}` — Update a record

### Masters — Branches (3)

- **DELETE** `/masters/branches/{id}` — Soft-delete a record
- **GET** `/masters/branches/{id}` — Get a record by id
- **PATCH** `/masters/branches/{id}` — Update a record

### Masters — Departments (3)

- **DELETE** `/masters/departments/{id}` — Soft-delete a record
- **GET** `/masters/departments/{id}` — Get a record by id
- **PATCH** `/masters/departments/{id}` — Update a record

### Masters — Designations (3)

- **DELETE** `/masters/designations/{id}` — Soft-delete a record
- **GET** `/masters/designations/{id}` — Get a record by id
- **PATCH** `/masters/designations/{id}` — Update a record

### Masters — Regions (3)

- **DELETE** `/masters/regions/{id}` — Soft-delete a record
- **GET** `/masters/regions/{id}` — Get a record by id
- **PATCH** `/masters/regions/{id}` — Update a record

### Masters — Cities (3)

- **DELETE** `/masters/cities/{id}` — Soft-delete a record
- **GET** `/masters/cities/{id}` — Get a record by id
- **PATCH** `/masters/cities/{id}` — Update a record

### Masters — Zones (3)

- **DELETE** `/masters/zones/{id}` — Soft-delete a record
- **GET** `/masters/zones/{id}` — Get a record by id
- **PATCH** `/masters/zones/{id}` — Update a record

### Masters — Divisions (3)

- **DELETE** `/masters/divisions/{id}` — Soft-delete a record
- **GET** `/masters/divisions/{id}` — Get a record by id
- **PATCH** `/masters/divisions/{id}` — Update a record

### Masters — Categories (3)

- **DELETE** `/masters/categories/{id}` — Soft-delete a record
- **GET** `/masters/categories/{id}` — Get a record by id
- **PATCH** `/masters/categories/{id}` — Update a record

### Masters — Commodities (3)

- **DELETE** `/masters/commodities/{id}` — Soft-delete a record
- **GET** `/masters/commodities/{id}` — Get a record by id
- **PATCH** `/masters/commodities/{id}` — Update a record

### Masters — Packs (3)

- **DELETE** `/masters/packs/{id}` — Soft-delete a record
- **GET** `/masters/packs/{id}` — Get a record by id
- **PATCH** `/masters/packs/{id}` — Update a record

### Masters — Clauses (3)

- **DELETE** `/masters/clauses/{id}` — Soft-delete a record
- **GET** `/masters/clauses/{id}` — Get a record by id
- **PATCH** `/masters/clauses/{id}` — Update a record

### Masters — Port Clause Maps (3)

- **DELETE** `/masters/port-clause-maps/{id}` — Soft-delete a record
- **GET** `/masters/port-clause-maps/{id}` — Get a record by id
- **PATCH** `/masters/port-clause-maps/{id}` — Update a record

### Masters — Rate Bases (3)

- **DELETE** `/masters/rate-bases/{id}` — Soft-delete a record
- **GET** `/masters/rate-bases/{id}` — Get a record by id
- **PATCH** `/masters/rate-bases/{id}` — Update a record

### Masters — Voyages (3)

- **DELETE** `/masters/voyages/{id}` — Soft-delete a record
- **GET** `/masters/voyages/{id}` — Get a record by id
- **PATCH** `/masters/voyages/{id}` — Update a record

### Masters — Storage Slabs (3)

- **DELETE** `/masters/storage-slabs/{id}` — Soft-delete a record
- **GET** `/masters/storage-slabs/{id}` — Get a record by id
- **PATCH** `/masters/storage-slabs/{id}` — Update a record

### Masters — Activities (3)

- **DELETE** `/masters/activities/{id}` — Soft-delete a record
- **GET** `/masters/activities/{id}` — Get a record by id
- **PATCH** `/masters/activities/{id}` — Update a record

### Masters — Sales Call Activities (3)

- **DELETE** `/masters/sales-call-activities/{id}` — Soft-delete a record
- **GET** `/masters/sales-call-activities/{id}` — Get a record by id
- **PATCH** `/masters/sales-call-activities/{id}` — Update a record

### Masters — Custom Reports (3)

- **DELETE** `/masters/custom-reports/{id}` — Soft-delete a record
- **GET** `/masters/custom-reports/{id}` — Get a record by id
- **PATCH** `/masters/custom-reports/{id}` — Update a record

### Masters — Favorites (1)

- **DELETE** `/masters/favorites/{id}` — Remove own favorite

### Vendor Invoices (1)

- **POST** `/vendor/invoices/{id}/payment-proofs/{proofId}/send-email` — Email payment proof to tenant admin (vendor → admin)

### Platform Finance (Super Admin) (20)

- **GET** `/platform/finance/ap/aging` — AP aging
- **GET** `/platform/finance/ap/open-items` — Open payables (vendor balances)
- **GET** `/platform/finance/ap/statement/{partyId}` — AP statement for a vendor
- **GET** `/platform/finance/ar/aging` — AR aging (existing aging report on the platform ledger)
- **GET** `/platform/finance/ar/open-items` — Open receivables
- **GET** `/platform/finance/ar/statement/{partyId}` — AR statement for a ledger customer
- **GET** `/platform/finance/ar/tenant/{tenantId}/statement` — AR statement for one tenant (its customer account in the ledger)
- **GET** `/platform/finance/payments` — Receipts and payments (direction=RECEIPT|PAYMENT) with allocations
- **POST** `/platform/finance/payments` — Record a payment / receipt with allocations (draft)
- **POST** `/platform/finance/payments/{id}/post` — Post a draft payment (creates the payment/receipt voucher)
- **GET** `/platform/finance/receivables` — Receivables by tenant
- **GET** `/platform/finance/reports/balance-sheet` — Balance sheet
- **GET** `/platform/finance/reports/cash-flow` — Cash flow
- **GET** `/platform/finance/reports/profit-and-loss` — Profit & loss
- **GET** `/platform/finance/reports/trial-balance` — Trial balance
- **GET** `/platform/finance/status` — Platform ledger configuration
- **GET** `/platform/finance/vendor-bills` — Vendor bills (purchase invoices)
- **POST** `/platform/finance/vendor-bills` — Record a vendor bill (draft purchase invoice)
- **GET** `/platform/finance/vouchers` — GL vouchers (receipt, payment, journal …)
- **GET** `/platform/finance/vouchers/{id}` — Voucher detail with lines

### Ops Activity Continuum (20)

- **GET** `/ops/{entityType}/{entityId}/attachments` — OpsActivityController_listAttachments
- **POST** `/ops/{entityType}/{entityId}/attachments` — Register attachment metadata (already on R2) — prefer multipart /attachments/upload
- **GET** `/ops/{entityType}/{entityId}/attachments/{attachmentId}/download` — Download continuum attachment (binary from R2)
- **GET** `/ops/{entityType}/{entityId}/attachments/{attachmentId}/download-url` — Presigned R2 download URL for continuum attachment
- **POST** `/ops/{entityType}/{entityId}/attachments/upload` — Staff upload continuum attachment to R2 — visible to customer/vendor when flags allow
- **GET** `/ops/{entityType}/{entityId}/complaints` — OpsActivityController_listComplaints
- **POST** `/ops/{entityType}/{entityId}/complaints` — OpsActivityController_addComplaint
- **PATCH** `/ops/{entityType}/{entityId}/complaints/{complaintId}` — OpsActivityController_patchComplaint
- **GET** `/ops/{entityType}/{entityId}/follow-ups` — List follow-ups on enquiry/quote/shipment/job
- **POST** `/ops/{entityType}/{entityId}/follow-ups` — OpsActivityController_createFollowUp
- **GET** `/ops/{entityType}/{entityId}/history` — Change / activity history (AuditLog) for this enquiry/quote/shipment/job
- **GET** `/ops/{entityType}/{entityId}/likes` — OpsActivityController_listLikes
- **POST** `/ops/{entityType}/{entityId}/likes/toggle` — OpsActivityController_toggleLike
- **GET** `/ops/{entityType}/{entityId}/links` — OpsActivityController_listLinks
- **POST** `/ops/{entityType}/{entityId}/links` — OpsActivityController_addLink
- **GET** `/ops/{entityType}/{entityId}/references` — OpsActivityController_listReferences
- **POST** `/ops/{entityType}/{entityId}/references` — OpsActivityController_addReference
- **GET** `/ops/{entityType}/{entityId}/tags` — OpsActivityController_listTags
- **POST** `/ops/{entityType}/{entityId}/tags` — OpsActivityController_addTag
- **DELETE** `/ops/{entityType}/{entityId}/tags/{tagId}` — OpsActivityController_removeTag

### Admin — Quote Requests Integration (10)

- **GET** `/admin/integrations/quote-requests` — List mirrored website quote requests
- **GET** `/admin/integrations/quote-requests/{id}` — Get mirrored quote request detail
- **POST** `/admin/integrations/quote-requests/{id}/convert-to-quote` — Convert linked CRM enquiry to freight quotation
- **POST** `/admin/integrations/quote-requests/{id}/link-crm` — Force-create Lead + Enquiry if missing
- **PATCH** `/admin/integrations/quote-requests/{id}/status` — Update status locally and push to remote API
- **GET** `/admin/integrations/quote-requests/connection` — Get quote-requests connection (key redacted)
- **PUT** `/admin/integrations/quote-requests/connection` — Create/update quote-requests connection
- **POST** `/admin/integrations/quote-requests/connection/test` — Health-check the configured remote API
- **POST** `/admin/integrations/quote-requests/sync` — Manual pull/sync from remote Quote Requests API
- **GET** `/admin/integrations/quote-requests/sync-runs` — List sync run history

### Vendor Tools (5)

- **POST** `/vendor/tools/converter/cbm` — Cubic meter and volume weight (vendor)
- **POST** `/vendor/tools/converter/length` — Fresa-parity length converter (vendor)
- **POST** `/vendor/tools/converter/liquid` — Liquid volume converter (vendor)
- **POST** `/vendor/tools/converter/volume` — Cubic volume unit converter (vendor)
- **POST** `/vendor/tools/converter/weight` — Weight converter (vendor)

### Tools (5)

- **POST** `/tools/converter/cbm` — Cubic meter and volume weight (CBM × 166.667)
- **POST** `/tools/converter/length` — Fresa-parity length converter
- **POST** `/tools/converter/liquid` — Fresa-parity liquid volume converter
- **POST** `/tools/converter/volume` — Cubic volume unit converter (CM/FT/IN/MT/MM)
- **POST** `/tools/converter/weight` — Fresa-parity weight converter

### Vendor Payouts (4)

- **GET** `/vendor/payouts` — Payouts sent to me
- **GET** `/vendor/payouts/{id}` — Payout detail
- **GET** `/vendor/payouts/account` — My payout account status
- **POST** `/vendor/payouts/account/onboarding-link` — Set up / continue payout onboarding (Stripe-hosted)

### Stripe Webhook (4)

- **POST** `/payments/stripe/webhook` — Stripe webhook (platform account)
- **POST** `/payments/stripe/webhook/{token}` — Stripe webhook (company Stripe account; token from payment settings)
- **POST** `/payments/stripe/webhook/{token}/connect` — Stripe Connect webhook (a company's connected accounts)
- **POST** `/payments/stripe/webhook/connect` — Stripe Connect webhook (platform account's connected accounts)

### Vendor Payouts (Stripe Connect) (4)

- **GET** `/vendor-payouts` — Vendor payouts (Stripe transfers) with their ERP payment
- **GET** `/vendor-payouts/{id}` — Payout detail
- **GET** `/vendor-payouts/accounts/{partyId}` — Vendor's payout onboarding status (refreshed from Stripe)
- **POST** `/vendor-payouts/accounts/{partyId}/onboarding-link` — Create the vendor's Stripe payout account and an onboarding link to send them

### Vendor Ops Continuum (4)

- **GET** `/vendor/ops/{entityType}/{entityId}/attachments` — List continuum attachments shared with this vendor
- **GET** `/vendor/ops/{entityType}/{entityId}/attachments/{attachmentId}/download` — VendorOpsActivityController_download
- **GET** `/vendor/ops/{entityType}/{entityId}/attachments/{attachmentId}/download-url` — VendorOpsActivityController_downloadUrl
- **POST** `/vendor/ops/{entityType}/{entityId}/attachments/upload` — Vendor upload continuum attachment (R2) — visible to staff

### Online Payments (Stripe) (3)

- **GET** `/payments/stripe/connect` — Stripe Connect status for collecting customer payments
- **POST** `/payments/stripe/connect/dashboard-link` — Open the company's Stripe Express dashboard
- **POST** `/payments/stripe/connect/onboarding-link` — Connect the company's Stripe account (Stripe-hosted onboarding)

### Payment Proofs (2)

- **DELETE** `/payment-proofs/{id}` — Withdraw an unreviewed proof
- **GET** `/payment-proofs/{id}/file` — Download the proof file (served from object storage)

### Vendor Quotes (1)

- **POST** `/vendor/quotes/{id}/approve` — Accept / approve the tenant cost offer as-is (after admin revise, or initial SENT offer). Auto-generates purchase invoice.

---

## Portal, public, and health (de-emphasized)

### Portal Tools (5)

- **POST** `/portal/tools/converter/cbm` — Cubic meter and volume weight (portal)
- **POST** `/portal/tools/converter/length` — Fresa-parity length converter (portal)
- **POST** `/portal/tools/converter/liquid` — Liquid volume converter (portal)
- **POST** `/portal/tools/converter/volume` — Cubic volume unit converter (portal)
- **POST** `/portal/tools/converter/weight` — Weight converter (portal)

### Portal Ops Continuum (4)

- **GET** `/portal/ops/{entityType}/{entityId}/attachments` — List continuum attachments shared with customer (staff + own uploads)
- **GET** `/portal/ops/{entityType}/{entityId}/attachments/{attachmentId}/download` — PortalOpsActivityController_download
- **GET** `/portal/ops/{entityType}/{entityId}/attachments/{attachmentId}/download-url` — PortalOpsActivityController_downloadUrl
- **POST** `/portal/ops/{entityType}/{entityId}/attachments/upload` — Customer upload continuum attachment (R2) — visible to staff

### Portal — Booking forms (3)

- **GET** `/portal/quotations/{id}/booking-form` — Customer get booking form for quotation (APPROVED + provisional job)
- **PUT** `/portal/quotations/{id}/booking-form` — Customer upsert booking form for quotation
- **POST** `/portal/quotations/{id}/booking-form/complete` — Customer complete booking form for quotation

### Public API v1 (4)

- **GET** `/api/v1/health` — Public API health check
- **GET** `/api/v1/jobs` — List jobs (tenant API key)
- **GET** `/api/v1/jobs/{id}` — Get job by id
- **GET** `/api/v1/track/{token}` — Track shipment by public token

## FE paths not found in OpenAPI (optional)

Normalized paths referenced in the frontend that do not match any OpenAPI path (may be deprecated, typo, composite client paths, or method-specific gaps). Limited to API-like prefixes.

- `/customers`
- `/customers/7`
- `/customers/:id`
- `/documentation`
- `/documentation/*`
- `/documentation/bayan-edi-job-list`
- `/documentation/bayan-edi-shipment-house-list`
- `/documentation/boe-dashboard`
- `/documentation/bulk-cost-entry`
- `/documentation/cargo-tracking-air`
- `/documentation/ccn-fwb-fhl-edi-job-list`
- `/documentation/cgm-edi-vessel-list`
- `/documentation/charge-template-list`
- `/documentation/container-no-upload`
- `/documentation/container-transport-upload`
- `/documentation/dpword-tracking-file-upload`
- `/documentation/dubai-eqo-edi`
- `/documentation/ial-edi-job-list`
- `/documentation/job-download`
- `/documentation/oman-eqo-edi`
- `/documentation/truck-position-upload`
- `/documentation/uae-mpci-monitor`
- `/documentation/update-do-closed-job`
- `/files`
- `/files/...`
- `/files/:id`
- `/gl`
- `/gl/accounts/:id/edit`
- `/gl/accounts/new`
- `/gl/accounts/trial-balance`
- `/gl/ap/statement/:id:id`
- `/gl/ar/statement/:id:id`
- `/gl/bank-reconciliations/new`
- `/gl/bank-transfers/new`
- `/gl/cheques/:id/edit`
- `/gl/cheques/new`
- `/gl/payments/:id/edit`
- `/gl/payments/new`
- `/gl/reports`
- `/gl/saved-reports/:id/edit`
- `/gl/saved-reports/new`
- `/gl/vouchers/:id/edit`
- `/gl/vouchers/new`
- `/hr`
- `/hr/employee-master`
- `/hr/employee-master/:id`
- `/hr/employee-master/:id/edit`
- `/hr/employee-master/new`
- `/hr/employees/2`
- `/hr/leave`
- `/hr/leave-request`
- `/hr/letters/:id/pdf`
- `/hr/pay-roll`
- `/hr/reports`
- `/hr/salary-upload`
- `/invoices/3`
- `/invoices/4`
- `/invoices/5`
- `/invoices/:id/edit`
- `/invoices/new`
- `/invoices/overdue`
- `/jobs/1`
- `/jobs/:id/air/uld-requests`
- `/jobs/:id/air/uld-requests/:id/allocate`
- `/jobs/:id/air/uld-requests/:id/issue`
- `/jobs/:id/vendor-offers`
- `/jobs/air-export`
- `/jobs/air-export/1`
- `/jobs/air-export/:id`
- `/jobs/air-export/:id/edit`
- `/jobs/air-export/new`
- `/jobs/barcode-scan`
- `/jobs/customs-clearance`
- `/jobs/customs-clearance/:id`
- `/jobs/customs-clearance/:id/edit`
- `/jobs/customs-clearance/new`
- `/jobs/new`
- `/jobs/road-freight`
- `/jobs/road-freight/:id`
- `/jobs/road-freight/:id/edit`
- `/jobs/road-freight/new`
- `/jobs/sea-export`
- `/jobs/sea-export/:id`
- `/jobs/sea-export/:id/edit`
- `/jobs/sea-export/new`
- `/jobs/sea-fcl/1`
- `/jobs/sea-import`
- `/jobs/sea-import/:id`
- `/jobs/sea-import/:id/edit`
- `/jobs/sea-import/new`
- `/jobs/summary/upcoming-etds`
- `/management`
- `/management/all-jobs-mis`
- `/management/complaints`
- `/management/data-backup-export`
- `/management/management-dashboard`
- `/management/management-dashboard/reports`
- `/management/reports`
- `/management/user-access`
- `/management/user-wise-performance`
- `/nvocc`
- `/nvocc/:id`
- `/nvocc/all-jobs`
- `/nvocc/booking-list`
- `/nvocc/bookings/new`
- `/nvocc/enquiries/new`
- `/nvocc/enquiry-list`
- `/nvocc/load-list`
- `/nvocc/reports`
- `/nvocc/tariffs/new`
- `/nvocc/vessel-voyage-master`
- `/nvocc/voyages/new`
- `/operations/transport-requests`
- `/organization`
- `/organization/job-date`
- `/parties/:id/edit`
- `/parties/:id/transaction-summary`
- `/parties/new`
- `/portal`
- `/portal/*`
- … and 72 more
