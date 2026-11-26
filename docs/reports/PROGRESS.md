# Report format progress

Phase 0 is the inventory. No report code is accepted.

## Repo map

This workspace is the React frontend. There is no NestJS app and no PostgreSQL schema here.

| Piece | Path |
|---|---|
| Catalogue registry (852 codes) | `src/features/reports/data/fresaReportRegistry.generated.ts` |
| Registry load and schema | `src/features/reports/registry/reportRegistryV2.ts`, `src/features/reports/registry/reportRegistry.schema.ts`, `src/features/reports/registry/enrichReportMeta.ts` |
| Sample URL catalogues | `src/features/reports/data/fresaExtractedSampleEntries.generated.ts`, `src/features/reports/data/fresaOfficialSampleCatalogue.ts`, `src/features/reports/constants/hblOfficialCatalog.generated.ts` |
| Catalogue page | `src/features/reports/pages/ReportCatalogPage.tsx` |
| Catalogue lists | `src/features/reports/components/ReportCatalog/FresaSamplePageTable.tsx`, `src/features/reports/components/ReportCatalog/ReportCatalogBrowseList.tsx` |
| Generate panel | `src/features/reports/components/ReportCatalog/ReportGeneratePanel.tsx` |
| Existing format badge | `src/features/reports/utils/catalogFormatStatus.ts`, `src/features/reports/components/ReportCatalog/FormatStatusBadge.tsx` |
| Conformance badge | `src/features/reports/utils/reportConformanceStatus.ts` |
| Catalogue generate | `src/features/reports/utils/generateCatalogLayoutPdf.ts` |
| Record hydration | `src/features/reports/utils/resolveCatalogContextPdfData.ts` |
| Organization profile | `src/features/reports/utils/resolveReportOrgChrome.ts`, `src/features/organization/services/organization.service.ts` |
| Classic invoice PDF (left unchanged) | `src/features/invoices/utils/generateInvoicePdf.ts` |
| Classic quotation PDF (left unchanged) | `src/features/quotations/utils/generateQuotationPdf.ts` |
| Six current templates | `src/features/reports/templates/referenceAccurate/`, `src/features/reports/templates/hawb/official/`, `src/features/reports/engines/pdf/playwrightHtml/` |
| Reports buttons | `src/features/jobs/pages/JobDetailPage.tsx` (Reports), `src/features/shipments/pages/ShipmentDetailPage.tsx` (`openShipmentReportsCatalog`), `src/features/quotations/pages/QuotationDetailPage.tsx` (`buildCatalogHref`), `src/features/invoices/pages/InvoiceDetailPage.tsx` (Generate PDF, Formats, Reports catalog) |
| Older local pins | `src/features/reports/qa/fresa-references/pdfs`, `src/features/reports/qa/fresa-references/xlsx` |
| Phase 0 tool | `tools/reports/build-manifest.mjs` (`npm run report:manifest`) |
| Code map | `tools/reports/build-code-map.mjs` (`npm run report:code-map`) |
| Status | `tools/reports/build-status.mjs` (`npm run report:status`), `reports/signoff.csv`, `reports/status.json` |
| Layout counts | `tools/reports/fingerprint-counts.mjs` (`npm run report:layout-counts`) |
| Phase 0 outputs | `reports/references/manifest.csv`, `reports/references/layouts.csv`, `reports/references/unmatched.csv`, `reports/references/code-map.csv`, `reports/references/files/`, `reports/references/text/`, `reports/references/png/` |

## Decisions

- **Phase 1 Controlled PDF QA Pilot (2026-11-26):** Built pilot under `reports/qa/universal/pilot/` + `src/features/reports/qa/pilot/*`. Refreshed metadata: `LAYOUT_COUNTS_REFRESHED.json` (401/375), `HAWB_FORMAT_MAP_VERIFIED.json` (runtime paths; production format-map untouched). Generated **65/65** PDFs via `generateHawbOfficialPdf` / `generateOfficialMeasuredPdf` (5 HAWB + 24 measured invoices × fixtures). Layout QA + masked visual diffs. Verdicts: REVIEW 13, WARNING 18, FAIL 7 (incl. Fresa identity leaks on some invoices). No template/renderer changes. Stopped for approval before expanding families.
- **Phase 0.5 Evidence Reconciliation (2026-11-26):** READ-ONLY. `COUNT_RECONCILIATION.md`: 852 registry; 856=852+4 flows; 104=rpm_ref match method; 956=invalid 852+104 sum. `LAYOUT_FINGERPRINT_RECONCILIATION.md`: live **401 PDF / 375 strict** matches layouts.csv; layout-counts.json 402/376 stale (brochure removed). `HAWB_IMPLEMENTATION_TRACE.md`: official five measured/sparse; map stale; no HAWB_LOCK in TS. `RENDERER_USAGE_MATRIX.md` + `BARCODE_QR_USAGE_AUDIT.md`: pdf-lib/html2canvas/pdfmake/playwright; qrcode unused; 5 branding barcode slots. QA engine still not approved.
- **Universal Report System Audit (2026-11-26):** READ-ONLY audit deliverables under `reports/qa/universal/`. Verified registry size **852** (not user-claimed 956). Format-map 1016; refs 420; measured 421; JSON-shell 538; accepted 0. No template/renderer changes.
- **HAWB why-rough + Draft/Draft-2 chrome (2026-11-26):** User PDF `f94274e9…` (Draft 595×845). Root causes: (1) html2canvas rasters historically; (2) `drawSafeText` min 6pt; (3) pin demo AWB `176|MAA|…` / Draft-2 `MAA/DXB/…` not matched by skip regex so they stayed on live jobs; (4) Draft/Draft-2 fieldSlots miss agent/Issued-by/K/S/charge zeros/HAWB ref. Fixed leftover regex; `stampHawbDraftDenseChrome` for Draft + Draft-2 (agent@13,617.5, K/S, zeros, Draft top strip, Draft-2 title company + HAWB refs); party word-wrap without email. Vitest dense chrome + Draft-1 overlap/measured green. Not `accepted`.
- **HAWB Draft-1 pin font/layout pass (2026-11-26):** Side-by-side vs Fresa Draft-1 + user PDF `46bd472a…`. Root size defect: `drawSafeText` clamped min 6pt so pin 4–5pt legal/PPD/insurance drew as 6. Floor now 4pt — verified REF/GEN both 4/5/10. Also: kg `K`, CTN-under-pieces handling slot, AS ARRANGED weight/prepaid, multiline carrier sign, footer HAWB @11pt. Not MASTER_PROMPT `accepted`.
- **HAWB Draft-1 overlap fix (2026-11-26):** Live job PDF stacked city/phone/email on one baseline (stampHawbMultiLine reused last slot). Cap party lines to slot count, clip width ≤250pt, stop putting JOB NO in Accounting, Draft-1 badge truncated clear of title. Not pixel-accepted.
- **HAWB Draft-1 vector Generate (2026-11-26):** User side-by-side vs Downloads Fresa pin — system PDF was **html2canvas raster** (~217MB, 0 extractable text, blurry overlap). Draft/Draft-1/Draft-2 Generate now uses **measured vector** (`generateOfficialMeasuredPdf` + `mapHawbToOfficialFaceData`): same MediaBox/lines/labels as pin, Arimo stamps, Draft-1 black HAWB badge + title company, skip bad `cargo` kg-column stamp. Originals stay sparse. Airway T&C still appended. Not MASTER_PROMPT `accepted` (pixel harness + sign-off open).
- **HAWB Draft + Draft-1 polish (2026-11-26):** User said Draft / Draft-1 still rough vs Fresa pins. Rewrote `HawbDraftDenseFace` + `HawbDraft1DenseFace` only (Draft-2 / Original faces untouched): IATA routing+currency+declared band, destination+flight+insurance row, cell padding so ink clears borders, Draft top `176|MAA|…` strip, Draft-1 Notify/Dimensions/AS ARRANGED/Restricted Articles cert, charge `0.00`/`AS ARRANGED`. Same Airway T&C PDF now appends after **all five** HAWB faces (Draft-1 + Originals included). Not pixel-accepted.
- **HAWB Original-1/2 sparse vector (2026-11-26):** User compared system output to Fresa Original Pre-Printed Format-1 — we were wrongly rendering **Draft dense** on the Original page (0% match). Root cause: Original docs used `HawbDraftDenseFace`. Fix: `generateHawbOfficialPdf` routes Original-1/2 to `generateHawbSparsePdf` (pdf-lib data islands only, MediaBox 737×923 / 595×845). Slots re-pinned from Fresa pdfjs baselines (mawb/hawb top, PP PP, N.V.D., AS PER INV, cargo row, signature). Text-coord dump matches pin within ~0.5pt; org/neutral parties replace Fresa DEMO. No Draft grid, no html2canvas. Not MASTER_PROMPT `accepted` yet.
- **HAWB overlap hotfix (2026-11-26):** User job PDF showed measured stamp collisions (AEAUH/AUABP over Destination/Currency labels, empty agent). Generate for the five official HAWB codes again uses **dense React faces** (`generateHawbOfficialPdf`); measured kit skipped for HAWB until slots are re-pinned. Job hydrate: bare port codes → departure/To/destination; notify←consignee; agent←org; accounting←JOB NO.; chargeable←gross when missing.
- **HAWB measured migration (2026-11-26):** Unlocked HAWB from measured kit. `scripts/promote-hawb-to-measured.mjs` promotes all 5 specs into `measuredFaces.generated.ts` (demo spans → fieldSlots; Fresa identity stripped). Catalogue Generate prefers `generateOfficialMeasuredPdf` (vector lines/labels from pin) with catalogue fixture + org chrome; html2canvas faces remain fallback. Draft/Draft-1/Draft-2 carry full grid lines; Originals are sparse data stamps (matches Fresa pre-printed samples). Disabled invoice blue letterhead + Printed-By footer on HAWB. `hawbMeasuredGenerate.test.ts` 5/5. Not MASTER_PROMPT `accepted` (pixel harness + sign-off still open).
- **HAWB root cause (2026-11-26):** Same rough/overlap look keeps returning because architecture is wrong for Fresa fidelity — not because one more CSS pass is missing. Catalogue Generate for the five codes runs `generateHawbOfficialPdf` (hand React faces → **html2canvas PNG → jsPDF**). HAWB is **locked out** of the measured vector pipeline (`HAWB_LOCK` in `officialFaceRegistry.ts`) that fixed invoices/HBL. Vitest mostly checks `createHawbOfficialEvidencePdf` (sketch) + model mapping, **not** the html2canvas blob users see — so green tests do not mean visual match. Original-1/2 flip between sparse overlay and Draft dense faces on wrong page boxes. Fix that ends the cycle: extract pinned `hawb-*.pdf` into specs + vector/pdf-lib drawer (or Chromium print in prod) + CI against production PDFs. CSS clip/band tweaks alone will keep recurring.
- **HAWB pin fidelity pass 2 (2026-11-26):** Side-by-side vs Fresa text extracts. Draft: WT/VAL+Other PP grid, AS PER INV customs, Handling TOTAL (not nature), nature STC+CTN, By first Carrier=flight code. Draft-1: Dimensions cell (not Accounting), AS ARRANGED weight/total prepaid, PP row, AS AGENT FOR CARRIER. Draft-2: nature multiline without TOTAL dup, accounting FREIGHT PREPAID only, By=flight. Orig-1 customs AS PER INV; sparse agentRight gets PHONE. Fixture no longer forces N.C.V on all five. Vitest 41/41 pass (phase2 + 2.3 + 2.4 + 2.5). Not `accepted`.
- **HAWB five-format side-by-side pass (2026-11-26):** Compared all 5 Fresa pins (Draft 595×845, Draft-1 595×842×9, Draft-2 595×845, Orig-1 737×923 sparse, Orig-2 595×845 sparse). Digital Orig-1/2 use dense faces (no underlay/overlay collision). Rewrote Draft-1 with clipped bands, Notify, AS ARRANGED, black HAWB badges, full charges. Draft/Draft-2 keep clip + catalog fixture. Defects addressed: overlap, empty catalogue, rough Original UI. Not MASTER_PROMPT `accepted` (pixel harness + sign-off still open).
- **HAWB Original overlap root-cause (2026-11-26):** User screenshot vs Fresa Draft-2: generated Original used sparse overlay **on top of** underlay labels → double HAWB nos, agent/branding/flight stacked. Digital Original-1/2 now render **dense** faces (Draft / Draft-2) matching filled Fresa forms; sparse overlay kept only for physical `showUnderlay:false`. Underlay is boxes-only (no labels). Sparse skips branding when logo present + duplicate flight slot. Tests 16/16. Not pixel-accepted yet.
- **HAWB anti-overlap + typography pass (2026-11-26):** Re-downloaded all 5 Fresa HAWB URLs. Fonts on pins = ArialUnicodeMS + Helvetica (we keep Arial/Helvetica). Fixed text spill: `hawbClipBand` + `overflow:hidden` on cells, `hawbCapLines` (max 4 party / 2 agent), smaller legal (5pt), tighter margins (3mm), soft gray underlay labels so Original overlay ink doesn’t collide, smaller logos. Capture CSS clips `td/th`. Tests 16/16. Still not MASTER_PROMPT `accepted` (needs pixel harness + sign-off).
- **HAWB catalogue no longer empty (2026-11-26):** Opened/inspected all five pinned Fresa HAWB PDFs. Product still never returns Fresa CDN samples. When catalogue opens without a job (`!entityBound`), `mergeHawbCatalogPreviewFixture` fills pin-density cargo (HAWB/MAWB, parties, routing, pieces, STC, N.V.D./N.C.V/NIL) with **neutral** names — never Fresa DEMO / BABU / AL NASER. Org logo/company still win for Issued-by. Entity-bound jobs stay live-only (no invented parties). Wired into `generateHawbOfficialPdf` + Draft-2 Playwright path.
- **HAWB Draft-2 vs Fresa screenshot fix (2026-11-25):** User compared system Draft-2 (empty white HAWB box, sparse routing) to Fresa pin (black inverted HAWB NO badges, denser To/Carrier/Currency/CHGS/Declared columns, Other Charges above signature, EXTRA COPY). Rewrote `HawbDraft2DenseFace`; shared `hawbNoBadge`; Draft-1 top badge; Draft thicker frame + footer AWB; capture no longer forces black text over inverted badges. Tests 15/15. Still not pixel-accepted.
- **HAWB polish pass (2026-11-25):** Removed slate/gray cell fills and forced-uppercase labels (looked unfinished vs Fresa black-on-white). Tightened padding/borders to 1px black; account chips as nested top-right boxes; dropped orange DRAFT ribbon wash; capture CSS forces Arial + pure white cells; html2canvas scale 3. Tests 15/15. Still not pixel-accepted.
- **HAWB five-format Fresa fidelity pass (2026-11-25):** Pinned refs under `reports/references/files/hawb-*.pdf` (+ local `tools/tmp-hawb-fresa` PNGs) drive layout. Shared `hawbOfficialStyles` now use Arial/Helvetica metric stack with Fresa-like sizes (labels ~6pt, body ~8pt, title ~12pt, legal ~5.5pt). **Draft:** nested shipper/consignee account chips, agent+IATA/Account + Accounting row, AIR legal block, top AWB strip only (no HAWB/MAWB in title cell), currency/CHGS/declared row, TOTAL PACKAGES in nature column; margins 4mm on near-A4. **Draft-1:** unlabeled account chips, tighter title/logo. **Draft-2:** hawbTitle + EXTRA COPY footer + TOTAL PACKAGES. **Originals:** overlay font Arial. Page geometries unchanged (595×845 / 595×842 / 737×923). `phase2HawbOfficial.test.ts` 15/15 pass. **Not accepted** — full pixel harness + sign-off still required (MASTER_PROMPT).
- **Invoice Formats → `/reports/dashboard` (2026-11-25):** Invoice Detail **Formats** and **Reports catalog** open the sample-style dashboard with `invoice_id` (+ `job_id` / `party_id`). Dashboard filters to invoice-related formats, resolves missing job from the invoice, and passes context into `/reports/formats/:code` so generate hydrates invoice + linked job data (`resolveCatalogContextPdfData`).
- **Fonts + Fresa footer strip (2026-11-25):** Embed **Arimo Bold** (with Arimo Regular) so measured bold flags / titles match Fresa weight. Portrait footer always stamps `Printed By :` / `Printed Date :` / `Page n of m` at measured slots (Fresa date `DD-MON-YY hh:mmAM/PM`); wipes sample User:/Powered By; never copies Fresa identity. Coloured Format-1 footer chips are not white-wiped.
- **Overlap / border / logo size fix (2026-11-25):** Skip sample letterhead/agent glyphs under branding slots; wipe contiguous address bands before org contact lines; invoice Bill To/Client multi-line samples cleared before live stamps. Logo uses **78% inset + no upscale** so it stays inside the box without crowding borders; letterhead band + outer frame re-stroked after wipes. HAWB logos ~28×100.
- **Logo / header / footer chrome pass (2026-11-25):** `ensureReportBrandingChrome` fills missing logo+right company+footer for non-HBL faces; alias map covers booking/ASN/delivery-order code variants; ocean HBL still never invents shipper-column logos. Still not pixel-accepted for all 852 codes.
- **Fresa-aligned sprints A–D (2026-11-25):** Catalogue table keeps 4 Fresa columns with subsection bands (`fresaCatalogBand` + `FresaSamplePageTable`). Hydrate never fills BL/AWB shipper from org; entity-bound HBL skips sample party glyphs and stamps live Shipper/Consignee/Notify (incl. MAGIC without a Shipper label); portrait invoices stamp Bill To / Shipper / Consignee / Invoice No at sample-value anchors. Logo stays inside measured slots (`drawOrgLogoInSlot` aspect clamp; `logoSlotFit.test.ts`). Sprint D queue generates Invoice 1–4 / MAGIC / MAWB measured PDFs (`sprintDPixelQueue.test.ts`) — **not accepted** (needs harness + sign-off). Charge/GST grids still sample where no fieldSlots exist; rotated invoice fieldSlots remain disabled.
- **No in-app Fresa sample PDFs (2026-11-25):** Catalogue browse, AutoPdf, and Generate always use Freightnest native / measured / template-v2 / JSON / pack with organization branding. `resolveReportPdfWorkflow` and `allowsFresaSamplePdf` never enable Fresa CDN samples inside the product. ASN Location Wise and peers open Freightnest documents only; Fresa artwork remains for external layout comparison on fresatechnologies.com.
- **Format-4 Standard Tax Invoice letterhead (2026-11-25):** Branding wipes were erasing the outer top border and parking the logo flush against it (looked “on top of the box”). Logo/company now sit inset inside the letterhead band; wipes clamp inside the measured page frame; the outer frame is re-stroked after chrome; the grey TAX INVOICE title strip is painted between the measured horizontals. Field-slot values wipe sample text first so Shipper/Invoice No. do not double-print. Verified against pinned `invoice-report-format-4-standard-tax-invoice.pdf`.
- **Format-2 Tax Invoice India + all measured footers (2026-11-25):** Powered By wipe used `min(x, pageWidth-180)` and landed in the body (IGM overlap with company chrome). Portrait `fitSlotsInsideHeaderBand` also mutated /Rotate 90 letterhead slots. Fixes in the shared drawer (all measured codes): skip tall-strip letterhead fitting; clamp company/address into the header strip; rotate-aware overlap; footer values placed after labels with gap caps so Printed Date never stacks on the label/Created By; Powered By wipe stays on the footer strip only. Regenerated `brandingSlots.generated.ts` (392). Rotated fieldSlots stamps disabled (misaligned mediaBox coords). Verified vs pinned `invoice-report-format-2-tax-invoice-india.pdf`.
- **HBL family branding (2026-11-25):** Started one-by-one match with `FG_HBL_HKG` / `fg_hbl_hkg_rpm_ref_245.pdf`. Enrich now places org logo+company in the agent/carrier box (right), never shipper; no top-left invoice logo fallback for HBL; wipes only right-column branding. HAWB sparse overlays had logo+company at top-left over shipper — moved to Issued-by (right). 115 measured HBL codes share this chrome rule; full pixel acceptance still needs per-code verify+sign-off (MASTER_PROMPT). Attached user screenshot was HAWB-form geometry, not ocean HBL.
- **FG_HBL_FORMAT_1 House Air Waybill (2026-11-25):** Fresa pin `fg_hbl_format1_rpm_ref_388.pdf` has no shipper logo — chrome goes in Issuing Carrier Agent box (logo ~17,580 / company ~93,602). Shipper cell stays sample party text only. Address lines stay inside the agent box. Vitest `hblFormat1Letterhead.test.ts` + PNG vs pin. Not accepted (needs sign-off).
- **HBL queue chrome pass (2026-11-25):** `ORIGINAL_87` no longer takes shipper `companySlot` (agent name mid-page ~303,509). No invented logos when Fresa has none (`FORMAT_20`, `ORIGINAL_87`). MAGIC / FORMAT_14 / HKG keep right-header logo. FORMAT_14/16 company under logo (not Shipment Ref). Queue test `hblQueueLetterhead.test.ts`. Shipper-band audit clean across 114 HBL slots. Continue remaining catalogue HBL one-by-one vs Fresa pins.
- **FG_HBL_HKG vs Fresa pin (2026-11-25):** Matched `fg_hbl_hkg_rpm_ref_245.pdf`. F/Agent = org name+city; under-logo issuer + Tel/Email + Prepared By; signature `By {org}`; Code128 barcode at measured box; skip misaligned shipper/hblNo fieldSlots (org was landing in Shipper). Not accepted (needs sign-off).
- Plan map: `docs/reports/IMPLEMENTATION_PLAN_MAP.md` compares `Implemntation for report.md` to this frontend. Formats with a client layout/flow path are listed by default and auto-open PDF on `/reports/formats/:code` without Import / Bind / Activate.
- Format 8 Standard Invoice Arabic (`INVOICE_REPORT_FORMAT_8_STANDARD_INVOICE_ARABIC`): Generate/auto-open now use the measured Fresa face (not the teal KSA JSON shell). JSON fallback theme/blocks were rewritten to black bilingual TAX INVOICE. Measured drawer embeds Arimo + Noto Naskh Arabic so bilingual labels survive.
- Full Fresa↔system map: `docs/reports/FRESA_SYSTEM_FORMAT_MAP.md` + `reports/references/fresa-system-format-map.csv` (`npm run report:format-map`). Measured faces (416) generate with Fresa colours/layout; org logo + company + footer use exact slots from `brandingSlots.generated.ts` (392 specs via `node scripts/enrich-measured-branding.mjs`). Header matches Fresa Tax Invoice pattern: **logo left, company/address right-aligned**. Remaining pinned specs were promoted with `node scripts/promote-specs-to-measured.mjs` (HAWB five stay hand-built). Generate prefers measured faces over referenceAccurate/JSON when available.
- Rotated PDFs (Format 2 Tax Invoice India and 17 others): geometry is mediaBox-space; faces store `rotateDeg` and the drawer calls `page.setRotation`. Content text/logo also draw with `rotate: 90°` so glyphs advance along +Y like the Fresa samples (fixes the sideways/scrambled Tax Invoice). Branding enrich treats high-X footers and tall letterhead strips for these faces. Invoice detail **Formats** / **Reports catalog** open `layouts=all` without a pinned code and list every commercial invoice strip in Recommended.
- Branding wipe fix (all measured faces): `wipeTextSlot` uses advance-along-Y for rotate-90 slots so white wipes no longer erase Client/IGM/table cells; org company is **not** stamped into body `companyWipes` (that caused “Zoyan Logistics” over party fields). Sample footer values are skipped before redraw; `YOUR COMPANY NAME` / Fresa demo placeholders swap to org company. Verified Format 2 extract: company only in letterhead + beneficiary, footer has single Printed By/Date/Page.
- Header/footer/logo coverage (develop): `enrich-measured-branding` now emits a Fresa-aligned logo + right company + footer chrome for **every** measured spec (392/392 logo+company). Generate always paints org logo via `ensureBrandingLogoSlot` (Format-1 box fallback). `resolveReportOrgChrome` prefers `organization.logo_url`, else bundled commercial PDF logo so reports are never logo-less.
- Critical path fix (2026-11-25): Invoice Formats were falling through to the JSON/html2canvas shell (missing logo, Shipper overlaps, wrong footer) instead of measured Fresa faces. `generateCatalogLayoutPdf` now **always** uses measured faces when registered (416 codes). JSON `brandLogoSrc` / shared chrome also fall back to the commercial logo. Remaining gap: opening every Fresa CDN PDF one-by-one for pixel acceptance still needs the Phase harness (`tools/reports` verify) — geometry redraw is measured, not yet `accepted` per MASTER_PROMPT layers.
- Format 2 overlay fix: letterhead wipes/address stamps are clamped to the tall header strip only (no more wiping Client `Phone : N/A` at x=143 or stamping org name onto IGM). Company is right-aligned in-strip; contact lines prefer address/web like Fresa.
- Conformance status is read from `reports/status.json`. That file is generated from `reports/signoff.csv`. A row with reviewer, date, and reference hash is `accepted`. A code with no reviewer is `in_progress`. Every other catalogue code is `reference_only`. Nothing is accepted.
- The catalogue still shows Generate. Non-accepted rows say "approximate, not final".
- A scanned PDF (fewer than 8 extracted text items) is `needs_manual` in the manifest. That overrides the default status.
- The same file URL is kept once. A later numbered-list heading replaces the four-column table heading, because the list name is the tighter section.
- A filename that already matches a registered code wins over a nearby URL match. That stops a neighbor entry from stealing the code.
- When a local pin under `src/features/reports/qa/fresa-references` has the same file name, the manifest copies it and logs `local-pin`. Anything else is downloaded. Nothing was skipped without a log line.
- Layout identity is the page size plus lines and rectangles, mapped through the PDF transformation matrix and rounded to 1 pt. Label text is the delta column, not part of the identity. There is no wider distance match: two files that differ by one rule stay in different layouts.
- 150 dpi PNGs and the saved HTML page are generated locally and left out of git. The PDFs, workbooks, text extracts, and CSV files are the pin.
- Poppler `pdftotext` and `pdftoppm` were on PATH and produced a text file and at least one PNG for every PDF.

## Phase status

| Phase | Status |
|---|---|
| 0 Inventory and clustering | Done. |
| 0.5 Code map, status file, layout recount | Done. |
| 1 Pilot extraction | Four pilots through round 8. None accepted. Full remesure after mask and pagination checker changes. |
| 2–8 | Not started. |

Counts from `reports/references/summary.json`:

| Count | Value |
|---|---|
| Registered catalogue codes | 852 |
| Files linked on the Fresa page | 451 |
| Files pinned | 451 |
| Download failures | 0 |
| PDF | 402 |
| Excel | 49 |
| Scanned (`needs_manual`) | 3 |
| Unique PDF layouts | **376** |
| Layouts with more than one file | 18 |
| Median extracted shapes on page 1 | 86 |
| Pinned files with no registered code | 135 |
| Catalogue codes with no pinned file | 545 |
| PDFs missing a text extract | 0 |
| PDFs missing a 150 dpi PNG | 0 |

Excel workbooks are not part of the 376. They have no page geometry.

The three scanned files are marked `needs_manual`. `BARCODE_AWB_REPORT_FORMAT` and `STANDARD_INVOICE_RPM_REF_79` stay in the report list. The Fresa Gold brochure is the third scanned file and is removed from the report list.

## Phase 0.5 counts

Code map (`reports/references/code-map.csv`): 852 catalogue codes, each with at most one file. 419 have a file (1 manual override, 104 `rpm_ref`, 314 normalized name). No file is used twice. Proposed code `ADVANCE_SHIPPING_NOTE_LOCATION_WISE_1` has the Location Wise- 1 PDF, so `ADVANCE_SHIPPING_NOTE_LOCATION_WISE` keeps only the base PDF.

The 545 codes that had no phase-0 filename match:

| Triage | Count |
|---|---|
| name_mismatch (proposed reference filled in) | 124 |
| no_reference | 418 |
| unknown | 3 |

The references that had no registered code. This is the original 135, plus the Location Wise- 1 file once it stopped sharing a registered code:

| Triage | Count |
|---|---|
| ignore | 108 |
| should_register | 28 |

Ignore means do not add a new catalogue code. One of those is the brochure. The rest are files that are now the reference for a code that already exists. `should_register` means the file still has no catalogue code. The 23 generic invoices and notices from the first pass are in that 28, along with Location Wise- 1.

Layouts, same 402 PDFs, detail-row rules removed from the second hash. `layouts.csv` was not changed:

| Fingerprint | Layouts |
|---|---|
| Strict (phase 0) | 376 |
| Detail-row lines excluded | 374 |

Status: 0 accepted, 6 in progress, 846 reference only.

## Open questions

- This repo cannot add a backend `generate(code, recordId)` payload. The status badge is client-side. Confirm that is enough until a backend repo is in the workspace.
- 376 of 402 PDFs are their own layout at a 1 pt geometry rounding. Eighteen clusters have more than one member, and some of those mix families (a MAWB draft sits with several HBL files; an arrival confirmation sits with delivery confirmations). Phase 1 should review those clusters before treating one cluster as one spec. I did not loosen the match to force a smaller number.
- 545 registered codes had no phase-0 filename match. 135 pinned files had no registered code. The code map and the triage CSVs below are that split. `ADVANCE_SHIPPING_NOTE_LOCATION_WISE_1` is a proposed code for the Location Wise- 1 file. It is not in the 852-code registry.
- The 402 PDFs and 49 Excel files were committed in `ce4a25f0` as normal git objects, not Git LFS. This phase removes the Fresa Gold brochure from that pin. PNGs stay gitignored.
- Catalogue gating defaults to soft (`VITE_REPORTS_GATE` unset). Hard gating is implemented for v2 invoice codes: they are previewed and generated only when status is `accepted`. Nothing is accepted, so hard mode withholds all 26. Browse still opens the entry and shows "format not available yet".
- `defaultPdfStyle` is not a field on `OrganizationProfile` or `Company`, and `reports.engine` is not a stored setting. The four Generate PDF screens call `generateInvoicePdf` (quotation and credit/debit notes through their mappers). Treating a missing value as classic matches current behavior. A stored per-company style needs a backend column that this repo cannot name. Do not invent the column.

## Verification log

`npx vitest run …/hawbSparseOriginal.test.ts …/phase2HawbOfficial.test.ts …/phase2_4Acceptance.test.ts` (2026-11-26 Draft+Draft-1 polish)

```
Test Files  3 passed (3)
     Tests  30 passed (30)
```

`npx vitest run src/features/reports/templates/hawb/official/hawbSparseOriginal.test.ts src/features/reports/templates/hawb/official/phase2_4Acceptance.test.ts` (2026-11-26 Original-1 sparse)

```
Test Files  2 passed (2)
     Tests  13 passed (13)
```

Side-by-side pdfjs text coords: gen vs Fresa pin (`hawb-original-pre-printed-report-format-1.pdf`) — same MediaBox 737×923; field baselines align (e.g. MAWB 103/895.3, HAWB 458/895.8, cargo 483.7, executed 156.7). Allowed diffs only: org name / neutral parties vs Fresa DEMO.

`npx vitest run src/features/reports/templates/hawb/official/phase2HawbOfficial.test.ts` (2026-11-25 HAWB fidelity)

```
Test Files  1 passed (1)
     Tests  15 passed (15)
```

Compared against pinned Fresa HAWB PDFs (`reports/references/files/hawb-*.pdf`) + PNG extracts in `tools/tmp-hawb-fresa`. MediaBox/page intent evidence PDFs match; pixel acceptance + sign-off still open.

`node --test tools/reports/build-manifest.test.mjs`

```
✔ section headings follow the table column and the later list (7.4989ms)
ℹ tests 1
ℹ pass 1
ℹ fail 0
```

`npx vitest run src/features/reports/utils/reportConformanceStatus.test.ts --reporter=dot`

```
Test Files  1 passed (1)
     Tests  1 passed (1)
```

`node tools/reports/build-manifest.mjs` (final run, 2026-11-17)

```
{
  "pageLinks": 451,
  "pinned": 451,
  "downloadFailed": 0,
  "pdf": 402,
  "xlsx": 49,
  "scanned": 3,
  "uniqueLayouts": 376,
  "multiMemberLayouts": 18,
  "medianShapes": 86,
  "catalogueCodes": 852,
  "referenceWithoutCode": 135,
  "codeWithoutReference": 545,
  "missingText": 0,
  "missingPng": 0
}
```

pdfjs printed `Warning: TT: undefined function: 32` once. Text extraction still completed. `reports/references/failures.log` is empty.

The catalogue badge was not clicked in a browser. No dev server was running, and the catalogue requires a signed-in session. The status values are covered by the unit test; the list components render that status next to the existing format badge and do not remove Generate.

### Phase 0.5

`node tools/reports/build-code-map.mjs`

```
catalogueCodes 852
mappedToReference 419
override 1
rpm_ref 104
normalized_name 314
codesWithoutReference 545 (name_mismatch 124, no_reference 418, unknown 3)
referencesWithoutCode 136 (should_register 28, ignore 108)
```

`node tools/reports/build-status.mjs`

```
codes 852
accepted 0
inProgress 6
reference_only 846
```

`node tools/reports/fingerprint-counts.mjs`

```
pdfs 402
strictLayouts 376
detailRowNormalizedLayouts 374
failed 0
```

`npx vitest run src/features/reports/utils/reportConformanceStatus.test.ts` — 1 passed.
`node --test tools/reports/build-manifest.test.mjs` — 1 passed.

pdfjs printed `Warning: TT: undefined function: 32` once during the fingerprint recount. Both hashes were still produced for all 402 PDFs.

## Cleanup before Phase 1

`node tools/reports/review-map.mjs`

```
ignoreRows 108
duplicate_of_mapped 107
no_mapped_file 1
variant_layout 0
familySectionDisagreements 1
nameMatchSample 30
noReferenceCodes 418
noReferenceGroups 32
```

The 107 duplicates are the same path and the same SHA-256 as the file already mapped to that code, so the fingerprint was skipped. `reports/references/ignore-variants.csv` has a header and no rows. The remaining ignore row is the Fresa Gold brochure, which has no mapped code. Nothing was registered.

`reports/references/map-review.csv` has one family/section disagreement: `OUTSTANDING_LETTER_REPORT_FORMAT_5_OUTSTANDING_LETTER_WITH_INVOICES` is family `finance`, module `accounts`, and the Fresa section is `Invoice Formats`. The same file has a seeded sample of 30 normalized-name matches.

`reports/references/no-reference-groups.csv` groups the 418 codes. The largest groups are commercial/invoice/INVOICE 54, air HAWB draft 25, ops pending shipments 25, arrival notice 25, daily status 20, job status 20, cargo manifest 20, and advance shipping note 20.

## Phase 1 pilots

Pilots only: Tax Invoice India 1, HBL Jasper, Arrival Notice Jasper. No other layout, Excel file, or scanned file was extracted. Nothing is accepted.

`node tools/reports/extract.mjs --pilots`

```
INVOICE spans 205, dynamic 65, lines 269, rects 38, images 1, characters 2355, pdftotext words missing 0, warnings []
HBL spans 87, dynamic 29, lines 93, rects 28, images 2, characters 2457, pdftotext words missing 1 (24.000CBM), warnings []
ARRIVAL spans 126, dynamic 45, lines 424, rects 67, images 2, characters 1860, pdftotext words missing 1 (:07-FEB-19), warnings []
```

`node tools/reports/validate-spec.mjs` on each draft: valid, 0 errors.

The pdfjs line `Warning: TT: undefined function: 32` is `console.log`, not `console.warn`. A scan of the 401 pinned PDFs printed it for one file only: `fg_hbl_format33_rpm_ref_684.pdf`. That file still produced 39 text items, 860 characters, and 0 words missing against `pdftotext`. The three pilots did not print it. Empty text items are positioning gaps. Zero-width text items are 0. Font names were read (invoice: ArialMT, Arial-BoldMT, Consolas; HBL and arrival: Helvetica, Helvetica-Bold, subset Arial Unicode). Those fonts were not copied. Show-text fill colors on the invoice are black and white, but the show-text operator count does not equal the span count, so each span kept the default black. That loses white text on colored bars.

Dynamic spans and guessed bindings are in `reports/specs/<CODE>.dynamic.csv`. Bindings that were filled: invoice `invoice.tax` 2, `company.name` 2, `cargo.marks` 1 (60 of 65 blank); HBL `company.name` 1, `cargo.containerNo` 1 (27 of 29 blank); arrival 45 of 45 blank. HBL used the format-6 variant. Invoice and arrival are singleton layouts, so their dynamic marks are demo-value guesses.

Rendered PDFs: `reports/output/<CODE>.pdf`. Six layers from `node tools/reports/diff-pilot.mjs`:

Tax Invoice India 1: page pass (594 x 841.9). Geometry fail, 269/269 lines, 1 of 38 rects unmatched (a white rect at y -280.1, 792 x 1122, outside the page, not drawn). Static text fail, 0 of 140 missed on position, 140 font or size mismatches (Helvetica instead of Arial/Consolas). Dynamic text fail, 0 of 65 missed on position, 65 font or size mismatches, wrap/clip not implemented. Raster fail, 36,848 pixels, 1.70% at 150 dpi after logo and company masks (limit 0.5%). Pagination not exercised: both files are 1 page.

HBL Jasper: page pass (595 x 842). Geometry pass, 93 lines and 28 rects. Static text fail, 0 of 58 missed on position, 16 font or size mismatches. Dynamic text fail, 0 of 29 missed on position, 25 font or size mismatches, wrap/clip not implemented. Raster fail, 11,451 pixels, 0.53%. Pagination not exercised.

Arrival Notice Jasper: page pass (595 x 842). Geometry pass, 424 lines and 67 rects. Static text fail, 0 of 81 missed on position, 30 font or size mismatches. Dynamic text fail, 0 of 45 missed on position, 36 font or size mismatches, wrap/clip not implemented. Raster fail, 28,670 pixels, 1.32%. Pagination not exercised.

Poppler printed `No display font for 'Symbol'` and `No display font for 'ArialUnicode'` while rasterizing. The dev review page is `/reports/spec-review` and is registered only when `import.meta.env.DEV`. The dev server returned the pilot list, the HBL spec, the HBL reference PNG, and a compiled page module. The route still sits behind the reports permission, so the signed-in click path was not exercised.

## Pilot round 2

Same three pilots plus `TRIAL_BALANCE_REPORT_FORMAT_1_TRIAL_BALANCE_SUMMARY` (`reports/references/files/trial-balance-report-format-1-trial-balance-summary.pdf`). No other layout was extracted. Nothing is accepted. Scaling was not started.

Comparator and threshold changes. No numeric limit was raised. Geometry stays 0.1 pt, text position stays 0.5 pt, size stays 0.5 pt, raster stays 0.5% (ratio 0.005), pixelmatch stays 0.1, raster stays `pdftoppm -png -r 150` for both files, masks stay logo and company only.

- Font identity is the mapped family and weight (`reports/font-map.json`), not the raw PDF font name.
- A text-width check was added at 0.5 pt (reference span width against the re-extracted rendered width).
- A line also has to match width within 0.1 pt, stroke color, and dash. A rectangle also has to match stroke color and dash. Fill matching is unchanged.
- Elements fully outside the page box are dropped before either side is compared. The invoice dropped 6, which removes the off-page white rectangle from round 1.

`reports/spec.schema.json` now allows `stroke: null` for a fill-only rectangle. That is a schema correction, not a tolerance change.

Bundled fonts, not copied from the reference PDFs: Arimo regular and bold (Arial and Helvetica), Noto Sans regular and bold (Unicode fallback), Liberation Mono regular and bold (Consolas). Map: `reports/font-map.json`. `@pdf-lib/fontkit` is required to embed them. Each golden span is drawn with horizontal scaling so its advance matches the reference span width.

`node tools/reports/extract.mjs --pilots`

```
INVOICE pages 1, spans 236, dynamic 65, lines 269, rects 34, images 1, characters 2311, droppedOutside 6, colors #000000 #ffffff, curves 32, nonAxisPaths 1, pdftotext words missing 29
HBL pages 1, spans 88, dynamic 29, lines 93, rects 27, images 2, characters 2456, xobjects 2, lineStyle 108, undecodedText 6, textRenderMode 4, pdftotext words missing 1 (24.000CBM)
ARRIVAL pages 1, spans 126, dynamic 45, lines 424, rects 66, images 2, characters 1860, curves 189, nonAxisPaths 18, xobjects 2, lineStyle 451, undecodedText 2, textRenderMode 11, pdftotext words missing 1 (:07-FEB-19)
TRIAL BALANCE pages 3, spans 624, dynamic 302, lines 51, rects 0, images 0, characters 4916, page 3 spans 0, markedContent 784/162/2, pdftotext words missing 4
```

Shading ops recorded: 0 on all four. Dash is stored when `setDash` appears; geometry passed with dash equality, so these four did not show a dash mismatch. CMYK and opacity: 0. Curves, non-axis paths, form XObject markers, line cap/join, marked content, undecoded show-text, and nonzero text render mode are counted and not reconstructed. Image bytes are not copied. The missing `pdftotext` words are split tokens (`<h3>T` + `AX INVOICE</h3>`, `LTD` split from `PVT L`), not dropped glyphs.

`node tools/reports/validate-spec.mjs` on each spec: valid, 0 errors.

`node tools/reports/render-spec.mjs <CODE>` and the same command with `--overflow`. Overflow modes actually applied: invoice clip 59, shrink 4, wrap 2; HBL clip 19, wrap 10, shrink 0; arrival clip 34, wrap 7, shrink 4; trial balance clip 269, shrink 33, wrap 0. Shrink and wrap run only when the span's binding has a number, currency, date, or text format. Unbound dynamic spans use clip. Golden renders keep the reference demo strings. Invoice white text: 5 spans, all 5 re-extracted as `#ffffff`.

Spans whose reference advance is more than 0.5 pt away from the bundled font's natural width, and which the renderer therefore scales: invoice 17 of 236, HBL 40 of 88, arrival 53 of 126, trial balance 242 of 624. After that scaling, the 0.5 pt width check failed on 0 spans.

`node tools/reports/diff-pilot.mjs` for each code. Poppler again printed `No display font for 'Symbol'` and `No display font for 'ArialUnicode'` on the reference files.

Tax Invoice India 1: page pass (594 x 841.9, 1 page). Geometry pass, 0 unmatched lines, 0 unmatched rects. Static text pass, 171 spans, 0 failures. Dynamic text pass, 65 spans, 0 failures. Raster fail, 30,390 pixels, 1.40% (limit 0.5%). Heatmap `reports/output/raster/INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA-page-1-diff.png`. Pagination not a multi-page pass. Single-page invariants: header present, summary after last row (last row y 427.9, summary top 230.6), no-overflow fail. Spans past the right edge: `p1s21` `.fresatechnologies.com` (535.5 + 81.4), `p1s121` `eight` (581.1 + 18.9), `p1s236` `echnologies` (563.2 + 36.2). Page width is 594. They intersect the page, so they were kept.

HBL Jasper: page pass (595 x 842, 1 page). Geometry pass, 0 unmatched lines, 0 unmatched rects. Static text pass, 59 spans, 0 failures. Dynamic text pass, 29 spans, 0 failures. Raster fail, 38,693 pixels, 1.78%. Heatmap `reports/output/raster/HBL_DRAFT_REPORT_FORMAT_JASPER-page-1-diff.png`. Pagination not a multi-page pass. Single-page invariants: no overflow, header present, summary-after-last-row fail (last row y 170.7, summary top 194.7). The detail band is y 170.7–594.7 and the summary band is y 101–235.8, so they overlap. The highest span inside the summary percentage band sits above the lowest detail span.

Arrival Notice Jasper: page pass (595 x 842, 1 page). Geometry pass, 0 unmatched lines, 0 unmatched rects. Static text pass, 81 spans, 0 failures. Dynamic text pass, 45 spans, 0 failures. Raster fail, 45,442 pixels, 2.09%. Heatmap `reports/output/raster/ARRIVAL_NOTICE_REPORT_FORMAT_1_CARGO_ARRIVAL_NOTICE_JASPER-page-1-diff.png`. Pagination not a multi-page pass. Single-page invariants: no overflow, header present, summary after last row (last row y 387.5, summary top 200.4).

Trial balance: page pass (595 x 842, 3 pages). Geometry pass, 0 unmatched lines, 0 unmatched rects. Static text pass, 322 spans, 0 failures. Dynamic text pass, 302 spans, 0 failures. Raster fail, 100,147 pixels, 1.53% across three pages. Heatmaps `reports/output/raster/TRIAL_BALANCE_REPORT_FORMAT_1_TRIAL_BALANCE_SUMMARY-page-1-diff.png`, `page-2-diff.png`, `page-3-diff.png`. Pagination exercised and failed: header repeats false, footer repeats false, summary after last row false, row break true. Page 3 has no spans, lines, rectangles, or images (marked content only). The printed footer says page 1 of 2 and page 2 of 2. The blank third page has no header and no footer, and the summary check looks at that last page, so GRAND TOTAL on page 2 does not satisfy it. Row break is true only inside the percentile detail bands. Page 2's detail band is y 487.4–671.9, so rows below y 487 are outside that check.

Raster causes, from the heatmaps and the capture gaps. Every pilot's text edges differ because Arimo, Noto Sans, and Liberation Mono are substitutes, and horizontal scaling stretches a span to its reference advance. That matches the width check and still changes the glyph shapes wherever the reference width came from TJ adjustments or character spacing rather than the font's own advances. HBL and arrival barcodes stay red: they are images or nonzero text-render-mode drawing, and image bytes are not copied. Arrival also leaves 189 curves and 18 non-axis paths undrawn. Invoice leaves 32 curves undrawn, and three spans run past the right edge. Trial balance page 2 shows the stretched column text. Trial balance page 3 is blank on both sides. Poppler also has no display font for Symbol and Arial Unicode while rasterizing the references.

Bindings. Dictionary `reports/binding-dictionary.csv` (63 rows) targets only the paths in `src/features/reports/contracts/reportBindings.ts` (invoice, bill of lading, arrival notice). A dynamic span takes the nearest static label on the same line to its left, otherwise the nearest label above. A label of at least 4 characters that is a unique prefix of one dictionary key is accepted, so a truncated `Bill T` can match `bill to`. Exact keys added for labels the prefix rule cannot see: `hbl ha`, `gst18 sgst9`, `gst18 cgst9`. There is no trial-balance contract.

`node tools/reports/build-bindings.mjs` → dictionary 63, unresolved 360. `npx vitest run src/features/reports/contracts/reportBindings.test.ts` → 1 passed.

Resolved dynamic spans: invoice 18 of 65, HBL 13 of 29, arrival 17 of 45, trial balance 33 of 302. The trial-balance matches are labels that already exist on the three contracts, such as `total`. The other 269 trial-balance spans stay unresolved.

Unresolved spans, all of them, are in `reports/output/unresolved-bindings.csv`:

| Pilot | No static label | Label not in the dictionary |
|---|---|---|
| Tax Invoice India 1 | 2 | 45 |
| HBL Jasper | 0 | 16 |
| Arrival Notice Jasper | 0 | 28 |
| Trial balance | 155 | 114 |

Invoice examples of unresolved labels: no label on the first date, `User :`, `AX INVOICE</h3>`, `WEB : www`, `Shipment No.`, `Due Date`, `Reference No.`, `IGM No.`, `SEAL FEE`. Those strings are not paths on the three contracts, so they were left unresolved.

## Pilot round 3

Same four pilots. Nothing accepted. No other layout was rendered. Thresholds are unchanged: geometry 0.1 pt, text position 0.5 pt, text width 0.5 pt, raster ratio 0.005, pixelmatch 0.1, `pdftoppm -png -r 150`.

Checker changes, all stricter or additive:

- A span fails the width check when its rendered horizontal scale differs from the reference Tz, even if the advances match. Fit-to-width scaling is a failure. This round had 0 such failures.
- Natural width delta is reported per span and does not change the 0.5 pt tolerance. A font mapping is listed when its mean absolute natural delta exceeds 0.5% of the reference glyph advance.
- Arial Unicode is compared as Arimo. Noto is accepted on that span only for a glyph outside Latin.
- Geometry fails when a captured path is not redrawn within 0.1 pt, and when a curve, non-axis path, unresolved XObject, shading, opacity, undecoded show-text, nonzero text render mode, or unknown operator remains. Marked content is recorded and is not a geometry element. Line cap and line join are compared.
- Raster pixels are classified. The 0.5% limit is unchanged.
- Pagination ignores trailing blank pages. Golden output still keeps them, so the page-count check still sees them. `--live` omits trailing blank pages. Row break and summary-after-last-row run only on layouts classified as tables. Detail bands come from repeating column edges.
- CI compares `reports/ci-baseline.json` and fails when a passing layer starts failing, a mismatch count rises, or the raster ratio rises. The workflow is `.github/workflows/report-pilots.yml`.

`node tools/reports/extract.mjs --pilots` then render, then `node tools/reports/diff-pilot.mjs` for each code. `node --test tools/reports/round3.test.mjs` — 2 passed. `node tools/reports/census.mjs` — 401 PDFs, 0 failures.

Tax Invoice India 1, form: page pass. Geometry pass (1 path redrawn, uncaptured 0). Static text fail, 14 width failures, all over 0.5 pt and none from horizontal scale. Dynamic text pass, 65 spans. Raster fail, 37,068 px, 1.71%. Causes: text glyph 80.93%, text position 3.25%, vector 15.82%, image/barcode 0, color 0. Pagination not a multi-page pass. Header present. Three spans still cross the right edge (`p1s21`, `p1s121`, `p1s236`). Font over 0.5% natural deviation: Consolas to Liberation Mono, 11 spans, mean 7.82%.

HBL Jasper, form: page pass. Geometry fail, 0 unmatched lines, rects, and paths, 10 uncaptured (6 undecoded show-text, 4 nonzero text render mode). Static text pass, 59 spans. Dynamic text pass, 29 spans. Raster fail, 22,561 px, 1.04%. Causes: text glyph 68.44%, text position 0.37%, vector 2.57%, image/barcode 28.62%, color 0. No font mapping over 0.5%.

Arrival Notice Jasper, form: page pass. Geometry fail, 30 paths redrawn, 13 uncaptured (2 undecoded show-text, 11 nonzero text render mode). Static text fail, 2 width failures. Dynamic text pass, 45 spans. Raster fail, 38,996 px, 1.79%. Causes: text glyph 54.97%, text position 0.35%, vector 2.45%, image/barcode 42.02%, color 0, other 0.22%. Fonts over 0.5%: Arial Unicode to Arimo 0.81% (66 spans), Helvetica to Arimo 0.58% (26 spans).

Trial balance, table: page pass, 3 pages including the blank page. Geometry pass. Static text fail, 68 failures. Dynamic text fail, 134 failures. Of the 202 text failures, 182 are position or string and 20 are width. Raster fail, 37,427 px, 0.57%. Causes: text glyph 92.72%, text position 1.16%, vector 6.11%. Pagination exercised and failed. The trailing blank page is ignored (1). Footer repeats on the two content pages. Header does not repeat. Row break passes inside the column-aligned detail band. Summary-after-last-row fails: last detail y 150, summary top y 699.9. The row template has 29 rows and 196 filled cells; 14 of those cells sit on a column whose header mapped to `ledger.debit`, `ledger.openingBalance`, or `ledger.closingBalance`. Fonts over 0.5%: Arial Unicode to Arimo 4.71%, Arial Bold to Arimo Bold 22.15%, Arial to Arimo 12.74%.

Images, bytes not copied:

| Pilot | Box | Proposed class | Demo value used |
|---|---|---|---|
| Invoice | 27.4, 784.6, 82 × 39.6 | logo | |
| HBL | 360, 627, 155.4 × 75 | logo | |
| HBL | 380, 795, 194 × 17 | barcode | PLMAAJEA00081 |
| Arrival | 21, 742.7, 552 × 77.3 | logo | |
| Arrival | 350, 211, 220 × 35 | barcode | Yours faithfully , |

The arrival barcode's nearest text is the closing line, so the generated bars are not the reference payload. No QR image appears in these four pilots. Proposed allowed differences, for a decision: logo (already masked), barcode generated from the bound value, QR generated from the bound value, decorative Fresa branding. Class `other` is proposed as not allowed. The wide arrival header matched the logo rule because it sits in the top band.

`reports/label-inventory.csv` has 1,343 labels from 401 PDFs. `reports/binding-proposals.csv` proposes paths for the top 300. 225 of those are new fields the contracts do not have (`ledger.debit`, `ledger.credit`, `document.user`, `company.website`, `invoice.dueDate`, `shipment.number`, and slug fields where the nearest text was a value such as `inr` or `1`). Resolved 270, unresolved 171 (167 outside the top 300, 4 with no label). Files: `reports/output/pilot-bindings-resolved.csv`, `reports/output/pilot-bindings-unresolved.csv`.

Capability census, 401 PDFs, 509 pages, extraction only. Files using each feature: curves 110 (5,776 ops), images 359 (449), nonzero text render mode 227 (6,710), word spacing 78 (2,041), character spacing 20 (957), TJ 60 (4,928), dash 29 (82). Shading, CMYK, opacity, and non-100 Tz: 0. The common unsupported features are nonzero text render mode and the curves that are still uncaptured outside these four pilots.

## Pilot round 4

Same four pilots. Nothing accepted. No other layout was rendered. The 0.5% raster limit, 0.1 pt geometry, and 0.5 pt text position and width limits are unchanged.

Checker changes:

- Natural width uses the full glyph string, including the padding spaces the display text trims. The old Arial means (12.74% and 22.15%) compared the trimmed string with an advance that still included those spaces.
- Text widths are stored to 0.01 pt. The 0.5 pt width limit is unchanged. A whitespace-only TJ segment is not required to reappear as its own extracted span.
- An empty show-text array is not undecoded content. Text render modes 0–3 are captured. Modes above 3 would still fail geometry.
- Overflow uses the baseline origin. The reference is allowed to let the advance cross the page edge.
- On a table, the running header is the column-title row (Opening Balance, Debit, Credit, Closing Balance) and the title above it. Page-1 account names are not required on later pages. A parenthesized amount or a currency code is not a header label.
- A form header is the top 18% of the page. A summary band is only the region below the last detail row. An empty summary passes. The trial-balance reference now passes header repeat, row break, summary-after-last-row, and footer repeat.
- Branding spans are omitted from the golden draw and from the text checks. The arrival page-width header image is class `letterhead`.
- Raster now also reports non-text pixels and a blurred text-region measurement. The original full-page 0.5% result is still recorded and still fails.

Font samples after the measurement fix: Arial `01` at 9 pt, Tc 0.036, TJ 0.1, reference 10.01, Arimo 10.00. Arial Bold `Debit` reference 22.50, Arimo 22.50. Arial Bold `TRIAL BALANCE` reference 80.78, Arimo 81.10. Consolas `Bank` reference 21.76, Liberation Mono 23.70 (8.95% on all 11 Consolas spans). Consolas in the file advances at 549.8 units; Liberation Mono is the Courier-metric 600-unit font. No horizontal scaling was applied. Fonts still over 0.5% natural deviation: Arial to Arimo 0.57% (313 spans), Arial Unicode to Arimo 0.52% (261 spans). Arial Bold is under 0.5%.

Trial balance text failures fell from 68 static and 134 dynamic to 1 static and 11 dynamic. Every remaining failure is width, between 0.5 and 0.8 pt, on long account names. The golden cells use the reference strings, including unbound columns. The 182 position-or-string failures were whitespace segments the re-extraction dropped.

Geometry is pass on all four. The 6 and 2 undecoded operators were empty show-text arrays. HBL has four fill-and-stroke settings and arrival has eleven; those modes are now drawn and are not geometry failures.

Barcodes, decoded with ZXing from a temporary page render and not stored: HBL Code 128 `PLMAAJEA00081`, module 0.96 pt, quiet zone 9.83 pt. Arrival Code 128 `PLJEAMAA00001 / 16-JAN-19`, module 0.48 pt, quiet zone 6.72 pt. The arrival payload is no longer the closing line.

Pagination on the reference: trial balance passes, including the ignored trailing blank page. The three single-page pilots keep pagination pass false because they are not the multi-page fixture. Their own invariants pass (no overflow, header present).

Label inventory is 1,242 after dropping currency codes and bare numbers. Resolved 200, unresolved 211 against the top 300. Contract proposals, not wired, are in `src/features/reports/contracts/proposals/`. Arrival notice and quotation had no label whose main family was that document. Fields with no current source include `party.notify`, `shipment.freightTerms`, `shipment.igmNo`, `shipment.referenceNo`, `ledger.openingBalance`, and `ledger.closingBalance`.

`reports/ci-baseline.json` is the round 4 layer result.

## Pilot round 5

Same four pilots. Nothing accepted. No threshold was loosened. `reports/allowed-differences.md` was not in the repo, so no extra boxes were added from it.

Checker changes:

- Natural width is the unkerned advance (`kern: false`). The 0.5% group listing and the 0.5 pt width failure limit are unchanged. Drawing already used glyph advance widths rather than GPOS x-advances; the flag makes that explicit.
- The full-page raster also masks branding span boxes and the letterhead image, and will mask boxes from `reports/allowed-differences.md` when that file exists. The 0.5% limit is unchanged. Mask rectangles are outlined on the heatmaps. The blurred text measurement is taken before those extra masks.
- MuPDF is a second raster measurement. The pass/fail layer is still Poppler at 150 dpi.

Renderer change, not a checker change: Consolas spans add Tc of `(1126 − 1229) / 2048 × size` so Liberation Mono advances at 549.8 units per em. Horizontal scale stays 100.

System-font diagnostic, Poppler, logo and company masks only. Windows Arial, Arial Bold, and Consolas were read for the render and were not copied. HBL and arrival have no Arial or Consolas spans, so those two numbers did not move.

| Pilot | Full page | Blurred text |
|---|---|---|
| Invoice | 28,705 px, 1.32% | 9.65% |
| HBL | 23,046 px, 1.06% | 7.94% |
| Arrival | 34,346 px, 1.58% | 11.97% |
| Trial balance | 27,280 px, 0.42% | 2.34% |

The invoice text-only heatmap is glyph-edge antialiasing, solid red on omitted Fresa lines, and solid red on the three long lines whose advance is 0.5–0.8 pt off the embedded Arial. Text-position pixels are 3.9% of that diff. Table rules are a separate 20% vector difference. Trial balance with real Arial falls under 0.5% full-page; the remaining blur is the same edge effect.

Kerning off did not remove the width misses. Unkerned Arial-to-Arimo is 0.57% (313 spans); the kerned figure is 0.50%. Arial Unicode-to-Arimo is 0.52% unkerned and 0.64% kerned. The reference font's advance is the part that disagrees.

Consolas Tc at 7.9 pt is −0.3973. All 11 invoice spans are within 0.3 pt: Beneficiary Name 152.3/152, Bank 21.8/21.7, `: HDFC` 26.1/26.1, A/c No 30.5/30.4, `: XXXXXXXXXXX` 56.6/56.5, IBAN Code 43.5/43.4, `: ABA:XXXXXX` 52.2/52.1, Swift Code 47.9/47.8, `: XXXXXX` 39.2/39.1, Address 39.2/39.1, `: CHENNAI.` 43.5/43.4.

MuPDF versus Poppler, same masks: invoice 1.35% versus 1.49%, HBL 0.86% versus 0.87%, arrival 1.56% versus 1.35%, trial balance 0.55% versus 0.57%. None pass. Poppler's Symbol and Arial Unicode warnings are not the raster gap. Arial Unicode is embedded on HBL (41 spans), arrival (66), and the trial balance (261). Symbol is not a text font in these four files. Non-embedded text fonts: HBL Helvetica 40 and Helvetica Bold 7; arrival Helvetica 26 and Helvetica Bold 34; trial balance Arial 313 and Arial Bold 50. Invoice Arial, Arial Bold, and Consolas are embedded.

Official layers after kerning off, Consolas Tc, and the new masks: invoice static 3 width, raster 1.49%; HBL text pass, raster 0.87%; arrival static 2 width, raster 1.35%; trial balance static 1 and dynamic 11, all width, raster 0.57%, pagination pass. Geometry uncaptured is 0 on all four.

Rehearsal, seed 5, 20 PDFs, not the pilots. Multi-page 3, nonzero text render mode 11, families sea docs, commercial, ops list, finance, other, air docs, quotation, wms. No fixes. Failure classes: raster 15 documents, pagination 3 (the multi-page forms), static width 3 documents / 7 spans, dynamic width 3/3, geometry mismatch 1, static position or string 1 document / 2 spans. Four documents had none of those classes. `reports/output/rehearsal/summary.json`.

`reports/ci-baseline.json` is the round 5 layer result. The raster ratios and the invoice static count went down. The 0.5% limit did not.

Verification: `node --test tools/reports/round5.test.mjs tools/reports/round3.test.mjs` (4 passed), `node tools/reports/round5-measure.mjs`, `node tools/reports/rehearse.mjs`.

## Pilot round 6

Same four pilots, plus the rehearsal set. Nothing accepted. No threshold was loosened. `reports/allowed-differences.md` was not created: the draft was not in the request and it is not in the repo.

Checker changes:

- Multi-page forms use a continuation-page model. An empty header band is allowed. A non-empty header must contain the strings shared by every non-empty header. A page-number footer is required on every page only when the form prints page numbers. Tables keep the header, footer, row-break, and summary rules. The 0.1 pt, 0.5 pt, and 0.5% limits are unchanged. A single page still does not pass pagination.
- The blurred text measurement is also reported split by spans on embedded fonts and spans on non-embedded fonts. There is no new threshold.
- Font size is stored to 0.0001 pt. The 0.5 pt size limit is unchanged. Rounding the size to 0.1 pt was stretching a long line by about 0.6 pt after the advance table already matched.

Renderer changes, not checker changes: a span whose reference font is not embedded is written with that BaseFont, no font file, and the reference Widths. A standard-14 name uses the standard widths for a character the reference never showed. Arimo is not embedded for those spans. A span whose reference font is embedded is drawn with Arimo outlines, and the glyph positions come from the reference advance table. Tz is not used. The Consolas Tc adjustment is not applied when that table is present.

Font census, 401 PDFs, 0 files failed: 40,474 spans on embedded fonts, 30,660 spans on non-embedded fonts. The non-embedded share is 43.1%. `reports/font-census.csv` has one row per font and file (987 rows).

Width misses over 0.5 pt on the four pilots: none.

Official layers, Poppler at 150 dpi. The pass/fail rasterizer is still Poppler.

| Pilot | Page | Geometry | Static | Dynamic | Raster | Non-text | Pagination |
|---|---|---|---|---|---|---|---|
| Invoice | pass | pass, uncaptured 0 | pass | pass | 25,445 px, 1.17% | 0.28% | single page |
| HBL | pass | pass, uncaptured 0 | pass | pass | 10,980 px, 0.50%, does not pass | 0.02% | single page |
| Arrival | pass | pass, uncaptured 0 | pass | pass | 21,634 px, 0.99% | 0.03% | single page |
| Trial balance | pass | pass, uncaptured 0 | pass | pass | 25,094 px, 0.38% | 0.04% | pass |

Blurred text, Poppler, no threshold. Invoice has no spans on a non-embedded font.

| Pilot | All text | Embedded spans | Non-embedded spans |
|---|---|---|---|
| Invoice | 9.55% | 9.55% (42,152 / 441,420) | none |
| HBL | 6.67% | 10.76% (21,577 / 200,564) | 2.44% (4,729 / 194,058) |
| Arrival | 9.61% | 10.29% (23,769 / 231,087) | 8.13% (8,488 / 104,431) |
| Trial balance | 2.50% | 3.47% (14,897 / 428,931) | 1.74% (9,525 / 547,004) |

MuPDF, same masks, not the pass/fail engine.

| Pilot | Full page | Non-text | Blur, embedded | Blur, non-embedded |
|---|---|---|---|---|
| Invoice | 22,997 px, 1.06% | 0.18% | 9.19% | none |
| HBL | 9,880 px, 0.45% | 0.01% | 8.64% | 3.35% |
| Arrival | 25,242 px, 1.16% | 0.30% | 8.49% | 4.58% |
| Trial balance | 0.37% | 0.05% | 3.62% | 1.37% |

The three multi-page HBL references now pass the form rules. HBL Draft 122 continuation pages are 2 and 3: page 2 is a container annex with its own header, page 3 has an empty header. HBL Draft 142 and 52 continuation page is 2, the back page. None of the three prints a page number, so the footer rule passes. The trial balance is a table and still passes header, footer, row break, and summary. No reference failure remains on these four files.

Rehearsal causes, not fixed. `INVOICE_REPORT_FORMAT_14_INVOICE` has one geometry mismatch: the line from (20, 95.5) to (573, 95.5) is dashed 2.5 on, 1.5 off in the reference and solid in the render. Coordinates, width, and color match. `drawLine` clears the dash inside its own graphics state, so the dash set immediately before the call does not reach the stroke. `HBL_DRAFT_REPORT_FORMAT_148` has two static position-or-string failures, spans p1s80 and p1s81. The detention sentence starts at x 22. The tail segments " tue", " per", " day", " until", and " returned." start past the 595 pt page edge. They are drawn as separate text objects and dropped on re-extraction, so the checker cannot find them.

Seed 5, the same 20 PDFs, after the font change. Multi-page 3, text render modes 11. Eleven documents had no failing class. `reports/output/rehearsal/seed-5.json`.

| Failure class | Documents | Instances |
|---|---|---|
| raster | 8 | 8 |
| geometry mismatch | 1 | 1 |
| static position or string | 1 | 2 |

Seed 6, 20 further PDFs, pilots and the seed 5 codes excluded. Multi-page 5, text render modes 8. Four documents had no failing class. None of the five multi-page files failed pagination. `reports/output/rehearsal/seed-6.json`.

| Failure class | Documents | Instances |
|---|---|---|
| raster | 14 | 14 |
| static width | 3 | 45 |
| dynamic width | 2 | 6 |
| geometry mismatch | 2 | 2 |

`reports/ci-baseline.json` is the round 6 layer result. The text failure counts went to zero and the raster ratios went down. The 0.5% limit did not. The trial balance passes all six layers and is not accepted.

## Pilot round 7

Nothing is accepted. Thresholds are unchanged: geometry 0.1 pt, text 0.5 pt, raster 0.5% at 150 dpi Poppler. `reports/allowed-differences.md` is the mask policy. It is pending client confirmation and contains no coordinate boxes, so the checker added no new rectangles. Logo, letterhead, and branding masks remain. Live values and barcodes stay in the golden comparison.

Checker changes, and nothing else in the checker:

1. A text piece whose origin is at or past the page's right edge is dropped on both sides of the text comparison, the same way a fully off-page element is dropped. The 0.5 pt tolerance is unchanged.
2. Three report-only numbers were added. They do not pass or fail a document: image/barcode pixel count, branding-mask pixel count, and text-ink difference (differing pixels in non-branding text regions divided by reference ink pixels in those regions).

Renderer changes:

- `drawLine` receives the dash array and dash phase, so a dash set for that stroke is not cleared inside pdf-lib's graphics state.
- Line join is set inside a graphics-state pair around `drawLine`. Straight rules on the trial balance were extracted with join 1 and drawn with join 0 until this.
- A non-embedded font copies the reference FontDescriptor (no FontFile), Encoding including Differences, FirstChar, LastChar, Widths, and ToUnicode. A font with none of those is the standard face of the same name.
- Where the text matrix horizontal scale is not the vertical font size, the draw uses that scale in the text matrix and keeps the stored font size. `Tz` is not used.
- Pieces that start past the right edge are not drawn.

`INVOICE_REPORT_FORMAT_14_INVOICE` geometry, static text, and dynamic text pass. The dashed rule matches. Raster passes, 7,024 px, 0.32%.

`HBL_DRAFT_REPORT_FORMAT_148` static text passes. Five pieces were dropped, all from the detention sentence: " tue" at (603.8, 112.2), " per" at (614.7, 112.2), " day" at (625.8, 112.2), " until" at (637.7, 112.2), " returned." at (598.5, 106.2). Page width is 595.

Non-embedded blur on the four pilots did not approach 0. Poppler, same masks as round 6:

| Pilot | Full page | Non-text | Embedded blur | Non-embedded blur | Text-ink difference |
|---|---|---|---|---|---|
| Invoice | 25,445 px, 1.17% | 0.28% | 9.55% (42,152 / 441,420) | none | 0.1559 |
| HBL | 10,980 px, 0.50%, does not pass | 0.02% | 10.76% (21,577 / 200,564) | 2.44% (4,729 / 194,058) | 0.0673 |
| Arrival | 21,634 px, 0.99% | 0.03% | 10.29% (23,769 / 231,087) | 8.13% (8,488 / 104,431) | 0.1251 |
| Trial balance | 25,094 px, 0.38% | 0.04% | 3.47% (14,897 / 428,931) | 1.74% (9,525 / 547,004) | 0.1402 |

The trial balance was drawn again after the line-join fix and has no failing class. It is not accepted. The baseline ratios did not move.

One span, HBL `BILL OF LADING`, Helvetica-Bold 11 pt. Both sides are Type 1, WinAnsi, not embedded, with no descriptor, widths, or FontFile. The span crop differs by 0 pixels. Poppler is given the same face on both sides.

One span, trial balance `p1s404` `(2,924,913.22)`, Arial,Bold 6.96 pt. pdffonts shows TrueType, WinAnsi, not embedded on the reference. The copied dictionary and Windows Arial Bold are the same 490 ink pixels, so Poppler substitutes Arial Bold for that dictionary. The reference crop matches that face after a 1 px (0.48 pt) downward shift, with 33 antialias pixels left. On other files Poppler logs `Couldn't find a font for 'ArialUnicodeMS', subst is 'Helvetica'`.

Seed 6 width misses, before the fix: 51 instances, all simple WinAnsi. No CID Identity-H. No symbolic font. `HBL_DRAFT_REPORT_FORMAT_15` was ArialUnicodeMS, 32 instances. `LETTER_OF_GUARANTEE_REPORT_FORMAT` was Helvetica, 1 instance. Both cleared when the reference dictionary was copied. `AIR_QUOTATION_REPORT_FORMAT` was Arial, 7, and Arial,Bold, 11. The font size is the vertical scale; the text matrix X scale is 0.9667, 0.9688, 1.0161, or 1.0217. Drawing that scale cleared them. The grouper then reported no misses on the three documents.

The 40 rehearsal documents are in `reports/rehearsal-raster.csv`. `BARCODE_AWB_REPORT_FORMAT` is one of the 40 and is the scanned file, so it has no ratios. No new threshold. Text-ink difference is above 1 on three documents because the differing pixels exceed the reference ink in the text boxes: container outturn 3.9389, freight manifest LCL exports 2.8826, container load plan 2.7135.

`reports/full-run.csv` is the 401-file run. Excel stayed out. `BARCODE_AWB_REPORT_FORMAT` and `STANDARD_INVOICE_RPM_REF_79` are marked out of scope. The other 399 were extracted, rendered, and verified. 193 have no failing class. Page passes on all 399.

| Failure class | Documents | Instances |
|---|---|---|
| raster | 200 | 200 |
| static position or string | 15 | 318 |
| dynamic position or string | 9 | 11 |
| pagination | 4 | 4 |
| geometry mismatch | 3 | 3 |

Those five are every cause the run produced. Layer results on the 399: geometry 396 pass / 3 fail, static 384 / 15, dynamic 390 / 9, raster 199 / 200. Pagination: 75 multi-page pass, 320 single-page, 4 multi-page fail. Nothing found in this run was fixed. Nothing is accepted.

## Pilot round 8

Nothing is accepted. Geometry 0.1 pt, text 0.5 pt, and raster 0.5% are unchanged.

### Checker changes

1. Raster now records `maskedFraction` (masked pixels over page pixels, all pages) and fails when that fraction exceeds 25%. The 0.5% differing-pixel limit is unchanged.
2. Page-number detection no longer matches the substring inside words such as "stoppage". Forms ignore textless pages when checking footer page numbers.
3. Table header repeats use label-like header texts only (`:` labels and "TRIAL BALANCE"), and join adjacent same-line segments so split labels such as `F` + `ROM DATE :` still match.

### Renderer change (named for text-ink investigation)

`drawText` is no longer used for positioned spans. Drawing goes through `showText` so the outer text render mode and stroke survive. Re-measure of the three high text-ink docs did not improve; no further fix.

### Mask integrity

`HBL_DRAFT_REPORT_FORMAT_122`: logo slot = largest page-1 image, 554×780.1 pt near-full-page form background, also classed decorative Fresa branding because y is in the bottom 16%. The slot is applied on all three pages → about 5.64M masked pixels (fraction 0.8643). Output draws neither decorative branding nor non-barcode images, so that area is blank.

Documents with masked fraction over 15% (all over 25%, all raster-fail): HBL 127, 130, 118, 132, FG_HBL_FORMAT10_RPM_REF_472, HBL 122, MAWB_DRAFT_REPORT_FORMAT, HBL 129.

### Raster split

R1 (non-text > 0.5%): 48. R2 (non-text passes; T unset): 157. Heatmaps for the 10 worst R1 are under `reports/output/round8/r1/`. Dominant causes: tall form/branding strips not drawn; other unmasked artwork; fills/strokes.

### High text-ink trio

`CONTAINER_OUTTURN_REPORT_FORMAT`, `FREIGHT_MANIFEST_LCL_EXPORTS_REPORT_FORMAT`, `CONTAINER_LOAD_PLAN_REPORT_FORMAT` share a 58.9×799 left-edge image (logo slot + decorative branding), renderMode 2 titles, and non-embedded ArialUnicodeMS. Poppler logs `Couldn't find a font for 'ArialUnicodeMS', subst is 'Helvetica'`. Crops are in `reports/output/round8/*-region-*.png`. No general fix applied; numbers unchanged after the showText path.

### Text-ink calibration

Seed 8, 20 documents across font families. Values and crops in `reports/output/round8/calibration.json` and `reports/output/round8/calibration/`. T is not set.

### Arabic (12 documents)

Reference: embedded CID `ArialUnicodeMS` Identity-H plus simple Helvetica. Output: Arimo CID for embedded runs, Helvetica / copied simple faces for the rest. Extracted Arabic strings are presentation forms (e.g. U+FE70–U+FEFF), not base letters. Proposal only: keep reference positions for golden compares; for live Arabic, shape with an open Arabic font or draw the presentation forms; never copy FontFile.

### Pagination, geometry, dynamic

All four former pagination failures pass against the reference after the checker fixes. Geometry: Daily Status and Consol IGM miss three near-white 2 pt filled rects; Advance Shipping Note misses one short vertical rule (cap 2). Dynamic: seven confirmation/manifest docs fail on address lines with Arabic comma `،`; two Arabic invoices fail on bilingual title/labels.

### Live overflow renders

Ten documents rendered with `long-values.json` overflow (no raster compare). Page counts unchanged. Almost all stressed fields clip (default overflow rule). Invoice 1 shrinks two number fields; air quotation shrinks four; HBL 15 wraps one field to maxLines. Outputs in `reports/output/round8/live/`.

### Full remesure

`reports/full-run.csv` and `reports/rehearsal-raster.csv` include `masked_fraction`. Clean on all layers: 188 of 399. Summary: `reports/full-run-summary.md`.


Verification: remesure via `node tools/reports/_r8-remeasure.mjs`, R1 heatmaps, calibration seed 8, live overflow renders, Arabic font dump.

## Track A

Nothing is accepted. `reports/signoff.csv` was not edited. Geometry 0.1 pt, text 0.5 pt, raster non-text 0.5%, text-ink T = 0.40, and masked fraction 25% are unchanged. The in-flight full remesure was already stopped before the speedups; Vite was left running.

### Speedups

Cache directory `reports/cache/objects/<sha256>/` stores the spec, the reference text regions, golden reference PNGs, and the rendered PDF. The key is the reference SHA-256 plus `tools/reports/pipeline-version.mjs`. A spec or text-region hit requires the extract version. A golden PNG hit requires the raster version. A rendered PDF hit requires the extract and render versions. Checker-only changes do not invalidate those artifacts. Form backgrounds are overlaid at compare time and are not copied into shipped output.

Verify runs in a worker pool (`tools/reports/verify-pool.mjs`), one document per worker, temp PNGs under `reports/cache/work/<workerId>/`. This machine used 6 workers. Iterations use the fixed 80-document list in `reports/cache/subset-80.json` (four pilots, baseline failures, seed-8 family fill). The full 399 ran for the final report.

Final full-run timings (summed across documents, wall clock 371 s): extract 336 s, render 240 s, reference raster 400 s, rendered raster 412 s, diff 1531 s. Cache on that run: spec 88 hit / 311 miss, golden PNG 88 hit / 311 miss.

### Setup (kept)

T = 0.40 and the image classes are in `reports/allowed-differences.md`, still pending client confirmation. Image census: 399 PDFs, 447 images (`reports/image-census.csv`). Classes: logo 215, letterhead 123, other 38, form_background 30 images in 18 documents, barcode 27, qr 12, decorative 2. Documents with an `other` image are listed in `reports/image-census-other.md`.

The >40% rule matches 18 documents, not 8. All 18 pass page, geometry, static, dynamic, and raster when the reference background is composited under both rasters for verification only (`reports/output/track-a/overlay-form-background.json`). The background is not shipped.

Filled rectangles at least 1×1 pt stay rectangles. Horizontal and vertical rules longer than 2 pt stay lines, so the short Advance Shipping Note rule is kept. Daily Status and Consol IGM geometry pass after re-extract.

Noto Naskh Arabic (OFL) is bundled. Presentation forms and the Arabic punctuation in `reports/char-fallback.json` are drawn with it. Horizontal scale is forced to 1 for those runs. Overflow for live text is wrap, then shrink to 70% of size, then clip with a warning. Numbers shrink, then clip with a warning. The 10-record live render wrote `reports/output/track-a/overflow-warnings.json` (346 clip warnings on the stressed values).

### Loop

Baseline is `reports/full-run-track-a.csv` (not the partial iter1 file).

| | Documents | Clean | R1 | R2 |
|---|---|---|---|---|
| First run | 399 | 332 | 41 | 9 |
| Last run | 399 | 334 | 41 | 7 |

First-run class counts: raster R1 41, raster R2 9, static position or string 14, dynamic position or string 9, static font family or weight 1, static width 1.

Last-run class counts: raster R1 41, static width 13, static position or string 12, raster R2 7, dynamic width 4, dynamic position or string 1.

No previously clean document failed a layer. Gained clean: `FCR_DOCUMENT_REPORT_FORMAT`, `PRE_ALERT_TO_CLIENT_REPORT_FORMAT`.

Iteration 1 kept: draw Arabic presentation forms with Noto Naskh, accept NFKC / visual-order Arabic and joined mixed-script runs in the checker, and classify a narrow tall edge strip as decorative before the logo slot.

Iteration 2 reverted: a uniform 0.0082 pt-per-glyph spacing bias. It pulled some small labels inside 0.5 pt and left titles outside. None of the 20 rechecked text-failure documents became clean.

Stopped after that revert. The class that affects the most documents is raster R1, and it has no general fix inside the current thresholds. What remains is deferred or needs a decision.

### Checker changes

1. Text-ink limit T = 0.40, from the 20-document calibration (drop HBL 33 at 1.17, ceiling of the rest).
2. Raster passes only when non-text ≤ 0.5%, text-ink ≤ T, and masked fraction ≤ 25%.
3. `form_background` is copied from the reference raster onto the render for the compare only. It is not added to the masked fraction.
4. Logo, letterhead, and decorative images are masked. The logo slot is only a logo-class image.
5. Arabic text matches after NFKC, after reversing Arabic runs, and with whitespace ignored. Mixed-script pieces on one baseline are joined when the gap is at most 8 pt.
6. A non-Latin run drawn in Noto Naskh Arabic is accepted when the reference face maps to Arimo or Noto Sans.
7. The pool can skip heatmaps, Gaussian text blur, and natural-width deviation. Those skips do not change the pass rule. The single-document CLI still writes heatmaps and computes deviation.

### Deferred

- Arabic spacing bias. It did not clear three documents.
- Vietnam delivery-order static position misses (2 documents).
- Stuffing-report font family / width (1 document).
- Confirmation-address Arabic-comma width (4 documents), same width limit as the Arabic decision below.

### Decisions needed

Raster R1, 41 documents. Geometry already passes. The remaining pixels sit outside text boxes and allowed images, and several of these documents also have text-ink above 1 because the open font is heavier than the reference (examples: container outturn non-text 0.0403 and text-ink 3.94; GL voucher non-text 0.0485 and text-ink 3.64). Moving either limit would be a threshold change.

Arabic width, 13 static and 4 dynamic documents. Noto Naskh at the reference origin, with uniform character spacing and no horizontal scale, still misses the 0.5 pt width limit on some titles (standard Arabic invoice title 72.49 pt reference vs 73.9 pt rendered before the reverted bias). Presentation forms and logical Arabic already compare as the same string.

### Crops

Ten reference/render pairs, top of page 1, are in `reports/output/track-a/crops/`: invoice, HBL Jasper, HBL 122 (form background), arrival notice, air quotation, advance shipping note, daily status, container outturn, Arabic invoice, carting confirmation.

Verification: `node tools/reports/verify-pool.mjs subset`, then `node tools/reports/verify-pool.mjs full`. Last run file: `reports/full-run-track-a-last.csv`.

## Track A2

Nothing is accepted. `reports/signoff.csv` was not edited. No threshold, status value, mask, or limit changed.

Before is `reports/full-run-track-a-before-a2.csv` (the Track A last run). After is `reports/full-run-track-a-last.csv`.

| | Documents | Clean | R1 | R2 | Static position | Static width | Dynamic width |
|---|---:|---:|---:|---:|---:|---:|---:|
| Before | 399 | 334 | 41 | 7 | 12 | 13 | 4 |
| After | 399 | 334 | 41 | 7 | 13 | 13 | 4 |

No previously clean document failed a layer. Two file-lock errors during the pool (HBL Jasper, and two of four duplicate trucker rows) were remeasured or restored from the passing measurement of the same file. HBL Jasper is still clean.

### R1 histograms

Report only. `diagnoseNonText` records distance of each differing non-text pixel to the nearest text span box and to the nearest allowed image box. Totals: 0-1 px 66,175; 2-3 px 99,245; 4-8 px 224,804; over 8 px 2,068,544. Far-pixel causes: fills 62,694, strokes 800,458, clip 0, images 0, other 1,205,392. Clip stays 0 because clip paths are not in the spec. Table: `reports/output/track-a2/r1-histogram.md`. Ten worst crops: `reports/output/track-a2/r1/worst/`.

### Arabic

Each presentation-form glyph is placed at its reference x using that glyph's advance. No uniform spacing and no scale. Joins break on all 12 documents (max interior gap 2.7 pt to 8.92 pt). The standard invoice title moved from 73.9 pt under uniform spacing to 71.9 pt against a 72.5 pt reference, and it is still outside 0.5 pt. Invoice 8 lost its static position failure. FORMAT1 939 and 941 gained one. Widths and crops: `reports/output/track-a2/arabic/`.

### Non-Arabic fixes

Not applied in Track A2. The 4 dynamic width failures are Arabic-comma addresses. The two Vietnam delivery orders were still failing here; Track A3 clears them.

### Checker changes

Items 1-7 are the Track A list above. Item 8 is new:

8. `diagnoseNonText` writes distance histograms for a report. It does not change the mask, the whitening, or the pass rule.

## Track A3

Nothing is accepted. `reports/signoff.csv` was not edited. No threshold, mask, or status changed. The checker did not change.

| | Documents | Clean | R1 | R2 | Static position |
|---|---:|---:|---:|---:|---:|
| Before | 399 | 334 | 41 | 7 | 13 |
| After | 399 | 336 | 41 | 7 | 11 |

The two Vietnam delivery orders moved from static position to clean. No other class changed. No previously clean document was re-rendered.

Layer isolation for the 10 worst R1 documents is in `reports/output/track-a3/layers.md`. Geometry-only ratios stay above 0.5%. The differing segments are strokes. Spec coordinates are stored at 0.1 pt. No filled-rect-to-stroke conversion was present, so the renderer was not changed for that and the 41 R1 documents were not re-rendered. 18 of the 41 are rotated pages whose media-box coordinates are drawn on the rotated page size. That does not cover the 23 unrotated R1 documents.

Noto Sans already contains U+1EA0–U+1EF9. Precomposed glyphs in that range are now embedded instead of a base letter plus a combining dot. Both Vietnam delivery orders pass all layers.

Review sheets are `reports/review/<family>/<code>.png` with `reports/review/index.csv`. `npm run report:signoff -- <code> <reviewer>` writes a sign-off row only when every layer passes or the code's line in `reports/exceptions.md` contains `approved`. It was not run.

### Exceptions

`reports/exceptions.md` lists every document that cannot pass, with the reason: Arabic joins and widths, Arabic-comma dynamic widths, the two Vietnam delivery orders, the 41 R1 documents, the 7 R2 text-ink documents, the 18 form-background overlays, and proof of delivery.

## Track A4

Nothing is accepted. `reports/signoff.csv` was not edited. No threshold, mask, or status changed.

Before is `reports/full-run-track-a-before-a4.csv`. After is `reports/full-run-track-a-last.csv`.

| | Documents | Clean | R1 | R2 | Static position | Geometry-only raster |
|---|---:|---:|---:|---:|---:|---:|
| Before | 399 | 336 | 41 | 7 | 11 | not measured |
| After | 399 | 343 | 31 | 7 | 11 | 10 |

Static width stayed 13. Dynamic width stayed 4. Dynamic position stayed 1. No document gained raster R1. Three documents that were clean now fail only the new geometry-only raster: ADVANCE_SHIPPING_NOTE_FORMAT_1, FG_STANDARD_INVOICE_TANZANIA_RPM_REF_1431, FG_TAX_INVOICE_INDIA_FORMAT4_RPM_REF_1007. Their page, vector geometry, static, dynamic, and masked raster checks still pass.

The renderer writes the reference `/Rotate`, MediaBox, and CropBox, and draws in MediaBox coordinates. After the re-render, all 391 documents match on `/Rotate`, MediaBox, CropBox, and UserUnit. Before that, 146 differed: 127 by 0.02 or 0.04 pt of MediaBox rounding, 18 rotated documents by `/Rotate` 90 versus 0 and a swapped MediaBox, and ADVANCE_SHIPPING_NOTE_FORMAT_1 by a CropBox. No UserUnit differed. The 18 rotated documents still fail raster R1. Page and vector geometry pass, and the geometry-only raster passes. GL voucher non-text moved from 0.0485 to 0.0191 and text-ink from 3.6388 to 0.5523.

Line and rect coordinates and widths are stored to 0.0001 pt. Geometry colors are `r,g,b` with 6 decimal places. The geometry check still tolerates 0.1 pt and does not round either side.

The geometry-only raster is additive. It strips text and images, diffs at 150 dpi, and fails above 0.5% of page pixels. It does not change masks or the masked raster pass. Ten documents pass vector geometry and fail it. The list is in `reports/exceptions.md`.

On the 23 non-rotated R1 documents, the top segments after the page-box and precision render had identical coordinates. Filled rules were drawn as strokes, path colors were parsed as hex so a gray fill became black, and a later reference fill was painted underneath an earlier path. Those three are fixed. Ten of the 23 are now clean. Seven still fail the geometry-only raster on one-pixel rule coverage. That was not changed further.

### Checker changes

Items 1-8 are unchanged. Items 9 and 10 are new:

9. The vector geometry check compares in displayed (rotated) coordinates. Values are not rounded to 0.1 pt before the compare. The tolerance stays 0.1 pt.
10. An additive geometry-only raster strips text and images from both content streams, diffs at 150 dpi, and fails above 0.5% of page pixels. It does not change the masked raster pass.

## Fidelity freeze

No checker change. No threshold, mask, status, or `reports/signoff.csv` change. Counts stay at the Track A4 table above: 399 documents, clean 343, R1 31, R2 7, static position 11, static width 13, dynamic width 4, dynamic position 1, geometry-only raster 10.

`reports/exceptions.md` classifies every remaining failure. `reports/full-run-summary.md` has the same counts by class and by cause. Review sheets were regenerated with `node tools/reports/review-pack.mjs`. How to run the pool, read a sheet, and sign off is `docs/reports/HANDOFF.md`.

Classic Generate PDF is frozen. `docs/reports/CLASSIC_FILES.md` lists the generator and the mappers the four screens use. `npm run report:guard-classic` hashes those files and compares 150 dpi rasters of one quotation, invoice, credit note, and debit note with `reports/classic-snapshots/`. The guard is in `.github/workflows/report-pilots.yml`.

Guard at the start of this part, after the baseline commit `a8e693c5`, and again after the classification and review pack:

```
{"ok":true,"files":6,"pages":{"invoice":1,"quotation":1,"credit-note":1,"debit-note":1}}
```

Review pack: `{"documents":391,"sheets":391}`.

## Invoice family

No code is accepted. Classic Generate PDF is unchanged. `VITE_REPORTS_ENGINE` defaults to `legacy`. `readDefaultPdfStyle` returns `classic` when the payload has no `defaultPdfStyle`. That field is still absent from `OrganizationProfile` and `Company`.

The invoice contract is `src/features/reports/engine/invoiceReportContract.ts`. The dictionary resolves 133 of 1,016 dynamic spans on 26 specs. 883 spans are in `reports/invoice-unresolved.csv`. Notify party and net weight stay blank. Details are in `docs/reports/backend-requirements-invoice.md`.

Reports and Formats call v2 only when the engine is `v2` and the code is an invoice format. Credit notes, debit notes, and quotations are not routed there. A thrown v2 render returns the classic blob and the notice in `invoiceV2Gate.ts`. The browser does not host `renderSpec`, so that call throws and the current layout is still shown.

Ten invoice-shaped records (no live tenant API in this workspace) are summarized in `reports/invoice-v2-samples.json`. All are one page. Empty fields stayed empty. Sample 1's text extract has no Fresa name or URL. Charge lines do not map onto format 1, which has no description slot.

Guard after these edits, and again after the full re-verify:

```
{"ok":true,"files":6,"pages":{"invoice":1,"quotation":1,"credit-note":1,"debit-note":1}}
```

Full verify, 399 documents, cache hits on every spec and golden render. Counts stayed 343 clean, R1 31, R2 7, static width 13, static position 11, dynamic width 4, dynamic position 1, geometry-only 10. No document that was clean in `reports/full-run-track-a-before-invoice.csv` failed. The pool still lists the same three geometry-only codes against the first Track A baseline.

```
{"documents":399,"regressions":3,"regressionCodes":[{"code":"ADVANCE_SHIPPING_NOTE_FORMAT_1","classes":["geometry-only raster"]},{"code":"FG_STANDARD_INVOICE_TANZANIA_RPM_REF_1431","classes":["geometry-only raster"]},{"code":"FG_TAX_INVOICE_INDIA_FORMAT4_RPM_REF_1007","classes":["geometry-only raster"]}]}
```



## Flow real-record compare (quotations / CN / DN)

No threshold/mask/status/signoff changes. Classic generators untouched. No new templates.

- Endpoints: `GET /quotations` (10 real: 4 FCL, 3 air, 3 LCL), `GET /credit-notes` (0 real), `GET /debit-notes` (0 real). CN/DN used anonymized synthetic copies from real invoices (marked synthetic).
- Artifacts: `reports/flow-spike/real/<type>/<id>-compare.png`, `blanks.md`, `summary.json`, `quotation-fields.md`, `credit-note-sign.md`, `decisions-needed.md`.
- Money: quotation diffs 0. CN/DN tax diffs where `tax_total` null and `tax_amount` set (classic reads `tax_total` only; flow reads `tax_amount`).
- Stress: 40-line quote paginated (2 pages, last line present); long name not clipped; multi-currency EUR printed; missing party/job renders; flow failure falls back with classic notice.

## Flow decisions (staging CN/DN, tax_amount, quotation binds)

- CREDIT_NOTE_FLOW_1 / DEBIT_NOTE_FLOW_1 catalogue only when soft gate AND `VITE_REPORTS_FLOW_STAGING=1`, labelled `staging only: no real records tested`. Synthetic notes do not count toward release.
- Flow tax: `tax_amount` only; `assertFlowTaxIntegrity` on every record. Classic `tax_total` difference listed in `docs/reports/RELEASE_NOTES_PHASE1.md` for INV/26/00089, 00093, 00094, 00095, 00097, 00098.
- Quotation flow binds transit, weight, volume, containers, incoterm|incoterms, terms_and_conditions, carrier/airline, flight/voyage, remarks. Fill share after: air 33.3%, FCL 45.0%, LCL 46.7%.
- CN/DN wording: Related Invoice; invented terms sentences removed.

## Flow release pack (status path, staging docs, client pack)

- Temporary signoff proof (not committed): `reports/flow-spike/status-path-proof.json` � both flow release codes `accepted` under temp status; hard gate lists exactly those two; legacy engine lists none.
- `build-status` now includes flow option codes (remain `reference_only` until a real sign-off). Committed `status.json` has 0 accepted.
- Kill switch: `VITE_REPORTS_ENGINE` unset/legacy. Fallback notice tested. Docs: `STAGING_TEST.md`, `ROLLBACK.md`, RELEASE_NOTES kill switch section.
- Quotation screen vs flow: 0 shown-but-blank after binding commodity/department/status/shipment/job. Client pack under `reports/client-pack/`.

## Catalogue spec draw

Generate on the catalogue now asks the dev spec renderer (`/__reports/invoice-v2` → `renderSpec`) for any code that is not already a dedicated measured face, before the shared JSON shell. The spec file supplies page size, lines, and labels. The open record supplies values. FRESA demo identity stays blank. A missing spec falls through. This is not a sign-off. Raster match is still not exact: substitute fonts, empty logo slots, and unbound spans. 545 catalogue codes have no pinned file. Nothing is accepted.
