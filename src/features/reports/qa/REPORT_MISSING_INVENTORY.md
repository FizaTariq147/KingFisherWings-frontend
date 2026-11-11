# REPORT_MISSING_INVENTORY — Reports beyond public Fresa samples

**Phase:** 6  
**Rule:** Do not invent implementations. Classify candidates only.

## Classification legend

- **Verified Fresa reference** — CDN sample URL or verified public sample page entry  
- **Official documentation reference** — named in Fresa docs / registry with docs intent  
- **Internal business requirement** — Freightnest module / ops need; may lack public sample  
- **Inferred candidate** — suggested by pack keys / modules; needs product confirmation  
- **Pending confirmation** — listed but coverage unclear  

## Catalogue gaps (registered, weak layout object)

| Candidate | Classification | Notes |
|-----------|----------------|-------|
| HAWB Draft Format-3…27 | Internal business requirement | Registry present; intentional shared draft sample (`sampleIsFallback`) |
| Arrival Notice Format-11…35 | Internal business requirement | Registry `hasClientLayout: true` but **no JSON and no alias** — false coverage |
| HBL Draft Format-21+ extras | Internal business requirement | Intentional alias to Format-11 via getter |
| MAWB_* (17 codes) | Official documentation reference / inferred | Pack `air.mawb_draft`; no dedicated MAWB template |
| FG_HBL_ORIGINAL_FORMAT_87 | Verified Fresa reference (sample) | Pack key still `sea.hbl_draft` in registry |

## Module / pack inferred (not new FE implementations)

| Candidate | Classification | Evidence |
|-----------|----------------|----------|
| sea.booking_confirmation | Inferred candidate | Registry pack histogram |
| sea.pre_alert | Inferred candidate | Registry pack histogram |
| wms.asn_location / wms.asn_summary | Pending confirmation | In FE allow-list; registry collapses to `wms.asn` |
| commercial.invoice_shell | Pending confirmation | Allow-list only; registry uses `invoice_generic` |
| Purchase invoice / debit / credit distinct faces | Internal business requirement | Packs exist; FE mostly invoice DNA |
| GL ledger Dr/Cr print | Internal business requirement | Analytics hubs exist; catalogue finance JSON generic |
| Cargo manifest landscape product pack | Official / backend_api | Pack key present; FE template-v2 landscape exists |

## Orphan JSON (in layout store, not in 852 registry)

| Code | Store | Classification |
|------|-------|----------------|
| FG_HBL_FORMAT_10 / 14 / 16 / 20 | hblFormatUiLayouts | Pending confirmation — layout without registry row |
| CARGO_ARRIVAL_NOTICE_REPORT_FORMAT_1 | arrivalNoticeFormatUiLayouts | Pending confirmation |
| DELIVERY_ORDER_REPORT_FORMAT_1 | deliveryOrderFormatUiLayouts | Pending confirmation |

## Explicit non-actions

- Do not add new report implementations from this list in Phase 6.  
- Do not claim Fresa-identical for `internal_design` / `sampleIsFallback` codes.  
- Prefer fixing arrival Format-11+ **alias or hasClientLayout honesty** over inventing 25 layouts.
