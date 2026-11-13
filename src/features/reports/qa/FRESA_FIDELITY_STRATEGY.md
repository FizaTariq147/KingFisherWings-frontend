# Fresa fidelity strategy (post JSON-repetition realignment)

**Rule:** Exact FRESA look = backend packs + verified CDN samples.  
JSON Format-N aliases and template-v2 are **not** Fresa-identical claims.

## Generate priority

Codified in [`reportPreserveMatrix.ts`](../constants/reportPreserveMatrix.ts) as `REPORT_GENERATE_PRIORITY`:

1. **sample_browse** — unbound + official sample PDF (HBL/HAWB stamp)
2. **backend_pack** — entity-bound + `suggestedPackKey` → `POST /reports/generate`
3. **template_v2** — entity-bound operational face; no Fresa-exact claim
4. **json_fallback** — Dev/offline only (`clientLayoutFallback`)

Entity-bound paths **must not** substitute CDN samples (Phase 6/7 regression).

## Shared shells

Many registry codes reuse one JSON object (HBL → Format-11, Arrival → Jasper Format-1, HAWB drafts → base draft, DO → Format-17).

- Enrichment: `isSharedLayout`, `layoutSourceCode`, `implementationStatus: shared_shell`
- Catalog: badge “Shares layout with …”; filter `layouts=distinct`
- **Do not** invent unique JSON per Format-N to stop repetition

## Layout freeze

`REPORT_LAYOUT_FREEZE.freezeClientJsonLayouts = true` — no new scraped JSON for coverage.
