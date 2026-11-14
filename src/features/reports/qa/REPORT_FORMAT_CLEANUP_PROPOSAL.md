# Report Format Cleanup Proposal (Non-Destructive)

**Date:** 2026-11-14  
**Status:** Proposal only — **awaiting approval** before any hide/merge/delete.

## Evidence summary

| Metric | Value |
| --- | --- |
| Official Fresa inventory entries | 461 |
| Local registry codes | 852 |
| Official HAWB catalogue entries | 5 (4 named Format-1/2 draft+original + base draft PDF) |
| Local HAWB codes exposed | **30** |
| HAWB unverified extras | **25** |
| Official inventory HAWB section | 5 |
| Duplicate sample URL groups (inventory) | 0 |
| Mapping ambiguous (inventory summary) | 6 |
| Unmapped official entries | 45 |

Full machine-readable detail: `REPORT_OFFICIAL_FORMAT_AUDIT.json`, `REPORT_FORMAT_DUPLICATE_AUDIT.json`.

## HAWB 30 vs official 4/5 (concrete example)

Official Fresa HAWB-specific entries:

1. HAWB Draft Report Format (base)
2. HAWB Draft Report Format-1
3. HAWB Draft Report Format-2
4. HAWB Original Pre Printed Report Format-1
5. HAWB Original Pre Printed Report Format-2

**Shipment Freight Manifest** is a separate family — must not be treated as HAWB.

Local registry pulls every `HAWB_*` code (Format-3…N) and stamps a **shared** draft/original sample (`sampleIsFallback: true`). Those extras are **unverified**, not additional official designs.

### Recommended actions (HAWB)

| Action | Scope | Requires approval? |
| --- | --- | --- |
| Keep and use | 5 official codes | No (already correct) |
| Hide from primary user catalogue | Format-3…N + other non-official HAWB_* | **Yes** (UI filter only) |
| Preserve codes / URLs / layouts | All 30 | Mandatory |
| Merge / delete codes | None proposed | N/A — do not delete |
| Manifest reclassification | Ensure freight manifest stays non-HAWB | Soft (already separate codes) |

Helper ready (not wired to UI): `shouldExposeHawbInPrimaryCatalogue()` in `officialFormatGovernance.ts`.

## Safe non-destructive changes (approved to do now / done)

1. Audit documents + classification JSON.
2. Dynamic registered-company branding (no fabricated chrome).
3. Governance helpers + tests.
4. Preserve HBL Jasper pilot.

## Changes requiring explicit approval

1. **Hide** unverified HAWB Format-3…N from Report Catalogue UI (codes stay resolvable).
2. **Hide** other family extras that lack official mapping (`unverified` / `unsupported`).
3. Any **merge** of duplicate local IDs → single official code (needs migration plan for saved preferences/URLs).
4. **Delete** layouts, registry rows, or reference PDFs — **not recommended**.
5. Registering new formats as official without FRESA-REF evidence.

## Compatibility requirements (must hold)

- Stable report IDs / codes
- No broken deep links (`?code=…`)
- No deletion of JSON layouts or `fresa-references/pdfs`
- No silent meaning change of existing codes
- Backend packs unchanged

## Suggested phased rollout (after approval)

1. Phase A — Catalogue UI: default filter `official_verified` + toggle “Show all registered”.
2. Phase B — Badges: Unverified / Sample fallback / Official.
3. Phase C — Optional preference migration for users who bookmarked Format-3…N (redirect banner, not hard remap).

**Stop:** No bulk cleanup executed in this task.
