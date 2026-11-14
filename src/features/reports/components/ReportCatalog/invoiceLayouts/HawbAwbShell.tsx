import type { CSSProperties } from 'react';
import type {
  InvoiceFormatUiBranding,
  InvoiceFormatUiDemo,
  InvoiceFormatUiTheme,
} from '../../../types/invoiceFormatUiLayout.types';
import { brandLogoSrc } from './brandLogoSrc';

export type HawbAwbShellVariant =
  | 'draft'
  | 'draft1'
  | 'draft2'
  | 'original1'
  | 'original2';

type Props = {
  theme: InvoiceFormatUiTheme;
  demo: InvoiceFormatUiDemo;
  branding: InvoiceFormatUiBranding;
  variant?: HawbAwbShellVariant;
};

function kv(demo: InvoiceFormatUiDemo, key: string, fallback = ''): string {
  const hit = (demo.fieldGrid ?? []).find(
    (f) => f.k.toLowerCase() === key.toLowerCase(),
  );
  if (hit?.v?.trim()) return hit.v.trim();
  const route = (demo.hawbRouteFields ?? []).find(
    (f) => f.k.toLowerCase() === key.toLowerCase(),
  );
  return route?.v?.trim() || fallback;
}

/**
 * Fresa HOUSE AIR WAYBILL / Air Waybill form shell.
 * Matches IATA-style grid from fresatechnologies.com sample HAWB PDFs.
 * Terms & Conditions remain the separate Airway T&C PDF append (unchanged).
 */
export function HawbAwbShell({
  theme,
  demo,
  branding,
  variant = 'draft',
}: Props) {
  const ink = theme.ink || '#101010';
  const border = ink;
  const isDraft = variant === 'draft' || variant === 'draft1' || variant === 'draft2';
  const isAirWaybillTitle = variant === 'draft2' || variant === 'original2';
  const showNotify = variant === 'draft1';
  const preprinted = variant === 'original1' || variant === 'original2';

  const hawbNo =
    kv(demo, 'HAWB No.') ||
    kv(demo, 'HAWB NO.') ||
    demo.invoiceNo ||
    'MAA/DXB/1900014';
  const mawbNo =
    kv(demo, 'MAWB No.') ||
    kv(demo, 'MASTER AWB No.') ||
    kv(demo, 'MAWB NO.') ||
    '176-23456882';
  const jobNo = kv(demo, 'JOB NO.') || kv(demo, 'Job No.') || 'CAE190028';
  const departure =
    kv(demo, 'Airport of Departure') || 'CHENNAI (MAA)';
  const destination =
    kv(demo, 'Airport of Destination') || 'DUBAI INTERNATIONAL AIRPORT';
  const flight =
    kv(demo, 'Flight / Date') ||
    kv(demo, 'Requested Flight/Date') ||
    'EK9876 / 20-FEB-19';
  const currency = kv(demo, 'Currency') || demo.currency || 'INR';
  const declaredCarriage =
    kv(demo, 'Declared Value Carriage') ||
    kv(demo, 'Declared Value for Carriage') ||
    'N.V.D.';
  const declaredCustoms =
    kv(demo, 'Declared Value Customs') ||
    kv(demo, 'Declared Value for Customs') ||
    (variant === 'draft2' || variant === 'original2' ? 'N.C.V' : 'AS PER INV');
  const insurance = kv(demo, 'Amount of Insurance') || 'NIL';
  const pieces = kv(demo, 'Pieces') || kv(demo, 'No.of Pieces') || '100';
  const gross = kv(demo, 'Gross Weight') || '1,250.00';
  const chargeable = kv(demo, 'Chargeable Weight') || '1,250.00';
  const rate = kv(demo, 'Rate / Charge') || kv(demo, 'Rate') || 'AS ARRANGED';
  const total = kv(demo, 'Total') || 'AS ARRANGED';
  const nature =
    demo.tableRows?.[0]?.[3] ||
    demo.goodsDescription ||
    'STC: PAPER CUPS\nTOTAL : (100) PACKAGES ONLY\nCTN 1-20';
  const handling =
    kv(demo, 'Handling Information') || demo.remarks || 'FREIGHT PREPAID';
  const accounting =
    kv(demo, 'Accounting Information') || `JOB NO.: ${jobNo}`;
  const executedOn = demo.invoiceDate || '18-FEB-19';
  const executedAt =
    kv(demo, 'Place of Issue') ||
    departure.split('(')[0]?.trim() ||
    'CHENNAI';
  const carrier =
    kv(demo, 'Carrier') || demo.hblCarrierAgent || 'EMIRATES';
  const agentCity =
    (demo.partyNotify?.lines ?? []).join('\n') ||
    `${branding.company}\n${branding.address}`;
  const shipper = demo.partyLeft ?? {
    title: "Shipper's Name and Address",
    lines: ['BABU SECTOR PTLTD', 'CHENNAI, INDIA'],
  };
  const consignee = demo.partyMid ?? {
    title: "Consignee's Name and Address",
    lines: ['AL NASER TRADING COMPANY LLC', 'SHARJAH UAE'],
  };
  const notify = demo.partyNotify ?? {
    title: 'Notify Party',
    lines: consignee.lines ?? [],
  };

  const cell: CSSProperties = {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: border,
    padding: '3px 5px',
    verticalAlign: 'top',
    color: ink,
    fontSize: 8,
    lineHeight: 1.3,
    wordBreak: 'break-word',
    overflowWrap: 'anywhere',
  };
  const label: CSSProperties = {
    fontSize: 6.5,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.02em',
    color: ink,
    margin: 0,
    lineHeight: 1.25,
  };
  const body: CSSProperties = {
    fontSize: 8,
    margin: '2px 0 0',
    lineHeight: 1.3,
    color: ink,
    whiteSpace: 'pre-line',
  };
  const legal: CSSProperties = {
    fontSize: 5.5,
    lineHeight: 1.25,
    color: ink,
    margin: '2px 0 0',
    textAlign: 'justify',
  };

  const titleMain = isAirWaybillTitle ? 'Air Waybill' : 'HOUSE AIR WAYBILL';
  const copiesLine = isAirWaybillTitle
    ? 'Copies 1,2 and 3 of this Air Waybill are originals and have the same validity'
    : variant === 'draft1'
      ? 'Copies marked Original 1,2,3 and 4 are originals and have the same validity'
      : 'Copies 1,2 and 3 of this Air Waybill are originals and have the same validity';

  const legalText = isAirWaybillTitle
    ? "It is agreed that the goods described herein are accepted in apparent good order and condition (except as noted) for carriage SUBJECT TO THE CONDITIONS OF CONTRACT ON THE REVERSE HEREOF. ALL GOODS MAY BE CARRIED BY ANY OTHER MEANS INCLUDING ROAD OR ANY OTHER CARRIER UNLESS SPECIFIC CONTRARY INSTRUCTIONS ARE GIVEN HEREON BY THE SHIPPER. THE SHIPPER'S ATTENTION IS DRAWN TO THE NOTICE CONCERNING CARRIER'S LIMITATION OF LIABILITY. Shipper may increase such limitation of liability by declaring a higher value for carriage and paying a supplemental charge if required."
    : "It is agreed that the goods described herein are accepted in apparent good order and condition (except as noted) for carriage SUBJECT TO THE CONDITIONS OF CONTRACT ON THE REVERSE HEREOF. THE SHIPPER'S ATTENTION IS DRAWN TO THE NOTICE CONCERNING CARRIERS LIMITATION OF LIABILITY. Shipper may increase such limitation of liability by declaring a higher value for carriage and paying a supplemental charge if required.";

  const certText =
    'Shipper certifies that the particulars on the face hereof are correct and that insofar as any part of the consignment contains dangerous goods, such part is properly described by name and is in proper condition for carriage by air according to the applicable Dangerous Goods Regulations.';

  const partyLines = (lines: string[]) =>
    lines.filter(Boolean).map((line) => (
      <p key={line} style={body}>
        {line}
      </p>
    ));

  return (
    <div data-hawb-awb-shell={variant} style={{ width: '100%', color: ink }}>
      {/* Status ribbon */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 4,
          gap: 8,
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 9,
            fontWeight: 800,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: isDraft ? theme.orange || '#F6A21B' : theme.primary,
          }}
        >
          {isDraft ? 'DRAFT' : preprinted ? 'ORIGINAL — PRE-PRINTED' : 'ORIGINAL'}
        </p>
        <p style={{ margin: 0, fontSize: 8, color: theme.gray }}>
          HAWB NO. {hawbNo}
          {variant !== 'original1' ? ` · MAWB NO. ${mawbNo}` : ''}
        </p>
      </div>

      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          border: `1.5px solid ${border}`,
          tableLayout: 'fixed',
        }}
      >
        <colgroup>
          <col style={{ width: '27%' }} />
          <col style={{ width: '23%' }} />
          <col style={{ width: '25%' }} />
          <col style={{ width: '25%' }} />
        </colgroup>
        <tbody>
          {/* Row: Shipper | Issued by / numbers */}
          <tr>
            <td colSpan={2} style={{ ...cell, minHeight: 72 }}>
              <p style={label}>{shipper.title || "Shipper's Name and Address"}</p>
              {partyLines(shipper.lines ?? [])}
              {variant === 'draft' ? (
                <p style={{ ...label, marginTop: 6 }}>Shipper&apos;s Account Number</p>
              ) : null}
            </td>
            <td colSpan={2} style={cell}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 8,
                  alignItems: 'flex-start',
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={label}>
                    {isAirWaybillTitle ? 'Non Negotiable · Issued by' : 'Not Negotiable'}
                  </p>
                  {brandLogoSrc(branding) ? (
                    <img
                      src={brandLogoSrc(branding)}
                      alt={branding.company || ''}
                      style={{
                        height: 28,
                        width: 'auto',
                        maxWidth: 110,
                        objectFit: 'contain',
                        display: 'block',
                        marginTop: 4,
                      }}
                    />
                  ) : null}
                  {branding.company ? (
                    <p style={{ ...body, fontWeight: 700 }}>{branding.company}</p>
                  ) : null}
                  <p style={body}>{branding.address}</p>
                  {branding.phone ? <p style={body}>PHONE: {branding.phone}</p> : null}
                </div>
                <div style={{ textAlign: 'right', minWidth: 120 }}>
                  <p style={label}>HAWB NO.</p>
                  <p style={{ ...body, fontWeight: 800, fontSize: 10 }}>{hawbNo}</p>
                  <p style={{ ...label, marginTop: 6 }}>MAWB NO.</p>
                  <p style={{ ...body, fontWeight: 700 }}>{mawbNo}</p>
                  {variant === 'draft1' ? (
                    <>
                      <p style={{ ...label, marginTop: 6 }}>JOB NO.</p>
                      <p style={body}>{jobNo}</p>
                    </>
                  ) : null}
                </div>
              </div>
            </td>
          </tr>

          {/* Consignee | Accounting / Agent */}
          <tr>
            <td colSpan={2} style={{ ...cell, minHeight: 64 }}>
              <p style={label}>
                {consignee.title || "Consignee's Name and Address"}
              </p>
              {partyLines(consignee.lines ?? [])}
              {variant === 'draft' ? (
                <p style={{ ...label, marginTop: 6 }}>Consignee&apos;s Account Number</p>
              ) : null}
            </td>
            <td colSpan={2} style={cell}>
              {showNotify ? (
                <>
                  <p style={label}>Notify Party</p>
                  {partyLines(notify.lines ?? [])}
                  <p style={{ ...label, marginTop: 8 }}>AGENT:</p>
                  <p style={{ ...body, fontWeight: 700 }}>{branding.company}</p>
                </>
              ) : (
                <>
                  <p style={label}>Issuing Carrier&apos; Agent Name and City</p>
                  <p style={{ ...body, fontWeight: 700, whiteSpace: 'pre-line' }}>
                    {agentCity}
                  </p>
                  {isAirWaybillTitle ? (
                    <>
                      <p style={{ ...label, marginTop: 6 }}>Agent&apos;s IATA Code</p>
                      <p style={label}>Account No.</p>
                    </>
                  ) : null}
                </>
              )}
            </td>
          </tr>

          {/* Airport of departure + accounting */}
          <tr>
            <td colSpan={2} style={cell}>
              <p style={label}>
                Airport of Departure (Addr. of first Carrier) and requested Routing
              </p>
              <p style={{ ...body, fontWeight: 700 }}>{departure}</p>
            </td>
            <td colSpan={2} style={cell}>
              <p style={label}>Accounting Information</p>
              <p style={body}>{accounting}</p>
              <p style={{ ...body, fontWeight: 700 }}>{handling}</p>
            </td>
          </tr>

          {/* Routing to/by */}
          <tr>
            <td style={cell}>
              <p style={label}>To</p>
              <p style={{ ...body, fontWeight: 700 }}>
                {destination.match(/\(([A-Z]{3})\)/)?.[1] || 'DXB'}
              </p>
            </td>
            <td style={cell}>
              <p style={label}>By first Carrier</p>
              <p style={{ ...body, fontWeight: 700 }}>{carrier}</p>
            </td>
            <td style={cell}>
              <p style={label}>to / by / to</p>
              <p style={body}>Routing and Destination</p>
            </td>
            <td style={cell}>
              <p style={label}>Requested Flight / Date</p>
              <p style={{ ...body, fontWeight: 700 }}>{flight}</p>
            </td>
          </tr>

          {/* Destination + title band */}
          <tr>
            <td colSpan={2} style={cell}>
              <p style={label}>Airport of Destination</p>
              <p style={{ ...body, fontWeight: 700 }}>{destination}</p>
              <p style={{ ...label, marginTop: 6 }}>Handling Information</p>
              <p style={body}>{handling}</p>
            </td>
            <td colSpan={2} style={{ ...cell, textAlign: 'center', backgroundColor: theme.fill }}>
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: ink,
                }}
              >
                {titleMain}
              </p>
              <p style={{ ...legal, textAlign: 'center', marginTop: 4 }}>{copiesLine}</p>
              <p style={legal}>{legalText}</p>
            </td>
          </tr>

          {/* Currency / values / insurance */}
          <tr>
            <td style={cell}>
              <p style={label}>Currency</p>
              <p style={{ ...body, fontWeight: 700 }}>{currency}</p>
            </td>
            <td style={cell}>
              <p style={label}>CHGS Code · WT/VAL · Other</p>
              <p style={body}>
                {kv(demo, 'WT/VAL') || 'PP'} / {kv(demo, 'Other') || 'PP'}
              </p>
              <p style={{ ...label, marginTop: 4 }}>PPD · COLL</p>
            </td>
            <td style={cell}>
              <p style={label}>Declared Value for Carriage</p>
              <p style={{ ...body, fontWeight: 700 }}>{declaredCarriage}</p>
            </td>
            <td style={cell}>
              <p style={label}>Declared Value for Customs</p>
              <p style={{ ...body, fontWeight: 700 }}>{declaredCustoms}</p>
            </td>
          </tr>
          <tr>
            <td colSpan={2} style={cell}>
              <p style={label}>Amount of Insurance</p>
              <p style={{ ...body, fontWeight: 700 }}>{insurance}</p>
            </td>
            <td colSpan={2} style={cell}>
              <p style={label}>
                INSURANCE — If Carrier offers insurance, and such insurance is requested in
                accordance with the conditions hereof, indicate amount to be insured in figures
                in box marked Amount of Insurance.
              </p>
            </td>
          </tr>

        </tbody>
      </table>

      {/* Cargo body — separate table for cleaner column control */}
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          borderLeft: `1.5px solid ${border}`,
          borderRight: `1.5px solid ${border}`,
          tableLayout: 'fixed',
          marginTop: -1,
        }}
      >
        <colgroup>
          <col style={{ width: '9%' }} />
          <col style={{ width: '11%' }} />
          <col style={{ width: '6%' }} />
          <col style={{ width: '8%' }} />
          <col style={{ width: '12%' }} />
          <col style={{ width: '12%' }} />
          <col style={{ width: '12%' }} />
          <col style={{ width: '30%' }} />
        </colgroup>
        <tbody>
          <tr>
            {(demo.tableHeaders?.length
              ? demo.tableHeaders
              : [
                  'No. of Pieces',
                  'Gross Weight',
                  'kg',
                  'Rate Class',
                  'Chargeable Weight',
                  'Rate / Charge',
                  'Total',
                  'Nature and Quantity of Goods',
                ]
            ).map((h) => (
              <td
                key={h}
                style={{
                  ...cell,
                  backgroundColor: theme.panel,
                  fontWeight: 700,
                  fontSize: 6.5,
                  textTransform: 'uppercase',
                }}
              >
                {h}
              </td>
            ))}
          </tr>
          {(demo.tableRows?.length
            ? demo.tableRows
            : [[pieces, gross, 'K', 'Q', chargeable, rate, total, nature]]
          ).map((row, ri) => {
            const defaults = [pieces, gross, 'K', 'Q', chargeable, rate, total, nature];
            return (
              <tr key={ri}>
                {defaults.map((fallback, ci) => (
                  <td
                    key={ci}
                    style={{ ...cell, minHeight: 56, fontWeight: ci === 7 ? 600 : 500 }}
                  >
                    {row[ci] ?? fallback}
                  </td>
                ))}
              </tr>
            );
          })}
          <tr>
            <td colSpan={8} style={cell}>
              <p style={label}>Other Charges</p>
              <p style={body}>{kv(demo, 'Other Charges') || 'AS ARRANGED'}</p>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Charges + signature */}
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          border: `1.5px solid ${border}`,
          borderTop: 'none',
          tableLayout: 'fixed',
        }}
      >
        <tbody>
          <tr>
            <td style={{ ...cell, width: '50%' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {[
                    ['Weight Charge', 'AS ARRANGED', ''],
                    ['Valuation Charge', '', ''],
                    ['Tax', '', ''],
                    ['Total Other Charges Due Agent', '', ''],
                    ['Total Other Charges Due Carrier', '', ''],
                    ['Total Prepaid', total === 'AS ARRANGED' ? 'AS ARRANGED' : total, 'Total Collect'],
                  ].map(([lab, prepaid, collect]) => (
                    <tr key={lab}>
                      <td style={{ ...cell, width: '40%', borderColor: border }}>
                        <p style={label}>{lab}</p>
                      </td>
                      <td style={{ ...cell, width: '30%' }}>
                        <p style={label}>Prepaid</p>
                        <p style={body}>{prepaid}</p>
                      </td>
                      <td style={{ ...cell, width: '30%' }}>
                        <p style={label}>{collect || 'Collect'}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </td>
            <td style={{ ...cell, width: '50%' }}>
              <p style={legal}>{certText}</p>
              <p style={{ ...label, marginTop: 10 }}>Signature of Shipper or his Agent</p>
              <div style={{ height: 28 }} aria-hidden />
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1.4fr',
                  gap: 6,
                  marginTop: 8,
                }}
              >
                <div>
                  <p style={label}>Executed on (Date)</p>
                  <p style={{ ...body, fontWeight: 700 }}>{executedOn}</p>
                </div>
                <div>
                  <p style={label}>at (Place)</p>
                  <p style={{ ...body, fontWeight: 700 }}>{executedAt}</p>
                </div>
                <div>
                  <p style={label}>Signature of Issuing Carrier or its Agent</p>
                  <p style={{ ...body, fontWeight: 700, marginTop: 8 }}>
                    AS AGENT FOR THE CARRIER,
                  </p>
                  <p style={{ ...body, fontWeight: 800 }}>{carrier}</p>
                  <p style={body}>{branding.company}</p>
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td colSpan={2} style={{ ...cell, backgroundColor: theme.fill }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 12,
                  flexWrap: 'wrap',
                }}
              >
                <p style={{ ...body, margin: 0 }}>
                  <strong>Currency Conversion Rates</strong> · CC Charges in Dest. Currency
                </p>
                <p style={{ ...body, margin: 0 }}>
                  For Carrier&apos;s Use only at Destination · Charges at Destination · Total
                  Collect Charges
                </p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
