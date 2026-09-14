import type { ReactNode } from 'react';
import logo from '@/assets/logo.png';
import type { InvoiceFormatPreview } from '../../../types/invoiceFormatPreview.types';

export const KF = {
  navy: '#0A2942',
  orange: '#F47214',
  muted: '#6B7280',
  border: '#D1D5DB',
  panel: '#F3F4F6',
  company: 'KingFisher Wings Group',
  address: 'Dubai, United Arab Emirates',
  web: 'www.kingfisherwingsgroup.com',
  phone: '+971 55 5355 286',
  email: 'info@kingfisherwingsgroup.com',
} as const;

export const DEMO = {
  invoiceNo: 'KFW-INV-2026-0042',
  date: '14-Sep-2026',
  due: '28-Sep-2026',
  billTo: 'Demo Customer Trading Co.',
  billAddr: 'Plot 12, JAFZA, Dubai, UAE',
  gstin: '29AAAAA0000A1Z5',
  phone: '+971 4 000 0000',
  job: 'JOB-2026-1042',
  shipper: 'KingFisher Wings Group',
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
