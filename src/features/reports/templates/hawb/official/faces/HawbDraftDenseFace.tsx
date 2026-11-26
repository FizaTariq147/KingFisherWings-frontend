import type { CSSProperties } from 'react';
import type { HawbOfficialModel } from '../hawbOfficial.types';
import { HAWB_DRAFT_LAYOUT } from '../layouts/hawbDraft.layout';
import {
  displayOrBlank,
  hawbAccountChip,
  hawbBody,
  hawbCapLines,
  hawbCell,
  hawbClipBand,
  hawbColHead,
  hawbFirstFlightCode,
  hawbInk,
  hawbIsPrepaid,
  hawbLabel,
  hawbLegal,
  hawbNatureLines,
  hawbTitle,
} from '../hawbOfficialStyles';

/** Fresa Draft face legal (AIR / intermediate stopping places). */
const LEGAL =
  "It is agreed that the goods described herein are accepted in apparent good order and condition (except as noted) for carriage SUBJECT TO THE CONDITIONS OF CONTRACT ON THE REVERSE HEREOF. ALL GOODS MAY BE CARRIED BY ANY OTHER MEANS INCLUDING ROAD OR ANY OTHER CARRIER UNLESS SPECIFIC CONTRARY INSTRUCTIONS ARE GIVEN HEREON BY THE SHIPPER, AND SHIPPER AGREES THAT THE SHIPMENT MAY BE CARRIED VIA INTERMEDIATE STOPPING PLACES WHICH THE CARRIER DEEMS APPROPRIATE. THE SHIPPER'S ATTENTION IS DRAWN TO THE NOTICE CONCERNING CARRIER'S LIMITATION OF LIABILITY. Shipper may increase such limitation of liability by declaring a higher value for carriage and paying a supplemental charge if required.";

const CERT =
  'Shipper certifies that the particulars on the face hereof are correct and that insofar as any part of the consignment contains dangerous goods, such part is properly described by name and is in proper condition for carriage by air according to the applicable Dangerous Goods Regulations.';

/** Band heights tuned to Fresa hawb-draft-report-format.pdf (595×845). */
const H = {
  shipper: 86,
  consignee: 78,
  agent: 46,
  departure: 30,
  routing: 32,
  destination: 34,
  handling: 32,
  cargoMin: 108,
  signatureGap: 16,
} as const;

/** Draft-only cell — slightly more padding so data never kisses borders. */
const cell: CSSProperties = { ...hawbCell, padding: '3px 4px' };
const body: CSSProperties = { ...hawbBody, marginTop: 2, fontWeight: 700 };
const lab: CSSProperties = { ...hawbLabel, marginBottom: 1 };

function formatTopMawb(mawbNo: string, toCode: string): string {
  const digits = mawbNo.replace(/\D/g, '');
  if (digits.length >= 11) {
    const prefix = digits.slice(0, 3);
    const serial = digits.slice(3);
    const mid = toCode || 'MAA';
    return `${prefix}|${mid}|${serial}`;
  }
  return mawbNo.replace(/-/g, '|');
}

/**
 * HAWB Draft only — HOUSE AIR WAYBILL dense face.
 * Structure mirrors Fresa hawb-draft-report-format.pdf (not Draft-1 / Draft-2).
 */
export function HawbDraftDenseFace({ model }: { model: HawbOfficialModel }) {
  const layout = HAWB_DRAFT_LAYOUT;
  const lines = (rows: string[]) =>
    hawbCapLines(rows, 4).map((line, i) => (
      <p key={`${line}-${i}`} style={body}>
        {line}
      </p>
    ));

  const natureLines = hawbNatureLines(
    (model.natureOfGoods || '').split('\n')[0] || '',
    model.handling,
  );
  const natureOnly = natureLines[0] || '';
  const ctnLine = natureLines.find((l) => /CTN/i.test(l)) || '';
  const packagesLine = model.pieces ? `TOTAL : (${model.pieces}) PACKAGES ONLY` : '';
  const prepaid = hawbIsPrepaid(model.handling, model.accounting);
  const byCarrier = hawbFirstFlightCode(model.flightDate, model.carrier);
  const customs = displayOrBlank(model.declaredCustoms, layout.customsDefaultWhenEmpty);
  const charge = model.total?.trim() || (model.pieces || model.grossWeight ? '0.00' : '');
  const cargoRow = [
    model.pieces,
    model.grossWeight,
    model.pieces || model.grossWeight ? 'K' : '',
    natureOnly ? 'S' : '',
    model.chargeableWeight,
    model.rateCharge,
    charge,
    natureOnly,
  ];
  const topLeft = model.mawbNo
    ? formatTopMawb(model.mawbNo, model.toCode)
    : model.hawbNo || '';
  const topRight = model.mawbNo || model.hawbNo || '';

  const mini = (borderRight = true): CSSProperties => ({
    padding: '2px 3px',
    borderRight: borderRight ? `1px solid ${hawbInk}` : 'none',
    overflow: 'hidden',
    minWidth: 0,
  });

  return (
    <div
      data-hawb-dense-face="draft"
      className="fn-doc"
      style={{
        width: '100%',
        height: '100%',
        color: hawbInk,
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
      }}
    >
      {/* Airline / AWB number strip — Fresa Draft top band */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          border: `1.5px solid ${hawbInk}`,
          borderBottom: 'none',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            ...cell,
            border: 'none',
            borderRight: `1px solid ${hawbInk}`,
            fontWeight: 700,
            fontSize: 10,
            padding: '5px 6px',
          }}
        >
          {topLeft}
        </div>
        <div
          style={{
            ...cell,
            border: 'none',
            textAlign: 'right',
            fontWeight: 700,
            fontSize: 10,
            padding: '5px 6px',
          }}
        >
          {topRight}
        </div>
      </div>

      <table
        className="fn-table"
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          border: `1.5px solid ${hawbInk}`,
          tableLayout: 'fixed',
          flexShrink: 0,
        }}
      >
        <colgroup>
          <col style={{ width: '50%' }} />
          <col style={{ width: '50%' }} />
        </colgroup>
        <tbody>
          <tr>
            <td style={{ ...cell, ...hawbClipBand(H.shipper), padding: 0 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', height: '100%' }}>
                <div style={{ flex: 1, padding: '3px 4px', overflow: 'hidden' }}>
                  <p style={lab}>Shipper&apos;s Name and Address</p>
                  {lines(model.shipperLines)}
                </div>
                <div style={hawbAccountChip}>
                  <p style={lab}>Shipper&apos;s Account Number</p>
                </div>
              </div>
            </td>
            <td style={{ ...cell, ...hawbClipBand(H.shipper) }}>
              <p style={lab}>Non Negotiable</p>
              <p style={hawbTitle}>{layout.titleMode}</p>
              <p style={{ ...lab, marginTop: 3 }}>Issued by</p>
              {model.logoUrl ? (
                <img
                  src={model.logoUrl}
                  alt=""
                  style={{
                    height: 18,
                    maxWidth: 72,
                    objectFit: 'contain',
                    display: 'block',
                    marginTop: 2,
                  }}
                />
              ) : null}
              <p style={body}>{model.carrier || model.companyName}</p>
              <p style={{ ...hawbLegal, marginTop: 3 }}>{layout.copiesValidityLine}</p>
            </td>
          </tr>

          <tr>
            <td style={{ ...cell, ...hawbClipBand(H.consignee), padding: 0 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', height: '100%' }}>
                <div style={{ flex: 1, padding: '3px 4px', overflow: 'hidden' }}>
                  <p style={lab}>Consignee&apos;s Name and Address</p>
                  {lines(model.consigneeLines)}
                </div>
                <div style={hawbAccountChip}>
                  <p style={lab}>Consignee&apos;s Account Number</p>
                </div>
              </div>
            </td>
            <td style={{ ...cell, ...hawbClipBand(H.consignee) }}>
              <p style={hawbLegal}>{LEGAL}</p>
            </td>
          </tr>

          <tr>
            <td style={{ ...cell, ...hawbClipBand(H.agent) }}>
              <p style={lab}>Issuing Carrier&apos;s Agent Name and City</p>
              <p style={{ ...body, whiteSpace: 'pre-line' }}>
                {hawbCapLines(model.agentLines, 2).join('\n') || model.companyName}
              </p>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  marginTop: 6,
                  borderTop: `1px solid ${hawbInk}`,
                }}
              >
                <div style={{ paddingTop: 3, borderRight: `1px solid ${hawbInk}` }}>
                  <p style={lab}>Agent&apos;s IATA Code</p>
                </div>
                <div style={{ paddingTop: 3, paddingLeft: 4 }}>
                  <p style={lab}>Account No.</p>
                </div>
              </div>
            </td>
            <td style={{ ...cell, ...hawbClipBand(H.agent) }}>
              <p style={lab}>Accounting Information</p>
              <p style={body}>{model.accounting || (prepaid ? 'FREIGHT PREPAID' : '')}</p>
            </td>
          </tr>

          <tr>
            <td colSpan={2} style={{ ...cell, ...hawbClipBand(H.departure) }}>
              <p style={lab}>
                Airport of Departure (Addr. of first Carrier) and requested Routing
              </p>
              <p style={body}>{model.departure}</p>
            </td>
          </tr>

          {/* Fresa: To/By + Currency/CHGS/PP + Declared on one routing band */}
          <tr>
            <td colSpan={2} style={{ ...cell, ...hawbClipBand(H.routing), padding: 0 }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '7% 12% 5% 5% 5% 5% 8% 8% 7% 7% 15% 16%',
                  height: '100%',
                }}
              >
                {(
                  [
                    ['To', model.toCode],
                    ['By first Carrier', byCarrier],
                    ['to', ''],
                    ['by', ''],
                    ['to', ''],
                    ['by', ''],
                    ['Currency', model.currency],
                    ['CHGS Code', ''],
                    ['WT/VAL', prepaid ? 'PP' : ''],
                    ['Other', prepaid ? 'PP' : ''],
                    ['Declared Value for Carriage', model.declaredCarriage],
                    ['Declared Value for Customs', customs],
                  ] as const
                ).map(([label, value], i, arr) => (
                  <div key={`${label}-${i}`} style={mini(i < arr.length - 1)}>
                    <p style={lab}>{label}</p>
                    <p style={body}>{value}</p>
                  </div>
                ))}
              </div>
            </td>
          </tr>

          {/* Destination + Flight + Insurance (Fresa middle band) */}
          <tr>
            <td colSpan={2} style={{ ...cell, ...hawbClipBand(H.destination), padding: 0 }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '32% 28% 12% 28%',
                  height: '100%',
                }}
              >
                <div style={mini(true)}>
                  <p style={lab}>Airport of Destination</p>
                  <p style={body}>{model.destination}</p>
                </div>
                <div style={mini(true)}>
                  <p style={lab}>Requested Flight / Date</p>
                  <p style={body}>{model.flightDate}</p>
                </div>
                <div style={mini(true)}>
                  <p style={lab}>Amount of Insurance</p>
                  <p style={body}>{model.insurance}</p>
                </div>
                <div style={mini(false)}>
                  <p style={{ ...hawbLegal, fontSize: 4.5 }}>
                    INSURANCE — If Carrier offers insurance, and such insurance is available and
                    desired, indicate amount to be insured in figures in box marked Amount of
                    Insurance.
                  </p>
                </div>
              </div>
            </td>
          </tr>

          <tr>
            <td colSpan={2} style={{ ...cell, ...hawbClipBand(H.handling) }}>
              <p style={lab}>Handling Information</p>
              <p style={body}>{model.handling}</p>
              {packagesLine ? <p style={{ ...body, marginTop: 2 }}>{packagesLine}</p> : null}
            </td>
          </tr>
        </tbody>
      </table>

      <table
        className="fn-table"
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          borderLeft: `1.5px solid ${hawbInk}`,
          borderRight: `1.5px solid ${hawbInk}`,
          tableLayout: 'fixed',
          marginTop: -1,
          flex: '1 1 auto',
        }}
      >
        <colgroup>
          <col style={{ width: '9%' }} />
          <col style={{ width: '11%' }} />
          <col style={{ width: '5%' }} />
          <col style={{ width: '8%' }} />
          <col style={{ width: '12%' }} />
          <col style={{ width: '12%' }} />
          <col style={{ width: '12%' }} />
          <col style={{ width: '31%' }} />
        </colgroup>
        <tbody>
          <tr>
            {[
              'No. of Pieces RCP',
              'Gross Weight',
              'kg lb',
              'Rate Class',
              'Chargeable Weight',
              'Rate / Charge',
              'Total',
              'Nature and Quality of Goods (incl. Dimensions or Volume)',
            ].map((h) => (
              <td key={h} style={{ ...hawbColHead, padding: '2px 3px' }}>
                {h}
              </td>
            ))}
          </tr>
          <tr>
            {Array.from({ length: 8 }).map((_, i) => (
              <td
                key={i}
                style={{
                  ...cell,
                  minHeight: H.cargoMin,
                  verticalAlign: 'top',
                  overflow: 'hidden',
                }}
              >
                {i === 0 ? (
                  <>
                    <p style={body}>{cargoRow[0]}</p>
                    {ctnLine ? <p style={{ ...body, marginTop: 4 }}>{ctnLine}</p> : null}
                  </>
                ) : i === 7 ? (
                  natureLines
                    .filter((l) => !/CTN/i.test(l) || !ctnLine)
                    .map((line) => (
                      <p key={line} style={{ ...body, marginBottom: 2 }}>
                        {line}
                      </p>
                    ))
                ) : (
                  <p style={body}>{cargoRow[i] ?? ''}</p>
                )}
              </td>
            ))}
          </tr>
          <tr>
            <td style={cell}>
              <p style={body}>{model.pieces}</p>
            </td>
            <td style={cell}>
              <p style={body}>{model.grossWeight}</p>
            </td>
            <td colSpan={4} style={cell} />
            <td style={cell}>
              <p style={body}>{charge}</p>
            </td>
            <td style={cell} />
          </tr>
          <tr>
            <td colSpan={8} style={{ ...cell, height: 26 }}>
              <p style={lab}>Other Charges</p>
              <p style={hawbBody}>{model.otherCharges}</p>
            </td>
          </tr>
        </tbody>
      </table>

      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          border: `1.5px solid ${hawbInk}`,
          borderTop: 'none',
          tableLayout: 'fixed',
          flexShrink: 0,
        }}
      >
        <tbody>
          <tr>
            <td style={{ ...cell, width: '48%', padding: 0, verticalAlign: 'top' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '40% 30% 30%',
                  borderBottom: `1px solid ${hawbInk}`,
                  minHeight: 16,
                }}
              >
                <div style={{ padding: '2px 4px' }} />
                <div style={{ padding: '2px 4px', borderLeft: `1px solid ${hawbInk}` }}>
                  <p style={lab}>Prepaid</p>
                </div>
                <div style={{ padding: '2px 4px', borderLeft: `1px solid ${hawbInk}` }}>
                  <p style={lab}>Collect</p>
                </div>
              </div>
              {(
                [
                  ['Weight Charge', charge],
                  ['Valuation Charge', ''],
                  ['Tax', ''],
                  ['Total Other Charges Due Agent', ''],
                  ['Total Other Charges Due Carrier', ''],
                  ['Total Prepaid', charge],
                  ['Total Collect', ''],
                ] as const
              ).map(([label, amount], idx, arr) => (
                <div
                  key={label}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '40% 30% 30%',
                    borderBottom: idx < arr.length - 1 ? `1px solid ${hawbInk}` : 'none',
                    minHeight: 18,
                  }}
                >
                  <div style={{ padding: '2px 4px' }}>
                    <p style={lab}>{label}</p>
                  </div>
                  <div style={{ padding: '2px 4px', borderLeft: `1px solid ${hawbInk}` }}>
                    <p style={{ ...hawbBody, fontWeight: 700, margin: 0 }}>{amount}</p>
                  </div>
                  <div style={{ padding: '2px 4px', borderLeft: `1px solid ${hawbInk}` }} />
                </div>
              ))}
            </td>
            <td style={{ ...cell, width: '52%', verticalAlign: 'top' }}>
              <p style={hawbLegal}>{CERT}</p>
              <p style={{ ...body, marginTop: 8 }}>{model.companyName}</p>
              <p style={{ ...lab, marginTop: 2 }}>Signature of Shipper or his Agent</p>
              <div
                style={{
                  height: H.signatureGap,
                  borderBottom: `1px dashed ${hawbInk}`,
                  margin: '4px 0 8px',
                }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.3fr', gap: 4 }}>
                <div>
                  <p style={lab}>Executed on (Date)</p>
                  <p style={body}>{model.executedOn}</p>
                </div>
                <div>
                  <p style={lab}>at (Place)</p>
                  <p style={body}>{model.executedAt}</p>
                </div>
                <div>
                  <p style={lab}>Signature of Issuing Carrier or its Agent</p>
                  <p style={{ ...body, marginTop: 4 }}>
                    {model.carrier ? `AS AGENT FOR THE CARRIER,\n${model.carrier}` : model.companyName}
                  </p>
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td colSpan={2} style={{ ...cell, padding: '4px 5px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <p style={{ ...hawbBody, margin: 0, fontSize: 6.5 }}>
                  <strong>Currency Conversion Rates</strong> · CC Charges in Dest. Currency · For
                  Carrier&apos;s Use only at Destination · Charges at Destination · Total Collect
                  Charges
                </p>
                <p style={{ ...hawbBody, margin: 0, fontWeight: 700, fontSize: 10 }}>
                  {model.mawbNo?.replace(/-/g, '') || model.hawbNo || ''}
                </p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
