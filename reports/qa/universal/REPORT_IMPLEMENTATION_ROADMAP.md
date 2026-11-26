# Universal Report QA — Implementation Roadmap

**Mode:** Proposal only. **Stop for approval before implementing.**  
**Counts below are verified** unless marked assumption.

---

## 0. Reality check (do not skip)

| Metric | Verified value |
|---|---|
| Registered catalogue codes | **852** (not 956) |
| Format-map rows (broader universe) | **1016** |
| status.json keys | **856** (`in_progress` 6, `reference_only` 850, `accepted` **0**) |
| Pinned references (`has_reference=yes`) | **420** |
| Measured generate path | **412** format-map / **421** face objects |
| JSON shell fallback | **538** |
| Unmapped | **62** |
| Layout clusters | **375** (17 multi-member) |
| Signoff accepted | **0** |

---

## Phase A — Wire the audit into a living index (1–3 days)

1. Check in / keep `reports/qa/universal/*` audit artifacts.  
2. Add npm script `report:universal-audit` that regenerates catalogue/family/reference JSON from registry + format-map (read-only).  
3. Publish a one-page `SUMMARY.md` for stakeholders with the 852 vs 956 clarification.

**Exit:** Fresh JSON regenerable; no renderer changes.

---

## Phase B — Universal runner MVP (1–2 weeks)

1. Implement `tools/reports/universal-batch.mjs` calling **product** generate path for a pilot set:  
   - 5 official HAWB  
   - 5 measured invoices  
   - 5 HBL measured  
   - 5 JSON-shell samples  
2. Emit per-code `qa.json` with page box + pdfjs text extract + Fresa-identity leak check.  
3. Collision detector v1 (bbox IoU).  
4. Dashboard markdown grouped by family.

**Exit:** Pilot CSV of failures matching known HAWB leftover/overlap classes.

---

## Phase C — Fixtures + masks (1–2 weeks)

1. Land `reports/fixtures/universal/` profiles per `REPORT_FIXTURE_STRATEGY.md`.  
2. Mask profiles for top layout_ids with references.  
3. Connect `diff-pilot` raster compare for codes with pins only.

**Exit:** Reference-backed codes have raster layer; others marked `skipped_no_pin`.

---

## Phase D — Scale by layout cluster (2–4 weeks)

1. Run structural QA across all **852** registry codes.  
2. Deep reference compare one-per-`layout_id` then fan out.  
3. Quarantine `html2canvas` / JSON-shell codes with honest `renderer_gap` verdict.  
4. Prioritize promoting JSON-shell → measured by family (invoice → HBL → arrival/DO → WMS → lists).

**Exit:** `latest-results.json` coverage ≥ 95% of registry with verdicts (pass/fail/skip).

---

## Phase E — CI + catalogue honesty (ongoing)

1. PR gate: changed family must not introduce new collision/leak failures.  
2. Catalogue badge: show universal QA verdict (separate from MASTER_PROMPT `accepted`).  
3. Human signoff remains the only path to `accepted`.

---

## Recommended sequence (priority)

1. **HAWB five + measured invoices** — highest user-visible pain; vector path exists.  
2. **HBL measured letterhead/collision** — large family (125 enrichment).  
3. **Arrival / DO / manifest** — many country variants; reference orphans.  
4. **JSON-shell honesty** — stop claiming Fresa fidelity; batch promote to measured.  
5. **Ops lists / Excel** — separate non-pixel acceptance (MASTER_PROMPT Excel rules).  
6. **Unmapped 62** — triage delete vs add pin vs add layout.

---

## Explicit non-goals until approved

- Modifying report templates / JSON layouts / global PDF settings  
- Pushing to GitHub / deploying  
- Marking any code `accepted` without harness + signoff  
- Treating **956** as the registry size  

---

## Approval gate

Await explicit approval before Phase B implementation. Audit deliverables in `reports/qa/universal/` are complete for this stop.

---

## After Phase 0.5 reconciliation (recommended next — still not implemented)

1. **Refresh stale inventories only** (scripted, no renderer changes): regenerate `layout-counts.json` via `npm run report:layout-counts`; rebuild `fresa-system-format-map.csv` so HAWB five show measured/sparse.  
2. **Pilot product-path batch** for official HAWB five + 5 measured invoices (collision/leak checks) — still requires explicit approval (former Phase B).  
3. Do **not** treat 956 as a backlog size; backlog against **852 IDs** + separate **62 unmapped** + **25 unverified HAWB aliases**.
