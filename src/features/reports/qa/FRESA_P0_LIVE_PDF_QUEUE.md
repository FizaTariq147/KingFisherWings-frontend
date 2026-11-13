# Fresa P0 live PDF queue

**Purpose:** Live html2canvas / pack PDF verification and page screenshots apply **only** to this queue — not to shared-shell Format-N aliases or the full 852 registry.

**Source:** [`fresaP0LivePdfQueue.ts`](./fresaP0LivePdfQueue.ts)

## Included

| Bucket | Criteria |
|--------|----------|
| `verified_sample` | HBL/HAWB/DO/WMS with distinct CDN `samplePdfUrl` (excludes `sampleIsFallback`); plus `fresaOfficialSampleCatalogue` `url_verified` rows |
| `pack_bound` | Arrival notice, delivery order, commercial invoice registry rows with `suggestedPackKey`, **not** `isSharedLayout` / `shared_shell` |

## Excluded (do not run live PDF for fidelity claims)

- Shared-shell aliases (`implementationStatus: shared_shell`)
- template-v2-only internal designs without sample/pack
- Purchase / quotation / voucher catalog Format-N (module PDF APIs are preserved separately)
- MAWB until pack `air.mawb_*` is proven (P1)

## Live PDF status

| Check | Status |
|-------|--------|
| Unit enrichment / sample gates | Verified in vitest |
| Browser html2canvas page screenshots for P0 set | **Blocked** until Playwright/manual pass |
| Pack generate vs sample visual compare | **Blocked** |

Do **not** declare production Fresa readiness until P0 live PDF evidence exists.

## How to run (manual / future harness)

1. `listFresaP0LivePdfQueue()` → codes  
2. Browse: generate sample PDF for each `verified_sample`  
3. Entity-bound: generate via pack when bound  
4. Capture per-page PNG under `qa/artifacts/p0/`  
5. Record pass/fail (footer, headers, orientation, fonts, logos)
