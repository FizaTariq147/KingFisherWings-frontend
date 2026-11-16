# Report Redesign Roadmap

**Date:** 2026-11-16  
**Mode:** Planning only (audit phase — no production code changes in this task)  
**Goal:** Professional, format-specific visual fidelity vs Fresa references, without inventing formats or breaking HAWB=5 / historical codes.

Companion audits:

1. `REPORT_LAYOUT_AUDIT.md`  
2. `REPORT_LAYOUT_DUPLICATION_AUDIT.md`  
3. `REPORT_REFERENCE_COMPARISON.md`  
4. `REPORT_UI_AUDIT.md`

---

## Problem statement (evidence-based)

Formats look similar because **many codes share shells**, **template-v2 mostly changes chrome**, and **html2canvas cannot match native Fresa PDFs**. Catalogue UI lists more formats than unique designs (except HAWB, already gated to 5). Browse samples look good because they **are** Fresa PDFs stamped with org chrome — that is not a regenerated Freightnest layout.

---

## Non-negotiables

| Rule | Action |
| --- | --- |
| HAWB selectable = 5 | Keep `listHawbFormats` / governance |
| Historical codes | Keep `get*FormatSpec` resolution |
| No new official formats | No invented Format-N |
| No Fresa branding as company | Org profile only |
| No DB/API schema changes (this program) | Frontend layout/UI + existing generate contracts |
| No delete of configs/IDs | Aliases may remain non-selectable |

---

## Strategy: fidelity tiers

Assign every catalogue row an explicit tier (surface in UI):

| Tier | Meaning | User promise |
| --- | --- | --- |
| **T0 Reference sample** | Stamped official PDF browse | “Fresa reference look; demo data” |
| **T1 Pack** | `POST /reports/generate` | “Production fidelity when pack bound” |
| **T2 Format layout** | Dedicated shell / pilot matching reference structure | “Freightnest layout aligned to reference” |
| **T3 Shared shell** | Alias / color-only v2 | “Coverage only — not unique design” |

Never market T3 as Fresa-identical.

---

## Phase 0 — Catalogue honesty & UI ✅ implemented (2026-11-16)

**Why first:** Stops users picking 30 identical faces.  
**Report:** `PHASE0_IMPLEMENTATION_REPORT.md`

| Work item | Outcome |
| --- | --- |
| Default distinct layouts (`layouts=all` to include aliases) | Done |
| Status badges (Official Sample / Native / Shared / Pack / Historical) | Done via `catalogFormatStatus.ts` |
| Preview/generate path labels | Done (AutoPdf + Generate panel) |
| Demote Import; family rail; Freightnest chrome | Done |
| HAWB=5 + historical resolve + Jasper independence | Preserved; covered by tests |

**Next:** Phase 1 only when authorized (page geometry / print path — not layout redraw of all formats).

---

## Phase 1 — Capture & page geometry foundation

**Why:** Without page size/orientation/print pipeline, layout work cannot match references.

| Work item | Files | Outcome |
| --- | --- | --- |
| Per-layout page box (width/height/orientation) in JSON schema | `types/invoiceFormatUiLayout.types.ts`, generators | 737×923 / landscape supported |
| Prefer print-CSS / Puppeteer pack over html2canvas for T2 | `printCssPilot.ts`, `captureReactDocumentPdf.ts`, Generate panel | Professional text/borders |
| Multi-page overflow rules | print CSS + layout contracts | HAWB draft-1 style copy sets |
| Logo load wait + CORS fallback already partial | branding resolvers / stamp | Reliable org logo |

**Depends on:** Phase 0 labeling so users know which path they use.  
**Risk:** html2canvas paths remain for offline fallback — mark T3.

---

## Phase 2 — Flagship format fidelity (pilot set)

Do **not** redesign all 852. Prove pattern on a small official set.

| Priority | Format | Reference PDF | Implementation target |
| ---: | --- | --- | --- |
| 1 | `HBL_DRAFT_REPORT_FORMAT_JASPER` | `hbl-draft-report-fomat-jasper.pdf` | Polish existing pilot (already T2) |
| 2 | `HAWB_DRAFT_REPORT_FORMAT` | `hawb-draft-report-format.pdf` | Harden `HawbAwbShell` `draft` + page box 595×845 |
| 3 | `HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_1` | original1 PDF | Non-A4 MediaBox; sparse overlay model |
| 4 | One Arrival Jasper | `arrival-notice-report-format-1-…jasper.pdf` | Dedicated layout; stop treating as generic v2 |
| 5 | `DELIVERY_ORDER_REPORT_FORMAT_17` | `delivery_order_format_17_…pdf` | Dedicated DO face as DO baseline |
| 6 | One Invoice (e.g. Format-10 or 17 Jasper) | matching invoice PDF | Break charge-table monoculture |

**Acceptance each:** side-by-side page PNG vs local reference; org branding; no Fresa letterhead; checklist from `REPORT_REFERENCE_COMPARISON.md`.

**Depends on:** Phase 1 page box + print path.  
**Risk:** Scope creep into Format-N clones — forbidden.

---

## Phase 3 — Expand HAWB official set quality

All five official HAWBs to T2 regenerated quality (not sample-only):

| Code | Focus |
| --- | --- |
| Draft / Draft-1 / Draft-2 | Title, notify, customs, multi-page for Draft-1 |
| Original-1 / Original-2 | Preprinted geometry; do not fake with A4 template-v2 |

Keep extras non-selectable.  
Files: `HawbAwbShell.tsx`, `hawbFormatUiLayouts.*`, `HawbFormatAutoPdf.tsx`, `generateCatalogLayoutPdf.ts`.

---

## Phase 4 — Alias family remediation (HBL / Arrival / DO)

| Work item | Outcome |
| --- | --- |
| Official HBL list in UI = codes with **own** JSON or verified sample only | Stop Format-11 dump in primary list |
| Arrival: only codes with distinct layouts/samples selectable | Jasper-1 not default for bare Format-N |
| DO: primary list = verified samples + distinct JSON | Format-17 is fallback, not fake uniqueness |
| Keep alias resolution for history | Deep links OK |

**Depends on:** Phase 0–2 patterns.  
**Do not:** Mass-generate new JSON aliases for coverage (`REPORT_LAYOUT_FREEZE`).

---

## Phase 5 — Ops / landscape / manifest

| Work item | Outcome |
| --- | --- |
| Landscape page contracts for manifest & daily status | Match 791×611 / 792×612 refs |
| Manifest not confused with HAWB | Family classification already; enforce in UI |
| Job card / stuffing / pre-alert as separate T2 when prioritized | One-at-a-time vs references |

---

## Phase 6 — Verification & regression harness

| Work item | Outcome |
| --- | --- |
| Extend visual evidence under `qa/visual-evidence/` | Per-format page1 PNG + manifest |
| Vitest: distinct shells, HAWB=5, Jasper isolation | Keep existing tests green |
| Optional Playwright: preview source badges | UI honesty |
| Dual-company branding when second E2E tenant available | Prior gap |

---

## Dependency graph

```
Phase 0 UI honesty
    ↓
Phase 1 page box + print/pack preference
    ↓
Phase 2 flagship T2 layouts ──→ Phase 3 HAWB five T2
    ↓
Phase 4 alias catalogue cleanup
    ↓
Phase 5 landscape / ops
    ↓
Phase 6 continuous visual QA
```

Backend pack binding remains parallel track: where packs exist, prefer T1 for production jobs without blocking frontend T2 work.

---

## Effort / risk summary

| Phase | Risk | Notes |
| --- | --- | --- |
| 0 | Low | UX only; highest user trust gain |
| 1 | Medium | Capture tech change; keep fallbacks |
| 2–3 | Medium–High | Real design work; small format set |
| 4 | Medium | Catalogue expectations; preserve IDs |
| 5 | Medium | Orientation bugs |
| 6 | Low | Process |

---

## Explicit non-goals (this program)

- Rewriting entire Reports module  
- Matching all 852 registry codes pixel-perfect  
- Creating formats not on Fresa official list  
- Changing HAWB official count  
- Using Fresa as Freightnest branding  
- Claiming JSON existence = visual completion  

---

## Success metrics

1. Catalogue primary lists show **unique designs** by default (HAWB already 5).  
2. Each flagship T2 format has visual evidence vs local Fresa PDF.  
3. Shared-shell formats cannot be mistaken for unique official designs.  
4. Generated PDFs use registered org name/logo.  
5. HBL Jasper pilot remains functional and isolated.  
6. Professional output path (pack or print-CSS) used for T1/T2, not html2canvas-only claims.

---

## Immediate next implementation step (when authorized)

Start **Phase 0** only: catalogue honesty + preview source labeling + default distinct layouts.  
Do not begin mass layout redraw until Phase 0 is signed off — otherwise users still select aliases and report “everything looks the same.”
