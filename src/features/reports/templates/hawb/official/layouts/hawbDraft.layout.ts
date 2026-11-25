import { PAGE_HAWB_NEAR_A4 } from '../../../../engines/pdf/pageGeometry';
import type { HawbOfficialLayoutConfig } from '../hawbOfficial.types';

/** HAWB_DRAFT_REPORT_FORMAT — classic HOUSE AIR WAYBILL dense IATA grid. */
export const HAWB_DRAFT_LAYOUT: HawbOfficialLayoutConfig = {
  code: 'HAWB_DRAFT_REPORT_FORMAT',
  name: 'HAWB Draft Report Format',
  variant: 'draft',
  referenceFile: 'hawb-draft-report-format.pdf',
  referenceId: 'FRESA-HAWB-DRAFT',
  page: PAGE_HAWB_NEAR_A4,
  referencePageCount: 1,
  titleMode: 'HOUSE AIR WAYBILL',
  showNotify: false,
  showAccountNumberLabels: true,
  showJobNoInHeader: false,
  showMawbInRibbon: true,
  showIataAgentCells: true,
  preprinted: false,
  sparseOverlay: false,
  customsDefaultWhenEmpty: '',
  copyBanners: [],
  statusRibbon: 'DRAFT',
  copiesValidityLine:
    'Copies 1,2 and 3 of this Air Waybill are originals and have the same validity',
  // Fresa draft face uses the longer AIR legal block (ALL GOODS MAY BE CARRIED…).
  legalVariant: 'air',
};
