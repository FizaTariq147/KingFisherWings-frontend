# Report Layout Duplication Audit

**Date:** 2026-11-16  
**Mode:** Read-only  
**Rule:** Intentionally shared components (BrandHeader, PartyBlock, org chrome) are **not** counted as duplication. Alias shells and title/color-only variants **are**.

---

## Why formats look almost identical

| Root cause | Mechanism | Primary files |
| --- | --- | --- |
| Shell aliasing | Many codes → one JSON object | `data/*FormatUiLayouts.ts` |
| Sample fallback | Extra HAWB indices reuse same CDN PDF | `constants/hawbFormatCatalog.ts` (`sampleIsFallback`) |
| template-v2 chrome | Accent/badge change only | `templates/hawb/HawbTemplateDocument.tsx` `kindChrome` |
| Shared JSON painter | One renderer for all JSON families | `JsonInvoiceLayoutRenderer.tsx`, `invoiceLayouts/index.tsx` |
| Registry >> unique designs | 852 registry vs far fewer unique faces | `fresaReportRegistry.generated.ts` |
| Capture uniformity | html2canvas A4 defaults | `captureReactDocumentPdf.ts` |

Policy already admits this: `REPORT_SHARED_SHELL_POLICY` / `FRESA_FIDELITY_STRATEGY.md` — aliases are **coverage**, not fidelity.

---

## 1. HAWB

### Official (independent) — keep as selectable five

| Code | Shell variant | Sample PDF |
| --- | --- | --- |
| `HAWB_DRAFT_REPORT_FORMAT` | `draft` | hawb-draft-report-format.pdf |
| `HAWB_DRAFT_REPORT_FORMAT_1` | `draft1` | …-1.pdf |
| `HAWB_DRAFT_REPORT_FORMAT_2` | `draft2` | …-2.pdf |
| `HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_1` | `original1` | original pre-printed 1 (737×923) |
| `HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_2` | `original2` | original pre-printed 2 |

Governance: `utils/officialFormatGovernance.ts`. Catalogue: `listHawbFormats()` → 5 only.

### Duplicative / coverage aliases

| Canonical shell | Aliased codes | Behavior |
| --- | --- | --- |
| Draft base | `HAWB_DRAFT_REPORT_FORMAT_3` … N | Same JSON + same sample (`sampleIsFallback`) |
| Original1 | Original Format-3+ | Same shell/sample fallback |

**Status:** Excluded from primary UI (correct). Still look identical if deep-linked.

**False distinctness risk:** `HawbTemplateDocument` template-v2 if re-enabled for official codes — color/badge only.

---

## 2. HBL

| Canonical | Alias rule | Scale |
| --- | --- | --- |
| `HBL_DRAFT_REPORT_FORMAT_11` | `HBL_DRAFT_REPORT_FORMAT_N` without own JSON | Large (registry draft indices) |
| `FG_HBL_HKG` / MAGIC / ORIGINAL / FORMAT_1 | FG token matching | Multiple FG_* codes |
| **`HBL_DRAFT_REPORT_FORMAT_JASPER`** | **No alias** | Independent pilot |

**113** scraped HBL JSON keys exist; many registry codes still collapse to Format-11.  
Pilot path: `templates/hbl/jasperPilot/` — must remain isolated.

UI still lists many HBL rows unless `?layouts=distinct` — user perceives “many formats, same layout.”

---

## 3. Arrival Notice

| Canonical | Aliased |
| --- | --- |
| `ARRIVAL_NOTICE_REPORT_FORMAT_1_CARGO_ARRIVAL_NOTICE_JASPER` | Bare `ARRIVAL_NOTICE_REPORT_FORMAT_N` without own JSON |

~31 JSON objects stored; many catalogue/registry codes share Jasper Format-1.  
AutoPdf often `preferTemplateV2: true` → another shared face.

---

## 4. Delivery Order

| Canonical | Aliased |
| --- | --- |
| `DELIVERY_ORDER_REPORT_FORMAT_17` | `DELIVERY_ORDER_REPORT_FORMAT_N` without own JSON |

~42 JSON objects; Format-N fallback → 17.  
Local references show many FG DO variants with different structures — **not** reflected when aliased.

---

## 5. Other / MAWB / ops

| Pattern | Fallback shell | File |
| --- | --- | --- |
| `MAWB_DRAFT_REPORT_FORMAT_N` | `MAWB_DRAFT_REPORT_FORMAT` | `otherReportsFormatUiLayouts.ts` |
| `BOOKING_CONFIRMATION_REPORT_FORMAT_N` | Format-1 | same |
| `DAILY_STATUS_REPORT_FORMAT_N` | Format-1 | same |

---

## 6. Invoice

- No Format-N resolver fallback in `invoiceFormatUiLayouts.ts` (good).  
- Still visually similar because:
  - Shared `JsonInvoiceLayoutRenderer` charge-table DNA  
  - Shared org chrome / spacing / borders  
  - template-v2 `InvoiceTemplateDocument` for some paths  

Different invoice *codes* ≠ different *document architecture*.

---

## 7. Intentionally shared (not duplication)

| Component | Why OK |
| --- | --- |
| Org branding resolvers | One SoT for company letterhead |
| `BrandHeader`, `PartyBlock`, `SignatureBlock` | Shared atoms; composition should still differ |
| `stampOrgChromeOnSamplePdf` | Overlay utility |
| Backend pack generate | Product PDF path |

---

## 8. Missing structures vs reference (summary)

| Area | Gap |
| --- | --- |
| Tables | Column sets often generic; DO/Arrival/HBL cargo columns not per-reference |
| Typography | html2canvas / CSS stacks ≠ Fresa PDF fonts/sizes |
| Borders | Uniform 1px React borders vs dense IATA/BL grids |
| Dimensions | Landscape & non-A4 MediaBoxes not enforced per code |
| Pagination | Weak overflow; long HAWB draft-1 ref is 9 pages |
| Fields | Alias shells omit format-specific fields present on Fresa PDFs |

---

## 9. Affected format codes (priority buckets)

### P0 — Official faces that must stay distinct
- All 5 HAWB official codes  
- `HBL_DRAFT_REPORT_FORMAT_JASPER`  
- One verified DO + one Arrival + one Invoice chosen for pilot fidelity (see roadmap)

### P1 — High alias volume (misleading catalogue)
- `HBL_DRAFT_REPORT_FORMAT_*` without JSON  
- `ARRIVAL_NOTICE_REPORT_FORMAT_*` bare aliases  
- `DELIVERY_ORDER_REPORT_FORMAT_*` → 17  

### P2 — Extra HAWB / leftover / FG aliases
- Preserve resolution; never present as unique official designs

---

## 10. Proposed corrections (design-level; not implemented here)

1. Treat `implementationStatus: shared_shell` as **non-fidelity** in UI (default distinct filter on).  
2. For fidelity workstreams: one code → one reference PDF → one layout contract (no new aliases).  
3. Prefer native PDF / print-CSS / backend packs over html2canvas for professional output.  
4. Do not “fix” sameness by inventing Format-N JSON clones.  
5. Keep HAWB at five selectable formats.

---

## Evidence cross-links

- `qa/REPORT_FORMAT_DUPLICATE_AUDIT.json`  
- `qa/HAWB_OFFICIAL_FORMAT_RECONCILIATION.json`  
- `qa/sharedShellHonesty.test.ts`  
- `utils/reportDistinctLayout.test.ts`  
- `qa/REPORT_DYNAMIC_RENDERER_FIX.md`
