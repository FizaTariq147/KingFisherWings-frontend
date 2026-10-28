# Fresa registry reconciliation

Generated: 2026-10-28T10:28:47.801Z

## Separate counts (do not interchange)

| Metric | Count | Meaning |
|--------|------:|---------|
| Distinct discovered names | 437 | Fresa page / curated name set |
| Page name scrape | 435 | Raw names from page HTML |
| Unique source URLs on page | 454 | Direct hrefs collected |
| PDF URLs on page | 402 | `.pdf` hrefs |
| XLSX URLs on page | 49 | Spreadsheet hrefs |
| Downloaded references | 403 | Inventory rows with a saved file |
| Unavailable / failed | 344 | No usable download |
| Disk PDF files | 404 | Files under `tmp/fresa-references/pdfs/` |
| Fingerprint OK PDFs | 386 | Usable for visual-diff |
| Fingerprint stub PDFs | 18 | Too small / invalid |
| Unique ref fingerprints | 381 | Distinct reference structures |
| Registry @ HEAD | 816 | Layout defs in last commit |
| Registry current | 816 | Layout defs in working tree |
| Visually verified | 0 | Passed page-image diff |
| Visually failed | 4 | Failed page-image diff |
| Unverified / skipped | 0 | No ref or not yet compared |

## Why the registry changed

Previous 816→702 drop was HAWB (−25) + HBL (−89) store rebuilds to marketing-page-only lists — not leftover purge (leftover stayed 83). Restore script returned HAWB/HBL to HEAD counts while keeping current official Fresa-page layout bodies.

Codes still missing vs HEAD: **0**. Codes added vs HEAD: **0**.

## Destructive scripts

`fresa:fix-shells`, leftover purge, and uniquify are **quarantined** (require `FRESA_ALLOW_DESTRUCTIVE=1`). Do not use shell uniqueness as a success metric.

## Backups

- Git branch: `backup/fresa-pre-registry-recovery-20261028-143245`
- File copy: `tmp/backups/fresa-registry-*`
