# Phase 1.2 — WARNING triage (22)

Source: Phase 1.1 baseline (`PILOT_FINDINGS.json`, `PILOT_LAYOUT_QA_RESULTS.json`, visual diffs where present).  
Audit only — no renderer/layout changes.

## Summary by primary rule

| QA rule | Count (rows) | Typical meaning |
|---|---:|---|
| `text_bbox_collision` (± capped) | 18 | Extractable glyph IoU ≥8pt² |
| `text_outside_page` | 14 | BBox leaves MediaBox (±1pt) |
| `region_overflow_heuristic` | 3 | Party text width >280pt near HAWB Original slots |

One row can carry multiple rules. Full machine inventory: `REMAINING_FINDINGS_INVENTORY.json`.

---

## HAWB

| Code | Fixture | Rules | Classification | Severity | Evidence |
|---|---|---|---|---|---|
| `HAWB_DRAFT_REPORT_FORMAT_1` | base | `text_bbox_collision` ×9 | **Accept w/ justification** | low | Repeated `EMIRATES` vs `AUABP` IoU ~17pt² across copy pages — adjacent cells, not proven overpaint. Visual diff 0.96%. |
| `HAWB_DRAFT_REPORT_FORMAT_1` | long_party | `text_outside_page` ×9 | **Code-fix candidate** | medium | Nature line `General merchandise STC:…` @ x≈353 w≈246 may leave right edge — long commodity stress. Confirm clip vs wrap before fixing. |
| `HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_1` | base / long_party | `region_overflow_heuristic` | **Accept w/ justification** | low | Soft >280pt party band on sparse Original slots; long_party intentionally oversized. Diff base 0.58%. |
| `HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_2` | base | `text_bbox_collision` | **Manual visual review** | low | Single collision; diff 0.60%. |
| `HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_2` | long_party | collision + region_overflow | **Accept + visual** | low | Same soft band + IoU under long names. |

---

## Invoice / proforma WARNING rows

| Code | Fixture | Rules | Classification | Severity | Evidence |
|---|---|---|---|---|---|
| `INVOICE_REPORT_FORMAT_1` | base | outside + collision | **Accept chrome overflow + visual** | low | `https://zoyan-pilot.ex` near right edge; phone/URL IoU; sample MBLC vs live MAWB/HBL stamps. Diff 2.31%. |
| `INVOICE_REPORT_FORMAT_1` | long_party | outside + collision | **Legitimate layout limitation** | medium | Narrow right letterhead; company vs `TAX INVOICE` / address IoU; `Trading Division` not fully placeable without address collision. See `FORMAT1_LONG_PARTY_ASSESSMENT.md`. |
| `INVOICE_REPORT_FORMAT_2` | base / long_party | outside ×9–11 + collision ×25 capped | **Accept w/ justification** | low | **Rotated** face: pdfjs bboxes for footers/`Printed By` mis-report as off-page; dense IoU flood. Diff base 1.75%. Not Fresa leak (cleared Phase 1.1). |
| `INVOICE_REPORT_FORMAT_4` | long_party | outside + collision | **Code-fix candidate** | medium | Phase 1.1 wrap: line IoU with address (`Suite 1204…` vs `Forwarding And Supply…`); line width still near full page. Trading Division **is** extractable (Phase 1.1). |
| `INVOICE_REPORT_FORMAT_5` | base | outside + collision | **Manual visual / accept URL** | low | Same org URL edge pattern family. Diff 2.19%. |
| `INVOICE_REPORT_FORMAT_6` | base | outside + collision | **Manual visual / accept URL** | low | Diff 1.77%. |
| `INVOICE_REPORT_FORMAT_8` | base | collision | **Manual visual** | low | Diff 1.20%. |
| `INVOICE_REPORT_FORMAT_8` | long_party | outside + collision | **Manual visual** | low | Wrap present; residual IoU/overflow heuristics. |
| `INVOICE_REPORT_FORMAT_18` | base | outside + collision | **Manual visual / accept URL** | low | Diff 1.62%. |
| `INVOICE_REPORT_FORMAT_19` | base | outside + collision | **Manual visual / accept URL** | low | Diff 1.61%. |
| `INVOICE_REPORT_FORMAT_20` | base | outside + collision | **Manual visual / accept URL** | low | Diff 2.54%. |
| `INVOICE_REPORT_FORMAT_21` | base | collision | **Code-fix candidate + blocks soft-gate** | high | `LIVE CONSIGNEE` IoU with `Job No` / `JOB-PILOT-42`; **visual diff 16.20%**. Needs human review before treating warehouse invoice as healthy. |
| `PROFORMA_*` (3 codes) | base | outside + collision | **Manual visual / accept URL** | low | Diffs 1.01–2.19%; org chrome + stamp proximity. |

---

## Disposition counts (WARNING set)

| Disposition | Approx. |
|---|---|
| Accept with documented justification | majority of URL/rotated/region-overflow |
| Manual visual review | most invoice WARNING base rows |
| Code-fix candidate | Draft-1 long_party nature; Format 4 wrap vs address; Format 21 party/Job |
| Legitimate layout limitation | Format 1 long_party |
| Soft expansion block | Format 21 (with REVIEW Format 3) |

No WARNING is an automatic PASS. Assertions were not weakened.
