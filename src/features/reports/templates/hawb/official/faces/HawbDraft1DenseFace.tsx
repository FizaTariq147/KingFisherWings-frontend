import type { HawbOfficialModel } from '../hawbOfficial.types';
import { HAWB_DRAFT1_LAYOUT } from '../layouts/hawbDraft1.layout';
import {
  hawbAccountChip,
  hawbBody,
  hawbCell,
  hawbColHead,
  hawbInk,
  hawbLabel,
  hawbLegal,
  hawbNoBadge,
  hawbTitle,
} from '../hawbOfficialStyles';

const LEGAL =
  "It is agreed that the goods described herein are accepted in apparent good order and condition (except as noted) for carriage SUBJECT TO THE CONDITIONS OF CONTRACT ON THE REVERSE HEREOF. THE SHIPPER'S ATTENTION IS DRAWN TO THE NOTICE CONCERNING CARRIERS LIMITATION OF LIABILITY. Shipper may increase such limitation of liability by declaring a higher value for carriage and paying a supplemental charge if required.";

const CERT =
  'Shipper certifies that the particulars on the face hereof are correct and that insofar as any part of the consignment contains dangerous goods, such part is properly described by name and is in proper condition for carriage by air according to the applicable Dangerous Goods Regulations.';

/**
 * HAWB Draft-1 face — HOUSE AIR WAYBILL with Notify + JOB NO + AGENT.
 * Used once per copy page; pagination is intentional identical faces (Phase 2.1).
 */
export function HawbDraft1DenseFace({ model }: { model: HawbOfficialModel }) {
  const layout = HAWB_DRAFT1_LAYOUT;
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
    // Fresa Draft-1 prints AS ARRANGED in Rate/Charge when no rate is set.
    model.rateCharge || (model.pieces || model.grossWeight ? 'AS ARRANGED' : ''),
    model.total || (model.pieces || model.grossWeight ? 'AS ARRANGED' : ''),
    model.natureOfGoods,
  ];

  return (
    <div data-hawb-dense-face="draft1" className="fn-doc" style={{ width: '100%', color: hawbInk }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 3,
          gap: 8,
        }}
      >
        <p style={{ margin: 0, fontSize: 9, fontWeight: 700 }}>
          {model.mawbNo ? `MAWB NO. ${model.mawbNo}` : 'MAWB NO.'}
        </p>
        <p
          style={{
            margin: 0,
            fontSize: 7.5,
            fontWeight: 700,
            letterSpacing: '0.06em',
            color: '#000000',
          }}
        >
          {model.copyBanner || ''}
        </p>
        <div style={{ ...hawbNoBadge, minWidth: 160 }}>
          HAWB NO.{model.hawbNo.trim() ? ` ${model.hawbNo.trim()}` : ''}
        </div>
      </div>

      <table
        className="fn-table"
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          border: `1.5px solid ${hawbInk}`,
          tableLayout: 'fixed',
        }}
      >
        <colgroup>
          <col style={{ width: '48%' }} />
          <col style={{ width: '52%' }} />
        </colgroup>
        <tbody>
          <tr>
            <td style={{ ...hawbCell, minHeight: 84, height: 84, verticalAlign: 'top', padding: 0 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', minHeight: 84 }}>
                <div style={{ flex: 1, padding: '2px 4px' }}>
                  <p style={hawbLabel}>Shipper&apos;s Name and Address</p>
                  {lines(model.shipperLines)}
                </div>
                {/* Fresa Draft-1: unlabeled account chip top-right of shipper */}
                <div style={{ ...hawbAccountChip, width: '28%', minHeight: 26 }} />
              </div>
            </td>
            <td style={hawbCell}>
              <p style={{ ...hawbTitle, textAlign: 'center', fontSize: 11 }}>{layout.titleMode}</p>
              <p style={{ ...hawbLegal, textAlign: 'center' }}>{layout.copiesValidityLine}</p>
              {model.logoUrl ? (
                <img
                  src={model.logoUrl}
                  alt=""
                  style={{
                    height: 24,
                    maxWidth: 90,
                    objectFit: 'contain',
                    display: 'block',
                    margin: '3px auto',
                  }}
                />
              ) : null}
              <p style={{ ...hawbBody, fontWeight: 700, textAlign: 'center' }}>
                {model.companyName}
              </p>
              <p style={hawbLegal}>{LEGAL}</p>
              <p style={{ ...hawbLabel, marginTop: 4 }}>JOB NO.: {model.jobNo}</p>
              <p style={hawbLabel}>
                MAWB NO. {model.mawbNo} · HAWB NO. {model.hawbNo}
              </p>
              <p style={{ ...hawbLabel, marginTop: 4 }}>AGENT:</p>
              <p style={{ ...hawbBody, fontWeight: 700 }}>{model.companyName}</p>
              {model.companyPhone ? <p style={hawbBody}>PHONE: {model.companyPhone}</p> : null}
            </td>
          </tr>
          <tr>
            <td style={{ ...hawbCell, padding: 0 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', minHeight: 64 }}>
                <div style={{ flex: 1, padding: '2px 4px' }}>
                  <p style={hawbLabel}>Consignee&apos;s Name and Address</p>
                  {lines(model.consigneeLines)}
                </div>
                <div style={{ ...hawbAccountChip, width: '28%', minHeight: 26 }} />
              </div>
            </td>
            <td rowSpan={2} style={hawbCell}>
              <p style={hawbLabel}>Accounting / Dimensions or Volume</p>
              <p style={hawbBody}>{model.accounting}</p>
              <p style={{ ...hawbBody, fontWeight: 700 }}>{model.handling}</p>
            </td>
          </tr>
          <tr>
            <td style={hawbCell}>
              <p style={hawbLabel}>Notify Party</p>
              {lines(model.notifyLines.length ? model.notifyLines : model.consigneeLines)}
            </td>
          </tr>
          <tr>
            <td style={hawbCell}>
              <p style={hawbLabel}>Airport of Departure</p>
              <p style={{ ...hawbBody, fontWeight: 700 }}>{model.departure}</p>
            </td>
            <td style={hawbCell}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4 }}>
                <div>
                  <p style={hawbLabel}>To</p>
                  <p style={{ ...hawbBody, fontWeight: 700 }}>{model.toCode}</p>
                </div>
                <div>
                  <p style={hawbLabel}>By first Carrier</p>
                  <p style={{ ...hawbBody, fontWeight: 700 }}>{model.flightDate}</p>
                </div>
                <div>
                  <p style={hawbLabel}>Currency</p>
                  <p style={{ ...hawbBody, fontWeight: 700 }}>{model.currency}</p>
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td style={hawbCell}>
              <p style={hawbLabel}>Airport of Destination</p>
              <p style={{ ...hawbBody, fontWeight: 700 }}>{model.destination}</p>
            </td>
            <td style={hawbCell}>
              <p style={hawbLabel}>Declared Carriage / Customs / Insurance</p>
              <p style={hawbBody}>
                {[model.declaredCarriage, model.declaredCustoms, model.insurance]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
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
                style={{ ...hawbCell, minHeight: 118, height: 118, verticalAlign: 'top' }}
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
        </tbody>
      </table>

      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          border: `1px solid ${hawbInk}`,
          borderTop: 'none',
        }}
      >
        <tbody>
          <tr>
            <td style={{ ...hawbCell, width: '45%' }}>
              {['Weight Charge', 'Valuation Charge', 'Tax', 'Total Prepaid'].map((lab) => (
                <div
                  key={lab}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    borderBottom: `1px solid ${hawbInk}`,
                  }}
                >
                  <p style={{ ...hawbLabel, padding: '2px 4px' }}>{lab}</p>
                  <p style={{ ...hawbLabel, padding: '2px 4px', borderLeft: `1px solid ${hawbInk}` }}>
                    Prepaid
                  </p>
                  <p style={{ ...hawbLabel, padding: '2px 4px', borderLeft: `1px solid ${hawbInk}` }}>
                    Collect
                  </p>
                </div>
              ))}
            </td>
            <td style={{ ...hawbCell, width: '55%' }}>
              <p style={hawbLegal}>{CERT}</p>
              <p style={{ ...hawbLabel, marginTop: 8 }}>Signature of Shipper or his Agent</p>
              <div style={{ height: 22 }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: 4 }}>
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
                  <p style={{ ...hawbBody, fontWeight: 800, marginTop: 6 }}>{model.companyName}</p>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
