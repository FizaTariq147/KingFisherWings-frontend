# Fresa reference collection (read-only vs report configs)

**Source of truth:** https://fresatechnologies.com/sample-report-formats/

## Deliverables (also copied to `qa/`)

- `FRESA_REFERENCE_INVENTORY.json` — every catalogue entry + verification status + local PDF path
- `FRESA_REFERENCE_MAPPING.json` — Fresa name/URL → FreightNest registry code (or ambiguous/unmapped)
- `FRESA_MISSING_REFERENCES.md` — unavailable, broken, ambiguous, duplicate, unmapped

## Local PDFs

`pdfs/` holds downloaded original reference PDFs. One file per unique URL.  
**Never** reuse one report’s PDF as another report’s reference.

## Rebuild

```bash
node src/features/reports/qa/fresa-references/buildFresaReferenceInventory.mjs
```

Requires the scraped page text at `FRESA_SCRAPE_PATH` (defaults to the Cursor agent-tools scrape file).

## Rules

This collector does **not** modify report catalogues, layouts, enrichment, or generate paths.
