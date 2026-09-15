import type { ReactNode } from 'react';
import logo from '@/assets/logo.png';
import type { InvoiceFormatPreview } from '../../../types/invoiceFormatPreview.types';

/** Issuer branding — Fresa sample company → KingFisher Logistic + KingFisher logo. */
export const KF = {
  navy: '#0A2942',
  orange: '#F47214',
  muted: '#555555',
  border: '#000000',
  /** Format-4 PDF fill (~0.953 RGB) — shared by Formats 1/2/4/5. */
  panel: '#F3F3F3',
  company: 'KingFisher Logistic',
  address: 'Dubai, United Arab Emirates',
  web: 'www.kingfisherwingsgroup.com',
  phone: '+971 55 5355 286',
  email: 'info@kingfisherwingsgroup.com',
} as const;

/** Format-4 Standard Tax Invoice palette (extracted from Fresa sample PDF). */
export const TAX_COLORS = {
  ink: '#000000',
  fill: '#F3F3F3',
  white: '#FFFFFF',
  muted: '#555555',
} as const;

/** Shared demo lines for non–tax_india layouts. */
export const DEMO = {
  invoiceNo: 'KFL-INV-2026-0042',
  date: '14-Sep-2026',
  due: '28-Sep-2026',
  billTo: 'Demo Customer Trading Co.',
  billAddr: 'Plot 12, JAFZA, Dubai, UAE',
  gstin: '29AAAAA0000A1Z5',
  phone: '+971 4 000 0000',
  job: 'JOB-2026-1042',
  shipper: 'KingFisher Logistic',
  consignee: 'Demo Customer Trading Co.',
  mbl: 'MBL-DEMO-9876',
  hbl: 'HBL-DEMO-0042',
  pol: 'INMAA — Chennai',
  pod: 'AEJEA — Jebel Ali',
  vessel: 'MSC ISABELLA / V.042E',
  etd: '01-Oct-2026',
  eta: '18-Oct-2026',
  container: "MSCU1234567 40' HC",
  currency: 'AED',
  lines: [
    { desc: 'Freight charges', unit: 'SHPT', qty: '1', rate: '1,250.00', amount: '1,250.00', sac: '9965' },
    { desc: 'Documentation fee', unit: 'DOC', qty: '1', rate: '75.00', amount: '75.00', sac: '9967' },
    { desc: 'THC origin', unit: 'CNT', qty: '1', rate: '120.00', amount: '120.00', sac: '9965' },
  ],
  subtotal: '1,445.00',
  tax: '72.25',
  total: '1,517.25',
  words: 'AED One Thousand Five Hundred Seventeen and Twenty-Five Fils Only',
};

/**
 * Demo payload mirroring Fresa Format-1 Tax Invoice India PDF field set.
 * @see https://fresatechnologies.com/wp-content/uploads/report-formats/invoice-report-format-1-tax-invoice-india.pdf
 */
export const FRESA1 = {
  invoiceNo: 'KFLINV2600717',
  date: '14-SEP-26',
  due: '28-SEP-26',
  billTo: '4G LOGISTICS INDIA PVT LTD',
  billAddr:
    '10, DBS CENTRE, NUNGAMBAKKAM HIGH ROAD, NUNGAMBAKKAM, CHENNAI, TAMIL NADU, INDIA, 600084',
  phone: 'N/A',
  gstin: 'GSTNO9876666554',
  shipper: '4G LOGISTICS INDIA PVT LTD',
  consignee: 'AL NASER TRADING COMPANY LLC',
  job: 'CEXP260148 / 14-SEP-26',
  shipment: 'B/EXP/26/0251 / 08-SEP-26',
  mbl: 'MBLC9878909999 / 07-SEP-26',
  hbl: 'PLMAAJEA00080 / 09-SEP-26',
  placeOfReceipt: 'CHENNAI',
  por: 'INMAA',
  pol: 'INMAA',
  pod: 'AEJEA',
  placeOfDelivery: 'JEBEL ALI FZE',
  vessel: 'MSC MARINA / 876',
  etd: '14-SEP-26',
  eta: '21-SEP-26',
  narration: 'B/EXP/26/0251 MBL NO. MBLC9878909999 / HBL NO. PLMAAJEA00080 / JOB NO.CEXP260148',
  reference: 'REFE NO. 987890 / 08-SEP-26',
  currency: 'INR 1.000000',
  igm: '8987777 / 11-SEP-26',
  inco: 'CFR',
  remarks: "1X20: SHIPMENT TO JEBEL ALI - CMA CGM - PO NO. 9877777 DATE: 17/01/2019",
  container: {
    no: 'TCNU9876543',
    type: "20' DC",
    pcs: '125 PACKAGES',
    gw: '18,000.000 K',
    vol: '20.000',
  },
  lines: [
    {
      desc: 'FREIGHT CHARGE',
      qty: '1',
      rate: '100.00',
      curr: 'USD',
      ex: '70.00000',
      fcy: '100.00',
      taxable: '7,000.00',
      nontax: '7,000.00',
      sgstPct: '',
      sgst: '',
      cgstPct: '',
      cgst: '',
      total: '',
    },
    {
      desc: 'TERMINAL HANDLING CHARGES 20"GP',
      qty: '1',
      rate: '5,500.00',
      curr: 'INR',
      ex: '1.00000',
      fcy: '5,500.00',
      taxable: '5,500.00',
      nontax: '',
      sgstPct: '9.00',
      sgst: '495.00',
      cgstPct: '9.00',
      cgst: '495.00',
      total: '6,490.00',
    },
    {
      desc: 'SEAL FEE',
      qty: '1',
      rate: '300.00',
      curr: 'INR',
      ex: '1.00000',
      fcy: '300.00',
      taxable: '300.00',
      nontax: '',
      sgstPct: '9.00',
      sgst: '27.00',
      cgstPct: '9.00',
      cgst: '27.00',
      total: '354.00',
    },
    {
      desc: 'BILL OF LADING',
      qty: '1',
      rate: '3,000.00',
      curr: 'INR',
      ex: '1.00000',
      fcy: '3,000.00',
      taxable: '3,000.00',
      nontax: '',
      sgstPct: '9.00',
      sgst: '270.00',
      cgstPct: '9.00',
      cgst: '270.00',
      total: '3,540.00',
    },
  ],
  taxableSum: '8,800.00',
  nontaxSum: '7,000.00',
  sgstSum: '792.00',
  cgstSum: '792.00',
  grandTotal: '17,384.00',
  words: 'Rupee Seventeen Thousand Three Hundred Eighty-Four Only',
} as const;

export function FormatBadge({
  preview,
  light = false,
}: {
  preview: InvoiceFormatPreview;
  light?: boolean;
}) {
  return (
    <p
      className={`text-[9px] uppercase tracking-wide ${
        light ? 'text-white/70' : 'text-[var(--color-neutral-400)]'
      }`}
    >
      Format-{preview.formatNumber} · {preview.layoutKind.replace(/_/g, ' ')}
    </p>
  );
}

export function KfLogo({ className = 'h-10' }: { className?: string }) {
  return <img src={logo} alt={KF.company} className={`${className} w-auto object-contain`} />;
}

export function Shell({
  children,
  paper = 'A4',
  dir = 'ltr',
  className = '',
}: {
  children: ReactNode;
  paper?: 'A4' | 'Letter';
  dir?: 'ltr' | 'rtl';
  className?: string;
}) {
  const w = paper === 'Letter' ? 'max-w-[8.5in]' : 'max-w-[210mm]';
  return (
    <div
      dir={dir}
      className={`mx-auto ${w} overflow-hidden border bg-white text-[10px] leading-snug text-[var(--color-neutral-800)] shadow-sm ${className}`}
      style={{ borderColor: KF.border }}
    >
      {children}
    </div>
  );
}
