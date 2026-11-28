# Phase 1.2.1 — Visual review pack (human inspection)

**Purpose:** Evidence for the four Phase 1.2 priority targets.  
**Raster:** 150 DPI (`pdftoppm`), page 1 only.  
**Masks:** identical to pilot — top **12%** + footer **8%** white-out (`pilotVisualCompare.ts`).  
**No** source/renderer/layout/threshold changes. Original pilot PDFs unchanged.

See also: `REFERENCE_SOURCE_VERIFICATION.md`.

---

## How to read each pack

| File pattern | Meaning |
|---|---|
| `*_COMPARISON.png` | Side-by-side: generated (left) vs reference (right), **masked** |
| `*_DIFF.png` | pixelmatch difference (red = mismatch), **masked** |
| `*_OVERLAY.png` | Magenta where gen≠ref, average elsewhere, **masked** |
| `*_ANNOTATED_GEN.png` | Generated page with cyan mask guides + red callout box, **masked** |
| `*_ANNOTATED_GEN_UNMASKED.png` | Same callouts on **unmasked** gen (Format 4 / Draft-1 only) — letterhead/nature sit inside top mask |
| `*_GEN_MASKED.png` / `*_REF_MASKED.png` | Masked singles |
| `*_META.json` | Paths, diff %, concentration stats |

Cyan horizontal lines on annotated images mark the pilot mask boundaries.

---

## 1. FORMAT3 — expansion blocker

| Field | Value |
|---|---|
| Report code | `INVOICE_REPORT_FORMAT_3_SUMMARY_INVOICE` |
| Fixture | `base` |
| Page | 1 |
| Generated | `reports/qa/universal/pilot/generated/INVOICE_REPORT_FORMAT_3_SUMMARY_INVOICE__base.pdf` |
| Reference | `reports/references/files/invoice-report-format-3-summary-invoice.pdf` (**verified**) |
| Masked diff | **20.38%** |
| Concentration | **top/right** dominant (top band of *unmasked* thirds still leads after mask; middle secondary; bottom small) |
| Reported issue | Large residual vs sample — inspect localization |
| Primary images | `FORMAT3_COMPARISON.png`, `FORMAT3_DIFF.png`, `FORMAT3_OVERLAY.png`, `FORMAT3_ANNOTATED_GEN.png` |

**Review question:** Is the ~20% residual concentrated in dynamic parties/charges (acceptable) or structural layout divergence (defect candidate)? Do **not** call defect without reading the DIFF.

---

## 2. FORMAT21 — expansion blocker

| Field | Value |
|---|---|
| Report code | `INVOICE_REPORT_FORMAT_21_WAREHOUSE_INVOICE` |
| Fixture | `base` |
| Page | 1 |
| Generated | `…/INVOICE_REPORT_FORMAT_21_WAREHOUSE_INVOICE__base.pdf` |
| Reference | `reports/references/files/invoice-report-format-21-warehouse-invoice.pdf` (**verified**) |
| Masked diff | **16.20%** |
| Concentration | **top/left** dominant |
| Reported issue | Residual + `LIVE CONSIGNEE` vs `Job No` / `JOB-PILOT` IoU (layout QA) |
| Callout | Red box ≈ mid-form party/job band on annotated gen |
| Primary images | `FORMAT21_COMPARISON.png`, `FORMAT21_DIFF.png`, `FORMAT21_OVERLAY.png`, `FORMAT21_ANNOTATED_GEN.png` |

**Review question:** Does the red callout show true overpaint of Job fields by consignee text, or adjacent-cell IoU only? Correlate with DIFF hotspots.

---

## 3. FORMAT4 — secondary (long_party wrap vs address)

| Field | Value |
|---|---|
| Report code | `INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE` |
| Fixture | `long_party` |
| Page | 1 |
| Generated | `…/INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE__long_party.pdf` |
| Reference | `reports/references/files/invoice-report-format-4-standard-tax-invoice.pdf` (**verified**; sample ≠ long_party fixture) |
| Masked diff | **~1.05%** (low — letterhead largely inside top mask) |
| Concentration | top/left (of remaining unmasked residual) |
| Reported issue | Wrap line IoU with address (`Suite 1204…` vs `Forwarding And Supply…`) |
| Primary images | `FORMAT4_COMPARISON.png`, `FORMAT4_DIFF.png`, `FORMAT4_OVERLAY.png`, `FORMAT4_ANNOTATED_GEN.png`, **`FORMAT4_ANNOTATED_GEN_UNMASKED.png`** |

**Important:** The Phase 1.2 warning sits in the **letterhead/address band**, which the pilot **masks**. Use **`FORMAT4_ANNOTATED_GEN_UNMASKED.png`** for the wrap/address inspection; masked DIFF understates that specific issue by design.

---

## 4. HAWB_DRAFT1 — secondary (long_party nature edge)

| Field | Value |
|---|---|
| Report code | `HAWB_DRAFT_REPORT_FORMAT_1` |
| Fixture | `long_party` |
| Page | 1 (first copy face) |
| Generated | `…/HAWB_DRAFT_REPORT_FORMAT_1__long_party.pdf` |
| Reference | `reports/references/files/hawb-draft-report-format-1.pdf` (**verified**) |
| Masked diff | **~1.20%** |
| Concentration | top/left |
| Reported issue | Nature/cargo line may leave right page edge (layout QA `text_outside_page`) |
| Callout | Red box ≈ right mid-page nature band |
| Primary images | `HAWB_DRAFT1_COMPARISON.png`, `HAWB_DRAFT1_DIFF.png`, `HAWB_DRAFT1_OVERLAY.png`, `HAWB_DRAFT1_ANNOTATED_GEN.png`, **`HAWB_DRAFT1_ANNOTATED_GEN_UNMASKED.png`** |

**Review question:** On the unmasked annotated gen, does the nature string visually clip at the right margin, or is the QA bbox over-wide?

---

## Concentration summary

| Target | Masked diff | Dominant residual region (pixelmatch reds) |
|---|---:|---|
| FORMAT3 | 20.38% | top / right-heavy |
| FORMAT21 | 16.20% | top / left-heavy |
| FORMAT4 | ~1.05% | top / left (letterhead issue mostly masked) |
| HAWB_DRAFT1 | ~1.20% | top / left |

---

## Stop

Visual pack ready for human inspection. No defect claims beyond presenting evidence. Await review outcomes before Phase 1.3 fixes or family expansion.
