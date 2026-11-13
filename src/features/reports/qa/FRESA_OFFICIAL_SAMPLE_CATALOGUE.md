# Fresa official sample catalogue

**Source:** [Sample Report Formats](https://fresatechnologies.com/sample-report-formats/)  
**FE store:** [`data/fresaOfficialSampleCatalogue.ts`](../data/fresaOfficialSampleCatalogue.ts)

## Important

Catalogue **entry counts are not unique layout designs**. Keep name, PDF URL, `pageCount` (null until inspected), and verification status. Do not invent JSON layouts from the 401 listed entries.

## Section inventory

| Section | Listed entries | Direct PDF URLs in FE | Status |
|---------|----------------|----------------------|--------|
| Invoice Formats | 116 | 0 | `pending_url_extraction` |
| Accounts other Formats | 27 | 0 | `pending_url_extraction` |
| Arrival Notice | 35 | 0 | `pending_url_extraction` |
| HBL | 113 | (partial via `hblFormatCatalog`) | `pending_url_extraction` (full page reconcile later) |
| HAWB | 5 | 5 | `url_verified` |
| Delivery order | 43 | 40 verified (+ 3 cross-listed) | `url_verified` |
| WMS, ASN | 5 | 5 | `url_verified` |
| Other Reports | 57 | 0 | `pending_url_extraction` |
| **Total** | **401** | **50** direct verified in this pass | |

## Product generate path

1. Unbound browse + verified sample → CDN stamp (`generateCatalogOfficialSamplePdf` / HBL/HAWB helpers)
2. Entity-bound + pack → `POST /reports/generate`
3. Entity-bound + no pack → template-v2 (no Fresa-exact claim)
4. JSON → Dev/offline only

Entity-bound must never substitute a CDN sample.

## Next extraction pass

Invoice, Accounts, Arrival Notice, HBL (full reconcile), Other Reports — extract direct PDF URLs into the same reference store; set `pageCount` only after PDF inspection.
