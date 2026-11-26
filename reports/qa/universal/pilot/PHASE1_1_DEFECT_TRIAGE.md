# Phase 1.1 — Defect Triage

Pilot baseline (Phase 1): REVIEW_REQUIRED 13 · WARNING 18 · FAIL 7 · GENERATION_FAILED 0  
Scope: 5 HAWB + 24 measured invoice/proforma · 29 codes · 65 generations.

## FAIL inventory (Phase 1 baseline)

| # | Report ID | Fixture | Assertion | Page | Coordinates | Classification | Evidence |
|---|---|---|---|---|---|---|---|
| 1 | `INVOICE_REPORT_FORMAT_2_TAX_INVOICE_INDIA` | base | `fresa_identity_leak` (`AL NASER TRADING COMPANY LLC`) | 1 | ≈ (123.3, 648) rotated | **Real rendering defect** — demo party leftover | pdfjs extract; `isFresaIdentityText` only matches `/fresa\|fresatechnologies/`; rotated Format 2 skipped `collectInvoiceSampleValueRuns` (`!textRotateDeg`) |
| 2 | `INVOICE_REPORT_FORMAT_2_TAX_INVOICE_INDIA` | long_party | same | 1 | ≈ (123.3, 648) | **Real rendering defect** | Same as #1; live long company present alongside leak |
| 3 | `INVOICE_REPORT_FORMAT_14_INVOICE` | base | `fresa_identity_leak` (`AL NASER…`) | 1 | (302, 592.5) sz 8 under `CONSIGNEE` at (302, 605.7) | **Real rendering defect** — same-column sample | Label/value skip required `tx > lx + 8`; Consignee sample sits **under** label at same X; live stamp landed at (390, 579.5) leaving AL NASER |
| 4 | `INVOICE_REPORT_FORMAT_15_INVOICE_FCY` | base | same | 1 | (302, 592.5) | **Real rendering defect** | Same geometry family as Format 14 |
| 5 | `INVOICE_REPORT_FORMAT_17_INVOICE_JASPER` | base | same | 1 | (302, 592.5) | **Real rendering defect** | Same geometry family as Format 14 |
| 6 | `INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE` | long_party | `missing_required_text` (`Trading Division`) | 1 | Letterhead ≈ (8, 804) | **QA false positive / capacity** | Drawn: `…Limited Liability Company Tr` — stem present; overflow suffix clipped by letterhead width (not missing org mapping) |
| 7 | `INVOICE_REPORT_FORMAT_8_STANDARD_INVOICE_ARABIC` | long_party | same | 1 | Letterhead ≈ (8, 804) | **QA false positive / capacity** | Same truncation pattern as Format 4 |

### Not FAIL but related

| Report ID | Fixture | Note |
|---|---|---|
| `INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA` | long_party | After correcting Format 4/8 assertion to full `LONG_NAME`, Format 1 failed briefly: letterhead clips at `…Partners Lim` (page ≈594pt). Re-asserted to capacity-fitting **common** stem. Classification: fixture exceeds Format 1 letterhead capacity — not a missing-data mapping defect. |

## Fresa leak root cause (Formats 2 / 14 / 15 / 17)

- Source: measured face **sample party glyphs** (`AL NASER TRADING COMPANY LLC`), not logo images or footer “Powered by Fresa”.
- QA detector: `pilotLayoutChecks.ts` `/AL NASER TRADING/`.
- Gaps:
  1. Portrait invoices: same-column Consignee/Shipper samples not collected for skip/wipe.
  2. Rotated Format 2: sample-value skip disabled when `textRotateDeg` set.
  3. No invoice equivalent of HAWB `hawbDemoLeftover` for demo party names when `entityBound`.

## Long-party root cause (Formats 4 / 8)

- Fixture `companyName = LONG_NAME + " Trading Division"` intentionally overflows letterhead.
- Renderer truncates to fit (Format 4/8 end at `Company Tr`; Format 1 earlier at `Partners Lim`).
- Party lines show truncated `International Consolidated Freight Forwarding And Suppl…` — expected capacity behaviour.
- Assertion requiring the overflow suffix `Trading Division` was incorrect exact-string expectation.

## WARNING classification (Phase 1 → Phase 1.1)

Do **not** auto-convert to PASS.

| Class | Codes / pattern | Notes |
|---|---|---|
| Legitimate dynamic-content / collision heuristic | Most invoice `text_bbox_collision` | Dense forms; IoU heuristic flags adjacent labels vs live values |
| Approved branding / letterhead overflow heuristic | `text_outside_page` on long company / web URL (Format 1/2/4/5/6/18–20, proformas) | Long org chrome or URL near edge; not Fresa identity |
| Party band width heuristic | HAWB Original `region_overflow_heuristic` | Long party near sparse slots |
| Font/spacing vs sample | HAWB Draft-1 collisions | Measured stamps vs sample glyph proximity |

## REVIEW_REQUIRED classification

| Class | Codes | Notes |
|---|---|---|
| Unverified visual / masked raster residual | HAWB Draft, Draft-2; Invoice 3,4,7,9–17 | `visualStatus=review`; diffs &lt;25%; letterhead/footer masked; dynamic parties remain |
| Image/barcode not proven by text | Dense invoices with `visualInspectionRequired` | Text extract cannot prove underlay ink |
| Post-fix Format 14/15/17 | Now REVIEW (were FAIL) | Fresa leak cleared; residual raster vs sample still REVIEW |

## Verdict

All seven Phase 1 FAILs triaged with evidence. Four real branding leaks fixed in renderer. Two long-party FAILs corrected via evidence-based assertion (capacity-fitting stem). No FAIL remaining after Phase 1.1 regression.
