import { PAGE_HAWB_NEAR_A4 } from '../../../../engines/pdf/pageGeometry';
import type { HawbOfficialLayoutConfig } from '../hawbOfficial.types';

/** HAWB_DRAFT_REPORT_FORMAT_2 — Non-negotiable Air Waybill face (not House-only). */
export const HAWB_DRAFT2_LAYOUT: HawbOfficialLayoutConfig = {
  code: 'HAWB_DRAFT_REPORT_FORMAT_2',
  name: 'HAWB Draft Report Format-2',
  variant: 'draft2',
  referenceFile: 'hawb-draft-report-format-2.pdf',
  referenceId: 'FRESA-HAWB-DRAFT-2',
  page: PAGE_HAWB_NEAR_A4,
  referencePageCount: 1,
  titleMode: 'Air Waybill',
  showNotify: false,
  showAccountNumberLabels: false,
  showJobNoInHeader: false,
  showMawbInRibbon: true,
  showIataAgentCells: true,
  preprinted: false,
  sparseOverlay: false,
  customsDefaultWhenEmpty: 'N.C.V',
  copyBanners: [],
  statusRibbon: 'DRAFT',
  copiesValidityLine:
    'Copies 1,2 and 3 of this Air Waybill are originals and have the same validity',
  legalVariant: 'air',
};
