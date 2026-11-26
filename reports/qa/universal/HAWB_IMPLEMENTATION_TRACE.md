# Phase 0.5 — HAWB Implementation Trace

**Mode:** Audit only. No `HAWB_LOCK` restore.  
**Evidence:** `generateHawbOfficialPdf.ts`, `generateHawbSparsePdf.ts`, `officialFaceRegistry.ts`, `officialFormatGovernance.ts`, `hawbFormatCatalog.ts`, `generateCatalogLayoutPdf.ts`, format-map rows, `_phase05_hawb.json`

---

## 1. Registry → catalogue surface

| Layer | Count / behavior | File |
|---|---|---|
| Registry IDs `/^HAWB_/` | **30** | `fresaReportRegistry.generated.ts` |
| Primary catalogue list | **5** official only | `listHawbFormats()` in `hawbFormatCatalog.ts` |
| Governance codes | **5** | `OFFICIAL_HAWB_FORMAT_CODES` in `officialFormatGovernance.ts` |
| Draft-3…27 / non-official | `classifyHawbFormatStatus` → `unverified`; `shouldExposeHawbInPrimaryCatalogue` → false | same |
| Measured faces present | **5** (all official) | `measuredFaces.generated.ts` |

---

## 2. `HAWB_LOCK`

| Location | Mentions |
|---|---|
| `src/features/reports/templates/official/officialFaceRegistry.ts` | **0** (lock removed; comment says faces promoted) |
| `docs/reports/MASTER_PROMPT.md` | **0** |
| `docs/reports/PROGRESS.md` | **2** (historical “locked out” decision text — **stale vs code**) |

**Do not restore** without a new design approval. Current code path for Drafts is measured unlock via `getOfficialMeasuredFace` inside `generateHawbOfficialPdf`.

---

## 3. Catalogue Generate routing (official five)

Entry: `generateCatalogLayoutPdf` (`src/features/reports/utils/generateCatalogLayoutPdf.ts`)

1. Skips direct measured branch when `isHawbOfficialNativeCode(code)` (HAWB handled later).  
2. Draft-2: optional `fetchHawbDraft2PlaywrightPdf` (`hawbDraft2PrintClient.ts`) — local Vite print; often null in prod.  
3. When workflow is freightnest generate / entityBound / `preferHawbOfficial`:  
   `generateHawbOfficialPdf(code, data)`  
4. Inside `generateHawbOfficialPdf`:  
   - Original-1/2 → `isHawbSparseNativeCode` → **`generateHawbSparsePdf`** (pdf-lib)  
   - Draft / Draft-1 / Draft-2 → `getOfficialMeasuredFace` → **`generateOfficialMeasuredPdf`** + Airway T&C  
   - Else fallback: React document + **html2canvas** + jsPDF (only if measured face missing)

`resolveReportPdfWorkflow` always returns freightnest generate in current code (**verified** in prior audit) ⇒ official five hit native path on Generate.

---

## 4. Format-map staleness (verified)

All five official HAWB rows still say:

- `generate_path=json_shell_fallback`  
- `measured_face=no`  

while runtime uses measured/sparse. **Rebuild** `fresa-system-format-map.csv` via `tools/reports/build-fresa-system-format-map.mjs` before trusting HAWB path columns.

---

## 5. Per-ID mapping table (all 30 registry HAWB codes)

Legend — **Status:**  
`official_measured` | `official_sparse` | `alias_unverified` | `map_unmapped`

| Report ID | Official? | Format-map `generate_path` | Actual Generate function (freightnest) | Implementation status |
|---|---|---|---|---|
| `HAWB_DRAFT_REPORT_FORMAT` | yes | json_shell_fallback (**stale**) | `generateHawbOfficialPdf` → `generateOfficialMeasuredPdf` | **official_measured** |
| `HAWB_DRAFT_REPORT_FORMAT_1` | yes | json_shell_fallback (**stale**) | same (+ 9-page face) | **official_measured** |
| `HAWB_DRAFT_REPORT_FORMAT_2` | yes | json_shell_fallback (**stale**) | Playwright attempt then same measured path | **official_measured** (+ optional Playwright) |
| `HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_1` | yes | json_shell_fallback (**stale**) | `generateHawbOfficialPdf` → `generateHawbSparsePdf` | **official_sparse** |
| `HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_2` | yes | json_shell_fallback (**stale**) | `generateHawbSparsePdf` | **official_sparse** |
| `HAWB_DRAFT_REPORT_FORMAT_3` … `_9` | no | **unmapped** | Not `isHawbOfficialNativeCode`. Spec via `getHawbFormatSpec` with `sampleIsFallback`. JSON shell may resolve via `hawbFormatUiLayouts.ts` fallback to draft code; **not** measured official generator | **alias_unverified** / map **unmapped** |
| `HAWB_DRAFT_REPORT_FORMAT_10` … `_27` | no | **unmapped** | same as above | **alias_unverified** / map **unmapped** |

(Indices 3–9 and 10–27 are all registry members; none are in `OFFICIAL_HAWB_FORMAT_CODES`.)

---

## 6. Tests & fixture PDFs (verified presence)

| Test / fixture | Path | Covers |
|---|---|---|
| Dense chrome | `hawbDraftDenseChrome.test.ts` | Draft + Draft-2 generate blob text |
| Draft-1 measured | `hawbDraft1MeasuredGenerate.test.ts` | vector MediaBox / org chrome |
| Overlap fix | `hawbDraft1OverlapFix.test.ts` | party baselines |
| Sparse originals | `hawbSparseOriginal.test.ts` | Original-1/2 sparse |
| Measured generate each official | `hawbMeasuredGenerate.test.ts` | `OFFICIAL_HAWB_FORMAT_CODES` |
| Phase2 / 2.3 / 2.4 / 2.5 | `phase2*.test.ts` | acceptance/branding evidence |
| QA fixtures | `src/features/reports/qa/phase2-*-hawb*`, `tools/tmp-hawb-fresa/` | PNG/PDF pins |

**Green tests ≠ MASTER_PROMPT accepted** (signoff still empty).

---

## 7. Stale comments still in code/docs

| Item | Issue |
|---|---|
| `generateCatalogLayoutPdf.ts` comment “html2canvas remains for the other four official HAWB” | Outdated — measured is primary for Draft/1/2 |
| `referenceAccurate/index.ts` note similar | Outdated |
| PROGRESS “HAWB_LOCK” root-cause paragraph | Historical |

---

## 8. Labels

| Finding | Label |
|---|---|
| Official five → measured/sparse functions above | **Verified** |
| Format-map HAWB paths stale | **Verified** |
| `HAWB_LOCK` absent in TS | **Verified** |
| Draft-3…27 Generate exact blob for every code | **Inferred** alias/JSON/unmapped; not batch-executed this phase |
