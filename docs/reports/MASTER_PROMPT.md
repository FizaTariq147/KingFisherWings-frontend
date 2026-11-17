# Cursor Master Prompt: Pixel-Exact Report Formats

Work one phase per Cursor session. Start each session with: "Read docs/reports/MASTER_PROMPT.md and docs/reports/PROGRESS.md, then continue with Phase N."

## ROLE

You are a senior full-stack engineer working inside this repository (React frontend, NestJS backend, PostgreSQL). Your job is to make every generated report match its reference format on https://fresatechnologies.com/sample-report-formats/ as closely as the rules below allow, using a single extraction-driven pipeline.

## CONTEXT: CURRENT STATE (do not assume more than this; verify in the code)

- The reports catalogue has 852 registered codes. A code is a name, a family and a module link.
- Only six codes have dedicated templates: HAWB Draft 2, HBL Jasper, Tax Invoice India 1, FCL Quotation, Arrival Notice Jasper, Activity Completed Jobs (Excel). None is marked accepted.
- Other codes use one of: a measured redraw from a Fresa sample, a shared React family layout, an old JSON layout, or (browse only) the unmodified Fresa sample.
- HAWB Draft 2 prints through a local Vite print route using Chromium/Playwright. That does not exist on the production backend, so production falls back to an on-screen capture. The other four official HAWB formats also use on-screen capture.
- Job, shipment and quotation screens open the catalogue with the record id. Invoices have three actions: Generate PDF (classic invoice, do not replace yet), Formats, and Reports catalog. My Reports is a separate multi-record list facility.
- Generate must never return the Fresa sample file. It builds a document from the open record and the organization profile (name, address, phone, email, logo URL). Fresa logo or Fresa company name must be refused.
- Known data gaps: invoice has one tax total (no SGST/CGST/IGST split); container, marks, notify, freight terms and bank details may be missing on some records. Empty values stay empty. Never fill with Fresa demo data.
- Known visual gaps: Arial vs Helvetica, empty logo when the profile has none, empty cells, and a leftover sample barcode graphic on the HBL.

First action in every session: inspect the repo to find the real file paths for the catalogue, report registry, generators, templates, organization profile, and frontend Reports button. Record them in `docs/reports/PROGRESS.md` under "Repo map" and use those paths from then on. Do not guess paths.

## GOAL

Replace the six hand-built templates and the shared drawers with one pipeline:

1. Read the pinned reference PDF.
2. Extract page size, lines, rectangles, text spans, fonts and images into a JSON layout spec.
3. Mark each text span as a fixed label or a data field.
4. One Node renderer draws any spec. Preview, download and print all use that same output.
5. The organization profile fills the logo and company slots. The open record fills the data slots.
6. A code is `accepted` only when the automated comparison against the pinned reference passes and a person has signed off.

## RULES (non-negotiable)

1. **Allowed differences from the reference (complete list):** the logo (same box and size), company name, address, phone and email from the organization profile, live data values from the record, and Fresa-identifying text (Powered by, Fresa contact details, Fresa registration or tax numbers, demo party, bank and amount data). Anything else that differs is a defect.
2. **Never copy Fresa's identifying content** into output. If the profile has no logo or field, leave the slot empty at the exact reference size.
3. **Never mark a code `accepted` unless all six acceptance layers pass in the harness and a sign-off entry exists.** Do not edit thresholds to make a test pass. Do not exclude areas from the diff beyond the masks listed in rule 1.
4. **Do not delete legacy paths until the codes that use them are migrated and accepted.** Add the new path next to the old one behind a flag.
5. **Pin references.** Tests compare against stored copies with hashes, never the live site.
6. **One template means one spec.** Variants (region, language, draft vs original, preprinted) are options or overrides on a spec, not copies. Old code names must still resolve.
7. **Do not invent data.** Missing fields stay blank. Add the missing fields to the data model instead.
8. **Do not change the classic invoice Generate PDF action** until the invoice family is accepted and migrated.
9. **Fonts:** do not copy fonts embedded in the reference PDFs. Use metric-compatible fonts (Arimo or Liberation Sans for Arial; check others from the reference's font names) and bundle them. Include an Arabic-capable font for Arabic variants.
10. **Be honest in reports.** If something fails or cannot be verified, say so in `PROGRESS.md`. Do not claim a phase is done without running its verification commands and pasting the results.
11. Keep changes small and committed per task. Write tests with the code. Run lint, type-check and tests before finishing a task.
12. If a requirement conflicts with what you find in the code, stop and write the conflict in `PROGRESS.md` under "Questions" instead of guessing.

## ACCEPTANCE LAYERS (a code is accepted only if all pass)

| Layer | Requirement | Check |
|---|---|---|
| Page | Same size, orientation, margins | Exact match |
| Static geometry | Lines, boxes, shading match | Tolerance 0.1 pt |
| Static text | Same string, font, size, position | Tolerance 0.5 pt |
| Dynamic text | Same box, alignment, font, size, wrap and clip, using the reference's own demo values | Span comparison |
| Raster | At most 0.5% differing pixels at 150 dpi after masking logo and company-name boxes | Pixel diff |
| Pagination | Same repeating header, row break, summary and footer on multi-page fixtures | Stress fixtures |

Excel codes are checked on sheet name, columns, widths, header style, AutoFilter, frozen header, number formats, print orientation and print area. No pixel diff.

## WORKING METHOD

- Create `docs/reports/PROGRESS.md` if missing, with sections: Repo map, Decisions, Phase status, Open questions, Verification log.
- At the end of each task, update it. At the end of each phase, paste the verification output into "Verification log" and set the phase status.
- Stop at the end of each phase and wait for confirmation before starting the next, unless the user wrote "continue all phases".
- Prefer small scripts under `tools/reports/` (extractor, manifest builder, verify CLI) and keep specs under `reports/specs/`, references under `reports/references/` (with `manifest.csv`), fixtures under `reports/fixtures/`.

## PHASE 0: Inventory and clustering

**Backend / tooling**

1. Build `tools/reports/build-manifest` that scrapes https://fresatechnologies.com/sample-report-formats/ and writes `reports/references/manifest.csv` with: code, section heading, link text, source URL, file type (pdf/xlsx/other), local path, SHA-256, downloaded_at, status (`reference_only` by default).
2. Download every linked file into `reports/references/files/`. Skip nothing silently: log failures.
3. For each PDF, generate PNG pages at 150 dpi and a `pdftotext -layout` text file next to it.
4. Map manifest rows to the registered catalogue codes. Write unmatched codes in both directions to `reports/references/unmatched.csv`.
5. Detect scanned PDFs (no extractable text) and flag them `needs_manual`.
6. Fingerprint each PDF's static geometry (page size, rounded line and rect coordinates, label strings), group identical or near-identical fingerprints, and write `reports/references/layouts.csv` listing: layout id, member codes, delta between members (label, language, watermark, etc.), priority.

**Frontend**

7. Add a `status` field to the catalogue payload (`accepted`, `in_progress`, `reference_only`) and show a badge in the catalogue list. Do not hide any current Generate action yet; show "approximate, not final" for non-accepted codes.

**Done when:** manifest, layouts.csv and unmatched.csv exist; counts (total codes, unique layouts, scanned, Excel) are written in `PROGRESS.md`. Stop and report the unique-layout count.

## PHASE 1: Extractor and review screen

**Backend / tooling**

1. Build `tools/reports/extract` that reads a pinned PDF and outputs a draft spec JSON containing: page box; every line and rect (stroke width, color, fill); every text span (string, font name, size, color, x, y, anchor, alignment); every image (box, format).
2. Static vs dynamic detection: a span is dynamic if its value differs across variants in the same layout cluster, or matches a demo value. Everything else is a static label.
3. Band detection: repeating rows (same y-step, aligned columns) become a detail table with column x-ranges, header row and alignment. Detect page header, title, detail, summary and page footer bands.
4. Spec schema: define and validate it with a JSON Schema in `reports/spec.schema.json`. Include field bindings (`{{path}}`), format rules (date, number, currency, Indian grouping, amount in words), and overflow rules (wrap, shrink, clip, grow, max lines). Include named slots for logo and company block.
5. Emit one draft spec per layout cluster into `reports/specs/`.

**Frontend**

6. Build a dev-only review page: reference PNG with the spec overlay, a list of spans with a toggle static/dynamic, a binding editor, and a save action that writes the spec. Keep it behind a dev flag.

**Done when:** draft specs exist for all non-scanned clusters; the first 10 are reviewed and corrected; schema validation passes for all. Report counts.

## PHASE 2: Renderer

**Backend**

1. Build one Node renderer (pdf-lib or PDFKit; reuse the current one if it fits) that draws any spec: static elements, bound fields with alignment, font, wrap, max lines, shrink or clip, and formatters.
2. Table engine: repeating column header, page break when a row does not fit, summary band after the last row, footer on every page, page X of Y.
3. Fonts: bundle metric-compatible fonts; map each reference font name to a bundled font in one config file.
4. Barcode and QR: generate from the record where the reference has a slot. Remove the leftover sample barcode graphic from HBL unless the reference has a barcode slot.
5. Branding slots: logo and company block take their position and size from the spec. With no logo, render nothing in that box.
6. One endpoint: `generate(code, recordId, options)` returns the PDF (or xlsx). Preview, download and print all call it. Add the feature flag `reports.engine = legacy | v2` per code or family.
7. Excel renderer driven by a column-config spec: sheet name, columns, widths, header style, AutoFilter, frozen header, number formats, landscape setup, print area.

**Done when:** one reference (Tax Invoice India 1) renders from its spec using the reference's demo values with no manual placement code. Report visual results honestly.

## PHASE 3: Golden fixtures and verification harness

**Backend / QA**

1. For each layout, extract the reference's demo values into `reports/fixtures/<layout>.golden.json`.
2. Build `npm run report:verify <code|layout|all>` that renders each code and runs the six layers against the pinned reference: page box, vector geometry diff, text-span diff, raster diff with masks for the logo and company-name boxes only, pagination checks. Output a JSON result and an HTML report with reference, output and diff side by side.
3. Add stress fixtures per table layout: 1 row, exactly one page of rows, one row over, three pages, long names, long addresses, empty optional fields, multi-currency.
4. Add the Excel verifier for the checks listed above.
5. CI: run `report:verify all` on pull requests. A failing code that is marked `accepted` fails the build. Non-accepted codes report but do not fail.
6. Status management: a script `report:status` that sets a code to `accepted` only when verify passes and a sign-off entry exists in `reports/signoff.csv` (code, reviewer, date, reference hash). Reference hash must match the pinned file.

**Done when:** `report:verify` runs for the pilot layouts and CI is wired. Paste results in `PROGRESS.md`.

## PHASE 4: Port the six existing templates

1. Replace the hand-placed code for HAWB Draft 2, HBL Jasper, Tax Invoice India 1, FCL Quotation, Arrival Notice Jasper and Activity Completed Jobs with extracted specs rendered by the Phase 2 renderer.
2. Close known gaps: Arial metrics via bundled font, HBL barcode, empty-cell behavior, and HAWB printing without Chromium or on-screen capture (use the spec renderer for Draft 2 in both dev and production).
3. Keep the old implementation behind the legacy flag until each code passes.
4. For each of the six, run verify, fix defects, and list any remaining difference with its cause.

**Exit gate:** all six pass the six layers. Present the overlays so the user can sign them off. Do not mark them accepted yourself.

## PHASE 5: Data model fixes (can run alongside Phases 2 to 4)

**Backend**

1. From all specs, collect every bound field into `reports/fields.csv` (binding, family, present in model: yes/no, source).
2. Add missing fields and migrations: invoice tax split (SGST, CGST, IGST per line and totals); container, marks and numbers, goods description, notify party, place of receipt and delivery, freight terms, vessel and voyage; organization profile registration and tax numbers, letterhead address lines, bank details and branch codes.
3. Define one normalized data contract per family (invoice, job card, BL, AWB, arrival notice, quotation, voucher, manifest) as TypeScript interfaces with resolvers. Specs bind only to these contracts.
4. Keep the rule: missing values stay blank, never filled with sample data.

**Frontend**

5. Add form fields for the new data where users must enter it, with validation and no breaking changes to existing records.

**Done when:** `fields.csv` shows no unmapped bindings for the pilot families, migrations run cleanly, and contracts have tests.

## PHASE 6: Roll out by family

For each cluster, in this order, repeat: review the spec overlay, apply variant deltas as options on one spec, add bindings, run golden and stress tests, fix, and request sign-off.

1. Invoices, then Proforma.
2. Job Card, Job P&L.
3. Quotations (Air, FCL, LCL).
4. Arrival notices, delivery orders, manifests.
5. HBL, MAWB, HAWB families.
6. Vouchers, statements, letters.
7. Regional, language, preprinted and draft-vs-original variants as options.
8. Excel list reports.

For scanned references (`needs_manual`), measure from the PNG, document the method, and mark them clearly in the manifest.

**Done when per family:** all codes in the family pass verify, sign-offs are recorded, and the legacy flag can be switched to v2 for that family. Report the accepted count out of the total after each family.

## PHASE 7: Frontend integration

1. Single preview path: PDF viewer on the generated file; Print, Download and Email use the same file.
2. Excel codes: download plus the existing table view, with a clear note that Excel is not previewed.
3. Variant controls (draft vs original, preprinted, language) as options on one report; old code names still resolve.
4. Status display: badge per code, plus an admin view with "last verified against reference", reviewer and reference hash.
5. Catalogue gating (decision pending; implement as a config switch): `soft` shows an "approximate, not final" badge on non-accepted generatable codes; `hard` enables Generate only for accepted codes and shows "format not available yet" with Browse for the rest. Default to `soft`.
6. Keep the Fresa sample Browse mode behind an admin flag for comparison. Do not offer it as a generated file.

## PHASE 8: Cutover and drift monitoring

1. Switch each migrated family to v2. Delete the on-screen capture path, React family layouts and old JSON layouts only for codes that are accepted and migrated.
2. Add a scheduled job (weekly) that re-fetches the Fresa page, compares the link list and file hashes to the pinned snapshot, and opens a report listing added, removed or changed references. Changed references set the affected codes to `in_progress`.
3. Release gate in CI: fail if any code shown as generatable under `hard` mode is not accepted.
4. Real-data check: render each family with several real records (long names, many charge lines, missing optional fields, multi-currency) and attach the outputs.
5. Write `docs/reports/ADDING_A_FORMAT.md`: extract, review, fixture, verify, sign-off.

## OUTPUT FORMAT FOR EACH SESSION

At the end, reply with:

1. What was completed (list of tasks with file paths).
2. Verification commands run and their results (paste the output summary).
3. What failed or remains, with the cause.
4. Questions that need a decision.
5. The next phase and its first task.

Do not summarize work you did not do. Do not mark any code accepted. Stop at the end of the phase.
