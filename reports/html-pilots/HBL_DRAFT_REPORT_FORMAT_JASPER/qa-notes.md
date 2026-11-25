# QA — HBL_DRAFT_REPORT_FORMAT_JASPER

Nothing accepted. PDF generation alone is not acceptance.

## Checklist

- [ ] Page dimensions / orientation match the approved reference (or documented exception)
- [ ] Margins, fonts, spacing, borders, tables reviewed
- [ ] Long values tested
- [ ] Missing / empty values leave blanks (no invented data)
- [ ] Multi-page behavior reviewed where applicable
- [ ] Overlay / difference images inspected
- [ ] Required data and calculations verified against fixture + live record

## Notes

Reference is pinned FRESA HBL Jasper PDF. Generated uses KingFisher fixture data (not FRESA demo parties).

## Artifacts

- Fixture: `fixture.json`
- Generated PDF: `generated.pdf`
- Generated PNG (150 dpi): generated-page-01.png
- Reference PNG (150 dpi): reference-page-01.png
- Diff: Run ImageMagick `compare` locally; not auto-accepted.

## Remaining acceptance gaps

- Visual raster acceptance not claimed.
- Backend payload fixtures for live company data still required (see docs/reports/BACKEND_HTML_PILOT_PLAN.md).
- Do not edit status.json / signoff.csv / thresholds from this pilot work.
