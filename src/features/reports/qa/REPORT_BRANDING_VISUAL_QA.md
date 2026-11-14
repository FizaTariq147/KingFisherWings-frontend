# Report Branding Visual QA

**Date:** 2026-11-14  
**Method:** Code-path verification + unit tests + prior HBL Jasper reference QA.  
**Note:** Interactive multi-family PDF pixel review in a live browser session was not executed in this pass; branding behavior is verified via chrome resolver tests and wiring.

## Representative formats

| Family | Code / path | Branding path | Status |
| --- | --- | --- | --- |
| HBL Jasper pilot | `HBL_DRAFT_REPORT_FORMAT_JASPER` | Org chrome → `logoUrl`/`companyName` → `HblJasperPilotDocument` | Wired; prior FRESA-REF-0001 layout QA PASS |
| HAWB (official only) | `HAWB_DRAFT_REPORT_FORMAT_1` | Org chrome → Generate/AutoPdf → template-v2 / sample stamp | Wired; official reference exists |
| Invoice | JSON layout via `applySharedLayoutChrome` | Org chrome overrides layout branding | Wired |
| Arrival notice | AutoPdf + catalogue layout | Org chrome merge + `logoUrl` | Wired |
| Delivery order | AutoPdf + catalogue layout | Org chrome merge + `logoUrl` | Wired |
| Operational / other | Generate panel shared merge | Org chrome + pack parameters | Wired |

## Checks

| Check | Result |
| --- | --- |
| Registered company logo used when `logo_url` set | PASS (unit) |
| Registered display/legal name used | PASS (unit) |
| Changing chrome changes branding | PASS (unit) |
| Missing logo → no invented placeholder img | PASS (unit) |
| Missing company name → blank, not KingFisher Wings | PASS (unit) |
| Missing profile → empty chrome, no Dubai fabrication | PASS (unit) |
| HBL Jasper pilot still functional | PASS (unit + prior pilot tests) |
| Unsupported HAWB Format-3+ not classified official | PASS (governance unit) |
| Stable report codes unchanged | PASS (no ID renames) |
| Sample stamp omits fabricated company name | PASS (code review) |

## Manual follow-up (recommended after approval)

1. Log in with org profile logo + display name set; open Jasper pilot, HAWB Format-1, one invoice, arrival, DO.
2. Confirm header logo aspect ratio and PDF download match preview.
3. Clear `logo_url`; confirm headers render text-only without broken image icons.
4. Confirm Format-3 HAWB still opens (preserved) until hide-filter approved.
