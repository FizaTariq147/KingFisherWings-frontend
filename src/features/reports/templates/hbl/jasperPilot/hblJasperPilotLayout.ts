import type { InvoiceFormatUiLayout } from '../../../types/invoiceFormatUiLayout.types';
import { HBL_JASPER_PILOT_CONFIG } from './hblJasperPilot.config';

/**
 * Catalogue-compatible JSON shell for the Jasper pilot.
 * Blocks mirror the pilot composition; live PDF uses generateHblJasperPilotPdf
 * (not generic html2canvas of this shell) so other HBL formats stay untouched.
 */
export const HBL_JASPER_PILOT_UI_LAYOUT: InvoiceFormatUiLayout = {
  code: HBL_JASPER_PILOT_CONFIG.code,
  formatNumber: 0,
  name: HBL_JASPER_PILOT_CONFIG.name,
  paper: 'A4',
  orientation: 'portrait',
  rtl: false,
  appendCustomerTerms: HBL_JASPER_PILOT_CONFIG.appendCustomerTerms,
  theme: {
    primary: '#101010',
    accent: '#2286C8',
    fill: HBL_JASPER_PILOT_CONFIG.typography.fill,
    panel: '#EBF0F4',
    orange: '#F7A21C',
    red: '#DE1F26',
    cyan: '#9AD7FF',
    ink: HBL_JASPER_PILOT_CONFIG.typography.ink,
    gray: '#656565',
    white: '#FFFFFF',
  },
  branding: {
    company: '',
    address: '',
    web: '',
    logo: 'kingfisher',
  },
  demo: {
    // Empty demo — pilot never fabricates catalogue values for missing data.
    hblBlTitle: HBL_JASPER_PILOT_CONFIG.documentTitle,
    hblCargoHeaders: Object.values(HBL_JASPER_PILOT_CONFIG.table.columnLabels),
    hblCargoRows: [],
    partyLeft: { title: 'Shipper', lines: [] },
    partyMid: { title: 'Consignee', lines: [] },
    partyNotify: { title: 'Notify Party', lines: [] },
    fieldGrid: [],
  },
  blocks: [
    { type: 'hblBlShell', embedLogo: true, variant: 'jasper' },
    { type: 'hblFreightSignature', variant: 'blClosing' },
    { type: 'colorfulFooter', variant: 'plain' },
  ],
};
