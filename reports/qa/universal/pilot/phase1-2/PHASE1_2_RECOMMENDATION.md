# Phase 1.2 — Recommendation (audit only)

Phase 1.1 baseline held: **65/65 OK · FAIL 0 · WARNING 22 · REVIEW_REQUIRED 16 · GENERATION_FAILED 0**.  
This phase classifies remaining findings; **no fixes implemented**.

## 1. Findings that may need actual code fixes (later approval)

| Priority | Item | Why |
|---|---|---|
| P1 | `INVOICE_REPORT_FORMAT_21` base — consignee vs Job No IoU + **16.2%** visual | Likely real stamp/label conflict; high residual |
| P1 | `INVOICE_REPORT_FORMAT_3` base — **20.38%** visual | Largest raster gap; may be real layout/content divergence |
| P2 | `INVOICE_REPORT_FORMAT_4` long_party — wrap line vs address IoU | Side-effect of Phase 1.1 wrap; targeted gap tweak only |
| P2 | `HAWB_DRAFT_REPORT_FORMAT_1` long_party — nature `text_outside_page` | Long commodity may clip right edge |

Do **not** apply global font/coordinate/engine changes. Any fix must stay format-local after approval.

## 2. Accept with documented justification

| Pattern | Justification |
|---|---|
| Org URL `https://zoyan-pilot.ex` near right edge | Approved branding chrome; not Fresa identity |
| Format 2 rotated outside_page + collision flood | pdfjs/rotated bbox heuristic sensitivity |
| HAWB Original `region_overflow_heuristic` | Soft >280pt band; long_party fixture stress |
| Draft-1 `EMIRATES` vs `AUABP` IoU | Adjacent-cell heuristic, low area |
| Post–Phase 1.1 REVIEW on Formats 14/15/17 | Leak cleared; residual = dynamic/branding vs sample |

Assertions must stay; acceptance means “not a FAIL / not a silent PASS”, not lowering thresholds.

## 3. Manual visual review required

- All **16 REVIEW_REQUIRED** rows (especially Format **3** and warehouse **21**).  
- Most invoice WARNING base rows with collisions (confirm not true overpaint).  
- Diff images under `reports/qa/universal/pilot/visual/`.

## 4. Legitimate layout limitation (retain)

- **Format 1 long_party** full `Trading Division` in narrow right letterhead — see `FORMAT1_LONG_PARTY_ASSESSMENT.md`.  
- Do not force the name into the address/title band.

## 5. What blocks expansion to another report family

| Gate | Status |
|---|---|
| Phase 1.1 FAIL clearance (AL NASER / Trading Division 4/8) | Cleared — not a block |
| Format 3 visual ~20% | **Soft block** — human review before expanding |
| Format 21 visual ~16% + party/Job IoU | **Soft block** — same |
| Format 1 letterhead limitation | Document only — does not hard-block other families |
| Arrival Notice / DO / HBL / other families | **Do not start** until soft blocks reviewed and approval given |

**Recommendation:** After visual sign-off on Formats **3** and **21**, and explicit approval, either:

- (A) Implement the P1/P2 code-fix candidates in a Phase 1.3, then expand; or  
- (B) Accept documented residuals and expand with those invoices listed as known exceptions.

## Stop

Phase 1.2 audit complete. Waiting for approval before implementing fixes or expanding scope.
