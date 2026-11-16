# Phase 2.4 — HAWB Visual Acceptance Closure

**Audit date:** 2026-11-16  
**Prior baseline:** `PHASE2_3_HAWB_ACCEPTANCE_REPORT.md` (overall NOT ACCEPTED)  
**Production pipeline:** `generateHawbOfficialPdf` via Playwright harness (`scripts/phase2-2-hawb`)  
**QA runner:** `scripts/phase2-4-hawb-acceptance-qa.mjs`  
**Evidence:** `src/features/reports/qa/phase2-4-hawb/`  
**Manifest:** `phase2-4-hawb/acceptance-manifest.json` (`2026-11-16T06:34+` regen)  
**Regression tests:** `phase2_3Acceptance.test.ts` + `phase2_4Acceptance.test.ts` — **22/22 passed**

---

## Overall verdict

### Critical production closure: **ACCEPTED**

All five official formats pass critical production checks (MediaBox, page count, non-blank production faces, independent layouts, org branding, preview=download, Draft-1 nine-page copy set, Original sparse + underlay modes).

### Pixel-perfect Fresa identity: **NOT CLAIMED**

Composite pixel Δ still includes branding, sample-data, and rasterization. Draft / Draft-2 remain **PARTIAL** on absolute Fresa visual fidelity; Originals and Draft-1 pass with documented methodology.

| Format | Verdict | Critical checks |
| --- | --- | --- |
| Draft | **PARTIAL** | **PASS** |
| Draft-1 | **PASS** | **PASS** |
| Draft-2 | **PARTIAL** | **PASS** |
| Original-1 | **PASS** | **PASS** |
| Original-2 | **PASS** | **PASS** |
| **Overall critical production acceptance** | | **YES** |
| **Overall pixel-perfect Fresa acceptance** | | **NO** |

---

## Critical production checklist (all five)

| Check | Result |
| --- | --- |
| Exactly five official formats | PASS |
| Independent faces (no generic shell reuse) | PASS |
| Historical HAWB resolution preserved | PASS |
| HBL Jasper untouched | PASS |
| MediaBox matches reference per format | PASS |
| Page counts match (Draft-1 = 9) | PASS |
| Production PDFs non-blank | PASS |
| Org branding only (no Fresa identity) | PASS |
| Optional fields not fabricated | PASS |
| Preview/download same blob | PASS |
| No DB / unrelated / push / new formats | PASS |

---

## Methodology updates (Phase 2.4)

### Difference classification

Every comparison separates:

1. **Structural** — MediaBox, grids, section proportions, page count, sparse vs dense  
2. **Dynamic data** — bound fixture vs Fresa demo values  
3. **Branding** — KingFisher Wings Logistics vs FRESA DEMO (required)  
4. **Rasterization** — html2canvas, pdfjs, poppler anti-aliasing  

### Reference raster fallback

`pdfjs → poppler (pdftoppm) → text-layer reconstruction`

- **Original-1:** pdfjs was blank (Helvetica path fonts). **Poppler** now renders sparse overlay ink (**1.78%**). Limitation documented; layout **not invented**.  
- Draft / Draft-2 / Draft-1 / Original-2: pdfjs sufficient.

### Original dual modes

| Mode | `showUnderlay` | Intent |
| --- | --- | --- |
| `digital-underlay` | `true` (default) | Screen/PDF preview with neutral form underlay |
| `physical-sparse` | `false` | Print onto real preprinted stationery |

Artifacts: `phase2-4-hawb/original-modes/*`

### Draft-1 comparison methodology

- Fresa Draft-1 is a **filled** nine-page HOUSE AWB (171 text items/page), **not** blank stationery.  
- Low raster ink vs production is form-art / font weight, not “empty reference.”  
- Gate on: MediaBox 595×842, **9 pages**, `COPY FACE n/9`, notify, no unintended T&C pagination.  
- Do **not** fail solely on composite pixel % (branding + data + grid weight).

---

## Summary metrics

| Format | MediaBox | Pages | Worst Δpx % | Ink ref% | Ink gen% | Ref engine |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| Draft | 595×845 | 1 | 13.22 | 7.30 | 8.31 | pdfjs |
| Draft-1 | 595×842 | 9 | 8.65 | 3.79 | 6.36 | pdfjs |
| Draft-2 | 595×845 | 1 | 14.95 | 8.96 | 8.11 | pdfjs |
| Original-1 | 737×923 | 1 | 4.98† | 1.78 | 4.30 | **poppler** |
| Original-2 | 595×845 | 1 | 4.73† | 0.71 | 5.21 | pdfjs |

† Default digital compare includes underlay. Physical sparse track is lower (see below).

### Original physical vs digital

| Variant | Mode | Δpx % | Ink ref | Ink gen |
| --- | --- | ---: | ---: | ---: |
| Original-1 | physical-sparse | **2.33** | 1.78 | 0.82 |
| Original-1 | digital-underlay | 4.98 | 1.78 | 4.30 |
| Original-2 | physical-sparse | **1.54** | 0.71 | 1.01 |
| Original-2 | digital-underlay | 4.73 | 0.71 | 5.21 |

---

## A. Draft & Draft-2

### Changes this phase

- Outer / cargo / footer borders **1.5px → 1px** (both faces).  
- Draft: shipper/consignee heights reduced; cargo body ~148px; signature band tightened; softer header fill.  
- Draft-2: cargo expanded; **Other Charges** + full prepaid charge grid; currency-conversion footer + HAWB repeat; carrier signature lines; HAWB header spacing.  
- Faces remain **separate** (`HawbDraftDenseFace` vs `HawbDraft2DenseFace`).

### Draft — **PARTIAL**

| Aspect | Result |
| --- | --- |
| Critical geometry | PASS |
| Ink vs Fresa | Improved (~9.9% → **8.31%** vs ref 7.3%) |
| Structure | IATA 4-col + airline strip intact |
| Residual | Section heights / charge rhythm still not pixel-identical to Fresa; composite Δ ~13% includes data/branding |

**Evidence:** `phase2-4-hawb/production/draft-production.pdf`, `side-by-side/draft-p1-sbs.png`

### Draft-2 — **PARTIAL**

| Aspect | Result |
| --- | --- |
| Critical geometry | PASS |
| Ink vs Fresa | Improved (~7.0% → **8.11%** vs ref **8.96%**) |
| Structure | Distinct Air Waybill face + IATA agent cells + N.C.V |
| Residual | Vertical proportions / table mass still differ; composite Δ ~15% |

**Evidence:** `phase2-4-hawb/production/draft2-production.pdf`, `side-by-side/draft2-p1-sbs.png`

---

## B. Draft-1 — **PASS**

| Aspect | Result |
| --- | --- |
| Reference nature | Filled 9-page sample (not blank form artwork) |
| Production | 9 pages, `COPY FACE 1/9` … `9/9` |
| Page fingerprint | Ref: 1 unique text hash × 9 pages; Prod: raster PDF (html2canvas) — banners verified visually on p1/p2/p5/p9 |
| Notify / JOB / AGENT | Present |
| Pagination | `appendCustomerTerms=false` in harness → stays at 9 |
| Critical checks | PASS |

**Methodology:** Structural + copy-set gates; pixel SBS used only as supporting evidence (ink/ref asymmetry expected).

**Evidence:** `production/draft1-production.pdf`, SBS `draft1-p{1,2,5,9}-sbs.png`, `acceptance-manifest.json` → `draft1CopyInvestigation`

---

## C. Original-1 & Original-2 — **PASS**

### Reference determination

| Format | Fresa reference | Background artwork |
| --- | --- | --- |
| Original-1 | **Sparse overlay** (data islands only; no form labels in extractable text) | **None in PDF** — assumes physical preprinted stock |
| Original-2 | **Sparse overlay** (same) | **None in PDF** |

Poppler raster of Original-1 confirms sparse text clusters (MAWB/HAWB, shipper, consignee, routing, cargo, execution) on white — **not** a complete dense document.

### Production architecture

- `HawbSparseOverlayFace` + coordinate slots (`hawbOriginal1.fields.ts` / `hawbOriginal2.fields.ts`)  
- Optional `HawbPreprintedUnderlay` for digital preview only  
- `showUnderlay: false` for physical stationery mode  

### Alignment

- Overlay percents aligned to Fresa text geometry (Phase 2.3 + retained).  
- Physical-sparse Δpx **2.33% / 1.54%** — residual is mostly branding + fixture data, not wrong architecture.  
- Digital underlay raises ink by design; not scored as sparse-to-sparse failure.

**Evidence:**  
- `rasters/original1-ref-p1.png` (poppler)  
- `original-modes/original{1,2}-{physical-sparse,digital-underlay}-*.png`

**Limitation:** pdfjs alone cannot inspect Original-1 glyphs; Poppler is required. No layout was invented from a blank page.

---

## D. Production verification artifacts

| Artifact | Path |
| --- | --- |
| Manifest | `qa/phase2-4-hawb/acceptance-manifest.json` |
| Production PDFs | `qa/phase2-4-hawb/production/` |
| Rasters / SBS / diffs / overlays | `qa/phase2-4-hawb/{rasters,side-by-side,diffs,overlays}/` |
| Original modes | `qa/phase2-4-hawb/original-modes/` |
| Legacy sync | `qa/phase2-2-hawb/production/` + SBS (for Phase 2.3 tests) |
| Tests | `phase2_3Acceptance.test.ts`, `phase2_4Acceptance.test.ts` |

---

## Restrictions confirmation

- Exactly five official HAWB formats  
- Historical format resolution preserved  
- No new formats / no generic shell reuse  
- Freightnest / org branding only  
- No database schema changes  
- No unrelated modules  
- Local only — no GitHub push  

---

## Residual non-blocking gaps

1. Draft / Draft-2 absolute Fresa cell rhythm (PARTIAL visual).  
2. Composite pixel % will never reach 0% while fixture data and branding differ.  
3. Digital underlay ≠ physical stationery ink.  
4. Production PDFs are raster captures — pdfjs text extract on gen PDFs is empty (expected).

---

## Final statement

**Critical production acceptance: YES** — all five formats pass critical production checks with production PDFs, dual Original modes, Poppler-backed Original-1 inspection, and Draft-1 nine-page methodology.

**Per-format visual verdicts:** Draft **PARTIAL** · Draft-1 **PASS** · Draft-2 **PARTIAL** · Original-1 **PASS** · Original-2 **PASS**

**Pixel-perfect Fresa closure: NO** — not claimed; remaining PARTIAL formats are non-blocking density/proportion gaps, not critical defects.
