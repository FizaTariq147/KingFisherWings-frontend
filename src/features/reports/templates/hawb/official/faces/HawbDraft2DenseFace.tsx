import type { HawbOfficialModel } from '../hawbOfficial.types';
import { HAWB_DRAFT2_LAYOUT } from '../layouts/hawbDraft2.layout';
import {
  displayOrBlank,
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
  hawbNoBadge,
  hawbTitle,
} from '../hawbOfficialStyles';

const LEGAL =
  "It is agreed that the goods described herein are accepted in apparent good order and condition (except as noted) for carriage SUBJECT TO THE CONDITIONS OF CONTRACT ON THE REVERSE HEREOF. ALL GOODS MAY BE CARRIED BY ANY OTHER MEANS INCLUDING ROAD OR ANY OTHER CARRIER UNLESS SPECIFIC CONTRARY INSTRUCTIONS ARE GIVEN HEREON BY THE SHIPPER. THE SHIPPER'S ATTENTION IS DRAWN TO THE NOTICE CONCERNING CARRIER'S LIMITATION OF LIABILITY. Shipper may increase such limitation of liability by declaring a higher value for carriage and paying a supplemental charge if required.";

const CERT =
  'Shipper certifies that the particulars on the face hereof are correct and that insofar as any part of the consignment contains dangerous goods, such part is properly described by name and is in proper condition for carriage by air according to the applicable Dangerous Goods Regulations.';

/** Band heights tuned to Fresa hawb-draft-report-format-2.pdf landmarks. */
const H = {
  shipper: 78,
  consignee: 70,
  agent: 46,
  departure: 30,
  destination: 32,
  handling: 34,
  cargoMin: 118,
  signatureGap: 14,
} as const;

function HawbNoBadge({ value }: { value: string }) {
  return (
    <div style={hawbNoBadge}>
      HAWB NO.{value.trim() ? ` ${value.trim()}` : ''}
    </div>
  );
}

/**
 * HAWB Draft-2 — Non Negotiable Air Waybill face.
 * Matches Fresa hawb-draft-report-format-2.pdf: black HAWB badges, denser routing, EXTRA COPY.
 */
export function HawbDraft2DenseFace({ model }: { model: HawbOfficialModel }) {
  const layout = HAWB_DRAFT2_LAYOUT;
  const customs = displayOrBlank(model.declaredCustoms, layout.customsDefaultWhenEmpty);
  const carriage = model.declaredCarriage;
  const insurance = model.insurance;
  const lines = (rows: string[]) =>
    hawbCapLines(rows, 4).map((line, i) => (
      <p key={`${line}-${i}`} style={{ ...hawbBody, fontWeight: 700 }}>
        {line}
      </p>
    ));
  const natureLines = hawbNatureLines(model.natureOfGoods, model.handling);
  const natureOnly = natureLines[0] || '';
  const cargoRow = model.tableRows[0] || [
    model.pieces,
    model.grossWeight,
    model.pieces || model.grossWeight ? 'K' : '',
    natureOnly ? 'S' : '',
    model.chargeableWeight,
    model.rateCharge,
    model.total,
    natureOnly,
  ];
  const packagesLine = model.pieces ? `TOTAL : (${model.pieces}) PACKAGES ONLY` : '';
  const prepaid = hawbIsPrepaid(model.handling, model.accounting);
  const byCarrier = hawbFirstFlightCode(model.flightDate, model.carrier);

  return (
    <div
      data-hawb-dense-face="draft2"
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
      {/* Fresa: black inverted HAWB NO top-right */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginBottom: 2,
          flexShrink: 0,
        }}
      >
        <HawbNoBadge value={model.hawbNo} />
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
            <td style={{ ...hawbCell, ...hawbClipBand(H.shipper), verticalAlign: 'top' }}>
              <p style={hawbLabel}>Shippers Name and Address</p>
              {lines(model.shipperLines)}
            </td>
            <td style={{ ...hawbCell, ...hawbClipBand(H.shipper), textAlign: 'center', verticalAlign: 'top' }}>
              <p style={{ ...hawbLabel, textAlign: 'left' }}>Non Negotiable</p>
              <p style={{ ...hawbTitle, textAlign: 'center', fontSize: 13 }}>{layout.titleMode}</p>
              <p style={{ ...hawbLabel, textAlign: 'left', marginTop: 1 }}>Issued by</p>
              {model.logoUrl ? (
                <img
                  src={model.logoUrl}
                  alt=""
                  style={{
                    height: 20,
                    maxWidth: 80,
                    objectFit: 'contain',
                    display: 'block',
                    margin: '2px auto 1px',
                  }}
                />
              ) : null}
              <p style={{ ...hawbBody, fontWeight: 700, textAlign: 'center', marginTop: 1 }}>
                {model.companyName}
              </p>
              <p style={{ ...hawbBody, textAlign: 'center', fontSize: 7 }}>
                {hawbCapLines((model.companyAddress || '').split(/\n/), 2).join(', ')}
              </p>
              <p style={{ ...hawbLegal, marginTop: 2, textAlign: 'left' }}>
                {layout.copiesValidityLine}
              </p>
            </td>
          </tr>
          <tr>
            <td style={{ ...hawbCell, ...hawbClipBand(H.consignee), verticalAlign: 'top' }}>
              <p style={hawbLabel}>Consignee&apos;s Name and Address</p>
              {lines(model.consigneeLines)}
            </td>
            <td style={{ ...hawbCell, ...hawbClipBand(H.consignee) }}>
              <p style={hawbLegal}>{LEGAL}</p>
            </td>
          </tr>
          <tr>
            <td
              style={{ ...hawbCell, ...hawbClipBand(H.agent), verticalAlign: 'top' }}
            >
              <p style={hawbLabel}>Issuing Carrier&apos; Agent Name and City</p>
              <p style={{ ...hawbBody, fontWeight: 700, whiteSpace: 'pre-line' }}>
                {hawbCapLines(model.agentLines, 2).join('\n') || model.companyName}
              </p>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 0,
                  marginTop: 6,
                  borderTop: `1px solid ${hawbInk}`,
                }}
              >
                <div style={{ paddingTop: 3, borderRight: `1px solid ${hawbInk}` }}>
                  <p style={hawbLabel}>Agent&apos;s IATA Code</p>
                </div>
                <div style={{ paddingTop: 3, paddingLeft: 4 }}>
                  <p style={hawbLabel}>Account No.</p>
                </div>
              </div>
            </td>
            <td style={{ ...hawbCell, ...hawbClipBand(H.agent), verticalAlign: 'top' }}>
              <p style={hawbLabel}>Accounting Information</p>
              <p
                style={{
                  ...hawbBody,
                  fontWeight: 700,
                  textAlign: 'right',
                  fontSize: 9,
                  marginTop: 4,
                }}
              >
                {model.accounting}
              </p>
              <p style={{ ...hawbLabel, marginTop: 6 }}>Master AWB No.</p>
              <p style={{ ...hawbBody, fontWeight: 700, fontSize: 10 }}>{model.mawbNo}</p>
            </td>
          </tr>
          <tr>
            <td
              style={{
                ...hawbCell, ...hawbClipBand(H.departure),
                verticalAlign: 'top',
              }}
            >
              <p style={hawbLabel}>Airport of Departure</p>
              <p style={{ ...hawbBody, fontWeight: 700 }}>{model.departure}</p>
            </td>
            <td style={{ ...hawbCell, ...hawbClipBand(H.departure), padding: 0 }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '12% 18% 10% 12% 16% 16% 16%',
                  height: '100%',
                }}
              >
                {(
                  [
                    ['To', model.toCode],
                    ['By First Carrier', byCarrier],
                    ['to / by', ''],
                    ['Currency', model.currency],
                    ['CHGS / WT/VAL', prepaid ? 'PP' : ''],
                    ['Declared Carriage', carriage],
                    ['Declared Customs', customs],
                  ] as const
                ).map(([lab, val], i, arr) => (
                  <div
                    key={lab}
                    style={{
                      ...hawbCell,
                      border: 'none',
                      borderRight: i < arr.length - 1 ? `1px solid ${hawbInk}` : 'none',
                      height: '100%',
                      padding: '1px 2px',
                    }}
                  >
                    <p style={hawbLabel}>{lab}</p>
                    <p style={{ ...hawbBody, fontWeight: 700 }}>{val}</p>
                  </div>
                ))}
              </div>
            </td>
          </tr>
          <tr>
            <td
              style={{
                ...hawbCell, ...hawbClipBand(H.destination),
                verticalAlign: 'top',
                padding: 0,
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '58% 42%', height: '100%' }}>
                <div
                  style={{
                    ...hawbCell,
                    border: 'none',
                    borderRight: `1px solid ${hawbInk}`,
                    height: '100%',
                  }}
                >
                  <p style={hawbLabel}>Airport of Destination</p>
                  <p style={{ ...hawbBody, fontWeight: 700 }}>{model.destination}</p>
                </div>
                <div style={{ ...hawbCell, border: 'none', height: '100%' }}>
                  <p style={hawbLabel}>Requested Flight / Date</p>
                  <p style={{ ...hawbBody, fontWeight: 700 }}>{model.flightDate}</p>
                </div>
              </div>
            </td>
            <td
              style={{
                ...hawbCell, ...hawbClipBand(H.destination),
                verticalAlign: 'top',
              }}
            >
              <p style={hawbLabel}>Amount of Insurance</p>
              <p style={{ ...hawbBody, fontWeight: 700 }}>{insurance}</p>
            </td>
          </tr>
          <tr>
            <td
              colSpan={2}
              style={{ ...hawbCell, ...hawbClipBand(H.handling), verticalAlign: 'top' }}
            >
              <p style={hawbLabel}>Handling Information</p>
              <p style={{ ...hawbBody, fontWeight: 700 }}>{model.handling}</p>
              {packagesLine ? (
                <p style={{ ...hawbBody, fontWeight: 700, marginTop: 4 }}>{packagesLine}</p>
              ) : null}
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
          <col style={{ width: '8%' }} />
          <col style={{ width: '11%' }} />
          <col style={{ width: '4%' }} />
          <col style={{ width: '7%' }} />
          <col style={{ width: '12%' }} />
          <col style={{ width: '11%' }} />
          <col style={{ width: '11%' }} />
          <col style={{ width: '36%' }} />
        </colgroup>
        <tbody>
          <tr>
            {[
              'No. of Pieces RCP',
              'Gross Weight',
              'kg',
              'Rate Class',
              'Chargeable Weight',
              'Rate / Charge',
              'Total',
              'Nature and Quantity of Goods',
            ].map((h) => (
              <td key={h} style={hawbColHead}>
                {h}
              </td>
            ))}
          </tr>
          <tr>
            {Array.from({ length: 8 }).map((_, i) => (
              <td
                key={i}
                style={{
                  ...hawbCell,
                  minHeight: H.cargoMin,
                  verticalAlign: 'top',
                  overflow: 'hidden',
                  fontWeight: 700,
                }}
              >
                {i === 7 ? (
                  natureLines.map((line) => (
                    <p key={line} style={{ ...hawbBody, fontWeight: 700, margin: '0 0 2px' }}>
                      {line}
                    </p>
                  ))
                ) : (
                  (cargoRow[i] ?? '')
                )}
              </td>
            ))}
          </tr>
        </tbody>
      </table>

      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          border: `1.5px solid ${hawbInk}`,
          borderTop: 'none',
          flexShrink: 0,
          tableLayout: 'fixed',
        }}
      >
        <colgroup>
          <col style={{ width: '48%' }} />
          <col style={{ width: '52%' }} />
        </colgroup>
        <tbody>
          <tr>
            <td style={{ ...hawbCell, padding: 0, verticalAlign: 'top' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '42% 29% 29%',
                  borderBottom: `1px solid ${hawbInk}`,
                  minHeight: 14,
                }}
              >
                <div style={{ padding: '1px 3px' }} />
                <div style={{ padding: '1px 3px', borderLeft: `1px solid ${hawbInk}` }}>
                  <p style={hawbLabel}>Prepaid</p>
                </div>
                <div style={{ padding: '1px 3px', borderLeft: `1px solid ${hawbInk}` }}>
                  <p style={hawbLabel}>Collect</p>
                </div>
              </div>
              {(
                [
                  ['Weight Charge', model.total],
                  ['Valuation Charge', ''],
                  ['Tax', ''],
                  ['Total Other Charges Due Agent', ''],
                  ['Total Other Charges Due Carrier', ''],
                  ['Total Prepaid', model.total],
                  ['Total Collect', ''],
                ] as const
              ).map(([lab, prepaid], idx, arr) => (
                <div
                  key={lab}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '42% 29% 29%',
                    borderBottom: idx < arr.length - 1 ? `1px solid ${hawbInk}` : 'none',
                    minHeight: 18,
                  }}
                >
                  <div style={{ padding: '2px 3px' }}>
                    <p style={hawbLabel}>{lab}</p>
                  </div>
                  <div style={{ padding: '2px 3px', borderLeft: `1px solid ${hawbInk}` }}>
                    <p style={{ ...hawbBody, fontWeight: 700, margin: 0 }}>{prepaid}</p>
                  </div>
                  <div style={{ padding: '2px 3px', borderLeft: `1px solid ${hawbInk}` }} />
                </div>
              ))}
            </td>
            <td style={{ ...hawbCell, verticalAlign: 'top' }}>
              <p style={hawbLabel}>Other Charges</p>
              <p style={hawbBody}>{model.otherCharges}</p>
              <p style={{ ...hawbLegal, marginTop: 6 }}>{CERT}</p>
              <p style={{ ...hawbLabel, marginTop: 8 }}>Signature of Shipper or his Agent</p>
              <p style={{ ...hawbBody, fontWeight: 700, marginTop: 4 }}>{model.companyName}</p>
              <div
                style={{
                  height: H.signatureGap,
                  borderBottom: `1px dashed ${hawbInk}`,
                  margin: '2px 0 6px',
                }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.3fr', gap: 3 }}>
                <div>
                  <p style={hawbLabel}>Executed on (Date)</p>
                  <p style={{ ...hawbBody, fontWeight: 700 }}>{model.executedOn}</p>
                </div>
                <div>
                  <p style={hawbLabel}>at (Place)</p>
                  <p style={{ ...hawbBody, fontWeight: 700 }}>{model.executedAt}</p>
                </div>
                <div>
                  <p style={hawbLabel}>Signature of Issuing Carrier or its Agent</p>
                  <p style={{ ...hawbBody, fontWeight: 700, marginTop: 4 }}>
                    {model.agentLines[0] || model.companyName}
                  </p>
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td colSpan={2} style={{ ...hawbCell, padding: '3px 4px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <p style={{ ...hawbBody, margin: 0, fontSize: 6.5 }}>
                  <strong>Currency Conversion Rates</strong> · CC Charges in Dest. Currency · Charges
                  at Destination · Total Collect Charges
                </p>
                <HawbNoBadge value={model.hawbNo} />
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <p
        style={{
          ...hawbLabel,
          textAlign: 'center',
          margin: '5px 0 0',
          flexShrink: 0,
          letterSpacing: '0.12em',
          fontSize: 8,
        }}
      >
        EXTRA COPY
      </p>
    </div>
  );
}
