import { z } from 'zod';

/** Document-type buckets for Freightnest report modernization. */
export const reportDocumentTypeSchema = z.enum([
  'shipping',
  'commercial',
  'operational',
  'financial',
  'list',
]);

/** Template family used by specialized React documents (finer than ReportFamily). */
export const reportTemplateFamilySchema = z.enum([
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
  'ops_form',
  'quotation',
  'wms',
  'other',
]);

export const reportSourceSchema = z.enum([
  'fresa_public',
  'fresa_docs',
  'freightnest_module',
  'backend_api',
  'internal_requirement',
]);

export const reportVerificationStatusSchema = z.enum([
  'verified_sample',
  'verified_docs',
  'internal_design',
  'unverified',
]);

export const reportImplementationStatusSchema = z.enum([
  'sample_only',
  'json_legacy',
  'template_v2',
  'pack_bound',
  'analytics_only',
  'missing',
]);

export const reportPageSchema = z.object({
  size: z.enum(['A4', 'Letter']),
  orientation: z.enum(['portrait', 'landscape']),
  marginsMm: z.tuple([z.number(), z.number(), z.number(), z.number()]),
});

export const reportReferenceSchema = z.object({
  samplePdfUrl: z.string().url().optional().nullable(),
  notes: z.string().optional(),
});

/**
 * Modernization metadata layered on the existing 852-code taxonomy.
 * Does not replace ReportTemplateMeta — enrichment only.
 */
export const reportRegistryEnrichmentSchema = z.object({
  code: z.string().min(1),
  templateFamily: reportTemplateFamilySchema,
  documentType: reportDocumentTypeSchema,
  templateType: z.string().min(1),
  category: z.string().min(1),
  source: reportSourceSchema,
  verificationStatus: reportVerificationStatusSchema,
  implementationStatus: reportImplementationStatusSchema,
  reference: reportReferenceSchema.optional(),
  page: reportPageSchema,
  dataMappingKey: z.string().min(1),
  rendererKeyHint: z.string().optional(),
  /** Never true unless verificationStatus is verified_sample or verified_docs. */
  claimsFresaExactMatch: z.boolean().default(false),
});

export type ReportDocumentType = z.infer<typeof reportDocumentTypeSchema>;
export type ReportTemplateFamily = z.infer<typeof reportTemplateFamilySchema>;
export type ReportSource = z.infer<typeof reportSourceSchema>;
export type ReportVerificationStatus = z.infer<typeof reportVerificationStatusSchema>;
export type ReportImplementationStatus = z.infer<typeof reportImplementationStatusSchema>;
export type ReportRegistryEnrichment = z.infer<typeof reportRegistryEnrichmentSchema>;

export function assertNoFalseFresaClaim(row: ReportRegistryEnrichment): void {
  if (
    row.claimsFresaExactMatch &&
    row.verificationStatus !== 'verified_sample' &&
    row.verificationStatus !== 'verified_docs'
  ) {
    throw new Error(
      `Report ${row.code}: claimsFresaExactMatch requires verified_sample or verified_docs`,
    );
  }
}
