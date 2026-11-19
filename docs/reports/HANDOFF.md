# Report fidelity handoff

Nothing in this file is accepted. Thresholds, masks, status values, and `reports/signoff.csv` stay as they are.

## Run verify

Cache key is the reference PDF's SHA-256 plus `tools/reports/pipeline-version.mjs`. Objects live in `reports/cache/objects/<sha256>/`. A hit is reused only when the extract, render, or raster version still matches. The checker version is not stored as a shipped artifact. Do not commit `reports/cache/`.

```
node tools/reports/verify-pool.mjs subset
node tools/reports/verify-pool.mjs full
node tools/reports/verify-pool.mjs list reports/cache/subset-80.json
```

`subset` checks the fixed 80-document list. `full` reads `reports/capability-census.csv`, skips `BARCODE_AWB_REPORT_FORMAT` and `STANDARD_INVOICE_RPM_REF_79`, and overwrites `reports/full-run-track-a-last.csv`. Copy that CSV aside before a full run if you still need the previous counts. The pool compares clean codes against `reports/full-run-track-a.csv` (the first Track A run, 332 clean). A new check can flag a previously clean document without an existing layer regressing.

Workers: `min(cores, 6)`, at least 2. One document per worker. Duplicate census rows share one cache file, so a second copy can hit `EBUSY` on `spec.json`. That is a file lock, not a document failure. Re-run that code alone and put the passing row back.

One document, with heatmaps:

```
npm run report:diff-pilot -- CODE
```

Classic Generate PDF, separate from the spec pipeline:

```
npm run report:guard-classic
```

It hashes every path in `docs/reports/CLASSIC_FILES.md` and rasters one fixed quotation, invoice, credit note, and debit note at 150 dpi. A mismatch fails the command.

## Layers and thresholds

| Layer | Pass rule |
|---|---|
| Page | Displayed width and height within 0.1 pt. `/Rotate`, MediaBox, CropBox, and UserUnit are written to match the reference. |
| Static geometry | Lines, rectangles, and paths in displayed coordinates. Tolerance 0.1 pt. Values are not rounded to 0.1 before the compare. Colors compare as exact `r,g,b` strings. |
| Static text | Same string, font, size, and position. Position tolerance 0.5 pt. |
| Dynamic text | Same box, alignment, font, size, wrap, and clip. Arabic matches after NFKC, with Arabic runs reversed and whitespace ignored. A mixed-script join may gap by at most 8 pt. |
| Raster | 150 dpi Poppler. Pixelmatch threshold 0.1. Passes only when non-text ≤ 0.5%, text-ink ≤ T = 0.40, and the masked fraction ≤ 25%. |
| Geometry-only raster | Additive. Strips text and images, diffs path paint at 150 dpi, fails above 0.5% of page pixels. It does not change the masked raster pass. |
| Pagination | Repeating header, row break, summary, and footer on multi-page documents. |

Logo, letterhead, and decorative images are masked. The logo slot is only a logo-class image. A form background is copied from the reference raster for the compare and is not counted in the masked fraction. It is not drawn in the shipped PDF.

Non-Latin text may use Noto Naskh when the reference face maps to Arimo or Noto Sans. Vietnamese U+1EA0–U+1EF9 stays precomposed.

Checker changes already shipped, and not changed in the fidelity freeze:

1. Text-ink limit T = 0.40.
2. Raster passes only when non-text ≤ 0.5%, text-ink ≤ T, and masked fraction ≤ 25%.
3. Form background is copied from the reference raster for the compare only, and is not part of the masked fraction.
4. Logo, letterhead, and decorative images are masked. The logo slot is only a logo-class image.
5. Arabic text matches after NFKC and reversed Arabic runs, with whitespace ignored. Mixed-script join gap ≤ 8 pt.
6. Non-Latin Noto Naskh is accepted when the reference face maps to Arimo or Noto Sans.
7. The pool may skip heatmaps, Gaussian text blur, and natural-width deviation. The pass rule is unchanged. The single-document CLI still writes heatmaps.
8. `diagnoseNonText` writes distance histograms. Masks, whitening, and the pass rule are unchanged.
9. Vector geometry compares in displayed coordinates. Values are not rounded to 0.1 pt before the compare. Tolerance stays 0.1 pt.
10. The geometry-only raster is additive and does not change the masked raster pass.

## Review sheet

`node tools/reports/review-pack.mjs` writes `reports/review/<family>/<code>.png` and `reports/review/index.csv`.

Each sheet is page 1 at 72 dpi: reference, output, then the pixel diff. Red outlines on the diff are masked image boxes (logo, letterhead, decorative, form background). `index.csv` columns are code, family, layers passed, the failure class from the latest full run, and blank `reviewed_by`, `reviewed_on`, and `decision`.

## Sign-off

```
npm run report:signoff -- CODE REVIEWER
```

The command writes one `reports/signoff.csv` row only when every layer passes, or when that code's own line in `reports/exceptions.md` contains `approved`. It does not change catalogue status. Status stays `in_progress` until `reports/status.json` is rebuilt from a row that has a reviewer, a date, and a reference hash. The classification lines do not contain that word. Do not run the command to invent one.

## Add a format

1. Pin the reference under `reports/references/files/` and add a row to `reports/references/code-map.csv`. Leave Excel and scanned files out of the raster list.
2. Extract with `npm run report:extract -- CODE`. The spec is `reports/specs/CODE.json`. One layout is one spec.
3. Mark fixed labels and dynamic spans. Bind dynamic spans through `reports/binding-dictionary.csv`. Leave a span blank when the current model has no field, and record the missing table and column under `docs/reports/`.
4. Render with `npm run report:render-spec -- CODE` and compare with `npm run report:diff-pilot -- CODE`.
5. Add the code to the census only when it should enter the 399-document run. Then run the pool. A new code is not accepted by being added.

Classic quotation, invoice, credit note, and debit note PDFs stay on the files in `docs/reports/CLASSIC_FILES.md` until a company has chosen a v2 code and the classic guard still passes.

## Decisions still open

- `defaultPdfStyle` is not a field on the frontend organization or company models. The four Generate PDF screens call the classic generator. A stored per-company style needs a backend column. The table and column are blank until that schema is in this workspace.
- `reports.engine` is not a stored setting. The spec renderer must stay off the classic Generate PDF button until an explicit v2 choice exists.
- Image classes in `reports/allowed-differences.md` are still waiting for client confirmation.
- No exception line has been signed. The classification in `reports/exceptions.md` is the list to accept or reject.
- Invoice tax is one total. SGST, CGST, and IGST are not separate fields. Container, marks, notify, freight terms, and bank details are missing on some records. Empty stays empty.
- Credit notes and debit notes have no Fresa reference, so they stay on the classic generator.
- The form-background documents pass the compare and still ship without that image. That needs an explicit decision.
- The 18 rotated R1 documents pass path paint and still fail the masked raster. The cause is recorded as other. No threshold moves for them.
