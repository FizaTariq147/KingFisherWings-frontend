import type {
  InvoicePdfChargeLine,
  InvoicePdfModel,
} from '@/features/invoices/utils/generateInvoicePdf';
import type { InvoiceFormatPreview } from '../types/invoiceFormatPreview.types';

export type InvoiceFormatPdfLine = {
  description: string;
  qty?: string;
  rate?: string;
  amount?: string;
};

export type InvoiceFormatPdfData = {
  invoiceNumber?: string;
  invoiceDate?: string;
  billToName?: string;
  billToAddress?: string;
  currencyCode?: string;
  lines?: InvoiceFormatPdfLine[];
  subtotal?: string;
  tax?: string;
  total?: string;
};

function parseMoney(raw?: string): number | undefined {
  if (raw == null || !String(raw).trim()) return undefined;
  const n = Number(String(raw).replace(/,/g, ''));
  return Number.isFinite(n) ? n : undefined;
}

function parseQty(raw?: string): number | undefined {
  if (raw == null || !String(raw).trim()) return undefined;
  const n = Number(String(raw).replace(/,/g, ''));
  return Number.isFinite(n) ? n : undefined;
}

const DEMO_LINES: InvoicePdfChargeLine[] = [
  {
    description: 'Freight - Jebel Ali to Singapore',
    detail: 'Ocean FCL',
    qty: 1,
    unit: 'SHPT',
    rate: 1250,
    amount: 1250,
  },
  {
    description: 'Documentation fee',
    qty: 1,
    unit: 'DOC',
    rate: 75,
    amount: 75,
  },
  {
    description: 'THC origin',
    qty: 1,
    unit: 'CNT',
    rate: 120,
    amount: 120,
  },
];

function titlesForPreview(preview: InvoiceFormatPreview): {
  documentTitle: string;
  documentSubtitle: string;
  detailsSectionTitle: string;
  numberLabel: string;
  dateLabel: string;
  copyLabel: string;
  currencyCode: string;
  vatRate: number;
  pageSize: 'A4' | 'Letter';
  shipmentCommodity: string;
} {
  const kind = preview.layoutKind;
  const pageSize = preview.paper === 'Letter' || kind === 'usa' ? 'Letter' : 'A4';

  if (kind === 'debit_vietnam') {
    return {
      documentTitle: 'DEBIT NOTE',
      documentSubtitle: 'DEBIT NOTE / STATEMENT OF CHARGES',
      detailsSectionTitle: 'DEBIT NOTE DETAILS',
      numberLabel: 'Debit No.',
      dateLabel: 'Debit Date',
      copyLabel: 'ORIGINAL',
      currencyCode: 'USD',
      vatRate: 0,
      pageSize: 'A4',
      shipmentCommodity: 'Freight charges',
    };
  }

  if (kind === 'tax_india' || preview.showGst) {
    return {
      documentTitle: 'TAX INVOICE',
      documentSubtitle: 'TAX INVOICE / STATEMENT OF CHARGES',
      detailsSectionTitle: 'INVOICE DETAILS',
      numberLabel: 'Invoice No.',
      dateLabel: 'Invoice Date',
      copyLabel: 'ORIGINAL',
      currencyCode: 'INR',
      vatRate: 18,
      pageSize: 'A4',
      shipmentCommodity: 'Freight & logistics',
    };
  }

  if (kind === 'arabic_rtl' || preview.showArabic || preview.rtl) {
    return {
      documentTitle: 'INVOICE',
      documentSubtitle: 'TAX INVOICE / STATEMENT OF CHARGES',
      detailsSectionTitle: 'INVOICE DETAILS',
      numberLabel: 'Invoice No.',
      dateLabel: 'Invoice Date',
      copyLabel: 'ORIGINAL',
      currencyCode: 'AED',
      vatRate: 5,
      pageSize: 'A4',
      shipmentCommodity: 'Freight & logistics',
    };
  }

  if (kind === 'usa') {
    return {
      documentTitle: 'INVOICE',
      documentSubtitle: 'COMMERCIAL INVOICE / STATEMENT OF CHARGES',
      detailsSectionTitle: 'INVOICE DETAILS',
      numberLabel: 'Invoice No.',
      dateLabel: 'Invoice Date',
      copyLabel: 'ORIGINAL',
      currencyCode: 'USD',
      vatRate: 0,
      pageSize,
      shipmentCommodity: 'Freight & logistics',
    };
  }

  if (kind === 'warehouse') {
    return {
      documentTitle: 'INVOICE',
      documentSubtitle: 'WAREHOUSE INVOICE / STATEMENT OF CHARGES',
      detailsSectionTitle: 'INVOICE DETAILS',
      numberLabel: 'Invoice No.',
      dateLabel: 'Invoice Date',
      copyLabel: 'ORIGINAL',
      currencyCode: 'AED',
      vatRate: 5,
      pageSize: 'A4',
      shipmentCommodity: 'Warehouse / storage',
    };
  }

  if (kind === 'land') {
    return {
      documentTitle: 'INVOICE',
      documentSubtitle: 'LAND FREIGHT INVOICE / STATEMENT OF CHARGES',
      detailsSectionTitle: 'INVOICE DETAILS',
      numberLabel: 'Invoice No.',
      dateLabel: 'Invoice Date',
      copyLabel: 'ORIGINAL',
      currencyCode: 'AED',
      vatRate: 5,
      pageSize: 'A4',
      shipmentCommodity: 'Land freight',
    };
  }

  if (kind === 'summary') {
    return {
      documentTitle: 'INVOICE',
      documentSubtitle: 'SUMMARY INVOICE / STATEMENT OF CHARGES',
      detailsSectionTitle: 'INVOICE DETAILS',
      numberLabel: 'Invoice No.',
      dateLabel: 'Invoice Date',
      copyLabel: 'ORIGINAL',
      currencyCode: 'AED',
      vatRate: 5,
      pageSize: 'A4',
      shipmentCommodity: 'Freight & logistics',
    };
  }

  if (kind === 'simple') {
    return {
      documentTitle: 'INVOICE',
      documentSubtitle: 'INVOICE / STATEMENT OF CHARGES',
      detailsSectionTitle: 'INVOICE DETAILS',
      numberLabel: 'Invoice No.',
      dateLabel: 'Invoice Date',
      copyLabel: 'ORIGINAL',
      currencyCode: 'AED',
      vatRate: 5,
      pageSize: 'A4',
      shipmentCommodity: 'Freight & logistics',
    };
  }

  return {
    documentTitle: 'INVOICE',
    documentSubtitle: 'TAX INVOICE / STATEMENT OF CHARGES',
    detailsSectionTitle: 'INVOICE DETAILS',
    numberLabel: 'Invoice No.',
    dateLabel: 'Invoice Date',
    copyLabel: 'ORIGINAL',
    currencyCode: 'AED',
    vatRate: 5,
    pageSize,
    shipmentCommodity: 'Freight & logistics',
  };
}

/**
 * Map catalog Invoice Report Format-* preview (+ optional live data)
 * onto the shared KingFisher / Fresa-style tax-invoice PDF model.
 */
export function invoiceFormatToInvoicePdfModel(
  preview: InvoiceFormatPreview,
  data: InvoiceFormatPdfData = {},
): InvoicePdfModel {
  const meta = titlesForPreview(preview);
  const currency = (data.currencyCode || meta.currencyCode).trim().toUpperCase() || meta.currencyCode;

  const lines: InvoicePdfChargeLine[] =
    data.lines?.length
      ? data.lines.map((line) => {
          const qty = parseQty(line.qty);
          const rate = parseMoney(line.rate);
          const amount = parseMoney(line.amount);
          return {
            description: line.description || 'Charge',
            qty,
            unit: qty != null ? 'UNIT' : undefined,
            rate,
            amount: amount ?? (qty != null && rate != null ? qty * rate : undefined),
          };
        })
      : DEMO_LINES;

  const subtotal =
    parseMoney(data.subtotal) ??
    lines.reduce((sum, line) => sum + (line.amount ?? 0), 0);
  const vatAmount =
    parseMoney(data.tax) ??
    (meta.vatRate > 0 ? Math.round(subtotal * (meta.vatRate / 100) * 100) / 100 : 0);
  const grandTotal = parseMoney(data.total) ?? subtotal + vatAmount;

  const formatLabel = preview.name.replace(/Fresa/gi, 'KingFisher');

  return {
    pageSize: meta.pageSize,
    documentTitle: meta.documentTitle,
    documentSubtitle: meta.documentSubtitle,
    detailsSectionTitle: meta.detailsSectionTitle,
    numberLabel: meta.numberLabel,
    dateLabel: meta.dateLabel,
    copyLabel: meta.copyLabel,
    invoiceNumber: data.invoiceNumber || `KFW-INV-2026-00${String(preview.formatNumber).padStart(2, '0')}`,
    invoiceDate: data.invoiceDate || '14-Sep-2026',
    dueDate: '28-Sep-2026',
    jobRef: `JOB-2026-${1000 + preview.formatNumber}`,
    currencyCode: currency,
    vatRate: meta.vatRate,
    billTo: {
      client: data.billToName || 'Demo Customer Trading Co.',
      attn: 'Accounts Payable',
      phone: '+971 4 000 0000',
      email: 'ap@demo-customer.example',
      addressLines: data.billToAddress
        ? [data.billToAddress]
        : ['Plot 12, JAFZA', 'Dubai, UAE'],
      vatNumber: preview.showGst ? '29AAAAA0000A1Z5' : undefined,
    },
    shipment: {
      blAwb: 'BL-DEMO-0042',
      vesselFlight: kindVessel(preview),
      pol: 'Jebel Ali',
      pod: preview.layoutKind === 'usa' ? 'New York' : 'Singapore',
      containerNo: 'MSCU1234567',
      etdEta: '01-Oct-2026 / 18-Oct-2026',
      commodity: meta.shipmentCommodity,
      grossWtCbm: '12,500 kg / 28.4 CBM',
    },
    lines,
    subtotal,
    discount: 0,
    taxableAmount: subtotal,
    vatAmount,
    otherCharges: 0,
    grandTotal,
    advanceReceived: 0,
    balanceDue: grandTotal,
    remarks:
      `KingFisher layout for Format-${preview.formatNumber} (${formatLabel}). ` +
      'This is a computer-generated tax invoice / statement of charges. Payment is due by the due date.',
    company: {
      name: 'KingFisher Logistic',
      tagline: 'FREIGHT - LOGISTICS - GENERAL TRADING',
      phone: '+971 55 5355 286',
      email: 'info@kingfisherwingsgroup.com',
      website: 'www.kingfisherwingsgroup.com',
    },
  };
}

function kindVessel(preview: InvoiceFormatPreview): string {
  if (preview.layoutKind === 'land') return 'Truck / Road';
  if (preview.layoutKind === 'warehouse') return '—';
  if (preview.layoutKind === 'usa') return 'MAERSK DEMO / AA123';
  return 'MSC ISABELLA / V.042E';
}
