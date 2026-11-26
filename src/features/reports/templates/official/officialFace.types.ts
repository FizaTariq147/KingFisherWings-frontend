/** Measured native face. Geometry comes from a Fresa sample; the sample PDF is never embedded. */

export type OfficialFaceFamily =
  | 'hbl'
  | 'delivery_order'
  | 'wms_asn'
  | 'arrival_notice'
  | 'invoice'
  | 'accounts'
  | 'quotation'
  | 'mawb'
  | 'other'
  | 'my_reports';

/** [x, y, w, h, r, g, b, kind] — kind 1 is a filled band, kind 0 is a stroked box. */
export type OfficialRect = number[];

/** [x1, y1, x2, y2, r, g, b, width] in PDF points. */
export type OfficialLine = number[];

/** [text, x, y, fontSize, bold] in PDF points, origin bottom-left. */
export type OfficialTextRun = [string, number, number, number, number?];

export type OfficialBrandingSlot = {
  x: number;
  y: number;
  size: number;
};

/** Exact header/footer geometry taken from reports/specs/<code>.json. */
export type ReportBrandingBox = {
  x: number;
  y: number;
  width: number;
  height: number;
  size?: number;
  color?: string;
  /** Fresa Tax Invoice style: company/address sit on the right edge. */
  align?: 'left' | 'right';
};

export type ReportBrandingSlots = {
  code: string;
  logo: ReportBrandingBox | null;
  company: ReportBrandingBox | null;
  addressLines: ReportBrandingBox[];
  /** Sample branding name/phone/address spans to wipe before drawing org chrome. */
  companyWipes: ReportBrandingBox[];
  headerBand: ReportBrandingBox | null;
  /**
   * Ocean HBL (e.g. FG_HBL_HKG): second org name under the agent logo
   * (Fresa “FRESA DEMO INDIA PVT LTD” block).
   */
  issuerCompany?: ReportBrandingBox | null;
  /** Contact lines under issuerCompany (Tel / Email). */
  issuerAddressLines?: ReportBrandingBox[];
  /** Value to the right of “Prepared By :”. */
  preparedByValue?: ReportBrandingBox | null;
  /** “By {company}” under Signed on behalf of the Carrier. */
  signatureBy?: ReportBrandingBox | null;
  /** Top-right Code 128 box (B/L number). */
  barcode?: ReportBrandingBox | null;
  footer: {
    printedByLabel: ReportBrandingBox | null;
    printedByValue: ReportBrandingBox | null;
    printedDateLabel: ReportBrandingBox | null;
    printedDateValue: ReportBrandingBox | null;
    pageLabel: ReportBrandingBox | null;
    poweredByWipe: ReportBrandingBox | null;
  };
};

export type OfficialMeasuredFace = {
  code: string;
  name: string;
  family: OfficialFaceFamily;
  referenceFile: string;
  samplePdfUrl: string | null;
  pageCount: number;
  widthPt: number;
  heightPt: number;
  /**
   * PDF /Rotate degrees (0/90/180/270). Geometry is stored in mediaBox
   * (unrotated) space; the drawer applies this so viewers match Fresa.
   */
  rotateDeg?: number;
  branding: OfficialBrandingSlot;
  /** Label text -> field key filled from live data when present. */
  fieldSlots: Array<{ key: string; x: number; y: number; size: number }>;
  pages: Array<{
    rects: OfficialRect[];
    lines: OfficialLine[];
    texts: OfficialTextRun[];
  }>;
};

export type OfficialFaceData = {
  companyName?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  companyWeb?: string;
  logoUrl?: string;
  printedBy?: string;
  printedDate?: string;
  pageLabel?: string;
  entityBound?: boolean;
  shipperLines?: string[];
  consigneeLines?: string[];
  notifyLines?: string[];
  /** Invoice Bill To party (customer) — separate from BL shipper. */
  billToLines?: string[];
  jobNumber?: string;
  referenceNo?: string;
  invoiceNumber?: string;
  hawbNo?: string;
  hblNo?: string;
  mawbNo?: string;
  /** HAWB cargo / routing (measured HAWB faces). */
  pieces?: string;
  grossWeight?: string;
  chargeableWeight?: string;
  nature?: string;
  handling?: string;
  accounting?: string;
  packagesLine?: string;
  departure?: string;
  destination?: string;
  flightDate?: string;
  toCode?: string;
  currency?: string;
  declaredCarriage?: string;
  declaredCustoms?: string;
  insurance?: string;
  carrier?: string;
  /** Short flight designator for By first Carrier (e.g. EK9876). */
  byCarrier?: string;
  executedOn?: string;
  executedAt?: string;
  total?: string;
  rateCharge?: string;
  prepaidMark?: string;
  carrierSign?: string;
  /** Optional explicit company stamp (HAWB Issued-by / agent). */
  companyNameSlot?: string;
};

export type MyReportColumnSpec = {
  code: string;
  name: string;
  referenceFile: string;
  sheetName: string;
  headers: string[];
};
