import type { CSSProperties } from 'react';
import logo from '@/assets/logo.png';
import type {
  InvoiceFormatUiBlock,
  InvoiceFormatUiDemo,
  InvoiceFormatUiLayout,
  InvoiceFormatUiTheme,
} from '../../types/invoiceFormatUiLayout.types';
import { normalizeFresaThemeColors } from '../../constants/fresaInvoiceColors';
import { resolveReportPaperGeometry } from '../../utils/reportPaperGeometry';
import { InvoiceUserFooter } from './invoiceLayouts/InvoiceUserFooter';
import { TcBrandColorBar, TcBrandTagline } from './invoiceLayouts/TcBrandChrome';

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

function ThemeBar({
  theme,
  size = 'lg',
  reverse = false,
}: {
  theme: InvoiceFormatUiTheme;
  size?: 'lg' | 'sm';
  reverse?: boolean;
}) {
  return (
    <TcBrandColorBar
      size={size}
      reverse={reverse}
      primary={theme.primary}
      accent={theme.orange}
    />
  );
}

/**
 * Single renderer for all Invoice Report Format-* permanent JSON layouts.
 * Footer is pinned to the bottom of the page sheet (A4 / Letter).
 * Colors follow Fresa sample themes; KF logo + company name stay in the header.
 */
export function JsonInvoiceLayoutRenderer({ layout, className = '', pageLabel }: Props) {
  const theme = normalizeFresaThemeColors(layout.theme);
  const { branding, demo, blocks, paper, rtl, orientation } = layout;
  const geom = resolveReportPaperGeometry(paper, orientation);

  const footerBlock = blocks.find((b) => b.type === 'colorfulFooter') as
    | Extract<InvoiceFormatUiBlock, { type: 'colorfulFooter' }>
    | undefined;
  const footerVariant = footerBlock?.variant === 'plain' ? 'plain' : 'bar';
  const bodyBlocks = blocks.filter((b) => b.type !== 'colorfulFooter');
  const hasTopChrome = bodyBlocks.some(
    (b) => b.type === 'colorBar' || b.type === 'summaryHero',
  );
  // Fresa ASN/invoice samples start with companyHeader; Format-11 BL starts with
  // hblBlShell — neither has a dual color stripe above the form.
  const startsWithFormChrome =
    bodyBlocks[0]?.type === 'companyHeader' || bodyBlocks[0]?.type === 'hblBlShell';

  return (
    <div
      dir={rtl ? 'rtl' : 'ltr'}
      className={`mx-auto flex flex-col border bg-white text-[10px] leading-normal shadow-sm ${className}`}
      style={{
        // Exact CSS width (border-box) keeps html2canvas → jsPDF mapping stable.
        // minHeight = one physical page. Body is content-sized (flex: 0 0 auto); a
        // separate flex-grow spacer pushes the footer down on short pages. Never let
        // the body flex-shrink — that painted report text under the colorful footer.
        boxSizing: 'border-box',
        width: geom.cssWidth,
        maxWidth: geom.cssWidth,
        minHeight: geom.cssHeight,
        overflow: 'visible',
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: theme.primary === '#000000' ? '#999999' : theme.primary,
        color: theme.ink,
        breakInside: 'avoid',
        pageBreakInside: 'avoid',
      }}
      data-invoice-sheet="true"
      data-paper={geom.paper}
      data-orientation={geom.orientation}
    >
      <div
        className="flex w-full flex-col"
        style={{ flex: '0 0 auto', breakInside: 'avoid' }}
        data-invoice-body="true"
      >
        {!hasTopChrome && !startsWithFormChrome ? (
          <ThemeBar theme={theme} size="lg" reverse={!!rtl} />
        ) : null}
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
        {/* Disclaimer stays in the body flow (not inside the color footer band). */}
        <p
          className="px-3 text-[8px] leading-normal"
          data-invoice-disclaimer="true"
          style={{ color: theme.gray, paddingTop: 8, paddingBottom: 20 }}
        >
          This is a computer generated document and does not require a signature
        </p>
      </div>
      {/* Grows only when body + footer are shorter than one page — keeps footer at bottom. */}
      <div
        aria-hidden
        data-invoice-footer-spacer="true"
        style={{ flex: '1 1 auto', minHeight: 0 }}
      />
      <div
        className="w-full"
        data-invoice-footer="sample"
        style={{
          flex: '0 0 auto',
          position: 'relative',
          zIndex: 2,
          backgroundColor: theme.white || '#FFFFFF',
        }}
      >
        <InvoiceUserFooter
          theme={theme}
          poweredBy={branding.company}
          pageLabel={pageLabel || 'Page 1 of 1'}
          variant={footerVariant}
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
      return <ThemeBar theme={theme} size="lg" reverse={!!layout.rtl} />;
    case 'companyHeader':
      // Fresa sample geometry: compact logo left, company block right-aligned.
      // Table layout survives html2canvas more reliably than flex + text-end.
      return (
        <div>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              backgroundColor: theme.white,
            }}
          >
            <tbody>
              <tr>
                <td style={{ width: 148, verticalAlign: 'top', padding: '8px 10px' }}>
                  <img
                    src={logo}
                    alt={branding.company}
                    style={{ height: 36, width: 'auto', maxWidth: 140, objectFit: 'contain' }}
                  />
                </td>
                <td style={{ verticalAlign: 'top', padding: '8px 10px', textAlign: 'right' }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      lineHeight: 1.25,
                      color: theme.ink,
                    }}
                  >
                    {branding.company}
                  </div>
                  <div
                    style={{
                      marginTop: 2,
                      fontSize: 8,
                      textTransform: 'uppercase',
                      lineHeight: 1.35,
                      color: theme.ink,
                    }}
                  >
                    {branding.address}
                  </div>
                  <div style={{ marginTop: 2, fontSize: 8, lineHeight: 1.35, color: theme.ink }}>
                    WEB : {branding.web}
                  </div>
                  {block.showContact ? (
                    <div style={{ marginTop: 2, fontSize: 8, lineHeight: 1.35, color: theme.gray }}>
                      {branding.phone ? `Phone : ${branding.phone}` : ''}
                      {branding.phone && branding.email ? ' · ' : ''}
                      {branding.email ? `Email : ${branding.email}` : ''}
                      {!branding.phone && !branding.email && demo.billToPhone
                        ? `Phone : ${demo.billToPhone}`
                        : ''}
                      {demo.vatNo ? ` · VAT No. : ${demo.vatNo}` : ''}
                      {demo.tinNo ? ` · TIN No. : ${demo.tinNo}` : ''}
                    </div>
                  ) : null}
                  {block.title ? (
                    <div
                      style={{
                        marginTop: 4,
                        fontSize: 12,
                        fontWeight: 700,
                        letterSpacing: '0.04em',
                        color: themeColor(theme, block.titleColor, theme.primary),
                      }}
                    >
                      {block.title}
                    </div>
                  ) : null}
                </td>
              </tr>
            </tbody>
          </table>
          <div style={{ borderBottom: `1px solid ${theme.primary}` }} />
        </div>
      );
    case 'docTitle': {
      const softBand = !!block.band && block.bandStyle === 'soft';
      const fillBand = !!block.band && block.bandStyle === 'fill';
      const rulesBand = !!block.band && block.bandStyle === 'rules';
      const inkBand = softBand || fillBand || rulesBand;
      if (rulesBand) {
        return (
          <p
            className="px-3 py-1.5 text-center text-[12px] font-bold tracking-wide"
            style={{
              color: theme.ink,
              borderTop: `3px double ${theme.ink}`,
              borderBottom: `3px double ${theme.ink}`,
              backgroundColor: undefined,
            }}
          >
            {block.text}
          </p>
        );
      }
      return (
        <p
          className={`border-b px-3 py-1.5 text-[12px] font-bold tracking-wide ${
            block.align === 'start' ? 'text-start' : block.align === 'end' ? 'text-end' : 'text-center'
          }`}
          style={{
            borderColor: theme.primary,
            color: block.band ? (inkBand ? theme.ink : theme.white) : theme.primary,
            // soft=cyan (Format-1); fill=grey (Format-2); solid=accent (ASN/Format-3).
            backgroundColor: block.band
              ? softBand
                ? theme.cyan
                : fillBand
                  ? theme.fill
                  : theme.accent
              : undefined,
          }}
        >
          {block.text}
        </p>
      );
    }
    case 'formatBadge': {
      const badge =
        block.label ||
        demo.formatBadgeLabel ||
        demo.docSubtitle ||
        (layout.formatNumber ? `Format-${layout.formatNumber}` : layout.code);
      return (
        <div className="flex justify-end px-3 py-1">
          <span
            className="rounded-sm border px-2 py-0.5 text-[8px] font-bold uppercase tracking-wide"
            style={{ borderColor: theme.primary, color: theme.primary, backgroundColor: theme.panel }}
          >
            {badge}
          </span>
        </div>
      );
    }
    case 'twoColumn':
      return <TwoColumn block={block} theme={theme} demo={demo} />;
    case 'fieldGrid':
      return (
        <FieldGrid
          cols={block.cols ?? 2}
          theme={theme}
          demo={demo}
          labelTone={block.labelTone === 'ink' ? 'ink' : 'primary'}
        />
      );
    case 'partyTriple':
      return <PartyTriple theme={theme} demo={demo} />;
    case 'metaTriple':
      return (
        <MetaTriple
          theme={theme}
          demo={demo}
          showCreditTerm={block.showCreditTerm !== false}
        />
      );
    case 'containerStrip':
      return (
        <ContainerStrip
          theme={theme}
          demo={demo}
          chrome={block.chrome === 'grid' ? 'grid' : 'plain'}
          headerColor={block.headerColor}
        />
      );
    case 'chargeTable':
      return (
        <ChargeTable
          theme={theme}
          demo={demo}
          headerColor={block.headerColor}
          chrome={block.chrome === 'grid' ? 'grid' : 'plain'}
          tintTotalRow={block.tintTotalRow === true}
          gridBorder={block.gridBorder === 'ink' ? 'ink' : 'primary'}
        />
      );
    case 'wordsAndTotal':
      if (block.variant === 'skip') return null;
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
    case 'summaryHero': {
      const heroTitle =
        block.title ||
        demo.heroTitle ||
        demo.docSubtitle ||
        (layout.name?.toLowerCase().includes('summary')
          ? 'SUMMARY INVOICE'
          : layout.name?.replace(/\s*Report Format.*$/i, '').trim() ||
            (layout.formatNumber ? `DOCUMENT FORMAT-${layout.formatNumber}` : 'DOCUMENT'));
      return (
        <div>
          <ThemeBar theme={theme} size="lg" />
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ backgroundColor: theme.primary }}
          >
            <img src={logo} alt={branding.company} className="h-8 w-auto brightness-0 invert" />
            <div className="text-end text-white">
              <p
                className="text-[8px] font-semibold uppercase tracking-[0.12em]"
                style={{ color: theme.orange }}
              >
                ALL MODES OF TRANSPORT
              </p>
              <p className="text-base font-bold uppercase">{heroTitle}</p>
              <p className="text-[7px] text-white/70">
                {layout.formatNumber ? `Format-${layout.formatNumber}` : layout.code}
              </p>
            </div>
          </div>
          <ThemeBar theme={theme} size="sm" />
        </div>
      );
    }
    case 'hblCargoTable':
      return <HblCargoTable theme={theme} demo={demo} />;
    case 'hblFreightSignature':
      return (
        <HblFreightSignature
          theme={theme}
          demo={demo}
          branding={branding}
          variant={block.variant === 'simple' ? 'simple' : 'blClosing'}
        />
      );
    case 'partyNotifyGrid':
      return <PartyNotifyGrid theme={theme} demo={demo} />;
    case 'hblBlShell':
      return (
        <HblBlShell
          theme={theme}
          demo={demo}
          branding={branding}
          embedLogo={block.embedLogo === true}
        />
      );
    case 'hawbRouteGrid':
      return <HawbRouteGrid theme={theme} demo={demo} />;
    case 'arrivalChargesOptional':
      return (
        <ArrivalChargesOptional
          theme={theme}
          demo={demo}
          showCharges={block.showCharges ?? demo.arrivalShowCharges !== false}
        />
      );
    case 'deliveryOrderRelease':
      return <DeliveryOrderRelease theme={theme} demo={demo} />;
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
      return (
        <SubtotalBar
          theme={theme}
          demo={demo}
          variant={
            block.variant === 'subVat'
              ? 'subVat'
              : block.variant === 'fcy' ||
                  block.variant === 'tax' ||
                  block.variant === 'tva' ||
                  block.variant === 'simple'
                ? block.variant
                : 'igst'
          }
        />
      );
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
      return (
        <TaxAmountBox
          theme={theme}
          demo={demo}
          variant={
            block.variant === 'indiaSummary'
              ? 'indiaSummary'
              : block.variant === 'compact'
                ? 'compact'
                : 'band'
          }
        />
      );
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
  // Inline grid — Tailwind `grid-cols-2` is often dropped by html2canvas (FieldGrid lesson).
  return (
    <div
      className="border-b"
      style={{
        borderColor: theme.primary,
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
        width: '100%',
      }}
    >
      <div
        className="p-3"
        style={{ borderRight: `1px solid ${theme.primary}`, backgroundColor: theme.panel }}
      >
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
  labelTone = 'primary',
}: {
  cols: 1 | 2 | 3;
  theme: InvoiceFormatUiTheme;
  demo: InvoiceFormatUiDemo;
  labelTone?: 'primary' | 'ink';
}) {
  const fields = demo.fieldGrid ?? [];
  const n = cols === 1 ? 1 : cols === 3 ? 3 : 2;
  const labelColor = labelTone === 'ink' ? theme.ink : theme.primary;
  // ASN (labelTone=ink + 2-col) matches Fresa meta spacing; other formats keep prior gaps.
  const asnMeta = labelTone === 'ink' && n === 2;
  // Inline grid template — html2canvas 1.x often drops Tailwind utility grid classes.
  return (
    <div
      className="border-b p-3"
      style={{
        borderColor: theme.primary,
        display: 'grid',
        gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`,
        columnGap: asnMeta ? 28 : 12,
        rowGap: asnMeta ? 4 : 6,
        backgroundColor: theme.panel,
      }}
    >
      {fields.map((f) => (
        <p
          key={`${f.k}-${f.v}`}
          className="leading-normal"
          style={{ color: theme.ink, fontSize: asnMeta ? 9 : undefined }}
        >
          <span className="font-bold" style={{ color: labelColor }}>
            {f.k} :
          </span>{' '}
          {f.v}
        </p>
      ))}
    </div>
  );
}

/** Format-2: Client | invoice identifiers | routing parties — single 3-col band. */
function MetaTriple({
  theme,
  demo,
  showCreditTerm = true,
}: {
  theme: InvoiceFormatUiTheme;
  demo: InvoiceFormatUiDemo;
  showCreditTerm?: boolean;
}) {
  const mid = demo.metaMid ?? [];
  const right = demo.metaRight ?? [];
  const line = theme.primary;
  const colPad: CSSProperties = {
    borderRight: `1px solid ${line}`,
    padding: '6px 8px',
    verticalAlign: 'top',
  };
  const kv = (rows: { k: string; v: string }[]) =>
    rows.map((r) => (
      <p key={`${r.k}-${r.v}`} className="leading-normal" style={{ color: theme.ink, marginTop: 2 }}>
        <span className="font-bold" style={{ color: theme.ink }}>
          {r.k} :
        </span>{' '}
        {r.v}
      </p>
    ));
  return (
    <div
      className="border-b text-[9px] leading-normal"
      style={{
        borderColor: line,
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 1fr) minmax(0, 1fr)',
        width: '100%',
      }}
    >
      <div style={{ ...colPad, backgroundColor: theme.panel }}>
        <p className="font-bold" style={{ color: theme.ink }}>
          {demo.billToLabel || 'Client'} :
        </p>
        <p className="font-semibold leading-normal" style={{ color: theme.ink }}>
          {demo.billToName}
        </p>
        {demo.billToAddress ? (
          <p className="mt-0.5 leading-normal" style={{ color: theme.gray }}>
            {demo.billToAddress}
          </p>
        ) : null}
        {demo.billToPhone ? (
          <p className="mt-0.5 leading-normal" style={{ color: theme.ink }}>
            <span className="font-bold">Phone :</span> {demo.billToPhone}
          </p>
        ) : null}
        {demo.billToGstin ? (
          <p className="mt-0.5 leading-normal" style={{ color: theme.ink }}>
            <span className="font-bold">GSTIN No. :</span> {demo.billToGstin}
          </p>
        ) : null}
        {showCreditTerm && demo.creditTerm ? (
          <p className="mt-0.5 leading-normal" style={{ color: theme.ink }}>
            <span className="font-bold">Credit Term :</span> {demo.creditTerm}
          </p>
        ) : null}
      </div>
      <div style={colPad}>{kv(mid)}</div>
      <div style={{ ...colPad, borderRight: 'none' }}>{kv(right)}</div>
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

function ContainerStrip({
  theme,
  demo,
  chrome = 'plain',
  headerColor,
}: {
  theme: InvoiceFormatUiTheme;
  demo: InvoiceFormatUiDemo;
  chrome?: 'plain' | 'grid';
  headerColor?: 'primary' | 'accent' | 'cyan' | 'fill' | 'orange';
}) {
  const headers = demo.containerHeaders ?? [];
  const row = demo.containerRow ?? [];
  if (!headers.length) return null;
  const resolved = headerColor ?? 'fill';
  const headBg = themeColor(theme, resolved, theme.fill);
  const useGrid = chrome === 'grid';
  const line = theme.primary;
  if (!useGrid) {
    return (
      <table
        className="w-full border-collapse border-b text-[9px] leading-normal"
        style={{ borderColor: theme.primary }}
      >
        <thead>
          <tr style={{ backgroundColor: headBg }}>
            {headers.map((h) => (
              <th
                key={h}
                className="border px-1.5 py-1.5 text-start font-bold"
                style={{ borderColor: theme.primary, color: theme.ink }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {row.map((c, i) => (
              <td key={i} className="border px-1.5 py-1.5" style={{ borderColor: theme.primary, color: theme.ink }}>
                {c}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    );
  }
  // Inline borders — Tailwind `border` is often dropped by html2canvas (ASN ChargeTable lesson).
  const cell: CSSProperties = {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: line,
    padding: '6px 6px',
    textAlign: 'left',
    verticalAlign: 'top',
  };
  return (
    <table
      className="w-full border-collapse border-b text-[9px] leading-normal"
      style={{ borderCollapse: 'collapse', border: `1px solid ${line}`, width: '100%' }}
    >
      <thead>
        <tr style={{ backgroundColor: headBg }}>
          {headers.map((h) => (
            <th key={h} style={{ ...cell, fontWeight: 700, color: theme.ink }}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr>
          {headers.map((_, i) => (
            <td key={i} style={{ ...cell, color: theme.ink }}>
              {row[i] ?? ''}
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  );
}

function isChargeTotalRow(cells: string[]): boolean {
  const first = String(cells[0] ?? '')
    .trim()
    .toLowerCase();
  return first === 'total' || first === 'total:' || first.startsWith('total');
}

function ChargeTable({
  theme,
  demo,
  headerColor,
  chrome = 'plain',
  tintTotalRow = false,
  gridBorder = 'primary',
}: {
  theme: InvoiceFormatUiTheme;
  demo: InvoiceFormatUiDemo;
  headerColor?: 'primary' | 'accent' | 'cyan' | 'fill' | 'orange';
  chrome?: 'plain' | 'grid';
  tintTotalRow?: boolean;
  gridBorder?: 'primary' | 'ink';
}) {
  const headers = demo.tableHeaders ?? [];
  const rows = demo.tableRows ?? [];
  // Fresa samples default charge headers to cyan (#9AD7FF).
  const resolved = headerColor ?? 'cyan';
  const bg = themeColor(theme, resolved, theme.cyan);
  // Light fills / Fresa cyan (#9AD7FF) need dark ink; navy/orange/red get white.
  const fg =
    resolved === 'fill' || resolved === 'cyan' ? theme.ink : theme.white;
  // Only force fixed layout for very wide tables (ASN-style 9+ cols).
  // Narrower invoice/HBL charge grids keep auto layout to avoid Batch-1 regressions.
  const manyCols = headers.length >= 9;
  const useGrid = chrome === 'grid';
  const line = gridBorder === 'ink' ? theme.ink || '#101010' : theme.primary;
  const cellPad = manyCols ? '3px 3px' : '6px 6px';
  const cellBorder: CSSProperties = useGrid
    ? {
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: line,
      }
    : { borderColor: theme.primary };
  const cellClass = useGrid ? 'text-start' : 'border text-start';

  return (
    <div className="w-full px-0">
      <table
        className="w-full border-collapse leading-normal"
        style={{
          tableLayout: manyCols ? 'fixed' : 'auto',
          width: '100%',
          fontSize: manyCols ? 7.5 : 9,
          borderCollapse: 'collapse',
          // Cell borders alone form the perimeter under collapse (no double outer box).
          ...(useGrid ? { border: `1px solid ${line}` } : null),
        }}
      >
        <thead>
          <tr style={{ backgroundColor: bg, color: fg }}>
            {headers.map((h) => (
              <th
                key={h}
                className={`${cellClass} font-bold`}
                style={{
                  ...cellBorder,
                  padding: manyCols ? '4px 3px' : '6px 6px',
                  wordBreak: 'break-word',
                  overflowWrap: 'anywhere',
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => {
            // Pad/truncate to header count so misaligned demo rows don't collide visually.
            const cells = headers.map((_, ci) => row[ci] ?? '');
            const totalRow = tintTotalRow && useGrid && isChargeTotalRow(cells);
            // Fresa ASN Total band is a clear light-blue tint (stronger than subtle panel).
            const rowBg = totalRow
              ? '#D4EBF8'
              : ri % 2
                ? theme.fill
                : theme.white;

            if (totalRow) {
              // Fresa ASN: "Total :" spans leading label cols; values sit under qty/weight/volume.
              let span = 1;
              while (span < cells.length && String(cells[span] ?? '').trim() === '') {
                span += 1;
              }
              const rest = cells.slice(span);
              // Paint tint on <td> — html2canvas often drops <tr> backgroundColor.
              const totalCell: CSSProperties = {
                ...cellBorder,
                padding: cellPad,
                fontWeight: 700,
                color: theme.ink,
                verticalAlign: 'middle',
                backgroundColor: rowBg,
              };
              return (
                <tr key={ri}>
                  <td colSpan={span} className={useGrid ? undefined : 'border'} style={totalCell}>
                    {cells[0]}
                  </td>
                  {rest.map((cell, ci) => (
                    <td
                      key={ci}
                      className={useGrid ? undefined : 'border'}
                      style={{
                        ...totalCell,
                        textAlign: String(cell).trim() ? 'right' : 'left',
                        wordBreak: 'break-word',
                        overflowWrap: 'anywhere',
                      }}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              );
            }

            return (
              <tr key={ri} style={{ backgroundColor: rowBg }}>
                {cells.map((cell, ci) => (
                  <td
                    key={ci}
                    className={useGrid ? undefined : 'border'}
                    style={{
                      ...cellBorder,
                      padding: cellPad,
                      wordBreak: 'break-word',
                      overflowWrap: 'anywhere',
                      verticalAlign: 'top',
                    }}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            );
          })}
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
    <div>
      <ThemeBar theme={theme} size="sm" reverse={!!layout.rtl} />
      <div
        className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 py-2"
        style={{ backgroundColor: theme.panel }}
      >
        <div className="text-start">
          <p className="text-sm font-bold" style={{ color: theme.primary }}>
            فاتورة ضريبية
          </p>
          <TcBrandTagline className="mt-0.5" color={theme.orange} />
          <p className="text-[8px]" style={{ color: theme.gray }}>
            Tax Invoice
          </p>
        </div>
        <img src={logo} alt={branding.company} className="h-10 w-auto object-contain" />
        <div className="text-end">
          <TcBrandTagline className="mb-0.5" text="DOCUMENT" color={theme.orange} />
          <p className="text-sm font-bold" style={{ color: theme.primary }}>
            INVOICE TAX
          </p>
          <p className="text-[7px]" style={{ color: theme.gray }}>
            Format-{layout.formatNumber} · {branding.company}
          </p>
        </div>
      </div>
      <ThemeBar theme={theme} size="sm" reverse={!!layout.rtl} />
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
  variant?: 'igst' | 'fcy' | 'tax' | 'tva' | 'simple' | 'subVat';
}) {
  const parts = demo.subtotalParts ?? [demo.subtotal, demo.tax, demo.total].filter(Boolean) as string[];
  if (variant === 'fcy' || variant === 'simple') {
    return (
      <div className="flex justify-end border-b px-4 py-2 text-[10px] font-bold" style={{ borderColor: theme.primary }}>
        {demo.total}
      </div>
    );
  }
  if (variant === 'subVat') {
    const taxLines = demo.taxAmountLines ?? [];
    return (
      <div
        className="border-b px-4 py-2 text-[9px] leading-normal"
        style={{ borderColor: theme.primary, textAlign: 'right' }}
      >
        {demo.subtotal ? (
          <p>
            <span className="font-bold">Sub Total :</span> {demo.subtotal}
          </p>
        ) : null}
        {taxLines.length
          ? taxLines.map((line) => (
              <p key={line} className="mt-0.5">
                {line}
              </p>
            ))
          : demo.tax
            ? (
                <p className="mt-0.5">
                  <span className="font-bold">{demo.taxLabel || 'VAT'} :</span> {demo.tax}
                </p>
              )
            : null}
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

function splitTaxAmountLine(line: string): { label: string; amount: string } {
  const trimmed = line.trim();
  const m = trimmed.match(/^(.*?)(\d[\d,]*\.?\d*)\s*$/);
  if (m && m[1].trim()) return { label: m[1].trim(), amount: m[2] };
  return { label: trimmed, amount: '' };
}

function TaxAmountBox({
  theme,
  demo,
  variant = 'band',
}: {
  theme: InvoiceFormatUiTheme;
  demo: InvoiceFormatUiDemo;
  variant?: 'band' | 'indiaSummary' | 'compact';
}) {
  const lines = demo.taxAmountLines ?? [];
  if (!lines.length && !demo.tax && variant !== 'indiaSummary' && variant !== 'compact') return null;

  if (variant === 'compact') {
    const currency = demo.currency || 'INR';
    const border = theme.primary;
    const cell: CSSProperties = {
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: border,
      padding: '3px 6px',
      verticalAlign: 'top',
    };
    const rows =
      lines.length > 0
        ? lines.map(splitTaxAmountLine)
        : demo.tax
          ? [{ label: demo.taxLabel || 'Tax', amount: demo.tax }]
          : [];
    if (!rows.length) return null;
    return (
      <div
        className="border-b px-3 py-2"
        style={{ borderColor: theme.primary, display: 'flex', justifyContent: 'flex-end' }}
      >
        <table
          className="text-[9px] leading-normal"
          style={{ borderCollapse: 'collapse', width: 240, border: `1px solid ${border}` }}
        >
          <thead>
            <tr style={{ backgroundColor: theme.fill, color: theme.ink }}>
              <th className="text-start font-bold" style={{ ...cell, textAlign: 'left' }}>
                Tax
              </th>
              <th className="text-end font-bold" style={{ ...cell, textAlign: 'right' }}>
                Amount ({currency})
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={`${r.label}-${r.amount}`}>
                <td style={{ ...cell, color: theme.ink, textAlign: 'left' }}>{r.label}</td>
                <td style={{ ...cell, color: theme.ink, textAlign: 'right' }}>{r.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (variant === 'indiaSummary') {
    const currency = demo.currency || 'INR';
    const line = theme.primary;
    const cell: CSSProperties = {
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: line,
      padding: '3px 6px',
      verticalAlign: 'top',
    };
    const rows =
      lines.length > 0
        ? lines.map(splitTaxAmountLine)
        : demo.tax
          ? [{ label: demo.taxLabel || 'Tax', amount: demo.tax }]
          : [];
    return (
      <div
        className="border-b px-3 py-2"
        style={{
          borderColor: theme.primary,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <p
          className="min-w-0 flex-1 text-[10px] font-bold leading-normal"
          style={{ color: theme.ink }}
        >
          {demo.words || ''}
        </p>
        <table
          className="shrink-0 text-[9px] leading-normal"
          style={{
            borderCollapse: 'collapse',
            width: 240,
            border: `1px solid ${line}`,
          }}
        >
          <thead>
            <tr style={{ backgroundColor: theme.cyan, color: theme.ink }}>
              <th className="text-start font-bold" style={{ ...cell, textAlign: 'left' }}>
                Tax
              </th>
              <th className="text-end font-bold" style={{ ...cell, textAlign: 'right' }}>
                Amount ({currency})
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={`${r.label}-${r.amount}`}>
                <td style={{ ...cell, color: theme.ink, textAlign: 'left' }}>{r.label}</td>
                <td style={{ ...cell, color: theme.ink, textAlign: 'right' }}>{r.amount}</td>
              </tr>
            ))}
            {demo.total ? (
              <tr>
                <td style={{ ...cell, color: theme.ink, fontWeight: 700, textAlign: 'left' }}>Total</td>
                <td style={{ ...cell, color: theme.ink, fontWeight: 700, textAlign: 'right' }}>
                  {demo.total}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    );
  }

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

function demoField(demo: InvoiceFormatUiDemo, ...keys: string[]): string {
  const rows = demo.fieldGrid ?? [];
  for (const key of keys) {
    const hit = rows.find((r) => r.k.toLowerCase() === key.toLowerCase());
    if (hit?.v) return hit.v;
  }
  for (const key of keys) {
    const hit = rows.find((r) => r.k.toLowerCase().includes(key.toLowerCase()));
    if (hit?.v) return hit.v;
  }
  return '';
}

/**
 * Fresa Format-11 upper BL shell: bordered party / route / cargo grid.
 * Uses ink borders (reference is black grid, not theme blue chrome).
 */
function HblBlShell({
  theme,
  demo,
  branding,
  embedLogo = false,
}: {
  theme: InvoiceFormatUiTheme;
  demo: InvoiceFormatUiDemo;
  branding: InvoiceFormatUiLayout['branding'];
  /** When true, KF logo replaces Fresa’s identity-cell logo (no outer companyHeader). */
  embedLogo?: boolean;
}) {
  const border = theme.ink || '#101010';
  const label: CSSProperties = {
    fontSize: 7.5,
    fontWeight: 700,
    textTransform: 'uppercase',
    color: border,
    lineHeight: 1.25,
    margin: 0,
  };
  const body: CSSProperties = {
    fontSize: 8.5,
    color: border,
    lineHeight: 1.35,
    margin: 0,
  };
  const cell: CSSProperties = {
    border: `1px solid ${border}`,
    verticalAlign: 'top',
    padding: '3px 5px',
  };
  const shipper = demo.partyLeft ?? { title: 'Shipper', lines: [] as string[] };
  const consignee = demo.partyMid ?? { title: 'Consignee', lines: [] as string[] };
  const notify = demo.partyNotify ?? demo.partyThird ?? { title: 'Notify Address', lines: [] as string[] };
  const delivery =
    demo.hblDeliveryAgent ?? {
      title: 'APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:',
      lines: [
        branding.company,
        branding.address,
        branding.phone ? `TEL: ${branding.phone}` : '',
        branding.email ? `EMAIL: ${branding.email}` : '',
      ].filter(Boolean),
    };
  const blNo = demo.invoiceNo || demoField(demo, 'HBL No.', 'BILL OF LADING NUMBER', 'HBL');
  const vesselRaw = demoField(demo, 'Vessel / Voyage', 'Ocean Vessel', 'Vessel');
  const vesselParts = vesselRaw.split('/').map((s) => s.trim()).filter(Boolean);
  const oceanVessel = vesselParts[0] || vesselRaw || demo.hblCarrierAgent || '';
  const voyageNo = vesselParts.length > 1 ? vesselParts.slice(1).join(' / ') : '';
  const placeReceipt = demoField(demo, 'Place of Receipt') || demoField(demo, 'Port of Loading');
  const portLoading = demoField(demo, 'Port of Loading');
  const portDischarge = demoField(demo, 'Port of Discharge');
  const placeDelivery = demoField(demo, 'Place of Delivery');
  const originals = demo.hblOriginals || '1(ONE)';
  const title =
    demo.hblBlTitle ||
    'Bill of Lading FOR COMBINED TRANSPORT OR PORT TO PORT SHIPMENT';
  const cargoHeaders = demo.hblCargoHeaders ?? [
    'Container Nos, Seal Nos, Mark and Nos',
    'Number and kind of packages : description of goods',
    'Gross Weight(Kg)',
    'Volume',
  ];
  const cargoRows = demo.hblCargoRows ?? [];
  const weight =
    demoField(demo, 'Gross Weight') ||
    (cargoRows[0] && cargoRows[0][cargoHeaders.length - 2]) ||
    '';
  const volume =
    demoField(demo, 'Measurement') ||
    demoField(demo, 'Volume') ||
    (cargoRows[0] && cargoRows[0][cargoHeaders.length - 1]) ||
    '';

  const partyLines = (lines: string[]) =>
    (lines ?? []).map((line) => (
      <p key={line} style={{ ...body, marginTop: 1 }}>
        {line}
      </p>
    ));

  return (
    <div data-hbl-bl-shell="true" style={{ margin: '0 0 2px', color: border }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', border: `1.5px solid ${border}` }}>
        <tbody>
          <tr>
            <td colSpan={4} style={{ ...cell, textAlign: 'center', padding: '4px 6px' }}>
              <p style={{ ...label, fontSize: 10, letterSpacing: '0.02em' }}>{title}</p>
            </td>
          </tr>
          <tr>
            <td colSpan={2} style={{ ...cell, width: '52%' }}>
              <p style={label}>{shipper.title || 'SHIPPER'}</p>
              {partyLines(shipper.lines ?? [])}
            </td>
            <td colSpan={2} style={{ ...cell, width: '48%' }}>
              <p style={label}>Bill of Lading Number</p>
              <p style={{ ...body, fontWeight: 700, marginTop: 2 }}>{blNo}</p>
            </td>
          </tr>
          <tr>
            <td colSpan={2} style={cell}>
              <p style={label}>{consignee.title || 'CONSIGNEE OR ORDER'}</p>
              {partyLines(consignee.lines ?? [])}
            </td>
            <td colSpan={2} style={{ ...cell, textAlign: 'center' }}>
              {/* Fresa identity cell: logo + company + address + registration. */}
              {embedLogo ? (
                <img
                  src={logo}
                  alt={branding.company}
                  style={{
                    height: 32,
                    width: 'auto',
                    maxWidth: 120,
                    objectFit: 'contain',
                    display: 'block',
                    margin: '0 auto 4px',
                  }}
                />
              ) : null}
              <p style={{ ...label, fontSize: 9 }}>{branding.company}</p>
              <p style={{ ...body, marginTop: 2 }}>{branding.address}</p>
              {demo.hblRegisteredNo ? (
                <p style={{ ...label, marginTop: 8, fontSize: 8 }}>
                  Registered No. : {demo.hblRegisteredNo}
                </p>
              ) : null}
            </td>
          </tr>
          <tr>
            <td colSpan={2} style={cell}>
              <p style={label}>
                {notify.title ||
                  'NOTIFY ADDRESS (Carrier not responsible for failure to notify)'}
              </p>
              {partyLines(notify.lines ?? [])}
            </td>
            <td colSpan={2} style={cell}>
              <p style={label}>
                {delivery.title || 'APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:'}
              </p>
              {partyLines(delivery.lines ?? [])}
            </td>
          </tr>
          <tr>
            <td colSpan={2} style={cell}>
              <p style={label}>Ocean Vessel</p>
              <p style={{ ...body, marginTop: 2 }}>{oceanVessel}</p>
            </td>
            <td colSpan={2} style={cell}>
              <p style={label}>Voyage Number</p>
              <p style={{ ...body, marginTop: 2 }}>{voyageNo}</p>
            </td>
          </tr>
          <tr>
            <td colSpan={2} style={cell}>
              <p style={label}>Place of Receipt</p>
              <p style={{ ...body, marginTop: 2 }}>{placeReceipt}</p>
            </td>
            <td colSpan={2} style={cell}>
              <p style={label}>Port of Loading</p>
              <p style={{ ...body, marginTop: 2 }}>{portLoading}</p>
            </td>
          </tr>
          <tr>
            <td style={cell}>
              <p style={label}>Port of Discharge</p>
              <p style={{ ...body, marginTop: 2 }}>{portDischarge}</p>
            </td>
            <td style={cell}>
              <p style={label}>Place of Delivery</p>
              <p style={{ ...body, marginTop: 2 }}>{placeDelivery}</p>
            </td>
            <td style={cell}>
              <p style={label}>Freight Charges</p>
            </td>
            <td style={cell}>
              <p style={label}>No. of Original / BL</p>
              <p style={{ ...body, marginTop: 2 }}>{originals}</p>
            </td>
          </tr>
          <tr>
            {cargoHeaders.map((h, hi) => (
              <th
                key={h}
                style={{
                  ...cell,
                  width:
                    cargoHeaders.length === 4
                      ? hi === 0
                        ? '28%'
                        : hi === 1
                          ? '36%'
                          : '18%'
                      : undefined,
                  fontSize: 7,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  textAlign: 'left',
                  backgroundColor: theme.fill || '#F3F3F3',
                }}
              >
                {h}
              </th>
            ))}
          </tr>
          {(cargoRows.length ? cargoRows : [Array.from({ length: cargoHeaders.length }, () => '')]).map(
            (row, ri) => (
              <tr key={ri}>
                {cargoHeaders.map((_, ci) => (
                  <td
                    key={ci}
                    style={{
                      ...cell,
                      minHeight: 64,
                      whiteSpace: 'pre-wrap',
                      fontSize: 8,
                    }}
                  >
                    {row[ci] ?? (ci === cargoHeaders.length - 2 ? weight : ci === cargoHeaders.length - 1 ? volume : '')}
                  </td>
                ))}
              </tr>
            ),
          )}
        </tbody>
      </table>
    </div>
  );
}

/** Classic HBL shipper / consignee / notify grid (Fresa FG HBL style). */
function PartyNotifyGrid({ theme, demo }: { theme: InvoiceFormatUiTheme; demo: InvoiceFormatUiDemo }) {
  const cols = [
    demo.partyLeft ?? { title: 'Shipper', lines: [] as string[] },
    demo.partyMid ?? { title: 'Consignee', lines: [] as string[] },
    demo.partyNotify ?? demo.partyThird ?? { title: 'Notify Party', lines: [] as string[] },
  ];
  return (
    <div className="grid grid-cols-3 border-b" style={{ borderColor: theme.primary }}>
      {cols.map((col, i) => (
        <div
          key={col.title || i}
          className={`min-h-[72px] p-2 ${i < 2 ? 'border-r' : ''}`}
          style={{ borderColor: theme.primary }}
        >
          <p className="mb-1 text-[8px] font-bold uppercase" style={{ color: theme.primary }}>
            {col.title}
          </p>
          {(col.lines ?? []).map((line) => (
            <p key={line} className="text-[8.5px] leading-snug">
              {line}
            </p>
          ))}
        </div>
      ))}
    </div>
  );
}

/** HBL cargo table: Container/Seal | Pkgs | Description | Weight | Measurement */
function HblCargoTable({ theme, demo }: { theme: InvoiceFormatUiTheme; demo: InvoiceFormatUiDemo }) {
  const headers =
    demo.hblCargoHeaders ??
    demo.tableHeaders ?? [
      'Container No. / Seal No. / Mark & No.',
      'No. of Pkgs',
      'Description of Goods',
      'Gross Weight',
      'Measurement',
    ];
  const rows = demo.hblCargoRows ?? demo.tableRows ?? [];
  return (
    <div className="border-b" style={{ borderColor: theme.primary }}>
      <table className="w-full border-collapse text-[8px] leading-normal">
        <thead>
          <tr style={{ backgroundColor: theme.fill }}>
            {headers.map((h) => (
              <th
                key={h}
                className="border px-1 py-1 text-start font-bold uppercase"
                style={{ borderColor: theme.primary, color: theme.primary }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(rows.length
            ? rows
            : [Array.from({ length: headers.length }, () => '')]
          ).map((row, ri) => (
            <tr key={ri}>
              {headers.map((_, ci) => (
                <td
                  key={ci}
                  className="border px-1 py-2 align-top"
                  style={{ borderColor: theme.primary, minHeight: 48 }}
                >
                  {row[ci] ?? ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {demo.containerNote ? (
        <p className="border-t px-2 py-1 text-[8px]" style={{ borderColor: theme.primary }}>
          {demo.containerNote}
        </p>
      ) : null}
    </div>
  );
}

const HBL_RECEIVED_DEFAULT =
  'RECEIVED the goods in apparent good order and condition, as far as Ascertained by reasonable means of checking, as specified above unless Otherwise stated. The MTO, in accordance with and to the extent of the provisions contained in this MT Bill of Lading, and with liberty to sub-contract, undertakes to perform and/or in his own name to procure performance of the multimodal transport and the delivery of the goods, include all services related thereto, from the place and time of taking the goods in charge to the place and time of delivery and accepts responsibility for such transport and such services. One of the MT Bills of Lading must be surrendered duly endorsed in exchange for the goods or delivery order. IN WITNESS whereof MT Bill(s) of Lading has/have been signed in the number indicated below, one of which being accomplished the other(s) to be void.';

function HblFreightSignature({
  theme,
  demo,
  branding,
  variant = 'blClosing',
}: {
  theme: InvoiceFormatUiTheme;
  demo: InvoiceFormatUiDemo;
  branding: InvoiceFormatUiLayout['branding'];
  variant?: 'blClosing' | 'simple';
}) {
  const placeDate = demo.hblPlaceDate || demo.invoiceDate || '';
  const carrier = demo.hblCarrierAgent || '';
  const border = theme.primary;
  const ink = theme.ink;

  if (variant === 'simple') {
    return (
      <div className="border-b text-[8.5px] leading-normal" style={{ borderColor: border }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td
                style={{
                  width: '48%',
                  verticalAlign: 'top',
                  padding: '8px 10px',
                  borderRight: `1px solid ${border}`,
                }}
              >
                <p style={{ fontWeight: 700, color: border }}>Freight Details, Charges etc :</p>
                <p style={{ marginTop: 4 }}>
                  {demo.hblFreightText || demo.remarks || 'FREIGHT PREPAID AS ARRANGED'}
                </p>
                {demo.hblOnboardDate ? (
                  <p style={{ marginTop: 4 }}>ONBOARD DATE : {demo.hblOnboardDate}</p>
                ) : null}
              </td>
              <td style={{ verticalAlign: 'top', padding: '8px 10px' }}>
                <p style={{ fontWeight: 700, color: border }}>Place and Date of Issue</p>
                <p style={{ marginTop: 4 }}>{placeDate}</p>
                <p style={{ marginTop: 12, fontWeight: 700, color: border }}>
                  Signed on behalf of the Carrier
                </p>
                <p style={{ marginTop: 24, fontWeight: 700 }}>{branding.company}</p>
                <p style={{ marginTop: 2, fontSize: 8, color: theme.gray }}>AS AGENT FOR THE CARRIER</p>
                <p style={{ fontWeight: 600 }}>{carrier}</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  // Fresa Format-11 signature cluster: left charges grid, right RECEIVED + place/date + agents line.
  const received = demo.hblReceivedText || HBL_RECEIVED_DEFAULT;
  const cellBorder = `1px solid ${border}`;

  return (
    <div
      data-hbl-freight-signature="blClosing"
      style={{ borderTop: cellBorder, borderBottom: cellBorder, color: ink, fontSize: 8, lineHeight: 1.35 }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          <tr>
            <td
              style={{
                width: '38%',
                verticalAlign: 'top',
                padding: 0,
                borderRight: cellBorder,
              }}
            >
              <div
                style={{
                  padding: '4px 6px',
                  fontWeight: 700,
                  fontSize: 7.5,
                  textTransform: 'uppercase',
                  borderBottom: cellBorder,
                  color: ink,
                }}
              >
                Above Particulars as Declared by Shipper
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['CHARGES', 'PREPAID', 'COLLECT'].map((h) => (
                      <th
                        key={h}
                        style={{
                          borderTop: cellBorder,
                          borderBottom: cellBorder,
                          borderRight: cellBorder,
                          padding: '3px 4px',
                          fontSize: 7.5,
                          fontWeight: 700,
                          textAlign: 'left',
                          color: ink,
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[0, 1, 2].map((row) => (
                    <tr key={row}>
                      {[0, 1, 2].map((col) => (
                        <td
                          key={col}
                          style={{
                            borderBottom: cellBorder,
                            borderRight: cellBorder,
                            height: 16,
                            padding: '2px 4px',
                          }}
                        />
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </td>
            <td style={{ verticalAlign: 'top', padding: '6px 8px' }}>
              <p style={{ fontSize: 7.5, textAlign: 'justify', color: ink }}>{received}</p>
              <div
                style={{
                  marginTop: 10,
                  display: 'flex',
                  flexWrap: 'nowrap',
                  gap: 12,
                  alignItems: 'baseline',
                }}
              >
                <p style={{ fontWeight: 700, fontSize: 8, textTransform: 'uppercase', color: ink }}>
                  Place and Date of Issue
                </p>
                <p style={{ fontWeight: 600, fontSize: 8 }}>{placeDate}</p>
              </div>
              <div style={{ marginTop: 14, textAlign: 'left', minHeight: 64 }}>
                {/* Fresa Format-11: left-aligned agent label, open whitespace, carrier — no drawn rule. */}
                <p style={{ fontSize: 8, color: ink }}>As Agents for the carrier</p>
                <div style={{ height: 28 }} aria-hidden />
                <p style={{ fontWeight: 700, fontSize: 9, color: ink }}>{carrier}</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function HawbRouteGrid({ theme, demo }: { theme: InvoiceFormatUiTheme; demo: InvoiceFormatUiDemo }) {
  const fields =
    demo.hawbRouteFields ??
    (demo.fieldGrid ?? []).slice(0, 6) ??
    [];
  const cells = fields.length
    ? fields
    : [
        { k: 'Airport of Departure', v: '' },
        { k: 'Airport of Destination', v: '' },
        { k: 'Flight / Date', v: '' },
        { k: 'Pieces', v: '' },
        { k: 'Gross Weight', v: '' },
        { k: 'Chargeable Weight', v: '' },
      ];
  return (
    <div
      className="grid grid-cols-3 border-b"
      style={{ borderColor: theme.primary, backgroundColor: theme.panel }}
    >
      {cells.map((f) => (
        <div key={f.k} className="border-b border-r p-2" style={{ borderColor: theme.primary }}>
          <p className="text-[7.5px] font-bold uppercase" style={{ color: theme.primary }}>
            {f.k}
          </p>
          <p className="mt-0.5 text-[9px] font-semibold">{f.v}</p>
        </div>
      ))}
    </div>
  );
}

function ArrivalChargesOptional({
  theme,
  demo,
  showCharges,
}: {
  theme: InvoiceFormatUiTheme;
  demo: InvoiceFormatUiDemo;
  showCharges: boolean;
}) {
  if (!showCharges) {
    return (
      <div className="border-b px-3 py-2 text-[8.5px]" style={{ borderColor: theme.primary }}>
        <p className="font-bold" style={{ color: theme.primary }}>
          Charges
        </p>
        <p style={{ color: theme.gray }}>
          {demo.arrivalChargesNote || 'Charges omitted on this arrival notice format.'}
        </p>
      </div>
    );
  }
  return <ChargeTable theme={theme} demo={demo} headerColor="cyan" />;
}

function DeliveryOrderRelease({ theme, demo }: { theme: InvoiceFormatUiTheme; demo: InvoiceFormatUiDemo }) {
  return (
    <div
      className="mx-3 my-2 border p-3 text-[9px] leading-normal"
      style={{ borderColor: theme.primary, backgroundColor: theme.fill }}
    >
      <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: theme.primary }}>
        Delivery Order — Please release cargo to
      </p>
      <p className="mt-2 font-semibold">{demo.billToName || demo.partyMid?.lines?.[0] || ''}</p>
      {(demo.partyMid?.lines ?? []).slice(1).map((line) => (
        <p key={line}>{line}</p>
      ))}
      <div className="mt-3 grid grid-cols-3 gap-2 text-[8px]">
        {(demo.fieldGrid ?? []).slice(0, 3).map((f) => (
          <div key={f.k}>
            <p className="font-bold" style={{ color: theme.gray }}>
              {f.k}
            </p>
            <p className="font-semibold">{f.v}</p>
          </div>
        ))}
      </div>
      {demo.remarks ? (
        <p className="mt-2 border-t pt-2" style={{ borderColor: theme.primary }}>
          {demo.remarks}
        </p>
      ) : null}
    </div>
  );
}
