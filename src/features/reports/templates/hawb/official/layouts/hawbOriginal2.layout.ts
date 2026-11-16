import { PAGE_HAWB_NEAR_A4 } from '../../../../engines/pdf/pageGeometry';
import type { HawbOfficialLayoutConfig } from '../hawbOfficial.types';

/**
 * HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_2 — sparse overlay on near-A4 face.
 * Air Waybill title mode; data islands for pre-printed stationery.
 */
export const HAWB_ORIGINAL2_LAYOUT: HawbOfficialLayoutConfig = {
  code: 'HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_2',
  name: 'HAWB Original Pre Printed Report Format-2',
  variant: 'original2',
  referenceFile: 'hawb-original-pre-printed-report-format-2.pdf',
  referenceId: 'FRESA-HAWB-ORIGINAL-2',
  page: PAGE_HAWB_NEAR_A4,
  referencePageCount: 1,
  titleMode: 'Air Waybill',
  showNotify: false,
  showAccountNumberLabels: false,
  showJobNoInHeader: false,
  showMawbInRibbon: true,
  showIataAgentCells: true,
  preprinted: true,
  sparseOverlay: true,
  customsDefaultWhenEmpty: 'N.C.V',
  copyBanners: [],
  statusRibbon: 'ORIGINAL — PRE-PRINTED',
  copiesValidityLine:
    'Copies 1,2 and 3 of this Air Waybill are originals and have the same validity',
  legalVariant: 'air',
};
