import { getHblFormatSpec } from '../constants/hblFormatCatalog';
import { getHawbFormatSpec } from '../constants/hawbFormatCatalog';
import { HBL_OFFICIAL_CATALOG } from '../constants/hblOfficialCatalog.generated.ts';

/**
 * Extra `parameters` merged into POST /reports/generate.
 *
 * Backend contract (aligned to current reports module):
 * - First-class: request `code` / `template_id`, pack via bound `renderer_key`
 *   (`sea.hbl_draft` | `sea.hbl_original` | `air.hawb_draft` | `air.hawb_final`, …).
 * - Many catalogue codes share one pack shell (HBL_FORM / HAWB_FORM) — not per-Jasper layouts.
 * - Soft hints below are optional; BE may ignore until HBL_FORM/HAWB_FORM grow variants.
 * - Do not invent a first-class `format_code` field — use `template_code` (mirrors request code).
 */
export function buildFresaPackGenerateParams(code: string): Record<string, unknown> {
  const needle = code.trim().toUpperCase();
  const params: Record<string, unknown> = {
    template_code: needle,
  };

  const hbl = getHblFormatSpec(needle);
  if (hbl) {
    const official = HBL_OFFICIAL_CATALOG.find((r) => r.code.toUpperCase() === needle);
    const isOriginal = /ORIGINAL/i.test(needle) || /ORIGINAL/i.test(hbl.name);
    params.document_kind = isOriginal ? 'hbl_original' : 'hbl_draft';
    params.template_variant = hbl.variant || official?.variant || 'combined';
    params.hbl_family = hbl.hblFamily || official?.hblFamily || 'jasper';
    if (hbl.samplePdfUrl) params.sample_pdf_url = hbl.samplePdfUrl;
    return params;
  }

  const hawb = getHawbFormatSpec(needle);
  if (hawb) {
    const isFinal =
      /ORIGINAL|FINAL|PRE_PRINTED/i.test(needle) ||
      hawb.kind === 'hawb_original_pre_printed_1' ||
      hawb.kind === 'hawb_original_pre_printed_2';
    params.document_kind = isFinal ? 'hawb_final' : 'hawb_draft';
    params.template_variant =
      hawb.kind === 'hawb_draft'
        ? 'draft'
        : hawb.kind === 'hawb_draft_format_1'
          ? 'draft1'
          : hawb.kind === 'hawb_draft_format_2'
            ? 'draft2'
            : hawb.kind === 'hawb_original_pre_printed_1'
              ? 'original1'
              : hawb.kind === 'hawb_original_pre_printed_2'
                ? 'original2'
                : hawb.kind;
    if (hawb.samplePdfUrl) params.sample_pdf_url = hawb.samplePdfUrl;
    return params;
  }

  if (/^INVOICE_REPORT_FORMAT_/i.test(needle)) {
    params.document_kind = 'invoice';
    params.template_variant = needle;
    return params;
  }

  return params;
}

/**
 * Preferred live renderer_key family for HBL/HAWB.
 * Matches BE IMPLEMENTED_RENDERER_KEYS: sea.hbl_* / air.hawb_draft|hawb_final.
 */
export function preferredHblHawbPackKeyHint(
  code: string,
): 'hbl_original' | 'hbl_draft' | 'hawb_final' | 'hawb_draft' | null {
  const c = code.trim().toUpperCase();
  if (/^HBL_|^FG_HBL_/i.test(c) || /HBL/i.test(c)) {
    return /ORIGINAL/i.test(c) ? 'hbl_original' : 'hbl_draft';
  }
  if (/^HAWB_/i.test(c)) {
    return /ORIGINAL|FINAL|PRE_PRINTED/i.test(c) ? 'hawb_final' : 'hawb_draft';
  }
  return null;
}
