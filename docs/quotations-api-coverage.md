# Quotations API Coverage Report

Source: live Swagger `https://kingfisherwings-backend.onrender.com/docs` (`/docs-json`), tag group **Quotations** (+ Online Tariff Master + Zip Distance Master under `/quotations/*`).

**Audited:** 2026-07-15  
**State management:** TanStack Query (React Query) — same as other ERP feature modules. **No Redux slice** (project pattern; not a gap).

---

## Summary

| Metric | Value |
|--------|------:|
| Total Quotations APIs in Swagger (`/quotations*`) | **41** |
| Implemented (API service + types + hooks) | **41** |
| Missing APIs | **0** |
| UI connected | **41** |
| API coverage | **100%** |

---

## Coverage matrix

Legend: Y = Yes. Redux = N/A (React Query). Validation = Zod via `@/lib/validation` / `useAppForm` where a form exists; workflow actions use confirm modals + typed DTOs.

### Core quotations (31)

| Endpoint | Method | Purpose | Impl | UI | Service | Req/Res types | RQ | Valid. | Loading | Errors | Perms |
|----------|--------|---------|------|----|---------|--------------|----|--------|---------|--------|-------|
| `/quotations` | GET | List + filters/pagination | Y | List + widget | Y | Y | Y | filters | Y | Y | `menu_quotations` |
| `/quotations` | POST | Create DRAFT | Y | Create form | Y | Y | Y | Y | Y | Y | Y |
| `/quotations/online-quote` | POST | Tariff auto-calc widget | Y | Online quote page | Y | Y | Y | Y | Y | Y | Y |
| `/quotations/expire-due` | POST | Batch expire cron | Y | List “Expire due” | Y | Y | Y | n/a | Y | Y | Y |
| `/quotations/reports/chargewise` | GET | Chargewise report | Y | Reports tab | Y | Y | Y | date filters | Y | Y | Y |
| `/quotations/reports/analytics` | GET | Analytics summary | Y | Reports tab | Y | Y | Y | date filters | Y | Y | Y |
| `/quotations/reports/analytics/conversion` | GET | Conversion rates | Y | Reports tab | Y | Y | Y | date filters | Y | Y | Y |
| `/quotations/reports/analytics/lost-reasons` | GET | Lost reasons | Y | Reports tab | Y | Y | Y | date filters | Y | Y | Y |
| `/quotations/reports/analytics/response-time` | GET | Response time | Y | Reports tab | Y | Y | Y | date filters | Y | Y | Y |
| `/quotations/{id}` | GET | Detail + lines/history/approvals | Y | Detail | Y | Y | Y | n/a | Y | Y | Y |
| `/quotations/{id}` | PATCH | Update header | Y | Edit form | Y | Y | Y | Y | Y | Y | Y |
| `/quotations/{id}` | DELETE | Soft-delete DRAFT | Y | Detail/list | Y | Y | Y | confirm | Y | Y | Y |
| `/quotations/{id}/revisions` | GET | Revision chain | Y | Detail sidebar | Y | Y | Y | n/a | Y | Y | Y |
| `/quotations/{id}/lines` | POST | Add charge line | Y | Lines editor | Y | Y | Y | Y | Y | Y | Y |
| `/quotations/{id}/lines/{lineId}` | PATCH | Update line | Y | Lines editor | Y | Y | Y | Y | Y | Y | Y |
| `/quotations/{id}/lines/{lineId}` | DELETE | Remove line | Y | Lines editor | Y | Y | Y | Y | Y | Y | Y |
| `/quotations/{id}/apply-tariff` | POST | Auto line from tariff | Y | Lines editor | Y | Y | Y | n/a | Y | Y | Y |
| `/quotations/{id}/submit` | POST | DRAFT→SUBMITTED | Y | Detail actions | Y | Y | Y | confirm | Y | Y | Y |
| `/quotations/{id}/approve` | POST | SUBMITTED→APPROVED | Y | Detail actions | Y | Y | Y | comments | Y | Y | Y |
| `/quotations/{id}/reject` | POST | SUBMITTED→REJECTED | Y | Detail actions | Y | Y | Y | comments | Y | Y | Y |
| `/quotations/{id}/send` | POST | APPROVED→SENT | Y | Detail actions | Y | Y | Y | confirm | Y | Y | Y |
| `/quotations/{id}/mark-won` | POST | SENT→WON | Y | Detail actions | Y | Y | Y | confirm | Y | Y | Y |
| `/quotations/{id}/mark-lost` | POST | SENT→LOST | Y | Detail actions | Y | Y | Y | reason schema | Y | Y | Y |
| `/quotations/{id}/duplicate` | POST | New revision DRAFT | Y | Detail/list | Y | Y | Y | confirm | Y | Y | Y |
| `/quotations/{id}/convert-to-job` | POST | WON→CONVERTED | Y | Detail (+navigate job) | Y | Y | Y | confirm | Y | Y | Y |
| `/quotations/{id}/archive` | POST | Archive closed | Y | Detail actions | Y | Y | Y | confirm | Y | Y | Y |
| `/quotations/{id}/expire` | POST | Manual expire | Y | Detail actions | Y | Y | Y | confirm | Y | Y | Y |
| `/quotations/{id}/pdf` | POST | Queue PDF | Y | PDF modal | Y | Y | Y | mode enum | Y | Y | Y |
| `/quotations/{id}/pdf` | GET | PDF URLs / tasks | Y | PDF modal | Y | Y | Y | n/a | Y | Y | Y |
| `/quotations/{id}/pdf/status` | GET | PDF task status | Y | PDF modal poll | Y | Y | Y | n/a | Y | Y | Y |
| `/quotations/{id}/send-email` | POST | Email PDF | Y | Email modal | Y | Y | Y | Y | Y | Y | Y |

### Online Tariff Master (5)

| Endpoint | Method | Purpose | Impl | UI | Service | Types | RQ | Valid. | Loading | Errors | Perms |
|----------|--------|---------|------|----|---------|-------|----|--------|---------|--------|-------|
| `/quotations/tariffs` | GET | List | Y | Tariff list | Y | Y | Y | filters | Y | Y | Y |
| `/quotations/tariffs` | POST | Create | Y | Tariff create | Y | Y | Y | Y | Y | Y | Y |
| `/quotations/tariffs/{id}` | GET | Detail | Y | Tariff detail | Y | Y | Y | n/a | Y | Y | Y |
| `/quotations/tariffs/{id}` | PATCH | Update | Y | Tariff edit | Y | Y | Y | Y | Y | Y | Y |
| `/quotations/tariffs/{id}` | DELETE | Soft-delete | Y | Tariff actions | Y | Y | Y | confirm | Y | Y | Y |

### Zip Distance Master (5)

| Endpoint | Method | Purpose | Impl | UI | Service | Types | RQ | Valid. | Loading | Errors | Perms |
|----------|--------|---------|------|----|---------|-------|----|--------|---------|--------|-------|
| `/quotations/zip-distances` | GET | List | Y | Zip list | Y | Y | Y | filters | Y | Y | Y |
| `/quotations/zip-distances` | POST | Create | Y | Zip create | Y | Y | Y | Y | Y | Y | Y |
| `/quotations/zip-distances/{id}` | GET | Detail | Y | Zip detail | Y | Y | Y | n/a | Y | Y | Y |
| `/quotations/zip-distances/{id}` | PATCH | Update | Y | Zip edit | Y | Y | Y | Y | Y | Y | Y |
| `/quotations/zip-distances/{id}` | DELETE | Soft-delete | Y | Zip actions | Y | Y | Y | confirm | Y | Y | Y |

---

## Validation rules (Quotations forms)

Central stack: `useAppForm` + Zod (`quotation.schema.ts`) + `@/lib/validation` helpers.

- Trim / empty→undefined; whitespace-only blocked on required text
- Validate on blur (`onTouched`) + submit; focus first invalid field
- Duplicate submit guarded by `isPending` / disabled buttons
- API field errors mapped via `applyApiErrors`
- **Header:** required customer + job type + currency; optional UUIDs; origin ≠ destination; `valid_until` not in the past; DG ⇒ `dg_class`; contact name 2–100 (no consecutive spaces); email lowercase format; phone E.164; amounts ≥ 0; discounts 0–100%; HS code helper
- **Lines:** charge code UUID, description, unit price ≥ 0, currency, optional qty/tax/supplier
- **Email:** required to-email; optional CC; PDF mode enum
- **Online quote:** tenant slug, job type, currency; origin ≠ dest
- **Lost:** reason enum + optional notes
- **Tariffs / zip:** existing feature schemas (rates ≥ 0, date ranges, from≠to)

---

## Demo data

`src/features/quotations/utils/quotationDemoData.ts` + **Fill demo data** on create form.

Uses **live** customer / port / company / currency options from masters/parties (no hardcoded FKs).

Sample business values: `SEA_FCL_EXPORT`, FOB, HS `8471.30`, weights/CBM/pieces, 14-day validity, contact `Ayla Operations` / `ops.contact@customer.example` / `+971501234567`, AED, routing remarks, demo line “Ocean freight — 40HC FCL…”.

---

## Files created or modified (this pass)

- `src/features/quotations/schemas/quotation.schema.ts`
- `src/features/quotations/utils/quotationDemoData.ts`
- `src/features/quotations/components/QuotationForm/QuotationForm.tsx`
- `src/features/quotations/components/QuotationLinesEditor/QuotationLinesEditor.tsx`
- `src/features/quotations/components/QuotationEmailModal/QuotationEmailModal.tsx`
- `src/features/quotations/components/QuotationPdfModal/QuotationPdfModal.tsx`
- `src/features/quotations/pages/QuotationDetailPage.tsx`
- `src/features/quotations/pages/QuotationCreatePage.tsx`
- `src/features/quotations/pages/QuotationEditPage.tsx`
- `src/features/quotations/pages/QuotationOnlineQuotePage.tsx`
- `src/features/quotations/config/quotationsMenu.ts`
- `src/router/index.tsx` (`menu_quotations` route group + online-quote)
- `src/components/widgets/PendingQuotationsWidget.tsx`
- `docs/quotations-api-coverage.md` (this file)
- Prior module files: `api/`, `services/`, `hooks/`, tariffs, zipDistances (already present)

---

## Backend dependencies / blockers

- Quotation **number** is server-assigned (no FE code field to validate as `^[A-Z0-9-]+$`).
- `POST /quotations/expire-due` is cron-oriented; FE exposes a manual trigger for admins/ops.
- `POST /quotations/online-quote` is documented as public widget; FE currently sits behind tenant ERP auth + `menu_quotations` (tenant slug still required in payload).
- Convert-to-job navigates to `/jobs/{job_id}` only when backend returns `job_id`.
- Reports analytics responses vary in shape; UI shows structured JSON (not redesigned charts).
- Permission key `menu_quotations`: empty permissions list still allows access (AuthContext allow-all); when `/auth/me` returns real menus, routes enforce the gate.

---

## Production readiness

**Confirmed:** All **41** Swagger `/quotations*` endpoints have API services, TypeScript types, React Query hooks, JWT/Axios interceptors, loading/error handling, and UI entry points. Centralized form validation is applied on create/edit/lines/email/online-quote. Demo seed helper uses live masters. No mock quotation list data remains in the feature module.

**Residual polish (non-blocking):** richer report tables/charts; fine-grained action permissions beyond `menu_quotations`; public (unauthenticated) online-quote landing if product requires it.
