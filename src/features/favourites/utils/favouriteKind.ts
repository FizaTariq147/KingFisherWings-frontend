/** Canonical favourites kinds (OpenAPI validation). */
export const FAVOURITE_KINDS = [
  'enquiry',
  'quotation',
  'shipment',
  'job',
  'report_template',
  'report',
  'menu',
  'party',
  'other',
] as const;

export type FavouriteKind = (typeof FAVOURITE_KINDS)[number];

const KIND_ALIASES: Record<string, FavouriteKind> = {
  enquiry: 'enquiry',
  quotation: 'quotation',
  shipment: 'shipment',
  job: 'job',
  report_template: 'report_template',
  report: 'report',
  menu: 'menu',
  party: 'party',
  other: 'other',
  // Ops entity / legacy uppercase
  ENQUIRY: 'enquiry',
  QUOTATION: 'quotation',
  SHIPMENT: 'shipment',
  JOB: 'job',
  REPORT_TEMPLATE: 'report_template',
  REPORT: 'report',
  MENU: 'menu',
  PARTY: 'party',
  OTHER: 'other',
};

/** Coerce UI / ops entity kinds to OpenAPI favourite kind (lowercase). */
export function toFavouriteKind(kind: string): FavouriteKind {
  const trimmed = kind.trim();
  if (KIND_ALIASES[trimmed]) return KIND_ALIASES[trimmed];
  const lower = trimmed.toLowerCase();
  if ((FAVOURITE_KINDS as readonly string[]).includes(lower)) {
    return lower as FavouriteKind;
  }
  return 'other';
}
