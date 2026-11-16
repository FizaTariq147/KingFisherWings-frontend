# Report Reference Comparison

**Date:** 2026-11-16  
**Mode:** Read-only  
**Official source:** https://fresatechnologies.com/sample-report-formats/  
**Local PDFs:** `src/features/reports/qa/fresa-references/pdfs/`  
**Probe data:** `qa/visual-evidence/reference-comparison-probe.json`

**Honesty rule:** Comparison describes **Fresa reference structure** vs **Freightnest client implementation capability**. Sample-browse of Fresa PDFs is not counted as “we implemented the layout.”

---

## Method

1. Inspect local Fresa reference PDFs with pdfjs (page count, MediaBox, orientation, key labels).  
2. Map each representative to Freightnest code + render path.  
3. Score visual fidelity of **regenerated** client output (JSON / template-v2 / Jasper pilot), not stamped sample alone.

Fidelity scale:

| Score | Meaning |
| --- | --- |
| **High** | Structure closely matches reference; minor spacing/font gaps |
| **Medium** | Same document family; section/table differences |
| **Low** | Shared shell / color-only / wrong page geometry |
| **Sample-only** | Browse shows Fresa PDF; regenerated path not reference-faithful |
| **Unverified** | No adequate local reference or not inspected |

---

## 1. HAWB (official five)

### HAWB Draft (`HAWB_DRAFT_REPORT_FORMAT`)

| Aspect | Reference | Freightnest regenerated path |
| --- | --- | --- |
| File | `hawb-draft-report-format.pdf` | `HawbAwbShell` variant `draft` / sample browse |
| Pages | 1 | Often 1 + T&C append |
| Size | **595×845** portrait (not exact A4 height) | Capture often 210×297 mm A4 |
| Header | IATA “HOUSE AIR WAYBILL” grid | Shell approximates; template-v2 does not |
| Parties | Shipper / Consignee / Agent city | Present in shell |
| Table | Pieces / weight / rate / nature grid | Present in shell; column fidelity medium |
| Footer / signatures | Shipper + carrier signature blocks | Present |
| Branding | Fresa demo parties in sample | Must stamp **org profile**, never Fresa as company |

**Verdict:** Sample-only when browsing; JSON shell **medium** vs reference; template-v2 **low**.

### HAWB Draft-1 (`…_FORMAT_1`)

| Aspect | Reference |
| --- | --- |
| File | `hawb-draft-report-format-1.pdf` |
| Pages | **9** (multi-page + copies) |
| Size | 595×842 |
| Distinct | **Notify party** block; HAWB NO. prominence |

**Gap:** Client rarely reproduces 9-page copy set; overflow/pagination **low**.

### HAWB Draft-2 (`…_FORMAT_2`)

| Aspect | Reference |
| --- | --- |
| Title mode | **Air Waybill** (not only House) |
| Customs value | N.C.V style differences |
| Size | 595×845 |

Shell variant `draft2` encodes title/customs differences — **better than color-only**.

### HAWB Original-1 (`…_ORIGINAL_…_1`)

| Aspect | Reference |
| --- | --- |
| Size | **737×923** (preprinted form) |
| Text | Sparse (image-heavy preprinted face) |
| Labels | Weak text extraction |

**Gap:** A4 capture destroys MediaBox fidelity. **Critical** for preprinted originals.

### HAWB Original-2 (`…_ORIGINAL_…_2`)

| Aspect | Reference |
| --- | --- |
| Size | 595×845 |
| Text | Sparse overlay on form |

---

## 2. HBL

### HBL Jasper (`HBL_DRAFT_REPORT_FORMAT_JASPER`) — FRESA-REF-0001

| Aspect | Reference `hbl-draft-report-fomat-jasper.pdf` | Pilot |
| --- | --- | --- |
| Size | 595×842 portrait | Aimed A4 |
| Header | BL title “not negotiable unless…” | Config-driven |
| Parties | Shipper / Consignee / Notify | Yes |
| Center | BL No. / F/Agent | Yes |
| Cargo table | Marks / pkgs / description / weight / measurement | Yes |
| Watermark | DRAFT | Yes |
| Signature | Carrier / place-date | Yes |

**Verdict:** Best HBL client path — **medium–high** structural; not pixel-perfect. Branding = org profile.

### HBL Format-11 (`HBL_DRAFT_REPORT_FORMAT_11`)

| Aspect | Reference `hbl-draft-report-format-11.pdf` |
| --- | --- |
| Size | 595×842 |
| Family | Combined / port-to-port style BL |

**Risk:** Becomes dump shell for many `HBL_DRAFT_REPORT_FORMAT_N` → catalogue looks identical.

---

## 3. Invoice

| Reference | Size | Notes vs client JSON |
| --- | --- | --- |
| `invoice-report-format-1-tax-invoice-india.pdf` | 594×842 | Tax blocks, India-specific hierarchy |
| `invoice-report-format-10-standard-invoice.pdf` | 595×842 | Standard commercial |
| `invoice-report-format-17-invoice-jasper.pdf` | 595×842 | Jasper commercial face |

**Client:** 82 JSON layouts share painter DNA → **medium** at best for named formats; many look like restyled charge tables.  
**Missing vs refs:** Exact tax grids, preprinted variants (12/16), Arabic RTL (format-8), warehouse-specific (21).

---

## 4. Arrival Notice

| Reference | Size | Distinct traits |
| --- | --- | --- |
| `arrival-notice-report-format-1-cargo-arrival-notice-jasper.pdf` | 595×842 | Jasper cargo AN |
| `arrival-notice-report-format-4-arrival-notice-usa.pdf` | 595×842 | USA layout |
| Formats 5–10 sea / Vietnam variants | portrait | Charge inclusion differences |

**Client gap:** Bare Format-N → Jasper-1 shell; USA/sea variants not independently realized. template-v2 preferred → **low–medium**.

---

## 5. Delivery Order

| Reference | Size | Notes |
| --- | --- | --- |
| `delivery_order_format_17_rpm_ref_1496.pdf` | 594×842 | Canonical fallback shell |
| `fg_delivery_order_sea_format1_rpm_ref_538.pdf` | 595×842 | Sea-specific; Notify; page markers |
| Many `fg_delivery_order_*` | portrait | Air/sea/trucker/e-DO variants |

**Client gap:** Alias to Format-17 flattens sea/air/USA/trucker diversity → **low** for most DO codes; Format-17 itself **medium** if sample used.

---

## 6. Cargo Manifest / operational

| Reference | Size | Orientation |
| --- | --- | --- |
| `shipment-freight-manifest-report-format.pdf` | 791×611 | **Landscape** |
| `daily-status-report-format-1.pdf` | 792×612 | **Landscape** |
| `job-card-report-format.pdf` | 594×842 | Portrait |
| `mawb-draft-report-format-1.pdf` | 595×845 | Portrait IATA-like |

**Client gap:** Landscape refs frequently forced into portrait A4 ops templates → **low**. Manifest must not be counted as HAWB.

---

## 7. Cross-cutting reference requirements

| Requirement | Fresa refs show | Client debt |
| --- | --- | --- |
| Page dimensions | A4, near-A4 845pt, 737×923, landscape letter | Mostly fixed A4 capture |
| Header | Document-type specific grids | Shared BrandHeader / DocPageChrome |
| Tables | Fixed column widths, dense rules | Flexible React tables |
| Typography | Small legal + bold titles | Browser fonts via canvas |
| Footer | Signatures, page X/Y, carrier clauses | Incomplete / colliding |
| Multi-page | HAWB draft-1 = 9 pages | Weak |
| Branding | Demo parties in samples | Must replace with org profile only |

---

## 8. Per-family fidelity summary

| Family | Browse sample fidelity | Regenerated fidelity | Blocking issue |
| --- | --- | --- | --- |
| HAWB official 5 | High (is the PDF) | Medium (shells) / Low (v2) | MediaBox + multi-page |
| HBL Jasper | High sample / Medium pilot | Medium–High pilot | Pixel polish |
| HBL Format-N | Medium sample if distinct URL | Low (aliases) | Format-11 dump |
| Invoice | Medium sample | Medium shared DNA | Per-format tax/structure |
| Arrival | Medium sample | Low–Medium | Jasper-1 alias |
| DO | Medium–High if verified sample | Low if Format-17 alias | Variant collapse |
| Manifest / daily | High sample | Low | Landscape |

---

## 9. Do not claim implemented

A format is **not** implemented for fidelity when:

- Only a registry row exists  
- Only a JSON alias to another code exists  
- Only template-v2 accent differs  
- Only catalogue preview shows the stamped Fresa sample  

Claim fidelity only with side-by-side page evidence of **Freightnest-generated** PDF vs reference.
