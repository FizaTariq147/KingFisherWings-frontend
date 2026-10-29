import type {
  InvoiceFormatOrientation,
  InvoiceFormatPaper,
} from './invoiceFormatPreview.types';

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
  /**
   * Format-2 landscape metaTriple middle / right columns (flat label:value rows).
   * Left column uses billTo* Client fields.
   */
  metaMid?: InvoiceFormatUiKv[];
  metaRight?: InvoiceFormatUiKv[];
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
  /** Hero / document title override (summaryHero, formatBadge). */
  heroTitle?: string;
  formatBadgeLabel?: string;
  /** HBL / sea-doc cargo table. */
  hblCargoHeaders?: string[];
  hblCargoRows?: string[][];
  hblFreightText?: string;
  hblOnboardDate?: string;
  hblPlaceDate?: string;
  hblCarrierAgent?: string;
  /** Fresa BL closing clause (right column of hblFreightSignature). */
  hblReceivedText?: string;
  /** Destination delivery-agent block (Fresa BL right column). */
  hblDeliveryAgent?: { title?: string; lines: string[] };
  /** e.g. 1(ONE) — number of original B/Ls. */
  hblOriginals?: string;
  /** Optional MTO / registration line shown in BL shell header cell. */
  hblRegisteredNo?: string;
  /** Document title override for boxed BL shell. */
  hblBlTitle?: string;
  /** HAWB route strip. */
  hawbRouteFields?: InvoiceFormatUiKv[];
  /** Arrival notice optional charges note. */
  arrivalChargesNote?: string;
  arrivalShowCharges?: boolean;
};

export type InvoiceFormatUiBlock =
  | { type: 'colorBar' }
  | {
      type: 'companyHeader';
      title?: string;
      titleColor?: 'primary' | 'accent' | 'cyan';
      showContact?: boolean;
    }
  | {
      type: 'docTitle';
      text: string;
      align?: 'center' | 'start' | 'end';
      band?: boolean;
      /**
       * `solid` = accent bar + white text (ASN / Format-3).
       * `soft` = cyan bar + ink (Tax Invoice Format-1).
       * `fill` = theme.fill grey bar + ink (Tax Invoice Format-2).
       * `rules` = centered ink title between double horizontal rules (Format-4).
       */
      bandStyle?: 'solid' | 'soft' | 'fill' | 'rules';
    }
  | {
      type: 'twoColumn';
      leftTitle?: string;
      /** Keys into demo for left body; or use demo.billTo* */
      showBillTo?: boolean;
      showCreditTerm?: boolean;
      rightMetaFrom?: 'metaRows';
    }
  | {
      type: 'fieldGrid';
      cols?: 1 | 2 | 3;
      from?: 'fieldGrid';
      /** Label color. Fresa ASN meta uses ink; many other formats use primary blue. */
      labelTone?: 'primary' | 'ink';
    }
  | { type: 'partyTriple' }
  | {
      /**
       * Format-2 Tax Invoice India: one bordered band with three columns —
       * Client (billTo*) | metaMid | metaRight. Uses inline CSS grid for html2canvas.
       */
      type: 'metaTriple';
      showCreditTerm?: boolean;
    }
  | {
      type: 'containerStrip';
      /**
       * `grid` — inline cell borders (html2canvas-safe). Default keeps Tailwind `border`
       * classes so other invoices are unchanged.
       */
      chrome?: 'plain' | 'grid';
      headerColor?: 'primary' | 'accent' | 'cyan' | 'fill' | 'orange';
    }
  | {
      type: 'chargeTable';
      headerColor?: 'primary' | 'accent' | 'cyan' | 'fill' | 'orange';
      /**
       * `grid` — inline cell borders (html2canvas-safe) + optional Total-row tint.
       * Default keeps prior Tailwind `border` classes for other formats.
       */
      chrome?: 'plain' | 'grid';
      /** When chrome=grid, shade rows whose first cell looks like a Total line. */
      tintTotalRow?: boolean;
      /** Border ink for chrome=grid (Fresa ASN uses near-black). */
      gridBorder?: 'primary' | 'ink';
    }
  | {
      type: 'wordsAndTotal';
      /**
       * `split` — words left + numeric total right (default).
       * `skip` — render nothing (when a prior `taxAmountBox` indiaSummary already shows words+total).
       */
      variant?: 'split' | 'skip';
    }
  | { type: 'termsBank' }
  | { type: 'wireBox' }
  | { type: 'usaNumberedFields' }
  | { type: 'arabicHeader' }
  | { type: 'summaryHero'; title?: string }
  | { type: 'landRoute' }
  | { type: 'totalsOnly' }
  /**
   * Sticky page footer. `bar` = Fresa ASN-style tri-color strip with on-bar text.
   * `plain` = printed-by meta row without color blocks (some invoice/HBL samples).
   */
  | { type: 'colorfulFooter'; variant?: 'bar' | 'plain' }
  | { type: 'formatBadge'; label?: string }
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
  | {
      type: 'subtotalBar';
      /**
       * `subVat` — Format-4: right-aligned Sub Total + tax lines (no INR boilerplate).
       * Other variants keep prior catalogue behavior.
       */
      variant?: 'igst' | 'fcy' | 'tax' | 'tva' | 'simple' | 'subVat';
    }
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
  | {
      type: 'taxAmountBox';
      /**
       * `band` — full-width fill strip with "Tax Amount (currency)" (default).
       * `indiaSummary` — Format-1: words left + right Tax|Amount table with Total.
       * `compact` — Format-2: right-aligned Tax|Amount table only (no words/Total row).
       */
      variant?: 'band' | 'indiaSummary' | 'compact';
    }
  | { type: 'outstandingTable' }
  | { type: 'officeAddressBand' }
  /** Classic HBL-style cargo / container table (not invoice chargeTable). */
  | { type: 'hblCargoTable' }
  /**
   * HBL freight + signature closing.
   * `blClosing` (default) matches Fresa Format-11 charges|agents cluster.
   * `simple` keeps the older freight/place split without the charges table.
   */
  | { type: 'hblFreightSignature'; variant?: 'blClosing' | 'simple' }
  /** Shipper / Consignee / Notify three-column party block for sea docs. */
  | { type: 'partyNotifyGrid' }
  /**
   * Fresa Format-11 style upper boxed bill-of-lading shell (parties, routing, cargo).
   * Report-specific; prefer over reshaping shared partyNotifyGrid.
   * `embedLogo` — place KF logo in the B/L identity cell (Fresa logo substitution).
   */
  | { type: 'hblBlShell'; embedLogo?: boolean }
  /** HAWB origin/destination/flight strip. */
  | { type: 'hawbRouteGrid' }
  /** Arrival notice body with optional charges section. */
  | { type: 'arrivalChargesOptional'; showCharges?: boolean }
  /** Delivery order release instruction strip. */
  | { type: 'deliveryOrderRelease' };

/** Permanent declarative UI layout for one Invoice Report Format-*. */
export type InvoiceFormatUiLayout = {
  code: string;
  formatNumber: number;
  name: string;
  paper: InvoiceFormatPaper;
  /**
   * Physical page orientation for preview + PDF capture.
   * Defaults to portrait when omitted. Use landscape when the Fresa/source
   * sample is displayed landscape (including A4 MediaBox + /Rotate 90).
   */
  orientation?: InvoiceFormatOrientation;
  /**
   * Optional generate-time hint only. Append is code-driven:
   * BL formats → BL Terms PDF; HAWB/MAWB/AWB → Airway Terms PDF.
   */
  appendCustomerTerms?: boolean;
  rtl?: boolean;
  theme: InvoiceFormatUiTheme;
  branding: InvoiceFormatUiBranding;
  demo: InvoiceFormatUiDemo;
  blocks: InvoiceFormatUiBlock[];
};
