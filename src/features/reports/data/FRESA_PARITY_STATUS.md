# Fresa sample-report-formats — parity status (honest)

Source: [Fresa Sample Report Formats](https://fresatechnologies.com/sample-report-formats/)

## Success criterion

A report is **visually verified** only when `FRESA_VISUAL_DIFF_MANIFEST.json` lists it under `passed` after page-image comparison against its matched reference PDF. Structural uniqueness / shell fingerprint counts are **not** success.

## Separate counts (see `FRESA_REGISTRY_RECONCILIATION.md`)

| Bucket | Count | Notes |
|--------|------:|-------|
| Discovered unique names | 437 | Page + curated |
| Downloaded references | 403 | Inventory rows with a file |
| Fingerprint OK PDFs | 386 | Usable for visual-diff |
| Fingerprint stubs | 18 | Do not invent layouts from these |
| XLSX / unavailable | 344 | Mostly list reports; not PDF formats |
| Registry layouts (current) | 816 | Restored to HEAD; 0 codes missing vs HEAD |
| Visually verified | see manifest | Starts at 0 until diffs pass |

## Registry recovery (2026-10-28)

- **Cause of 816→702:** HAWB store (−25) and HBL store (−89) rebuilt to marketing-page-only lists. Leftover store stayed at 83 (the “114 leftover purge” narrative was incorrect for the final tree).
- **Action:** Restored HAWB/HBL definitions from Git HEAD; kept current layout bodies for official Fresa-page codes. Backups: branch `backup/fresa-pre-registry-recovery-20261028-143245`, files under `tmp/backups/fresa-registry-*`.
- **Quarantine:** `fresa:fix-shells` / purge / uniquify require `FRESA_ALLOW_DESTRUCTIVE=1`.

## Visual-diff pipeline

- Harness: `/dev/report-visual-diff?code=…` → real `generateCatalogLayoutPdf` pipeline
- Script: `npm run fresa:visual-diff` → `scripts/visual-diff-fresa-batch.mjs`
- Outputs: `tmp/fresa-visual-diff/<CODE>/{reference,generated,diff,side-by-side}-page1.png` + `FRESA_VISUAL_DIFF_MANIFEST.json`

## Batch 1 root-cause fix in progress

Catalogue HAWB/HBL were rendered through `JsonInvoiceLayoutRenderer` (generic invoice shell). They now route through classic IATA / BL face generators (`generateAwbDraftPdf` / `generateBlDraftPdf`) via `catalogClassicTransportPdf.ts`. Re-run visual-diff to measure remaining gap vs Fresa references (KingFisher branding + appended T&C page are intentional deltas).

## XLSX / inaccessible

Do not mark XLSX list references as implemented PDF formats. Record as unverified until spreadsheet validation exists.
