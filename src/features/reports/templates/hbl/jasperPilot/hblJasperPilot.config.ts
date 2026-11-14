import type { HblJasperPilotConfig } from './hblJasperPilot.types';

/**
 * Declarative layout for HBL_DRAFT_REPORT_FORMAT_JASPER.
 * Derived from FRESA-REF-0001 (hbl-draft-report-fomat-jasper.pdf):
 * A4 portrait 595×842 pt, 1 page, not a stub/preprinted form.
 */
export const HBL_JASPER_PILOT_CONFIG: HblJasperPilotConfig = {
  code: 'HBL_DRAFT_REPORT_FORMAT_JASPER',
  name: 'HBL Draft Report Format Jasper',
  referenceId: 'FRESA-REF-0001',
  samplePdfUrl:
    'https://fresatechnologies.com/wp-content/uploads/report-formats/hbl-draft-report-fomat-jasper.pdf',
  localPdfPath: 'src/features/reports/qa/fresa-references/pdfs/hbl-draft-report-fomat-jasper.pdf',
  page: {
    paper: 'A4',
    orientation: 'portrait',
    widthCssPx: 794,
    heightCssPx: 1123,
    widthPt: 595,
    heightPt: 842,
    marginsPt: { top: 18, right: 18, bottom: 18, left: 18 },
    pageBreak: 'avoid',
  },
  typography: {
    fontFamily: 'Arial, Helvetica, sans-serif',
    labelSizePx: 8,
    bodySizePx: 9,
    titleSizePx: 10,
    blNumberSizePx: 13,
    ink: '#111111',
    labelColor: '#333333',
    fill: '#f3f3f3',
    draftColor: '#c62828',
  },
  borders: {
    color: '#1a1a1a',
    widthPx: 1,
  },
  spacing: {
    cellPaddingXPx: 6,
    cellPaddingYPx: 4,
    partyMinHeightPx: 52,
    cargoMinHeightPx: 88,
    closingMinHeightPx: 140,
  },
  table: {
    columnKeys: ['marks', 'packages', 'description', 'weight', 'measurement'],
    columnLabels: {
      marks: 'Container No. / Seal No./ Mark & No.',
      packages: 'No. of Pkgs or Shipping Units',
      description: 'Description of Goods & Pkgs.',
      weight: 'Gross Weight',
      measurement: 'Measurement',
    },
    columnWidthsPercent: [26, 14, 34, 13, 13],
    headerFill: '#f3f3f3',
  },
  documentTitle: 'Bill of Lading not negotiable unless consigned "To Order"',
  receivedClauseText:
    'RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated, to be transported subject to the terms and conditions of this Bill of Lading. In WITNESS whereof original Bill(s) of Lading have been signed; one being accomplished, the others to be void. The particulars given above as stated by the shipper and the weight, measure, quantity, condition, contents and value of the Goods are unknown to the Carrier.',
  appendCustomerTerms: true,
  sections: [
    {
      id: 'branding',
      visible: true,
      order: 1,
      fields: ['companyName', 'documentTitle'],
    },
    {
      id: 'partiesAndBlNumber',
      visible: true,
      order: 2,
      columnTemplate: '1.35fr 1fr 0.55fr',
      fields: ['shipper', 'consignee', 'notify', 'blNumber', 'agentName', 'agentLines'],
    },
    {
      id: 'routingRow1',
      visible: true,
      order: 3,
      columnTemplate: '1fr 1fr 1fr 1fr',
      fields: ['placeOfReceipt', 'portOfLoading', 'jobNo', 'preCarriage'],
    },
    {
      id: 'routingRow2',
      visible: true,
      order: 4,
      columnTemplate: '1fr 1fr 1fr 1fr',
      fields: ['vesselVoyage', 'portOfDischarge', 'placeOfDelivery', 'numberOfBls'],
    },
    {
      id: 'cargoTable',
      visible: true,
      order: 5,
      fields: ['containerMarks', 'packages', 'description', 'grossWeight', 'measurement'],
    },
    {
      id: 'freightDetails',
      visible: true,
      order: 6,
      fields: ['freightDetails', 'totalInWords'],
    },
    {
      id: 'termsAndSignature',
      visible: true,
      order: 7,
      fields: [
        'receivedClause',
        'signature',
        'placeAndDateOfIssue',
        'onboardDate',
        'carrierName',
        'draftWatermark',
      ],
    },
    {
      id: 'footer',
      visible: true,
      order: 8,
      fields: ['pageNumber'],
    },
  ],
  fields: [
    { id: 'companyName', visible: true, dataKey: 'companyName', label: 'House Bill of Lading' },
    { id: 'documentTitle', visible: true, dataKey: 'documentTitle' },
    { id: 'blNumber', visible: true, dataKey: 'blNumber', label: 'Bill of Lading No.' },
    { id: 'agentName', visible: true, dataKey: 'agentName', label: 'F/Agent Name & Ref.' },
    { id: 'agentLines', visible: true, dataKey: 'agentLines' },
    { id: 'shipper', visible: true, dataKey: 'shipperLines', label: 'Shipper' },
    { id: 'consignee', visible: true, dataKey: 'consigneeLines', label: 'Consignee' },
    { id: 'notify', visible: true, dataKey: 'notifyLines', label: 'Notify Party' },
    { id: 'placeOfReceipt', visible: true, dataKey: 'placeOfReceipt', label: 'Place of Receipt' },
    { id: 'portOfLoading', visible: true, dataKey: 'portOfLoading', label: 'Port of Loading' },
    { id: 'jobNo', visible: true, dataKey: 'jobRef', label: 'Job No.' },
    { id: 'preCarriage', visible: true, dataKey: 'preCarriage', label: 'Pre-carriage by' },
    {
      id: 'vesselVoyage',
      visible: true,
      dataKey: 'vesselVoyage',
      label: 'Vessel / Voyage No.',
    },
    {
      id: 'portOfDischarge',
      visible: true,
      dataKey: 'portOfDischarge',
      label: 'Port of Discharge',
    },
    {
      id: 'placeOfDelivery',
      visible: true,
      dataKey: 'placeOfDelivery',
      label: 'Place of Delivery',
    },
    {
      id: 'numberOfBls',
      visible: true,
      dataKey: 'numberOfBls',
      label: 'No. of Bills of Lading',
    },
    { id: 'containerMarks', visible: true, dataKey: 'containerRows.marks' },
    { id: 'packages', visible: true, dataKey: 'containerRows.packages' },
    { id: 'description', visible: true, dataKey: 'containerRows.description' },
    { id: 'grossWeight', visible: true, dataKey: 'containerRows.weight' },
    { id: 'measurement', visible: true, dataKey: 'containerRows.measurement' },
    { id: 'freightDetails', visible: true, dataKey: 'freightDetails', label: 'Freight Details' },
    { id: 'totalInWords', visible: true, dataKey: 'totalInWords' },
    { id: 'receivedClause', visible: true, dataKey: 'receivedClause' },
    { id: 'signature', visible: true, dataKey: 'companyName', label: 'Signed on behalf of the Carrier' },
    {
      id: 'placeAndDateOfIssue',
      visible: true,
      dataKey: 'placeAndDateOfIssue',
      label: 'Place and Date of Issue',
    },
    { id: 'onboardDate', visible: true, dataKey: 'onboardDate', label: 'Onboard Date' },
    { id: 'carrierName', visible: true, dataKey: 'carrierName', label: 'AS AGENT FOR THE CARRIER' },
    { id: 'draftWatermark', visible: true, dataKey: 'draftWatermark' },
    { id: 'pageNumber', visible: true, dataKey: 'pageNumber', label: 'Page' },
  ],
};

export const HBL_JASPER_PILOT_CODE = HBL_JASPER_PILOT_CONFIG.code;

export function isHblJasperPilotCode(code: string): boolean {
  return code.trim().toUpperCase() === HBL_JASPER_PILOT_CODE;
}

export function getHblJasperPilotField(
  id: string,
): (typeof HBL_JASPER_PILOT_CONFIG.fields)[number] | undefined {
  return HBL_JASPER_PILOT_CONFIG.fields.find((f) => f.id === id);
}

export function isHblJasperPilotFieldVisible(id: string): boolean {
  return getHblJasperPilotField(id)?.visible !== false;
}

export function orderedHblJasperPilotSections() {
  return HBL_JASPER_PILOT_CONFIG.sections
    .filter((s) => s.visible)
    .slice()
    .sort((a, b) => a.order - b.order);
}
