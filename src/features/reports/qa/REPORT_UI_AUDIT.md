# Report Catalogue UI Audit

**Date:** 2026-11-16  
**Mode:** Read-only  
**Primary surface:** `src/features/reports/pages/ReportCatalogPage.tsx`  
**Supporting:** `components/ReportCatalog/*`, `FresaCatalogSection.tsx`, `FresaSamplePageTable.tsx`, `ReportGeneratePanel.tsx`, browse strips

---

## Current UX model

Two browse modes (URL-driven):

1. **`view=fresa` (default)** — Fresa-style sample page table / columns  
2. **`view=strips`** — Family card strips (`HawbFormatBrowseStrip`, `HblFormatBrowseStrip`, …)

Plus: search (`q`), family, context, entity deep-links (`job_id`, `shipment_id`, …), `layouts=distinct`, Import registry, Generate panel, AutoPdf preview modal.

---

## Findings by area

### 1. Navigation

| Issue | Evidence / impact |
| --- | --- |
| Reports hub vs catalogue vs MIS naming overlap | Users confuse `/reports`, `/reports/catalog`, and management MIS routes |
| Deep URL state is powerful but opaque | Many params; no clear “you are here” breadcrumb for family → format → generate |
| Import registry on primary chrome | Power-user action sits next to search; clutters first viewport |

**Improve:** Clear hierarchy — Families → Official formats → Preview → Generate. Demote import to advanced.

### 2. Family selection

| Issue | Impact |
| --- | --- |
| Long family `<select>` + Fresa column focus | Hard to scan; little visual identity per family |
| Strips vs table modes not explained | Users don’t know which mode shows samples vs cards |
| Leftover / commercial_extra / sea_extra | Sounds internal; lowers trust |

**Improve:** Segmented control or icon rail for primary families (HAWB, HBL, Invoice, Arrival, DO, Ops). Park “extras” under Advanced.

### 3. Search and filtering

| Issue | Impact |
| --- | --- |
| Search works across codes/names | Good |
| Without `layouts=distinct`, aliased formats pollute results | Users pick Format-15 expecting unique layout |
| HAWB correctly filtered to 5 | Good — keep |
| HBL/Arrival/DO still list aliases by default | Primary cause of “everything looks the same” perception |

**Improve:** Default `layouts=distinct` for strips; badge + disable “Generate unique” on shared shells; filter chip “Official / Verified sample / Shared shell.”

### 4. Format selection

| Issue | Impact |
| --- | --- |
| Card tones cycle Fresa sky palette (`FRESA_CARD_TONES`) | Catalogue UI inherits competitor visual language; Freightnest brand weak |
| Cards show name + optional shared hint | Hint easy to miss |
| Sort by format # | Useful; density high on HBL |

**Improve:** Freightnest visual system (org primary color optional); strong shared-shell badge; show sample fidelity + implementation status from enrichment.

### 5. Format previews

| Issue | Impact |
| --- | --- |
| Auto-open PDF modal on select | Heavy; blank iframe in some headless/slow cases |
| Unclear whether preview is Fresa sample vs live layout | Fidelity confusion |
| Bound vs unbound label exists but subtle | Users think sample = their data |

**Improve:** Split “Reference sample” vs “Freightnest layout preview”; skeleton loaders; show page size/orientation chip; never imply sample parties are tenant data.

### 6. Generate actions

| Issue | Impact |
| --- | --- |
| `ReportGeneratePanel` packs/bind/activate | Powerful; dense copy about Puppeteer packs |
| Fallback to client layout when pack missing | Silent fidelity drop |
| Entity context banner | Present but easy to miss |

**Improve:** Explicit fidelity tier on Generate button: Pack (best) / Client layout (approx) / Sample (reference only). Block “looks exact” claims for shared shells.

### 7. Responsive behavior

| Issue | Impact |
| --- | --- |
| Filters stack on small screens | OK baseline |
| Strips + modal + side generate | Crowded on laptop; preview modal dominates |
| Table horizontal scroll | Risk on mobile |

**Improve:** Single-column flow on `<lg`: list → detail drawer; sticky generate CTA.

### 8. Visual hierarchy & polish

| Issue | Impact |
| --- | --- |
| First viewport: title + import + search + filters + table | Feels like admin console, not document studio |
| Competing secondary text (import messages, backend unavailable, fallback notes) | Noise |
| Sky-blue Fresa section bars | Competitor-looking chrome inside Freightnest |
| Inconsistent card/table density across families | Rough |

**Improve (align with product design rules):** One job per section; brand Freightnest; reduce card chrome where not interactive; purposeful typography; avoid purple/glow AI defaults; keep atmosphere subtle without copying Fresa marketing UI.

### 9. Consistency with governance

| Family | Catalogue honesty today |
| --- | --- |
| HAWB | **Good** — 5 official only |
| HBL | Weak — long list includes shared shells |
| Arrival / DO | Weak — aliases selectable |
| Invoice | Better count honesty; visual DNA still shared |

---

## Priority UI fixes (no code in this audit)

| Priority | Change | Depends on |
| --- | --- | --- |
| P0 | Default distinct-layout filter; surface `shared_shell` loudly | `filterCatalogStripRows`, enrichment |
| P0 | Label preview source: Sample vs Layout vs Pack | AutoPdf / Generate |
| P1 | Family rail + simplify first viewport | `ReportCatalogPage` |
| P1 | Replace Fresa-sky catalogue cosmetics with Freightnest tokens | `FresaCatalogSection`, colors |
| P2 | Detail drawer instead of immediate modal | PdfViewer / AutoPdf |
| P2 | Advanced panel for import/registry | Page chrome |

---

## Files to touch later (implementation phase)

- `pages/ReportCatalogPage.tsx`  
- `components/ReportCatalog/FresaCatalogSection.tsx`  
- `components/ReportCatalog/FresaSamplePageTable.tsx`  
- `components/ReportCatalog/*FormatBrowseStrip.tsx`  
- `components/ReportCatalog/ReportGeneratePanel.tsx`  
- `utils/filterCatalogStripRows.ts`  
- `utils/catalogSharedLayoutHint.ts`  
- `registry/enrichReportMeta.ts`  

**Do not** change HAWB official count or remove deep-link resolution when polishing UI.
