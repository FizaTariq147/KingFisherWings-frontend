import type { InvoiceFormatPreview } from '../../../types/invoiceFormatPreview.types';
import { DEMO, FormatBadge, FRESA1, KF, KfLogo, Shell, TAX_COLORS } from './shared';
import { InvoiceUserFooter } from './InvoiceUserFooter';

/**
 * Tax invoice family — Formats 1 / 2 / 4 / 5.
 * Colors match Format-4 sample PDF (black + #F3F3F3). Same footer on all.
 */
export function TaxIndiaLayout({ preview }: { preview: InvoiceFormatPreview }) {
  if (preview.formatNumber === 5) return <TaxIndiaFormat5 preview={preview} />;
  if (preview.formatNumber === 4) return <TaxIndiaFormat4 preview={preview} />;
  if (preview.formatNumber === 2) return <TaxIndiaFormat2 preview={preview} />;
  return <TaxIndiaFormat1 preview={preview} />;
}

/** Format-1 Tax Invoice India — SGST/CGST split columns. */
function TaxIndiaFormat1({ preview }: { preview: InvoiceFormatPreview }) {
  const d = FRESA1;

  return (
    <Shell className="text-[8px] leading-tight text-black">
      <div
        className="flex items-start gap-3 border-b border-black px-2 py-2"
        style={{ backgroundColor: TAX_COLORS.fill }}
      >
        <KfLogo className="h-11 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-bold uppercase tracking-wide" style={{ color: KF.navy }}>
            {KF.company}
          </p>
          <p className="text-[8px] font-semibold uppercase tracking-[0.12em]" style={{ color: KF.orange }}>
            ALL MODES OF TRANSPORT
          </p>
          <p className="text-[8px]">{KF.address}</p>
          <p className="text-[8px]">WEB : {KF.web}</p>
        </div>
      </div>

      <p
        className="border-b py-1.5 text-center text-[13px] font-bold tracking-widest"
        style={{ borderColor: KF.navy, color: KF.navy }}
      >
        TAX INVOICE
      </p>
      <p className="px-2 pt-0.5 text-[7px] text-[var(--color-neutral-400)]">
        Format-{preview.formatNumber} · tax india · KingFisher Logistic
      </p>

      <div className="grid grid-cols-2 border-b border-black">
        <div className="border-r border-black p-1.5">
          <p>
            <span className="font-bold">Bill To :</span> {d.billTo}
          </p>
          <p className="mt-0.5">{d.billAddr}</p>
          <p>
            <span className="font-bold">Phone :</span> {d.phone}
          </p>
          <p>
            <span className="font-bold">GSTIN No. :</span> {d.gstin}
          </p>
        </div>
        <div className="space-y-0.5 p-1.5">
          <p>
            <span className="font-bold">Invoice No./Date :</span> {d.invoiceNo} / {d.date}{' '}
            <span className="text-[7px]">(CREATED)</span>
          </p>
          <p>
            <span className="font-bold">Due Date :</span> {d.due}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-2 border-b border-black p-1.5">
        <F1 k="Shipper" v={d.shipper} />
        <F1 k="Consignee" v={d.consignee} />
        <F1 k="Job No." v={d.job} />
        <F1 k="Shipment No." v={d.shipment} />
        <F1 k="MBL / MAWB No." v={d.mbl} />
        <F1 k="HBL / HAWB No." v={d.hbl} />
        <F1 k="Place of Receipt" v={d.placeOfReceipt} />
        <F1 k="POR" v={d.por} />
        <F1 k="POL" v={d.pol} />
        <F1 k="POD" v={d.pod} />
        <F1 k="Place of Delivery" v={d.placeOfDelivery} />
        <F1 k="Vessel / Voyage" v={d.vessel} />
        <F1 k="ETD" v={d.etd} />
        <F1 k="ETA" v={d.eta} />
        <F1 k="Reference No." v={d.reference} />
        <F1 k="Currency" v={d.currency} />
        <F1 k="IGM No." v={d.igm} />
        <F1 k="INCO Terms" v={d.inco} />
        <div className="col-span-2">
          <F1 k="Narration" v={d.narration} />
        </div>
        <div className="col-span-2">
          <F1 k="Remarks" v={d.remarks} />
        </div>
      </div>

      <ContainerStrip />
      <GstSplitChargesTable />
      <WordsAndTotals />
      <TermsAndBank />
      <InvoiceUserFooter />
    </Shell>
  );
}

/**
 * Format-2 Tax Invoice India — client / origin-destination party block + credit term.
 * @see https://fresatechnologies.com/wp-content/uploads/report-formats/invoice-report-format-2-tax-invoice-india.pdf
 */
function TaxIndiaFormat2({ preview }: { preview: InvoiceFormatPreview }) {
  const d = FRESA1;

  return (
    <Shell className="text-[8px] leading-tight text-black">
      <div className="flex items-start justify-between gap-3 border-b border-black px-2 py-2" style={{ backgroundColor: TAX_COLORS.fill }}>
        <div className="flex items-start gap-2">
          <KfLogo className="h-10 shrink-0" />
          <div>
            <p className="text-[12px] font-bold uppercase">{KF.company}</p>
            <p className="text-[8px]">{KF.address}</p>
            <p className="text-[8px]">WEB : {KF.web}</p>
          </div>
        </div>
        <div className="text-end">
          <p className="text-[13px] font-bold tracking-widest">TAX INVOICE</p>
          <p className="text-[7px] text-[var(--color-neutral-400)]">Format-{preview.formatNumber}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 border-b border-black">
        <div className="border-r border-black p-1.5">
          <p>
            <span className="font-bold">Client :</span> {d.billTo}
          </p>
          <p className="mt-0.5">{d.billAddr}</p>
          <p>
            <span className="font-bold">Phone :</span> {d.phone}
          </p>
          <p>
            <span className="font-bold">GSTIN No. :</span> {d.gstin}
          </p>
          <p>
            <span className="font-bold">Credit Term :</span> CASH
          </p>
        </div>
        <div className="space-y-0.5 p-1.5">
          <p>
            <span className="font-bold">Invoice No. :</span> {d.invoiceNo} / {d.date} (CREATED)
          </p>
          <p>
            <span className="font-bold">Job No. :</span> {d.job}
          </p>
          <p>
            <span className="font-bold">Shipment No. :</span> {d.shipment}
          </p>
          <p>
            <span className="font-bold">Line / Subline No. :</span> 128 / 12
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-0 border-b border-black text-[7.5px]">
        <div className="border-r border-black p-1.5">
          <p className="font-bold">Shipper</p>
          <p>{d.shipper}</p>
          <p className="mt-1 font-bold">Origin</p>
          <p>CHENNAI (EX MADRAS), INDIA</p>
        </div>
        <div className="border-r border-black p-1.5">
          <p className="font-bold">Consignee</p>
          <p>{d.consignee}</p>
          <p className="mt-1 font-bold">Destination</p>
          <p>JEBEL ALI, UNITED ARAB EMIRATES</p>
        </div>
        <div className="space-y-0.5 p-1.5">
          <F1 k="MBL / MAWB No." v={d.mbl} />
          <F1 k="HBL / HAWB No." v={d.hbl} />
          <F1 k="Vessel / Voyage" v={d.vessel} />
          <F1 k="ETD" v={d.etd} />
          <F1 k="ETA" v={d.eta} />
          <F1 k="INCO Terms" v={d.inco} />
          <F1 k="Currency" v={d.currency} />
          <F1 k="Reference No." v={d.reference} />
          <F1 k="IGM No." v={d.igm} />
          <F1 k="PO No." v="987898" />
        </div>
      </div>

      <div className="border-b border-black px-1.5 py-1">
        <F1 k="Remarks" v={d.remarks} />
      </div>

      <ContainerStrip />
      <GstSplitChargesTable />
      <WordsAndTotals />
      <TermsAndBank />
      <InvoiceUserFooter />
    </Shell>
  );
}

/**
 * Format-5 — title INVOICE, combined Tax% / Tax Amount (not split SGST/CGST).
 * @see https://fresatechnologies.com/wp-content/uploads/report-formats/invoice-report-format-5-tax-invoice-india.pdf
 */
function TaxIndiaFormat5({ preview }: { preview: InvoiceFormatPreview }) {
  const d = FRESA1;
  const lines = [
    {
      desc: 'FREIGHT CHARGE',
      unit: "20' DRY CONTAINER",
      qty: '1',
      rate: '100.00',
      curr: 'USD',
      ex: '70.00000',
      fcy: '100.00',
      taxable: '7,000.00',
      nontax: '7,000.00',
      taxPct: '0.00',
      taxAmt: '0.00',
      total: '7,000.00',
    },
    {
      desc: 'TERMINAL HANDLING CHARGES 20"GP',
      unit: "20' DRY CONTAINER",
      qty: '1',
      rate: '5,500.00',
      curr: 'INR',
      ex: '1.00000',
      fcy: '5,500.00',
      taxable: '5,500.00',
      nontax: '',
      taxPct: '18.00',
      taxAmt: '990.00',
      total: '6,490.00',
    },
    {
      desc: 'SEAL FEE',
      unit: 'PER CONTAINER',
      qty: '1',
      rate: '300.00',
      curr: 'INR',
      ex: '1.00000',
      fcy: '300.00',
      taxable: '300.00',
      nontax: '',
      taxPct: '18.00',
      taxAmt: '54.00',
      total: '354.00',
    },
    {
      desc: 'BILL OF LADING',
      unit: 'PER SHIPMENT',
      qty: '1',
      rate: '3,000.00',
      curr: 'INR',
      ex: '1.00000',
      fcy: '3,000.00',
      taxable: '3,000.00',
      nontax: '',
      taxPct: '18.00',
      taxAmt: '540.00',
      total: '3,540.00',
    },
  ];

  return (
    <Shell className="text-[8px] leading-tight text-black">
      <div
        className="flex items-start gap-3 border-b border-black px-2 py-2"
        style={{ backgroundColor: TAX_COLORS.fill }}
      >
        <KfLogo className="h-11 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-bold uppercase tracking-wide" style={{ color: KF.navy }}>
            {KF.company}
          </p>
          <p className="text-[8px] font-semibold uppercase tracking-[0.12em]" style={{ color: KF.orange }}>
            ALL MODES OF TRANSPORT
          </p>
          <p className="text-[8px]">{KF.address}</p>
          <p className="text-[8px]">WEB : {KF.web}</p>
        </div>
      </div>

      <p
        className="border-b py-1.5 text-center text-[13px] font-bold tracking-widest"
        style={{ borderColor: KF.navy, color: KF.navy }}
      >
        INVOICE
      </p>
      <p className="px-2 pt-0.5 text-[7px] text-[var(--color-neutral-400)]">
        Format-{preview.formatNumber} · tax india · KingFisher Logistic
      </p>

      <div className="grid grid-cols-2 border-b border-black">
        <div className="border-r border-black p-1.5">
          <p>
            <span className="font-bold">Bill To :</span> {d.billTo}
          </p>
          <p className="mt-0.5">{d.billAddr}</p>
          <p>
            <span className="font-bold">Phone :</span> {d.phone}
          </p>
          <p>
            <span className="font-bold">GSTIN No. :</span> {d.gstin}
          </p>
        </div>
        <div className="space-y-0.5 p-1.5">
          <p>
            <span className="font-bold">Invoice No. :</span> {d.invoiceNo} / {d.date} (CREATED)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-2 border-b border-black p-1.5">
        <F1 k="Shipper" v={d.shipper} />
        <F1 k="Consignee" v={d.consignee} />
        <F1 k="Job No." v={d.job} />
        <F1 k="Shipment No." v={d.shipment} />
        <F1 k="MBL / MAWB No." v={d.mbl} />
        <F1 k="HBL / HAWB No." v={d.hbl} />
        <F1 k="Place of Receipt" v={d.placeOfReceipt} />
        <F1 k="Port of Loading" v="CHENNAI (EX MADRAS), INDIA" />
        <F1 k="Port of Discharge" v="JEBEL ALI, UNITED ARAB EMIRATES" />
        <F1 k="Place of Delivery" v={d.placeOfDelivery} />
        <F1 k="Vessel / Voyage" v={d.vessel} />
        <F1 k="ETD" v={d.etd} />
        <F1 k="ETA" v={d.eta} />
        <F1 k="Reference No." v={d.reference} />
        <F1 k="Currency" v={d.currency} />
        <F1 k="IGM No." v={d.igm} />
        <F1 k="Line / Subline No." v="128 / 12" />
        <F1 k="INCO Terms" v={d.inco} />
        <F1 k="PO No." v="987898" />
        <div className="col-span-2">
          <F1 k="Narration" v={d.narration} />
        </div>
        <div className="col-span-2">
          <F1 k="Remarks" v={d.remarks} />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] border-collapse text-[6.5px]">
          <thead>
            <tr className="bg-[#F3F3F3]">
              {[
                'Charges',
                'Unit',
                'SAC Code',
                'Qty',
                'Amount / Qty',
                'Currency',
                'Ex.Rate',
                'FCY Amount',
                'Taxable Amount',
                'Non Taxable Amount',
                'Tax%',
                'Tax Amount',
                'Total Amount (INR)',
              ].map((h) => (
                <th key={h} className="border border-black px-0.5 py-0.5 font-bold leading-tight">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lines.map((line, i) => (
              <tr key={i}>
                <td className="border border-black px-0.5 py-0.5 font-medium">{line.desc}</td>
                <td className="border border-black px-0.5 py-0.5">{line.unit}</td>
                <td className="border border-black px-0.5 py-0.5" />
                <td className="border border-black px-0.5 py-0.5 text-end">{line.qty}</td>
                <td className="border border-black px-0.5 py-0.5 text-end">{line.rate}</td>
                <td className="border border-black px-0.5 py-0.5">{line.curr}</td>
                <td className="border border-black px-0.5 py-0.5 text-end">{line.ex}</td>
                <td className="border border-black px-0.5 py-0.5 text-end">{line.fcy}</td>
                <td className="border border-black px-0.5 py-0.5 text-end">{line.taxable}</td>
                <td className="border border-black px-0.5 py-0.5 text-end">{line.nontax}</td>
                <td className="border border-black px-0.5 py-0.5 text-end">{line.taxPct}</td>
                <td className="border border-black px-0.5 py-0.5 text-end">{line.taxAmt}</td>
                <td className="border border-black px-0.5 py-0.5 text-end font-semibold">{line.total}</td>
              </tr>
            ))}
            <tr className="bg-[#F3F3F3] font-bold">
              <td className="border border-black px-0.5 py-0.5" colSpan={8}>
                Tax Amount (INR) GST18-SGST9% {d.sgstSum} GST18-CGST9% {d.cgstSum}
              </td>
              <td className="border border-black px-0.5 py-0.5 text-end">{d.taxableSum}</td>
              <td className="border border-black px-0.5 py-0.5 text-end">{d.nontaxSum}</td>
              <td className="border border-black px-0.5 py-0.5" />
              <td className="border border-black px-0.5 py-0.5 text-end">1,584.00</td>
              <td className="border border-black px-0.5 py-0.5 text-end">{d.grandTotal}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <WordsAndTotals />
      <ContainerStrip />
      <TermsAndBank />
      <InvoiceUserFooter />
    </Shell>
  );
}

/**
 * Format-4 Standard Tax Invoice (Dubai / AED) — Fresa sample colors + structure.
 * @see https://fresatechnologies.com/wp-content/uploads/report-formats/invoice-report-format-4-standard-tax-invoice.pdf
 */
function TaxIndiaFormat4({ preview }: { preview: InvoiceFormatPreview }) {
  const lines = [
    { desc: 'DELIVERY ORDER CHARGES', qty: '1.00', cur: 'AED', ex: '1.000000', rate: '275.000', tax: '5.00', fcy: '275.00', vat: '13.75', total: '288.75' },
    { desc: 'THC CHARGES', qty: '1.90', cur: 'AED', ex: '1.000000', rate: '50.000', tax: '5.00', fcy: '95.15', vat: '4.76', total: '99.91' },
    { desc: 'DOCUMENTATION CHARGES', qty: '1.00', cur: 'AED', ex: '1.000000', rate: '100.000', tax: '5.00', fcy: '100.00', vat: '5.00', total: '105.00' },
    { desc: 'HANDLING CHARGES', qty: '1.00', cur: 'AED', ex: '1.000000', rate: '250.000', tax: '5.00', fcy: '250.00', vat: '12.50', total: '262.50' },
  ];

  return (
    <Shell className="text-[8px] leading-tight text-black">
      <div className="flex items-start gap-3 border-b border-black px-2 py-2" style={{ backgroundColor: TAX_COLORS.fill }}>
        <KfLogo className="h-11 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-bold uppercase tracking-wide" style={{ color: KF.navy }}>
            {KF.company}
          </p>
          <p className="text-[8px] font-semibold uppercase tracking-[0.12em]" style={{ color: KF.orange }}>
            ALL MODES OF TRANSPORT
          </p>
          <p className="text-[8px]">{KF.address}</p>
          <p className="text-[8px]">WEB : {KF.web}</p>
        </div>
        <div className="text-end">
          <p className="text-[8px] font-semibold uppercase tracking-[0.12em]" style={{ color: KF.orange }}>
            DOCUMENT
          </p>
          <p className="text-[13px] font-bold tracking-widest" style={{ color: KF.navy }}>
            TAX INVOICE
          </p>
          <p className="text-[7px] text-[var(--color-neutral-500)]">Format-{preview.formatNumber}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 border-b border-black">
        <div className="border-r border-black p-1.5">
          <p>
            <span className="font-bold">Client :</span> FRESA DEMO DUBAI LLC
          </p>
          <p>AL NABHA, DUBAI</p>
          <p>
            <span className="font-bold">Phone :</span> 04-233456
          </p>
          <p>
            <span className="font-bold">GSTIN No. :</span> 29760737473
          </p>
          <p>
            <span className="font-bold">Credit Term :</span> CASH
          </p>
        </div>
        <div className="space-y-0.5 p-1.5">
          <p>
            <span className="font-bold">Invoice No. :</span> INV1800564
          </p>
          <p>
            <span className="font-bold">Date :</span> 27-NOV-18 (CREATED)
          </p>
          <p>
            <span className="font-bold">Job No. :</span> CCDXBSI18000061 / 27-NOV-18
          </p>
          <p>
            <span className="font-bold">Shipment No. :</span> BDXBSI180115 / 27-NOV-18
          </p>
          <p>
            <span className="font-bold">Department :</span> LCL IMPORT
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-2 border-b border-black p-1.5">
        <F1 k="Shipper" v="PAHILAJRAI JAIKISHIN AND CO" />
        <F1 k="Consignee" v="FRESA DEMO DUBAI LLC" />
        <F1 k="Origin" v="NHAVA SHEVA (JAWAHARLAL NEHRU), INDIA" />
        <F1 k="Destination" v="JEBEL ALI, UAE" />
        <F1 k="MBL No." v="NSA.JEA.18/26917 / 12-OCT-18" />
        <F1 k="HBL No." v="500138050266 / 10-OCT-18" />
        <F1 k="Vsl / Voyage" v="NORTHERN GENERAL / 0068" />
        <F1 k="ETD / ETA" v="12-Oct-18 / 24-Oct-18" />
        <F1 k="Reference No." v="REFE NO. 987890/22-NOV-18" />
        <F1 k="Currency" v="AED 1.000000" />
        <F1 k="TRN No." v="VATNO98766655555" />
        <F1 k="Total Pcs / G.Wt / Vol" v="12.00 / 1,116.00 / 1.903" />
        <div className="col-span-2">
          <F1 k="Remarks" v="SHIPMENT FROM INDIA - PO REF # 7778909 DATE 14/10/2018" />
        </div>
        <div className="col-span-2">
          <F1
            k="Narration"
            v="BDXBSI180115 Job No. CCDXBSI18000061 / MBL No. NSA.JEA.18/26917 / HBL No. 500138050266"
          />
        </div>
      </div>

      <table className="w-full border-collapse text-[7px]">
        <thead>
          <tr style={{ backgroundColor: TAX_COLORS.fill }}>
            {['Charge', 'Qty', 'Cur.', 'Ex.Rate', 'Amount / Qty', 'Tax %', 'FCY Amount', 'VAT Amount (AED)', 'Total'].map(
              (h) => (
                <th key={h} className="border border-black px-1 py-0.5 text-start font-bold">
                  {h}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {lines.map((l, i) => (
            <tr key={i}>
              <td className="border border-black px-1 py-0.5 font-medium">{l.desc}</td>
              <td className="border border-black px-1 py-0.5 text-end">{l.qty}</td>
              <td className="border border-black px-1 py-0.5">{l.cur}</td>
              <td className="border border-black px-1 py-0.5 text-end">{l.ex}</td>
              <td className="border border-black px-1 py-0.5 text-end">{l.rate}</td>
              <td className="border border-black px-1 py-0.5 text-end">{l.tax}</td>
              <td className="border border-black px-1 py-0.5 text-end">{l.fcy}</td>
              <td className="border border-black px-1 py-0.5 text-end">{l.vat}</td>
              <td className="border border-black px-1 py-0.5 text-end font-semibold">{l.total}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="grid grid-cols-2 border-b border-black">
        <div className="border-r border-black p-1.5 text-[7.5px]">
          <p className="mb-0.5 font-bold">Terms and conditions</p>
          <p className="mb-1 font-bold">ELECTRONIC &amp; WIRE TRANSFER INFORMATION</p>
          <p>{KF.company} ACCOUNT #: XXXXXXXXXXXXX (USD)</p>
          <p>SWIFT ID #: 0198766 · WIRE TRANSFER ROUTING #: 9877777</p>
          <p>ACH/DOMESTIC/ABA ROUTING #: 9876666 · {KF.address}</p>
          <p className="mt-1">
            Payment shall be made for full amount on or prior to due date, free of charges, without any
            deductions. All bank charges are for the account of the paying remitter.
          </p>
        </div>
        <div className="space-y-1 p-1.5 text-[8px]">
          <div className="flex justify-between border-b border-black py-0.5">
            <span>Sub Total :</span>
            <span className="font-semibold">720.15</span>
          </div>
          <div className="flex justify-between border-b border-black py-0.5">
            <span>VAT-05 :</span>
            <span className="font-semibold">36.01</span>
          </div>
          <div className="flex justify-between px-1 py-1 font-bold" style={{ backgroundColor: TAX_COLORS.fill }}>
            <span>Total :</span>
            <span>AED 756.16</span>
          </div>
          <p className="text-[7px] italic text-[var(--color-neutral-600)]">
            Dirham Seven Hundred Fifty-Six and Sixteen Fils Only
          </p>
        </div>
      </div>

      <InvoiceUserFooter />
    </Shell>
  );
}

function ContainerStrip() {
  const c = FRESA1.container;
  return (
    <table className="w-full border-collapse border-b border-black text-[7px]">
      <thead>
        <tr className="bg-[#F3F3F3]">
          {['Container No.', 'Type', 'No of Pcs', 'Gross Weight', 'Volume', 'Volume Weight'].map((h) => (
            <th key={h} className="border border-black px-1 py-0.5 text-start font-bold">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="border border-black px-1 py-0.5">{c.no}</td>
          <td className="border border-black px-1 py-0.5">{c.type}</td>
          <td className="border border-black px-1 py-0.5">{c.pcs}</td>
          <td className="border border-black px-1 py-0.5">{c.gw}</td>
          <td className="border border-black px-1 py-0.5">{c.vol}</td>
          <td className="border border-black px-1 py-0.5">—</td>
        </tr>
      </tbody>
    </table>
  );
}

function GstSplitChargesTable() {
  const d = FRESA1;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-[6.5px]">
        <thead>
          <tr className="bg-[#F3F3F3]">
            {[
              'Charges',
              'SAC Code',
              'Qty',
              'Amount / Qty',
              'Currency',
              'Ex.Rate',
              'FCY Amount',
              'Taxable Amount',
              'Non Taxable Amount',
              'SGST %',
              'SGST',
              'CGST %',
              'CGST',
              'I/UGST %',
              'I/UGST',
              'Total Amount (INR)',
            ].map((h) => (
              <th key={h} className="border border-black px-0.5 py-0.5 font-bold leading-tight">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {d.lines.map((line, i) => (
            <tr key={i}>
              <td className="border border-black px-0.5 py-0.5 font-medium">{line.desc}</td>
              <td className="border border-black px-0.5 py-0.5" />
              <td className="border border-black px-0.5 py-0.5 text-end">{line.qty}</td>
              <td className="border border-black px-0.5 py-0.5 text-end">{line.rate}</td>
              <td className="border border-black px-0.5 py-0.5">{line.curr}</td>
              <td className="border border-black px-0.5 py-0.5 text-end">{line.ex}</td>
              <td className="border border-black px-0.5 py-0.5 text-end">{line.fcy}</td>
              <td className="border border-black px-0.5 py-0.5 text-end">{line.taxable}</td>
              <td className="border border-black px-0.5 py-0.5 text-end">{line.nontax}</td>
              <td className="border border-black px-0.5 py-0.5 text-end">{line.sgstPct}</td>
              <td className="border border-black px-0.5 py-0.5 text-end">{line.sgst}</td>
              <td className="border border-black px-0.5 py-0.5 text-end">{line.cgstPct}</td>
              <td className="border border-black px-0.5 py-0.5 text-end">{line.cgst}</td>
              <td className="border border-black px-0.5 py-0.5" />
              <td className="border border-black px-0.5 py-0.5" />
              <td className="border border-black px-0.5 py-0.5 text-end font-semibold">{line.total}</td>
            </tr>
          ))}
          <tr className="bg-[#F3F3F3] font-bold">
            <td className="border border-black px-0.5 py-0.5" colSpan={7}>
              Tax Amount (INR) GST18-SGST9% {d.sgstSum} GST18-CGST9% {d.cgstSum}
            </td>
            <td className="border border-black px-0.5 py-0.5 text-end">{d.taxableSum}</td>
            <td className="border border-black px-0.5 py-0.5 text-end">{d.nontaxSum}</td>
            <td className="border border-black px-0.5 py-0.5" />
            <td className="border border-black px-0.5 py-0.5 text-end">{d.sgstSum}</td>
            <td className="border border-black px-0.5 py-0.5" />
            <td className="border border-black px-0.5 py-0.5 text-end">{d.cgstSum}</td>
            <td className="border border-black px-0.5 py-0.5" />
            <td className="border border-black px-0.5 py-0.5" />
            <td className="border border-black px-0.5 py-0.5 text-end">{d.grandTotal}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function WordsAndTotals() {
  const d = FRESA1;
  return (
    <div className="flex items-center justify-between border-b border-black px-2 py-1 text-[8px]">
      <p className="italic">{d.words}</p>
      <p className="font-bold">{d.grandTotal}</p>
    </div>
  );
}

function TermsAndBank() {
  return (
    <div className="grid grid-cols-2 gap-0 border-b border-black text-[7.5px]">
      <div className="border-r border-black p-1.5">
        <p className="mb-0.5 font-bold">Terms</p>
        <p>
          1. Payment to be made by cash. The company is not responsible for any cash settlement without
          an official receipt.
        </p>
        <p className="mt-0.5">
          2. Any discrepancy should be notified to us in writing within 15 days from the invoice date
          after which NONE will be accepted.
        </p>
      </div>
      <div className="p-1.5">
        <p className="mb-0.5 font-bold">Bank Details</p>
        <p>Beneficiary Name: {KF.company}</p>
        <p>Bank : HDFC</p>
        <p>A/c No : XXXXXXXXXXX</p>
        <p>IBAN Code : ABA:XXXXXX</p>
        <p>Swift Code : XXXXXX</p>
        <p>Address : {KF.address}</p>
      </div>
    </div>
  );
}

function F1({ k, v }: { k: string; v: string }) {
  return (
    <p className="truncate">
      <span className="font-bold">{k} :</span> {v}
    </p>
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
      <InvoiceUserFooter />
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
      <div className="flex items-start justify-between gap-3 px-4 pt-3">
        <KfLogo className="h-11" />
        <div className="text-end">
          <p className="text-[11px] font-bold" style={{ color: KF.navy }}>
            {KF.company.toUpperCase()}
          </p>
          <p className="text-[8px] font-semibold uppercase tracking-[0.12em]" style={{ color: KF.orange }}>
            ALL MODES OF TRANSPORT
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
      <div className="mx-4 mt-1 flex h-1 w-auto overflow-hidden">
        <div className="w-[68%]" style={{ backgroundColor: KF.navy }} />
        <div className="w-[32%]" style={{ backgroundColor: KF.orange }} />
      </div>
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
