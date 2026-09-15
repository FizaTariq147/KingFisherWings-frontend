import type { InvoiceFormatPaper } from './invoiceFormatPreview.types';

/** Theme tokens for JSON-driven invoice layouts. */
export type InvoiceFormatUiTheme = {
  primary: string;
  accent: string;
  fill: string;
  panel: string;
  orange: string;
  red: string;
  cyan: string;
  ink: string;
  gray: string;
  white: string;
};

export type InvoiceFormatUiBranding = {
  company: string;
  address: string;
  web: string;
  phone?: string;
  email?: string;
  logo: 'kingfisher';
};

export type InvoiceFormatUiKv = { k: string; v: string };

export type InvoiceFormatUiDemo = {
  invoiceNo?: string;
  invoiceDate?: string;
  dueDate?: string;
  billToLabel?: string;
  billToName?: string;
  billToAddress?: string;
  billToPhone?: string;
  billToGstin?: string;
  creditTerm?: string;
  currency?: string;
  jobNo?: string;
  shipmentNo?: string;
  narration?: string;
  remarks?: string;
  words?: string;
  subtotal?: string;
  taxLabel?: string;
  tax?: string;
  total?: string;
  totalLabel?: string;
  metaRows?: InvoiceFormatUiKv[];
  fieldGrid?: InvoiceFormatUiKv[];
  partyLeft?: { title: string; lines: string[] };
  partyMid?: { title: string; lines: string[] };
  partyRight?: InvoiceFormatUiKv[];
  /** Third party column with title + lines (e.g. Consignee on proforma). */
  partyThird?: { title: string; lines: string[] };
  containerHeaders?: string[];
  containerRow?: string[];
  tableHeaders?: string[];
  tableRows?: string[][];
  termsLines?: string[];
  bankLines?: string[];
  wireLines?: string[];
  numberedFields?: Array<{ n: number; label: string; value: string }>;
  thankYou?: string;
  /** Outstanding-letter body copy under the title. */
  letterBody?: string;
  /** Purchase-invoice approval labels. */
  signatureLabels?: string[];
  /** Aging summary headers / values (outstanding letter). */
  agingHeaders?: string[];
  agingRow?: string[];
  /** Optional 4th party column (e.g. Notify). */
  partyNotify?: { title: string; lines: string[] };
  /** Export invoice extras (Fresa-style shipment invoices). */
  fax?: string;
  vatNo?: string;
  tinNo?: string;
  irnNo?: string;
  quotationNo?: string;
  placeOfSupply?: string;
  termsOfShipment?: string;
  goodsDescription?: string;
  shippersReference?: string;
  referenceNoDate?: string;
  /** Subtotal bar segments e.g. ['4,200.00','576.00','4,776.00']. */
  subtotalParts?: string[];
  footerBullets?: string[];
  frenchTotalWords?: string;
  /** Singapore GST summary lines. */
  gstSummary?: InvoiceFormatUiKv[];
  /** Format-6 style stacked totals. */
  netPayable?: string;
  taxTotal?: string;
  invoiceTotal?: string;
  /** Format-7 / land title extras. */
  docSubtitle?: string;
  trnNo?: string;
  grandTotalDue?: string;
  grandTotalDueLabel?: string;
  jobDescription?: string;
  containerNote?: string;
  referenceRows?: InvoiceFormatUiKv[];
  /** Secondary / against-voucher table (title defaults to Outstanding / Aging). */
  osTableTitle?: string;
  osTableHeaders?: string[];
  osTableRows?: string[][];
  /** Side tax amount labels e.g. GST18 / GST 15%. */
  taxAmountLines?: string[];
  officeAddressLines?: string[];
  sellerLines?: string[];
  buyerLines?: string[];
  ksaMetaRows?: InvoiceFormatUiKv[];
};

export type InvoiceFormatUiBlock =
  | { type: 'colorBar' }
  | {
      type: 'companyHeader';
      title?: string;
      titleColor?: 'primary' | 'accent' | 'cyan';
      showContact?: boolean;
    }
  | { type: 'docTitle'; text: string; align?: 'center' | 'start' | 'end'; band?: boolean }
  | {
      type: 'twoColumn';
      leftTitle?: string;
      /** Keys into demo for left body; or use demo.billTo* */
      showBillTo?: boolean;
      showCreditTerm?: boolean;
      rightMetaFrom?: 'metaRows';
    }
  | { type: 'fieldGrid'; cols?: 1 | 2 | 3; from?: 'fieldGrid' }
  | { type: 'partyTriple' }
  | { type: 'containerStrip' }
  | { type: 'chargeTable'; headerColor?: 'primary' | 'accent' | 'cyan' | 'fill' | 'orange' }
  | { type: 'wordsAndTotal' }
  | { type: 'termsBank' }
  | { type: 'wireBox' }
  | { type: 'usaNumberedFields' }
  | { type: 'arabicHeader' }
  | { type: 'summaryHero' }
  | { type: 'landRoute' }
  | { type: 'totalsOnly' }
  | { type: 'colorfulFooter' }
  | { type: 'formatBadge' }
  | { type: 'letterBody' }
  | { type: 'signatureRow' }
  | { type: 'agingSummary' }
  | { type: 'exportMetaStrip' }
  | {
      type: 'shipmentDetails';
      showIrn?: boolean;
      showQuotation?: boolean;
      showTermsOfShipment?: boolean;
      showPlaceOfSupply?: boolean;
      fcyOrder?: boolean;
    }
  | { type: 'subtotalBar'; variant?: 'igst' | 'fcy' | 'tax' | 'tva' | 'simple' }
  | { type: 'exportClosing'; showBullets?: boolean }
  | { type: 'format15Header' }
  | { type: 'singaporeHeader' }
  | { type: 'singaporeGstSummary' }
  | { type: 'format7Header' }
  | { type: 'format6Totals' }
  | { type: 'grandTotalDue' }
  | { type: 'exportBondBanner' }
  | { type: 'landFreightHeader'; title?: string }
  | { type: 'jobDescription' }
  | { type: 'containerNote' }
  | { type: 'stampSignature' }
  | { type: 'ksaBilingualHeader' }
  | { type: 'ksaTotals' }
  | { type: 'taxAmountBox' }
  | { type: 'outstandingTable' }
  | { type: 'officeAddressBand' };

/** Permanent declarative UI layout for one Invoice Report Format-*. */
export type InvoiceFormatUiLayout = {
  code: string;
  formatNumber: number;
  name: string;
  paper: InvoiceFormatPaper;
  rtl?: boolean;
  theme: InvoiceFormatUiTheme;
  branding: InvoiceFormatUiBranding;
  demo: InvoiceFormatUiDemo;
  blocks: InvoiceFormatUiBlock[];
};
