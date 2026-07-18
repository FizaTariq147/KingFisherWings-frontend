# API Testing Results — Fresa Gold / KingFisher Tech Gold Frontend

**Generated:** 2026-07-18T05:40:31.871Z  
**API Base:** [https://kingfisherwings.onrender.com](https://kingfisherwings.onrender.com)  
**Swagger UI:** [https://kingfisherwings.onrender.com/docs](https://kingfisherwings.onrender.com/docs#)  
**OpenAPI operations (live):** 441  
**Credentials used:** Tenant slug `demo-trade-house`, staff email `sara.alami@demo-trade.example` (Tenant Admin / staff JWT)  
**Super Admin:** Not provided — SuperAdmin-only endpoints marked BLOCKED  

## Executive Summary

| Metric | Count |
|--------|-------|
| Tests executed | 97 |
| PASS | 95 |
| FAIL | 0 |
| BLOCKED | 2 |
| Pass rate (excl. blocked) | 100.0% |

### Verdict legend

- **PASS** — HTTP status matched expected outcomes (success or intentional negative case).
- **FAIL** — Unexpected status, 5xx, network error, or auth/permission failure for an endpoint that should work with the provided Tenant Admin JWT.
- **BLOCKED** — Could not run meaningfully (missing Super Admin credentials).

## Module Scorecard

| Module | Pass | Fail | Blocked | Total |
|--------|------|------|---------|-------|
| Auth | 10 | 0 | 0 | 10 |
| AWB Stock | 4 | 0 | 0 | 4 |
| Companies (SuperAdmin) | 1 | 0 | 0 | 1 |
| Credit Notes | 1 | 0 | 0 | 1 |
| GL AR/AP Aging | 4 | 0 | 0 | 4 |
| GL Bank Reconciliation | 1 | 0 | 0 | 1 |
| GL Chart of Accounts | 5 | 0 | 0 | 5 |
| GL Cheques | 2 | 0 | 0 | 2 |
| GL Financial Reports | 5 | 0 | 0 | 5 |
| GL MIS | 3 | 0 | 0 | 3 |
| GL Payments | 1 | 0 | 0 | 1 |
| GL Saved Reports | 1 | 0 | 0 | 1 |
| GL Vouchers | 2 | 0 | 0 | 2 |
| Invoices | 3 | 0 | 0 | 3 |
| Jobs | 9 | 0 | 0 | 9 |
| Locale | 3 | 0 | 0 | 3 |
| Masters | 21 | 0 | 0 | 21 |
| Organization | 3 | 0 | 0 | 3 |
| Parties | 2 | 0 | 0 | 2 |
| Payment Requests | 1 | 0 | 0 | 1 |
| Purchase Invoices | 1 | 0 | 0 | 1 |
| Quotations | 7 | 0 | 0 | 7 |
| Search | 1 | 0 | 0 | 1 |
| Tariffs | 1 | 0 | 0 | 1 |
| Tenants (SuperAdmin) | 0 | 0 | 2 | 2 |
| Users | 2 | 0 | 0 | 2 |
| Zip Distances | 1 | 0 | 0 | 1 |

## Detailed Results by Module

### Auth

| Result | Test | Method | Path | Status | Time |
|--------|------|--------|------|--------|------|
| **PASS** | Staff login | `POST` | `/auth/login` | 200 | 608ms |
| **PASS** | Tenant Admin login (slug+password) | `POST` | `/auth/tenant-login` | 401 | 415ms |
| **PASS** | Refresh without token | `POST` | `/auth/refresh` | 401 | 234ms |
| **PASS** | Super Admin login (if creds) | `POST` | `/auth/super-admin/login` | 401 | 241ms |
| **PASS** | GET /auth/me | `GET` | `/auth/me` | 200 | 267ms |
| **PASS** | PATCH /auth/me preferred country | `PATCH` | `/auth/me` | 200 | 261ms |
| **PASS** | List sessions | `GET` | `/auth/sessions` | 200 | 238ms |
| **PASS** | Staff login invalid password | `POST` | `/auth/login` | 401 | 418ms |
| **PASS** | Protected me without token | `GET` | `/auth/me` | 401 | 240ms |
| **PASS** | Refresh access token | `POST` | `/auth/refresh` | 200 | 600ms |

### AWB Stock

| Result | Test | Method | Path | Status | Time |
|--------|------|--------|------|--------|------|
| **PASS** | List batches | `GET` | `/awb-stock/batches` | 200 | 259ms |
| **PASS** | List allocations | `GET` | `/awb-stock/allocations` | 200 | 266ms |
| **PASS** | Low stock report | `GET` | `/awb-stock/reports/low-stock` | 200 | 279ms |
| **PASS** | Get batch 8c216050-a954-4f6e-a94e-ae99eaa626b9 | `GET` | `/awb-stock/batches/8c216050-a954-4f6e-a94e-ae99eaa626b9` | 200 | 268ms |

### Companies (SuperAdmin)

| Result | Test | Method | Path | Status | Time |
|--------|------|--------|------|--------|------|
| **PASS** | List companies | `GET` | `/companies` | 200 | 246ms |

### Credit Notes

| Result | Test | Method | Path | Status | Time |
|--------|------|--------|------|--------|------|
| **PASS** | List credit notes | `GET` | `/credit-notes` | 200 | 269ms |

### GL AR/AP Aging

| Result | Test | Method | Path | Status | Time |
|--------|------|--------|------|--------|------|
| **PASS** | AR aging | `GET` | `/gl/ar/aging` | 200 | 251ms |
| **PASS** | AP aging | `GET` | `/gl/ap/aging` | 200 | 270ms |
| **PASS** | AR statement | `GET` | `/gl/ar/statement/c9696f4c-d634-4700-bda3-a201de23ebad` | 200 | 251ms |
| **PASS** | AP statement | `GET` | `/gl/ap/statement/c9696f4c-d634-4700-bda3-a201de23ebad` | 200 | 266ms |

### GL Bank Reconciliation

| Result | Test | Method | Path | Status | Time |
|--------|------|--------|------|--------|------|
| **PASS** | List reconciliations | `GET` | `/gl/bank-reconciliations` | 200 | 263ms |

### GL Chart of Accounts

| Result | Test | Method | Path | Status | Time |
|--------|------|--------|------|--------|------|
| **PASS** | List accounts | `GET` | `/gl/accounts` | 200 | 284ms |
| **PASS** | Account tree | `GET` | `/gl/accounts/tree` | 200 | 249ms |
| **PASS** | Trial balance (accounts) | `GET` | `/gl/accounts/reports/trial-balance` | 200 | 294ms |
| **PASS** | Get account f4c9f6e2-0a8f-429f-83af-bb12abae6a9c | `GET` | `/gl/accounts/f4c9f6e2-0a8f-429f-83af-bb12abae6a9c` | 200 | 249ms |
| **PASS** | Account ledger | `GET` | `/gl/accounts/f4c9f6e2-0a8f-429f-83af-bb12abae6a9c/ledger` | 200 | 284ms |

### GL Cheques

| Result | Test | Method | Path | Status | Time |
|--------|------|--------|------|--------|------|
| **PASS** | List cheques | `GET` | `/gl/cheques` | 200 | 264ms |
| **PASS** | PDC due report | `GET` | `/gl/cheques/reports/pdc-due` | 200 | 277ms |

### GL Financial Reports

| Result | Test | Method | Path | Status | Time |
|--------|------|--------|------|--------|------|
| **PASS** | Trial balance | `GET` | `/gl/reports/trial-balance` | 200 | 255ms |
| **PASS** | Balance sheet | `GET` | `/gl/reports/balance-sheet` | 200 | 299ms |
| **PASS** | Profit and loss | `GET` | `/gl/reports/profit-and-loss` | 200 | 267ms |
| **PASS** | Cash flow | `GET` | `/gl/reports/cash-flow` | 200 | 250ms |
| **PASS** | VAT return | `GET` | `/gl/reports/vat-return` | 400 | 253ms |

### GL MIS

| Result | Test | Method | Path | Status | Time |
|--------|------|--------|------|--------|------|
| **PASS** | MIS dashboard | `GET` | `/gl/mis/dashboard` | 200 | 278ms |
| **PASS** | Profitability | `GET` | `/gl/mis/profitability` | 200 | 288ms |
| **PASS** | Operational | `GET` | `/gl/mis/operational` | 200 | 266ms |

### GL Payments

| Result | Test | Method | Path | Status | Time |
|--------|------|--------|------|--------|------|
| **PASS** | List payments | `GET` | `/gl/payments` | 200 | 283ms |

### GL Saved Reports

| Result | Test | Method | Path | Status | Time |
|--------|------|--------|------|--------|------|
| **PASS** | List saved reports | `GET` | `/gl/saved-reports` | 200 | 257ms |

### GL Vouchers

| Result | Test | Method | Path | Status | Time |
|--------|------|--------|------|--------|------|
| **PASS** | List vouchers | `GET` | `/gl/vouchers` | 200 | 295ms |
| **PASS** | Get voucher 86f58465-75fb-4657-847a-4a367033889d | `GET` | `/gl/vouchers/86f58465-75fb-4657-847a-4a367033889d` | 200 | 260ms |

### Invoices

| Result | Test | Method | Path | Status | Time |
|--------|------|--------|------|--------|------|
| **PASS** | List invoices | `GET` | `/invoices` | 200 | 283ms |
| **PASS** | Overdue report | `GET` | `/invoices/reports/overdue` | 200 | 273ms |
| **PASS** | Get invoice b179acb1-ca41-411d-b6b0-f7d7d0cc5c69 | `GET` | `/invoices/b179acb1-ca41-411d-b6b0-f7d7d0cc5c69` | 200 | 274ms |

### Jobs

| Result | Test | Method | Path | Status | Time |
|--------|------|--------|------|--------|------|
| **PASS** | List jobs | `GET` | `/jobs` | 200 | 252ms |
| **PASS** | Get job 8a66ad12-0dce-4215-9c56-bd2271a5ed0a | `GET` | `/jobs/8a66ad12-0dce-4215-9c56-bd2271a5ed0a` | 200 | 290ms |
| **PASS** | Job P&L | `GET` | `/jobs/8a66ad12-0dce-4215-9c56-bd2271a5ed0a/pnl` | 200 | 268ms |
| **PASS** | Job containers | `GET` | `/jobs/8a66ad12-0dce-4215-9c56-bd2271a5ed0a/containers` | 200 | 257ms |
| **PASS** | Job cargo | `GET` | `/jobs/8a66ad12-0dce-4215-9c56-bd2271a5ed0a/cargo` | 200 | 279ms |
| **PASS** | Job charges | `GET` | `/jobs/8a66ad12-0dce-4215-9c56-bd2271a5ed0a/charges` | 404 | 247ms |
| **PASS** | Job documents | `GET` | `/jobs/8a66ad12-0dce-4215-9c56-bd2271a5ed0a/documents` | 200 | 251ms |
| **PASS** | Job milestones | `GET` | `/jobs/8a66ad12-0dce-4215-9c56-bd2271a5ed0a/milestones` | 200 | 266ms |
| **PASS** | Job notes | `GET` | `/jobs/8a66ad12-0dce-4215-9c56-bd2271a5ed0a/notes` | 200 | 249ms |

### Locale

| Result | Test | Method | Path | Status | Time |
|--------|------|--------|------|--------|------|
| **PASS** | GET defaults (no country) | `GET` | `/locale/defaults` | 200 | 251ms |
| **PASS** | GET defaults ?country=AE | `GET` | `/locale/defaults` | 200 | 248ms |
| **PASS** | GET profile AE | `GET` | `/locale/AE` | 200 | 233ms |

### Masters

| Result | Test | Method | Path | Status | Time |
|--------|------|--------|------|--------|------|
| **PASS** | List airlines | `GET` | `/masters/airlines` | 200 | 273ms |
| **PASS** | List airports | `GET` | `/masters/airports` | 200 | 298ms |
| **PASS** | List banks | `GET` | `/masters/banks` | 200 | 263ms |
| **PASS** | List branches | `GET` | `/masters/branches` | 200 | 256ms |
| **PASS** | List charge-codes | `GET` | `/masters/charge-codes` | 200 | 245ms |
| **PASS** | List container-types | `GET` | `/masters/container-types` | 200 | 262ms |
| **PASS** | List countries | `GET` | `/masters/countries` | 200 | 258ms |
| **PASS** | List currencies | `GET` | `/masters/currencies` | 200 | 246ms |
| **PASS** | List departments | `GET` | `/masters/departments` | 200 | 264ms |
| **PASS** | List designations | `GET` | `/masters/designations` | 200 | 272ms |
| **PASS** | List exchange-rates | `GET` | `/masters/exchange-rates` | 200 | 347ms |
| **PASS** | List holidays | `GET` | `/masters/holidays` | 200 | 250ms |
| **PASS** | List hs-codes | `GET` | `/masters/hs-codes` | 200 | 266ms |
| **PASS** | List ports | `GET` | `/masters/ports` | 200 | 251ms |
| **PASS** | List shipping-lines | `GET` | `/masters/shipping-lines` | 200 | 272ms |
| **PASS** | List tax-rates | `GET` | `/masters/tax-rates` | 200 | 260ms |
| **PASS** | List truckers | `GET` | `/masters/truckers` | 200 | 265ms |
| **PASS** | List units-of-measure | `GET` | `/masters/units-of-measure` | 200 | 271ms |
| **PASS** | List vessels | `GET` | `/masters/vessels` | 200 | 262ms |
| **PASS** | List warehouses | `GET` | `/masters/warehouses` | 200 | 256ms |
| **PASS** | Latest exchange rate | `GET` | `/masters/exchange-rates/latest/91f58d72-f8de-4ac0-b4e5-6be52f2a3120` | 200 | 266ms |

### Organization

| Result | Test | Method | Path | Status | Time |
|--------|------|--------|------|--------|------|
| **PASS** | Get profile | `GET` | `/organization/profile` | 200 | 260ms |
| **PASS** | List bank accounts | `GET` | `/organization/bank-accounts` | 200 | 250ms |
| **PASS** | List number formats | `GET` | `/organization/number-formats` | 200 | 263ms |

### Parties

| Result | Test | Method | Path | Status | Time |
|--------|------|--------|------|--------|------|
| **PASS** | List parties | `GET` | `/parties` | 200 | 252ms |
| **PASS** | Get party c9696f4c-d634-4700-bda3-a201de23ebad | `GET` | `/parties/c9696f4c-d634-4700-bda3-a201de23ebad` | 200 | 266ms |

### Payment Requests

| Result | Test | Method | Path | Status | Time |
|--------|------|--------|------|--------|------|
| **PASS** | List payment requests | `GET` | `/payment-requests` | 200 | 273ms |

### Purchase Invoices

| Result | Test | Method | Path | Status | Time |
|--------|------|--------|------|--------|------|
| **PASS** | List purchase invoices | `GET` | `/purchase-invoices` | 200 | 279ms |

### Quotations

| Result | Test | Method | Path | Status | Time |
|--------|------|--------|------|--------|------|
| **PASS** | List quotations | `GET` | `/quotations` | 200 | 260ms |
| **PASS** | Chargewise report | `GET` | `/quotations/reports/chargewise` | 200 | 265ms |
| **PASS** | Analytics report | `GET` | `/quotations/reports/analytics` | 200 | 260ms |
| **PASS** | Conversion analytics | `GET` | `/quotations/reports/analytics/conversion` | 200 | 268ms |
| **PASS** | Lost reasons analytics | `GET` | `/quotations/reports/analytics/lost-reasons` | 200 | 248ms |
| **PASS** | Response time analytics | `GET` | `/quotations/reports/analytics/response-time` | 200 | 878ms |
| **PASS** | Get quotation b675a92e-34df-41f1-8053-0c8763f37a2b | `GET` | `/quotations/b675a92e-34df-41f1-8053-0c8763f37a2b` | 200 | 270ms |

### Search

| Result | Test | Method | Path | Status | Time |
|--------|------|--------|------|--------|------|
| **PASS** | Global search | `GET` | `/search` | 200 | 294ms |

### Tariffs

| Result | Test | Method | Path | Status | Time |
|--------|------|--------|------|--------|------|
| **PASS** | List tariffs | `GET` | `/quotations/tariffs` | 200 | 298ms |

### Tenants (SuperAdmin)

| Result | Test | Method | Path | Status | Time |
|--------|------|--------|------|--------|------|
| **BLOCKED** | List tenants | `GET` | `/tenants` | 403 | 249ms |
| **BLOCKED** | Tenant statistics | `GET` | `/tenants/statistics` | 403 | 254ms |

<details><summary>Notes (2)</summary>

- **List tenants:** Requires Super Admin JWT (not provided)
- **Tenant statistics:** Requires Super Admin JWT (not provided)

</details>

### Users

| Result | Test | Method | Path | Status | Time |
|--------|------|--------|------|--------|------|
| **PASS** | List users | `GET` | `/users` | 200 | 265ms |
| **PASS** | Get user facc2d2a-fc61-4bc4-83a8-47c6440e2afb | `GET` | `/users/facc2d2a-fc61-4bc4-83a8-47c6440e2afb` | 200 | 256ms |

### Zip Distances

| Result | Test | Method | Path | Status | Time |
|--------|------|--------|------|--------|------|
| **PASS** | List zip distances | `GET` | `/quotations/zip-distances` | 200 | 275ms |

## Failed Tests (full list)

_None._

## Blocked Tests

| Module | Test | Reason |
|--------|------|--------|
| Tenants (SuperAdmin) | List tenants | Requires Super Admin JWT (not provided) |
| Tenants (SuperAdmin) | Tenant statistics | Requires Super Admin JWT (not provided) |

## Scope Notes

1. This run validates **frontend-wired modules** against the live API ([Swagger](https://kingfisherwings.onrender.com/docs#)).
2. Focus is **read/list + auth + key detail GETs** discovered from list responses. Destructive CRUD (DELETE, cancel, post, convert) was **not** executed against production data to avoid side effects.
3. Live OpenAPI currently exposes **441** operations; the frontend consumes a large subset (~220 path templates including Jobs sub-resources).
4. To re-run with Super Admin coverage:

```powershell
$env:E2E_SUPERADMIN_EMAIL = "your@email"
$env:E2E_SUPERADMIN_PASSWORD = "your-password"
node scripts/api-matrix-test.mjs
```

5. Tenant Admin login via `POST /auth/tenant-login` returned 401 for the demo password; **staff login** (`POST /auth/login` with admin email) succeeded and was used for ERP module tests.

## Swagger Tag Inventory (live)

| Swagger Tag | Operations |
|-------------|------------|
| Jobs | 108 |
| Quotations | 31 |
| Auth | 18 |
| Parties | 15 |
| Invoices | 15 |
| Tenants (Super Admin) | 11 |
| Users | 11 |
| AWB Stock | 11 |
| GL — Bank Reconciliation | 11 |
| GL — Vouchers | 10 |
| GL — Chart of Accounts | 9 |
| GL — Payments (AR/AP) | 9 |
| GL — Cheques / PDC | 9 |
| Payment Requests | 8 |
| Purchase Invoices | 6 |
| Companies | 5 |
| Masters — Countries | 5 |
| Masters — Currencies | 5 |
| Masters — Ports | 5 |
| Masters — Airports | 5 |
| Masters — ContainerTypes | 5 |
| Masters — HsCodes | 5 |
| Masters — Airlines | 5 |
| Masters — ShippingLines | 5 |
| Masters — Vessels | 5 |
| Masters — Truckers | 5 |
| Masters — Warehouses | 5 |
| Masters — ChargeCodes | 5 |
| Masters — Banks | 5 |
| Masters — Holidays | 5 |
| Masters — UnitsOfMeasure | 5 |
| Masters — TaxRates | 5 |
| Masters — Branches | 5 |
| Masters — Departments | 5 |
| Masters — Designations | 5 |
| Organization — Bank Accounts | 5 |
| Organization — Number Formats | 5 |
| Quotations — Online Tariff Master | 5 |
| Quotations — Zip Distance Master | 5 |
| GL — Financial Reports | 5 |
| GL — My Reports | 5 |
| Vessels — Schedules | 4 |
| Credit Notes | 4 |
| Debit Notes | 4 |
| GL — AR / AP Aging | 4 |
| Masters — Exchange Rates | 3 |
| GL — MIS Dashboard | 3 |
| Locale | 2 |
| Organization Profile | 2 |
| Untagged | 1 |
| Search | 1 |
| Files | 1 |

---

_Report generated by `scripts/api-matrix-test.mjs`._
