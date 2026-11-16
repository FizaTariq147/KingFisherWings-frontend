# Fresa Logo Root-Cause Audit (READ-ONLY)

**Date:** 2026-11-16  
**Scope:** Freightnest reports feature — why Fresa Technologies logos appear in implemented report UIs/PDFs  
**Constraint:** Investigation only. No code, layout, catalogue, API, schema, or git changes beyond this document.

---

## Executive conclusion

**Primary root cause:** Catalogue **browse / unbound Generate** pipelines fetch **official Fresa CDN sample PDFs** (complete documents that already contain Fresa logos and letterhead). Freightnest then runs `stampOrgChromeOnSamplePdf`, which **adds a small org logo + company name box in the top-right corner** but **does not remove, redact, or replace** the embedded Fresa logo artwork already in the PDF.

**Secondary (not Fresa logo, but branding confusion):** Product asset `@/assets/logo.png` (KingFisher) and JSON `logo: "kingfisher"` tokens exist as product/layout tokens. These are **not** Fresa logos; they can still violate “registered org only” if used when `logo_url` is empty.

**Native entity-bound HAWB official layouts and template-v2 React docs** take logos from `model.logoUrl` / org chrome and do **not** embed a Fresa logo asset. Their digital preprinted underlay (`HawbPreprintedUnderlay`) is **neutral** (no Fresa logo).

**Why the organization branding resolver does not replace the logo:** `GET /organization/profile` → `resolveReportOrgChrome` / `resolveReportCompanyBranding` only supplies chrome for **React renderers** and for the **corner stamp** on sample PDFs. Sample PDFs are treated as immutable layout shells; there is **no PDF image-rewrite** step that deletes Fresa XObject/logo streams.

---

## Branding policy (as coded)

| Item | Location | Rule |
| --- | --- | --- |
| Contract | `engines/pdf/documentBrandingContract.ts` L12–18 | `allowFresaIdentity: false`; source = `organization_profile` |
| Org chrome | `utils/resolveReportOrgChrome.ts`, `utils/resolveReportCompanyBranding.ts` | `GET /organization/profile` → name, `logo_url`, address, contact |
| Logo resolve | `constants/reportBranding.constants.ts` L46–49 | `resolveReportLogoUrl` returns tenant URL only — **no Fresa fallback** |
| Sample stamp | `utils/stampOrgChromeOnSamplePdf.ts` L29–121 | Overlays org chrome; **does not erase** Fresa artwork |

---

## 1. Branding / logo search summary

| Pattern | Finding |
| --- | --- |
| “Fresa” / fresatechnologies.com | Extensive — **sample PDF URLs**, catalogue UI labels, QA refs, comments. Not a React `<img src=fresa…>` |
| Hardcoded Fresa logo PNG/SVG in `src/` | **None found** as a dedicated Fresa logo asset |
| `@/assets/logo.png` | **KingFisher product** logo (`reportBranding.constants.ts` L8–19) |
| `logoUrl` / `logo_url` | Wired through AutoPdf, Generate, template-v2, HAWB official faces, Jasper pilot |
| JSON `branding.logo` | Token `"kingfisher"` in layout JSON (not a Fresa image URL) |
| Embedded base64 Fresa logo in FE | **Not found** in report renderers |
| QA Fresa reference PDFs | `qa/fresa-references/pdfs/*` — reference-only; contain Fresa logos by design |

---

## 2. Sample browsing vs entity-bound generated reports

| Mode | `entityBound` | Typical PDF source | Fresa logo? |
| --- | --- | --- | --- |
| Catalogue browse / unbound AutoPdf | `false` | Official Fresa CDN sample + corner stamp | **YES — embedded in sample PDF** |
| Entity-bound HAWB official (5 formats) | `true` | `generateHawbOfficialPdf` native faces | **NO** (org `logoUrl` only; underlay neutral) |
| Entity-bound HBL Jasper pilot | `true` | `HblJasperPilotDocument` | **NO** (org `logoUrl`) |
| Entity-bound HBL classic | `true` | Classic BL family / template-v2 | **NO** Fresa asset (org / empty) |
| Entity-bound invoice / AN / DO / etc. | `true` | template-v2 or JSON + org chrome | **NO** Fresa asset |
| Backend pack Generate | pack | Server Puppeteer/Excel | **Unknown FE** — BE must not ship Fresa; see §6 |

**Product priority** (documented in `generateCatalogLayoutPdf.ts` L37–41):  
`sample_browse` → `backend_pack` → `template_v2` → `json_fallback`.

---

## 3. Exact Fresa logo source by pipeline

### A. Dynamic branding configuration

| Path | Role | Injects Fresa logo? |
| --- | --- | --- |
| `resolveReportOrgChrome.ts` | Maps profile → chrome | **No** |
| `resolveReportCompanyBranding.ts` | Authoritative branding helper | **No** |
| `applySharedLayoutChrome.ts` L36–59 | Overwrites layout branding with org fields | **No** (sets `logo: "kingfisher"` token + `logoUrl` from org) |
| `brandLogoSrc.ts` L7–9 | `<img>` src from `branding.logoUrl` | **No** |

### B. Hardcoded React components

| Component | Path | Logo source |
| --- | --- | --- |
| HAWB Draft/Draft-1/Draft-2 faces | `templates/hawb/official/faces/HawbDraft*DenseFace.tsx` | `model.logoUrl` only |
| HAWB sparse Original | `faces/HawbSparseOverlayFace.tsx` L136–150 | `model.logoUrl` only; comment “never Fresa” |
| HAWB underlay | `faces/HawbPreprintedUnderlay.tsx` | Neutral grey form — **no logo** |
| HBL Jasper | `templates/hbl/jasperPilot/HblJasperPilotDocument.tsx` L114–116 | `model.logoUrl` |
| Shared `BrandHeader` | `templates/shared/BrandHeader.tsx` L36–38 | `logoUrl` prop |
| JSON invoice renderer | `JsonInvoiceLayoutRenderer.tsx` + `brandLogoSrc` | Org `logoUrl` |

**No React component hardcodes a Fresa Technologies logo image URL.**

### C. JSON layout configuration

| Item | Path | Note |
| --- | --- | --- |
| `branding.logo: "kingfisher"` | e.g. `data/hblFormatUiLayouts.json` (many blocks) | Layout **token**, not Fresa CDN logo |
| Demo/company strings | Same JSON | Often “KingFisher Wings…” placeholders after parity transforms; Fresa **theme colors** may remain via `normalizeFresaThemeColors` / `applyPriorityFresaParity` — colors ≠ logo |

### D. Embedded PDF / image underlay (PRIMARY)

| Function | File | Lines | Behavior |
| --- | --- | --- | --- |
| `fetchFresaSamplePdfBytes` | `utils/fetchFresaSamplePdfBytes.ts` | L40+ | Downloads full Fresa sample PDF (proxy `/fresa-sample` or CDN) |
| `generateHawbSamplePdf` | `utils/generateHawbSamplePdf.ts` | L20–39 | Loads sample → stamps org chrome |
| `generateHblSamplePdf` | `utils/generateHblSamplePdf.ts` | L34–52 | Same pattern |
| `generateCatalogOfficialSamplePdf` | `utils/generateCatalogOfficialSamplePdf.ts` | L90–108 | DO/WMS/HAWB/HBL official samples |
| `stampOrgChromeOnSamplePdf` | `utils/stampOrgChromeOnSamplePdf.ts` | L29–121 | Draws **130×~28–50pt** white box + org logo at **top-right**; leaves rest of PDF (including Fresa logo) intact |

**Classification:** **D — Embedded PDF/image underlay (sample shell)**  
**Dynamic vs embedded:** Fresa logo is **embedded in the fetched sample PDF**. Org logo is **dynamically stamped** on top (separate graphic). Result: **both logos can appear**.

Sample URL examples:

- HAWB: `constants/hawbFormatCatalog.ts` L15–38 → `https://fresatechnologies.com/wp-content/uploads/report-formats/hawb-*.pdf`
- HBL / DO / WMS: respective `*FormatCatalog.ts` + `data/fresaOfficialSampleCatalogue.ts`

### E. Legacy fallback

| Item | Path | Note |
| --- | --- | --- |
| HBL sample URL fallback | `generateHblSamplePdf.ts` L12–14, L23–27 | Falls back to another **Fresa** CDN PDF if code lacks URL — still Fresa artwork |
| Jasper pilot sample fallback | `generateCatalogLayoutPdf.ts` L138–143 | On pilot failure, may serve **stamped Fresa sample** |
| Product logo | `reportBranding.constants.ts` L8–19, L52–54 | KingFisher `@/assets/logo.png` — **not Fresa**, but not registered-org either |

### F. Cached / duplicated asset

| Item | Note |
| --- | --- |
| Vite `/fresa-sample` proxy | Browser/CDN cache of Fresa PDFs — same embedded logos |
| `qa/fresa-references/pdfs/` | Local copies for QA; not the catalogue runtime path (runtime uses CDN/proxy) |

---

## 4. Affected report formats (user-visible Fresa logo)

Formats are **affected when the UI serves the official sample browse path** (unbound catalogue preview / Generate without live entity). Entity-bound native paths are listed as “not affected by Fresa logo asset.”

### HAWB (five official)

| Format | Browse (unbound) | Entity-bound native |
| --- | --- | --- |
| Draft / Draft-1 / Draft-2 / Original-1 / Original-2 | **Affected** — `HawbFormatAutoPdf.tsx` L71–73 → `generateHawbSamplePdf` → Fresa PDF + stamp | **Not affected** — `generateHawbOfficialPdf` (`generateCatalogLayoutPdf.ts` L180–196) |

Original digital underlay: **no Fresa logo** (`HawbPreprintedUnderlay.tsx`). Physical sparse: overlay text only.

### HBL

| Path | Fresa logo? |
| --- | --- |
| Unbound sample (`generateHblSamplePdf`) | **Yes** (embedded in sample) |
| Jasper pilot bound | **No** (org `logoUrl`) |
| Classic family bound | **No** Fresa logo asset |

### Delivery Order / WMS ASN

| Path | Fresa logo? |
| --- | --- |
| Unbound `generateCatalogOfficialSamplePdf` (`generateCatalogLayoutPdf.ts` L222–242) | **Yes** |
| Bound template-v2 / JSON | **No** Fresa logo asset |

### Invoice / Arrival Notice / Quotation / other JSON or template-v2

| Path | Fresa logo? |
| --- | --- |
| JSON / template-v2 with org chrome | **No** Fresa logo asset |
| If Generate falls through to official sample where wired | **Yes** via same stamp path |

### Catalogue UI chrome (not PDF content)

`FresaCatalogSection`, `FresaFormatCard`, “Fresa sample” labels — product naming for the format browser; not the PDF logo, but reinforces Fresa identity in the UI shell.

---

## 5. Why the org branding resolver does not replace it

1. **Sample PDFs are whole documents**, not templates with a replaceable logo slot.  
2. `stampOrgChromeOnSamplePdf` **compositing only** (draw white rect + org logo). It never enumerates or deletes PDF image XObjects.  
3. Org resolver outputs are consumed by:
   - React `<img src={logoUrl}>` in native/JSON paths, and  
   - the stamp helper’s `embedLogoImage(chrome.logoUrl)`.  
4. The Fresa logo remaining on page is **outside** that data flow — it is already painted in the sample page content stream.  
5. Contract `allowFresaIdentity: false` is **not enforced** on the sample-browse code path; that path still ships Fresa-hosted PDFs by design for layout fidelity.

---

## 6. Preprinted underlays — can Fresa logo be removed safely?

| Underlay | Contains Fresa logo? | Safe removal? |
| --- | --- | --- |
| `HawbPreprintedUnderlay` (native Original) | **No** | N/A — already clean |
| Official Fresa **sample PDF** used as browse shell | **Yes** (full letterhead/logo) | **Not safely via silent crop** without damaging form art. Options: (1) stop using sample as entity PDF; (2) white-box cover known logo bbox per format (fragile); (3) rebuild native faces (already done for HAWB official) |

**Recommendation:** Do **not** try to surgically erase logos from arbitrary Fresa samples. Prefer **native / template-v2 / pack** for any PDF presented as Freightnest-generated output.

---

## 7. Recommended correction per source

| Source | Recommendation |
| --- | --- |
| **D — Sample PDF browse** | Keep samples for **reference browser only**, labeled as “Official layout sample (third-party artwork)”. For **Generate / download / entity preview**, never return unredacted Fresa samples. Prefer native HAWB, Jasper/classic HBL, template-v2, or backend packs. |
| **Stamp helper** | If sample browse must show org branding, expand stamp to **cover known Fresa logo regions** per format **or** show sample in a “Reference” pane separate from “Freightnest PDF”. Do not claim stamp = full rebrand. |
| **A — Org chrome** | Keep as SoT; ensure AutoPdf/Generate always pass `logoUrl` from profile on native paths (already mostly wired). |
| **E — Product `@/assets/logo.png`** | Never substitute for missing `logo_url` on customer PDFs; omit `<img>` (current `resolveReportLogoUrl` intent). |
| **C — JSON `logo: kingfisher`** | Treat as layout token only; always prefer `logoUrl` for rendering (`brandLogoSrc` already does). |
| **Backend packs** | Audit server templates for Fresa image assets; inject `logo_url` / `logo_base64` only (`BACKEND_FRESA_100_PERCENT_PARITY.md` already states this). |
| **UI copy** | Soften “Fresa sample with KingFisher logo” messaging in `ReportGeneratePanel.tsx` so users are not led to expect Fresa logos removed from sample shells. |

---

## 8. Safe implementation plan (preserve layout fidelity)

**Phase A — Clarify surfaces (no layout redraw)**  
1. Split UI: “Reference sample (Fresa)” vs “Freightnest document”.  
2. Gate Generate/download: if `entityBound`, forbid sample PDF path (HAWB already does; extend to HBL/DO/WMS consistently).  
3. Unbound Generate: prefer native HAWB official / Jasper / template-v2 over stamped sample when available.

**Phase B — Sample path hygiene**  
1. Document that `stampOrgChromeOnSamplePdf` is **additive only**.  
2. Optional: per-format logo cover rectangles (measured from samples) — QA-gated; do not invent crops that clip form grid.  
3. Never mutate `qa/fresa-references` used for visual regression as if they were production templates.

**Phase C — Native completeness**  
1. Keep HAWB five-format native as the entity-bound SoT (already).  
2. Expand native/template-v2 for families still forced through sample browse.  
3. Regression: entity-bound PDFs must contain **zero** Fresa logo bitmaps (image hash / OCR of “FRESA” in logo regions).

**Phase D — Org logo reliability**  
1. Ensure CORS-safe logo embed (proxy or same-origin) so stamp/native actually show registered logo.  
2. If logo fetch fails, omit image — do not fall back to Fresa or fabricate product logo as tenant mark.

**Out of scope for safe logo fix:** Changing HAWB five-format governance, MediaBox geometry, or deleting form lines from underlays.

---

## 9. Callers that surface the primary defect

| Caller | File | Relevant lines |
| --- | --- | --- |
| HAWB AutoPdf unbound | `components/ReportCatalog/HawbFormatAutoPdf.tsx` | L71–73 |
| HBL AutoPdf sample mode | `components/ReportCatalog/HblFormatAutoPdf.tsx` | sample path via `generateHblSamplePdf` |
| Catalog router | `utils/generateCatalogLayoutPdf.ts` | L150–171 (HBL sample), L198–219 (HAWB unbound sample), L222–242 (DO/WMS) |
| Generate panel | `components/ReportCatalog/ReportGeneratePanel.tsx` | Official sample preference when unbound; copy L650–685 |
| Stamp | `utils/stampOrgChromeOnSamplePdf.ts` | L43–70 (org logo draw); **no Fresa erase** |

---

## 10. Final root-cause statement

1. **Root cause #1 (dominant):** Freightnest **reuses complete Fresa sample PDFs** for catalogue browse and unbound Generate. Those PDFs **embed the Fresa Technologies logo**. Org branding is only **stamped** in a corner, so the Fresa logo **remains visible**.  
2. **Root cause #2 (resolver gap):** Organization profile branding is correctly wired for **native/React** paths but is **never applied as a replacement** for sample-PDF embedded images.  
3. **Non-cause:** There is **no** dedicated Fresa logo React import or base64 asset in the FE report renderers. Native HAWB Original underlay is **not** a Fresa-logo underlay.  
4. **Related risk:** Product KingFisher `logo.png` / `"kingfisher"` tokens can appear when org `logo_url` is missing — wrong tenant branding, but **not** Fresa.

**STOP.** No fixes implemented in this investigation.
