# Phase 1 release notes

Nothing in this release is accepted. No threshold, mask, status value, or sign-off row was changed. The classic invoice generator is unchanged.

## What ships

The v2 invoice renderer stays behind `VITE_REPORTS_ENGINE`. With the engine left at its default, `legacy`, Generate PDF is the classic invoice. Credit notes, debit notes, and quotations stay on the classic generator.

The release set is taken from `reports/invoice-v2/suitability-matrix.md`. The code list is a placeholder:

- (placeholder — release owner fills the codes)

A code in that list is still not accepted. The catalogue badge stays "approximate, not final" until sign-off says otherwise.

## Turning v2 on and off

| Environment | `VITE_REPORTS_ENGINE` | Result |
|---|---|---|
| Off (default) | unset or `legacy` | Classic Generate PDF. v2 is not used. |
| On | `v2` | Reports and Formats can draw a v2 invoice spec. Generate PDF uses v2 only when `defaultPdfStyle` is an explicit report code. |

`reports.engine` is not a stored field. The value is the environment variable only.

Catalogue gating is a second switch, `VITE_REPORTS_GATE`:

| Value | Result |
|---|---|
| unset or `soft` (default) | A v2 invoice code can be previewed and generated while it is not accepted. The badge says "approximate, not final". |
| `hard` | A v2 invoice code is previewed and generated only when its status is `accepted`. Otherwise the catalogue says "format not available yet" and Generate stays off for that code. Browse still opens the entry. |

No code is accepted, so `hard` withholds all 26 v2 invoice codes. Soft remains the default.

## Fallback

If a selected v2 invoice throws while it is being built, Generate PDF returns the classic PDF and shows: "Showing the classic invoice. The selected format could not be built."

A hard-gated code that is not accepted is not attempted. Generate stays on classic and does not show that failure notice.

## Manual staging test

1. Deploy with `VITE_REPORTS_ENGINE` unset. Open an invoice and use Generate PDF. The file is the classic invoice.
2. Set `VITE_REPORTS_ENGINE=v2` and leave `VITE_REPORTS_GATE` unset. Open Formats for an invoice. A v2 code in the placeholder list above shows "approximate, not final" and can be previewed.
3. Force the preview to fail (stop the dev renderer, or pick a code whose spec cannot be built). The screen shows the classic invoice and the notice in Fallback.
4. Set `VITE_REPORTS_GATE=hard` on a staging build where no invoice code is accepted. The same code shows "format not available yet" and Generate does not run v2.
5. Do not mark a code accepted from this checklist. Sign-off stays a separate step.
