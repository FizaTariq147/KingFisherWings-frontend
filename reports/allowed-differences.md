# Allowed differences from the Fresa reference (PENDING CLIENT CONFIRMATION)
1. Logo image: replaced by the organization's logo in the same box.
2. Letterhead image: replaced by the organization logo and profile text.
3. Company name, address, phone, email, website, registration and tax
   numbers: from the organization profile (class: branding).
4. Live data values: from the open record. Golden tests use the reference's
   demo values and are compared in full.
5. Fresa-identifying text (URLs, phones, "Powered by", demo parties, bank
   details, amounts): omitted or replaced from the profile.
6. Barcodes and QR codes: generated from the bound value with the
   reference's symbology, module width and quiet zone. Golden tests use the
   decoded demo payload and are compared in full.
7. Fonts: where the reference embeds a font, an open metric-compatible font
   replaces its outlines, positioned with the reference advances. Where it
   does not embed a font, the same font name is referenced.
8. Text-ink tolerance T = 0.40. Derived from the Round 8 seed-8 calibration
   set of 20 documents: among documents with non-text ≤ 0.5%, drop the single
   extreme outlier (HBL_DRAFT_REPORT_FORMAT_33 at 1.17), then take the
   ceiling of the remaining maximum (0.3832 → 0.40). Pending client review of
   the calibration crops.
9. Image classes (by box geometry, pending client confirmation):
   - top-band image → letterhead (masked / replaced from profile)
   - narrow tall edge strip, or Fresa artwork → decorative (omitted, masked)
   - small box → logo slot (masked / replaced from profile)
   - barcode or QR → generated from the bound value
   - image covering more than 40% of the page → form_background (verification
     overlay only; never shipped or copied into output)
   - anything else → defect (not masked)
10. Raster pass requires all of: non-text ≤ 0.5% of page pixels, text-ink ≤ T,
    and masked fraction ≤ 25%.
Anything else that differs from the reference is a defect.
