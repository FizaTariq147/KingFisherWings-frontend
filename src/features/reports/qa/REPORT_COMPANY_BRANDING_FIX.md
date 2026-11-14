# Report Company Branding Fix

**Date:** 2026-11-14

## Source of truth

`GET /organization/profile` via `organizationService.getProfile()`  
Resolver: `resolveReportOrgChrome` / `resolveReportCompanyBranding`

Fields: `display_name` | `name`, `logo_url`, address/city/country, phone, email, website, `vat_number`.

## Before

- Classic HBL family PDFs hardcoded `@/assets/logo.png` + `KingFisher Wings`.
- Chrome often omitted `logoUrl` when building capture models.
- Missing profile still risked product defaults in older paths.

## After

- `resolveReportCompanyBranding` centralizes branding DTO.
- Classic / BlFamily documents render logo/name only from model (`logoUrl`, `companyName`).
- `InvoiceFormatLayoutByKind` forwards `data.logoUrl`.
- AutoPdf / Generate merge org chrome into PDF data including `logoUrl`.
- Soft logout + tenant-scoped org query keys reduce cross-tenant leakage.

## Multi-company verification

Application branding is **organization-profile scoped** (one profile per tenant JWT).  
ERP `/companies` list is for job company pickers, not report letterhead.  
Changing org profile logo/name changes report chrome on next resolve; tenant-keyed cache isolates tenants after soft logout.

If product needs per-branch letterhead, that requires explicit branch fields on reports — **not invented here**.

## Live verification (2026-11-14)

| Step | Result |
| --- | --- |
| Auth | E2E staff login to tenant `demo-trade-house` |
| Profile | `GET /organization/profile` → **KingFisher Logistic Solutions LLC**, `logo_url` on `cdn.demo-trade.ae` |
| HBL Jasper PDF | Header/agent/signature use registered company name (see `visual-evidence/branding/company1-hbl-jasper-page1.png`) |
| HAWB Draft PDF | Org stamp includes registered company name (pdf text + `company1-hawb-draft.pdf`) |
| Second company | **Unavailable** — no second E2E tenant credentials; dual-company isolation not executed |
| Graphical logo | URL resolved from profile; embed may omit when remote CORS blocks image fetch — name still shown |

Evidence folder: `src/features/reports/qa/visual-evidence/branding/`  
Manifest: `visual-evidence/FINAL_VISUAL_VERIFY_MANIFEST.json`

## Remaining limitation

1. Default invoice/quotation `POST /:id/pdf` paths outside catalogue still use product chrome — out of Reports catalogue scope.
2. Dual-company visual proof requires a second authorized tenant (not present in `.env.e2e`).
3. Remote `logo_url` CORS can prevent embedding the bitmap while still applying registered name/address.
