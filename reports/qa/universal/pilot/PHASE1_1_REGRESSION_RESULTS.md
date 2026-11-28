# Phase 1.1 — Regression Results

Command: `npm run report:pilot-phase1`  
Plus: `npx vitest run src/features/reports/qa/pilot/phase1_1DefectRemediation.test.ts` (3/3 pass)  
Generated findings: `PILOT_FINDINGS.md` @ 2026-11-27 (post-remediation run).

## Baseline vs after

| Metric | Phase 1 baseline | Phase 1.1 after |
|---|---:|---:|
| Generations | 65 | **65** |
| Generation OK | 65 | **65** |
| GENERATION_FAILED | 0 | **0** |
| FAIL | 7 | **0** |
| WARNING | 18 | **22** |
| REVIEW_REQUIRED | 13 | **16** |
| `fresaIdentityHits` (layout QA) | 7 FAIL leaks | **0** |
| `Trading Division` (Formats 4/8 long_party) | missing | **present** |

WARNING/REVIEW rose because former FAILs now land in WARNING/REVIEW after leak/wrap fixes — not new FAIL defects.

## Checklist

| Check | Result |
|---|---|
| All 65 generations succeed | Pass |
| Formats 2/14/15/17 AL NASER cleared | Pass |
| Formats 4/8 Trading Division extractable | Pass |
| Official HAWB five no AL NASER | Pass |
| Short/normal party names still positioned | Pass (Zoyan / LIVE parties on base) |
| No FAIL regression vs prior PASS set | Pass |
| Business mappings intact | Pass |
| Generation paths unchanged (except targeted measured letterhead/invoice sample skip) | Pass |

## Remaining (not auto-PASS)

| Verdict | Count | Notes |
|---|---:|---|
| FAIL | **0** | |
| WARNING | **22** | collision / outside-page / region-overflow heuristics |
| REVIEW_REQUIRED | **16** | masked visual residual; image/barcode not text-proven |
| GENERATION_FAILED | **0** | |

## Unresolved (wait for approval)

1. **`INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA` long_party** — narrow right letterhead (~137pt) cannot fit full `… Trading Division` without address-band collision. Stem asserted; suffix not claimed.
2. WARNING/REVIEW items above — need human visual sign-off; not converted to PASS.
3. Do **not** expand beyond official HAWB five + measured invoices until approved.

## Artifacts

- `PILOT_FINDINGS.md` / `.json`
- `PILOT_LAYOUT_QA_RESULTS.json`
- `PILOT_VISUAL_COMPARISON.md`
- `PILOT_GENERATION_RESULTS.json`
- `generated/*.pdf`
- `PHASE1_1_DEFECT_TRIAGE.md` / `PHASE1_1_FIX_EVIDENCE.md` / this file
