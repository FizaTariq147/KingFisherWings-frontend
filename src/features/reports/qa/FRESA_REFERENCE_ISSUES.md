# Fresa Reference Issues (Phase 2)

Generated: 2026-11-13T11:27:51.858Z

## Inventory reconciliation

| Field | Expected | Actual |
|-------|--------:|-------:|
| catalogueEntries | 461 | 461 (OK) |
| withDirectPdfUrl | 196 | 196 (OK) |
| withNonPdfUrl | 49 | 49 (OK) |
| nameOnlyNoUrl | 216 | 216 (OK) |
| urlVerifiedLocal | 190 | 190 (OK) |
| ambiguousPdfs | 6 | 6 (OK) |
| mapped | 361 | 361 (OK) |
| mappingAmbiguous | 55 | 55 (OK) |
| unmapped | 45 | 45 (OK) |
| uniquePdfsOnDisk | 196 | 196 (OK) |

_No count discrepancies against Phase-1 summary._

## PDF quality flags

- Likely blank/stub PDFs (by file): 15
- Likely preprinted (heuristic): 7
- Multi-page: 32

### Sample stub/blank candidates

- `container-vgm-form-report-format.pdf` — 3641 bytes, pages=1
- `gl-listing-sort-by-customer-code-voucher-report-format.pdf` — 3554 bytes, pages=1
- `gl-report-voucher-report-format.pdf` — 5221 bytes, pages=2
- `hawb-original-pre-printed-report-format-1.pdf` — 2207 bytes, pages=1
- `hbl-draft-report-format-20.pdf` — 5895 bytes, pages=1
- `import-security-filling-jasper-ams-report-format.pdf` — 5838 bytes, pages=1
- `invoice-report-format-12-standard-invoice-preprinted.pdf` — 4078 bytes, pages=1
- `invoice-report-format-16-standard-tax-invoice-preprinted.pdf` — 5062 bytes, pages=1
- `isf-filing-document-report-format.pdf` — 5828 bytes, pages=1
- `letter-of-guarantee-report-format.pdf` — 3431 bytes, pages=1
- `mawb-original-preprinted-kc-report-format.pdf` — 11623 bytes, pages=9
- `profit-and-loss-report-format-1-landscape.pdf` — 3302 bytes, pages=1
- `profit-and-loss-report-format-2-jasper.pdf` — 2561 bytes, pages=1
- `profit-and-loss-report-format-3-summary-periodwise.pdf` — 2875 bytes, pages=1
- `trial-balance-report-format-2-trial-balance-summary.pdf` — 3409 bytes, pages=1

## Mapping issues (not auto-fixed)

Total issues logged: 68

- **possible_incorrect_mapping** (high): Job House Record List Report Format-1 — Name is Job House Record but linked PDF may be MAWB — verify before use

## Missing references

- Name-only (no URL): 216
- Non-PDF links: 49
- Mapping ambiguous: 55
- Unmapped: 45

See also `FRESA_MISSING_REFERENCES.md` (Phase 1).

## Config safety

- Existing report JSON configurations: **unchanged**
- Report IDs/codes: **unchanged**
- Reference PDF filenames: **unchanged**
- Rendering components: **unchanged**
- Ambiguous mappings: **not auto-resolved**