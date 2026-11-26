import { PAGE_HAWB_ORIGINAL1_CUSTOM } from '../../../../engines/pdf/pageGeometry';
import type { HawbOfficialLayoutConfig } from '../hawbOfficial.types';

/**
 * HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_1 — pre-printed form overlay.
 * MediaBox 737×923; sparse positioned fields (no dense IATA grid ink).
 */
export const HAWB_ORIGINAL1_LAYOUT: HawbOfficialLayoutConfig = {
  code: 'HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_1',
  name: 'HAWB Original Pre Printed Report Format-1',
  variant: 'original1',
  referenceFile: 'hawb-original-pre-printed-report-format-1.pdf',
  referenceId: 'FRESA-HAWB-ORIGINAL-1',
  page: PAGE_HAWB_ORIGINAL1_CUSTOM,
  referencePageCount: 1,
  titleMode: 'HOUSE AIR WAYBILL',
  showNotify: false,
  showAccountNumberLabels: false,
  showJobNoInHeader: false,
  showMawbInRibbon: false,
  showIataAgentCells: false,
  preprinted: true,
  sparseOverlay: true,
  customsDefaultWhenEmpty: 'AS PER INV',
  copyBanners: [],
  statusRibbon: 'ORIGINAL — PRE-PRINTED',
  copiesValidityLine:
    'Copies 1,2 and 3 of this Air Waybill are originals and have the same validity',
  legalVariant: 'house',
};
