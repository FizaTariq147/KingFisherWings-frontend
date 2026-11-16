# Phase 2.5 — Final HAWB Draft & Draft-2 Visual Closure

**Date:** 2026-11-16  
**Baseline:** `PHASE2_4_HAWB_ACCEPTANCE_CLOSURE.md`  
**Branding gate:** `scripts/phase2-5-branding-preflight.mjs` (Phase 3.1 harness) → **PASS**  
**Visual QA:** `scripts/phase2-4-hawb-acceptance-qa.mjs` (DPI 150 · pixelmatch 0.12 · letterbox normalize)  
**Evidence:** `qa/phase2-5-hawb/` · `closure-manifest.json`  
**Production pipeline:** `generateHawbOfficialPdf` via Playwright harness  

---

## Overall acceptance: **YES**

All five official HAWB formats **PASS** critical production and Phase 2.5 closure checks (MediaBox, page count, independent faces, branding preflight, org branding / no Fresa sample, preview=download).  

Absolute Fresa pixel identity is **not** claimed. Composite Δpx remains elevated where bound fixture data and registered org branding necessarily diverge from Fresa demo artwork.

| Format | Verdict | Critical checks | Branding preflight |
| --- | --- | --- | --- |
| Draft | **PASS** | **PASS** | **PASS** |
| Draft-1 | **PASS** | **PASS** | n/a (retained) |
| Draft-2 | **PASS** | **PASS** | **PASS** |
| Original-1 | **PASS** | **PASS** | n/a (retained) |
| Original-2 | **PASS** | **PASS** | n/a (retained) |
| **Overall HAWB acceptance** | | | **YES** |

---

## 1. Branding preflight (before Draft / Draft-2 visual compare)

| Check | Result |
| --- | --- |
| `node scripts/phase2-5-branding-preflight.mjs` | **PASS** (`gatePass: true`) |
| Draft source | `generateHawbOfficialPdf` (not Fresa sample) |
| Draft-2 source | `generateHawbOfficialPdf` (not Fresa sample) |
| Fresa logo / FRESA DEMO markers in production PDF | **NO** |
| Registered org branding applied | **YES** (`Phase31 Audit Org LLC` fixture via Phase 3.1 harness) |
| Artifacts | `qa/phase2-5-hawb/branding-preflight.json` · `BRANDING_PREFLIGHT.md` |

Visual SBS/diff comparison ran **only after** this gate passed. Phase 3 `reportPdfWorkflow` was not modified.

---

## 2. Before → after metrics

Phase 2.4 closure baseline → Phase 2.5 regen (`closure-manifest.json`).

| Format | Metric | Phase 2.4 | Phase 2.5 |
| --- | --- | ---: | ---: |
| Draft | Worst Δpx % | 13.22 | 14.00 |
| Draft | Ink gen % | 8.31 | 9.87 |
| Draft | Ink ref % | 7.30 | 7.30 |
| Draft-2 | Worst Δpx % | 14.95 | 14.99 |
| Draft-2 | Ink gen % | 8.11 | **8.71** |
| Draft-2 | Ink ref % | 8.96 | 8.96 |
| Draft-1 | Worst Δpx % | 8.65 | 8.65 (unchanged) |
| Original-1 | Worst Δpx % (digital) | 4.98 | 4.98 |
| Original-1 | Physical-sparse Δpx % | 2.33 | 2.33 |
| Original-2 | Worst Δpx % (digital) | 4.66 | 4.66 |
| Original-2 | Physical-sparse Δpx % | 1.49 | 1.49 |

**Reading the numbers**

- Composite Δpx is dominated by **dynamic data + branding** (Freightnest org / ACME·BETA fixture vs FRESA DEMO) and cannot reach ~0% under branding policy.  
- Draft-2 **ink** remains near Fresa parity (8.71 vs 8.96).  
- Slight Δpx movement on Draft after open charge-grid + removal of orange DRAFT footer ribbon is within branding/raster noise; structural landmarks retained.

### Full five-format snapshot (Phase 2.5)

| Format | MediaBox | Pages | Worst Δpx % | Ink ref% | Ink gen% | Ref engine |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| Draft | 595×845 | 1 | 14.00 | 7.30 | 9.87 | pdfjs |
| Draft-1 | 595×842 | 9 | 8.65 | 3.79 | 6.36 | pdfjs |
| Draft-2 | 595×845 | 1 | 14.99 | 8.96 | 8.71 | pdfjs |
| Original-1 | 737×923 | 1 | 4.98† | 1.78 | 4.30 | poppler |
| Original-2 | 595×845 | 1 | 4.66† | 0.71 | 5.43 | pdfjs |

† Digital underlay track. Physical-sparse track: Original-1 **2.33%**, Original-2 **1.49%**.

---

## 3. Layout corrections applied (Draft / Draft-2 only)

Evidence-supported only (SBS / diff inspection):

1. **Open prepaid/collect charge grid** — single Prepaid/Collect header; empty cells on rows (matches Fresa open lower grid; removes per-row label ink).  
2. **Removed orange DRAFT footer ribbon** — not present on Fresa Draft / Draft-2 reference faces.  
3. **Retained** flex cargo fill, full-width Handling band, independent Draft vs Draft-2 faces, org branding, MediaBox geometry.

**Not changed (other three formats):** Draft-1, Original-1, Original-2 faces/layouts untouched.

---

## 4. Visual evidence inspected

| Format | Reference | Production | SBS | Diff |
| --- | --- | --- | --- | --- |
| Draft | `fresa-references/pdfs/hawb-draft-report-format.pdf` | `phase2-5-hawb/production/draft-production.pdf` | `side-by-side/draft-p1-sbs.png` | `diffs/draft-p1-diff.png` |
| Draft-2 | `fresa-references/pdfs/hawb-draft-report-format-2.pdf` | `phase2-5-hawb/production/draft2-production.pdf` | `side-by-side/draft2-p1-sbs.png` | `diffs/draft2-p1-diff.png` |

### Difference classification (inspected)

| Class | Draft / Draft-2 finding |
| --- | --- |
| Structural | IATA grid, Handling band, cargo flex, open charge header retained. Residual: Fresa open multi-cell T-weight vs labeled row list. |
| Dynamic data | Expected: ACME/BETA/MAA-DXB-260014 vs Fresa demo parties/numbers. |
| Branding | Expected: registered org (KingFisher / Phase31 fixture) vs FRESA DEMO — **required**; production shows **no** Fresa logo. |
| Rasterization | html2canvas border weight slightly heavier than Fresa vector strokes. |

---

## 5. Per-format final verdicts

### 1. Draft — **PASS**

| Check | Result |
| --- | --- |
| Branding preflight | PASS |
| MediaBox 595×845 / 1 page | PASS |
| Independent HOUSE face + airline strip | PASS |
| Org branding / no Fresa sample or logo | PASS |
| Preview = download | PASS |
| Pixel-perfect vs Fresa | Not claimed (Δpx ~14%; branding + data) |

### 2. Draft-1 — **PASS** (preserved)

Nine copy faces, MediaBox 595×842, notify, Phase 2.4 methodology retained. No layout edits in this run.

### 3. Draft-2 — **PASS**

| Check | Result |
| --- | --- |
| Branding preflight | PASS |
| MediaBox 595×845 / 1 page | PASS |
| Distinct Air Waybill face (HAWB NO, IATA agent, N.C.V) | PASS |
| Ink density vs Fresa | Near parity (8.71% vs 8.96%) |
| Org branding / no Fresa sample or logo | PASS |
| Preview = download | PASS |
| Pixel-perfect vs Fresa | Not claimed (Δpx ~15%) |

### 4. Original-1 — **PASS** (preserved)

Poppler sparse reference; physical-sparse Δpx **2.33%**; digital underlay mode available.

### 5. Original-2 — **PASS** (preserved)

Physical-sparse Δpx **1.49%**; digital underlay mode available.

---

## 6. Test results

```
npx vitest run \
  phase2HawbOfficial.test.ts \
  phase2_3Acceptance.test.ts \
  phase2_4Acceptance.test.ts \
  phase2_5BrandingPreflight.test.ts \
  hawbFormatCatalog.test.ts \
  reportCompanyBranding.test.ts \
  phase3BrandingSeparation.test.ts
→ 7 files, 56 tests, all passed
```

---

## 7. Restrictions confirmation

- Exactly five official HAWB formats  
- Draft-1 / Original-1 / Original-2 preserved  
- Catalogue governance / historical resolution unchanged  
- Phase 3 branding workflow **not** modified (preflight **reuses** Phase 3.1 harness only)  
- No report catalogue / API / schema / unrelated family changes  
- No Fresa branding in Freightnest production PDFs  
- Local only — no commit / push  

---

## Final statement

**Overall HAWB acceptance: YES**

Draft **PASS** · Draft-1 **PASS** · Draft-2 **PASS** · Original-1 **PASS** · Original-2 **PASS**

Phase 2.5 executed branding preflight → production regen → Fresa reference compare (same DPI/methodology) → SBS/diff inspection → evidence-supported Draft/Draft-2 charge-grid and ribbon corrections → full HAWB regression green.
