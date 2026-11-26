import type { CSSProperties } from 'react';
import type { HawbOfficialModel } from '../hawbOfficial.types';
import { HAWB_DRAFT1_LAYOUT } from '../layouts/hawbDraft1.layout';
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
  hawbNoBadge,
  hawbTitle,
} from '../hawbOfficialStyles';

/** Fresa Draft-1 house legal (shorter — no ALL GOODS MAY BE CARRIED block). */
const LEGAL =
  "It is agreed that the goods described herein are accepted in apparent good order and condition (except as noted) for carriage SUBJECT TO THE CONDITIONS OF CONTRACT ON THE REVERSE HEREOF. THE SHIPPER'S ATTENTION IS DRAWN TO THE NOTICE CONCERNING CARRIERS LIMITATION OF LIABILITY. Shipper may increase such limitation of liability by declaring a higher value for carriage and paying a supplemental charge if required.";

/** Fresa Draft-1 uses Restricted Articles wording (not Dangerous Goods). */
const CERT =
  "Shipper certifies that particulars on the face hereof are correct and that insofar as any part of the consignment contains restricted articles, such part is properly described by name and is in proper condition for carriage by air according to the International Air Transport Association's Restricted Articles Regulations.";

/** Band heights — Fresa Draft-1 A4 landmarks; clipped so text never spills. */
const H = {
  shipper: 80,
  consignee: 66,
  notify: 58,
  departure: 28,
  routing: 34,
  destination: 32,
  handling: 34,
  cargoMin: 96,
  signatureGap: 14,
} as const;

const cell: CSSProperties = { ...hawbCell, padding: '3px 4px' };
const body: CSSProperties = { ...hawbBody, marginTop: 2, fontWeight: 700 };
const lab: CSSProperties = { ...hawbLabel, marginBottom: 1 };

/**
 * HAWB Draft-1 — HOUSE AIR WAYBILL with Notify + JOB NO + AGENT + Dimensions.
 * One face per copy page (9 identical faces in Fresa reference).
 */
export function HawbDraft1DenseFace({ model }: { model: HawbOfficialModel }) {
  const layout = HAWB_DRAFT1_LAYOUT;
  const lines = (rows: string[]) =>
    hawbCapLines(rows, 3).map((line, i) => (
      <p key={`${line}-${i}`} style={body}>
        {line}
      </p>
    ));
  const natureLines = hawbNatureLines(model.natureOfGoods, model.handling);
  const arranged = model.pieces || model.grossWeight ? 'AS ARRANGED' : '';
  const raw = model.tableRows[0];
  const cargoRow = [
    raw?.[0] ?? model.pieces,
    raw?.[1] ?? model.grossWeight,
    raw?.[2] ?? (model.pieces || model.grossWeight ? 'K' : ''),
    raw?.[3] ?? '',
    raw?.[4] ?? model.chargeableWeight,
    (raw?.[5] || model.rateCharge || '').trim() || arranged,
    (raw?.[6] || model.total || '').trim() === '0.00' && arranged
      ? arranged
      : (raw?.[6] || model.total || '').trim() || arranged,
  ];
  const packagesLine = model.pieces ? `TOTAL : (${model.pieces}) PACKAGES ONLY` : '';
  const notify = model.notifyLines.length ? model.notifyLines : model.consigneeLines;
  const prepaid = hawbIsPrepaid(model.handling, model.accounting);
  const byCarrier = hawbFirstFlightCode(model.flightDate, model.carrier);
  const customs = displayOrBlank(model.declaredCustoms, layout.customsDefaultWhenEmpty);
  const chargePrepaid = arranged || model.total;
  const ctnLine = natureLines.find((l) => /CTN/i.test(l)) || '';

  const split = (edge: boolean): CSSProperties => ({
    padding: '2px 3px',
    borderRight: edge ? `1px solid ${hawbInk}` : 'none',
    overflow: 'hidden',
    minWidth: 0,
  });

  return (
    <div
      data-hawb-dense-face="draft1"
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
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 3,
          gap: 6,
          flexShrink: 0,
        }}
      >
        <p style={{ margin: 0, fontSize: 9, fontWeight: 700 }}>
          {model.mawbNo ? `MAWB NO. ${model.mawbNo}` : 'MAWB NO.'}
        </p>
        <p style={{ margin: 0, fontSize: 7, fontWeight: 700, letterSpacing: '0.04em' }}>
          {model.copyBanner || ''}
        </p>
        <div style={{ ...hawbNoBadge, minWidth: 150 }}>
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
          flexShrink: 0,
        }}
      >
        <colgroup>
          <col style={{ width: '48%' }} />
          <col style={{ width: '52%' }} />
        </colgroup>
        <tbody>
          <tr>
            <td style={{ ...cell, ...hawbClipBand(H.shipper), padding: 0 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', height: '100%' }}>
                <div style={{ flex: 1, padding: '3px 4px', overflow: 'hidden' }}>
                  <p style={lab}>Shipper&apos;s Name and Address</p>
                  {lines(model.shipperLines)}
                </div>
                <div style={{ ...hawbAccountChip, width: '26%', minHeight: 22 }} />
              </div>
            </td>
            <td style={{ ...cell, ...hawbClipBand(H.shipper), overflow: 'hidden' }}>
              <p style={{ ...hawbTitle, textAlign: 'center', fontSize: 11 }}>{layout.titleMode}</p>
              <p style={{ ...hawbLegal, textAlign: 'center', marginTop: 2 }}>
                {layout.copiesValidityLine}
              </p>
              {model.logoUrl ? (
                <img
                  src={model.logoUrl}
                  alt=""
                  style={{
                    height: 18,
                    maxWidth: 72,
                    objectFit: 'contain',
                    display: 'block',
                    margin: '3px auto 2px',
                  }}
                />
              ) : null}
              <p style={{ ...body, textAlign: 'center', fontSize: 7.5 }}>{model.companyName}</p>
              <p style={{ ...hawbLegal, maxHeight: 30, overflow: 'hidden', marginTop: 3 }}>
                {LEGAL}
              </p>
              <p style={{ ...lab, marginTop: 4 }}>JOB NO.: {model.jobNo}</p>
              <p style={lab}>
                MAWB NO. {model.mawbNo} · HAWB NO. {model.hawbNo}
              </p>
              <p style={{ ...lab, marginTop: 3 }}>AGENT:</p>
              <p style={{ ...body, fontSize: 7 }}>
                {model.companyName}
                {model.companyPhone ? ` · PHONE: ${model.companyPhone}` : ''}
              </p>
            </td>
          </tr>
          <tr>
            <td style={{ ...cell, ...hawbClipBand(H.consignee), padding: 0 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', height: '100%' }}>
                <div style={{ flex: 1, padding: '3px 4px', overflow: 'hidden' }}>
                  <p style={lab}>Consignee&apos;s Name and Address</p>
                  {lines(model.consigneeLines)}
                </div>
                <div style={{ ...hawbAccountChip, width: '26%', minHeight: 22 }} />
              </div>
            </td>
            <td rowSpan={2} style={{ ...cell, overflow: 'hidden', verticalAlign: 'top' }}>
              <p style={lab}>Dimensions or Volume</p>
            </td>
          </tr>
          <tr>
            <td style={{ ...cell, ...hawbClipBand(H.notify), overflow: 'hidden' }}>
              <p style={lab}>Notify Party</p>
              {lines(notify)}
            </td>
          </tr>
          <tr>
            <td colSpan={2} style={{ ...cell, ...hawbClipBand(H.departure) }}>
              <p style={lab}>Airport of Departure (Addr. of first Carrier) and requested Routing</p>
              <p style={body}>{model.departure}</p>
            </td>
          </tr>
          {/* Fresa Draft-1: To / By / to / by + Currency / PPD·COLL / Declared */}
          <tr>
            <td colSpan={2} style={{ ...cell, ...hawbClipBand(H.routing), padding: 0 }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '8% 14% 6% 6% 6% 6% 9% 8% 8% 14% 15%',
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
                    ['PPD', prepaid ? 'PP' : ''],
                    ['COLL', ''],
                    ['Declared Value for Carriage', model.declaredCarriage],
                    ['Declared Value for Customs', customs],
                  ] as const
                ).map(([label, value], i, arr) => (
                  <div key={`${label}-${i}`} style={split(i < arr.length - 1)}>
                    <p style={lab}>{label}</p>
                    <p style={body}>{value}</p>
                  </div>
                ))}
              </div>
            </td>
          </tr>
          <tr>
            <td colSpan={2} style={{ ...cell, ...hawbClipBand(H.destination), padding: 0 }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '34% 30% 12% 24%',
                  height: '100%',
                }}
              >
                <div style={split(true)}>
                  <p style={lab}>Airport of Destination</p>
                  <p style={body}>{model.destination}</p>
                </div>
                <div style={split(true)}>
                  <p style={lab}>Requested Flight / Date</p>
                  <p style={body}>{model.flightDate}</p>
                </div>
                <div style={split(true)}>
                  <p style={lab}>Amount of Insurance</p>
                  <p style={body}>{model.insurance}</p>
                </div>
                <div style={split(false)}>
                  <p style={{ ...hawbLegal, fontSize: 4.5 }}>
                    INSURANCE — If shipper requests insurance in accordance with conditions on reverse
                    hereof, indicate amount to be insured in figures in box marked amount of
                    insurance.
                  </p>
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td colSpan={2} style={{ ...cell, ...hawbClipBand(H.handling), overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <p style={lab}>Handling Information</p>
                  <p style={body}>{model.handling}</p>
                  {packagesLine ? <p style={{ ...body, marginTop: 2 }}>{packagesLine}</p> : null}
                </div>
                <p style={{ ...body, margin: 0, whiteSpace: 'nowrap' }}>
                  {prepaid || /prepaid/i.test(model.accounting) ? 'FREIGHT PREPAID' : ''}
                </p>
              </div>
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
          <col style={{ width: '10%' }} />
          <col style={{ width: '12%' }} />
          <col style={{ width: '5%' }} />
          <col style={{ width: '7%' }} />
          <col style={{ width: '13%' }} />
          <col style={{ width: '14%' }} />
          <col style={{ width: '14%' }} />
          <col style={{ width: '25%' }} />
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
              'Description and Marks',
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
                    .filter((l) => !ctnLine || !/CTN/i.test(l))
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
            <td colSpan={8} style={{ ...cell, height: 24 }}>
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
            <td style={{ ...cell, padding: 0, verticalAlign: 'top' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '42% 29% 29%',
                  borderBottom: `1px solid ${hawbInk}`,
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
                  ['Weight Charge', chargePrepaid],
                  ['Valuation Charge', ''],
                  ['Tax', ''],
                  ['Total Other Charges Due Agent', ''],
                  ['Total Other Charges Due Carrier', ''],
                  ['Total Prepaid', chargePrepaid],
                  ['Total Collect', ''],
                ] as const
              ).map(([label, amount], idx, arr) => (
                <div
                  key={label}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '42% 29% 29%',
                    borderBottom: idx < arr.length - 1 ? `1px solid ${hawbInk}` : 'none',
                    minHeight: 16,
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
            <td style={{ ...cell, verticalAlign: 'top', overflow: 'hidden' }}>
              <p style={hawbLegal}>{CERT}</p>
              <p style={{ ...body, marginTop: 6 }}>{model.companyName}</p>
              <p style={{ ...lab, marginTop: 2 }}>Signature of Shipper or his Agent</p>
              <div
                style={{
                  height: H.signatureGap,
                  borderBottom: `1px dashed ${hawbInk}`,
                  margin: '3px 0 6px',
                }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: 3 }}>
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
                  <p style={{ ...body, marginTop: 2 }}>
                    {model.carrier
                      ? `AS AGENT FOR THE CARRIER, ${model.carrier}`
                      : model.companyName}
                  </p>
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td colSpan={2} style={{ ...cell, padding: '3px 4px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <p style={{ ...hawbBody, margin: 0, fontSize: 6.5 }}>
                  <strong>Currency Conversion Rates</strong> · Charges at Destination · Total Collect
                  Charges
                </p>
                <div style={{ ...hawbNoBadge, minWidth: 140 }}>
                  HAWB NO.{model.hawbNo.trim() ? ` ${model.hawbNo.trim()}` : ''}
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
