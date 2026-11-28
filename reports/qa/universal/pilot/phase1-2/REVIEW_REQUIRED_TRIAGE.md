# Phase 1.2 — REVIEW_REQUIRED triage (16)

All 16 REVIEW_REQUIRED rows share:

1. `visualInspectionRequired: true` from layout QA (dense text and/or `image_barcode_not_proven_by_text`).
2. **No** `fail` layout issues and **no** Fresa identity hits on these rows.
3. Base fixtures (except HAWB long_party companions) carry masked raster status **review** (never auto-PASS; FAIL only if diff ≥25%).

Classification: predominantly **reference comparison limitations + dynamic content** (live parties/org vs Fresa sample), requiring **manual visual review**. High residuals are expansion soft-gates.

---

## Official HAWB

| Code | Fixture | Visual diff (base) | Classification | Severity | Evidence |
|---|---|---:|---|---|---|
| `HAWB_DRAFT_REPORT_FORMAT` | base | 2.00% | Manual visual | low | No warn rules; VIR only. Residual dynamic cargo/parties after letterhead/footer mask. |
| `HAWB_DRAFT_REPORT_FORMAT` | long_party | n/a (no base compare) | Manual visual | low | Same VIR path; long parties expected. |
| `HAWB_DRAFT_REPORT_FORMAT_2` | base | 3.06% | Manual visual | low–medium | Highest HAWB residual; still ≪25%. |
| `HAWB_DRAFT_REPORT_FORMAT_2` | long_party | n/a | Manual visual | low | |

HAWB Draft-1 / Originals landed in **WARNING** (not REVIEW) because they also have collision/overflow warnings — see `WARNING_TRIAGE.md`.

---

## Invoice REVIEW rows (base only)

| Code | Visual diff % | Classification | Severity | Notes |
|---|---:|---|---|---|
| `INVOICE_REPORT_FORMAT_3_SUMMARY_INVOICE` | **20.38** | **Manual visual + blocks expansion (soft)** | **high** | Largest residual in pilot. Possible real layout/content gap vs sample — **do not expand families until reviewed**. Diff image under `pilot/visual/…FORMAT_3…`. |
| `INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE` | 0.99 | Manual visual | low | Clean text QA on base; wrap issues only on long_party WARNING. |
| `INVOICE_REPORT_FORMAT_7_SIMPLE_INVOICE` | 2.37 | Manual visual | low | |
| `INVOICE_REPORT_FORMAT_9_STANDARD_INVOICE_USA` | 0.64 | Manual visual | low | |
| `INVOICE_REPORT_FORMAT_10_STANDARD_INVOICE` | 1.16 | Manual visual | low | |
| `INVOICE_REPORT_FORMAT_11_STANDARD_INVOICE_LAND` | 3.50 | Manual visual | medium | Highest among “quiet” invoices after Format 3/21. |
| `INVOICE_REPORT_FORMAT_12_…_PREPRINTED` | 1.71 | Manual visual | low | Preprinted underlay not text-proven. |
| `INVOICE_REPORT_FORMAT_13_STANDARD_INVOICE_USA` | 1.64 | Manual visual | low | |
| `INVOICE_REPORT_FORMAT_14_INVOICE` | 1.97 | Manual visual | low | Phase 1.1 cleared AL NASER; residual is branding/dynamic. |
| `INVOICE_REPORT_FORMAT_15_INVOICE_FCY` | 1.85 | Manual visual | low | Same post-leak REVIEW. |
| `INVOICE_REPORT_FORMAT_16_…_PREPRINTED` | 1.12 | Manual visual | low | |
| `INVOICE_REPORT_FORMAT_17_INVOICE_JASPER` | 1.88 | Manual visual | low | Same post-leak REVIEW. |

---

## Why REVIEW ≠ FAIL

- Pilot policy: raster never auto-PASS; only FAIL if masked diff ≥25% or layout `fail` / visual `fail`.
- Text layer cannot prove logos, barcodes, or same-ink underlays → forced VIR.
- Letterhead/footer masks intentionally hide approved branding differences; body residuals remain.

## Expansion gate (REVIEW)

| Item | Blocks other families? |
|---|---|
| Format 3 @ 20.38% | **Yes (soft)** — human review required |
| Formats 14/15/17 REVIEW after leak fix | No — expected residual |
| HAWB Draft / Draft-2 REVIEW | No — expected dynamic residual |

See `PHASE1_2_RECOMMENDATION.md`.
