import type { InvoiceFormatPdfData } from '../utils/invoiceFormatToInvoicePdfModel';
import { getHblFormatSpec } from '../constants/hblFormatCatalog';
import { getHawbFormatSpec } from '../constants/hawbFormatCatalog';
import { getArrivalNoticeFormatSpec } from '../constants/arrivalNoticeFormatCatalog';
import { getDeliveryOrderFormatSpec } from '../constants/deliveryOrderFormatCatalog';
import { getReportEnrichment } from '../registry';
import type {
  ArrivalNoticeViewModel,
  DeliveryOrderViewModel,
  HawbViewModel,
  HblViewModel,
  InvoiceDocViewModel,
  LedgerViewModel,
  ManifestViewModel,
  MawbViewModel,
  OpsListViewModel,
  PurchaseInvoiceViewModel,
  QuotationDocViewModel,
  VoucherKind,
  VoucherViewModel,
} from './types';

function partyFromLines(lines?: string[], fallbackName?: string) {
  const cleaned = (lines || []).map((l) => String(l).trim()).filter(Boolean);
  return {
    name: cleaned[0] || fallbackName,
    lines: cleaned.length ? cleaned : fallbackName ? [fallbackName] : [],
  };
}

function brandFrom(data: InvoiceFormatPdfData, logoUrl?: string) {
  return {
    companyName: data.companyName,
    companyAddress: data.companyAddress,
    companyPhone: data.companyPhone,
    companyEmail: data.companyEmail,
    companyWeb: data.companyWeb,
    logoUrl,
  };
}

export function mapToHblViewModel(
  code: string,
  data: InvoiceFormatPdfData = {},
  logoUrl?: string,
): HblViewModel {
  const spec = getHblFormatSpec(code);
  const enrichment = getReportEnrichment(code);
  return {
    ...brandFrom(data, logoUrl),
    formatCode: code,
    formatName: spec?.name || enrichment?.templateType || code,
    variant: spec?.variant || 'combined',
    blNumber: data.referenceNo || data.shipmentNumber || data.jobNumber,
    shipper: partyFromLines(data.shipperLines, data.billToName),
    consignee: partyFromLines(data.consigneeLines),
    notify: partyFromLines(data.notifyLines),
    vesselFlight: data.vesselFlight,
    pol: data.pol,
    pod: data.pod,
    etd: data.etd,
    eta: data.eta,
    referenceNo: data.referenceNo,
    jobNumber: data.jobNumber,
    shipmentNumber: data.shipmentNumber,
    commodity: data.commodity,
    tableHeaders: data.tableHeaders,
    tableRows: data.tableRows,
    entityBound: data.entityBound,
    verificationNote:
      enrichment?.verificationStatus === 'verified_sample'
        ? undefined
        : 'Internal / classic family layout — not claimed as Fresa-identical',
  };
}

export function mapToHawbViewModel(
  code: string,
  data: InvoiceFormatPdfData = {},
  logoUrl?: string,
): HawbViewModel {
  const spec = getHawbFormatSpec(code);
  const enrichment = getReportEnrichment(code);
  return {
    ...brandFrom(data, logoUrl),
    formatCode: code,
    formatName: spec?.name || code,
    hawbKind: spec?.kind || 'hawb_draft',
    awbNumber: data.referenceNo || data.shipmentNumber,
    shipper: partyFromLines(data.shipperLines, data.billToName),
    consignee: partyFromLines(data.consigneeLines),
    notify: partyFromLines(data.notifyLines),
    vesselFlight: data.vesselFlight,
    pol: data.pol,
    pod: data.pod,
    etd: data.etd,
    eta: data.eta,
    referenceNo: data.referenceNo,
    jobNumber: data.jobNumber,
    shipmentNumber: data.shipmentNumber,
    commodity: data.commodity,
    tableHeaders: data.tableHeaders,
    tableRows: data.tableRows,
    entityBound: data.entityBound,
    sampleIsFallback: Boolean(spec?.sampleIsFallback),
    verificationNote: spec?.sampleIsFallback
      ? 'No distinct Fresa CDN sample — internal design'
      : undefined,
  };
}

export function mapToMawbViewModel(
  code: string,
  data: InvoiceFormatPdfData = {},
  logoUrl?: string,
): MawbViewModel {
  const consolidator = partyFromLines(data.shipperLines, data.companyName);
  return {
    ...brandFrom(data, logoUrl),
    formatCode: code,
    formatName: code.replace(/_/g, ' '),
    mawbNumber: data.referenceNo || data.shipmentNumber,
    airlineName: data.vesselFlight,
    issuingCarrier: data.vesselFlight,
    consolidatorName: consolidator.name,
    consolidatorLines: consolidator.lines,
    vesselFlight: data.vesselFlight,
    pol: data.pol,
    pod: data.pod,
    etd: data.etd,
    eta: data.eta,
    referenceNo: data.referenceNo,
    jobNumber: data.jobNumber,
    shipmentNumber: data.shipmentNumber,
    commodity: data.commodity,
    tableHeaders: data.tableHeaders,
    tableRows: data.tableRows,
    houseRefsHeaders: data.tableHeaders,
    houseRefsRows: data.tableRows,
    entityBound: data.entityBound,
    verificationNote:
      'Master AWB layout (internal) — not claimed Fresa-identical without verified sample',
  };
}

export function mapToInvoiceDocViewModel(
  code: string,
  data: InvoiceFormatPdfData = {},
  logoUrl?: string,
  formatName?: string,
): InvoiceDocViewModel {
  return {
    ...brandFrom(data, logoUrl),
    formatCode: code,
    formatName: formatName || code,
    invoiceNumber: data.invoiceNumber,
    invoiceDate: data.invoiceDate,
    dueDate: data.dueDate,
    billToName: data.billToName,
    billToAddress: data.billToAddress,
    billToPhone: data.billToPhone,
    billToEmail: data.billToEmail,
    currencyCode: data.currencyCode,
    lines: data.lines || [],
    subtotal: data.subtotal,
    tax: data.tax,
    total: data.total,
    discount: (data as { discount?: string }).discount,
    entityBound: data.entityBound,
  };
}

export function mapToPurchaseInvoiceViewModel(
  code: string,
  data: InvoiceFormatPdfData = {},
  logoUrl?: string,
  formatName?: string,
): PurchaseInvoiceViewModel {
  return {
    ...brandFrom(data, logoUrl),
    formatCode: code,
    formatName: formatName || code,
    invoiceNumber: data.invoiceNumber,
    invoiceDate: data.invoiceDate,
    dueDate: data.dueDate,
    // Purchase face: bill-to context fields carry vendor when AP payload is mapped.
    vendorName: data.billToName,
    vendorAddress: data.billToAddress,
    vendorPhone: data.billToPhone,
    vendorEmail: data.billToEmail,
    poReference: data.referenceNo || data.jobNumber,
    currencyCode: data.currencyCode,
    lines: data.lines || [],
    subtotal: data.subtotal,
    tax: data.tax,
    total: data.total,
    discount: (data as { discount?: string }).discount,
    entityBound: data.entityBound,
  };
}

export function mapToArrivalNoticeViewModel(
  code: string,
  data: InvoiceFormatPdfData = {},
  logoUrl?: string,
): ArrivalNoticeViewModel {
  const spec = getArrivalNoticeFormatSpec(code);
  return {
    ...brandFrom(data, logoUrl),
    formatCode: code,
    formatName: spec?.name || code,
    shipper: partyFromLines(data.shipperLines),
    consignee: partyFromLines(data.consigneeLines, data.billToName),
    notify: partyFromLines(data.notifyLines),
    vesselFlight: data.vesselFlight,
    pol: data.pol,
    pod: data.pod,
    etd: data.etd,
    eta: data.eta,
    referenceNo: data.referenceNo,
    jobNumber: data.jobNumber,
    shipmentNumber: data.shipmentNumber,
    commodity: data.commodity,
    tableHeaders: data.tableHeaders,
    tableRows: data.tableRows,
    currencyCode: data.currencyCode,
    lines: data.lines || [],
    subtotal: data.subtotal,
    tax: data.tax,
    total: data.total,
    entityBound: data.entityBound,
  };
}

export function mapToDeliveryOrderViewModel(
  code: string,
  data: InvoiceFormatPdfData = {},
  logoUrl?: string,
): DeliveryOrderViewModel {
  const spec = getDeliveryOrderFormatSpec(code);
  return {
    ...brandFrom(data, logoUrl),
    formatCode: code,
    formatName: spec?.name || code,
    shipper: partyFromLines(data.shipperLines),
    consignee: partyFromLines(data.consigneeLines, data.billToName),
    notify: partyFromLines(data.notifyLines),
    vesselFlight: data.vesselFlight,
    pol: data.pol,
    pod: data.pod,
    etd: data.etd,
    eta: data.eta,
    referenceNo: data.referenceNo,
    jobNumber: data.jobNumber,
    shipmentNumber: data.shipmentNumber,
    commodity: data.commodity,
    tableHeaders: data.tableHeaders,
    tableRows: data.tableRows,
    releaseTo: data.consigneeLines?.[0] || data.billToName,
    // Do not invent instructions from commodity (Phase 6 mapping audit).
    deliveryInstructions: undefined,
    entityBound: data.entityBound,
  };
}

export function mapToManifestViewModel(
  code: string,
  data: InvoiceFormatPdfData = {},
  logoUrl?: string,
  formatName?: string,
): ManifestViewModel {
  return {
    ...brandFrom(data, logoUrl),
    formatCode: code,
    formatName: formatName || code,
    vesselFlight: data.vesselFlight,
    pol: data.pol,
    pod: data.pod,
    etd: data.etd,
    eta: data.eta,
    referenceNo: data.referenceNo,
    jobNumber: data.jobNumber,
    shipmentNumber: data.shipmentNumber,
    tableHeaders: data.tableHeaders || ['B/L', 'Shipper', 'Consignee', 'Pkgs', 'Weight', 'Commodity'],
    tableRows: data.tableRows || [],
    entityBound: data.entityBound,
  };
}

function resolveVoucherKind(code: string): VoucherKind {
  const c = code.toUpperCase();
  if (/RECEIPT_VOUCHER/i.test(c)) return 'receipt';
  if (/PAYMENT_VOUCHER/i.test(c)) return 'payment';
  return 'journal';
}

export function mapToVoucherViewModel(
  code: string,
  data: InvoiceFormatPdfData = {},
  logoUrl?: string,
  formatName?: string,
): VoucherViewModel {
  return {
    ...brandFrom(data, logoUrl),
    formatCode: code,
    formatName: formatName || code,
    voucherKind: resolveVoucherKind(code),
    voucherNumber: data.invoiceNumber || data.referenceNo,
    voucherDate: data.invoiceDate,
    partyName: data.billToName,
    currencyCode: data.currencyCode,
    lines: data.lines || [],
    subtotal: data.subtotal,
    tax: data.tax,
    total: data.total,
    entryHeaders: data.tableHeaders,
    entryRows: data.tableRows,
    entityBound: data.entityBound,
  };
}

export function mapToLedgerViewModel(
  code: string,
  data: InvoiceFormatPdfData = {},
  logoUrl?: string,
  formatName?: string,
): LedgerViewModel {
  const rows = data.tableRows || [];
  return {
    ...brandFrom(data, logoUrl),
    formatCode: code,
    formatName: formatName || code,
    partyName: data.billToName,
    // Only show balances when explicitly provided — never invent from table cells.
    openingBalance: undefined,
    closingBalance: data.total,
    tableHeaders: data.tableHeaders || ['Date', 'Doc', 'Particulars', 'Debit', 'Credit', 'Balance'],
    tableRows: rows,
    entityBound: data.entityBound,
  };
}

export function mapToOpsListViewModel(
  code: string,
  data: InvoiceFormatPdfData = {},
  logoUrl?: string,
  formatName?: string,
): OpsListViewModel {
  return {
    ...brandFrom(data, logoUrl),
    formatCode: code,
    formatName: formatName || code,
    tableHeaders: data.tableHeaders || ['Job', 'Customer', 'POL', 'POD', 'ETD', 'Status'],
    tableRows: data.tableRows || [],
    entityBound: data.entityBound,
  };
}

export function mapToQuotationDocViewModel(
  code: string,
  data: InvoiceFormatPdfData = {},
  logoUrl?: string,
  formatName?: string,
): QuotationDocViewModel {
  return {
    ...brandFrom(data, logoUrl),
    formatCode: code,
    formatName: formatName || code,
    quotationNumber: data.quotationNumber,
    validUntil: data.validUntil,
    billToName: data.billToName,
    billToAddress: data.billToAddress,
    pol: data.pol,
    pod: data.pod,
    incoterm: data.incoterm,
    currencyCode: data.currencyCode,
    lines: data.lines || [],
    subtotal: data.subtotal,
    tax: data.tax,
    total: data.total,
    entityBound: data.entityBound,
  };
}
