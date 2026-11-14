import type { CSSProperties } from 'react';
import {
  HBL_JASPER_PILOT_CONFIG,
  isHblJasperPilotFieldVisible,
  orderedHblJasperPilotSections,
} from './hblJasperPilot.config';
import type { HblJasperPilotModel } from './mapToHblJasperPilotModel';
import type { HblJasperPilotSectionId } from './hblJasperPilot.types';
import './hblJasperPilot.print.css';

type Props = {
  model: HblJasperPilotModel;
  config?: typeof HBL_JASPER_PILOT_CONFIG;
};

function fieldLabel(config: typeof HBL_JASPER_PILOT_CONFIG, id: string, fallback: string) {
  return config.fields.find((f) => f.id === id)?.label || fallback;
}

/**
 * Independent HBL Jasper visual composition driven by HBL_JASPER_PILOT_CONFIG.
 * Section order, visibility, column templates, typography, borders, and table
 * widths come from config — not a hardcoded one-off design dump.
 */
export function HblJasperPilotDocument({
  model,
  config = HBL_JASPER_PILOT_CONFIG,
}: Props) {
  const { typography: ty, borders, spacing, table, page } = config;
  const ink = ty.ink;
  const borderColor = borders.color;
  const sections = orderedHblJasperPilotSections();

  const cell: CSSProperties = {
    border: `${borders.widthPx}px solid ${borderColor}`,
    padding: `${spacing.cellPaddingYPx}px ${spacing.cellPaddingXPx}px`,
    verticalAlign: 'top',
    fontSize: ty.bodySizePx,
    lineHeight: 1.35,
    color: ink,
  };
  const label: CSSProperties = {
    margin: 0,
    fontSize: ty.labelSizePx,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.02em',
    color: ty.labelColor,
  };

  const rows =
    model.containerRows.length > 0
      ? model.containerRows
      : [{ marks: '', packages: '', description: '', weight: '', measurement: '' }];

  const Party = ({
    title,
    lines,
    style,
  }: {
    title: string;
    lines: string[];
    style?: CSSProperties;
  }) => (
    <div style={{ ...cell, ...style }}>
      <p style={label}>{title}</p>
      <div
        style={{
          marginTop: 2,
          minHeight: spacing.partyMinHeightPx,
          whiteSpace: 'pre-line',
          fontWeight: 500,
        }}
      >
        {lines.join('\n')}
      </div>
    </div>
  );

  const Field = ({
    title,
    value,
    style,
  }: {
    title: string;
    value: string;
    style?: CSSProperties;
  }) => (
    <div style={{ ...cell, ...style }}>
      <p style={label}>{title}</p>
      <p style={{ margin: '2px 0 0', fontWeight: 600 }}>{value}</p>
    </div>
  );

  const renderSection = (id: HblJasperPilotSectionId) => {
    const section = config.sections.find((s) => s.id === id);
    switch (id) {
      case 'branding':
        return (
          <div
            key={id}
            data-hbl-jasper-section={id}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 12,
              border: `${borders.widthPx}px solid ${borderColor}`,
              borderBottom: 'none',
              padding: '8px 12px',
            }}
          >
            <div style={{ display: 'flex', gap: 8, minWidth: 0 }}>
              {model.logoUrl ? (
                <img
                  src={model.logoUrl}
                  alt=""
                  style={{ height: 48, width: 'auto', maxWidth: 120, objectFit: 'contain' }}
                />
              ) : null}
              <div style={{ paddingTop: 2 }}>
                {isHblJasperPilotFieldVisible('companyName') && model.companyName ? (
                  <p
                    style={{
                      margin: 0,
                      fontSize: 12,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: '#0A2942',
                      lineHeight: 1.2,
                    }}
                  >
                    {model.companyName}
                  </p>
                ) : null}
                <p style={{ margin: '2px 0 0', fontSize: 8, color: '#555' }}>
                  {fieldLabel(config, 'companyName', 'House Bill of Lading')}
                </p>
              </div>
            </div>
            {isHblJasperPilotFieldVisible('documentTitle') ? (
              <div style={{ maxWidth: 300, textAlign: 'right' }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: ty.titleSizePx,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: '#0A2942',
                    lineHeight: 1.25,
                  }}
                >
                  {config.documentTitle}
                </p>
              </div>
            ) : null}
          </div>
        );

      case 'partiesAndBlNumber':
        return (
          <div
            key={id}
            data-hbl-jasper-section={id}
            style={{
              display: 'grid',
              gridTemplateColumns: section?.columnTemplate || '1.35fr 1fr 0.55fr',
            }}
          >
            <div>
              {isHblJasperPilotFieldVisible('shipper') ? (
                <Party
                  title={fieldLabel(config, 'shipper', 'Shipper')}
                  lines={model.shipperLines}
                />
              ) : null}
              {isHblJasperPilotFieldVisible('consignee') ? (
                <Party
                  title={fieldLabel(config, 'consignee', 'Consignee')}
                  lines={model.consigneeLines}
                  style={{ borderTop: 'none' }}
                />
              ) : null}
              {isHblJasperPilotFieldVisible('notify') ? (
                <Party
                  title={fieldLabel(config, 'notify', 'Notify Party')}
                  lines={model.notifyLines}
                  style={{ borderTop: 'none' }}
                />
              ) : null}
            </div>
            <div>
              {isHblJasperPilotFieldVisible('blNumber') ? (
                <div style={{ ...cell, borderLeft: 'none' }}>
                  <p style={label}>{fieldLabel(config, 'blNumber', 'Bill of Lading No.')}</p>
                  <p
                    style={{
                      margin: '4px 0 0',
                      fontSize: ty.blNumberSizePx,
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                    }}
                  >
                    {model.blNumber}
                  </p>
                </div>
              ) : null}
              {isHblJasperPilotFieldVisible('agentName') ? (
                <div style={{ ...cell, borderLeft: 'none', borderTop: 'none', minHeight: 120 }}>
                  <p style={label}>{fieldLabel(config, 'agentName', 'F/Agent Name & Ref.')}</p>
                  <p style={{ margin: '4px 0 0', fontWeight: 600 }}>{model.agentName}</p>
                  {isHblJasperPilotFieldVisible('agentLines')
                    ? model.agentLines.map((line) => (
                        <p key={line} style={{ margin: 0, fontSize: ty.bodySizePx }}>
                          {line}
                        </p>
                      ))
                    : null}
                </div>
              ) : null}
            </div>
            <div
              style={{
                ...cell,
                borderLeft: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <p style={{ margin: 0, textAlign: 'center', fontSize: 12, fontWeight: 700 }}>
                {model.blNumber}
              </p>
            </div>
          </div>
        );

      case 'routingRow1':
        return (
          <div
            key={id}
            data-hbl-jasper-section={id}
            style={{
              display: 'grid',
              gridTemplateColumns: section?.columnTemplate || '1fr 1fr 1fr 1fr',
            }}
          >
            {isHblJasperPilotFieldVisible('placeOfReceipt') ? (
              <Field
                title={fieldLabel(config, 'placeOfReceipt', 'Place of Receipt')}
                value={model.placeOfReceipt}
                style={{ borderTop: 'none' }}
              />
            ) : null}
            {isHblJasperPilotFieldVisible('portOfLoading') ? (
              <Field
                title={fieldLabel(config, 'portOfLoading', 'Port of Loading')}
                value={model.portOfLoading}
                style={{ borderTop: 'none', borderLeft: 'none' }}
              />
            ) : null}
            {isHblJasperPilotFieldVisible('jobNo') ? (
              <Field
                title={fieldLabel(config, 'jobNo', 'Job No.')}
                value={model.jobRef}
                style={{ borderTop: 'none', borderLeft: 'none' }}
              />
            ) : null}
            {isHblJasperPilotFieldVisible('preCarriage') ? (
              <Field
                title={fieldLabel(config, 'preCarriage', 'Pre-carriage by')}
                value={model.preCarriage}
                style={{ borderTop: 'none', borderLeft: 'none' }}
              />
            ) : null}
          </div>
        );

      case 'routingRow2':
        return (
          <div
            key={id}
            data-hbl-jasper-section={id}
            style={{
              display: 'grid',
              gridTemplateColumns: section?.columnTemplate || '1fr 1fr 1fr 1fr',
            }}
          >
            {isHblJasperPilotFieldVisible('vesselVoyage') ? (
              <Field
                title={fieldLabel(config, 'vesselVoyage', 'Vessel / Voyage No.')}
                value={model.vesselVoyage}
                style={{ borderTop: 'none' }}
              />
            ) : null}
            {isHblJasperPilotFieldVisible('portOfDischarge') ? (
              <Field
                title={fieldLabel(config, 'portOfDischarge', 'Port of Discharge')}
                value={model.portOfDischarge}
                style={{ borderTop: 'none', borderLeft: 'none' }}
              />
            ) : null}
            {isHblJasperPilotFieldVisible('placeOfDelivery') ? (
              <Field
                title={fieldLabel(config, 'placeOfDelivery', 'Place of Delivery')}
                value={model.placeOfDelivery}
                style={{ borderTop: 'none', borderLeft: 'none' }}
              />
            ) : null}
            {isHblJasperPilotFieldVisible('numberOfBls') ? (
              <Field
                title={fieldLabel(config, 'numberOfBls', 'No. of Bills of Lading')}
                value={model.numberOfBls}
                style={{ borderTop: 'none', borderLeft: 'none' }}
              />
            ) : null}
          </div>
        );

      case 'cargoTable':
        return (
          <table
            key={id}
            data-hbl-jasper-section={id}
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: ty.bodySizePx,
              tableLayout: 'fixed',
            }}
          >
            <colgroup>
              {table.columnWidthsPercent.map((w, i) => (
                <col key={table.columnKeys[i]} style={{ width: `${w}%` }} />
              ))}
            </colgroup>
            <thead>
              <tr style={{ background: table.headerFill }}>
                {table.columnKeys.map((key, i) => (
                  <th
                    key={key}
                    style={{
                      ...cell,
                      borderTop: 'none',
                      borderLeft: i === 0 ? undefined : 'none',
                      textAlign: 'left',
                      fontSize: ty.labelSizePx,
                      fontWeight: 700,
                      background: table.headerFill,
                    }}
                  >
                    {table.columnLabels[key]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri}>
                  {table.columnKeys.map((key, i) => (
                    <td
                      key={key}
                      style={{
                        ...cell,
                        borderTop: 'none',
                        borderLeft: i === 0 ? undefined : 'none',
                        whiteSpace: 'pre-line',
                        minHeight: spacing.cargoMinHeightPx,
                      }}
                    >
                      {row[key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'freightDetails':
        if (!isHblJasperPilotFieldVisible('freightDetails')) return null;
        return (
          <div key={id} data-hbl-jasper-section={id} style={{ ...cell, borderTop: 'none' }}>
            <span style={{ fontWeight: 700 }}>
              {fieldLabel(config, 'freightDetails', 'Freight Details')}:
            </span>{' '}
            {model.freightDetails}
            {isHblJasperPilotFieldVisible('totalInWords') && model.totalInWords ? (
              <p style={{ margin: '4px 0 0' }}>
                Total Number of Containers or Packages (In words): {model.totalInWords}
              </p>
            ) : null}
          </div>
        );

      case 'termsAndSignature':
        return (
          <div
            key={id}
            data-hbl-jasper-section={id}
            style={{
              ...cell,
              borderTop: 'none',
              minHeight: spacing.closingMinHeightPx,
              position: 'relative',
            }}
          >
            {isHblJasperPilotFieldVisible('receivedClause') ? (
              <p style={{ margin: 0, fontSize: 8, lineHeight: 1.45 }}>{config.receivedClauseText}</p>
            ) : null}
            <div
              style={{
                marginTop: 16,
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 16,
              }}
            >
              <div>
                {isHblJasperPilotFieldVisible('signature') ? (
                  <>
                    <p style={{ margin: 0, fontSize: ty.bodySizePx, fontWeight: 700 }}>
                      {fieldLabel(config, 'signature', 'Signed on behalf of the Carrier')}
                    </p>
                    <p
                      style={{
                        margin: '12px 0 0',
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                      }}
                    >
                      {model.companyName}
                    </p>
                  </>
                ) : null}
                {isHblJasperPilotFieldVisible('carrierName') ? (
                  <>
                    <p style={{ margin: '12px 0 0', fontSize: ty.bodySizePx, fontWeight: 700 }}>
                      {fieldLabel(config, 'carrierName', 'AS AGENT FOR THE CARRIER')}
                    </p>
                    <p
                      style={{
                        margin: '4px 0 0',
                        fontSize: 12,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                      }}
                    >
                      {model.carrierName}
                    </p>
                  </>
                ) : null}
                {isHblJasperPilotFieldVisible('onboardDate') ? (
                  <p style={{ margin: '12px 0 0', fontSize: ty.bodySizePx }}>
                    <span style={{ fontWeight: 700 }}>
                      {fieldLabel(config, 'onboardDate', 'Onboard Date')}:
                    </span>{' '}
                    {model.onboardDate}
                  </p>
                ) : null}
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  justifyContent: 'flex-end',
                  paddingRight: 8,
                }}
              >
                {isHblJasperPilotFieldVisible('draftWatermark') ? (
                  <p
                    aria-hidden
                    style={{
                      margin: 0,
                      userSelect: 'none',
                      fontSize: 42,
                      fontWeight: 900,
                      textTransform: 'uppercase',
                      letterSpacing: '0.2em',
                      lineHeight: 1,
                      color: ty.draftColor,
                      opacity: 0.25,
                    }}
                  >
                    DRAFT
                  </p>
                ) : null}
                {isHblJasperPilotFieldVisible('placeAndDateOfIssue') ? (
                  <p style={{ margin: '12px 0 0', textAlign: 'right', fontSize: ty.bodySizePx }}>
                    <span style={{ fontWeight: 700 }}>
                      {fieldLabel(config, 'placeAndDateOfIssue', 'Place and Date of Issue')}
                    </span>
                    <br />
                    {model.placeAndDateOfIssue}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        );

      case 'footer':
        if (!isHblJasperPilotFieldVisible('pageNumber')) return null;
        return (
          <div
            key={id}
            data-hbl-jasper-section={id}
            className="hbl-jasper-pilot-footer"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '6px 4px 0',
              fontSize: 8,
              color: '#666',
            }}
          >
            <span>{config.name}</span>
            <span>
              {fieldLabel(config, 'pageNumber', 'Page')} {model.pageLabel}
            </span>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      data-bl-draft-sheet
      data-hbl-jasper-pilot
      className="hbl-jasper-pilot-sheet"
      style={{
        position: 'relative',
        margin: '0 auto',
        width: '100%',
        maxWidth: page.widthCssPx,
        background: '#ffffff',
        color: ink,
        fontFamily: ty.fontFamily,
        boxSizing: 'border-box',
      }}
    >
      {sections.map((s) => renderSection(s.id))}
    </div>
  );
}
