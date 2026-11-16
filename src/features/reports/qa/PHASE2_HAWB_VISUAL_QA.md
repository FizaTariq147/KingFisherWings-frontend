# Phase 2.1 — HAWB Visual Regression & Fidelity Audit

**Generated:** 2026-11-16T05:55:13.473Z
**DPI:** 150 (pdfjs scale 2.0833)
**Pixelmatch threshold:** 0.15

## Scope honesty

- **Reference PDFs:** `qa/fresa-references/pdfs/hawb-*.pdf` (official Fresa samples).
- **Generated PDFs compared:** `qa/phase2-hawb-fixtures/*-evidence.pdf` (Phase 2 structural evidence from the same layout contracts as production).
- Production browser capture (`generateHawbOfficialPdf` / html2canvas) is **not** the Node evidence PDF — similarity scores below measure evidence fixtures vs Fresa, not pixel-perfect production fidelity.
- **Do not claim pixel-perfect Fresa fidelity** from these scores.

## Artifact locations

| Kind | Path |
| --- | --- |
| Manifest | `qa/phase2-hawb-visual/visual-qa-manifest.json` |
| Rasters | `qa/phase2-hawb-visual/rasters/` |
| Side-by-side | `qa/phase2-hawb-visual/side-by-side/` |
| Overlays | `qa/phase2-hawb-visual/overlays/` |
| Diffs | `qa/phase2-hawb-visual/diffs/` |
| Script | `scripts/phase2-hawb-visual-qa.mjs` |

## Page dimension summary

| Format | Ref pages | Gen pages | MediaBox ref | MediaBox gen | Match | Worst Δpx % | Severity |
| --- | ---: | ---: | --- | --- | --- | ---: | --- |
| draft | 1 | 1 | 595×845 | 595×845 | yes | 8.16 | low |
| draft1 | 9 | 9 | 595×842 | 595.3×841.9 | yes | 6.13 | low |
| draft2 | 1 | 1 | 595×845 | 595×845 | yes | 10.32 | low |
| original1 | 1 | 1 | 737×923 | 737×923 | yes | 0 | cosmetic |
| original2 | 1 | 1 | 595×845 | 595×845 | yes | 0.64 | cosmetic |

## Per-format visual comparison

### HAWB_DRAFT_REPORT_FORMAT (`draft`)

- Reference: `src/features/reports/qa/fresa-references/pdfs/hawb-draft-report-format.pdf`
- Generated: `src/features/reports/qa/phase2-hawb-fixtures/draft-evidence.pdf`
- Severity: **low** (worst mismatch 8.16%)

| Page | Δpx % | Similarity % | Ink ref% | Ink gen% | SBS | Diff | Overlay |
| ---: | ---: | ---: | ---: | ---: | --- | --- | --- |
| 1 | 8.16 | 91.8 | 7.3 | 2.42 | [`draft-p1-sbs.png`](phase2-hawb-visual/side-by-side/draft-p1-sbs.png) | [`draft-p1-diff.png`](phase2-hawb-visual/diffs/draft-p1-diff.png) | [`draft-p1-overlay.png`](phase2-hawb-visual/overlays/draft-p1-overlay.png) |

**Checklist vs reference structure**

| Aspect | Finding | Severity |
| --- | --- | --- |
| Page dimensions | MediaBox matches | pass |
| Orientation | portrait | pass |
| Field coordinates | Evidence PDF is a structural sketch — dense IATA React face not fully represented in Node fixture | medium |
| Section boundaries | Outer box + cargo/signature bands present in evidence; full label grid is production React path | medium |
| Table widths | Evidence uses simplified 8-col cargo header sketch | medium |
| Typography | Helvetica evidence vs Fresa embedded fonts / form art | low–medium |
| Borders | Dense grid borders drawn in evidence for non-sparse faces | low |
| Spacing / signatures | Signature bands present as rectangles in evidence | low |
| Header/footer | Status ribbon + HAWB NO. in evidence; Fresa has full issued-by header | medium |

### HAWB_DRAFT_REPORT_FORMAT_1 (`draft1`)

- Reference: `src/features/reports/qa/fresa-references/pdfs/hawb-draft-report-format-1.pdf`
- Generated: `src/features/reports/qa/phase2-hawb-fixtures/draft1-evidence.pdf`
- Severity: **low** (worst mismatch 6.13%)

| Page | Δpx % | Similarity % | Ink ref% | Ink gen% | SBS | Diff | Overlay |
| ---: | ---: | ---: | ---: | ---: | --- | --- | --- |
| 1 | 6.13 | 93.9 | 3.79 | 2.53 | [`draft1-p1-sbs.png`](phase2-hawb-visual/side-by-side/draft1-p1-sbs.png) | [`draft1-p1-diff.png`](phase2-hawb-visual/diffs/draft1-p1-diff.png) | [`draft1-p1-overlay.png`](phase2-hawb-visual/overlays/draft1-p1-overlay.png) |
| 2 | 6.13 | 93.9 | 3.79 | 2.53 | [`draft1-p2-sbs.png`](phase2-hawb-visual/side-by-side/draft1-p2-sbs.png) | [`draft1-p2-diff.png`](phase2-hawb-visual/diffs/draft1-p2-diff.png) | [`draft1-p2-overlay.png`](phase2-hawb-visual/overlays/draft1-p2-overlay.png) |
| 5 | 6.13 | 93.9 | 3.79 | 2.53 | [`draft1-p5-sbs.png`](phase2-hawb-visual/side-by-side/draft1-p5-sbs.png) | [`draft1-p5-diff.png`](phase2-hawb-visual/diffs/draft1-p5-diff.png) | [`draft1-p5-overlay.png`](phase2-hawb-visual/overlays/draft1-p5-overlay.png) |
| 9 | 6.13 | 93.9 | 3.79 | 2.53 | [`draft1-p9-sbs.png`](phase2-hawb-visual/side-by-side/draft1-p9-sbs.png) | [`draft1-p9-diff.png`](phase2-hawb-visual/diffs/draft1-p9-diff.png) | [`draft1-p9-overlay.png`](phase2-hawb-visual/overlays/draft1-p9-overlay.png) |

**Checklist vs reference structure**

| Aspect | Finding | Severity |
| --- | --- | --- |
| Page dimensions | MediaBox matches | pass |
| Orientation | portrait | pass |
| Field coordinates | Evidence PDF is a structural sketch — dense IATA React face not fully represented in Node fixture | medium |
| Section boundaries | Outer box + cargo/signature bands present in evidence; full label grid is production React path | medium |
| Table widths | Evidence uses simplified 8-col cargo header sketch | medium |
| Typography | Helvetica evidence vs Fresa embedded fonts / form art | low–medium |
| Borders | Dense grid borders drawn in evidence for non-sparse faces | low |
| Spacing / signatures | Signature bands present as rectangles in evidence | low |
| Header/footer | Status ribbon + HAWB NO. in evidence; Fresa has full issued-by header | medium |

### HAWB_DRAFT_REPORT_FORMAT_2 (`draft2`)

- Reference: `src/features/reports/qa/fresa-references/pdfs/hawb-draft-report-format-2.pdf`
- Generated: `src/features/reports/qa/phase2-hawb-fixtures/draft2-evidence.pdf`
- Severity: **low** (worst mismatch 10.32%)
- Note: Generated face has substantially less ink than reference (expected for evidence/structural PDF vs full Fresa sample; production React capture is denser).

| Page | Δpx % | Similarity % | Ink ref% | Ink gen% | SBS | Diff | Overlay |
| ---: | ---: | ---: | ---: | ---: | --- | --- | --- |
| 1 | 10.32 | 89.7 | 8.96 | 2.42 | [`draft2-p1-sbs.png`](phase2-hawb-visual/side-by-side/draft2-p1-sbs.png) | [`draft2-p1-diff.png`](phase2-hawb-visual/diffs/draft2-p1-diff.png) | [`draft2-p1-overlay.png`](phase2-hawb-visual/overlays/draft2-p1-overlay.png) |

**Checklist vs reference structure**

| Aspect | Finding | Severity |
| --- | --- | --- |
| Page dimensions | MediaBox matches | pass |
| Orientation | portrait | pass |
| Field coordinates | Evidence PDF is a structural sketch — dense IATA React face not fully represented in Node fixture | medium |
| Section boundaries | Outer box + cargo/signature bands present in evidence; full label grid is production React path | medium |
| Table widths | Evidence uses simplified 8-col cargo header sketch | medium |
| Typography | Helvetica evidence vs Fresa embedded fonts / form art | low–medium |
| Borders | Dense grid borders drawn in evidence for non-sparse faces | low |
| Spacing / signatures | Signature bands present as rectangles in evidence | low |
| Header/footer | Status ribbon + HAWB NO. in evidence; Fresa has full issued-by header | medium |

### HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_1 (`original1`)

- Reference: `src/features/reports/qa/fresa-references/pdfs/hawb-original-pre-printed-report-format-1.pdf`
- Generated: `src/features/reports/qa/phase2-hawb-fixtures/original1-evidence.pdf`
- Severity: **cosmetic** (worst mismatch 0%)
- Note: Reference page is ink-sparse — consistent with data overlay on preprinted stationery (form lines may be missing in digital PDF).

| Page | Δpx % | Similarity % | Ink ref% | Ink gen% | SBS | Diff | Overlay |
| ---: | ---: | ---: | ---: | ---: | --- | --- | --- |
| 1 | 0 | 100 | 0 | 0 | [`original1-p1-sbs.png`](phase2-hawb-visual/side-by-side/original1-p1-sbs.png) | [`original1-p1-diff.png`](phase2-hawb-visual/diffs/original1-p1-diff.png) | [`original1-p1-overlay.png`](phase2-hawb-visual/overlays/original1-p1-overlay.png) |

**Checklist vs reference structure**

| Aspect | Finding | Severity |
| --- | --- | --- |
| Page dimensions | MediaBox matches | pass |
| Orientation | portrait | pass |
| Field coordinates | Sparse data islands — absolute X/Y still approximate vs Fresa text positions | medium |
| Section boundaries | No dense grid (correct for preprinted overlay) | pass (intent) |
| Table widths | N/A — sparse overlay has no cargo grid ink | pass (intent) |
| Typography | Sparse labels only; Fresa text may fail pdfjs path rendering (see Original-1 raster) | medium |
| Borders | No outer form border on sparse evidence (Phase 2.1 fix) | pass |
| Preprinted behavior | **Required** — digital PDF is data-only; form lines live on stationery/underlay | high (documented) |

### HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_2 (`original2`)

- Reference: `src/features/reports/qa/fresa-references/pdfs/hawb-original-pre-printed-report-format-2.pdf`
- Generated: `src/features/reports/qa/phase2-hawb-fixtures/original2-evidence.pdf`
- Severity: **cosmetic** (worst mismatch 0.64%)
- Note: Reference page is ink-sparse — consistent with data overlay on preprinted stationery (form lines may be missing in digital PDF).

| Page | Δpx % | Similarity % | Ink ref% | Ink gen% | SBS | Diff | Overlay |
| ---: | ---: | ---: | ---: | ---: | --- | --- | --- |
| 1 | 0.64 | 99.4 | 0.71 | 0 | [`original2-p1-sbs.png`](phase2-hawb-visual/side-by-side/original2-p1-sbs.png) | [`original2-p1-diff.png`](phase2-hawb-visual/diffs/original2-p1-diff.png) | [`original2-p1-overlay.png`](phase2-hawb-visual/overlays/original2-p1-overlay.png) |

**Checklist vs reference structure**

| Aspect | Finding | Severity |
| --- | --- | --- |
| Page dimensions | MediaBox matches | pass |
| Orientation | portrait | pass |
| Field coordinates | Sparse data islands — absolute X/Y still approximate vs Fresa text positions | medium |
| Section boundaries | No dense grid (correct for preprinted overlay) | pass (intent) |
| Table widths | N/A — sparse overlay has no cargo grid ink | pass (intent) |
| Typography | Sparse labels only; Fresa text may fail pdfjs path rendering (see Original-1 raster) | medium |
| Borders | No outer form border on sparse evidence (Phase 2.1 fix) | pass |
| Preprinted behavior | **Required** — digital PDF is data-only; form lines live on stationery/underlay | high (documented) |

## Draft-1 pagination investigation

- Reference pages: **9**
- Generated pages: **9**
- Unique text fingerprints across reference pages: **1**

- Reference pages share near-identical text fingerprints — likely repeated copy faces of the same HAWB form (IATA multi-copy set), not nine unique layouts.
- Freightnest Draft-1 emits nine repeated face pages to match reference page count; banners are pagination markers (COPY FACE n/9), not invented shipper/carrier role labels.

Every reference page extracts the same party/cargo text (112 chunks) with `hasCopy=false` in OCR — the nine pages are **repeated identical faces**, not nine unique document designs.

## Original-1 / Original-2 preprinted overlay

| Variant | MediaBox | Ink density % | Text items | Requires preprinted overlay? | Recommendation |
| --- | --- | ---: | ---: | --- | --- |
| original1 | 737×923 | 0 | 44 | **true** | Keep sparseOverlay=true — digital PDF is data-only; physical/form underlay carries grid. Do not draw dense IATA borders on Original faces. |
| original2 | 595×845 | 0.71 | 42 | **true** | Keep sparseOverlay=true — digital PDF is data-only; physical/form underlay carries grid. Do not draw dense IATA borders on Original faces. |

**Conclusion:** Both Original formats require preprinted-paper / sparse-overlay behavior. Drawing a dense IATA grid on these faces would be incorrect.

## Safe fixes applied (Phase 2.1)

- **draft1-copy-banners:** Replaced fabricated EXTRA COPY / role banners with COPY FACE n/9 markers after OCR showed nine identical reference faces.
- **original-sparse-no-outer-border:** Evidence PDF no longer draws an outer content border for sparseOverlay originals (preprinted stationery carries the form grid).

No layout rewrite; five official codes preserved; historical resolution preserved; no schema/API/push.

## Remaining fidelity gaps

1. Node evidence PDFs ≠ production html2canvas rasters — full face QA needs browser capture artifacts.
2. Dense Draft faces: evidence sketches under-represent Fresa grid density (expected).
3. Original-1 reference often rasterizes nearly blank under pdfjs (font path warnings) while text extraction still finds ~44 items — visual SBS for Original-1 is limited.
4. Sparse field X/Y still approximate — not pixel-aligned to Fresa text positions.
5. Draft-1 copy faces match page count but do not OCR-match invisible/image-based copy designations on the Fresa form art.

## Verdict

**MediaBox and page counts: PASS for all five.**
**Pixel-perfect Fresa fidelity: NOT claimed.**
**Preprinted originals: confirmed sparse-overlay requirement.**
**Draft-1 nine pages: confirmed as repeated copy faces.**
