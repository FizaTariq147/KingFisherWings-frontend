import type { ReportTemplateMeta } from '../types/reportCatalog.types';
import { getHblFormatSpec } from '../constants/hblFormatCatalog';
import { getHawbFormatSpec } from '../constants/hawbFormatCatalog';
import {
  assertNoFalseFresaClaim,
  reportRegistryEnrichmentSchema,
  type ReportDocumentType,
  type ReportImplementationStatus,
  type ReportRegistryEnrichment,
  type ReportSource,
  type ReportTemplateFamily,
  type ReportVerificationStatus,
} from './reportRegistry.schema';

function pagePortraitA4() {
  return { size: 'A4' as const, orientation: 'portrait' as const, marginsMm: [12, 12, 12, 12] as [number, number, number, number] };
}

function pageLandscapeA4() {
  return { size: 'A4' as const, orientation: 'landscape' as const, marginsMm: [10, 10, 10, 10] as [number, number, number, number] };
}

function classifyTemplateFamily(meta: ReportTemplateMeta): ReportTemplateFamily {
  const c = meta.code.toUpperCase();
  if (/^HBL_|^FG_HBL_/i.test(c) || /HBL/i.test(c)) return 'hbl';
  if (/^HAWB_/i.test(c)) return 'hawb';
  if (/^MAWB_/i.test(c)) return 'mawb';
  if (/ARRIVAL_NOTICE|CARGO_ARRIVAL/i.test(c)) return 'arrival_notice';
  if (/DELIVERY_ORDER|DELIVERY_NOTE|PROOF_OF_DELIVERY/i.test(c)) return 'delivery_order';
  if (/CARGO_MANIFEST|MANIFEST/i.test(c)) return 'cargo_manifest';
  if (/PURCHASE_INVOICE/i.test(c)) return 'purchase_invoice';
  if (/^INVOICE_|PROFORMA_|DEBIT_NOTE_|CREDIT_NOTE_/i.test(c)) return 'invoice';
  if (/JOURNAL_VOUCHER|PAYMENT_VOUCHER|RECEIPT_VOUCHER/i.test(c)) return 'voucher';
  if (/LEDGER|STATEMENT_OF_ACCOUNTS|AGING|TRIAL_BALANCE|PROFIT_AND_LOSS/i.test(c)) {
    return /LEDGER|STATEMENT_OF_ACCOUNTS|AGING/i.test(c) ? 'ledger' : 'financial_statement';
  }
  if (meta.family === 'ops_list' || /LIST_REPORT|DAILY_STATUS/i.test(c)) return 'ops_list';
  if (meta.family === 'quotation' || /^QUOTATION_/i.test(c)) return 'quotation';
  if (meta.family === 'wms' || /^WMS_|ADVANCE_SHIPPING/i.test(c)) return 'wms';
  if (/BOOKING_CONFIRMATION|PRE_ALERT|STUFFING/i.test(c)) return 'ops_form';
  return 'other';
}

function documentTypeFor(family: ReportTemplateFamily): ReportDocumentType {
  switch (family) {
    case 'hbl':
    case 'hawb':
    case 'mawb':
    case 'arrival_notice':
    case 'delivery_order':
    case 'cargo_manifest':
      return 'shipping';
    case 'invoice':
    case 'purchase_invoice':
    case 'quotation':
      return 'commercial';
    case 'voucher':
    case 'ledger':
    case 'financial_statement':
      return 'financial';
    case 'ops_list':
      return 'list';
    case 'ops_form':
    case 'wms':
      return 'operational';
    default:
      return 'operational';
  }
}

function templateTypeFor(meta: ReportTemplateMeta, family: ReportTemplateFamily): string {
  const c = meta.code.toUpperCase();
  if (family === 'hbl') {
    const variant = getHblFormatSpec(c)?.variant || 'combined';
    return `hbl.${variant}`;
  }
  if (family === 'hawb') {
    const kind = getHawbFormatSpec(c)?.kind || 'hawb_draft';
    return `hawb.${kind}`;
  }
  if (family === 'mawb') return 'mawb.standard';
  if (family === 'purchase_invoice') return 'invoice.purchase';
  if (family === 'invoice' && /TAX_INVOICE_INDIA/i.test(c)) return 'invoice.tax_india';
  if (family === 'invoice') return 'invoice.commercial';
  if (family === 'arrival_notice') return 'arrival_notice.standard';
  if (family === 'delivery_order') return 'delivery_order.release';
  if (family === 'cargo_manifest') return 'cargo_manifest.dense';
  if (family === 'voucher') return 'voucher.standard';
  if (family === 'ledger') return 'ledger.chronological';
  if (family === 'financial_statement') return 'financial_statement.standard';
  if (family === 'ops_list') return 'ops_list.dense';
  if (family === 'quotation') return 'quotation.standard';
  if (family === 'wms') return 'wms.asn';
  if (family === 'ops_form') return 'ops_form.standard';
  return `other.${meta.family}`;
}

function sourceFor(meta: ReportTemplateMeta, family: ReportTemplateFamily): ReportSource {
  const hbl = getHblFormatSpec(meta.code);
  const hawb = getHawbFormatSpec(meta.code);
  if (hbl?.samplePdfUrl || (hawb?.samplePdfUrl && !hawb.sampleIsFallback)) {
    return 'fresa_public';
  }
  if (hawb?.sampleIsFallback) return 'internal_requirement';
  if (meta.existingPath) return 'freightnest_module';
  if (meta.suggestedPackKey) return 'backend_api';
  if (family === 'ops_list' || family === 'wms') return 'freightnest_module';
  return 'internal_requirement';
}

function verificationFor(
  meta: ReportTemplateMeta,
  family: ReportTemplateFamily,
): ReportVerificationStatus {
  const hbl = getHblFormatSpec(meta.code);
  const hawb = getHawbFormatSpec(meta.code);
  if (hbl?.samplePdfUrl) return 'verified_sample';
  if (hawb?.samplePdfUrl && !hawb.sampleIsFallback) return 'verified_sample';
  if (meta.gapStatus === 'covered_analytics') return 'verified_docs';
  if (family === 'hawb' && hawb?.sampleIsFallback) return 'internal_design';
  if (!meta.hasClientLayout && meta.gapStatus === 'covered_document_pdf') return 'unverified';
  return meta.hasClientLayout ? 'internal_design' : 'unverified';
}

const TEMPLATE_V2_FAMILIES = new Set([
  'hbl',
  'hawb',
  'mawb',
  'invoice',
  'purchase_invoice',
  'arrival_notice',
  'delivery_order',
  'cargo_manifest',
  'voucher',
  'ledger',
  'financial_statement',
  'ops_list',
  'quotation',
]);

function implementationFor(
  meta: ReportTemplateMeta,
  family: ReportTemplateFamily,
): ReportImplementationStatus {
  if (meta.gapStatus === 'covered_analytics') return 'analytics_only';
  const hbl = getHblFormatSpec(meta.code);
  const hawb = getHawbFormatSpec(meta.code);
  if (hbl?.samplePdfUrl || (hawb?.samplePdfUrl && !hawb.sampleIsFallback)) {
    return 'sample_only';
  }
  if (TEMPLATE_V2_FAMILIES.has(family)) return 'template_v2';
  if (meta.hasClientLayout) return 'json_legacy';
  if (meta.suggestedPackKey) return 'pack_bound';
  return 'missing';
}

function dataMappingKeyFor(family: ReportTemplateFamily): string {
  switch (family) {
    case 'hbl':
      return 'job.hbl';
    case 'hawb':
    case 'mawb':
      return 'job.hawb';
    case 'invoice':
    case 'purchase_invoice':
      return 'invoice.commercial';
    case 'arrival_notice':
      return 'job.arrival_notice';
    case 'delivery_order':
      return 'job.delivery_order';
    case 'cargo_manifest':
      return 'job.manifest';
    case 'voucher':
      return 'finance.voucher';
    case 'ledger':
    case 'financial_statement':
      return 'finance.ledger';
    case 'ops_list':
      return 'ops.list';
    case 'quotation':
      return 'quotation.standard';
    case 'wms':
      return 'wms.document';
    default:
      return 'generic.document';
  }
}

/** Build enrichment metadata for one registry row (validated). */
export function enrichReportMeta(meta: ReportTemplateMeta): ReportRegistryEnrichment {
  const templateFamily = classifyTemplateFamily(meta);
  const hbl = getHblFormatSpec(meta.code);
  const hawb = getHawbFormatSpec(meta.code);
  const sampleUrl = hbl?.samplePdfUrl || hawb?.samplePdfUrl || null;
  const verificationStatus = verificationFor(meta, templateFamily);

  const row: ReportRegistryEnrichment = {
    code: meta.code,
    templateFamily,
    documentType: documentTypeFor(templateFamily),
    templateType: templateTypeFor(meta, templateFamily),
    category: meta.family,
    source: sourceFor(meta, templateFamily),
    verificationStatus,
    implementationStatus: implementationFor(meta, templateFamily),
    reference: sampleUrl
      ? {
          samplePdfUrl: sampleUrl,
          notes: hawb?.sampleIsFallback
            ? 'Closest Fresa CDN sample; no distinct public file for this code'
            : undefined,
        }
      : undefined,
    page:
      templateFamily === 'cargo_manifest' || templateFamily === 'ops_list'
        ? pageLandscapeA4()
        : pagePortraitA4(),
    dataMappingKey: dataMappingKeyFor(templateFamily),
    rendererKeyHint: meta.suggestedPackKey,
    claimsFresaExactMatch:
      verificationStatus === 'verified_sample' || verificationStatus === 'verified_docs',
  };

  const parsed = reportRegistryEnrichmentSchema.parse(row);
  assertNoFalseFresaClaim(parsed);
  return parsed;
}
