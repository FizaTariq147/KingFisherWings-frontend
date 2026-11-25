import type { HawbOfficialLayoutConfig, HawbOfficialModel } from '../hawbOfficial.types';
import {
  hawbAccountChip,
  hawbBody,
  hawbCell,
  hawbColHead,
  hawbInk,
  hawbLabel,
  hawbLegal,
  hawbTitle,
  displayOrBlank,
} from '../hawbOfficialStyles';

type Props = {
  layout: HawbOfficialLayoutConfig;
  model: HawbOfficialModel;
};

const HOUSE_LEGAL =
  "It is agreed that the goods described herein are accepted in apparent good order and condition (except as noted) for carriage SUBJECT TO THE CONDITIONS OF CONTRACT ON THE REVERSE HEREOF. THE SHIPPER'S ATTENTION IS DRAWN TO THE NOTICE CONCERNING CARRIERS LIMITATION OF LIABILITY. Shipper may increase such limitation of liability by declaring a higher value for carriage and paying a supplemental charge if required.";

const AIR_LEGAL =
  "It is agreed that the goods described herein are accepted in apparent good order and condition (except as noted) for carriage SUBJECT TO THE CONDITIONS OF CONTRACT ON THE REVERSE HEREOF. ALL GOODS MAY BE CARRIED BY ANY OTHER MEANS INCLUDING ROAD OR ANY OTHER CARRIER UNLESS SPECIFIC CONTRARY INSTRUCTIONS ARE GIVEN HEREON BY THE SHIPPER. THE SHIPPER'S ATTENTION IS DRAWN TO THE NOTICE CONCERNING CARRIER'S LIMITATION OF LIABILITY. Shipper may increase such limitation of liability by declaring a higher value for carriage and paying a supplemental charge if required.";

const CERT =
  'Shipper certifies that the particulars on the face hereof are correct and that insofar as any part of the consignment contains dangerous goods, such part is properly described by name and is in proper condition for carriage by air according to the applicable Dangerous Goods Regulations.';

/**
 * Dense IATA-style face used by Draft / Draft-1 / Draft-2.
 * Behaviour is driven entirely by the format-specific layout config.
 */
export function HawbDenseIataFace({ layout, model }: Props) {
  const isAir = layout.titleMode === 'Air Waybill';
  const legal = layout.legalVariant === 'air' ? AIR_LEGAL : HOUSE_LEGAL;
  const customs = displayOrBlank(model.declaredCustoms, layout.customsDefaultWhenEmpty);
  const partyLines = (lines: string[]) =>
    (lines.length ? lines : model.showPlaceholders ? [''] : []).map((line, i) => (
      <p key={`${line}-${i}`} style={hawbBody}>
        {line}
      </p>
    ));

  const cargoRows =
    model.tableRows.length > 0
      ? model.tableRows
      : [
          [
            model.pieces,
            model.grossWeight,
            model.pieces || model.grossWeight ? 'K' : '',
            '',
            model.chargeableWeight,
            model.rateCharge,
            model.total,
            model.natureOfGoods,
          ],
        ];

  return (
    <div data-hawb-dense-face={layout.variant} className="fn-doc" style={{ width: '100%', color: hawbInk }}>
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
            fontSize: 8,
            fontWeight: 700,
            letterSpacing: '0.04em',
            color: layout.statusRibbon === 'DRAFT' ? '#C47A00' : '#000000',
          }}
        >
          {model.copyBanner || layout.statusRibbon}
        </p>
        <p style={{ margin: 0, fontSize: 8, color: '#000000' }}>
          {model.hawbNo ? `HAWB NO. ${model.hawbNo}` : 'HAWB NO.'}
          {layout.showMawbInRibbon && model.mawbNo ? ` · MAWB NO. ${model.mawbNo}` : ''}
          {model.copyIndex != null && model.copyTotal != null
            ? ` · ${model.copyIndex}/${model.copyTotal}`
            : ''}
        </p>
      </div>

      <table
        className="fn-table"
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          border: `1px solid ${hawbInk}`,
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
          <tr>
            <td colSpan={2} style={{ ...hawbCell, minHeight: 72, padding: 0 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', minHeight: 72 }}>
                <div style={{ flex: 1, padding: '1px 3px' }}>
                  <p style={hawbLabel}>Shipper&apos;s Name and Address</p>
                  {partyLines(model.shipperLines)}
                </div>
                {layout.showAccountNumberLabels ? (
                  <div style={hawbAccountChip}>
                    <p style={hawbLabel}>Shipper&apos;s Account Number</p>
                  </div>
                ) : null}
              </div>
            </td>
            <td colSpan={2} style={hawbCell}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={hawbLabel}>
                    {isAir ? 'Non Negotiable · Issued by' : 'Not Negotiable'}
                  </p>
                  {model.logoUrl ? (
                    <img
                      src={model.logoUrl}
                      alt={model.companyName || ''}
                      style={{
                        height: 24,
                        width: 'auto',
                        maxWidth: 90,
                        objectFit: 'contain',
                        display: 'block',
                        marginTop: 4,
                      }}
                    />
                  ) : null}
                  {model.companyName ? (
                    <p style={{ ...hawbBody, fontWeight: 700 }}>{model.companyName}</p>
                  ) : null}
                  {model.companyAddress ? <p style={hawbBody}>{model.companyAddress}</p> : null}
                  {model.companyPhone ? <p style={hawbBody}>PHONE: {model.companyPhone}</p> : null}
                </div>
                <div style={{ textAlign: 'right', minWidth: 120 }}>
                  <p style={hawbLabel}>HAWB NO.</p>
                  <p style={{ ...hawbBody, fontWeight: 700, fontSize: 9 }}>{model.hawbNo}</p>
                  <p style={{ ...hawbLabel, marginTop: 6 }}>MAWB NO.</p>
                  <p style={{ ...hawbBody, fontWeight: 700 }}>{model.mawbNo}</p>
                  {layout.showJobNoInHeader ? (
                    <>
                      <p style={{ ...hawbLabel, marginTop: 6 }}>JOB NO.</p>
                      <p style={hawbBody}>{model.jobNo}</p>
                    </>
                  ) : null}
                </div>
              </div>
            </td>
          </tr>

          <tr>
            <td colSpan={2} style={{ ...hawbCell, minHeight: 64, padding: 0 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', minHeight: 64 }}>
                <div style={{ flex: 1, padding: '1px 3px' }}>
                  <p style={hawbLabel}>Consignee&apos;s Name and Address</p>
                  {partyLines(model.consigneeLines)}
                </div>
                {layout.showAccountNumberLabels ? (
                  <div style={hawbAccountChip}>
                    <p style={hawbLabel}>Consignee&apos;s Account Number</p>
                  </div>
                ) : null}
              </div>
            </td>
            <td colSpan={2} style={hawbCell}>
              {layout.showNotify ? (
                <>
                  <p style={hawbLabel}>Notify Party</p>
                  {partyLines(model.notifyLines)}
                  <p style={{ ...hawbLabel, marginTop: 8 }}>AGENT:</p>
                  <p style={{ ...hawbBody, fontWeight: 700 }}>{model.companyName}</p>
                </>
              ) : (
                <>
                  <p style={hawbLabel}>Issuing Carrier&apos; Agent Name and City</p>
                  <p style={{ ...hawbBody, fontWeight: 700, whiteSpace: 'pre-line' }}>
                    {model.agentLines.join('\n')}
                  </p>
                  {layout.showIataAgentCells ? (
                    <>
                      <p style={{ ...hawbLabel, marginTop: 6 }}>Agent&apos;s IATA Code</p>
                      <p style={hawbLabel}>Account No.</p>
                    </>
                  ) : null}
                </>
              )}
            </td>
          </tr>

          <tr>
            <td colSpan={2} style={hawbCell}>
              <p style={hawbLabel}>
                Airport of Departure (Addr. of first Carrier) and requested Routing
              </p>
              <p style={{ ...hawbBody, fontWeight: 700 }}>{model.departure}</p>
            </td>
            <td colSpan={2} style={hawbCell}>
              <p style={hawbLabel}>Accounting Information</p>
              <p style={hawbBody}>{model.accounting}</p>
              <p style={{ ...hawbBody, fontWeight: 700 }}>{model.handling}</p>
            </td>
          </tr>

          <tr>
            <td style={hawbCell}>
              <p style={hawbLabel}>To</p>
              <p style={{ ...hawbBody, fontWeight: 700 }}>{model.toCode}</p>
            </td>
            <td style={hawbCell}>
              <p style={hawbLabel}>By first Carrier</p>
              <p style={{ ...hawbBody, fontWeight: 700 }}>{model.carrier}</p>
            </td>
            <td style={hawbCell}>
              <p style={hawbLabel}>to / by / to</p>
              <p style={hawbBody}>Routing and Destination</p>
            </td>
            <td style={hawbCell}>
              <p style={hawbLabel}>Requested Flight / Date</p>
              <p style={{ ...hawbBody, fontWeight: 700 }}>{model.flightDate}</p>
            </td>
          </tr>

          <tr>
            <td colSpan={2} style={hawbCell}>
              <p style={hawbLabel}>Airport of Destination</p>
              <p style={{ ...hawbBody, fontWeight: 700 }}>{model.destination}</p>
              <p style={{ ...hawbLabel, marginTop: 6 }}>Handling Information</p>
              <p style={hawbBody}>{model.handling}</p>
            </td>
            <td
              colSpan={2}
              style={{ ...hawbCell, textAlign: 'center' }}
            >
              <p style={{ ...hawbTitle, textAlign: 'center' }}>{layout.titleMode}</p>
              <p style={{ ...hawbLegal, textAlign: 'center', marginTop: 4 }}>
                {layout.copiesValidityLine}
              </p>
              <p style={hawbLegal}>{legal}</p>
            </td>
          </tr>

          <tr>
            <td style={hawbCell}>
              <p style={hawbLabel}>Currency</p>
              <p style={{ ...hawbBody, fontWeight: 700 }}>{model.currency}</p>
            </td>
            <td style={hawbCell}>
              <p style={hawbLabel}>CHGS Code · WT/VAL · Other</p>
              <p style={{ ...hawbLabel, marginTop: 4 }}>PPD · COLL</p>
            </td>
            <td style={hawbCell}>
              <p style={hawbLabel}>Declared Value for Carriage</p>
              <p style={{ ...hawbBody, fontWeight: 700 }}>{model.declaredCarriage}</p>
            </td>
            <td style={hawbCell}>
              <p style={hawbLabel}>Declared Value for Customs</p>
              <p style={{ ...hawbBody, fontWeight: 700 }}>{customs}</p>
            </td>
          </tr>
          <tr>
            <td colSpan={2} style={hawbCell}>
              <p style={hawbLabel}>Amount of Insurance</p>
              <p style={{ ...hawbBody, fontWeight: 700 }}>{model.insurance}</p>
            </td>
            <td colSpan={2} style={hawbCell}>
              <p style={hawbLabel}>
                INSURANCE — If Carrier offers insurance, and such insurance is requested in
                accordance with the conditions hereof, indicate amount to be insured in figures
                in box marked Amount of Insurance.
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
          <col style={{ width: '6%' }} />
          <col style={{ width: '8%' }} />
          <col style={{ width: '12%' }} />
          <col style={{ width: '12%' }} />
          <col style={{ width: '12%' }} />
          <col style={{ width: '30%' }} />
        </colgroup>
        <tbody>
          <tr>
            {model.tableHeaders.map((h) => (
              <td key={h} style={hawbColHead}>
                {h}
              </td>
            ))}
          </tr>
          {cargoRows.map((row, ri) => (
            <tr key={ri} className="fn-no-break">
              {Array.from({ length: 8 }).map((_, ci) => (
                <td key={ci} style={{ ...hawbCell, minHeight: 56, fontWeight: ci === 7 ? 600 : 500 }}>
                  {row[ci] ?? ''}
                </td>
              ))}
            </tr>
          ))}
          <tr>
            <td colSpan={8} style={hawbCell}>
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
        }}
      >
        <tbody>
          <tr>
            <td style={{ ...hawbCell, width: '50%' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {[
                    ['Weight Charge', model.total],
                    ['Valuation Charge', ''],
                    ['Tax', ''],
                    ['Total Other Charges Due Agent', ''],
                    ['Total Other Charges Due Carrier', ''],
                    ['Total Prepaid', model.total],
                  ].map(([lab, prepaid]) => (
                    <tr key={lab}>
                      <td style={{ ...hawbCell, width: '40%' }}>
                        <p style={hawbLabel}>{lab}</p>
                      </td>
                      <td style={{ ...hawbCell, width: '30%' }}>
                        <p style={hawbLabel}>Prepaid</p>
                        <p style={hawbBody}>{prepaid}</p>
                      </td>
                      <td style={{ ...hawbCell, width: '30%' }}>
                        <p style={hawbLabel}>Collect</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </td>
            <td style={{ ...hawbCell, width: '50%' }}>
              <p style={hawbLegal}>{CERT}</p>
              <p style={{ ...hawbLabel, marginTop: 10 }}>Signature of Shipper or his Agent</p>
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
                  <p style={hawbLabel}>Executed on (Date)</p>
                  <p style={{ ...hawbBody, fontWeight: 700 }}>{model.executedOn}</p>
                </div>
                <div>
                  <p style={hawbLabel}>at (Place)</p>
                  <p style={{ ...hawbBody, fontWeight: 700 }}>{model.executedAt}</p>
                </div>
                <div>
                  <p style={hawbLabel}>Signature of Issuing Carrier or its Agent</p>
                  <p style={{ ...hawbBody, fontWeight: 700, marginTop: 8 }}>
                    AS AGENT FOR THE CARRIER,
                  </p>
                  <p style={{ ...hawbBody, fontWeight: 800 }}>{model.carrier}</p>
                  <p style={hawbBody}>{model.companyName}</p>
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td colSpan={2} style={hawbCell}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <p style={{ ...hawbBody, margin: 0 }}>
                  <strong>Currency Conversion Rates</strong> · CC Charges in Dest. Currency
                </p>
                <p style={{ ...hawbBody, margin: 0 }}>
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
