# Phase 3 — Branding Separation Report

**Date:** 2026-11-16  
**Baseline:** `FRESA_LOGO_ROOT_CAUSE_AUDIT.md`  
**Constraint:** Local only — no push, no commit, no schema/API changes, five official HAWB formats preserved.

---

## Verdict

**Freightnest Generate and entity-bound paths no longer use Fresa sample PDFs as the final document.**  
Browse continues to show unmodified Fresa CDN reference samples, labelled as third-party artwork. Organization profile remains the sole branding source for generated PDFs; missing logos omit the logo (no Fresa fallback).

---

## Workflow separation

| Mode | Workflow id | PDF source | Fresa artwork |
| --- | --- | --- | --- |
| Catalogue browse (unbound + official sample) | `reference_browse` | Unmodified Fresa CDN sample (`skipOrgStamp: true`) | Present by design; labelled |
| Generate panel / entity-bound | `freightnest_generate` | Native HAWB / HBL Jasper / template-v2 / JSON / backend pack | **Not used as final PDF** |

Resolver: `src/features/reports/utils/reportPdfWorkflow.ts`  
Safe default when purpose is omitted: **`freightnest_generate`** (prevents accidental stamped-sample Generate).

Label: `Official Fresa reference sample (third-party artwork — not a Freightnest-generated document)`

---

## Changed files (Phase 3 core)

### New
- `src/features/reports/utils/reportPdfWorkflow.ts`
- `src/features/reports/qa/phase3BrandingSeparation.test.ts`
- `src/features/reports/qa/PHASE3_BRANDING_SEPARATION_REPORT.md` (this file)

### Updated (workflow / gates / browse labelling)
- `src/features/reports/utils/generateCatalogLayoutPdf.ts` — sample branches gated by `allowsFresaSamplePdf`; Generate uses native/v2/classic
- `src/features/reports/utils/preferOfficialSamplePdf.ts` — prefer samples only for `purpose: 'browse'`
- `src/features/reports/utils/clientLayoutFallback.ts` — `hasOfficialSample` ignored for Generate eligibility
- `src/features/reports/utils/catalogFormatStatus.ts` — HAWB five = native Generate; official samples = reference browse only
- `src/features/reports/utils/generateHawbSamplePdf.ts` / `stampOrgChromeOnSamplePdf.ts` — browse keeps artwork unmodified
- `src/features/reports/components/ReportCatalog/ReportGeneratePanel.tsx` — `purpose: 'generate'` / `workflow: freightnest_generate`
- `src/features/reports/components/ReportCatalog/HawbFormatAutoPdf.tsx` — unbound → labelled Fresa sample; bound → native Generate
- `src/features/reports/components/ReportCatalog/HblFormatAutoPdf.tsx` — same split
- `src/features/reports/components/ReportCatalog/DeliveryOrderFormatAutoPdf.tsx` — unbound official sample → browse; bound → Generate
- `src/features/reports/components/ReportCatalog/ArrivalNoticeFormatAutoPdf.tsx` — Freightnest generate path only
- `src/features/reports/hooks/useCatalogFormatLayoutPdf.tsx` — WMS/shared AutoPdf: browse samples when unbound + sample exists

### Tests updated for Phase 3 semantics
- `preferOfficialSamplePdf.test.ts`
- `clientLayoutFallback.test.ts`
- `fresaOfficialSampleCatalogue.test.ts`
- `sharedShellHonesty.test.ts`
- `phase6Regression.test.ts`

---

## Formats corrected (Generate no longer ends on Fresa sample)

| Family | Codes / path | Generate source |
| --- | --- | --- |
| HAWB (official five) | `HAWB_DRAFT_REPORT_FORMAT`, `_1`, `_2`, `HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_1`, `_2` | `generateHawbOfficialPdf` native faces + org branding |
| HBL Jasper pilot | `HBL_DRAFT_REPORT_FORMAT_JASPER` | Jasper pilot → classic fallback (not sample on Generate) |
| HBL family (entity / Generate) | HBL catalogue codes | classic / template-v2 |
| Delivery orders (Generate / entity) | DO codes with samples | template-v2 / JSON / pack — **not** stamped Fresa sample |
| WMS ASN (Generate / entity) | e.g. `ADVANCE_SHIPPING_NOTE` | template-v2 / JSON — **not** stamped Fresa sample |
| Invoices / quotations / arrival (Generate) | via Generate panel + AutoPdf | template-v2 / JSON + org chrome |
| Catalogue AutoPdf unbound with verified sample | HAWB / HBL / DO / WMS samples | **Browse only** — labelled reference |

---

## Formats still reference-only (or non-native for Generate)

Do **not** claim these as natively implemented solely because a Fresa sample exists.

| Status | Examples | Notes |
| --- | --- | --- |
| Official sample (browse) | 40 verified DO PDFs, 5 WMS ASN, HAWB five CDN refs, HBL catalogue samples | Unmodified Fresa artwork for comparison |
| Shared shell | Arrival Notice Format-11+ → Format-1 Jasper shell | Freightnest shared layout; `claimsFresaExactMatch: false` |
| Backend pack | Pack-bound enrichment codes | Server Puppeteer/Excel when activated — FE must not substitute Fresa sample |
| Historical / unverified | Non-official HAWB extras, catalogue entries without verified PDF / native renderer | Resolvable historically; not official five |
| Invoice / accounts / AN CDN catalogue | Pending URL extraction in Fresa section meta | No FE claim of pixel-native Fresa layouts |

---

## Organization branding

| Rule | Implementation |
| --- | --- |
| Single source of truth | `resolveReportCompanyBranding` / `resolveReportOrgChrome` ← `GET /organization/profile` |
| Logo | `resolveReportLogoUrl` — tenant URL only; empty → omit |
| Contract | `REPORT_BRANDING_RULES.allowFresaIdentity === false` |
| No Fresa fallback | Covered by Phase 3 + `reportCompanyBranding` tests |

---

## PDF integrity

- Preview and download share the same generated blob (`hawbOfficialPreviewDownloadSameBlob`; Generate panel returns one blob for viewer + download).
- Native HAWB underlays remain; branding separation does **not** strip form underlays to hide logos.
- No fabricated shipment/financial/customer data introduced in this phase.
- Unsupported native Generate → catalogue honesty (`official_sample` / `historical_unverified` / pack), not a fake format-specific layout.

---

## Evidence: generated PDFs no longer contain Fresa branding

1. **Control-plane proof (automated):**  
   - `shouldPreferOfficialSamplePdf(..., purpose: 'generate') === false` for all official HAWB + DO/WMS sample codes.  
   - `allowsFresaSamplePdf(freightnest_generate) === false`.  
   - `generateCatalogLayoutPdf` sample branches require `allowSample` from `reference_browse` only.  
   - Generate panel / entity AutoPdf pass `workflow: freightnest_generate`.  
   - Browse AutoPdf uses `skipOrgStamp: true` (no corner stamp over reference artwork).

2. **Native path proof:** Official HAWB Generate uses React faces with `model.logoUrl` from org profile; `HawbPreprintedUnderlay` is neutral (no Fresa logo asset). HBL Jasper pilot uses org `logoUrl` only.

3. **Negative logo fallback proof:** `resolveReportLogoUrl(undefined|''|null)` → `undefined`; branding contract forbids Fresa identity.

4. **Not claimed:** Byte-level OCR of every CDN sample vs every generated PDF in CI. Separation is enforced at the workflow gate so Generate cannot select a Fresa sample as the final source.

---

## Test results

Command (local):

```text
npx vitest run \
  src/features/reports/qa/phase3BrandingSeparation.test.ts \
  src/features/reports/utils/preferOfficialSamplePdf.test.ts \
  src/features/reports/utils/clientLayoutFallback.test.ts \
  src/features/reports/qa/fresaOfficialSampleCatalogue.test.ts \
  src/features/reports/qa/sharedShellHonesty.test.ts \
  src/features/reports/qa/phase6Regression.test.ts \
  src/features/reports/templates/hawb/official/phase2HawbOfficial.test.ts \
  src/features/reports/templates/hawb/official/phase2_3Acceptance.test.ts \
  src/features/reports/templates/hawb/official/phase2_4Acceptance.test.ts \
  src/features/reports/templates/hbl/jasperPilot/hblJasperPilot.config.test.ts \
  src/features/reports/constants/hawbFormatCatalog.test.ts \
  src/features/reports/utils/catalogFormatStatus.test.ts \
  src/features/reports/utils/reportCompanyBranding.test.ts \
  --reporter=dot
```

**Result: 13 files, 99 tests — all passed.**

Phase 3 suite covers:
1. Browse may display Fresa reference PDFs  
2. Generate never prefers Fresa sample as final source  
3. Org branding applied when present  
4. Missing org logo does not fall back to Fresa  
5. Preview/download same HAWB blob  
6. Five HAWB formats + HBL Jasper governance still green  

---

## Remaining limitations

1. **Backend packs** — FE cannot guarantee server-rendered pack PDFs exclude Fresa; pack authors must use org branding.
2. **DO / WMS Generate** — after sample removal, look comes from template-v2/JSON (not Fresa pixel clones); still honestly statused as official_sample for browse.
3. **HBL catalogue samples** — still available for unbound browse; Generate uses classic/v2/Jasper, which are not Fresa pixel matches.
4. **Invoice/AN Fresa CDN URL extraction** — still pending; does not unblock Generate (already Freightnest paths).
5. **Product `kingfisher` logo token** — layout JSON token for chrome structure; registered org logo still preferred when present; empty org logo omits image (no Fresa).

---

## Strict restrictions checklist

| Restriction | Status |
| --- | --- |
| Exactly five official HAWB formats | Preserved (`HAWB_FORMAT_CATALOG` length 5) |
| Historical format resolution | Preserved |
| Reference PDFs not deleted | Preserved |
| No DB schema / API changes | Observed |
| No unrelated modules | Reports feature only |
| No generic layouts pretending to be format-specific | Observed |
| No push / commit | Observed |
