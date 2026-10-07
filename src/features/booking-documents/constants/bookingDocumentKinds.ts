/** Mandatory booking docs enforced on submit/complete (portal + staff mode forms). */
export const MANDATORY_BOOKING_DOCUMENT_KINDS = [
  'commercial_invoice',
  'packing_list',
  'licence',
  'uat_tax_certificate',
] as const;

/** Optional on portal + staff booking forms (not required for submit/complete). */
export const OPTIONAL_BOOKING_DOCUMENT_KINDS = ['bill_of_lading'] as const;

/** Portal compliance only — optional extras. */
export const OPTIONAL_PORTAL_BOOKING_DOCUMENT_KINDS = [
  'bill_of_lading',
  'correspondence',
  'cod_form',
] as const;

export type MandatoryBookingDocumentKind =
  (typeof MANDATORY_BOOKING_DOCUMENT_KINDS)[number];

export type OptionalBookingDocumentKind =
  (typeof OPTIONAL_BOOKING_DOCUMENT_KINDS)[number];

export type OptionalPortalBookingDocumentKind =
  (typeof OPTIONAL_PORTAL_BOOKING_DOCUMENT_KINDS)[number];

export type PortalBookingDocumentKind =
  | MandatoryBookingDocumentKind
  | OptionalPortalBookingDocumentKind;

/** Staff mode forms: mandatory kinds + optional bill of lading / AWB. */
export type ModeBookingFormDocumentKind =
  | MandatoryBookingDocumentKind
  | OptionalBookingDocumentKind;

export const MODE_BOOKING_FORM_DOCUMENT_KINDS: readonly ModeBookingFormDocumentKind[] = [
  ...MANDATORY_BOOKING_DOCUMENT_KINDS,
  ...OPTIONAL_BOOKING_DOCUMENT_KINDS,
];

export const BOOKING_DOCUMENT_KIND_LABELS: Record<PortalBookingDocumentKind, string> = {
  commercial_invoice: 'Commercial invoice',
  packing_list: 'Packing list',
  bill_of_lading: 'Bill of lading / AWB',
  licence: 'Licence',
  uat_tax_certificate: 'UAT / TAX certificate',
  correspondence: 'Correspondence',
  cod_form: 'COD form',
};

/** Staff path segment for POST /jobs/:id/:mode/booking-form/documents/:kind */
export type ModeBookingFormApiMode =
  | 'sea-fcl'
  | 'sea-lcl'
  | 'land'
  | 'road-freight'
  | 'courier'
  | 'customs-clearance'
  | 'warehouse';

export function staffBookingFormModeToApiMode(
  mode:
    | 'SEA_FCL'
    | 'SEA_LCL'
    | 'LAND'
    | 'ROAD_FREIGHT'
    | 'COURIER'
    | 'CUSTOMS_CLEARANCE'
    | 'WAREHOUSE',
): ModeBookingFormApiMode {
  switch (mode) {
    case 'SEA_FCL':
      return 'sea-fcl';
    case 'SEA_LCL':
      return 'sea-lcl';
    case 'LAND':
      return 'land';
    case 'ROAD_FREIGHT':
      return 'road-freight';
    case 'COURIER':
      return 'courier';
    case 'CUSTOMS_CLEARANCE':
      return 'customs-clearance';
    case 'WAREHOUSE':
      return 'warehouse';
  }
}

export function missingMandatoryBookingDocs(
  uploaded: Iterable<string>,
): MandatoryBookingDocumentKind[] {
  const have = new Set(
    [...uploaded].map((k) => String(k).trim().toLowerCase()),
  );
  return MANDATORY_BOOKING_DOCUMENT_KINDS.filter((k) => !have.has(k));
}
