# Reports branch consolidation — integration status

Updated: 2026-11-21 (after approved merge steps; catalog-ui cherry-pick **blocked**).

## Stop reason (step 4)

Cherry-pick of `269157ed` (catalog-ui redesign) was **not** done.

`src/features/reports/utils/partitionCatalogStrips.ts` in that commit imports breadth-only symbols:

| Symbol | File | On integration? | On breadth? |
|---|---|---|---|
| `isReportsV2Code` | `src/features/reports/engine/reportsV2Gate.ts` | **NO** | YES |
| `reportsV2BadgeText` | same | **NO** | YES |

Related breadth-only files (not taken): `breadthCodes.ts`, `reportsV2Source.ts`, `reportsV2Gate.test.ts`.

Per instructions: list deps → **stop** → do **not** merge breadth soft-gate. Waiting for your decision (e.g. thin adapter that uses only `invoiceV2SpecCodes` / conformance status, without 92-code wiring).

---

## What was merged into `reports/integration`

Base: **`origin/reports/invoice-v2` @ `8cb2709c`**

| Step | Commit(s) | Result |
|---|---|---|
| 1. Merge `format1-polish` | merge commit + format1 tip | Clean (no conflicts). Track-a last files came from format1 side as-is. |
| 2. `invoice-bindings.mjs` | `1a88eef6` | **Kept format1-polish behaviour** (amount-words, FCY Amount, label heuristics). **Added breadth’s document-family skip** in `loadDictionary` so document aliases stay for fill-spec-spans. |
| 2b. Binding diff + qty | `85aaa4d3` | `flaggedCount: 0`. Format 10 qty 2 / 3 / 12.5 print correctly. |
| 3. Breadth context only | `a1098e50` | See file list below. **No** 92-code soft-gate. |
| 4. catalog-ui `269157ed` | — | **Blocked** (breadth-only `reportsV2Gate`). |
| 5. Ignore generated artifacts | `3c0a4ee8`, `ea70f777` | Untracked `*-last.csv`, summary last-runs, `reports/output/`, etc. Restored Phase 0 `reports/references/*-summary.json`. |

### Breadth files taken (step 3)

- `tools/reports/document-context.mjs` (`buildDocumentContext`, `moduleForCode`, `NO_SOURCE_PATHS`)
- `tools/reports/fill-spec-spans.mjs`
- `src/features/reports/contracts/reportBindings.ts` (`documentBindingPaths`)
- `src/features/reports/contracts/reportBindings.test.ts`
- `reports/binding-dictionary.csv` (document-family rows)
- Plus the document-family skip line in `tools/reports/invoice-bindings.mjs` (step 2)

### Left out

- Full **`reports/breadth`** tip / 92-code soft-gate (`breadthCodes.ts`, catalogue soft-gate wiring, samples, `wired.json`)
- Whole **`reports/catalog-ui`** tip (would pull breadth); cherry-pick `269157ed` pending dependency decision
- Local junk checkpoints: `reports/invoice-v2` @ `7401f60c`, `reports/catalog-ui` @ `23624dc1`
- Stashes (not dropped): see below

---

## Tests run on integration

| Check | After steps | Result |
|---|---|---|
| `report:guard-classic` | after format1 merge, bindings, context, gitignore | pass |
| `report:leak-check` | same | 0 leaks |
| Binding diff (26 codes × 10 real + 15 synthetic) | step 2 | **0 flagged** label swaps |
| Qty proof Format 10 (2, 3, 12.5) | step 2 | pass (values + PDF) |
| 399 verify (`verify-pool full`) | after last completed step | **pass** (exit 0). Same 3 known geometry-only raster regressions: `ADVANCE_SHIPPING_NOTE_FORMAT_1`, `FG_STANDARD_INVOICE_TANZANIA_RPM_REF_1431`, `FG_TAX_INVOICE_INDIA_FORMAT4_RPM_REF_1007`. No new regressions. |

---

## Stashes (not deleted)

```
stash@{0}: On reports/invoice-v2: verify noise
  — cache/work PNGs+PDFs, classic-snapshots/work PDFs, full-run-track-a-last.csv/summary
stash@{1}: On reports/format1-polish: wip format1 leftovers
  — empty tracked diff (likely untracked-only or already applied)
```

## Local junk checkpoints (not deleted)

- `git diff --stat origin/reports/invoice-v2 reports/invoice-v2` → local tip `7401f60c` is a large accidental breadth dump (~140 files).
- `git diff --stat origin/reports/catalog-ui reports/catalog-ui` → local tip `23624dc1` adds classic-snapshots work + batch-live/leak-check JSON only.

---

## Recommended deletions (after your approval only)

Once catalog-ui is landed without soft-gate (or you accept a thin substitute for `isReportsV2Code` / `reportsV2BadgeText`):

- `reports/format1-polish` (fully merged)
- `reports/catalog-ui` (after cherry-pick/adapt)
- Optionally `reports/breadth` if soft-gate stays deferred and context extraction is enough
- Reset local junk tips of `reports/invoice-v2` / `reports/catalog-ui` to their remotes (do not drop stashes until inspected)

Do **not** delete until you say so.
