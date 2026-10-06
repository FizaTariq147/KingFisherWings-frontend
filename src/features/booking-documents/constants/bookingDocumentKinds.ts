/** Mandatory booking docs enforced on submit/complete (portal + staff mode forms). */
export const MANDATORY_BOOKING_DOCUMENT_KINDS = [
  'commercial_invoice',
  'packing_list',
  'bill_of_lading',
  'licence',
  'uat_tax_certificate',
] as const;

/** Portal compliance only — optional extras. */
export const OPTIONAL_PORTAL_BOOKING_DOCUMENT_KINDS = [
  'correspondence',
  'cod_form',
] as const;

export type MandatoryBookingDocumentKind =
  (typeof MANDATORY_BOOKING_DOCUMENT_KINDS)[number];

export type OptionalPortalBookingDocumentKind =
  (typeof OPTIONAL_PORTAL_BOOKING_DOCUMENT_KINDS)[number];

export type PortalBookingDocumentKind =
  | MandatoryBookingDocumentKind
  | OptionalPortalBookingDocumentKind;

export type ModeBookingFormDocumentKind = MandatoryBookingDocumentKind;

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
