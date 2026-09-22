import type { InvoiceFormatPreview } from '../../../types/invoiceFormatPreview.types';
import { FRESA_UI } from '../../../constants/fresaInvoiceColors';
import { KINGFISHER_TC_HEADER_FOOTER as TC } from '../../../constants/kingfisherTermsBrandColors';
import { KF, KfLogo, Shell } from './shared';
import { InvoiceUserFooter } from './InvoiceUserFooter';
import { TcBrandColorBar, TcBrandTagline } from './TcBrandChrome';

const C = FRESA_UI;

/** Formats 6–10 — distinct Fresa sample layouts + shared colorful footer. */
export function Formats6to10Layout({ preview }: { preview: InvoiceFormatPreview }) {
  switch (preview.formatNumber) {
    case 6:
      return <Format6SimpleIndia preview={preview} />;
    case 7:
      return <Format7Simple preview={preview} />;
    case 8:
      return <Format8Arabic preview={preview} />;
    case 9:
      return <Format9Usa preview={preview} />;
    case 10:
      return <Format10Standard preview={preview} />;
    default:
      return <Format7Simple preview={preview} />;
  }
}

function HeaderBand({
  preview,
  title,
  accent = TC.navy,
}: {
  preview: InvoiceFormatPreview;
  title: string;
  accent?: string;
}) {
  return (
    <>
      <div className="flex items-start gap-3 px-3 py-2" style={{ backgroundColor: C.panel }}>
        <KfLogo className="h-10 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase" style={{ color: TC.navy }}>
            {KF.company}
          </p>
          <TcBrandTagline className="mt-0.5" />
          <p className="text-[7.5px]" style={{ color: C.gray }}>
            {KF.address} · WEB : {KF.web}
          </p>
        </div>
        <div className="text-end">
          <TcBrandTagline className="mb-0.5" text="DOCUMENT" />
          <p className="text-[12px] font-bold tracking-wide" style={{ color: accent }}>
            {title}
          </p>
          <p className="text-[7px]" style={{ color: C.gray }}>
            Format-{preview.formatNumber}
          </p>
        </div>
      </div>
      <TcBrandColorBar size="sm" />
    </>
  );
}

function WireBox() {
  return (
    <div className="border p-1.5 text-[7px]" style={{ borderColor: C.navy, backgroundColor: C.offWhite }}>
      <p className="mb-0.5 font-bold" style={{ color: C.navy }}>
        ELECTRONIC &amp; WIRE TRANSFER INFORMATION
      </p>
      <p>{KF.company} ACCOUNT #: XXXXXXXXXXXXX (USD)</p>
      <p>SWIFT ID #: 0198766 · WIRE ROUTING #: 9877777 · ABA #: 9876666</p>
      <p style={{ color: C.gray }}>{KF.address}</p>
    </div>
  );
}

/** Format-6 Simple Invoice (India) — navy title, cyan table header. */
function Format6SimpleIndia({ preview }: { preview: InvoiceFormatPreview }) {
  const lines = [
    { d: 'FREIGHT CHARGES', u: 'SHPT', q: '1', r: '7,000.00', c: 'INR', e: '1.00', a: '7,000.00' },
    { d: 'TERMINAL HANDLING', u: 'CNT', q: '1', r: '5,500.00', c: 'INR', e: '1.00', a: '5,500.00' },
    { d: 'DOCUMENTATION', u: 'DOC', q: '1', r: '300.00', c: 'INR', e: '1.00', a: '300.00' },
    { d: 'BILL OF LADING', u: 'SHPT', q: '1', r: '3,000.00', c: 'INR', e: '1.00', a: '3,000.00' },
  ];
  return (
    <Shell className="text-[8px] leading-tight">
      <div className="overflow-hidden border" style={{ borderColor: C.navy }}>
        <HeaderBand preview={preview} title="TAX INVOICE" accent={C.navy} />
        <p className="border-b px-3 py-1 text-center text-[11px] font-bold" style={{ borderColor: C.cyan, color: C.navy }}>
          TAX INVOICE — KFLINV2600717
        </p>
        <div className="grid grid-cols-2 gap-2 border-b px-3 py-2" style={{ borderColor: C.hairline }}>
          <div>
            <p className="font-bold" style={{ color: C.navy }}>
              Bill To :
            </p>
            <p className="font-semibold">4G LOGISTICS INDIA PVT LTD</p>
            <p style={{ color: C.gray }}>CHENNAI, TAMIL NADU, INDIA</p>
            <p>Phone : N/A · Credit Term : CASH</p>
            <p>GSTIN : GSTNO9876666554</p>
          </div>
          <div className="space-y-0.5 text-[7.5px]">
            <p>
              <span className="font-bold">Invoice No. :</span> KFLINV2600717 / 14-SEP-26 (CREATED)
            </p>
            <p>
              <span className="font-bold">Reference No. :</span> REFE NO. 987890
            </p>
            <p>
              <span className="font-bold">Currency :</span> INR 1.000000
            </p>
            <p>
              <span className="font-bold">Narration :</span> JOB CEXP260148 / MBL MBLC9878909999
            </p>
          </div>
        </div>
        <table className="w-full border-collapse text-[7px]">
          <thead>
            <tr className="text-white" style={{ backgroundColor: C.cyan }}>
              {['Charges', 'Unit', 'Qty', 'Amount/Qty', 'Currency', 'Ex.Rate', 'Amount (INR)'].map((h) => (
                <th key={h} className="border px-1 py-1 text-start font-bold" style={{ borderColor: C.navy }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lines.map((l, i) => (
              <tr key={i} style={{ backgroundColor: i % 2 ? C.offWhite : C.white }}>
                <td className="border px-1 py-0.5 font-medium" style={{ borderColor: C.hairline }}>
                  {l.d}
                </td>
                <td className="border px-1 py-0.5" style={{ borderColor: C.hairline }}>
                  {l.u}
                </td>
                <td className="border px-1 py-0.5 text-end" style={{ borderColor: C.hairline }}>
                  {l.q}
                </td>
                <td className="border px-1 py-0.5 text-end" style={{ borderColor: C.hairline }}>
                  {l.r}
                </td>
                <td className="border px-1 py-0.5" style={{ borderColor: C.hairline }}>
                  {l.c}
                </td>
                <td className="border px-1 py-0.5 text-end" style={{ borderColor: C.hairline }}>
                  {l.e}
                </td>
                <td className="border px-1 py-0.5 text-end font-semibold" style={{ borderColor: C.hairline }}>
                  {l.a}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-end gap-6 border-b px-3 py-2" style={{ borderColor: C.hairline }}>
          <div className="w-48 space-y-0.5 text-[8px]">
            <div className="flex justify-between">
              <span>Sub Total</span>
              <span className="font-semibold">15,800.00</span>
            </div>
            <div className="flex justify-between" style={{ color: C.red }}>
              <span>GST / Tax</span>
              <span className="font-semibold">1,584.00</span>
            </div>
            <div
              className="flex justify-between px-1 py-1 font-bold text-white"
              style={{ backgroundColor: C.navy }}
            >
              <span>Total</span>
              <span>INR 17,384.00</span>
            </div>
          </div>
        </div>
        <div className="p-2">
          <WireBox />
        </div>
        <InvoiceUserFooter />
      </div>
    </Shell>
  );
}

/** Format-7 Simple Invoice — sky-blue accents, AED VAT. */
function Format7Simple({ preview }: { preview: InvoiceFormatPreview }) {
  const lines = [
    { d: 'DELIVERY ORDER CHARGES', u: 'PER SHIPMENT', q: '1', r: '275.000', a: '275.000' },
    { d: 'THC CHARGES', u: 'W/M', q: '3.035', r: '50.000', a: '151.750' },
    { d: 'DOCUMENTATION CHARGES', u: 'PER SHIPMENT', q: '1', r: '100.000', a: '100.000' },
    { d: 'HANDLING CHARGES', u: 'PER SHIPMENT', q: '1', r: '250.000', a: '250.000' },
  ];
  return (
    <Shell className="text-[8px] leading-tight">
      <div className="overflow-hidden border" style={{ borderColor: C.sky }}>
        <HeaderBand preview={preview} title="TAX INVOICE" accent={C.sky} />
        <p
          className="border-b px-3 py-1 text-center text-[11px] font-bold text-white"
          style={{ backgroundColor: C.sky, borderColor: C.sky }}
        >
          TAX INVOICE — INV1800562
        </p>
        <div className="grid grid-cols-2 gap-2 border-b px-3 py-2" style={{ borderColor: C.hairline }}>
          <div>
            <p className="font-bold" style={{ color: C.sky }}>
              Bill To :
            </p>
            <p className="font-semibold">ADUL AZIZ MOHD TAHER TRDG.EST</p>
            <p style={{ color: C.gray }}>DUBAI, UNITED ARAB EMIRATES</p>
            <p>Phone : N/A · Credit Term : CASH</p>
          </div>
          <div className="space-y-0.5 text-[7.5px]">
            <p>
              <span className="font-bold">Invoice No. :</span> INV1800562 / 27-NOV-18 (CREATED)
            </p>
            <p>
              <span className="font-bold">Reference No. :</span> REFE NO. 987890/07-NOV-18
            </p>
            <p>
              <span className="font-bold">Currency :</span> AED 1.000000
            </p>
            <p>
              <span className="font-bold">Narration :</span> BDXBSI180112 / MBL NSA.JEA.18/26917
            </p>
            <p>
              <span className="font-bold">Remarks :</span> SHIPMENT FROM INDIA - PO REF # 7778909
            </p>
          </div>
        </div>
        <table className="w-full border-collapse text-[7px]">
          <thead>
            <tr className="text-white" style={{ backgroundColor: C.sky }}>
              {['Charges', 'Unit', 'Qty', 'Amount/Qty', 'Currency', 'Ex.Rate', 'Amount (AED)'].map((h) => (
                <th key={h} className="border px-1 py-1 text-start font-bold" style={{ borderColor: C.navy }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lines.map((l, i) => (
              <tr key={i} style={{ backgroundColor: i % 2 ? C.panel : C.white }}>
                <td className="border px-1 py-0.5 font-medium" style={{ borderColor: C.hairline }}>
                  {l.d}
                </td>
                <td className="border px-1 py-0.5" style={{ borderColor: C.hairline }}>
                  {l.u}
                </td>
                <td className="border px-1 py-0.5 text-end" style={{ borderColor: C.hairline }}>
                  {l.q}
                </td>
                <td className="border px-1 py-0.5 text-end" style={{ borderColor: C.hairline }}>
                  {l.r}
                </td>
                <td className="border px-1 py-0.5" style={{ borderColor: C.hairline }}>
                  AED
                </td>
                <td className="border px-1 py-0.5 text-end" style={{ borderColor: C.hairline }}>
                  1.0000
                </td>
                <td className="border px-1 py-0.5 text-end font-semibold" style={{ borderColor: C.hairline }}>
                  {l.a}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-between gap-3 border-b px-3 py-2" style={{ borderColor: C.hairline }}>
          <p className="italic" style={{ color: C.gray }}>
            Dirham Eight Hundred Fifteen and Fifty-Nine Fils Only
          </p>
          <div className="w-44 space-y-0.5 text-[8px]">
            <div className="flex justify-between">
              <span>Sub Total :</span>
              <span>776.750</span>
            </div>
            <div className="flex justify-between" style={{ color: C.red }}>
              <span>VAT-05 :</span>
              <span>38.840</span>
            </div>
            <div
              className="flex justify-between px-1 py-1 font-bold text-white"
              style={{ backgroundColor: C.sky }}
            >
              <span>Total</span>
              <span>AED 815.590</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 p-2">
          <div className="text-[7px]">
            <p className="font-bold" style={{ color: C.navy }}>
              Terms and conditions
            </p>
            <p>Payment shall be made for full amount on or prior to due date.</p>
            <p>All bank charges are for the account of the paying remitter.</p>
          </div>
          <WireBox />
        </div>
        <InvoiceUserFooter />
      </div>
    </Shell>
  );
}

/** Format-8 Standard Invoice Arabic — bilingual RTL. */
function Format8Arabic({ preview }: { preview: InvoiceFormatPreview }) {
  return (
    <Shell dir="rtl" className="text-[8px] leading-tight">
      <div className="overflow-hidden border-2" style={{ borderColor: C.navy }}>
        <TcBrandColorBar size="sm" reverse />
        <div
          className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 py-2"
          style={{ backgroundColor: C.panel }}
        >
          <div className="text-start">
            <p className="text-sm font-bold" style={{ color: TC.navy }}>
              فاتورة ضريبية
            </p>
            <TcBrandTagline className="mt-0.5" />
            <p className="text-[8px]" style={{ color: C.gray }}>
              Tax Invoice
            </p>
          </div>
          <KfLogo className="h-10" />
          <div className="text-end">
            <TcBrandTagline className="mb-0.5" text="DOCUMENT" />
            <p className="text-sm font-bold" style={{ color: TC.navy }}>
              INVOICE TAX
            </p>
            <p className="text-[7px]" style={{ color: C.gray }}>
              Format-{preview.formatNumber} · {KF.company}
            </p>
          </div>
        </div>
        <TcBrandColorBar size="sm" reverse />
        <div className="grid grid-cols-2 border-y text-[7.5px]" style={{ borderColor: C.navy }}>
          <div className="border-l p-2" style={{ borderColor: C.navy, backgroundColor: C.offWhite }}>
            <p className="font-bold" style={{ color: C.navy }}>
              العميل / Customer
            </p>
            <p className="font-semibold">Demo Customer Trading Co.</p>
            <p>Dubai, UAE · Phone: +971 4 000 0000</p>
          </div>
          <div className="space-y-0.5 p-2">
            <p>
              <span className="font-bold">رقم الفاتورة / Invoice No. :</span> KFL-INV-0042
            </p>
            <p>
              <span className="font-bold">تاريخ / Date :</span> 14-Sep-2026
            </p>
            <p>
              <span className="font-bold">الاستحقاق / Due :</span> 28-Sep-2026
            </p>
            <p>
              <span className="font-bold">VAT No. :</span> 100000000000003
            </p>
          </div>
        </div>
        <table className="w-full border-collapse text-[7px]">
          <thead>
            <tr className="text-white" style={{ backgroundColor: C.navy }}>
              {[
                'بيان الرسوم Charge',
                'العملة Curr',
                'السعر Rate',
                'وحدة Unit',
                'بدون ضريبة excl.VAT',
                'VAT%',
                'المجموع Total',
              ].map((h) => (
                <th key={h} className="border px-0.5 py-1 font-bold" style={{ borderColor: C.sky }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ['Freight charges', 'AED', '1,250.00', 'SHPT', '1,250.00', '5', '1,312.50'],
              ['Documentation fee', 'AED', '75.00', 'DOC', '75.00', '5', '78.75'],
              ['THC origin', 'AED', '120.00', 'CNT', '120.00', '5', '126.00'],
            ].map((row, i) => (
              <tr key={i} style={{ backgroundColor: i % 2 ? C.panel : C.white }}>
                {row.map((cell, j) => (
                  <td key={j} className="border px-0.5 py-0.5" style={{ borderColor: C.hairline }}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div
          className="flex justify-between px-3 py-2 text-[9px] font-bold"
          style={{ backgroundColor: C.panel, color: C.navy }}
        >
          <span>Dirham One Thousand Five Hundred Seventeen Only · المجموع</span>
          <span>AED 1,517.25</span>
        </div>
        <div className="p-2">
          <WireBox />
        </div>
        <InvoiceUserFooter />
      </div>
    </Shell>
  );
}

/** Format-9 Standard Invoice USA — Letter, numbered fields. */
function Format9Usa({ preview }: { preview: InvoiceFormatPreview }) {
  const fields: Array<[number, string, string]> = [
    [1, 'Invoice No.', 'INV1800564'],
    [2, 'Invoice Date', '27-NOV-18'],
    [3, 'Prepared By', 'KF Ops'],
    [4, 'Preparer Email', KF.email],
    [6, 'Booking No.', 'BK-2026-0115'],
    [7, "BL No's", 'NSA.JEA.18/26917'],
    [8, "HBL No's", '500138050266'],
    [9, 'File No.', 'CCDXBSI18000061'],
    [10, 'Carrier Name / Ref', 'MSC'],
    [11, 'Place of Receipt', 'Nhava Sheva'],
    [12, 'Port of Loading', 'NHAVA SHEVA, INDIA'],
    [14, 'Port of Discharge', 'JEBEL ALI, UAE'],
    [15, 'Final Destination', 'JEBEL ALI, UAE'],
    [17, 'ETD Origin Port', '12-OCT-18'],
    [18, 'ETA Discharge Port', '24-OCT-18'],
    [20, 'Origin Vessel Name', 'NORTHERN GENERAL'],
    [21, 'Voyage', '0068'],
  ];
  return (
    <Shell paper="Letter" className="text-[8px] leading-tight">
      <div className="overflow-hidden border" style={{ borderColor: C.navy }}>
        <HeaderBand preview={preview} title="INVOICE" accent={C.navy} />
        <div
          className="grid grid-cols-3 gap-1 border-b p-2"
          style={{ borderColor: C.navy, backgroundColor: C.panel }}
        >
          {fields.map(([n, label, v]) => (
            <div key={n} className="rounded border bg-white px-1.5 py-1" style={{ borderColor: C.hairline }}>
              <p className="text-[6.5px] font-bold" style={{ color: C.navy }}>
                {n}. {label}
              </p>
              <p className="font-semibold">{v}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 border-b text-[7.5px]" style={{ borderColor: C.navy }}>
          <div className="border-r p-2" style={{ borderColor: C.navy }}>
            <p className="font-bold" style={{ color: C.navy }}>
              22. Shipper / Bill To
            </p>
            <p className="font-semibold">FRESA DEMO DUBAI LLC</p>
            <p>AL NABHA, DUBAI</p>
          </div>
          <div className="p-2">
            <p className="font-bold" style={{ color: C.navy }}>
              23. Payable to
            </p>
            <p className="font-semibold">{KF.company}</p>
            <p>24. Payable by : CASH</p>
          </div>
        </div>
        <table className="w-full border-collapse text-[7px]">
          <thead>
            <tr className="text-white" style={{ backgroundColor: C.navy }}>
              {['30. PARTICULARS', '31. Currency', '32. AMOUNT IN USD', '33. QUANTITY', '34. Amount (AED)'].map(
                (h) => (
                  <th key={h} className="border px-1 py-1 text-start font-bold" style={{ borderColor: C.sky }}>
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {[
              ['DELIVERY ORDER CHARGES', 'AED', '275.00', '1', '275.00'],
              ['THC CHARGES', 'AED', '50.00', '1.903', '95.15'],
              ['DOCUMENTATION CHARGES', 'AED', '100.00', '1', '100.00'],
              ['HANDLING CHARGES', 'AED', '250.00', '1', '250.00'],
            ].map((row, i) => (
              <tr key={i} style={{ backgroundColor: i % 2 ? C.panel : C.white }}>
                {row.map((c, j) => (
                  <td key={j} className="border px-1 py-0.5" style={{ borderColor: C.hairline }}>
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center justify-between px-3 py-2 text-[8px]">
          <p className="italic font-semibold" style={{ color: C.orange }}>
            THANK YOU FOR YOUR BUSINESS &amp; CONTINUED SUPPORT
          </p>
          <p className="font-bold" style={{ color: C.navy }}>
            Total : AED 756.16
          </p>
        </div>
        <div className="p-2">
          <WireBox />
        </div>
        <InvoiceUserFooter />
      </div>
    </Shell>
  );
}

/** Format-10 Standard Invoice — panel meta + ports. */
function Format10Standard({ preview }: { preview: InvoiceFormatPreview }) {
  return (
    <Shell className="text-[8px] leading-tight">
      <div className="overflow-hidden border" style={{ borderColor: C.navy }}>
        <HeaderBand preview={preview} title="INVOICE" accent={C.navy} />
        <div className="grid grid-cols-2 border-b" style={{ borderColor: C.navy }}>
          <div className="border-r p-2" style={{ borderColor: C.navy, backgroundColor: C.panel }}>
            <p className="font-bold" style={{ color: C.navy }}>
              Client
            </p>
            <p className="font-semibold">FRESA DEMO DUBAI LLC</p>
            <p>AL NABHA, DUBAI</p>
            <p>Phone : 04-233456 · GSTIN : 29760737473</p>
            <p>Credit Term : CASH</p>
          </div>
          <div className="space-y-0.5 p-2 text-[7.5px]">
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
              <span className="font-bold">Shipment No. :</span> BDXBSI180115 / 10-OCT-18
            </p>
            <p>
              <span className="font-bold">Department :</span> LCL IMPORT
            </p>
          </div>
        </div>
        <div
          className="grid grid-cols-2 gap-x-2 gap-y-0.5 border-b p-2 text-[7.5px]"
          style={{ borderColor: C.hairline }}
        >
          <p>
            <span className="font-bold">Shipper :</span> PAHILAJRAI JAIKISHIN AND CO
          </p>
          <p>
            <span className="font-bold">Consignee :</span> FRESA DEMO DUBAI LLC
          </p>
          <p>
            <span className="font-bold">Port of Loading :</span> NHAVA SHEVA, INDIA
          </p>
          <p>
            <span className="font-bold">Port of Discharge :</span> JEBEL ALI, UAE
          </p>
          <p>
            <span className="font-bold">MAWB/MBL No. :</span> NSA.JEA.18/26917
          </p>
          <p>
            <span className="font-bold">HAWB/HBL No. :</span> 500138050266
          </p>
          <p>
            <span className="font-bold">Vsl / Voyage :</span> NORTHERN GENERAL / 0068
          </p>
          <p>
            <span className="font-bold">ETD / ETA :</span> 12-OCT-18 / 24-OCT-18
          </p>
          <p>
            <span className="font-bold">Currency :</span> AED 1.000000
          </p>
          <p>
            <span className="font-bold">Pcs / GW / Vol :</span> 12.00 / 1,116.00 / 1.903
          </p>
        </div>
        <table className="w-full border-collapse text-[7px]">
          <thead>
            <tr className="text-white" style={{ backgroundColor: C.navy }}>
              {['Charge', 'Qty', 'Currency', 'Amount / Qty', 'Ex.Rate', 'FCY Amount', 'Amount (AED)'].map((h) => (
                <th key={h} className="border px-1 py-1 text-start font-bold" style={{ borderColor: C.sky }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ['DELIVERY ORDER CHARGES', '1.000', 'AED', '275.000', '1.000000', '275.00', '275.00'],
              ['THC CHARGES', '1.903', 'AED', '50.000', '1.000000', '95.15', '95.15'],
              ['DOCUMENTATION CHARGES', '1.000', 'AED', '100.000', '1.000000', '100.00', '100.00'],
              ['HANDLING CHARGES', '1.000', 'AED', '250.000', '1.000000', '250.00', '250.00'],
            ].map((row, i) => (
              <tr key={i} style={{ backgroundColor: i % 2 ? C.panel : C.white }}>
                {row.map((cell, j) => (
                  <td key={j} className="border px-1 py-0.5" style={{ borderColor: C.hairline }}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-between border-b px-3 py-2" style={{ borderColor: C.hairline }}>
          <p className="italic" style={{ color: C.gray }}>
            Dirham Seven Hundred Fifty-Six and Sixteen Fils Only
          </p>
          <p className="font-bold" style={{ color: C.navy }}>
            Total : AED 756.16
          </p>
        </div>
        <div className="p-2">
          <WireBox />
        </div>
        <InvoiceUserFooter />
      </div>
    </Shell>
  );
}
