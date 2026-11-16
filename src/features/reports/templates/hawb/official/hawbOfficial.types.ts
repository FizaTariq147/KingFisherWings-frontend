import type { PageGeometry } from '../../../engines/pdf/pageGeometry';

export type HawbOfficialVariant =
  | 'draft'
  | 'draft1'
  | 'draft2'
  | 'original1'
  | 'original2';

export type HawbOfficialTitleMode = 'HOUSE AIR WAYBILL' | 'Air Waybill';

export type HawbOfficialLayoutConfig = {
  code: string;
  name: string;
  variant: HawbOfficialVariant;
  referenceFile: string;
  referenceId: string;
  page: PageGeometry;
  /** Expected reference page count (face pages; T&C append is separate). */
  referencePageCount: number;
  titleMode: HawbOfficialTitleMode;
  showNotify: boolean;
  showAccountNumberLabels: boolean;
  showJobNoInHeader: boolean;
  showMawbInRibbon: boolean;
  showIataAgentCells: boolean;
  preprinted: boolean;
  /** Sparse overlay — no dense IATA grid (pre-printed face). */
  sparseOverlay: boolean;
  customsDefaultWhenEmpty: 'AS PER INV' | 'N.C.V' | '';
  /** Multi-page copy banners (draft1). Empty = single face. */
  copyBanners: string[];
  statusRibbon: 'DRAFT' | 'ORIGINAL — PRE-PRINTED' | 'ORIGINAL';
  copiesValidityLine: string;
  legalVariant: 'house' | 'air';
};

export type HawbOfficialModel = {
  formatCode: string;
  formatName: string;
  variant: HawbOfficialVariant;
  entityBound: boolean;
  showPlaceholders: boolean;
  copyBanner?: string;
  copyIndex?: number;
  copyTotal?: number;
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  logoUrl: string;
  shipperLines: string[];
  consigneeLines: string[];
  notifyLines: string[];
  agentLines: string[];
  hawbNo: string;
  mawbNo: string;
  jobNo: string;
  departure: string;
  destination: string;
  flightDate: string;
  toCode: string;
  carrier: string;
  currency: string;
  declaredCarriage: string;
  declaredCustoms: string;
  insurance: string;
  pieces: string;
  grossWeight: string;
  chargeableWeight: string;
  rateCharge: string;
  total: string;
  natureOfGoods: string;
  handling: string;
  accounting: string;
  executedOn: string;
  executedAt: string;
  otherCharges: string;
  tableHeaders: string[];
  tableRows: string[][];
};
