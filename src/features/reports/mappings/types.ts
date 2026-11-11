/**
 * View models for report templates.
 * Only fields that can be filled from existing catalogue PDF data / API context.
 * Do not invent business fields beyond what InvoiceFormatPdfData already carries.
 */

export type PartyView = {
  name?: string;
  lines: string[];
};

export type ShippingPartiesView = {
  shipper: PartyView;
  consignee: PartyView;
  notify: PartyView;
};

export type VoyageView = {
  vesselFlight?: string;
  pol?: string;
  pod?: string;
  etd?: string;
  eta?: string;
  referenceNo?: string;
  jobNumber?: string;
  shipmentNumber?: string;
};

export type BrandView = {
  companyName?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  companyWeb?: string;
  logoUrl?: string;
};

export type CargoView = {
  commodity?: string;
  tableHeaders?: string[];
  tableRows?: string[][];
};

export type ChargesView = {
  currencyCode?: string;
  lines: Array<{ description: string; qty?: string; rate?: string; amount?: string }>;
  subtotal?: string;
  tax?: string;
  total?: string;
};

export type HblViewModel = BrandView &
  ShippingPartiesView &
  VoyageView &
  CargoView & {
    formatCode: string;
    formatName: string;
    variant: string;
    blNumber?: string;
    entityBound?: boolean;
    verificationNote?: string;
  };

export type HawbViewModel = BrandView &
  ShippingPartiesView &
  VoyageView &
  CargoView & {
    formatCode: string;
    formatName: string;
    hawbKind: string;
    awbNumber?: string;
    entityBound?: boolean;
    sampleIsFallback?: boolean;
    verificationNote?: string;
  };

/** Master air waybill — airline consolidator face (not a house AWB clone). */
export type MawbViewModel = BrandView &
  VoyageView &
  CargoView & {
    formatCode: string;
    formatName: string;
    mawbNumber?: string;
    airlineName?: string;
    issuingCarrier?: string;
    consolidatorName?: string;
    consolidatorLines: string[];
    /** House AWB / shipment refs when provided by context table rows. */
    houseRefsHeaders?: string[];
    houseRefsRows?: string[][];
    entityBound?: boolean;
    verificationNote?: string;
  };

export type InvoiceDocViewModel = BrandView &
  ChargesView & {
    formatCode: string;
    formatName: string;
    invoiceNumber?: string;
    invoiceDate?: string;
    dueDate?: string;
    billToName?: string;
    billToAddress?: string;
    billToPhone?: string;
    billToEmail?: string;
    discount?: string;
    entityBound?: boolean;
  };

/** AP purchase invoice — vendor / bill-from oriented. */
export type PurchaseInvoiceViewModel = BrandView &
  ChargesView & {
    formatCode: string;
    formatName: string;
    invoiceNumber?: string;
    invoiceDate?: string;
    dueDate?: string;
    vendorName?: string;
    vendorAddress?: string;
    vendorPhone?: string;
    vendorEmail?: string;
    poReference?: string;
    discount?: string;
    entityBound?: boolean;
  };

export type ArrivalNoticeViewModel = BrandView &
  ShippingPartiesView &
  VoyageView &
  CargoView &
  ChargesView & {
    formatCode: string;
    formatName: string;
    entityBound?: boolean;
  };

export type DeliveryOrderViewModel = BrandView &
  ShippingPartiesView &
  VoyageView &
  CargoView & {
    formatCode: string;
    formatName: string;
    releaseTo?: string;
    deliveryInstructions?: string;
    entityBound?: boolean;
  };

export type ManifestViewModel = BrandView &
  VoyageView & {
    formatCode: string;
    formatName: string;
    tableHeaders?: string[];
    tableRows?: string[][];
    entityBound?: boolean;
  };

export type VoucherKind = 'payment' | 'receipt' | 'journal';

export type VoucherViewModel = BrandView &
  ChargesView & {
    formatCode: string;
    formatName: string;
    voucherKind: VoucherKind;
    voucherNumber?: string;
    voucherDate?: string;
    partyName?: string;
    /** Dr/Cr rows when table data is provided — never invented. */
    entryHeaders?: string[];
    entryRows?: string[][];
    entityBound?: boolean;
  };

export type LedgerViewModel = BrandView & {
  formatCode: string;
  formatName: string;
  partyName?: string;
  openingBalance?: string;
  closingBalance?: string;
  tableHeaders?: string[];
  tableRows?: string[][];
  entityBound?: boolean;
};

export type OpsListViewModel = BrandView & {
  formatCode: string;
  formatName: string;
  tableHeaders?: string[];
  tableRows?: string[][];
  entityBound?: boolean;
};

export type QuotationDocViewModel = BrandView &
  ChargesView & {
    formatCode: string;
    formatName: string;
    quotationNumber?: string;
    validUntil?: string;
    billToName?: string;
    billToAddress?: string;
    pol?: string;
    pod?: string;
    incoterm?: string;
    entityBound?: boolean;
  };
