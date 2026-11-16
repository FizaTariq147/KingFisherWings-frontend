# Phase 2.3 — Final HAWB Acceptance Audit

**Audit date:** 2026-11-16  
**Production pipeline:** `generateHawbOfficialPdf` (html2canvas + jsPDF) via Playwright harness  
**Evidence root:** `src/features/reports/qa/phase2-2-hawb/`  
**Manifest:** `phase2-2-hawb/fidelity-manifest.json` (regenerated `2026-11-16T06:19:58.383Z`)  
**Gates:** `templates/hawb/official/phase2_3Acceptance.test.ts` — **12/12 passed**

---

## Overall verdict

**NOT ACCEPTED for overall HAWB Phase 2.3 closure.**

All five formats are production-wired with correct MediaBox, page counts, independent layouts, org branding, and preview/download blob equivalence. Residual fidelity gaps remain (dense Draft typography/spacing vs Fresa, Draft-1 form-art vs filled face, Original underlay-vs-sparse category mismatch, Original-1 Fresa raster blank under pdfjs). **No format earns PASS.** None fail on critical blockers (wrong size, wrong page count, blank production face, Fresa branding, preview≠download, or catalogue drift).

| Format | Verdict |
| --- | --- |
| Draft | **PARTIAL** |
| Draft-1 | **PARTIAL** |
| Draft-2 | **PARTIAL** |
| Original-1 | **PARTIAL** |
| Original-2 | **PARTIAL** |
| **Overall HAWB acceptance** | **NO** |

---

## Methodology

### Visual QA (consistent with Phase 2.2)

| Setting | Value |
| --- | --- |
| DPI | 150 (pdfjs scale ≈ 2.0833) |
| Pixelmatch threshold | 0.12 |
| Normalize | Letterbox to common canvas; white fill |
| Production PDFs | `phase2-2-hawb/production/*-production.pdf` |
| References | `qa/fresa-references/pdfs/hawb-*.pdf` |
| Artifacts | rasters / side-by-side / diffs / overlays |

### Difference classification (do not conflate)

1. **Structural layout** — section boxes, grid, page geometry, multi-page copy faces  
2. **Dynamic data** — fixture shipment vs Fresa demo values (HAWB NO, parties, weights)  
3. **Organization branding** — KingFisher Wings Logistics vs FRESA DEMO (required policy)  
4. **Rasterization / anti-aliasing** — html2canvas stroke weight, font hinting, pdfjs under-render  

Pixel % is a **composite** of all four. Acceptance judgments use inspected SBS/diff images, not percentages alone.

### Prior reports consumed

- `PHASE2_HAWB_IMPLEMENTATION_REPORT.md`
- `PHASE2_HAWB_VISUAL_QA.md`
- `PHASE2_2_HAWB_FIDELITY_REPORT.md`

### Acceptance-phase fixes applied (objective only)

1. Original-1 / Original-2 overlay slot percents realigned to Fresa `reference-text-coords.json` (execution / footer Y were systematically high).  
2. `HawbPreprintedUnderlay` signature / conversion band nudged to follow sparse execution Y.  
3. No Draft face rewrites; no new formats; no schema/API/push.

---

## Governance & pipeline gates

| Gate | Result |
| --- | --- |
| Exactly five official selectable formats | **PASS** |
| Independent layout contracts (`HAWB_OFFICIAL_LAYOUTS` ×5) | **PASS** |
| Historical HAWB resolution preserved (`…_FORMAT_15` etc.) | **PASS** |
| HBL Jasper pilot untouched | **PASS** |
| No Fresa identity (`REPORT_BRANDING_RULES.allowFresaIdentity = false`) | **PASS** |
| Optional fields stay blank when unbound (no fabrication) | **PASS** |
| Long commodity text preserved (no overflow fillers) | **PASS** |
| Preview/download same blob bytes | **PASS** |
| Draft-1 nine `COPY FACE n/9` banners | **PASS** |
| Originals `sparseOverlay: true` + `showUnderlay` wired | **PASS** |

---

## Summary metrics (production vs Fresa)

| Format | MediaBox | Pages | Worst Δpx % | Ink ref% | Ink gen% |
| --- | --- | ---: | ---: | ---: | ---: |
| Draft | 595×845 | 1 / 1 | 13.29 | 7.30 | 9.93 |
| Draft-1 | 595×842 | 9 / 9 | 8.63 | 3.79 | 6.40 |
| Draft-2 | 595×845 | 1 / 1 | 13.94 | 8.96 | 7.01 |
| Original-1 | 737×923 | 1 / 1 | 3.48 | 0.00† | 4.30 |
| Original-2 | 595×845 | 1 / 1 | 4.73 | 0.71 | 5.21 |

† Fresa Original-1 often renders blank under pdfjs (embedded fonts / form art) — pixel score is **not** a fidelity claim.

---

## Per-format acceptance

### 1. Draft — `HAWB_DRAFT_REPORT_FORMAT` — **PARTIAL**

**Evidence**

- Production: `phase2-2-hawb/production/draft-production.pdf`
- SBS: `phase2-2-hawb/side-by-side/draft-p1-sbs.png`
- Diff: `phase2-2-hawb/diffs/draft-p1-diff.png`
- Face: `HawbDraftDenseFace` (independent of Draft-2)

| Check | Finding | Class |
| --- | --- | --- |
| MediaBox / pages | 595×845, 1 page — match | Structural |
| Independent layout | Dedicated Draft dense face + airline strip | Structural |
| Field grid | IATA shipper/consignee/routing/cargo/charges present | Structural |
| Dynamic data | Bound fixture populated (pieces, weight, nature) | Dynamic |
| Branding | KingFisher Wings Logistics only | Branding |
| Typography / borders | Denser ink + heavier borders vs Fresa | Structural + raster |
| Missing optionals | Unmapped MAWB / charges stay blank | Dynamic |
| Overflow | Long nature text maps without fillers | Dynamic |
| Preview/download | Same blob | Pipeline |

**Why not PASS:** Inspected SBS/diff show charge/signature vertical drift and density differences vs Fresa; ~13% composite mismatch includes unavoidable branding/data plus real structural spacing gaps.

**Critical defects:** None (not blank, not wrong size, not Fresa-branded).

---

### 2. Draft-1 — `HAWB_DRAFT_REPORT_FORMAT_1` — **PARTIAL**

**Evidence**

- Production: `phase2-2-hawb/production/draft1-production.pdf` (9 pages)
- SBS samples: `draft1-p1-sbs.png`, `draft1-p5-sbs.png`, `draft1-p9-sbs.png`
- Layout: `copyBanners` length 9, `showNotify: true`, MediaBox 595×842

| Check | Finding | Class |
| --- | --- | --- |
| Nine-page copy set | 9/9 pages; banners `COPY FACE n/9` | Structural |
| Notify party | Present on face | Structural |
| Dynamic data | Shipper/consignee/notify/cargo filled on each face | Dynamic |
| Branding | Org profile; no Fresa logo | Branding |
| Multi-page behavior | Intentional identical copy faces (not blank overflow) | Structural |
| Fresa raster | Reference pages often low-ink form art vs filled production | Raster + data |
| Grid fidelity | Production face denser / taller cells than Fresa form art | Structural |

**Why not PASS:** Copy-set contract is correct, but visual structure vs Fresa Draft-1 form art remains imperfect; SBS comparisons mix blankish reference form art with populated production faces.

**Critical defects:** None.

---

### 3. Draft-2 — `HAWB_DRAFT_REPORT_FORMAT_2` — **PARTIAL**

**Evidence**

- Production: `phase2-2-hawb/production/draft2-production.pdf`
- SBS: `phase2-2-hawb/side-by-side/draft2-p1-sbs.png`
- Face: `HawbDraft2DenseFace` (Air Waybill title, HAWB NO header, IATA agent cells, N.C.V default)

| Check | Finding | Class |
| --- | --- | --- |
| MediaBox / pages | 595×845, 1 page — match | Structural |
| Distinct from Draft | Separate face (not shared Draft shell) | Structural |
| Dynamic data | Bound fixture present | Dynamic |
| Branding | Org only | Branding |
| Vertical scale | Production more compact than Fresa sample | Structural |
| Worst Δpx | 13.94% composite | Mixed |

**Why not PASS:** Independent face and geometry gates pass; inspected SBS shows compression / section-height differences vs Fresa that remain outside pixel-acceptance.

**Critical defects:** None.

---

### 4. Original-1 — `HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_1` — **PARTIAL**

**Evidence**

- Production: `phase2-2-hawb/production/original1-production.pdf`
- SBS: `phase2-2-hawb/side-by-side/original1-p1-sbs.png` (Fresa side often blank)
- Overlay slots: `overlays/hawbOriginal1.fields.ts` (realigned to Fresa text coords)
- Underlay: `HawbPreprintedUnderlay` (`showUnderlay` default on for digital; off for physical stationery)

| Check | Finding | Class |
| --- | --- | --- |
| MediaBox | **737×923** match (critical Phase 2 geometry) | Structural |
| Sparse overlay architecture | Absolute slots + optional underlay | Structural |
| Preprinted behavior | Digital underlay stand-in; physical print can omit underlay | Structural |
| Dynamic data | Overlay islands populated | Dynamic |
| Branding | Org / logo island only | Branding |
| Fresa visual compare | Reference raster frequently **blank** in pdfjs | Raster limitation |
| Overlay Y | Execution/footer slots corrected to Fresa coords this audit | Structural (fixed) |

**Why not PASS:** Production face is valid and sized correctly, but Fresa reference cannot be visually scored reliably (blank raster). Digital underlay ≠ physical stationery ink. Residual slot/underlay approximation remains.

**Critical defects:** None in production output. Reference-tooling gap blocks PASS.

---

### 5. Original-2 — `HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_2` — **PARTIAL**

**Evidence**

- Production: `phase2-2-hawb/production/original2-production.pdf`
- Ref raster (sparse): `rasters/original2-ref-p1.png`
- Gen raster (underlay on): `rasters/original2-gen-p1.png`
- SBS / diff: `side-by-side/original2-p1-sbs.png`, `diffs/original2-p1-diff.png`
- Overlay slots: `overlays/hawbOriginal2.fields.ts` (realigned this audit)

| Check | Finding | Class |
| --- | --- | --- |
| MediaBox | 595×845 match | Structural |
| Sparse vs underlay | Fresa = sparse ink only; production QA default = underlay on | Structural (expected category split) |
| Overlay coordinates | Matched to Fresa pdfjs percents (shipper→footer) | Structural (fixed) |
| Dynamic data | Present in slots | Dynamic |
| Branding | KingFisher only (Fresa strings only in reference) | Branding |
| Diff residual | Ghosting from data/branding + underlay grid vs sparse white | Mixed |

**Why not PASS:** Overlay architecture and MediaBox are correct; inspected SBS still shows underlay grid vs sparse Fresa (category difference) plus data/branding deltas. Absolute glyph-perfect stationery registration is not claimed.

**Critical defects:** None. Prior execution/footer Y bias was fixed; remaining gaps are non-blocking fidelity.

---

## Cross-cutting verification

| Topic | Result |
| --- | --- |
| Independent layouts | Five variants: draft / draft1 / draft2 / original1 / original2 |
| Production PDF output | All five regenerated through official generator |
| Reference page dimensions | Match all five |
| Missing optional fields | Mapper leaves blanks; no invented AS ARRANGED fillers |
| Long text / overflow | Preserved in model; faces use `overflow: hidden` on slots |
| Multi-page | Draft-1 = 9 intentional copies; others = 1 |
| Original preprinted overlays | Sparse slots + `showUnderlay` toggle |
| Preview/download equivalence | Same blob reference |
| Fresa branding in production | Absent |
| Database / unrelated modules / push | Untouched |
| New report formats | None |
| HBL Jasper | Preserved |

---

## Remaining non-blocking gaps (do not rewrite unless scoped)

1. Draft / Draft-2 dense cell heights and charge-grid vertical rhythm vs Fresa samples.  
2. Draft-1 production face vs Fresa form-art raster (reference often under-inked).  
3. Original digital underlay ≠ physical preprinted stationery weight.  
4. Original-1 Fresa pdfjs blank prevents quantitative visual close-out.  
5. html2canvas anti-aliasing / border weight vs Fresa print PDFs.

---

## Restrictions confirmation

- Exactly **five** official selectable HAWB formats  
- Historical format resolution preserved  
- Existing HBL Jasper preserved  
- No new report formats  
- No database changes  
- No unrelated module changes  
- No Fresa branding in production  
- No GitHub push  

---

## Final statement

**Per-format:** Draft **PARTIAL** · Draft-1 **PARTIAL** · Draft-2 **PARTIAL** · Original-1 **PARTIAL** · Original-2 **PARTIAL**  

**Overall HAWB acceptance: NO** — residual production fidelity gaps remain; no unjustified PASS.
