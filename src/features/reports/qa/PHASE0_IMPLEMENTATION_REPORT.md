# Phase 0 Implementation Report — Catalogue Honesty & UI

**Date:** 2026-11-16  
**Scope:** Catalogue selection honesty + enterprise UI polish only  
**Not in scope:** PDF layout redraw, page geometry, new formats, API/schema changes

---

## 1. Files modified

### New
- `src/features/reports/utils/catalogFormatStatus.ts` — status resolution + preview source labels  
- `src/features/reports/utils/catalogFormatStatus.test.ts`  
- `src/features/reports/components/ReportCatalog/FormatStatusBadge.tsx`  
- `src/features/reports/qa/PHASE0_IMPLEMENTATION_REPORT.md`  
- `scripts/patch-browse-strip-status.mjs` (one-off helper used during wiring)

### Updated
- `pages/ReportCatalogPage.tsx` — default distinct layouts, family rail, advanced tools, status on selection  
- `components/ReportCatalog/FresaCatalogSection.tsx` — Freightnest card/section chrome + status on cards  
- `components/ReportCatalog/FresaSamplePageTable.tsx` — status badges + enterprise table styling  
- `components/ReportCatalog/*FormatBrowseStrip.tsx` (all strips) — pass status into cards  
- `components/ReportCatalog/ReportGeneratePanel.tsx` — status + preview/generate path label  
- `components/ReportCatalog/HawbFormatAutoPdf.tsx` — preview source labels  
- `components/ReportCatalog/HblFormatAutoPdf.tsx` — preview source labels (Jasper = Native Layout)

---

## 2. Catalogue improvements

- Title/copy reframed as **Report format catalogue** (reference link retained; no Fresa-as-brand letterhead).  
- **Family rail** for quick navigation (All, Sea/HBL, Air/HAWB, Commercial, …).  
- **Import registry** demoted under **Advanced tools**.  
- **Layouts** default = **Distinct layouts only**; `layouts=all` shows shared-shell aliases.  
- Browse modes renamed: Catalogue table / Family strips.  
- Cards/table use Freightnest neutral/primary tokens (removed competitor sky card palette).  
- Spacing/typography tightened for a denser ERP catalogue feel.  
- Responsive: family rail wraps; table still stacks on mobile.

---

## 3. Format identity changes

### Status indicators (evidence-based)

| Status | When shown |
| --- | --- |
| **Official Sample** | Distinct verified sample PDF (e.g. official HAWB five) |
| **Native Layout** | Dedicated renderer only — **HBL Jasper pilot** (JSON existence alone ≠ native) |
| **Shared Layout** | Code aliases another JSON shell (HBL Format-3→11, Arrival Format-11→Jasper-1, …) |
| **Backend Report Pack** | Enrichment `pack_bound` |
| **Historical / Unverified** | Non-official HAWB extras; other codes without sample/native/pack evidence |

### Selection honesty
- Shared shells **hidden by default** in list + strips (`layouts !== 'all'`).  
- Deep-linked alias codes **remain visible** when selected.  
- HAWB selectable list still **exactly five** official formats.  
- Historical HAWB codes still resolve via `getHawbFormatSpec`.  
- Entity deep-link auto-pick prefers a distinct layout code when available.  
- Preview/Generate panels label path: Official Sample / Native Layout / Shared Layout / Client Layout / Backend Pack.

**No PDF visual fidelity claims** in this phase.

---

## 4. Tests executed

```
npx vitest run \
  src/features/reports/utils/catalogFormatStatus.test.ts \
  src/features/reports/constants/hawbFormatCatalog.test.ts \
  src/features/reports/utils/reportDistinctLayout.test.ts \
  src/features/reports/utils/officialFormatGovernance.test.ts \
  src/features/reports/qa/sharedShellHonesty.test.ts \
  src/features/reports/utils/reportCompanyBranding.test.ts
```

**Result: 6 files, 29 tests PASSED**

Covered: HAWB=5, historical HAWB resolve, Jasper native, shared-shell detection, distinct filter + keep selection, branding/Jasper regression suite.

---

## 5. Known limitations

1. Default distinct filter does not invent unique layouts — many formats disappear from primary browse until Phase 2+ fidelity work.  
2. **Native Layout** is intentionally rare (Jasper only for now).  
3. Catalogue table column structure still mirrors the four-column reference grouping (Sea/Air/Accounts/My Reports) — content styling is Freightnest; structure preserved for navigation familiarity.  
4. PDF preview/download behavior unchanged; only honesty labels added.  
5. Phase 1+ (page geometry, print-CSS, layout redraw) **not** started.  
6. Dual-company branding verification unchanged from prior pass.

---

## 6. Local-only confirmation

- Changes are **local workspace only**.  
- **No** `git push`, **no** GitHub PR, **no** remote deploy.  
- **No** PostgreSQL / NestJS API / schema changes.  
- **No** new report formats created.  
- **No** organization branding resolver changes.  
- HAWB official count **unchanged at 5**.  
- Existing IDs/codes/configs **preserved**.
