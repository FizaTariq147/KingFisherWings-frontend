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

/** [x, y, w, h] in PDF points, origin bottom-left. */
export type OfficialRect = [number, number, number, number];

/** [x1, y1, x2, y2] in PDF points. */
export type OfficialLine = [number, number, number, number];

/** [text, x, y, fontSize] in PDF points, origin bottom-left. */
export type OfficialTextRun = [string, number, number, number];

export type OfficialBrandingSlot = {
  x: number;
  y: number;
  size: number;
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
  logoUrl?: string;
  entityBound?: boolean;
  shipperLines?: string[];
  consigneeLines?: string[];
  notifyLines?: string[];
  jobNumber?: string;
  referenceNo?: string;
  invoiceNumber?: string;
  hawbNo?: string;
  hblNo?: string;
  mawbNo?: string;
};

export type MyReportColumnSpec = {
  code: string;
  name: string;
  referenceFile: string;
  sheetName: string;
  headers: string[];
};
