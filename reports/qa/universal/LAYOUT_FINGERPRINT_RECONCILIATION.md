# Phase 0.5 — Layout Fingerprint Reconciliation (375 vs 376)

**Mode:** Audit only.  
**Live recount evidence:** `reports/qa/universal/_phase05_fingerprint.json`  
**Tooling:** `tools/reports/build-manifest.mjs` → `fingerprintPdf`, `geometryKey`, `normalizedGeometryBody`; recount driver `tools/reports/fingerprint-counts.mjs`

---

## 1. Verdict

| Artifact | PDFs | Strict layouts | Status |
|---|---:|---:|---|
| Live recount (2026-11-26) | **401** | **375** | **Authoritative now** |
| `reports/references/layouts.csv` | 401 member files | **375** rows | **Matches live** |
| `reports/references/layout-counts.json` | **402** | **376** | **Stale** |
| `reports/references/summary.json` `uniqueLayouts` | — | **376** | **Stale** (same era) |

**Root cause (verified):** One PDF was removed from the pin set (Fresa Gold **brochure**, documented in `docs/reports/PROGRESS.md` Phase 0). That file had a **unique** strict fingerprint. Removing it dropped both PDF count and unique-layout count by **1** (402→401, 376→375).

**Not caused by:** dynamic text in the fingerprint, or layouts.csv mis-count relative to current disk.

Live vs CSV: `liveStrictNotInCsv: []`, `csvFingerprintNotInLiveCount: 0`.

---

## 2. Exact “extra” layout in the stale 376

**Unresolved by filename in this pass:** `layout-counts.json` does not store the hash→file map from the 402-PDF run, so the removed brochure’s fingerprint hex is not recoverable from that JSON alone.

**Verified inference:**

- Brochure was the third scanned/ignored pin; PROGRESS: “This phase removes the Fresa Gold brochure from that pin.”  
- Live disk has **no** PDF outside manifest / layout member lists.  
- Therefore the +1 layout in stale JSON is the fingerprint of the **removed brochure PDF**, not a normalization bug still present on disk.

**Assumption:** brochure filename historically under `reports/references/files/` (exact basename not re-listed in current tree).

---

## 3. Are dynamic fields in the fingerprint?

**Verified — no (strict key):**

`fingerprintPdf` (`build-manifest.mjs`):

1. Read page 1 MediaBox size → `round(width)xround(height)`  
2. `geometryKey(operatorList)` → rectangles + lines only, coords rounded, sorted, joined, **capped at 900 shapes**  
3. `sha256(size|body).slice(0,16)` → `strict`

Text labels are collected in `inspectPdf` for **delta** columns when building `layouts.csv`, but **are not** part of `strict` / `detailNormalized` hashes.

Numbers-heavy strings and short glyphs are filtered from label deltas; they still do not enter the geometry hash.

---

## 4. Detail-row normalization

| Key | Live count | Rule |
|---|---:|---|
| `strict` | **375** | Full line/rect geometry |
| `detailNormalized` | **373** | `normalizedGeometryBody` drops repeating horizontal “detail row” Y bands (step 8–36pt, run ≥3) and verticals spanning that band |

Stale JSON: `detailRowNormalizedLayouts: 374` (= live 373 + 1), consistent with brochure removal.

Normalization **reduces** uniqueness; it does **not** invent the 376 vs 375 gap.

---

## 5. Duplicates vs distinct designs

**Verified:**

- **375** unique strict hashes for **401** PDFs ⇒ average ~1.07 files/layout.  
- **18** strict clusters have ≥2 member files (live).  
- Some multi-member clusters **mix families** (PROGRESS + `layouts.csv` L001 MAWB+HBL example) — geometry-identical or near-identical forms with different label deltas.  
- That is **grouping different product codes**, not “duplicate registry IDs counted as layouts.”

**Inferred risk:** Treating one `layout_id` as one product spec can merge MAWB/HBL lookalikes — Phase 1 must review multi-member clusters (already noted in PROGRESS).

---

## 6. Deterministic fingerprinting rule (canonical)

**Name:** `freightnest.layout.strict.v1` (descriptive; not a coded constant today)

**Inputs:** First page of a PDF file on disk.

**Algorithm (must match `export async function fingerprintPdf`):**

1. Parse with pdfjs; `page = getPage(1)`.  
2. `size = `${Math.round(viewport.width)}x${Math.round(viewport.height)}``.  
3. Extract operator-list rectangles and lines via `geometryKey` (same rounding/sort/slice(0,900) as build-manifest).  
4. `strict = sha256(`${size}|${geometry.body}`).hex.slice(0, 16)`.  
5. Optional `detailNormalized = sha256(`${size}|${normalizedGeometryBody(rects,lines)}`).hex.slice(0, 16)`.

**Excluded from both keys:** text strings, images, fonts, annotations, pages 2+.

**Cluster ID in CSV:** `L{nnn}-{strict}` written by `build-manifest.mjs` main when regenerating `layouts.csv`.

**Refresh procedure (not run in this audit — would rewrite artifacts):**

```bash
node tools/reports/fingerprint-counts.mjs   # refreshes layout-counts.json only
# Full layouts.csv refresh requires build-manifest main path (heavier)
```

Until `layout-counts.json` is regenerated, **cite 375 / 401**, not 376 / 402.

---

## 7. Labels

| Finding | Label |
|---|---|
| 375 matches layouts.csv and live disk | **Verified** |
| 376/402 are stale post-brochure | **Verified** (PROGRESS + live delta −1/−1) |
| Brochure is the missing unique layout | **Inferred** (strong); filename **unresolved** without git history dig |
| Dynamic values inflate unique layouts | **Falsified** for strict key |
