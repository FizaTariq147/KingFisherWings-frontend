# Report Company Branding Audit

**Date:** 2026-11-14  
**Branch:** `develop` (local; uncommitted HBL Jasper pilot preserved)  
**Scope:** Reports & MIS frontend only

## Authoritative source

| Field | Source | API / module |
| --- | --- | --- |
| Legal name | `OrganizationProfile.name` | `GET /organization/profile` via `organizationService.getProfile()` |
| Display / trade name | `OrganizationProfile.display_name` (preferred for reports) | same |
| Logo | `OrganizationProfile.logo_url` | same (+ Organization Profile form upload) |
| Address | `address`, `city`, `country_code` | same |
| Phone / email | `phone`, `email` | same |
| Website | `website` | same |
| Tax / VAT | `vat_number` (+ `cr_number`, customs codes) | same |
| Branch | Report params may include `branch_id`; **not** used today as branding source | registry defaultParams |

**Resolver:** `resolveReportOrgChrome()` → `chromeFromOrganizationProfile()`  
**Injection:** `applySharedLayoutChrome()`, AutoPdf merges, `stampOrgChromeOnSamplePdf()`, template-v2 `logoUrl` args.

Tenant `/companies` list (`fetchTenantCompanyOptions`) provides company pickers for jobs — **not** the report header logo/name source. Active branding is organization profile for the authenticated tenant.

## Data flow

```
Auth JWT tenant
  → organizationService.getProfile()
  → ReportOrgChrome { company, address, web, phone, email, logoUrl, packFields }
  → applySharedLayoutChrome / InvoiceFormatPdfData / stampOrgChrome / BrandHeader
  → PDF / preview
```

## Gaps found (before this task)

1. **Fabricated chrome:** `SHARED_LAYOUT_CHROME` hardcoded KingFisher Wings + Dubai address/phone/email when profile missing.
2. **Placeholder logo:** `resolveReportLogoUrl` / `brandLogoSrc` fell back to `@/assets/logo.png` as if it were the registered logo.
3. **Hardcoded names:** `BrandHeader`, Jasper pilot, `stampOrgChromeOnSamplePdf`, classic BL model defaulted to `KingFisher Wings`.
4. **JSON layout demos:** Generated `*FormatUiLayouts` still embed demo company strings in static JSON (overridden at runtime by `applySharedLayoutChrome` when chrome is applied).
5. **Multi-company / branch:** No per-branch logo override in report chrome; risk is low if org profile is tenant-scoped, but branch-specific letterhead is **not** implemented.
6. **Fresa branding:** Sample PDF body may contain Fresa demo parties; org stamp/header is intended to be tenant — never register Fresa as company.

## Safe changes applied (this task)

- Empty chrome when profile unavailable (no invented contact details).
- Logo only from `logo_url`; omit `<img>` when empty.
- Company name omitted when empty (no `KingFisher Wings` substitute).
- Jasper pilot + AutoPdf / Generate panel pass `logoUrl` from org chrome.
- Classic BL model no longer defaults company name to KingFisher Wings.

## Remaining gaps (documented, not blocking)

- Static generated JSON demo branding strings remain in layout files (runtime override covers catalogue PDFs).
- Branch-specific branding requires product decision + possible backend fields.
- When profile API fails, reports show blank brand area — operators must complete Organization Profile.
- Default invoice/quotation PDFs (`POST /invoices|quotations/:id/pdf`) still use a separate KF product chrome path — out of catalogue scope; reuse `ReportOrgChrome` later if product wants parity.
- VAT/TRN is available on org profile and pack fields but not drawn on every layout header (format-specific).
- Sample PDF logo stamp may fail silently on CORS-blocked remote `logo_url` (omit logo rather than invent one).

## Cross-tenant cache leakage (follow-up from branding audit)

[Company branding audit](02e565a2-65b8-40c9-b96b-05e55a51c11c) flagged that `organizationKeys.profile()` was not tenant-UUID keyed and soft idle logout did not clear React Query — risk of stamping the previous tenant’s logo/name after re-login in the same SPA.

**Mitigation applied:**

- `organizationKeys` / bank / number-format keys now include `tenantId`.
- `softSignOutToLogin` removes queries under `['tenant']`.

## Consumers of shared branding helpers

- `resolveReportOrgChrome` — AutoPdf panels, Generate panel, sample PDF stamp
- `applySharedLayoutChrome` — JSON layout renderer / preview PDF
- `brandLogoSrc` — HblBlShell, HawbAwbShell, JsonInvoiceLayoutRenderer
- `BrandHeader` — template-v2 documents (invoice, HAWB, DO, voucher, …)
- Jasper pilot `HblJasperPilotDocument` — registered `logoUrl` / `companyName`
