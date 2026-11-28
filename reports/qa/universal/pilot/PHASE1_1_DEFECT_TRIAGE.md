# Phase 1.1 — Defect Triage (evidence-based)

**Scope note:** Phase 1 FAIL-PDF extraction named invoice measured formats **2 / 14 / 15 / 17** (sample party leak) and **4 / 8** (long-party). There are only five official HAWB codes; the “HAWB Format N” wording in the task maps to these **invoice** report codes in the pilot inventory. Official HAWB five were re-checked — no `AL NASER` leaks.

**Phase 1 baseline (preserve):** REVIEW_REQUIRED 13 · WARNING 18 · FAIL 7 · GENERATION_FAILED 0 · 65/65 generations OK.

## Defect A — Static sample party text leakage

| Report ID | Fixture | Assertion | Page | Coordinates | Classification | Evidence |
|---|---|---|---|---|---|---|
| `INVOICE_REPORT_FORMAT_2_TAX_INVOICE_INDIA` | base / long_party | `fresa_identity_leak` | 1 | ≈ (123.3, 648) rotated | **Real rendering defect** | Measured-face sample glyph `AL NASER TRADING COMPANY LLC`; rotated path skipped sample-value collection |
| `INVOICE_REPORT_FORMAT_14_INVOICE` | base | same | 1 | (302, 592.5) under `CONSIGNEE` (302, 605.7) | **Real rendering defect** | Same-column sample (not right-of-label); live stamp landed elsewhere |
| `INVOICE_REPORT_FORMAT_15_INVOICE_FCY` | base | same | 1 | (302, 592.5) | **Real rendering defect** | Same family as Format 14 |
| `INVOICE_REPORT_FORMAT_17_INVOICE_JASPER` | base | same | 1 | (302, 592.5) | **Real rendering defect** | Same family as Format 14 |

**Source:** face page `texts[]` sample party runs (not logo images / footer “Powered by”).  
**Not Fresa regex:** `isFresaIdentityText` only matches `/fresa|fresatechnologies/`.

### Official HAWB five (control)

| Report ID | Fixture | AL NASER | Notes |
|---|---|---|---|
| `HAWB_DRAFT_REPORT_FORMAT` | base / long_party | absent | Zoyan / long shipper present |
| `HAWB_DRAFT_REPORT_FORMAT_1` | base / long_party | absent | |
| `HAWB_DRAFT_REPORT_FORMAT_2` | base / long_party | absent | |
| `HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_1` | base / long_party | absent | |
| `HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_2` | base / long_party | absent | |

## Defect B — Long-party / Trading Division

| Report ID | Fixture | Assertion | Page | Classification | Evidence |
|---|---|---|---|---|---|
| `INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE` | long_party | `missing_required_text` (`Trading Division`) | 1 | **Real rendering + extractability defect** | Full company drawn as one run (~114 chars, ~670pt wide). pdfjs returns only first ≈100 glyphs of a single item → extract ended at `Company Tr`. Also overflowed page (`text_outside_page`). |
| `INVOICE_REPORT_FORMAT_8_STANDARD_INVOICE_ARABIC` | long_party | same | 1 | **Same as Format 4** | Same letterhead path |

**Ruled out:** incorrect fixture mapping (companyName correctly set to `LONG_NAME + " Trading Division"`); static fallback data; missing org mapping.

**Related unresolved (not Phase 1 FAIL):** `INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA` long_party — narrow right-aligned company slot (~137pt). Full suffix cannot fit without colliding the address band. Asserts capacity-fitting stem only. See unresolved list.

## WARNING / REVIEW classification (do not auto-PASS)

| Class | Pattern |
|---|---|
| Dynamic content / bbox collision heuristic | Most invoice + HAWB Draft-1 `text_bbox_collision` |
| Letterhead / URL near edge | `text_outside_page` on long chrome |
| Party band width | HAWB Original `region_overflow_heuristic` |
| Unverified visual residual | Masked raster REVIEW (HAWB Draft/Draft-2; invoices 3,4,7,9–17) |
| Approved branding difference | Org letterhead vs Fresa sample (masked) |
