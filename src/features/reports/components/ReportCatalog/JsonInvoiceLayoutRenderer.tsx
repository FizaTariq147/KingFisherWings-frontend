import logo from '@/assets/logo.png';
import type {
  InvoiceFormatUiBlock,
  InvoiceFormatUiDemo,
  InvoiceFormatUiLayout,
  InvoiceFormatUiTheme,
} from '../../types/invoiceFormatUiLayout.types';
import { InvoiceUserFooter } from './invoiceLayouts/InvoiceUserFooter';

type Props = {
  layout: InvoiceFormatUiLayout;
  className?: string;
  /** Override page label when compositing multi-page PDFs. */
  pageLabel?: string;
};

function themeColor(
  theme: InvoiceFormatUiTheme,
  key: 'primary' | 'accent' | 'cyan' | 'fill' | 'orange' | undefined,
  fallback: string,
): string {
  if (!key) return fallback;
  if (key === 'primary') return theme.primary;
  if (key === 'accent') return theme.accent;
  if (key === 'cyan') return theme.cyan;
  if (key === 'fill') return theme.fill;
  if (key === 'orange') return theme.orange;
  return fallback;
}

/**
 * Single renderer for all Invoice Report Format-* permanent JSON layouts.
 * Footer is pinned to the bottom of the page sheet (A4 / Letter).
 */
export function JsonInvoiceLayoutRenderer({ layout, className = '', pageLabel }: Props) {
  const { theme, branding, demo, blocks, paper, rtl } = layout;
  const maxW = paper === 'Letter' ? 'max-w-[8.5in]' : 'max-w-[210mm]';
  const minH = paper === 'Letter' ? 'min-h-[11in]' : 'min-h-[297mm]';

  const bodyBlocks = blocks.filter((b) => b.type !== 'colorfulFooter');

  return (
    <div
      dir={rtl ? 'rtl' : 'ltr'}
      className={`mx-auto flex ${minH} ${maxW} flex-col overflow-hidden border bg-white text-[10px] leading-normal shadow-sm ${className}`}
      style={{
        borderColor: theme.primary,
        color: theme.ink,
        breakInside: 'avoid',
        pageBreakInside: 'avoid',
      }}
      data-invoice-sheet="true"
    >
      <div className="flex min-h-0 flex-1 flex-col" style={{ breakInside: 'avoid' }}>
        {bodyBlocks.map((block, i) => (
          <div
            key={`${block.type}-${i}`}
            data-keep-together="true"
            style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}
          >
            <Block
              block={block}
              layout={layout}
              theme={theme}
              branding={branding}
              demo={demo}
            />
          </div>
        ))}
      </div>
      <div className="mt-auto w-full shrink-0" data-invoice-footer="sample">
        <p className="px-3 pb-1.5 text-[8px] leading-normal" style={{ color: theme.gray }}>
          This is a computer generated document and does not require a signature
        </p>
        <InvoiceUserFooter
          theme={theme}
          poweredBy={branding.company}
          pageLabel={pageLabel || 'Page 1 of 1'}
        />
      </div>
    </div>
  );
}

function Block({
  block,
  layout,
  theme,
  branding,
  demo,
}: {
  block: InvoiceFormatUiBlock;
  layout: InvoiceFormatUiLayout;
  theme: InvoiceFormatUiTheme;
  branding: InvoiceFormatUiLayout['branding'];
  demo: InvoiceFormatUiDemo;
}) {
  switch (block.type) {
    case 'colorBar':
      return (
        <div className="flex h-1.5 w-full">
          <div className="w-[55%]" style={{ backgroundColor: theme.primary }} />
          <div className="w-[20%]" style={{ backgroundColor: theme.cyan }} />
          <div className="w-[15%]" style={{ backgroundColor: theme.orange }} />
          <div className="w-[10%]" style={{ backgroundColor: theme.red }} />
        </div>
      );
    case 'companyHeader':
      return (
        <div className="flex items-start gap-3 px-4 py-3" style={{ backgroundColor: theme.panel }}>
          <img src={logo} alt={branding.company} className="h-11 w-auto object-contain" />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-bold uppercase leading-normal" style={{ color: theme.primary }}>
              {branding.company}
            </p>
            <p className="mt-0.5 text-[9px] leading-normal" style={{ color: theme.gray }}>
              {branding.address} · WEB : {branding.web}
            </p>
            {block.showContact ? (
              <p className="mt-1 text-[9px] leading-normal" style={{ color: theme.gray }}>
                {demo.billToPhone ? <>Phone : {demo.billToPhone} · </> : null}
                {demo.fax ? <>Fax : {demo.fax} · </> : null}
                {demo.vatNo ? <>VAT No. : {demo.vatNo}</> : null}
                {demo.tinNo ? <> · TIN No. : {demo.tinNo}</> : null}
              </p>
            ) : null}
          </div>
          {block.title ? (
            <div className="text-end">
              <p
                className="text-[13px] font-bold tracking-wide leading-normal"
                style={{ color: themeColor(theme, block.titleColor, theme.primary) }}
              >
                {block.title}
              </p>
            </div>
          ) : null}
        </div>
      );
    case 'docTitle':
      return (
        <p
          className={`border-b px-3 py-1.5 text-[12px] font-bold tracking-wide ${
            block.align === 'start' ? 'text-start' : block.align === 'end' ? 'text-end' : 'text-center'
          }`}
          style={{
            borderColor: theme.primary,
            color: block.band ? theme.white : theme.primary,
            backgroundColor: block.band ? theme.accent : undefined,
          }}
        >
          {block.text}
        </p>
      );
    case 'formatBadge':
      return null;
    case 'twoColumn':
      return <TwoColumn block={block} theme={theme} demo={demo} />;
    case 'fieldGrid':
      return <FieldGrid cols={block.cols ?? 2} theme={theme} demo={demo} />;
    case 'partyTriple':
      return <PartyTriple theme={theme} demo={demo} />;
    case 'containerStrip':
      return <ContainerStrip theme={theme} demo={demo} />;
    case 'chargeTable':
      return <ChargeTable theme={theme} demo={demo} headerColor={block.headerColor} />;
    case 'wordsAndTotal':
      return <WordsAndTotal theme={theme} demo={demo} />;
    case 'totalsOnly':
      return <TotalsOnly theme={theme} demo={demo} />;
    case 'termsBank':
      return <TermsBank theme={theme} demo={demo} />;
    case 'wireBox':
      return <WireBox theme={theme} demo={demo} />;
    case 'usaNumberedFields':
      return <UsaNumberedFields theme={theme} demo={demo} />;
    case 'arabicHeader':
      return <ArabicHeader theme={theme} branding={branding} layout={layout} />;
    case 'summaryHero':
      return (
        <div className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: theme.primary }}>
          <img src={logo} alt={branding.company} className="h-8 w-auto brightness-0 invert" />
          <div className="text-end text-white">
            <p className="text-base font-bold">SUMMARY INVOICE</p>
            <p className="text-[7px] text-white/70">Format-{layout.formatNumber}</p>
          </div>
        </div>
      );
    case 'landRoute':
      return (
        <div className="mx-3 my-2 grid grid-cols-4 gap-1 rounded p-2" style={{ backgroundColor: theme.panel }}>
          {(demo.fieldGrid ?? []).slice(0, 4).map((f) => (
            <div key={f.k}>
              <p style={{ color: theme.gray }}>{f.k}</p>
              <p className="font-bold">{f.v}</p>
            </div>
          ))}
        </div>
      );
    case 'letterBody':
      return (
        <div className="space-y-2 border-b px-4 py-3 leading-normal" style={{ borderColor: theme.primary }}>
          <p className="font-bold" style={{ color: theme.primary }}>
            To
          </p>
          {(demo.partyLeft?.lines ?? []).map((line) => (
            <p key={line} className="leading-normal">
              {line}
            </p>
          ))}
          {demo.billToPhone ? <p className="leading-normal">Phone : {demo.billToPhone}</p> : null}
          <p className="pt-2 font-semibold leading-normal">Dear Sir/Madam,</p>
          <p className="leading-normal" style={{ color: theme.ink }}>
            {demo.letterBody}
          </p>
        </div>
      );
    case 'signatureRow':
      return (
        <div
          className="grid gap-2 border-b px-3 py-4 text-center text-[9px] font-bold uppercase tracking-wide"
          style={{
            borderColor: theme.primary,
            gridTemplateColumns: `repeat(${Math.max(demo.signatureLabels?.length || 5, 1)}, minmax(0, 1fr))`,
          }}
        >
          {(demo.signatureLabels ?? [
            'Requested By',
            'Checked By',
            'Chq Issued By',
            'Accountant',
            'Approved By',
          ]).map((label) => (
            <div key={label} className="space-y-8">
              <div className="mx-auto h-8 w-[85%] border-b" style={{ borderColor: theme.gray }} />
              <p style={{ color: theme.primary }}>{label}</p>
            </div>
          ))}
        </div>
      );
    case 'agingSummary':
      return <AgingSummary theme={theme} demo={demo} />;
    case 'exportMetaStrip':
      return <ExportMetaStrip theme={theme} demo={demo} />;
    case 'shipmentDetails':
      return (
        <ShipmentDetails
          theme={theme}
          demo={demo}
          showIrn={block.showIrn}
          showQuotation={block.showQuotation}
          showTermsOfShipment={block.showTermsOfShipment}
          showPlaceOfSupply={block.showPlaceOfSupply}
          fcyOrder={block.fcyOrder}
        />
      );
    case 'subtotalBar':
      return <SubtotalBar theme={theme} demo={demo} variant={block.variant} />;
    case 'exportClosing':
      return <ExportClosing theme={theme} demo={demo} branding={branding} showBullets={block.showBullets} />;
    case 'format15Header':
      return <Format15Header theme={theme} demo={demo} />;
    case 'singaporeHeader':
      return <SingaporeHeader theme={theme} demo={demo} />;
    case 'singaporeGstSummary':
      return <SingaporeGstSummary theme={theme} demo={demo} />;
    case 'format7Header':
      return <Format7Header theme={theme} demo={demo} />;
    case 'format6Totals':
      return <Format6Totals theme={theme} demo={demo} />;
    case 'grandTotalDue':
      return <GrandTotalDue theme={theme} demo={demo} branding={branding} />;
    case 'exportBondBanner':
      return <ExportBondBanner theme={theme} />;
    case 'landFreightHeader':
      return <LandFreightHeader theme={theme} demo={demo} branding={branding} title={block.title} />;
    case 'jobDescription':
      return <JobDescription theme={theme} demo={demo} />;
    case 'containerNote':
      return <ContainerNote theme={theme} demo={demo} />;
    case 'stampSignature':
      return <StampSignature theme={theme} branding={branding} />;
    case 'ksaBilingualHeader':
      return <KsaBilingualHeader theme={theme} demo={demo} />;
    case 'ksaTotals':
      return <KsaTotals theme={theme} demo={demo} />;
    case 'taxAmountBox':
      return <TaxAmountBox theme={theme} demo={demo} />;
    case 'outstandingTable':
      return <OutstandingTable theme={theme} demo={demo} />;
    case 'officeAddressBand':
      return <OfficeAddressBand theme={theme} demo={demo} />;
    case 'colorfulFooter':
      // Rendered once at sheet bottom by JsonInvoiceLayoutRenderer (sticky).
      return null;
    default:
      return null;
  }
}

function TwoColumn({
  block,
  theme,
  demo,
}: {
  block: Extract<InvoiceFormatUiBlock, { type: 'twoColumn' }>;
  theme: InvoiceFormatUiTheme;
  demo: InvoiceFormatUiDemo;
}) {
  return (
    <div className="grid grid-cols-2 border-b" style={{ borderColor: theme.primary }}>
      <div className="border-r p-3" style={{ borderColor: theme.primary, backgroundColor: theme.panel }}>
        {block.showBillTo !== false ? (
          <>
            <p className="mb-1 font-bold" style={{ color: theme.primary }}>
              {demo.billToLabel || 'Bill To'} :
            </p>
            <p className="font-semibold leading-normal">{demo.billToName}</p>
            {demo.billToAddress ? (
              <p className="mt-0.5 leading-normal" style={{ color: theme.gray }}>
                {demo.billToAddress}
              </p>
            ) : null}
            {demo.billToPhone ? <p className="mt-0.5 leading-normal">Phone : {demo.billToPhone}</p> : null}
            {demo.billToGstin ? <p className="mt-0.5 leading-normal">GSTIN No. : {demo.billToGstin}</p> : null}
            {block.showCreditTerm && demo.creditTerm ? (
              <p className="mt-1 leading-normal">
                <span className="font-bold">Credit Term :</span> {demo.creditTerm}
              </p>
            ) : null}
          </>
        ) : null}
      </div>
      <div className="space-y-1 p-3">
        {(demo.metaRows ?? []).map((r) => (
          <p key={r.k} className="leading-normal">
            <span className="font-bold">{r.k} :</span> {r.v}
          </p>
        ))}
      </div>
    </div>
  );
}

function FieldGrid({
  cols,
  theme,
  demo,
}: {
  cols: 1 | 2 | 3;
  theme: InvoiceFormatUiTheme;
  demo: InvoiceFormatUiDemo;
}) {
  const fields = demo.fieldGrid ?? [];
  const colClass = cols === 1 ? 'grid-cols-1' : cols === 3 ? 'grid-cols-3' : 'grid-cols-2';
  return (
    <div
      className={`grid gap-x-3 gap-y-1.5 border-b p-3 ${colClass}`}
      style={{ borderColor: theme.primary }}
    >
      {fields.map((f) => (
        <p key={`${f.k}-${f.v}`} className="leading-normal">
          <span className="font-bold">{f.k} :</span> {f.v}
        </p>
      ))}
    </div>
  );
}

function PartyTriple({ theme, demo }: { theme: InvoiceFormatUiTheme; demo: InvoiceFormatUiDemo }) {
  const cols = demo.partyNotify ? 4 : 3;
  return (
    <div
      className={`grid border-b text-[9.5px] leading-normal ${cols === 4 ? 'grid-cols-4' : 'grid-cols-3'}`}
      style={{ borderColor: theme.primary }}
    >
      <div className="border-r p-3" style={{ borderColor: theme.primary }}>
        <p className="mb-1 font-bold" style={{ color: theme.primary }}>
          {demo.partyLeft?.title || 'Shipper'}
        </p>
        {(demo.partyLeft?.lines ?? []).map((line) => (
          <p key={line} className="mt-0.5">
            {line}
          </p>
        ))}
      </div>
      <div className="border-r p-3" style={{ borderColor: theme.primary }}>
        <p className="mb-1 font-bold" style={{ color: theme.primary }}>
          {demo.partyMid?.title || 'Consignee'}
        </p>
        {(demo.partyMid?.lines ?? []).map((line) => (
          <p key={line} className="mt-0.5">
            {line}
          </p>
        ))}
      </div>
      <div className={`${demo.partyNotify ? 'border-r' : ''} p-3`} style={{ borderColor: theme.primary }}>
        {demo.partyThird ? (
          <>
            <p className="mb-1 font-bold" style={{ color: theme.primary }}>
              {demo.partyThird.title}
            </p>
            {demo.partyThird.lines.map((line) => (
              <p key={line} className="mt-0.5">
                {line}
              </p>
            ))}
          </>
        ) : (
          <div className="space-y-1">
            {(demo.partyRight ?? []).map((r) => (
              <p key={r.k}>
                <span className="font-bold">{r.k} :</span> {r.v}
              </p>
            ))}
          </div>
        )}
      </div>
      {demo.partyNotify ? (
        <div className="p-3">
          <p className="mb-1 font-bold" style={{ color: theme.primary }}>
            {demo.partyNotify.title}
          </p>
          {demo.partyNotify.lines.map((line) => (
            <p key={line} className="mt-0.5">
              {line}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function AgingSummary({ theme, demo }: { theme: InvoiceFormatUiTheme; demo: InvoiceFormatUiDemo }) {
  const headers = demo.agingHeaders ?? [];
  const row = demo.agingRow ?? [];
  if (!headers.length) return null;
  return (
    <div className="border-b px-3 py-2" style={{ borderColor: theme.primary }}>
      <p className="mb-1 font-bold" style={{ color: theme.primary }}>
        Aging
      </p>
      <table className="w-full border-collapse text-[9px] leading-normal">
        <thead>
          <tr style={{ backgroundColor: theme.fill }}>
            {headers.map((h) => (
              <th key={h} className="border px-1.5 py-1 text-start font-bold" style={{ borderColor: theme.primary }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {row.map((c, i) => (
              <td key={i} className="border px-1.5 py-1 font-semibold" style={{ borderColor: theme.primary }}>
                {c}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function ContainerStrip({ theme, demo }: { theme: InvoiceFormatUiTheme; demo: InvoiceFormatUiDemo }) {
  const headers = demo.containerHeaders ?? [];
  const row = demo.containerRow ?? [];
  if (!headers.length) return null;
  return (
    <table className="w-full border-collapse border-b text-[9px] leading-normal" style={{ borderColor: theme.primary }}>
      <thead>
        <tr style={{ backgroundColor: theme.fill }}>
          {headers.map((h) => (
            <th key={h} className="border px-1.5 py-1.5 text-start font-bold" style={{ borderColor: theme.primary }}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr>
          {row.map((c, i) => (
            <td key={i} className="border px-1.5 py-1.5" style={{ borderColor: theme.primary }}>
              {c}
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  );
}

function ChargeTable({
  theme,
  demo,
  headerColor,
}: {
  theme: InvoiceFormatUiTheme;
  demo: InvoiceFormatUiDemo;
  headerColor?: 'primary' | 'accent' | 'cyan' | 'fill' | 'orange';
}) {
  const headers = demo.tableHeaders ?? [];
  const rows = demo.tableRows ?? [];
  const bg = themeColor(theme, headerColor, theme.fill);
  const fg = headerColor === 'fill' || headerColor === 'cyan' ? theme.ink : theme.white;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] border-collapse text-[9px] leading-normal">
        <thead>
          <tr style={{ backgroundColor: bg, color: fg }}>
            {headers.map((h) => (
              <th key={h} className="border px-1.5 py-1.5 text-start font-bold" style={{ borderColor: theme.primary }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ backgroundColor: ri % 2 ? theme.panel : theme.white }}>
              {row.map((cell, ci) => (
                <td key={ci} className="border px-1.5 py-1.5" style={{ borderColor: theme.fill }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function WordsAndTotal({ theme, demo }: { theme: InvoiceFormatUiTheme; demo: InvoiceFormatUiDemo }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b px-4 py-3" style={{ borderColor: theme.primary }}>
      <p className="italic leading-normal" style={{ color: theme.gray }}>
        {demo.words || demo.thankYou || ''}
      </p>
      <p className="shrink-0 text-[11px] font-bold" style={{ color: theme.primary }}>
        {demo.totalLabel ? `${demo.totalLabel} : ` : ''}
        {demo.total}
      </p>
    </div>
  );
}

function TotalsOnly({ theme, demo }: { theme: InvoiceFormatUiTheme; demo: InvoiceFormatUiDemo }) {
  return (
    <div className="flex justify-end border-b px-4 py-3" style={{ borderColor: theme.fill }}>
      <div className="w-52 space-y-1.5 text-[10px] leading-normal">
        {demo.subtotal ? (
          <div className="flex justify-between">
            <span>Sub Total</span>
            <span className="font-semibold">{demo.subtotal}</span>
          </div>
        ) : null}
        {demo.tax ? (
          <div className="flex justify-between" style={{ color: theme.red }}>
            <span>{demo.taxLabel || 'Tax'}</span>
            <span className="font-semibold">{demo.tax}</span>
          </div>
        ) : null}
        <div
          className="flex justify-between px-2 py-1.5 font-bold text-white"
          style={{ backgroundColor: theme.primary }}
        >
          <span>{demo.totalLabel || 'Total'}</span>
          <span>{demo.total}</span>
        </div>
      </div>
    </div>
  );
}

function TermsBank({ theme, demo }: { theme: InvoiceFormatUiTheme; demo: InvoiceFormatUiDemo }) {
  return (
    <div className="grid grid-cols-2 border-b text-[9.5px] leading-normal" style={{ borderColor: theme.primary }}>
      <div className="border-r p-3" style={{ borderColor: theme.primary }}>
        <p className="mb-1.5 font-bold" style={{ color: theme.primary }}>
          Terms
        </p>
        {(demo.termsLines ?? []).map((line) => (
          <p key={line} className="mt-1">
            {line}
          </p>
        ))}
      </div>
      <div className="p-3">
        <p className="mb-1.5 font-bold" style={{ color: theme.primary }}>
          Bank Details
        </p>
        {(demo.bankLines ?? []).map((line) => (
          <p key={line} className="mt-0.5">
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}

function WireBox({ theme, demo }: { theme: InvoiceFormatUiTheme; demo: InvoiceFormatUiDemo }) {
  return (
    <div
      className="m-3 border p-3 text-[9px] leading-normal"
      style={{ borderColor: theme.primary, backgroundColor: theme.panel }}
    >
      <p className="mb-1.5 font-bold" style={{ color: theme.primary }}>
        ELECTRONIC &amp; WIRE TRANSFER INFORMATION
      </p>
      {(demo.wireLines ?? []).map((line) => (
        <p key={line} className="mt-0.5">
          {line}
        </p>
      ))}
    </div>
  );
}

function UsaNumberedFields({ theme, demo }: { theme: InvoiceFormatUiTheme; demo: InvoiceFormatUiDemo }) {
  return (
    <div
      className="grid grid-cols-3 gap-2 border-b p-3"
      style={{ borderColor: theme.primary, backgroundColor: theme.panel }}
    >
      {(demo.numberedFields ?? []).map((f) => (
        <div key={f.n} className="rounded border bg-white px-2 py-2" style={{ borderColor: theme.fill }}>
          <p className="text-[8.5px] font-bold leading-normal" style={{ color: theme.primary }}>
            {f.n}. {f.label}
          </p>
          <p className="mt-1 font-semibold leading-normal">{f.value}</p>
        </div>
      ))}
    </div>
  );
}

function ArabicHeader({
  theme,
  branding,
  layout,
}: {
  theme: InvoiceFormatUiTheme;
  branding: InvoiceFormatUiLayout['branding'];
  layout: InvoiceFormatUiLayout;
}) {
  return (
    <div
      className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 py-2"
      style={{ backgroundColor: theme.panel }}
    >
      <div className="text-start">
        <p className="text-sm font-bold" style={{ color: theme.primary }}>
          فاتورة ضريبية
        </p>
        <p className="text-[8px]" style={{ color: theme.gray }}>
          Tax Invoice
        </p>
      </div>
      <img src={logo} alt={branding.company} className="h-10 w-auto object-contain" />
      <div className="text-end">
        <p className="text-sm font-bold" style={{ color: theme.primary }}>
          INVOICE TAX
        </p>
        <p className="text-[7px]" style={{ color: theme.gray }}>
          Format-{layout.formatNumber} · {branding.company}
        </p>
      </div>
    </div>
  );
}

function ExportMetaStrip({ theme, demo }: { theme: InvoiceFormatUiTheme; demo: InvoiceFormatUiDemo }) {
  const rows = demo.metaRows ?? [];
  if (!rows.length) return null;
  return (
    <div
      className="grid grid-cols-3 gap-x-3 gap-y-1 border-b px-3 py-2 text-[9px] leading-normal"
      style={{ borderColor: theme.primary, backgroundColor: theme.white }}
    >
      {rows.map((r) => (
        <p key={r.k}>
          <span className="font-bold">{r.k}</span> {r.v}
        </p>
      ))}
    </div>
  );
}

function ShipmentDetails({
  theme,
  demo,
  showIrn,
  showQuotation,
  showTermsOfShipment,
  showPlaceOfSupply,
  fcyOrder,
}: {
  theme: InvoiceFormatUiTheme;
  demo: InvoiceFormatUiDemo;
  showIrn?: boolean;
  showQuotation?: boolean;
  showTermsOfShipment?: boolean;
  showPlaceOfSupply?: boolean;
  fcyOrder?: boolean;
}) {
  const fields = demo.fieldGrid ?? [];
  return (
    <div className="border-b text-[9px] leading-normal" style={{ borderColor: theme.primary }}>
      <p className="border-b px-3 py-1 font-bold" style={{ borderColor: theme.primary, color: theme.primary }}>
        SHIPMENT DETAILS
      </p>
      <div className="grid grid-cols-2 border-b" style={{ borderColor: theme.primary }}>
        <div className="border-r p-2" style={{ borderColor: theme.primary }}>
          <p className="font-bold" style={{ color: theme.primary }}>
            {demo.partyLeft?.title || 'SHIPPER'}
          </p>
          {(demo.partyLeft?.lines ?? []).map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
        <div className="p-2">
          <p className="font-bold" style={{ color: theme.primary }}>
            {demo.partyMid?.title || 'CONSIGNEE'}
          </p>
          {(demo.partyMid?.lines ?? []).map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </div>
      {fcyOrder ? (
        <div className="grid grid-cols-3 gap-2 border-b px-3 py-2" style={{ borderColor: theme.fill }}>
          {demo.shipmentNo ? (
            <p>
              <span className="font-bold">SHIPMENT</span> {demo.shipmentNo}
            </p>
          ) : null}
          {demo.invoiceDate ? (
            <p>
              <span className="font-bold">INVOICE DATE</span> {demo.invoiceDate}
            </p>
          ) : null}
          {demo.creditTerm ? (
            <p>
              <span className="font-bold">TERMS</span> {demo.creditTerm}
            </p>
          ) : null}
          {demo.dueDate ? (
            <p>
              <span className="font-bold">DUE DATE</span> {demo.dueDate}
            </p>
          ) : null}
          {demo.billToName ? (
            <p>
              <span className="font-bold">CUSTOMER ID</span> {demo.billToName}
            </p>
          ) : null}
          {demo.shippersReference ? (
            <p>
              <span className="font-bold">SHIPPERS REFERENCE</span> {demo.shippersReference}
            </p>
          ) : null}
        </div>
      ) : null}
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 px-3 py-2">
        {showQuotation && demo.quotationNo ? (
          <p>
            <span className="font-bold">QUOTATION NO / DATE</span> {demo.quotationNo}
          </p>
        ) : null}
        {showTermsOfShipment && demo.termsOfShipment ? (
          <p>
            <span className="font-bold">TERMS OF SHIPMENT</span> {demo.termsOfShipment}
          </p>
        ) : null}
        {fields.map((f) => (
          <p key={`${f.k}-${f.v}`}>
            <span className="font-bold">{f.k}</span> {f.v}
          </p>
        ))}
        {showPlaceOfSupply && demo.placeOfSupply ? (
          <p>
            <span className="font-bold">PLACE OF SUPPLY</span> {demo.placeOfSupply}
          </p>
        ) : null}
        {demo.goodsDescription ? (
          <p className="col-span-2">
            <span className="font-bold">GOODS DESCRIPTION</span> {demo.goodsDescription}
          </p>
        ) : null}
        {demo.referenceNoDate ? (
          <p>
            <span className="font-bold">REFERENCE NO / DATE</span> {demo.referenceNoDate}
          </p>
        ) : null}
        {showIrn && demo.irnNo ? (
          <p>
            <span className="font-bold">IRN NO</span> {demo.irnNo}
          </p>
        ) : null}
        {demo.remarks ? (
          <p className="col-span-2">
            <span className="font-bold">REMARKS</span> {demo.remarks}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function SubtotalBar({
  theme,
  demo,
  variant = 'igst',
}: {
  theme: InvoiceFormatUiTheme;
  demo: InvoiceFormatUiDemo;
  variant?: 'igst' | 'fcy' | 'tax' | 'tva' | 'simple';
}) {
  const parts = demo.subtotalParts ?? [demo.subtotal, demo.tax, demo.total].filter(Boolean) as string[];
  if (variant === 'fcy' || variant === 'simple') {
    return (
      <div className="flex justify-end border-b px-4 py-2 text-[10px] font-bold" style={{ borderColor: theme.primary }}>
        {demo.total}
      </div>
    );
  }
  if (variant === 'tax') {
    return (
      <div className="space-y-1 border-b px-4 py-2 text-[9px]" style={{ borderColor: theme.primary }}>
        <p>
          <span className="font-bold">SubTotal :</span> {parts[0]} {parts[2]}
        </p>
        <p>
          <span className="font-bold">Total in INR {parts[0]}:</span>
        </p>
        <p>
          <span className="font-bold">VAT Amount in INR :</span>
        </p>
        <p>
          <span className="font-bold">Net Total in INR : {parts[2]}</span>
        </p>
      </div>
    );
  }
  if (variant === 'tva') {
    return (
      <div className="border-b px-4 py-2 text-[9px]" style={{ borderColor: theme.primary }}>
        <p className="italic">{demo.frenchTotalWords}</p>
        <p className="mt-1 font-bold">Total : INR {demo.total}</p>
      </div>
    );
  }
  return (
    <div className="flex justify-end gap-4 border-b px-4 py-2 text-[9px] font-bold" style={{ borderColor: theme.primary }}>
      <span>SubTotal :</span>
      {parts.map((p, i) => (
        <span key={i}>{p}</span>
      ))}
    </div>
  );
}

function ExportClosing({
  theme,
  demo,
  branding,
  showBullets = true,
}: {
  theme: InvoiceFormatUiTheme;
  demo: InvoiceFormatUiDemo;
  branding: InvoiceFormatUiLayout['branding'];
  showBullets?: boolean;
}) {
  return (
    <div className="border-b px-4 py-3 text-[8.5px] leading-normal" style={{ borderColor: theme.primary }}>
      {showBullets && (demo.footerBullets ?? []).length > 0 ? (
        <ul className="mb-2 list-disc space-y-0.5 pl-4">
          {(demo.footerBullets ?? []).map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      ) : null}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="mb-1 font-bold" style={{ color: theme.primary }}>
            .Terms
          </p>
          {(demo.termsLines ?? []).map((line) => (
            <p key={line} className="mt-0.5">
              {line}
            </p>
          ))}
        </div>
        <div>
          <p className="mb-1 font-bold" style={{ color: theme.primary }}>
            Bank Details
          </p>
          {(demo.bankLines ?? []).map((line) => (
            <p key={line} className="mt-0.5">
              {line}
            </p>
          ))}
        </div>
      </div>
      <div className="mt-3 flex items-end justify-between">
        <p className="font-bold">E&amp;OE</p>
        <div className="text-end">
          <p className="italic">{demo.words}</p>
          <p className="mt-1 font-bold">
            {demo.totalLabel || demo.currency || 'INR'} Total : {demo.total}
          </p>
          <p className="mt-2 font-bold">For {branding.company}</p>
        </div>
      </div>
    </div>
  );
}

function Format15Header({ theme, demo }: { theme: InvoiceFormatUiTheme; demo: InvoiceFormatUiDemo }) {
  const topMeta = demo.metaRows ?? [];
  return (
    <div className="border-b px-3 py-2 text-[9px] leading-normal" style={{ borderColor: theme.primary }}>
      <div className="grid grid-cols-3 gap-2">
        {topMeta.slice(0, 6).map((r) => (
          <p key={r.k}>
            <span className="font-bold">{r.k}</span> {r.v}
          </p>
        ))}
      </div>
    </div>
  );
}

function SingaporeHeader({ theme, demo }: { theme: InvoiceFormatUiTheme; demo: InvoiceFormatUiDemo }) {
  return (
    <div className="border-b px-4 py-2 text-[9px] leading-normal" style={{ borderColor: theme.primary }}>
      <div className="grid grid-cols-2 gap-2">
        {(demo.metaRows ?? []).map((r) => (
          <p key={r.k}>
            <span className="font-bold">{r.k}</span> {r.v}
          </p>
        ))}
      </div>
      <p className="mt-2 text-center text-[13px] font-bold" style={{ color: theme.primary }}>
        TAX INVOICE
      </p>
    </div>
  );
}

function SingaporeGstSummary({ theme, demo }: { theme: InvoiceFormatUiTheme; demo: InvoiceFormatUiDemo }) {
  return (
    <div className="border-b px-4 py-3 text-[9px] leading-normal" style={{ borderColor: theme.primary }}>
      {(demo.gstSummary ?? []).map((r) => (
        <div key={r.k} className="flex justify-between py-0.5">
          <span>{r.k}</span>
          <span className="font-semibold">{r.v}</span>
        </div>
      ))}
      <p className="mt-2 font-bold">
        {demo.totalLabel || 'Total Invoice Value'} {demo.total}
      </p>
      <p className="mt-1 italic">{demo.words}</p>
      <p className="mt-2 font-bold">E &amp; O.E</p>
    </div>
  );
}

function Format7Header({ theme, demo }: { theme: InvoiceFormatUiTheme; demo: InvoiceFormatUiDemo }) {
  return (
    <div className="grid grid-cols-[1.4fr_1fr] border-b text-[9px] leading-normal" style={{ borderColor: theme.primary }}>
      <div className="space-y-1 border-r p-3" style={{ borderColor: theme.primary }}>
        <p>
          <span className="font-bold">INV No. :</span> {demo.invoiceNo}
        </p>
        <p className="mt-2 font-bold" style={{ color: theme.primary }}>
          To
        </p>
        <p className="font-semibold">{demo.billToName}</p>
        {demo.billToAddress ? <p style={{ color: theme.gray }}>{demo.billToAddress}</p> : null}
        {demo.billToPhone ? <p>Phone : {demo.billToPhone}</p> : null}
        {demo.fax ? <p>Fax : {demo.fax}</p> : null}
        {demo.vatNo ? <p>VAT No. : {demo.vatNo}</p> : null}
        {(demo.gstSummary ?? []).slice(0, 2).map((r) => (
          <p key={r.k}>
            <span className="font-bold">{r.k}</span> {r.v}
          </p>
        ))}
      </div>
      <div className="p-3">
        <div className="space-y-1">
          {(demo.metaRows ?? []).map((r) => (
            <p key={r.k}>
              <span className="font-bold">{r.k}</span> {r.v}
            </p>
          ))}
        </div>
        <div className="mt-3 border p-2 text-center" style={{ borderColor: theme.primary, backgroundColor: theme.fill }}>
          <p className="font-bold" style={{ color: theme.primary }}>
            Total Amount
          </p>
          <p className="mt-1 text-[11px] font-bold">{demo.currency || 'INR'}</p>
          <p className="text-[14px] font-bold" style={{ color: theme.primary }}>
            {demo.total}
          </p>
        </div>
      </div>
    </div>
  );
}

function Format6Totals({ theme, demo }: { theme: InvoiceFormatUiTheme; demo: InvoiceFormatUiDemo }) {
  return (
    <div className="border-b px-4 py-3 text-[9px] leading-normal" style={{ borderColor: theme.primary }}>
      <div className="ml-auto w-64 space-y-1">
        {demo.subtotal ? (
          <div className="flex justify-between">
            <span className="font-bold">Sub Total :</span>
            <span>{demo.subtotal}</span>
          </div>
        ) : null}
        {(demo.taxTotal ?? demo.tax) ? (
          <div className="flex justify-between">
            <span className="font-bold">Tax Total :</span>
            <span>{demo.taxTotal ?? demo.tax}</span>
          </div>
        ) : null}
        <div className="flex justify-between border-t pt-1" style={{ borderColor: theme.fill }}>
          <span className="font-bold">Invoice Total ({demo.currency || 'INR'})</span>
          <span className="font-bold">{demo.invoiceTotal ?? demo.total}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-bold">Net Payable ({demo.currency || 'INR'})</span>
          <span className="font-bold">{demo.netPayable ?? demo.total}</span>
        </div>
      </div>
      {demo.words ? <p className="mt-2 italic">Amount {demo.words}</p> : null}
    </div>
  );
}

function GrandTotalDue({
  theme,
  demo,
  branding,
}: {
  theme: InvoiceFormatUiTheme;
  demo: InvoiceFormatUiDemo;
  branding: InvoiceFormatUiLayout['branding'];
}) {
  return (
    <div
      className="border-b px-4 py-2 text-[9px] font-bold leading-normal"
      style={{ borderColor: theme.primary, backgroundColor: theme.fill }}
    >
      {demo.grandTotalDueLabel || `GRAND TOTAL BALANCE DUE TO ${branding.company}`}{' '}
      {demo.grandTotalDue || demo.total}
    </div>
  );
}

function ExportBondBanner({ theme }: { theme: InvoiceFormatUiTheme }) {
  return (
    <div
      className="border-b px-3 py-2 text-center text-[8px] font-semibold uppercase leading-normal"
      style={{ borderColor: theme.primary, backgroundColor: theme.panel, color: theme.primary }}
    >
      Supply meant for export on payment of integrated tax / supply meant for export under bond or letter of
      undertaking without payment of integrated tax
    </div>
  );
}

function LandFreightHeader({
  theme,
  demo,
  branding,
  title,
}: {
  theme: InvoiceFormatUiTheme;
  demo: InvoiceFormatUiDemo;
  branding: InvoiceFormatUiLayout['branding'];
  title?: string;
}) {
  return (
    <div className="border-b text-[9px] leading-normal" style={{ borderColor: theme.primary }}>
      <div className="grid grid-cols-2">
        <div className="space-y-1 border-r p-3" style={{ borderColor: theme.primary, backgroundColor: theme.fill }}>
          <p className="mb-1 font-bold tracking-wide" style={{ color: theme.primary }}>
            REFERENCE
          </p>
          {(demo.referenceRows ?? demo.metaRows ?? []).map((r) => (
            <p key={r.k}>
              <span className="font-bold">{r.k} :</span> {r.v}
            </p>
          ))}
        </div>
        <div className="p-3 text-end">
          <p className="text-[12px] font-bold uppercase" style={{ color: theme.primary }}>
            {branding.company}
          </p>
          <p style={{ color: theme.gray }}>{branding.address}</p>
          <p style={{ color: theme.gray }}>WEB : {branding.web}</p>
          {demo.trnNo ? <p className="mt-1 font-semibold">(TRN # {demo.trnNo})</p> : null}
        </div>
      </div>
      <p className="border-t px-3 py-2 text-center text-[13px] font-bold tracking-wide" style={{ borderColor: theme.primary, color: theme.primary }}>
        {title || demo.docSubtitle || 'LAND FREIGHT / TRANSPORTATION'}
      </p>
    </div>
  );
}

function JobDescription({ theme, demo }: { theme: InvoiceFormatUiTheme; demo: InvoiceFormatUiDemo }) {
  if (!demo.jobDescription && !demo.goodsDescription) return null;
  return (
    <div className="border-b px-4 py-2 text-[9px] leading-normal" style={{ borderColor: theme.primary }}>
      <p className="font-bold" style={{ color: theme.primary }}>
        Job Description
      </p>
      <p className="mt-1">{demo.jobDescription || demo.goodsDescription}</p>
    </div>
  );
}

function ContainerNote({ theme, demo }: { theme: InvoiceFormatUiTheme; demo: InvoiceFormatUiDemo }) {
  if (!demo.containerNote && !(demo.containerRow ?? []).length) return null;
  return (
    <div className="border-b px-4 py-2 text-[9px] leading-normal" style={{ borderColor: theme.primary }}>
      <p className="font-bold" style={{ color: theme.primary }}>
        Container Details
      </p>
      <p className="mt-1">{demo.containerNote || (demo.containerRow ?? []).join(', ')}</p>
    </div>
  );
}

function StampSignature({
  theme,
  branding,
}: {
  theme: InvoiceFormatUiTheme;
  branding: InvoiceFormatUiLayout['branding'];
}) {
  return (
    <div className="flex justify-end border-b px-4 py-4 text-[9px] leading-normal" style={{ borderColor: theme.primary }}>
      <div className="w-56 text-center">
        <p className="font-bold uppercase" style={{ color: theme.primary }}>
          {branding.company}
        </p>
        <p className="mt-8 font-bold">AUTHORIZED SIGNATURE</p>
        <p className="mt-1" style={{ color: theme.gray }}>
          Stamp &amp; Signature
        </p>
      </div>
    </div>
  );
}

function KsaBilingualHeader({ theme, demo }: { theme: InvoiceFormatUiTheme; demo: InvoiceFormatUiDemo }) {
  return (
    <div className="border-b px-3 py-2 text-[9px] leading-normal" style={{ borderColor: theme.primary }} dir="rtl">
      <p className="mb-2 text-center text-[14px] font-bold" style={{ color: theme.primary }}>
        فاتورة ضريبية / TAX INVOICE
      </p>
      <div className="grid grid-cols-2 gap-2 text-start" dir="ltr">
        {(demo.ksaMetaRows ?? demo.metaRows ?? []).map((r) => (
          <p key={r.k}>
            <span className="font-bold">{r.k}</span> {r.v}
          </p>
        ))}
      </div>
      {(demo.sellerLines ?? []).length || (demo.buyerLines ?? []).length ? (
        <div className="mt-2 grid grid-cols-2 gap-2 border-t pt-2" style={{ borderColor: theme.fill }} dir="ltr">
          <div>
            <p className="mb-1 font-bold" style={{ color: theme.primary }}>
              Seller / تاجر
            </p>
            {(demo.sellerLines ?? []).map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
          <div>
            <p className="mb-1 font-bold" style={{ color: theme.primary }}>
              Buyer / مشتر
            </p>
            {(demo.buyerLines ?? []).map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function KsaTotals({ theme, demo }: { theme: InvoiceFormatUiTheme; demo: InvoiceFormatUiDemo }) {
  const rows = [
    { k: 'Total Taxable Amount (Excluding VAT)', v: demo.subtotal || '4,200.00 INR' },
    { k: 'Discount', v: '0.00 INR' },
    { k: 'Total VAT', v: demo.tax || '0.00 INR' },
    { k: 'Total (Excluding VAT)', v: demo.subtotal || '4,200.00 INR' },
    { k: 'Total Amount Due', v: `${demo.total || '4,776.00'} ${demo.currency || 'INR'}` },
  ];
  return (
    <div className="border-b px-4 py-3 text-[9px] leading-normal" style={{ borderColor: theme.primary }}>
      <div className="ml-auto w-72 space-y-1">
        {rows.map((r) => (
          <div key={r.k} className="flex justify-between gap-3">
            <span className="font-bold">{r.k}</span>
            <span>{r.v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TaxAmountBox({ theme, demo }: { theme: InvoiceFormatUiTheme; demo: InvoiceFormatUiDemo }) {
  const lines = demo.taxAmountLines ?? [];
  if (!lines.length && !demo.tax) return null;
  return (
    <div
      className="border-b px-4 py-2 text-[9px] leading-normal"
      style={{ borderColor: theme.primary, backgroundColor: theme.fill }}
    >
      <p className="font-bold" style={{ color: theme.primary }}>
        Tax Amount ({demo.currency || 'INR'})
      </p>
      {lines.length
        ? lines.map((line) => (
            <p key={line} className="mt-0.5">
              {line}
            </p>
          ))
        : (
            <p className="mt-0.5">
              {demo.taxLabel || 'Tax'} {demo.tax}
            </p>
          )}
    </div>
  );
}

function OutstandingTable({ theme, demo }: { theme: InvoiceFormatUiTheme; demo: InvoiceFormatUiDemo }) {
  const headers = demo.osTableHeaders ?? [];
  const rows = demo.osTableRows ?? [];
  if (!headers.length) return null;
  return (
    <div className="border-b" style={{ borderColor: theme.primary }}>
      <p className="px-3 py-1.5 text-[9px] font-bold" style={{ backgroundColor: theme.fill, color: theme.primary }}>
        {demo.osTableTitle || 'Outstanding / Aging'}
      </p>
      <table className="w-full border-collapse text-[8.5px] leading-normal">
        <thead>
          <tr style={{ backgroundColor: theme.panel }}>
            {headers.map((h) => (
              <th key={h} className="border px-1 py-1 text-start font-bold" style={{ borderColor: theme.primary }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td key={ci} className="border px-1 py-1" style={{ borderColor: theme.fill }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {(demo.agingHeaders ?? []).length ? <AgingSummary theme={theme} demo={demo} /> : null}
    </div>
  );
}

function OfficeAddressBand({ theme, demo }: { theme: InvoiceFormatUiTheme; demo: InvoiceFormatUiDemo }) {
  const lines = demo.officeAddressLines ?? [];
  if (!lines.length) return null;
  return (
    <div className="border-b px-4 py-2 text-[8.5px] leading-normal" style={{ borderColor: theme.primary, backgroundColor: theme.panel }}>
      <p className="font-bold" style={{ color: theme.primary }}>
        Office Address :
      </p>
      {lines.map((line) => (
        <p key={line}>{line}</p>
      ))}
    </div>
  );
}
