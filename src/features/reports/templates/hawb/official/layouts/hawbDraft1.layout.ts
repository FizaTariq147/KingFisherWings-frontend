import { PAGE_HAWB_DRAFT1_A4 } from '../../../../engines/pdf/pageGeometry';
import type { HawbOfficialLayoutConfig } from '../hawbOfficial.types';

/**
 * HAWB_DRAFT_REPORT_FORMAT_1 — HOUSE AIR WAYBILL with Notify + multi-page copy set.
 *
 * Phase 2.1 visual QA: Fresa reference has **9 identical extractable faces**
 * (same text fingerprint on every page — repeated copy set, not nine unique layouts).
 * Banners are pagination markers only; do not invent role labels absent from the reference OCR.
 * Airway T&C append remains a separate optional page after the face set.
 */
export const HAWB_DRAFT1_LAYOUT: HawbOfficialLayoutConfig = {
  code: 'HAWB_DRAFT_REPORT_FORMAT_1',
  name: 'HAWB Draft Report Format-1',
  variant: 'draft1',
  referenceFile: 'hawb-draft-report-format-1.pdf',
  referenceId: 'FRESA-HAWB-DRAFT-1',
  page: PAGE_HAWB_DRAFT1_A4,
  referencePageCount: 9,
  titleMode: 'HOUSE AIR WAYBILL',
  showNotify: true,
  showAccountNumberLabels: false,
  showJobNoInHeader: true,
  showMawbInRibbon: true,
  showIataAgentCells: false,
  preprinted: false,
  sparseOverlay: false,
  customsDefaultWhenEmpty: 'AS PER INV',
  copyBanners: [
    'COPY FACE 1/9',
    'COPY FACE 2/9',
    'COPY FACE 3/9',
    'COPY FACE 4/9',
    'COPY FACE 5/9',
    'COPY FACE 6/9',
    'COPY FACE 7/9',
    'COPY FACE 8/9',
    'COPY FACE 9/9',
  ],
  statusRibbon: 'DRAFT',
  copiesValidityLine:
    'Copies marked Original 1,2,3 and 4 are originals and have the same validity',
  legalVariant: 'house',
};
