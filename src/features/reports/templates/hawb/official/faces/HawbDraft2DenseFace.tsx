import type { HawbOfficialModel } from '../hawbOfficial.types';
import { HAWB_DRAFT2_LAYOUT } from '../layouts/hawbDraft2.layout';
import { hawbBody, hawbCell, hawbInk, hawbLabel, hawbLegal, displayOrBlank } from '../hawbOfficialStyles';

const LEGAL =
  "It is agreed that the goods described herein are accepted in apparent good order and condition (except as noted) for carriage SUBJECT TO THE CONDITIONS OF CONTRACT ON THE REVERSE HEREOF. ALL GOODS MAY BE CARRIED BY ANY OTHER MEANS INCLUDING ROAD OR ANY OTHER CARRIER UNLESS SPECIFIC CONTRARY INSTRUCTIONS ARE GIVEN HEREON BY THE SHIPPER. THE SHIPPER'S ATTENTION IS DRAWN TO THE NOTICE CONCERNING CARRIER'S LIMITATION OF LIABILITY. Shipper may increase such limitation of liability by declaring a higher value for carriage and paying a supplemental charge if required.";

const CERT =
  'Shipper certifies that the particulars on the face hereof are correct and that insofar as any part of the consignment contains dangerous goods, such part is properly described by name and is in proper condition for carriage by air according to the applicable Dangerous Goods Regulations.';

/**
 * Upper bands fixed; cargo flex-fills so charges sit near Fresa ~73%+ landmarks.
 * Phase 2.5: taller shipper/consignee; open charge cells (Fresa SBS).
 */
const H = {
  shipper: 100,
  consignee: 94,
  agent: 52,
  departure: 34,
  destination: 40,
  handling: 42,
  cargoMin: 120,
  otherCharges: 28,
  signatureGap: 22,
} as const;

/**
 * HAWB Draft-2 only — Non Negotiable Air Waybill face (not House title).
 * Distinct from Draft: HAWB NO header box, IATA agent cells, N.C.V customs default.
 */
export function HawbDraft2DenseFace({ model }: { model: HawbOfficialModel }) {
  const layout = HAWB_DRAFT2_LAYOUT;
  const customs = displayOrBlank(model.declaredCustoms, layout.customsDefaultWhenEmpty);
  const lines = (rows: string[]) =>
    rows.map((line, i) => (
      <p key={`${line}-${i}`} style={hawbBody}>
        {line}
      </p>
    ));
  const cargoRow = model.tableRows[0] || [
    model.pieces,
    model.grossWeight,
    model.pieces || model.grossWeight ? 'K' : '',
    model.natureOfGoods ? 'S' : '',
    model.chargeableWeight,
    model.rateCharge,
    model.total,
    model.natureOfGoods,
  ];

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
      {/* Draft-2 header: HAWB NO prominence (Fresa top-right ~1.8%) */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginBottom: 3,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            border: `1px solid ${hawbInk}`,
            padding: '2px 10px',
            minWidth: 168,
            textAlign: 'right',
            background: '#fff',
          }}
        >
          <p style={{ ...hawbLabel, margin: 0 }}>HAWB NO.</p>
          <p style={{ ...hawbBody, fontWeight: 800, fontSize: 11, margin: 0 }}>{model.hawbNo}</p>
        </div>
      </div>

      <table
        className="fn-table"
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          border: `1px solid ${hawbInk}`,
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
            <td
              style={{
                ...hawbCell,
                minHeight: H.shipper,
                height: H.shipper,
                verticalAlign: 'top',
              }}
            >
              <p style={hawbLabel}>Shippers Name and Address</p>
              {lines(model.shipperLines)}
            </td>
            <td style={hawbCell}>
              <p style={hawbLabel}>Non Negotiable</p>
              <p
                style={{
                  margin: '4px 0',
                  fontSize: 14,
                  fontWeight: 800,
                  letterSpacing: '0.03em',
                }}
              >
                {layout.titleMode}
              </p>
              <p style={hawbLabel}>Issued by</p>
              {model.logoUrl ? (
                <img
                  src={model.logoUrl}
                  alt=""
                  style={{ height: 26, maxWidth: 110, objectFit: 'contain', display: 'block' }}
                />
              ) : null}
              <p style={{ ...hawbBody, fontWeight: 800 }}>{model.companyName}</p>
              <p style={hawbBody}>{model.companyAddress}</p>
              <p style={{ ...hawbLegal, marginTop: 6 }}>{layout.copiesValidityLine}</p>
            </td>
          </tr>
          <tr>
            <td
              style={{
                ...hawbCell,
                minHeight: H.consignee,
                height: H.consignee,
                verticalAlign: 'top',
              }}
            >
              <p style={hawbLabel}>Consignee&apos;s Name and Address</p>
              {lines(model.consigneeLines)}
            </td>
            <td style={hawbCell}>
              <p style={hawbLegal}>{LEGAL}</p>
            </td>
          </tr>
          <tr>
            <td
              style={{ ...hawbCell, minHeight: H.agent, height: H.agent, verticalAlign: 'top' }}
            >
              <p style={hawbLabel}>Issuing Carrier&apos; Agent Name and City</p>
              <p style={{ ...hawbBody, fontWeight: 700, whiteSpace: 'pre-line' }}>
                {model.agentLines.join('\n')}
              </p>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 0,
                  marginTop: 8,
                  borderTop: `1px solid ${hawbInk}`,
                }}
              >
                <div style={{ paddingTop: 4, borderRight: `1px solid ${hawbInk}` }}>
                  <p style={hawbLabel}>Agent&apos;s IATA Code</p>
                </div>
                <div style={{ paddingTop: 4, paddingLeft: 6 }}>
                  <p style={hawbLabel}>Account No.</p>
                </div>
              </div>
            </td>
            <td style={{ ...hawbCell, minHeight: H.agent, height: H.agent, verticalAlign: 'top' }}>
              <p style={hawbLabel}>Accounting Information</p>
              <p style={{ ...hawbBody, fontWeight: 700 }}>{model.handling || model.accounting}</p>
              <p style={{ ...hawbLabel, marginTop: 8 }}>Master AWB No.</p>
              <p style={{ ...hawbBody, fontWeight: 800 }}>{model.mawbNo}</p>
            </td>
          </tr>
          <tr>
            <td
              style={{
                ...hawbCell,
                minHeight: H.departure,
                height: H.departure,
                verticalAlign: 'top',
              }}
            >
              <p style={hawbLabel}>Airport of Departure</p>
              <p style={{ ...hawbBody, fontWeight: 700 }}>{model.departure}</p>
            </td>
            <td style={{ ...hawbCell, minHeight: H.departure, height: H.departure, padding: 0 }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr 1fr',
                  gap: 0,
                  height: '100%',
                }}
              >
                <div
                  style={{
                    ...hawbCell,
                    border: 'none',
                    borderRight: `1px solid ${hawbInk}`,
                    height: '100%',
                  }}
                >
                  <p style={hawbLabel}>To</p>
                  <p style={{ ...hawbBody, fontWeight: 700 }}>{model.toCode}</p>
                </div>
                <div
                  style={{
                    ...hawbCell,
                    border: 'none',
                    borderRight: `1px solid ${hawbInk}`,
                    height: '100%',
                  }}
                >
                  <p style={hawbLabel}>By first Carrier</p>
                  <p style={{ ...hawbBody, fontWeight: 700 }}>{model.flightDate}</p>
                </div>
                <div
                  style={{
                    ...hawbCell,
                    border: 'none',
                    borderRight: `1px solid ${hawbInk}`,
                    height: '100%',
                  }}
                >
                  <p style={hawbLabel}>Currency</p>
                  <p style={{ ...hawbBody, fontWeight: 700 }}>{model.currency}</p>
                </div>
                <div style={{ ...hawbCell, border: 'none', height: '100%' }}>
                  <p style={hawbLabel}>Declared Customs</p>
                  <p style={{ ...hawbBody, fontWeight: 700 }}>{customs}</p>
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td
              style={{
                ...hawbCell,
                minHeight: H.destination,
                height: H.destination,
                verticalAlign: 'top',
              }}
            >
              <p style={hawbLabel}>Airport of Destination</p>
              <p style={{ ...hawbBody, fontWeight: 700 }}>{model.destination}</p>
            </td>
            <td
              style={{
                ...hawbCell,
                minHeight: H.destination,
                height: H.destination,
                verticalAlign: 'top',
              }}
            >
              <p style={hawbLabel}>Declared Value for Carriage</p>
              <p style={{ ...hawbBody, fontWeight: 700 }}>{model.declaredCarriage}</p>
              <p style={{ ...hawbLabel, marginTop: 6 }}>Amount of Insurance</p>
              <p style={{ ...hawbBody, fontWeight: 700 }}>{model.insurance}</p>
            </td>
          </tr>
          <tr>
            <td
              colSpan={2}
              style={{ ...hawbCell, minHeight: H.handling, height: H.handling, verticalAlign: 'top' }}
            >
              <p style={hawbLabel}>Handling Information</p>
              <p style={hawbBody}>{model.handling}</p>
            </td>
          </tr>
        </tbody>
      </table>

      <table
        className="fn-table"
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          borderLeft: `1px solid ${hawbInk}`,
          borderRight: `1px solid ${hawbInk}`,
          tableLayout: 'fixed',
          marginTop: -1,
          flex: '1 1 auto',
          height: '100%',
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
        <tbody style={{ height: '100%' }}>
          <tr>
            {[
              'No. of Pieces',
              'Gross Weight',
              'kg',
              'Rate Class',
              'Chargeable Weight',
              'Rate / Charge',
              'Total',
              'Nature and Quantity of Goods',
            ].map((h) => (
              <td
                key={h}
                style={{
                  ...hawbCell,
                  background: '#f8fafc',
                  fontWeight: 700,
                  fontSize: 6.5,
                  textTransform: 'uppercase',
                  padding: '2px 4px',
                }}
              >
                {h}
              </td>
            ))}
          </tr>
          <tr style={{ height: '100%' }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <td
                key={i}
                style={{
                  ...hawbCell,
                  minHeight: H.cargoMin,
                  height: '100%',
                  verticalAlign: 'top',
                }}
              >
                {cargoRow[i] ?? ''}
              </td>
            ))}
          </tr>
          <tr>
            <td
              colSpan={8}
              style={{
                ...hawbCell,
                minHeight: H.otherCharges,
                height: H.otherCharges,
                verticalAlign: 'top',
              }}
            >
              <p style={hawbLabel}>Other Charges</p>
              <p style={hawbBody}>{model.otherCharges}</p>
            </td>
          </tr>
        </tbody>
      </table>

      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          border: `1px solid ${hawbInk}`,
          borderTop: 'none',
          flexShrink: 0,
        }}
      >
        <tbody>
          <tr>
            <td style={{ ...hawbCell, width: '50%', padding: 0, verticalAlign: 'top' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '40% 30% 30%',
                  borderBottom: `1px solid ${hawbInk}`,
                  minHeight: 16,
                  background: '#f8fafc',
                }}
              >
                <div style={{ padding: '2px 4px' }} />
                <div style={{ padding: '2px 4px', borderLeft: `1px solid ${hawbInk}` }}>
                  <p style={hawbLabel}>Prepaid</p>
                </div>
                <div style={{ padding: '2px 4px', borderLeft: `1px solid ${hawbInk}` }}>
                  <p style={hawbLabel}>Collect</p>
                </div>
              </div>
              {[
                ['Weight Charge', model.total],
                ['Valuation Charge', ''],
                ['Tax', ''],
                ['Total Other Charges Due Agent', ''],
                ['Total Other Charges Due Carrier', ''],
                ['Total Prepaid', model.total],
              ].map(([lab, prepaid]) => (
                <div
                  key={lab}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '40% 30% 30%',
                    borderBottom: `1px solid ${hawbInk}`,
                    minHeight: 20,
                  }}
                >
                  <div style={{ padding: '3px 4px' }}>
                    <p style={hawbLabel}>{lab}</p>
                  </div>
                  <div style={{ padding: '3px 4px', borderLeft: `1px solid ${hawbInk}` }}>
                    <p style={hawbBody}>{prepaid}</p>
                  </div>
                  <div style={{ padding: '3px 4px', borderLeft: `1px solid ${hawbInk}` }} />
                </div>
              ))}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '40% 30% 30%',
                  minHeight: 20,
                }}
              >
                <div style={{ padding: '3px 4px' }}>
                  <p style={hawbLabel}>Total Collect</p>
                </div>
                <div style={{ padding: '3px 4px', borderLeft: `1px solid ${hawbInk}` }} />
                <div style={{ padding: '3px 4px', borderLeft: `1px solid ${hawbInk}` }} />
              </div>
            </td>
            <td style={{ ...hawbCell, width: '50%', verticalAlign: 'top' }}>
              <p style={hawbLegal}>{CERT}</p>
              <p style={{ ...hawbLabel, marginTop: 8 }}>Signature of Shipper or his Agent</p>
              <div
                style={{
                  height: H.signatureGap,
                  borderBottom: `1px dashed ${hawbInk}`,
                  margin: '4px 0 8px',
                }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.25fr', gap: 4 }}>
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
                  <p style={{ ...hawbBody, fontWeight: 700, marginTop: 6 }}>
                    AS AGENT FOR THE CARRIER,
                  </p>
                  <p style={{ ...hawbBody, fontWeight: 800 }}>{model.carrier}</p>
                  <p style={hawbBody}>{model.companyName}</p>
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td colSpan={2} style={{ ...hawbCell, background: '#f8fafc', padding: '4px 5px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <p style={{ ...hawbBody, margin: 0, fontSize: 7.5 }}>
                  <strong>Currency Conversion Rates</strong> · Charges at Destination · Total Collect
                  Charges
                </p>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ ...hawbLabel, margin: 0 }}>HAWB NO.</p>
                  <p style={{ ...hawbBody, fontWeight: 800, margin: 0 }}>{model.hawbNo}</p>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* No orange DRAFT footer ribbon — absent on Fresa Draft-2 reference face */}
    </div>
  );
}
