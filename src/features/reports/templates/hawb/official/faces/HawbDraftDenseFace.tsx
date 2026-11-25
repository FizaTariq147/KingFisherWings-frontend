import type { HawbOfficialModel } from '../hawbOfficial.types';
import { HAWB_DRAFT_LAYOUT } from '../layouts/hawbDraft.layout';
import {
  hawbAccountChip,
  hawbBody,
  hawbCell,
  hawbColHead,
  hawbInk,
  hawbLabel,
  hawbLegal,
  hawbTitle,
} from '../hawbOfficialStyles';

const LEGAL =
  "It is agreed that the goods described herein are accepted in apparent good order and condition (except as noted) for carriage SUBJECT TO THE CONDITIONS OF CONTRACT ON THE REVERSE HEREOF. ALL GOODS MAY BE CARRIED BY ANY OTHER MEANS INCLUDING ROAD OR ANY OTHER CARRIER UNLESS SPECIFIC CONTRARY INSTRUCTIONS ARE GIVEN HEREON BY THE SHIPPER. THE SHIPPER'S ATTENTION IS DRAWN TO THE NOTICE CONCERNING CARRIER'S LIMITATION OF LIABILITY. Shipper may increase such limitation of liability by declaring a higher value for carriage and paying a supplemental charge if required.";

const CERT =
  'Shipper certifies that the particulars on the face hereof are correct and that insofar as any part of the consignment contains dangerous goods, such part is properly described by name and is in proper condition for carriage by air according to the applicable Dangerous Goods Regulations.';

/**
 * Fixed upper/lower bands; cargo body flex-fills remaining page height
 * so Other Charges / signatures land near Fresa ~73–93% landmarks.
 * Phase 2.5: slightly taller shipper/consignee (Fresa open upper third);
 * lighter charge grid (open prepaid/collect cells, no per-row labels).
 */
const H = {
  shipper: 88,
  consignee: 82,
  agent: 48,
  departure: 34,
  routing: 28,
  destination: 36,
  currency: 30,
  handling: 36,
  insurance: 26,
  cargoMin: 110,
  otherCharges: 28,
  signatureGap: 18,
} as const;

/**
 * HAWB Draft only — HOUSE AIR WAYBILL dense face.
 * Structure mirrors Fresa hawb-draft-report-format.pdf (not Draft-2).
 */
export function HawbDraftDenseFace({ model }: { model: HawbOfficialModel }) {
  const layout = HAWB_DRAFT_LAYOUT;
  const lines = (rows: string[]) =>
    rows.map((line, i) => (
      <p key={`${line}-${i}`} style={{ ...hawbBody, fontWeight: 700 }}>
        {line}
      </p>
    ));

  const cargoRow = model.tableRows[0] || [
    model.pieces,
    model.grossWeight,
    model.pieces || model.grossWeight ? 'K' : '',
    '',
    model.chargeableWeight,
    model.rateCharge,
    model.total,
    model.natureOfGoods,
  ];

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
          gap: 0,
          border: `1.5px solid ${hawbInk}`,
          borderBottom: 'none',
          marginBottom: 0,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            ...hawbCell,
            fontWeight: 700,
            fontSize: 10,
            padding: '4px 6px',
            border: 'none',
            borderRight: `1px solid ${hawbInk}`,
          }}
        >
          {model.mawbNo
            ? model.mawbNo.replace(/-/g, '|')
            : model.hawbNo
              ? model.hawbNo
              : ''}
        </div>
        <div
          style={{
            ...hawbCell,
            textAlign: 'right',
            fontWeight: 700,
            fontSize: 10,
            padding: '4px 6px',
            border: 'none',
          }}
        >
          {model.mawbNo || model.hawbNo || ''}
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
          <col style={{ width: '36%' }} />
          <col style={{ width: '14%' }} />
          <col style={{ width: '25%' }} />
          <col style={{ width: '25%' }} />
        </colgroup>
        <tbody>
          <tr>
            <td
              colSpan={2}
              style={{
                ...hawbCell,
                minHeight: H.shipper,
                height: H.shipper,
                verticalAlign: 'top',
                padding: 0,
              }}
            >
              {/* Fresa: account-number chip sits top-right inside the shipper cell. */}
              <div style={{ display: 'flex', alignItems: 'flex-start', minHeight: H.shipper }}>
                <div style={{ flex: 1, padding: '1px 3px' }}>
                  <p style={hawbLabel}>Shipper&apos;s Name and Address</p>
                  {lines(model.shipperLines)}
                </div>
                <div style={hawbAccountChip}>
                  <p style={hawbLabel}>Shipper&apos;s Account Number</p>
                </div>
              </div>
            </td>
            <td colSpan={2} style={hawbCell}>
              {/* Fresa draft: title + Issued by only — AWB nos live in the top strip. */}
              <p style={hawbLabel}>Non Negotiable</p>
              <p style={hawbTitle}>{layout.titleMode}</p>
              <p style={{ ...hawbLabel, marginTop: 4 }}>Issued by</p>
              {model.logoUrl ? (
                <img
                  src={model.logoUrl}
                  alt=""
                  style={{ height: 22, maxWidth: 88, objectFit: 'contain', display: 'block', marginTop: 2 }}
                />
              ) : null}
              <p style={{ ...hawbBody, fontWeight: 700 }}>{model.carrier || model.companyName}</p>
              <p style={{ ...hawbLegal, marginTop: 4 }}>{layout.copiesValidityLine}</p>
            </td>
          </tr>

          <tr>
            <td
              colSpan={2}
              style={{
                ...hawbCell,
                minHeight: H.consignee,
                height: H.consignee,
                verticalAlign: 'top',
                padding: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', minHeight: H.consignee }}>
                <div style={{ flex: 1, padding: '1px 3px' }}>
                  <p style={hawbLabel}>Consignee&apos;s Name and Address</p>
                  {lines(model.consigneeLines)}
                </div>
                <div style={hawbAccountChip}>
                  <p style={hawbLabel}>Consignee&apos;s Account Number</p>
                </div>
              </div>
            </td>
            <td colSpan={2} style={hawbCell}>
              <p style={hawbLegal}>{LEGAL}</p>
            </td>
          </tr>

          {/* Agent + Accounting — Fresa draft places these under consignee/legal */}
          <tr>
            <td
              colSpan={2}
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
                  marginTop: 6,
                  borderTop: `0.75px solid ${hawbInk}`,
                }}
              >
                <div style={{ paddingTop: 3, borderRight: `0.75px solid ${hawbInk}` }}>
                  <p style={hawbLabel}>Agent&apos;s IATA Code</p>
                </div>
                <div style={{ paddingTop: 3, paddingLeft: 4 }}>
                  <p style={hawbLabel}>Account No.</p>
                </div>
              </div>
            </td>
            <td
              colSpan={2}
              style={{ ...hawbCell, minHeight: H.agent, height: H.agent, verticalAlign: 'top' }}
            >
              <p style={hawbLabel}>Accounting Information</p>
              <p style={hawbBody}>{model.accounting}</p>
            </td>
          </tr>

          <tr>
            <td
              colSpan={4}
              style={{ ...hawbCell, minHeight: H.departure, height: H.departure, verticalAlign: 'top' }}
            >
              <p style={hawbLabel}>
                Airport of Departure (Addr. of first Carrier) and requested Routing
              </p>
              <p style={{ ...hawbBody, fontWeight: 700 }}>{model.departure}</p>
            </td>
          </tr>

          <tr>
            <td style={{ ...hawbCell, minHeight: H.routing, height: H.routing }}>
              <p style={hawbLabel}>To</p>
              <p style={{ ...hawbBody, fontWeight: 700 }}>{model.toCode}</p>
            </td>
            <td style={{ ...hawbCell, minHeight: H.routing, height: H.routing }}>
              <p style={hawbLabel}>By first Carrier</p>
              <p style={{ ...hawbBody, fontWeight: 700 }}>{model.carrier}</p>
            </td>
            <td style={{ ...hawbCell, minHeight: H.routing, height: H.routing }}>
              <p style={hawbLabel}>to</p>
            </td>
            <td style={{ ...hawbCell, minHeight: H.routing, height: H.routing }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0, height: '100%' }}>
                <div style={{ borderRight: `0.75px solid ${hawbInk}`, paddingRight: 2 }}>
                  <p style={hawbLabel}>by</p>
                </div>
                <div style={{ borderRight: `0.75px solid ${hawbInk}`, padding: '0 2px' }}>
                  <p style={hawbLabel}>to</p>
                </div>
                <div style={{ paddingLeft: 2 }}>
                  <p style={hawbLabel}>by</p>
                </div>
              </div>
            </td>
          </tr>

          <tr>
            <td
              colSpan={2}
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
              colSpan={2}
              style={{ ...hawbCell, minHeight: H.destination, height: H.destination }}
            >
              <p style={hawbLabel}>Requested Flight / Date</p>
              <p style={{ ...hawbBody, fontWeight: 700 }}>{model.flightDate}</p>
            </td>
          </tr>

          <tr>
            <td style={{ ...hawbCell, minHeight: H.currency, height: H.currency }}>
              <p style={hawbLabel}>Currency</p>
              <p style={{ ...hawbBody, fontWeight: 700 }}>{model.currency}</p>
            </td>
            <td style={{ ...hawbCell, minHeight: H.currency, height: H.currency }}>
              <p style={hawbLabel}>CHGS Code</p>
              <p style={{ ...hawbLabel, marginTop: 2 }}>WT/VAL · Other · PPD/COLL</p>
            </td>
            <td style={{ ...hawbCell, minHeight: H.currency, height: H.currency }}>
              <p style={hawbLabel}>Declared Value for Carriage</p>
              <p style={{ ...hawbBody, fontWeight: 700 }}>{model.declaredCarriage}</p>
            </td>
            <td style={{ ...hawbCell, minHeight: H.currency, height: H.currency }}>
              <p style={hawbLabel}>Declared Value for Customs</p>
              <p style={{ ...hawbBody, fontWeight: 700 }}>{model.declaredCustoms}</p>
            </td>
          </tr>

          <tr>
            <td
              colSpan={2}
              style={{ ...hawbCell, minHeight: H.insurance, height: H.insurance, verticalAlign: 'top' }}
            >
              <p style={hawbLabel}>Amount of Insurance</p>
              <p style={{ ...hawbBody, fontWeight: 700 }}>{model.insurance}</p>
            </td>
            <td colSpan={2} style={{ ...hawbCell, minHeight: H.insurance, height: H.insurance }}>
              <p style={hawbLabel}>
                INSURANCE — If Carrier offers insurance, and such insurance is available and desired,
                indicate amount to be insured in figures in box marked Amount of Insurance.
              </p>
            </td>
          </tr>

          <tr>
            <td
              colSpan={4}
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
              'No. of Pieces',
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
                  fontWeight: i === 7 ? 600 : 500,
                  verticalAlign: 'top',
                }}
              >
                {i === 7 && model.pieces ? (
                  <>
                    <p style={{ ...hawbBody, fontWeight: 700, margin: 0 }}>
                      TOTAL : ({model.pieces}) PACKAGES ONLY
                    </p>
                    <p style={{ ...hawbBody, margin: '4px 0 0' }}>{cargoRow[i] ?? ''}</p>
                  </>
                ) : (
                  (cargoRow[i] ?? '')
                )}
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
          tableLayout: 'fixed',
          flexShrink: 0,
        }}
      >
        <tbody>
          <tr>
            <td style={{ ...hawbCell, width: '50%', padding: 0, verticalAlign: 'top' }}>
              {/* Header once — Fresa uses open prepaid/collect cells without per-row labels */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '40% 30% 30%',
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
              <div style={{ height: H.signatureGap, borderBottom: `1px dashed ${hawbInk}`, margin: '4px 0 8px' }} />
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
            <td colSpan={2} style={{ ...hawbCell, padding: '3px 5px' }}>
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
