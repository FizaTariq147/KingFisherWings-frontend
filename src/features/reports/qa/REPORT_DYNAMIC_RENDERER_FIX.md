# Dynamic Renderer Fix

**Date:** 2026-11-14

## Root cause (identical layouts)

1. HAWB Format-3…N shared one sample PDF + one JSON shell.
2. Entity-bound HAWB forced template-v2 early (`supportsTemplateV2('hawb')`), skipping distinct `hawbAwbShell` variants.
3. Classic HBL families ignored registered logo (looked like the same KF chrome on every PDF).

## Fixes implemented

| Change | Effect |
| --- | --- |
| `listHawbFormats()` = 5 official only | UI no longer lists 25 identical extras |
| Catalogue HAWB filter via `shouldExposeHawbInPrimaryCatalogue` | Main list matches strip |
| Skip early template-v2 for official HAWB JSON | Live data uses `draft`/`draft1`/`draft2`/`original1`/`original2` shells |
| `HawbFormatAutoPdf` `preferTemplateV2: false` | Same |
| Classic BL uses `model.logoUrl` | Branding no longer identical KF asset |

## Distinctness evidence

- Unit: five official HAWB layouts → five distinct `hawbAwbShell.variant` values.
- Reference PDFs: local Fresa samples have different MediaBoxes / text lengths (see `visual-evidence/reference-pdf-fingerprints.json`).
- HBL Jasper pilot remains on its own code/layout (not HKG alias).

## Honesty

Many non-official HBL Format-N codes still share JSON shells by design (Phase 2). They are not re-invented here. Official HAWB path is the corrected distinctness path.
