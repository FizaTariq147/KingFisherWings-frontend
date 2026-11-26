# Phase 0.5 — Count Reconciliation

**Mode:** Audit only.  
**Verified at:** 2026-11-26 (live probes + CSV/JSON reads).  
**Evidence dumps:** `reports/qa/universal/_phase05_counts.json`, `_phase05_fingerprint.json`

Every count below is a **separate category**. Do not add them into one “total formats” number.

---

## 1. What each famous number is

| Number | What it is | Source + method | Verdict |
|---:|---|---|---|
| **852** | Unique registered catalogue report IDs | `FRESA_REPORT_REGISTRY` in `src/features/reports/data/fresaReportRegistry.generated.ts`; assert in `reportRegistry.schema.test.ts` (`length === 852`); header comment “fresaReportCatalogComplete (852)” | **Verified registry size** |
| **856** | Keys in conformance status map | `Object.keys(reports/status.json).length` | **Verified** = 852 registry + **4 workflow-only keys** |
| **4** | Workflow-only status keys (not in registry) | Set difference status − registry | **Verified:** `INVOICE_FLOW_TAX_INVOICE_1`, `QUOTATION_FLOW_1`, `CREDIT_NOTE_FLOW_1`, `DEBIT_NOTE_FLOW_1` |
| **104** | Code-map rows matched by method `rpm_ref` | Count `method=rpm_ref` in `reports/references/code-map.csv` (853 data rows). Also `code-map-summary.json` → `byMethod.rpm_ref` | **Verified** Phase-0 **match method**, not a second catalogue |
| **956** | User/chat claim “956 formats” | `852 + 104 = 956` arithmetic | **Not a registered total.** Coincidence only: registry size + rpm_ref match-method count. Combining them double-counts categories (IDs vs match methods). **Unresolved as product intent**; **rejected as system-of-record count** |
| **1016** | Format-map rows (broader universe) | `reports/references/fresa-system-format-map.csv` row count | Registry + measured/orphan/alias rows — **not** “registered IDs” |
| **375** | Unique strict layout fingerprints (current pins) | Live `fingerprintPdf` over `reports/references/files/*.pdf` (401 files) → 375 distinct `strict` hashes; matches `layouts.csv` row count | **Verified current** |
| **376** | Stale fingerprint recount | `reports/references/layout-counts.json` (`strictLayouts: 376`, `pdfs: 402`) | **Stale artifact** from when 402 PDFs existed (pre–brochure removal). See `LAYOUT_FINGERPRINT_RECONCILIATION.md` |

---

## 2. Required separate counts

### 2.1 Unique registered report IDs

| Value | **852** |
| Method | Parse `FRESA_REPORT_REGISTRY` array; `new Set(codes).size` |
| Duplicates in array | **0** |
| File | `src/features/reports/data/fresaReportRegistry.generated.ts` |

### 2.2 Registry entries including duplicates or aliases

| Registry array length | **852** (no duplicate codes) |
| Alias / shared-shell behavior | Separate from registry uniqueness: enrichment `shared_shell` / JSON aliasing (e.g. HAWB Draft-3…N → draft JSON shell). Those are still **distinct registry IDs** (25 extra HAWB draft indices + …) pointing at fewer designs |
| HAWB registry IDs | **30** codes matching `/^HAWB_/` |
| Official HAWB natives | **5** (`OFFICIAL_HAWB_FORMAT_CODES` in `officialFormatGovernance.ts`) |

**Do not** report “852 + aliases” as a larger registry — aliases are the same 852 IDs with shared layouts.

### 2.3 Workflow-only keys

| Value | **4** |
| Keys | listed above |
| Role | Invoice/quotation/CN/DN **flow** pdfmake paths (`src/features/reports/flow/`), tracked in `status.json` / signoff-adjacent tooling, **not** catalogue registry members |
| 856 equation | `852 + 4 = 856` (**verified**) |

### 2.4 Reference catalogue entries

Keep these **separate**:

| Metric | Count | Source |
|---|---:|---|
| Manifest rows (pdf+xlsx pins listed) | **450** | `reports/references/manifest.csv` |
| PDF files on disk under references/files | **401** | `fs.readdirSync` (live) |
| XLSX on disk | **49** | same dir |
| Code-map rows | **853** | 852 catalogue + proposed `ADVANCE_SHIPPING_NOTE_LOCATION_WISE_1` |
| Code-map with non-empty `reference_file` | **420** | `code-map.csv` |
| Code-map `method=rpm_ref` | **104** | `code-map.csv` |
| Code-map `method=normalized_name` | **314** | `code-map.csv` |
| Code-map `method=override` | **2** (summary.json historically said 1 — minor summary drift) | `code-map.csv` |
| Code-map empty method (no file) | **433** | `code-map.csv` |
| Unmatched `code_without_reference` | **545** | `unmatched.csv` |
| Unmatched `reference_without_code` | **135** | `unmatched.csv` |
| Format-map `has_reference=yes` | **420** | format-map.csv |

### 2.5 Unique visual layouts

| Metric | Count | Source |
|---|---:|---|
| Live strict fingerprints | **375** | `fingerprintPdf().strict` over 401 PDFs |
| `layouts.csv` layout_id rows | **375** | matches live |
| Stale `layout-counts.json` strictLayouts | **376** | do not use until regenerated |

### 2.6 Layout variants (multi-member clusters)

| Metric | Count | Source |
|---|---:|---|
| Live strict clusters with ≥2 PDF members | **18** | live fingerprint Map |
| `layouts.csv` rows with ≥2 distinct member codes | **17** | prior parse (internal duplicate member string on some rows) |
| Detail-normalized layouts (live) | **373** | strips repeating detail-row rules — **fewer** unique keys than strict |

Label text is **not** in the strict fingerprint (delta only in `layouts.csv`). Dynamic field *values* are not in the geometry key; repeating horizontal “detail row” **rules** can be stripped in `detailNormalized`.

### 2.7 Reports with working generation paths

Define **working** as: format-map `generate_path` ∈ {`measured_fresa_face`, `reference_accurate`, `json_shell_fallback`} **or** runtime native (HAWB official) despite stale map.

| Bucket | Count | Notes |
|---|---:|---|
| format-map `measured_fresa_face` | **412** | Inventory view (includes non-registry measured codes) |
| format-map `reference_accurate` | **4** | Dedicated builders |
| format-map `json_shell_fallback` | **538** | Approximate but callable JSON/React capture |
| **Subtotal on format-map “has a path”** | **954** | 412+4+538 — **not** “956 registered” |
| Official HAWB five runtime | **5** | `generateHawbOfficialPdf` → measured/sparse (**map says json_shell — stale**) |

**Inferred (registry-scoped):** Most of the 852 have either measured, JSON shell, or template-v2 fallthrough via `generateCatalogLayoutPdf`. Exact per-code runtime branch was not executed for all 852 in this phase.

### 2.8 Reports without working generation paths

| Bucket | Count | Source |
|---|---:|---|
| format-map `unmapped` | **62** | `generate_path=unmapped` — “no pin and no FE layout” per `FRESA_SYSTEM_FORMAT_MAP.md` |
| HAWB Draft-3…27 on format-map | **25** | listed `unmapped` (registry IDs exist; primary catalogue hides them via `listHawbFormats` / governance) |

**Unresolved:** Whether every `unmapped` code hard-fails Generate vs returns null — requires runtime batch (deferred; QA engine not approved).

---

## 3. The 852 + 104 = 956 coincidence

**Verified arithmetic:** `code-map` has exactly **104** `rpm_ref` methods; `852 + 104 = 956`.

**Why it is not a valid catalogue total:**

1. The **104** codes are **already inside** the 852 when they are registered catalogue codes matched via rpm_ref filenames.  
2. Adding them again counts match-method hits as if they were extra IDs.  
3. No registry, MASTER_PROMPT, or schema test asserts 956.

**Label:** coincidence / possible mistaken mental model — **not** system of record.

---

## 4. Recommended language going forward

- Say **“852 registered report IDs”**.  
- Say **“856 status keys (852 + 4 flows)”**.  
- Say **“104 rpm_ref code-map matches”**.  
- Say **“375 unique pin layouts (current disk)”**.  
- Do **not** say “956 formats” unless a new, explicitly defined universe is documented and generated from one script.
