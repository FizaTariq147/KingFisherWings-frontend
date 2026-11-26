# Universal Report QA Engine — Design

**Mode:** Design only (audit phase). No implementation in this deliverable.  
**Constraint:** Reuse existing `tools/reports/*` infrastructure where possible.

---

## 1. Goals

Produce **machine-readable QA for every registered code** (852 verified), with:

- Deterministic fixture generation  
- Text bbox / collision / overflow checks  
- Automated render + visual regression  
- Reference compare with approved dynamic masks  
- Family-grouped failure dashboard  

Align with MASTER_PROMPT acceptance layers (page, static geometry, static text, dynamic text, raster ≤0.5% @150dpi, pagination).

---

## 2. Reuse map (verified existing assets)

| Asset | Path | Reuse |
|---|---|---|
| Registry | `fresaReportRegistry.generated.ts` + `reportRegistryV2` | Code universe + enrichment family |
| Format map | `reports/references/fresa-system-format-map.csv` | generate_path / has_reference |
| Layout clusters | `reports/references/layouts.csv` | Deduplicate work by layout_id |
| Extract / render / diff | `tools/reports/extract.mjs`, `render-spec.mjs`, `diff-pilot.mjs` | Spec pipeline |
| Parallel verify | `tools/reports/verify-pool.mjs`, `verify-worker.mjs` | Batch runner skeleton |
| Full run CSV | `tools/reports/full-run.mjs` → `reports/full-run.csv` | Historical results schema |
| Status / signoff | `reports/status.json`, `reports/signoff.csv`, `build-status.mjs` | Acceptance gate |
| Conformance UI | `reportConformanceStatus.ts` | Dashboard badge source |
| Fixtures | `src/features/reports/qa/phase*-fixtures`, hawb fixtures | Seed patterns |
| Catalogue generate | `generateCatalogLayoutPdf` | **Product path under test** (must be exercised, not only render-spec) |

---

## 3. Components

### 3.1 Universal batch-generation runner

**Proposed:** `tools/reports/universal-batch.mjs`

Inputs:

- `--universe registry|format-map|layout:<id>|family:<name>|file:<list.json>`  
- `--path product|spec` — product = call shared Node wrapper around catalogue generate; spec = existing extract/render  
- `--fixture set` — deterministic data pack id  
- `--out reports/qa/universal/runs/<runId>/`

Outputs per code:

```
<code>/
  product.pdf
  meta.json          # renderer path taken, page boxes, timing
  text.json          # pdfjs text items with bbox
  qa.json            # pass/fail layers
```

Aggregate: `run-summary.json` + `run-summary.csv`.

**Verified gap:** Today `full-run.mjs` verifies **pinned reference redraw via specs**, not necessarily the same blob the catalogue UI downloads. The universal runner must record **which generate path was used** (mirror format-map + runtime branch).

### 3.2 Family classification registry

**Proposed artifact:** `reports/qa/universal/family-registry.json` (generated from enrichment + format-map; this audit’s `REPORT_FAMILY_MAPPING.json` is the seed).

Fields: `code`, `businessFamily`, `templateFamily`, `documentType`, `generatePath`, `layoutId`, `hasReference`, `measuredFace`, `fixtureProfile`, `maskProfile`.

### 3.3 Deterministic fixtures

See `REPORT_FIXTURE_STRATEGY.md`. Engine loads fixture by `fixtureProfile` and never invents Fresa demo identity into product asserts (org chrome from test org profile).

### 3.4 Text bbox + collision validation

Pipeline:

1. pdfjs `getTextContent` → items with transform → axis-aligned bbox at font size  
2. Pairwise IoU / intersection area for items on same page with different strings  
3. Fail if intersection area > threshold **and** neither item is allowlisted label overlap  
4. Special rules: stacked baselines with Δy < 0.5·size (HAWB phone/email defect class)

Emit: `collisions[]` with codes `{a,b,page,area}`.

### 3.5 Overflow / clipping detection

- Compare text advance width to nearest fieldSlot / cell width from measured face or spec  
- Flag when `widthOfTextAtSize > slotWidth + epsilon`  
- Flag glyphs with bbox outside MediaBox or outside measured frame rect  

### 3.6 Visual regression + reference compare

Reuse `diff-pilot.mjs` raster layer:

- Render product PDF pages @150 dpi (poppler or pdfjs canvas)  
- Mask dynamic regions: logo box, company/address band, footer Printed By/Date, live party/cargo values  
- Mask profiles versioned under `reports/qa/universal/masks/<layoutId>.json`  
- Threshold: MASTER_PROMPT 0.5% differing pixels after masks  

Codes **without** reference: run structural QA only (bbox/collision/overflow/page box); mark `reference_compare: skipped_no_pin`.

### 3.7 Machine-readable QA result schema

```json
{
  "code": "HAWB_DRAFT_REPORT_FORMAT",
  "runId": "...",
  "family": "hawb",
  "generatePath": "hawb_official_measured",
  "layers": {
    "page": { "pass": true },
    "geometry": { "pass": true, "detail": {} },
    "staticText": { "pass": false, "failures": [] },
    "dynamicText": { "pass": true },
    "collisions": { "pass": false, "count": 2 },
    "overflow": { "pass": true },
    "raster": { "pass": false, "diffPct": 1.2 },
    "pagination": { "pass": true }
  },
  "verdict": "fail",
  "blockerClass": "collision|overflow|raster|missing_reference|renderer_gap"
}
```

Roll into `reports/qa/universal/latest-results.json` keyed by code.

### 3.8 Dashboard

**Phase 1 (static):** generate `reports/qa/universal/DASHBOARD.md` + JSON grouped by `templateFamily` and `blockerClass`.  
**Phase 2 (UI):** extend Report Catalog badges to read universal results (optional; requires FE change — out of audit).

Group failures by family first (invoice / hbl / hawb / ops_list / …) so remediation sprints match enrichment families.

---

## 4. Acceptance coupling

- Engine **never** writes `accepted` into `status.json`  
- Only `tools/reports/signoff.mjs` / human signoff CSV promotes acceptance after all layers pass  
- CI can gate PRs on `blockerClass` for touched families without claiming acceptance  

---

## 5. Performance design

- Shard by `layout_id` (375 clusters) — one deep compare per layout, members inherit structural results with code-specific dynamic masks  
- Worker pool pattern already in `verify-pool.mjs`  
- Cache rendered page PNGs by `(code, fixtureHash, pipelineVersion)`  

---

## 6. Risks

| Risk | Mitigation |
|---|---|
| Product path ≠ spec path | Always record both; prefer product path for catalogue fidelity |
| No reference for 500+ codes | Structural QA + JSON-shell honesty badge; do not fake raster pass |
| Flaky html2canvas | Prefer measured/vector; quarantine capture path |
| Mask drift | Masks reviewed with layout_id; change requires reviewer note |
