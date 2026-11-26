# Phase 0.5 — Barcode / QR Usage Audit

**Mode:** Audit only. Do **not** add QR/barcode to formats that do not require them.

---

## 1. Packages

| Package | Installed | Imported in report PDF drawers? |
|---|---|---|
| `jsbarcode` ^3.12.3 | **Yes** (`package.json`) | **Yes** — `templates/referenceAccurate/code128Vector.ts`; also `features/jobs/components/Code128Barcode.tsx` (jobs UI, not catalogue measured) |
| `qrcode` ^1.5.4 | **Yes** | **No** — repo-wide `src/**/*.{ts,tsx}` import search returned **zero** `qrcode` / `QRCode` matches |

---

## 2. How barcodes are drawn in PDFs

| Path | Mechanism | Functions |
|---|---|---|
| Measured faces | JsBarcode → binary module string → pdf-lib black rectangles | `code128BitString` → `drawMeasuredBarcode` in `generateOfficialMeasuredPdf.ts` when `branding.slots.barcode` set |
| Reference-accurate | Same bitstring → `drawCode128` | `drawReferenceForm.ts` |
| Jobs label UI | SVG via JsBarcode | `Code128Barcode.tsx` / `scannableBarcode.ts` |

Generation **works** in the measured/reference-accurate workflow when a barcode box + payload exist (covered by `referenceAccurate.layout.test.ts`, `hblHkLetterhead.test.ts`).

---

## 3. Which formats have barcode **slots** (measured branding)

Parsed `brandingSlots.generated.ts` (**392** entries):

| With non-null `barcode` box | **5** |
| Codes | `FG_HBL_HKG`, `HBL_DRAFT_REPORT_FORMAT_29`, `HBL_DRAFT_REPORT_FORMAT_6`, `HBL_DRAFT_REPORT_FORMAT_72`, `HBL_DRAFT_REPORT_FORMAT_JASPER` |

**Inferred:** Other HBL/measured codes may still show leftover **sample barcode graphics** from pin geometry without a live `slots.barcode` redraw (PROGRESS historically called this out). That is geometry inheritance, not JsBarcode usage.

Reference-accurate pilots may define barcode boxes independently of brandingSlots.

---

## 4. Formats that **require** barcodes / QR (evidence-based)

| Requirement | Evidence | Label |
|---|---|---|
| Live CODE128 on listed HBL branding slots | brandingSlots + drawer code | **Verified** need when generating those codes with payload |
| `BARCODE_AWB_REPORT_FORMAT` | In registry; manifest `needs_manual` (scanned pin) | **Requires human/spec** — not a working measured barcode redraw today |
| QR on any catalogue report | No imports; no drawer calls | **No verified requirement implemented** |
| HAWB official five | No branding barcode slots in the five; IATA face uses text AWB strips | **Do not add** QR/barcode without pin evidence |

---

## 5. Recommendations (no implementation)

1. Keep `qrcode` unused until a pin/spec explicitly needs QR.  
2. Do not blanket-enable barcodes on all measured faces.  
3. When refreshing branding enrich, only emit `barcode` boxes where Fresa pins have barcode geometry.  
4. Treat `BARCODE_AWB_REPORT_FORMAT` as a dedicated needs_manual track.

---

## 6. Labels summary

| Finding | Label |
|---|---|
| jsbarcode used for CODE128 in measured/reference-accurate | **Verified** |
| qrcode unused in report drawers | **Verified** |
| Exactly 5 brandingSlots with barcode object (parser) | **Verified** (regex parse of generated file) |
| Every HBL needs live barcode | **Unresolved / false** — only slotted codes redraw |
