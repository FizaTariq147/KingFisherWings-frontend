# Phase 1.1 — Fix Evidence

## Defect A — AL NASER sample party (Formats 2 / 14 / 15 / 17)

### Root cause

Measured invoice faces retain sample consignee/party glyphs. Skip/wipe logic only treated values **to the right** of labels, and skipped sample-key collection when `textRotateDeg` was set (Format 2).

### Changed files

- `src/features/reports/templates/official/generateOfficialMeasuredPdf.ts`
  - `invoiceDemoLeftover` skip when `entityBound` (AL NASER / BABU / FRESA DEMO / …).
  - `isInvoiceSampleNearLabel` — same-column Shipper/Consignee/Bill To blocks.
  - Invoice sample-key collection enabled for rotated faces.
  - `stampInvoiceLabeledValue` uses the same near-label geometry + wider wipe for same-column samples.

### Before / after (pdfjs)

| Report | Fixture | Before | After |
|---|---|---|---|
| Format 2 | base | `AL NASER…` present; Zoyan present | `AL NASER` absent; Zoyan present |
| Format 14 | base | `AL NASER` @ (302,592.5); LIVE CONSIGNEE elsewhere | `AL NASER` absent; LIVE CONSIGNEE present |
| Format 15 | base | same leak | cleared |
| Format 17 | base | same leak | cleared |

### Regression test

`src/features/reports/qa/pilot/phase1_1DefectRemediation.test.ts` — asserts no AL NASER on 2/14/15/17 base; live/Zoyan present.

---

## Defect B — Trading Division (Formats 4 / 8)

### Root cause

1. Letterhead drew the full company as **one** `drawText` run.
2. Run width ≈670pt on an A4 page → overflow.
3. pdfjs text extraction returns ≈100 glyphs per item → QA could not see `Trading Division` even when glyphs existed past the cap / off-page.

### Changed files

- `src/features/reports/templates/official/generateOfficialMeasuredPdf.ts`
  - `wrapTextToWidth` — word-wrap for portrait letterhead company (max 2 lines).
  - Company stamp in branding slots draws wrapped lines with wipe height covering both lines.
  - Rotated faces keep single-line company (Format 2 already extractable after wrap elsewhere).
- `src/features/reports/qa/pilot/runPhase1Pilot.test.ts`
  - Restored `Trading Division` required text for Formats **2 / 4 / 8** long_party (not weakened).
  - Format 1 long_party keeps capacity-fitting stem (narrow slot — unresolved).
  - Reliable file writes to avoid Windows lock false `GENERATION_FAILED`.

### Before / after (pdfjs)

| Report | Fixture | Before | After |
|---|---|---|---|
| Format 4 | long_party | One item ending `…Company Tr`; no `Trading Division` | Two letterhead lines; **`Trading Division` present** |
| Format 8 | long_party | same | **`Trading Division` present** |

### Regression test

Same file — Formats 4/8 long_party must contain `Trading Division` + long stem; no AL NASER.

---

## Non-goals / restrictions honored

- No PDF engine rewrite; wrap only at letterhead company stamp.
- No unrelated family edits; no global coordinate redesign.
- Empty parties still skip stamps when unbound/empty.
- Official HAWB distinctions unchanged.
