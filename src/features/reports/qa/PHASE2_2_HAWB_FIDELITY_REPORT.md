# Phase 2.2 — HAWB Visual Fidelity Corrections Report

**Generated:** 2026-11-16T06:19:58.383Z

## Methodology

- **DPI:** 150 (pdfjs scale 2.0833)
- **Pixelmatch threshold:** 0.12
- **Production pipeline:** `generateHawbOfficialPdf via Playwright Vite harness (html2canvas + jsPDF)`
- **References:** `qa/fresa-references/pdfs`
- Content text differs (org branding + bound fixture vs Fresa demo). Judge structure/geometry.
- Acceptance is based on **production PDFs**, not MediaBox/unit tests alone.
- **No Fresa company branding** in generated output; org fixture uses KingFisher Wings Logistics.

## Artifact index

| Kind | Path |
| --- | --- |
| Manifest | `qa/phase2-2-hawb/fidelity-manifest.json` |
| Production PDFs | `qa/phase2-2-hawb/production/` |
| Rasters / SBS / diffs / overlays | `qa/phase2-2-hawb/{rasters,side-by-side,diffs,overlays}/` |
| Text coords (overlay design) | `qa/phase2-2-hawb/reference-text-coords.json` |

## Summary table

| Format | Ref pages | Prod pages | MediaBox | Worst Δpx % | Ink ref% | Ink gen% |
| --- | ---: | ---: | --- | ---: | ---: | ---: |
| draft | 1 | 1 | 595×845 → 595×845 | 13.29 | 7.3 | 9.93 |
| draft1 | 9 | 9 | 595×842 → 595.3×841.9 | 8.63 | 3.79 | 6.4 |
| draft2 | 1 | 1 | 595×845 → 595×845 | 13.94 | 8.96 | 7.01 |
| original1 | 1 | 1 | 737×923 → 737×923 | 3.48 | 0 | 4.3 |
| original2 | 1 | 1 | 595×845 → 595×845 | 4.73 | 0.71 | 5.21 |

## Track A — Draft & Draft-2

Separate production faces (not one generic shell):

- `HawbDraftDenseFace` — HOUSE AIR WAYBILL, account-number labels, airline number strip, legal right of consignee.
- `HawbDraft2DenseFace` — Air Waybill title, HAWB NO header box, IATA agent cells, N.C.V customs default, footer HAWB repeat.

### HAWB_DRAFT_REPORT_FORMAT

- Production PDF: `src/features/reports/qa/phase2-2-hawb/production/draft-production.pdf`
- Worst pixel mismatch: **13.29%** (similarity 86.7%)
- Ink density ref/gen: 7.3% / 9.93%
- MediaBox match: true
- Side-by-side: `src/features/reports/qa/phase2-2-hawb/side-by-side/draft-p1-sbs.png`
- Diff: `src/features/reports/qa/phase2-2-hawb/diffs/draft-p1-diff.png`

| Aspect | Result |
| --- | --- |
| Field / section structure | Dedicated face with dense grid, routing, charges, signatures |
| Borders / typography | 1.5px IATA grid, 6.5–11px labels/body |
| Header / footer | Draft airline strip + issued-by; Draft-2 HAWB NO box + footer number |
| Remaining gap | Content values differ from Fresa demo; pixel Δ includes branding/data, not only geometry |

### HAWB_DRAFT_REPORT_FORMAT_2

- Production PDF: `src/features/reports/qa/phase2-2-hawb/production/draft2-production.pdf`
- Worst pixel mismatch: **13.94%** (similarity 86.1%)
- Ink density ref/gen: 8.96% / 7.01%
- MediaBox match: true
- Side-by-side: `src/features/reports/qa/phase2-2-hawb/side-by-side/draft2-p1-sbs.png`
- Diff: `src/features/reports/qa/phase2-2-hawb/diffs/draft2-p1-diff.png`

| Aspect | Result |
| --- | --- |
| Field / section structure | Dedicated face with dense grid, routing, charges, signatures |
| Borders / typography | 1.5px IATA grid, 6.5–11px labels/body |
| Header / footer | Draft airline strip + issued-by; Draft-2 HAWB NO box + footer number |
| Remaining gap | Content values differ from Fresa demo; pixel Δ includes branding/data, not only geometry |

## Track B — Original-1 & Original-2 preprinted overlay

- Neutral `HawbPreprintedUnderlay` form (digital stand-in for stationery).
- Overlay slots from Fresa text coordinates (`overlays/hawbOriginal1.fields.ts`, `hawbOriginal2.fields.ts`).
- No heavy outer capture border; org branding only.
- Sparse-vs-sparse alone is insufficient — underlay + slot alignment is the fidelity claim.

### HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_1

- Production: `src/features/reports/qa/phase2-2-hawb/production/original1-production.pdf`
- MediaBox: 737×923
- Worst Δpx: **3.48%** · ink gen **4.3%** (underlay raises ink vs sparse-only refs)
- SBS: `src/features/reports/qa/phase2-2-hawb/side-by-side/original1-p1-sbs.png` · Diff: `src/features/reports/qa/phase2-2-hawb/diffs/original1-p1-diff.png`

### HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_2

- Production: `src/features/reports/qa/phase2-2-hawb/production/original2-production.pdf`
- MediaBox: 595×845
- Worst Δpx: **4.73%** · ink gen **5.21%** (underlay raises ink vs sparse-only refs)
- SBS: `src/features/reports/qa/phase2-2-hawb/side-by-side/original2-p1-sbs.png` · Diff: `src/features/reports/qa/phase2-2-hawb/diffs/original2-p1-diff.png`

## Track C — Draft-1 nine-page copies

- Fresa Draft-1 reference has 9 identical extractable faces (Phase 2.1 OCR).
- Production emits 9 copy faces with COPY FACE n/9 banners — intentional repeated faces, not blank overflow.
- No T&C append in this QA run (appendCustomerTerms=false) so page count stays at 9.

- Production pages: **9** (ref **9**)
- Sampled pages 1/2/5/9 worst Δpx: **8.63%**

## Track D — QA evidence

All five formats regenerated through **production** `generateHawbOfficialPdf`.
Pixel percentages measure raster difference after letterbox normalize — **not** a claim of pixel-perfect Fresa identity.

## Restrictions confirmation

- Exactly five official HAWB codes preserved.
- Historical HAWB resolution unchanged.
- No schema/API/push; local only.
- No Fresa logos/letterhead in production output.

## Remaining gaps

1. Absolute overlay X/Y still approximate vs every Fresa glyph (font metrics differ).
2. Digital underlay ≠ physical printed stationery ink weight.
3. Pixel Δ includes unavoidable sample-data / branding differences.
4. Original-1 Fresa raster may still under-render embedded fonts in pdfjs.

## Verdict

**Production visual evidence produced for all five formats.**
**MediaBox-only acceptance rejected — comparisons use production PDFs + diffs.**
**Pixel-perfect Fresa fidelity is not claimed.**
