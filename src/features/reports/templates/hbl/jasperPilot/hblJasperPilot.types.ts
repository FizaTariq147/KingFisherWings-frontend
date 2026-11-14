/**
 * Config schema for the HBL Jasper pilot (HBL_DRAFT_REPORT_FORMAT_JASPER).
 * Extends the catalogue JSON layout idea with section/field visibility,
 * ordering, typography, borders, spacing, and page/table settings.
 */

export type HblJasperPilotSectionId =
  | 'branding'
  | 'documentTitle'
  | 'partiesAndBlNumber'
  | 'routingRow1'
  | 'routingRow2'
  | 'cargoTable'
  | 'freightDetails'
  | 'termsAndSignature'
  | 'footer';

export type HblJasperPilotFieldId =
  | 'companyName'
  | 'documentTitle'
  | 'blNumber'
  | 'agentName'
  | 'agentLines'
  | 'shipper'
  | 'consignee'
  | 'notify'
  | 'placeOfReceipt'
  | 'portOfLoading'
  | 'jobNo'
  | 'preCarriage'
  | 'vesselVoyage'
  | 'portOfDischarge'
  | 'placeOfDelivery'
  | 'numberOfBls'
  | 'containerMarks'
  | 'packages'
  | 'description'
  | 'grossWeight'
  | 'measurement'
  | 'freightDetails'
  | 'totalInWords'
  | 'receivedClause'
  | 'signature'
  | 'placeAndDateOfIssue'
  | 'onboardDate'
  | 'carrierName'
  | 'draftWatermark'
  | 'pageNumber';

export type HblJasperPilotTypography = {
  fontFamily: string;
  labelSizePx: number;
  bodySizePx: number;
  titleSizePx: number;
  blNumberSizePx: number;
  ink: string;
  labelColor: string;
  fill: string;
  draftColor: string;
};

export type HblJasperPilotBorders = {
  color: string;
  widthPx: number;
};

export type HblJasperPilotSpacing = {
  cellPaddingXPx: number;
  cellPaddingYPx: number;
  partyMinHeightPx: number;
  cargoMinHeightPx: number;
  closingMinHeightPx: number;
};

export type HblJasperPilotPage = {
  paper: 'A4';
  orientation: 'portrait';
  /** CSS px at 96dpi ≈ 210mm */
  widthCssPx: number;
  /** CSS px at 96dpi ≈ 297mm */
  heightCssPx: number;
  /** PDF points (MediaBox) */
  widthPt: number;
  heightPt: number;
  marginsPt: { top: number; right: number; bottom: number; left: number };
  pageBreak: 'avoid' | 'auto';
};

export type HblJasperPilotTableConfig = {
  columnKeys: Array<'marks' | 'packages' | 'description' | 'weight' | 'measurement'>;
  columnLabels: Record<string, string>;
  columnWidthsPercent: number[];
  headerFill: string;
};

export type HblJasperPilotFieldConfig = {
  id: HblJasperPilotFieldId;
  visible: boolean;
  /** Maps to BlDraftClassicModel / InvoiceFormatPdfData keys */
  dataKey: string;
  label?: string;
};

export type HblJasperPilotSectionConfig = {
  id: HblJasperPilotSectionId;
  visible: boolean;
  order: number;
  fields: HblJasperPilotFieldId[];
  /** CSS grid template columns when applicable */
  columnTemplate?: string;
};

export type HblJasperPilotConfig = {
  code: 'HBL_DRAFT_REPORT_FORMAT_JASPER';
  name: string;
  referenceId: 'FRESA-REF-0001';
  samplePdfUrl: string;
  localPdfPath: string;
  page: HblJasperPilotPage;
  typography: HblJasperPilotTypography;
  borders: HblJasperPilotBorders;
  spacing: HblJasperPilotSpacing;
  table: HblJasperPilotTableConfig;
  sections: HblJasperPilotSectionConfig[];
  fields: HblJasperPilotFieldConfig[];
  /** Static clause text present on the reference form */
  receivedClauseText: string;
  documentTitle: string;
  appendCustomerTerms: boolean;
};
