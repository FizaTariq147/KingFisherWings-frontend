# Phase 2 Implementation Report — Official HAWB Formats

**Date:** 2026-11-16  
**Scope:** Five officially verified HAWB format-specific layouts on the Phase 1 PDF foundation  
**Not in scope:** HBL/Invoice/DO redraw, new formats, schema/API changes, GitHub push  

**Honesty:** MediaBox, page count, structural distinctness, and mapping rules are verified with actual PDFs.  
**Do not claim Fresa-level pixel fidelity** — dense cell/kerning polish and sparse overlay X/Y fine-tuning remain open.

---

## 1. Architecture

```
layouts/*.layout.ts          ← independent format contracts (geometry + flags)
documents/Hawb*Document.tsx  ← five format-specific React documents
faces/Dense | Sparse         ← shared primitives only (not one catalogue shell)
generateHawbOfficialPdf.ts   ← production preview/download (same blob)
createHawbOfficialEvidencePdf.ts ← Node CI MediaBox / distinctness evidence
Phase 1 pageGeometry         ← 595×845, 595×842, 737×923
```

**Routing (`generateCatalogLayoutPdf`):**
1. Unbound browse → stamped official sample (unchanged)  
2. Entity-bound official five → **Phase 2 native** `generateHawbOfficialPdf`  
3. Fallback → JSON `hawbAwbShell` / template-v2 (historical only)

Preview and download reuse the **same** generated blob.

---

## 2. Files

### New
- `templates/hawb/official/layouts/hawbDraft.layout.ts`
- `templates/hawb/official/layouts/hawbDraft1.layout.ts`
- `templates/hawb/official/layouts/hawbDraft2.layout.ts`
- `templates/hawb/official/layouts/hawbOriginal1.layout.ts`
- `templates/hawb/official/layouts/hawbOriginal2.layout.ts`
- `templates/hawb/official/documents/HawbDraftDocument.tsx` (+ Draft1/2, Original1/2)
- `templates/hawb/official/faces/HawbDenseIataFace.tsx`
- `templates/hawb/official/faces/HawbSparseOverlayFace.tsx`
- `templates/hawb/official/mapToHawbOfficialModel.ts`
- `templates/hawb/official/generateHawbOfficialPdf.ts`
- `templates/hawb/official/createHawbOfficialEvidencePdf.ts`
- `templates/hawb/official/phase2HawbOfficial.test.ts`
- `qa/phase2-hawb-fixtures/*`
- `qa/PHASE2_HAWB_IMPLEMENTATION_REPORT.md`

### Updated
- `engines/pdf/pageGeometry.ts` — `PAGE_HAWB_NEAR_A4`, `PAGE_HAWB_DRAFT1_A4`
- `utils/generateCatalogLayoutPdf.ts` — official native routing + `preferHawbOfficial`
- `utils/catalogFormatStatus.ts` — official HAWB → Native Layout
- `components/ReportCatalog/HawbFormatAutoPdf.tsx` — native label when entity-bound

### Preserved
- Exactly **five** selectable HAWB formats  
- Historical HAWB resolution (`HAWB_DRAFT_REPORT_FORMAT_3`…N)  
- Org-profile branding only (no Fresa identity)  
- No PostgreSQL / unrelated modules / GitHub push  

---

## 3. Five format comparison results

Reference screenshots: `qa/visual-evidence/hawb/*-page1.png`  
Evidence PDFs: `qa/phase2-hawb-fixtures/*-evidence.pdf`  
Manifest: `qa/phase2-hawb-fixtures/comparison-manifest.json`

### 3.1 HAWB Draft (`HAWB_DRAFT_REPORT_FORMAT`)

| Check | Reference | Generated | Result |
| --- | --- | --- | --- |
| MediaBox | 595×845 | 595×845 | **Match** |
| Pages | 1 | 1 | **Match** |
| Orientation | portrait | portrait | **Match** |
| Title | HOUSE AIR WAYBILL | HOUSE AIR WAYBILL | **Match** |
| Notify | no | no | **Match** |
| Account labels | yes (shipper/consignee) | yes | **Match** |
| Structure | dense IATA grid + cargo + signatures | dense face | **Structural match** |
| Branding | Fresa demo in sample | org profile fields only | **Correct policy** |

**Unresolved:** Raster capture kerning/line weights vs sample; optional MAWB not in `InvoiceFormatPdfData` yet (stays blank — no fabrication).

### 3.2 HAWB Draft-1 (`…_FORMAT_1`)

| Check | Reference | Generated | Result |
| --- | --- | --- | --- |
| MediaBox | 595×842 | 595×842 | **Match** |
| Pages | **9** | **9** copy faces | **Match** |
| Notify | yes | yes | **Match** |
| JOB NO. header | yes | yes | **Match** |
| Copy set | multi-page | Original 1–3 + Copy 4–9 banners | **Match intent** |

**Screenshots:** `visual-evidence/hawb/hawb_draft_report_format_1-page1.png` (reference face).  
**Unresolved:** Exact per-page copy wording on Fresa pages 5–9 not OCR-verified; T&C not double-appended by default (9 faces already).

### 3.3 HAWB Draft-2 (`…_FORMAT_2`)

| Check | Reference | Generated | Result |
| --- | --- | --- | --- |
| MediaBox | 595×845 | 595×845 | **Match** |
| Title | Air Waybill | Air Waybill | **Match** |
| IATA agent cells | present | present | **Match** |
| Customs empty default | N.C.V style | `N.C.V` when empty | **Match** |
| Pages | 1 | 1 | **Match** |

**Unresolved:** Fine legal paragraph wrapping vs sample; charge grid prepaid values blank unless mapped.

### 3.4 HAWB Original-1 (`…_ORIGINAL_…_1`)

| Check | Reference | Generated | Result |
| --- | --- | --- | --- |
| MediaBox | **737×923** | **737×923** | **Match** (critical fix vs prior A4) |
| Pages | 1 | 1 | **Match** |
| Face | sparse overlay | sparse positioned islands | **Structural match** |
| Dense grid ink | absent | absent | **Match** |
| MAWB in ribbon | hidden | hidden | **Match** |

**Unresolved:** Absolute X/Y of sparse fields vs preprinted stationery — approximate percentages; needs pixel overlay QA before “high” fidelity claim.

### 3.5 HAWB Original-2 (`…_ORIGINAL_…_2`)

| Check | Reference | Generated | Result |
| --- | --- | --- | --- |
| MediaBox | 595×845 | 595×845 | **Match** |
| Face | sparse Air Waybill overlay | sparse + Air Waybill title marker | **Structural match** |
| Preprinted | yes | yes | **Match** |

**Unresolved:** Same sparse coordinate polish as Original-1.

---

## 4. Mapping / missing data / long text

| Rule | Evidence |
| --- | --- |
| No fabricated demo cargo when entity-bound | `mapToHawbOfficialModel` unit test — empty hawb/pieces/nature |
| Org branding only | `companyName` from profile/data; branding contract forbids Fresa identity |
| Long commodity preserved | long-text unit test — no `AS ARRANGED` injection |
| Preview ≡ download | same Blob reference helper + byte identity test |

---

## 5. Test results

```
npx vitest run \
  src/features/reports/templates/hawb/official/phase2HawbOfficial.test.ts \
  src/features/reports/constants/hawbFormatCatalog.test.ts \
  src/features/reports/utils/officialFormatGovernance.test.ts \
  src/features/reports/utils/reportCompanyBranding.test.ts \
  src/features/reports/utils/catalogFormatStatus.test.ts \
  src/features/reports/utils/reportDistinctLayout.test.ts \
  src/features/reports/engines/pdf/phase1PdfFoundation.test.ts
```

**Result: all passed** (Phase 2 suite includes per-format MediaBox inspection via `pdf-lib` against local Fresa reference PDFs).

---

## 6. PDF / screenshot evidence index

| Asset | Path |
| --- | --- |
| Reference PDFs | `qa/fresa-references/pdfs/hawb-*.pdf` |
| Reference page rasters | `qa/visual-evidence/hawb/*-page1.png` |
| Generated evidence PDFs | `qa/phase2-hawb-fixtures/{draft,draft1,draft2,original1,original2}-evidence.pdf` |
| Comparison manifest | `qa/phase2-hawb-fixtures/comparison-manifest.json` |

Production React capture (`generateHawbOfficialPdf`) runs in the browser (same stack as HBL Jasper). Node evidence PDFs share layout contracts for CI MediaBox proofs.

---

## 7. Remaining limitations

1. **Not pixel-identical** to Fresa samples — especially sparse overlay coordinates and html2canvas raster softness.  
2. MAWB / declared values / insurance / carrier codes are blank until shipment APIs expose them (no fabricated fillers).  
3. Draft-1 copy banners are IATA-standard labels; Fresa page-5..9 exact labels not OCR-confirmed.  
4. Unbound catalogue browse still shows stamped official samples (intentional high-fidelity browse).  
5. Legacy JSON `HawbAwbShell` remains as fallback / historical path — not the entity-bound official path.

---

## 8. Local-only confirmation

- Local workspace only — **no** git push / PR / deploy.  
- **No** PostgreSQL / Nest schema changes.  
- **No** invented sixth HAWB format.
