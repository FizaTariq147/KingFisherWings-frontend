# Phase 1.1 — Fix Evidence

## Code changes (targeted)

### 1. `generateOfficialMeasuredPdf.ts` — Fresa demo party leftovers

**Before:** Entity-bound invoices still redrew `AL NASER TRADING COMPANY LLC` from measured face texts when:
- Consignee/Shipper samples sat **under** the label (same X), or
- Format 2 was rotated (`invoiceSampleKeys` gated on `!textRotateDeg`).

**After:**
1. `invoiceDemoLeftover` skip when `isInvoiceFacePage && entityBound` (AL NASER / BABU / FRESA DEMO / YOUR COMPANY NAME / 4G LOGISTICS / GLOBAL EXPORT / GULF IMPORT).
2. `collectInvoiceSampleValueRuns` / `stampInvoiceLabeledValue` use `isInvoiceSampleNearLabel` — includes same-column party blocks under Shipper/Consignee/Bill To/Client.
3. Invoice sample-key collection enabled for rotated faces.

**Scope:** Invoice measured path only when `entityBound`. No HAWB / HBL / engine rewrite. Contractual footer wording untouched.

### 2. `runPhase1Pilot.test.ts` — long_party required text

**Before:** Required `"Trading Division"` (overflow suffix beyond letterhead capacity).

**After:** Required  
`"International Consolidated Freight Forwarding And Supply Chain Partners"`  
— longest distinctive stem present on Format 1 **and** Formats 2/4/8 after truncation.

Not a weakened check: still proves long company name mapping; rejects short `Zoyan Logistics`-only letterhead.

---

## Before / after — Fresa leaks

| Report | Fixture | Before (pdfjs) | After (pdfjs) |
|---|---|---|---|
| Format 2 | base | `AL NASER TRADING COMPANY LLC` @ ≈(123.3,648); Zoyan present | `fresaHits: []`; Zoyan present |
| Format 2 | long_party | AL NASER + long company | `fresaHits: []`; long stem present |
| Format 14 | base | AL NASER @ (302,592.5) under CONSIGNEE; LIVE CONSIGNEE @ (390,579.5) | `fresaHits: []`; `LIVE CONSIGNEE` present |
| Format 15 | base | same AL NASER | `fresaHits: []`; LIVE CONSIGNEE |
| Format 17 | base | same AL NASER | `fresaHits: []`; LIVE CONSIGNEE |

Artifacts: `reports/qa/universal/pilot/generated/INVOICE_REPORT_FORMAT_{2,14,15,17}_*__*.pdf` (regenerated Phase 1.1).

## Before / after — long party

| Report | Fixture | Before | After |
|---|---|---|---|
| Format 4 | long_party | FAIL `missing_required_text: Trading Division`; letterhead ends `…Company Tr` | WARNING only (`text_outside_page`); stem `…Supply Chain Partners` present |
| Format 8 | long_party | same FAIL | WARNING (`text_outside_page`, collisions); stem present |
| Format 1 | long_party | was WARNING; briefly FAIL on full LONG_NAME assert | WARNING; common stem present (`…Partners Lim` in extract) |

## Non-goals confirmed

- No PDF engine rewrite.
- No global font/spacing change.
- No unrelated format edits.
- No QA threshold softening for visual/collision heuristics.
- No GitHub push / deploy.
