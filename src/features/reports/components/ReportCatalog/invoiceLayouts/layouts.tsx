import type { InvoiceFormatPreview } from '../../../types/invoiceFormatPreview.types';
import { DEMO, FormatBadge, KF, KfLogo, Shell } from './shared';

/** India GST tax invoice — dense shipment grid + SAC/CGST/SGST columns (Fresa Format-1 style). */
export function TaxIndiaLayout({ preview }: { preview: InvoiceFormatPreview }) {
  return (
    <Shell className="border-[var(--color-neutral-400)]">
      <div className="flex items-start justify-between gap-3 border-b px-3 py-2" style={{ borderColor: KF.border }}>
        <div>
          <KfLogo className="h-9" />
          <p className="mt-1 text-[11px] font-bold" style={{ color: KF.navy }}>
            {KF.company}
          </p>
          <p className="text-[9px] text-[var(--color-neutral-500)]">
            {KF.address} · WEB: {KF.web}
          </p>
          <p className="text-[9px] text-[var(--color-neutral-500)]">GSTIN: {DEMO.gstin}</p>
        </div>
        <div className="text-end">
          <p className="text-lg font-bold tracking-wide" style={{ color: KF.navy }}>
            TAX INVOICE
          </p>
          <FormatBadge preview={preview} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-0 border-b" style={{ borderColor: KF.border }}>
        <div className="border-r p-2" style={{ borderColor: KF.border }}>
          <p className="mb-1 text-[9px] font-bold uppercase" style={{ color: KF.navy }}>
            Bill To
          </p>
          <p className="font-semibold">{DEMO.billTo}</p>
          <p className="text-[var(--color-neutral-500)]">{DEMO.billAddr}</p>
          <p className="text-[var(--color-neutral-500)]">Phone: {DEMO.phone}</p>
          <p className="text-[var(--color-neutral-500)]">GSTIN No.: {DEMO.gstin}</p>
        </div>
        <div className="space-y-0.5 p-2 text-[9px]">
          <Row k="Invoice No./Date" v={`${DEMO.invoiceNo} / ${DEMO.date}`} />
          <Row k="Due Date" v={DEMO.due} />
          <Row k="Job No." v={DEMO.job} />
          <Row k="Currency" v="INR 1.000000" />
        </div>
      </div>

      <div
        className="grid grid-cols-2 gap-x-3 gap-y-0.5 border-b bg-[var(--color-neutral-50)] p-2 text-[9px]"
        style={{ borderColor: KF.border }}
      >
        <Row k="Shipper" v={DEMO.shipper} />
        <Row k="Consignee" v={DEMO.consignee} />
        <Row k="MBL / MAWB No." v={DEMO.mbl} />
        <Row k="HBL / HAWB No." v={DEMO.hbl} />
        <Row k="POL" v={DEMO.pol} />
        <Row k="POD" v={DEMO.pod} />
        <Row k="Vessel / Voyage" v={DEMO.vessel} />
        <Row k="ETD / ETA" v={`${DEMO.etd} / ${DEMO.eta}`} />
        <Row k="Container" v={DEMO.container} />
        <Row k="INCO Terms" v="CFR" />
      </div>

      <table className="w-full border-collapse text-[8px]">
        <thead>
          <tr className="bg-[var(--color-neutral-800)] text-white">
            {['SAC', 'Charges', 'Qty', 'Curr', 'Ex.Rate', 'Taxable', 'SGST%', 'SGST', 'CGST%', 'CGST', 'Amount'].map(
              (h) => (
                <th key={h} className="border border-[var(--color-neutral-600)] px-0.5 py-1 font-semibold">
                  {h}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {DEMO.lines.map((line, i) => (
            <tr key={i} className="border-b" style={{ borderColor: KF.border }}>
              <td className="border px-0.5 py-1 font-mono" style={{ borderColor: KF.border }}>
                {line.sac}
              </td>
              <td className="border px-0.5 py-1 font-medium" style={{ borderColor: KF.border }}>
                {line.desc}
              </td>
              <td className="border px-0.5 py-1 text-end" style={{ borderColor: KF.border }}>
                {line.qty}
              </td>
              <td className="border px-0.5 py-1" style={{ borderColor: KF.border }}>
                INR
              </td>
              <td className="border px-0.5 py-1 text-end" style={{ borderColor: KF.border }}>
                1.00
              </td>
              <td className="border px-0.5 py-1 text-end" style={{ borderColor: KF.border }}>
                {line.amount}
              </td>
              <td className="border px-0.5 py-1 text-end" style={{ borderColor: KF.border }}>
                9
              </td>
              <td className="border px-0.5 py-1 text-end" style={{ borderColor: KF.border }}>
                {(Number(line.amount.replace(/,/g, '')) * 0.09).toFixed(2)}
              </td>
              <td className="border px-0.5 py-1 text-end" style={{ borderColor: KF.border }}>
                9
              </td>
              <td className="border px-0.5 py-1 text-end" style={{ borderColor: KF.border }}>
                {(Number(line.amount.replace(/,/g, '')) * 0.09).toFixed(2)}
              </td>
              <td className="border px-0.5 py-1 text-end font-semibold" style={{ borderColor: KF.border }}>
                {(Number(line.amount.replace(/,/g, '')) * 1.18).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="grid grid-cols-2 gap-2 p-2">
        <div className="border p-2 text-[9px]" style={{ borderColor: KF.border }}>
          <p className="mb-1 font-bold" style={{ color: KF.navy }}>
            Bank Details
          </p>
          <p>Beneficiary: {KF.company}</p>
          <p>Bank: HDFC · A/c: XXXXXXXXXXX</p>
          <p>IFSC / SWIFT: XXXXXX</p>
          <p className="mt-2 text-[var(--color-neutral-500)]">
            Terms: Payment by cash/transfer. Discrepancies within 15 days.
          </p>
        </div>
        <div className="space-y-1 text-[9px]">
          <div className="flex justify-between border-b py-0.5" style={{ borderColor: KF.border }}>
            <span>Taxable Amount (INR)</span>
            <span className="font-semibold">{DEMO.subtotal}</span>
          </div>
          <div className="flex justify-between border-b py-0.5" style={{ borderColor: KF.border }}>
            <span>GST18-SGST9% + CGST9%</span>
            <span className="font-semibold">{DEMO.tax}</span>
          </div>
          <div
            className="flex justify-between px-1 py-1.5 font-bold text-white"
            style={{ backgroundColor: KF.navy }}
          >
            <span>Total Amount (INR)</span>
            <span>{DEMO.total}</span>
          </div>
          <p className="text-[8px] italic text-[var(--color-neutral-500)]">{DEMO.words.replace('AED', 'INR')}</p>
        </div>
      </div>
      <p className="border-t px-2 py-1 text-[8px] text-[var(--color-neutral-400)]" style={{ borderColor: KF.border }}>
        Computer generated · KingFisher Wings · Format-{preview.formatNumber}
      </p>
    </Shell>
  );
}

/** Compact summary invoice — totals-first, minimal shipment. */
export function SummaryLayout({ preview }: { preview: InvoiceFormatPreview }) {
  return (
    <Shell>
      <div className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: KF.navy }}>
        <KfLogo className="h-8 brightness-0 invert" />
        <div className="text-end text-white">
          <p className="text-base font-bold">SUMMARY INVOICE</p>
          <FormatBadge preview={preview} light />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 p-3">
        <div className="col-span-2">
          <p className="text-[9px] font-bold uppercase text-[var(--color-neutral-500)]">Bill to</p>
          <p className="text-sm font-semibold">{DEMO.billTo}</p>
          <p className="text-[var(--color-neutral-500)]">{DEMO.billAddr}</p>
        </div>
        <div className="rounded p-2 text-[9px]" style={{ backgroundColor: KF.panel }}>
          <Row k="No." v={DEMO.invoiceNo} />
          <Row k="Date" v={DEMO.date} />
          <Row k="Job" v={DEMO.job} />
        </div>
      </div>
      <div className="mx-3 mb-2 rounded border p-2 text-[9px]" style={{ borderColor: KF.border }}>
        <p>
          <span className="text-[var(--color-neutral-500)]">Route: </span>
          {DEMO.pol} → {DEMO.pod}
        </p>
        <p>
          <span className="text-[var(--color-neutral-500)]">Vessel: </span>
          {DEMO.vessel}
        </p>
      </div>
      <table className="mx-3 mb-2 w-[calc(100%-1.5rem)] border-collapse">
        <thead>
          <tr style={{ backgroundColor: KF.orange }}>
            {['#', 'Charge', 'Amount'].map((h) => (
              <th key={h} className="px-2 py-1 text-start text-white">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DEMO.lines.map((l, i) => (
            <tr key={i} className="border-b" style={{ borderColor: KF.border }}>
              <td className="px-2 py-1">{i + 1}</td>
              <td className="px-2 py-1 font-medium">{l.desc}</td>
              <td className="px-2 py-1 text-end">{l.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mx-3 mb-3 flex justify-end">
        <div className="w-40 rounded px-2 py-2 text-white" style={{ backgroundColor: KF.navy }}>
          <p className="text-[9px] opacity-80">Grand total</p>
          <p className="text-sm font-bold">
            {DEMO.currency} {DEMO.total}
          </p>
        </div>
      </div>
    </Shell>
  );
}

/** Simple invoice — company block, bill-to, charge table, VAT, bank (Fresa Format-7). */
export function SimpleLayout({ preview }: { preview: InvoiceFormatPreview }) {
  return (
    <Shell>
      <div className="px-4 pt-3 text-center">
        <KfLogo className="mx-auto h-10" />
        <p className="mt-1 text-sm font-bold" style={{ color: KF.navy }}>
          {KF.company.toUpperCase()}
        </p>
        <p className="text-[9px] text-[var(--color-neutral-500)]">
          {KF.address} · WEB: {KF.web}
        </p>
        <p className="mt-2 text-base font-bold" style={{ color: KF.navy }}>
          TAX INVOICE — {DEMO.invoiceNo}
        </p>
        <FormatBadge preview={preview} />
      </div>
      <div className="mx-4 mt-2 grid grid-cols-2 gap-3 border-y py-2" style={{ borderColor: KF.border }}>
        <div>
          <p className="text-[9px] font-bold uppercase text-[var(--color-neutral-500)]">Bill To</p>
          <p className="font-semibold">{DEMO.billTo}</p>
          <p className="text-[var(--color-neutral-500)]">{DEMO.billAddr}</p>
          <p className="text-[var(--color-neutral-500)]">Credit Term: CASH</p>
        </div>
        <div className="text-[9px]">
          <Row k="Invoice No." v={`${DEMO.invoiceNo} / ${DEMO.date}`} />
          <Row k="Reference No." v="REF-987890" />
          <Row k="Currency" v={`${DEMO.currency} 1.000000`} />
          <Row k="Narration" v={`${DEMO.job} / ${DEMO.mbl}`} />
        </div>
      </div>
      <table className="mx-4 mt-2 w-[calc(100%-2rem)] border-collapse text-[9px]">
        <thead>
          <tr className="border-b-2" style={{ borderColor: KF.navy }}>
            {['Charges', 'Unit', 'Qty', 'Amount/Qty', 'Curr', 'Ex.Rate', 'Amount'].map((h) => (
              <th key={h} className="px-1 py-1 text-start font-bold" style={{ color: KF.navy }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DEMO.lines.map((l, i) => (
            <tr key={i} className="border-b" style={{ borderColor: KF.border }}>
              <td className="px-1 py-1 font-medium">{l.desc}</td>
              <td className="px-1 py-1">{l.unit}</td>
              <td className="px-1 py-1 text-end">{l.qty}</td>
              <td className="px-1 py-1 text-end">{l.rate}</td>
              <td className="px-1 py-1">{DEMO.currency}</td>
              <td className="px-1 py-1 text-end">1.00</td>
              <td className="px-1 py-1 text-end font-semibold">{l.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mx-4 my-2 flex justify-end">
        <div className="w-48 space-y-0.5 text-[9px]">
          <div className="flex justify-between">
            <span>Sub Total</span>
            <span>{DEMO.subtotal}</span>
          </div>
          <div className="flex justify-between">
            <span>VAT-05</span>
            <span>{DEMO.tax}</span>
          </div>
          <div className="flex justify-between border-t-2 pt-1 font-bold" style={{ borderColor: KF.navy }}>
            <span>Total</span>
            <span>{DEMO.total}</span>
          </div>
        </div>
      </div>
      <div className="mx-4 mb-3 border p-2 text-[8px]" style={{ borderColor: KF.border, backgroundColor: KF.panel }}>
        <p className="font-bold">ELECTRONIC & WIRE TRANSFER</p>
        <p>
          {KF.company} · A/c #: XXXXXXXXXXX · SWIFT: XXXXXX
        </p>
      </div>
    </Shell>
  );
}

/** Bilingual Arabic / English RTL invoice (Fresa Format-8). */
export function ArabicRtlLayout({ preview }: { preview: InvoiceFormatPreview }) {
  return (
    <Shell dir="rtl" className="border-2 border-[var(--color-neutral-400)]">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-b px-3 py-2" style={{ borderColor: KF.navy }}>
        <div className="text-start">
          <p className="text-sm font-bold" style={{ color: KF.navy }}>
            فاتورة ضريبية
          </p>
          <p className="text-[9px] text-[var(--color-neutral-500)]">Tax Invoice</p>
        </div>
        <KfLogo className="h-10" />
        <div className="text-end">
          <p className="text-sm font-bold" style={{ color: KF.navy }}>
            INVOICE TAX
          </p>
          <FormatBadge preview={preview} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-0 border-b text-[9px]" style={{ borderColor: KF.border }}>
        <div className="border-l p-2" style={{ borderColor: KF.border }}>
          <p className="font-bold">العميل / Customer</p>
          <p className="font-semibold">{DEMO.billTo}</p>
          <p>{DEMO.billAddr}</p>
          <p>Phone: {DEMO.phone}</p>
          <p>GSTIN: {DEMO.gstin}</p>
        </div>
        <div className="space-y-0.5 p-2">
          <BiRow ar="رقم الفاتورة" en="Invoice No." v={DEMO.invoiceNo} />
          <BiRow ar="تاريخ الفاتورة" en="Invoice Date" v={DEMO.date} />
          <BiRow ar="تاريخ الاستحقاق" en="Due Date" v={DEMO.due} />
          <BiRow ar="رقم الضريبة" en="VAT No." v={DEMO.gstin} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 border-b p-2 text-[8px]" style={{ borderColor: KF.border }}>
        <BiRow ar="الشاحن" en="Shipper" v={DEMO.shipper} />
        <BiRow ar="المرسل إليه" en="Consignee" v={DEMO.consignee} />
        <BiRow ar="رقم الوظيفة" en="Job" v={DEMO.job} />
        <BiRow ar="السفينة" en="Vessel" v={DEMO.vessel} />
        <BiRow ar="POL" en="POL" v={DEMO.pol} />
        <BiRow ar="POD" en="POD" v={DEMO.pod} />
      </div>
      <table className="w-full border-collapse text-[8px]">
        <thead>
          <tr style={{ backgroundColor: KF.navy }}>
            {['بيان الرسوم Charge', 'العملة Curr', 'السعر Rate', 'وحدة Unit', 'بدون ضريبة excl.VAT', 'VAT%', 'المجموع Total'].map(
              (h) => (
                <th key={h} className="border border-[var(--color-neutral-600)] px-0.5 py-1 text-white">
                  {h}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {DEMO.lines.map((l, i) => (
            <tr key={i} className="border-b" style={{ borderColor: KF.border }}>
              <td className="border px-0.5 py-1" style={{ borderColor: KF.border }}>
                {l.desc}
              </td>
              <td className="border px-0.5 py-1" style={{ borderColor: KF.border }}>
                AED
              </td>
              <td className="border px-0.5 py-1 text-end" style={{ borderColor: KF.border }}>
                {l.rate}
              </td>
              <td className="border px-0.5 py-1" style={{ borderColor: KF.border }}>
                {l.unit}
              </td>
              <td className="border px-0.5 py-1 text-end" style={{ borderColor: KF.border }}>
                {l.amount}
              </td>
              <td className="border px-0.5 py-1 text-end" style={{ borderColor: KF.border }}>
                5
              </td>
              <td className="border px-0.5 py-1 text-end font-semibold" style={{ borderColor: KF.border }}>
                {(Number(l.amount.replace(/,/g, '')) * 1.05).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-between px-3 py-2 text-[9px] font-bold" style={{ backgroundColor: KF.panel }}>
        <span>Dirham Seven Hundred Fifty-Six Only · المجموع</span>
        <span>AED {DEMO.total}</span>
      </div>
    </Shell>
  );
}

/** USA numbered commercial invoice (Fresa Format-9) — Letter, numbered fields. */
export function UsaLayout({ preview }: { preview: InvoiceFormatPreview }) {
  return (
    <Shell paper="Letter">
      <div className="flex items-start justify-between border-b-2 px-3 py-2" style={{ borderColor: KF.navy }}>
        <div>
          <KfLogo className="h-9" />
          <p className="mt-1 text-[9px] font-semibold" style={{ color: KF.navy }}>
            {KF.company}
          </p>
        </div>
        <div className="text-end">
          <p className="text-xl font-bold tracking-widest" style={{ color: KF.navy }}>
            INVOICE
          </p>
          <FormatBadge preview={preview} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-1 border-b p-2 text-[8px]" style={{ borderColor: KF.border }}>
        <NumField n={1} label="Invoice No." v={DEMO.invoiceNo} />
        <NumField n={2} label="Invoice Date" v={DEMO.date} />
        <NumField n={3} label="Prepared By" v="KF Ops" />
        <NumField n={4} label="Preparer Email" v={KF.email} />
        <NumField n={6} label="Booking No." v="BK-2026-0115" />
        <NumField n={7} label="BL No's" v={DEMO.mbl} />
        <NumField n={8} label="HBL No's" v={DEMO.hbl} />
        <NumField n={9} label="File No." v={DEMO.job} />
        <NumField n={10} label="Carrier Name" v="MSC" />
      </div>
      <div className="grid grid-cols-2 gap-1 border-b p-2 text-[8px]" style={{ borderColor: KF.border }}>
        <NumField n={11} label="Place of Receipt" v="Chennai" />
        <NumField n={12} label="Port of Loading" v={DEMO.pol} />
        <NumField n={14} label="Port of Discharge" v={DEMO.pod} />
        <NumField n={15} label="Final Destination" v="Jebel Ali, UAE" />
        <NumField n={17} label="ETD Origin" v={DEMO.etd} />
        <NumField n={18} label="ETA Discharge" v={DEMO.eta} />
        <NumField n={20} label="Origin Vessel" v={DEMO.vessel} />
        <NumField n={21} label="Voyage" v="042E" />
      </div>
      <div className="grid grid-cols-2 gap-0 border-b text-[8px]" style={{ borderColor: KF.border }}>
        <div className="border-r p-2" style={{ borderColor: KF.border }}>
          <p className="font-bold">
            22. Shipper / Bill To
          </p>
          <p className="font-semibold">{DEMO.billTo}</p>
          <p>{DEMO.billAddr}</p>
        </div>
        <div className="p-2">
          <p className="font-bold">23. Payable to</p>
          <p className="font-semibold">{KF.company}</p>
          <p>{KF.address}</p>
          <p>24. Payable by: CASH</p>
        </div>
      </div>
      <table className="w-full border-collapse text-[8px]">
        <thead>
          <tr style={{ backgroundColor: KF.navy }}>
            {['30. PARTICULARS', '31. Currency', '32. AMOUNT', '33. QTY', '34. Amount'].map((h) => (
              <th key={h} className="border border-[var(--color-neutral-600)] px-1 py-1 text-start text-white">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DEMO.lines.map((l, i) => (
            <tr key={i} className="border-b" style={{ borderColor: KF.border }}>
              <td className="border px-1 py-1" style={{ borderColor: KF.border }}>
                {l.desc}
              </td>
              <td className="border px-1 py-1" style={{ borderColor: KF.border }}>
                USD
              </td>
              <td className="border px-1 py-1 text-end" style={{ borderColor: KF.border }}>
                {l.rate}
              </td>
              <td className="border px-1 py-1 text-end" style={{ borderColor: KF.border }}>
                {l.qty}
              </td>
              <td className="border px-1 py-1 text-end font-semibold" style={{ borderColor: KF.border }}>
                {l.amount}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center justify-between px-3 py-2 text-[9px]">
        <p className="italic text-[var(--color-neutral-500)]">THANK YOU FOR YOUR BUSINESS & CONTINUED SUPPORT</p>
        <p className="font-bold">
          Total: USD {DEMO.total}
        </p>
      </div>
    </Shell>
  );
}

/** Land freight — route/truck focused. */
export function LandLayout({ preview }: { preview: InvoiceFormatPreview }) {
  return (
    <Shell>
      <div className="flex h-2 w-full">
        <div className="w-1/2" style={{ backgroundColor: KF.navy }} />
        <div className="w-1/2" style={{ backgroundColor: KF.orange }} />
      </div>
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-2">
          <KfLogo className="h-9" />
          <div>
            <p className="text-[11px] font-bold" style={{ color: KF.navy }}>
              {KF.company}
            </p>
            <p className="text-[8px] text-[var(--color-neutral-500)]">Land freight & transportation</p>
          </div>
        </div>
        <div className="text-end">
          <p className="text-sm font-bold" style={{ color: KF.orange }}>
            LAND FREIGHT INVOICE
          </p>
          <FormatBadge preview={preview} />
        </div>
      </div>
      <div className="mx-3 mb-2 grid grid-cols-4 gap-1 rounded p-2 text-[8px]" style={{ backgroundColor: KF.panel }}>
        <div>
          <p className="text-[var(--color-neutral-500)]">From</p>
          <p className="font-bold">Jebel Ali WH</p>
        </div>
        <div>
          <p className="text-[var(--color-neutral-500)]">To</p>
          <p className="font-bold">Abu Dhabi</p>
        </div>
        <div>
          <p className="text-[var(--color-neutral-500)]">Truck / Trailer</p>
          <p className="font-bold">DXB-T-4421</p>
        </div>
        <div>
          <p className="text-[var(--color-neutral-500)]">Distance</p>
          <p className="font-bold">145 km</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 px-3 text-[9px]">
        <div className="rounded border p-2" style={{ borderColor: KF.border }}>
          <p className="font-bold" style={{ color: KF.navy }}>
            Bill To
          </p>
          <p>{DEMO.billTo}</p>
          <p className="text-[var(--color-neutral-500)]">{DEMO.billAddr}</p>
        </div>
        <div className="rounded border p-2" style={{ borderColor: KF.border }}>
          <Row k="Invoice" v={DEMO.invoiceNo} />
          <Row k="Date" v={DEMO.date} />
          <Row k="Job" v={DEMO.job} />
        </div>
      </div>
      <table className="mx-3 mt-2 w-[calc(100%-1.5rem)] border-collapse text-[9px]">
        <thead>
          <tr style={{ backgroundColor: KF.navy }}>
            {['Service', 'Vehicle', 'Qty', 'Rate', 'Amount'].map((h) => (
              <th key={h} className="px-1.5 py-1 text-start text-white">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[
            { d: 'Door delivery — FTL', v: 'Trailer', q: '1', r: '850.00', a: '850.00' },
            { d: 'Waiting / detention', v: 'Hour', q: '2', r: '75.00', a: '150.00' },
            { d: 'Documentation', v: 'Job', q: '1', r: '50.00', a: '50.00' },
          ].map((l, i) => (
            <tr key={i} className="border-b" style={{ borderColor: KF.border }}>
              <td className="px-1.5 py-1 font-medium">{l.d}</td>
              <td className="px-1.5 py-1">{l.v}</td>
              <td className="px-1.5 py-1 text-end">{l.q}</td>
              <td className="px-1.5 py-1 text-end">{l.r}</td>
              <td className="px-1.5 py-1 text-end font-semibold">{l.a}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="m-3 flex justify-end">
        <div className="rounded px-3 py-2 font-bold text-white" style={{ backgroundColor: KF.orange }}>
          Total AED 1,050.00
        </div>
      </div>
    </Shell>
  );
}

/** Preprinted — top margin for letterhead, dashed form boxes. */
export function PreprintedLayout({ preview }: { preview: InvoiceFormatPreview }) {
  return (
    <Shell className="border-dashed border-2">
      <div className="h-16 border-b border-dashed px-3 py-2 text-center text-[9px] text-[var(--color-neutral-400)]" style={{ borderColor: KF.border }}>
        <p>[ Pre-printed letterhead area ]</p>
        <KfLogo className="mx-auto mt-1 h-7 opacity-40" />
      </div>
      <div className="px-3 py-2 text-center">
        <p className="text-lg font-bold underline" style={{ color: KF.navy }}>
          TAX INVOICE
        </p>
        <FormatBadge preview={preview} />
      </div>
      <div className="mx-3 grid grid-cols-2 gap-2">
        <fieldset className="rounded border border-dashed p-2" style={{ borderColor: KF.muted }}>
          <legend className="px-1 text-[8px] font-bold uppercase">Bill To</legend>
          <p className="font-semibold">{DEMO.billTo}</p>
          <p className="text-[var(--color-neutral-500)]">{DEMO.billAddr}</p>
        </fieldset>
        <fieldset className="rounded border border-dashed p-2" style={{ borderColor: KF.muted }}>
          <legend className="px-1 text-[8px] font-bold uppercase">Invoice</legend>
          <Row k="No." v={DEMO.invoiceNo} />
          <Row k="Date" v={DEMO.date} />
          <Row k="Due" v={DEMO.due} />
        </fieldset>
      </div>
      <table className="mx-3 mt-2 w-[calc(100%-1.5rem)] border-collapse text-[9px]">
        <thead>
          <tr className="border-y-2 border-dashed" style={{ borderColor: KF.navy }}>
            {['Description', 'Qty', 'Rate', 'Amount'].map((h) => (
              <th key={h} className="px-1 py-1 text-start">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DEMO.lines.map((l, i) => (
            <tr key={i} className="border-b border-dashed" style={{ borderColor: KF.border }}>
              <td className="px-1 py-1">{l.desc}</td>
              <td className="px-1 py-1 text-end">{l.qty}</td>
              <td className="px-1 py-1 text-end">{l.rate}</td>
              <td className="px-1 py-1 text-end font-semibold">{l.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="m-3 text-end text-sm font-bold" style={{ color: KF.navy }}>
        Total: {DEMO.currency} {DEMO.total}
      </p>
    </Shell>
  );
}

/** Warehouse invoice — location / storage slabs. */
export function WarehouseLayout({ preview }: { preview: InvoiceFormatPreview }) {
  return (
    <Shell>
      <div className="px-3 py-2 text-white" style={{ backgroundColor: '#0F766E' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KfLogo className="h-8 brightness-0 invert" />
            <div>
              <p className="text-[11px] font-bold">{KF.company}</p>
              <p className="text-[8px] opacity-90">Warehouse & storage billing</p>
            </div>
          </div>
          <div className="text-end">
            <p className="text-sm font-bold">WAREHOUSE INVOICE</p>
            <FormatBadge preview={preview} light />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 p-3 text-[9px]">
        <div className="rounded border p-2" style={{ borderColor: KF.border }}>
          <p className="font-bold text-teal-800">Warehouse</p>
          <p>Jebel Ali WH-3</p>
          <p className="text-[var(--color-neutral-500)]">Zone B · Bay 12</p>
        </div>
        <div className="rounded border p-2" style={{ borderColor: KF.border }}>
          <p className="font-bold text-teal-800">Customer</p>
          <p>{DEMO.billTo}</p>
          <p className="text-[var(--color-neutral-500)]">{DEMO.billAddr}</p>
        </div>
        <div className="rounded border p-2" style={{ borderColor: KF.border }}>
          <Row k="Invoice" v={DEMO.invoiceNo} />
          <Row k="Period" v="01–14 Sep 2026" />
          <Row k="GRN / GDO" v="GRN-1042" />
        </div>
      </div>
      <table className="mx-3 mb-2 w-[calc(100%-1.5rem)] border-collapse text-[9px]">
        <thead>
          <tr className="bg-teal-800 text-white">
            {['SKU / Item', 'Days', 'CBM', 'Rate/day', 'Amount'].map((h) => (
              <th key={h} className="px-1.5 py-1 text-start">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[
            { s: 'Carton goods — lot A', d: '14', c: '12.5', r: '2.50', a: '437.50' },
            { s: 'Pallet storage — lot B', d: '14', c: '8.0', r: '3.00', a: '336.00' },
            { s: 'Handling in/out', d: '—', c: '—', r: '—', a: '150.00' },
          ].map((l, i) => (
            <tr key={i} className="border-b" style={{ borderColor: KF.border }}>
              <td className="px-1.5 py-1 font-medium">{l.s}</td>
              <td className="px-1.5 py-1 text-end">{l.d}</td>
              <td className="px-1.5 py-1 text-end">{l.c}</td>
              <td className="px-1.5 py-1 text-end">{l.r}</td>
              <td className="px-1.5 py-1 text-end font-semibold">{l.a}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mx-3 mb-3 flex justify-end">
        <div className="rounded bg-teal-800 px-3 py-2 font-bold text-white">Total AED 923.50</div>
      </div>
    </Shell>
  );
}

/** Vietnam debit note — bilingual VN remarks. */
export function DebitVietnamLayout({ preview }: { preview: InvoiceFormatPreview }) {
  return (
    <Shell>
      <div className="flex items-start justify-between border-b px-3 py-2" style={{ borderColor: KF.border }}>
        <div>
          <KfLogo className="h-9" />
          <p className="mt-1 text-[11px] font-bold" style={{ color: KF.navy }}>
            {KF.company}
          </p>
          <p className="text-[9px] text-[var(--color-neutral-500)]">{KF.address}</p>
        </div>
        <div className="text-end">
          <p className="text-lg font-bold text-red-700">DEBIT NOTE</p>
          <p className="text-[9px] text-[var(--color-neutral-500)]">{DEMO.invoiceNo}</p>
          <FormatBadge preview={preview} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 border-b p-2 text-[9px]" style={{ borderColor: KF.border }}>
        <div>
          <p className="font-bold">Kính Gửi (Messrs)</p>
          <p className="font-semibold">{DEMO.billTo}</p>
          <p>Người Liên Hệ / Attn: Accounting</p>
        </div>
        <div>
          <Row k="Invoice ref" v={DEMO.invoiceNo} />
          <Row k="Exchange Rate" v="VND 1" />
          <Row k="TOTAL (VND)" v="VND 15,800" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-2 border-b bg-red-50 p-2 text-[8px]" style={{ borderColor: KF.border }}>
        <Row k="POL" v={DEMO.pol} />
        <Row k="POD" v={DEMO.pod} />
        <Row k="VSL/MVSL" v={DEMO.vessel} />
        <Row k="ETD/ETA" v={`${DEMO.etd} / ${DEMO.eta}`} />
        <Row k="JOB" v={DEMO.job} />
        <Row k="HBL/MBL" v={`${DEMO.hbl} / ${DEMO.mbl}`} />
      </div>
      <table className="w-full border-collapse text-[8px]">
        <thead>
          <tr className="bg-red-800 text-white">
            {['NO', 'DESCRIPTION', 'QTY', 'UNIT', 'CUR', 'PRICE', 'TOTAL(USD)', 'TOTAL(VND)'].map((h) => (
              <th key={h} className="border border-red-900 px-0.5 py-1">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DEMO.lines.map((l, i) => (
            <tr key={i} className="border-b" style={{ borderColor: KF.border }}>
              <td className="border px-0.5 py-1 text-center" style={{ borderColor: KF.border }}>
                {i + 1}
              </td>
              <td className="border px-0.5 py-1" style={{ borderColor: KF.border }}>
                {l.desc}
              </td>
              <td className="border px-0.5 py-1 text-end" style={{ borderColor: KF.border }}>
                {l.qty}
              </td>
              <td className="border px-0.5 py-1" style={{ borderColor: KF.border }}>
                {l.unit}
              </td>
              <td className="border px-0.5 py-1" style={{ borderColor: KF.border }}>
                USD
              </td>
              <td className="border px-0.5 py-1 text-end" style={{ borderColor: KF.border }}>
                {l.rate}
              </td>
              <td className="border px-0.5 py-1 text-end" style={{ borderColor: KF.border }}>
                {l.amount}
              </td>
              <td className="border px-0.5 py-1 text-end font-semibold" style={{ borderColor: KF.border }}>
                {(Number(l.amount.replace(/,/g, '')) * 10).toFixed(0)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="p-2 text-[8px] text-[var(--color-neutral-600)]">
        <p className="font-semibold text-red-800">Remarks</p>
        <p>Please pay by cash or at VCB sell rate on payment date.</p>
        <p className="mt-1 italic">
          Vui lòng thanh toán bằng tiền mặt hoặc chuyển khoản theo tỷ giá bán ra của VCB tại thời điểm thanh toán.
        </p>
      </div>
    </Shell>
  );
}

/** Generic commercial — logo left chrome (distinct from tax_india dense GST). */
export function GenericLayout({ preview }: { preview: InvoiceFormatPreview }) {
  return (
    <Shell>
      <div className="flex h-1.5 w-full">
        <div className="w-[70%]" style={{ backgroundColor: KF.navy }} />
        <div className="w-[30%]" style={{ backgroundColor: KF.orange }} />
      </div>
      <div className="flex items-start justify-between gap-3 px-4 pt-3">
        <KfLogo className="h-11" />
        <div className="text-end">
          <p className="text-[11px] font-bold" style={{ color: KF.navy }}>
            {KF.company.toUpperCase()}
          </p>
          <p className="text-[8px] font-semibold" style={{ color: KF.orange }}>
            FREIGHT · LOGISTICS · GENERAL TRADING
          </p>
          <p className="text-[9px] text-[var(--color-neutral-500)]">{KF.phone}</p>
          <p className="text-[9px] text-[var(--color-neutral-500)]">{KF.email}</p>
        </div>
      </div>
      <div className="mt-2 flex items-end justify-between px-4">
        <div>
          <p className="text-2xl font-bold" style={{ color: KF.navy }}>
            INVOICE
          </p>
          <p className="text-[9px] text-[var(--color-neutral-500)]">COMMERCIAL INVOICE / STATEMENT OF CHARGES</p>
        </div>
        <span className="rounded-full px-3 py-1 text-[9px] font-semibold text-white" style={{ backgroundColor: KF.navy }}>
          ORIGINAL
        </span>
      </div>
      <div className="mx-4 mt-1 border-b-2" style={{ borderColor: KF.navy }} />
      <FormatBadge preview={preview} />
      <div className="mt-2 grid grid-cols-2 gap-2 px-4">
        <div className="rounded border p-2" style={{ borderColor: KF.border, backgroundColor: KF.panel }}>
          <div className="mb-1 flex items-center gap-1">
            <span className="h-2 w-1 rounded-sm" style={{ backgroundColor: KF.orange }} />
            <span className="text-[9px] font-bold" style={{ color: KF.navy }}>
              BILL TO
            </span>
          </div>
          <p className="font-semibold">{DEMO.billTo}</p>
          <p className="text-[var(--color-neutral-500)]">{DEMO.billAddr}</p>
        </div>
        <div className="rounded border p-2" style={{ borderColor: KF.border, backgroundColor: KF.panel }}>
          <div className="mb-1 flex items-center gap-1">
            <span className="h-2 w-1 rounded-sm" style={{ backgroundColor: KF.orange }} />
            <span className="text-[9px] font-bold" style={{ color: KF.navy }}>
              INVOICE DETAILS
            </span>
          </div>
          <Row k="Invoice No." v={DEMO.invoiceNo} />
          <Row k="Invoice Date" v={DEMO.date} />
          <Row k="Job / Ref" v={DEMO.job} />
          <Row k="Currency" v={DEMO.currency} />
        </div>
      </div>
      <table className="mx-4 mt-2 w-[calc(100%-2rem)] border-collapse text-[9px]">
        <thead>
          <tr style={{ backgroundColor: KF.navy }}>
            {['#', 'DESCRIPTION OF CHARGES', 'QTY', 'UNIT', 'RATE', 'AMOUNT'].map((h) => (
              <th key={h} className="px-1 py-1 text-start text-white">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DEMO.lines.map((l, i) => (
            <tr key={i} className="border-b" style={{ borderColor: KF.border }}>
              <td className="px-1 py-1">{i + 1}</td>
              <td className="px-1 py-1 font-semibold">{l.desc}</td>
              <td className="px-1 py-1 text-end">{l.qty}</td>
              <td className="px-1 py-1">{l.unit}</td>
              <td className="px-1 py-1 text-end">{l.rate}</td>
              <td className="px-1 py-1 text-end font-semibold">{l.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="m-4 flex justify-end">
        <div className="w-44 space-y-0.5 text-[9px]">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{DEMO.subtotal}</span>
          </div>
          <div className="flex justify-between">
            <span>VAT</span>
            <span>{DEMO.tax}</span>
          </div>
          <div
            className="flex justify-between px-1 py-1 font-bold text-white"
            style={{ backgroundColor: KF.navy }}
          >
            <span>Grand Total</span>
            <span>
              {DEMO.currency} {DEMO.total}
            </span>
          </div>
        </div>
      </div>
      <div className="flex h-2 w-full">
        <div className="w-[78%]" style={{ backgroundColor: KF.navy }} />
        <div className="w-[22%]" style={{ backgroundColor: KF.orange }} />
      </div>
    </Shell>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <p>
      <span className="text-[var(--color-neutral-500)]">{k}: </span>
      <span className="font-semibold">{v}</span>
    </p>
  );
}

function BiRow({ ar, en, v }: { ar: string; en: string; v: string }) {
  return (
    <p>
      <span className="text-[var(--color-neutral-500)]">
        {ar} / {en}:{' '}
      </span>
      <span className="font-semibold">{v}</span>
    </p>
  );
}

function NumField({ n, label, v }: { n: number; label: string; v: string }) {
  return (
    <div className="rounded border px-1.5 py-1" style={{ borderColor: KF.border }}>
      <p className="text-[7px] font-bold text-[var(--color-neutral-500)]">
        {n}. {label}
      </p>
      <p className="font-semibold">{v}</p>
    </div>
  );
}
