import type { CSSProperties } from 'react';
import type {
  InvoiceFormatUiBranding,
  InvoiceFormatUiDemo,
  InvoiceFormatUiTheme,
} from '../../../types/invoiceFormatUiLayout.types';
import { brandLogoSrc } from './brandLogoSrc';

/**
 * Fresa HBL draft families from
 * https://fresatechnologies.com/sample-report-formats/
 * - combined: Format-9/11/18/19 Combined Transport BL
 * - jasper: Format Jasper / Format-6 "NOT NEGOTIABLE UNLESS…"
 * - multimodal: Format-2/4/5/8/13/14/16 MULTI-MODAL TRANSPORT DOCUMENT
 * - mt: Format-10/15 Multimodal Transport Document (MTD)
 * - ocean: Format-7/12/17/20 ocean BL with pre-carriage / delivery apply-to
 */
export type HblBlShellVariant = 'combined' | 'jasper' | 'multimodal' | 'mt' | 'ocean';

type Props = {
  theme: InvoiceFormatUiTheme;
  demo: InvoiceFormatUiDemo;
  branding: InvoiceFormatUiBranding;
  embedLogo?: boolean;
  variant?: HblBlShellVariant;
};

function demoField(demo: InvoiceFormatUiDemo, ...keys: string[]): string {
  for (const key of keys) {
    const hit = (demo.fieldGrid ?? []).find((f) => f.k.toLowerCase() === key.toLowerCase());
    if (hit?.v?.trim()) return hit.v.trim();
  }
  return '';
}

export function HblBlShell({
  theme,
  demo,
  branding,
  embedLogo = true,
  variant = 'combined',
}: Props) {
  const border = theme.ink || '#101010';
  const label: CSSProperties = {
    fontSize: 7,
    fontWeight: 700,
    textTransform: 'uppercase',
    color: border,
    lineHeight: 1.25,
    margin: 0,
    letterSpacing: '0.02em',
  };
  const body: CSSProperties = {
    fontSize: 8.5,
    color: border,
    lineHeight: 1.35,
    margin: 0,
    wordBreak: 'break-word',
    overflowWrap: 'anywhere',
    whiteSpace: 'pre-line',
  };
  const cell: CSSProperties = {
    border: `1px solid ${border}`,
    verticalAlign: 'top',
    padding: '4px 6px',
  };

  const shipper = demo.partyLeft ?? { title: 'Shipper', lines: [] as string[] };
  const consignee = demo.partyMid ?? { title: 'Consignee', lines: [] as string[] };
  const notify =
    demo.partyNotify ?? demo.partyThird ?? { title: 'Notify Address', lines: [] as string[] };
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

  const blNo =
    demo.invoiceNo ||
    demoField(demo, 'HBL No.', 'Bill of Lading No.', 'B/L No.', 'MTD NO.', 'Bill of Lading Number');
  const jobNo = demoField(demo, 'Job No.', 'JOB NO.', 'Booking Ref.');
  const vesselRaw =
    demoField(demo, 'Vessel / Voyage', 'Vessel/Voyage No.', 'Ocean Vessel', 'Vessel') ||
    demo.hblCarrierAgent ||
    '';
  const vesselParts = vesselRaw.split('/').map((s) => s.trim()).filter(Boolean);
  const oceanVessel = vesselParts[0] || vesselRaw;
  const voyageNo =
    vesselParts.length > 1
      ? vesselParts.slice(1).join(' / ')
      : demoField(demo, 'Voyage Number', 'Voyage');
  const placeReceipt =
    demoField(demo, 'Place of Receipt', 'Place of Acceptance') ||
    demoField(demo, 'Port of Loading');
  const portLoading = demoField(demo, 'Port of Loading');
  const portDischarge = demoField(demo, 'Port of Discharge');
  const placeDelivery = demoField(demo, 'Place of Delivery', 'Port of Delivery');
  const originals = demo.hblOriginals || demoField(demo, 'No. of Bills of Lading') || '1(ONE)';
  const freight = demoField(demo, 'Freight') || 'PREPAID';
  const preCarriage = demoField(demo, 'Pre-carriage by', 'Pre - carriage by') || '';

  const titles: Record<HblBlShellVariant, string> = {
    combined:
      demo.hblBlTitle ||
      'Bill of Lading FOR COMBINED TRANSPORT OR PORT TO PORT SHIPMENT',
    jasper:
      demo.hblBlTitle ||
      'BILL OF LADING  NOT NEGOTIABLE UNLESS CONSIGNED "TO ORDER"',
    multimodal: demo.hblBlTitle || 'MULTI-MODAL TRANSPORT DOCUMENT',
    mt: demo.hblBlTitle || 'MULTIMODAL TRANSPORT DOCUMENT',
    ocean: demo.hblBlTitle || 'BILL OF LADING',
  };

  const shipperLabel =
    variant === 'multimodal' || variant === 'mt'
      ? 'Consignor'
      : shipper.title || 'SHIPPER';
  const consigneeLabel =
    variant === 'multimodal'
      ? 'Consignee (or order)'
      : variant === 'mt'
        ? 'Consignee : (if "TO ORDER" so indicate)'
        : variant === 'combined'
          ? 'CONSIGNEE OR ORDER'
          : consignee.title || 'Consignee';
  const notifyLabel =
    variant === 'combined'
      ? 'NOTIFY ADDRESS (Carrier not responsible for failure to notify)'
      : variant === 'mt'
        ? 'Notify address : (No responsibility shall attach to MTO or his agent for failure to notify)'
        : notify.title || 'Notify Party';

  const cargoHeaders = demo.hblCargoHeaders ?? [
    'Container Nos, Seal Nos, Mark and Nos',
    'Number and kind of packages : description of goods',
    'Gross Weight (Kg)',
    'Measurement (CBM)',
  ];
  const cargoRows = demo.hblCargoRows ?? [];
  const weight = demoField(demo, 'Gross Weight') || '';
  const volume = demoField(demo, 'Measurement', 'Volume') || '';

  const partyLines = (lines: string[]) =>
    (lines ?? []).map((line) => (
      <p key={line} style={{ ...body, marginTop: 1 }}>
        {line}
      </p>
    ));

  const logoSrc = brandLogoSrc(branding);
  const identityCell = (
    <td colSpan={2} style={{ ...cell, textAlign: 'center' }}>
      {embedLogo && logoSrc ? (
        <img
          src={logoSrc}
          alt={branding.company || ''}
          style={{
            height: 34,
            width: 'auto',
            maxWidth: 130,
            objectFit: 'contain',
            display: 'block',
            margin: '0 auto 4px',
          }}
        />
      ) : null}
      <p style={{ ...label, fontSize: 9 }}>{branding.company}</p>
      <p style={{ ...body, marginTop: 2 }}>{branding.address}</p>
      {branding.phone ? <p style={body}>TEL: {branding.phone}</p> : null}
      {branding.email ? <p style={body}>EMAIL: {branding.email}</p> : null}
      {demo.hblRegisteredNo ? (
        <p style={{ ...label, marginTop: 8, fontSize: 8 }}>
          Registered No. : {demo.hblRegisteredNo}
        </p>
      ) : null}
      {variant === 'jasper' || variant === 'ocean' ? (
        <>
          <p style={{ ...label, marginTop: 8 }}>F/Agent Name &amp; Ref.</p>
          <p style={body}>{jobNo || branding.company}</p>
        </>
      ) : null}
    </td>
  );

  return (
    <div data-hbl-bl-shell={variant} style={{ margin: '0 0 2px', color: border }}>
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
            color: theme.orange || '#F6A21B',
          }}
        >
          DRAFT
        </p>
        <p style={{ margin: 0, fontSize: 8, color: theme.gray }}>
          B/L No. {blNo}
          {jobNo ? ` · Job ${jobNo}` : ''}
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
        <tbody>
          <tr>
            <td colSpan={4} style={{ ...cell, textAlign: 'center', padding: '5px 6px' }}>
              <p style={{ ...label, fontSize: 11, letterSpacing: '0.04em' }}>{titles[variant]}</p>
            </td>
          </tr>

          {/* Parties + BL number / identity */}
          <tr>
            <td colSpan={2} style={{ ...cell, width: '52%', minHeight: 70 }}>
              <p style={label}>{shipperLabel}</p>
              {partyLines(shipper.lines ?? [])}
              {variant === 'ocean' && jobNo ? (
                <p style={{ ...label, marginTop: 6 }}>BOOKING NO. {jobNo}</p>
              ) : null}
            </td>
            <td colSpan={2} style={{ ...cell, width: '48%' }}>
              <p style={label}>Bill of Lading Number</p>
              <p style={{ ...body, fontWeight: 800, fontSize: 11, marginTop: 2 }}>{blNo}</p>
              {variant === 'mt' ? (
                <>
                  <p style={{ ...label, marginTop: 8 }}>MTD NO.</p>
                  <p style={{ ...body, fontWeight: 700 }}>{blNo}</p>
                </>
              ) : null}
              {jobNo && variant !== 'ocean' ? (
                <>
                  <p style={{ ...label, marginTop: 8 }}>Job No. / Booking Ref.</p>
                  <p style={body}>{jobNo}</p>
                </>
              ) : null}
            </td>
          </tr>

          <tr>
            <td colSpan={2} style={{ ...cell, minHeight: 64 }}>
              <p style={label}>{consigneeLabel}</p>
              {partyLines(consignee.lines ?? [])}
            </td>
            {identityCell}
          </tr>

          <tr>
            <td colSpan={2} style={cell}>
              <p style={label}>{notifyLabel}</p>
              {partyLines(notify.lines ?? [])}
            </td>
            <td colSpan={2} style={cell}>
              <p style={label}>
                {variant === 'ocean'
                  ? 'FOR DELIVERY PLEASE APPLY TO'
                  : delivery.title ||
                    'APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:'}
              </p>
              {partyLines(delivery.lines ?? [])}
            </td>
          </tr>

          {/* Routing */}
          {variant === 'ocean' ? (
            <>
              <tr>
                <td colSpan={2} style={cell}>
                  <p style={label}>Pre-carriage by</p>
                  <p style={{ ...body, marginTop: 2 }}>{preCarriage}</p>
                </td>
                <td colSpan={2} style={cell}>
                  <p style={label}>Place of Receipt</p>
                  <p style={{ ...body, marginTop: 2 }}>{placeReceipt}</p>
                </td>
              </tr>
              <tr>
                <td colSpan={2} style={cell}>
                  <p style={label}>Ocean Vessel</p>
                  <p style={{ ...body, marginTop: 2 }}>{oceanVessel}</p>
                </td>
                <td colSpan={2} style={cell}>
                  <p style={label}>Port of Loading</p>
                  <p style={{ ...body, marginTop: 2 }}>{portLoading}</p>
                </td>
              </tr>
            </>
          ) : (
            <>
              <tr>
                <td colSpan={2} style={cell}>
                  <p style={label}>
                    {variant === 'jasper' ? 'Vessel / Voyage No.' : 'Ocean Vessel'}
                  </p>
                  <p style={{ ...body, marginTop: 2 }}>
                    {variant === 'jasper'
                      ? [oceanVessel, voyageNo].filter(Boolean).join(' / ')
                      : oceanVessel}
                  </p>
                </td>
                <td colSpan={2} style={cell}>
                  <p style={label}>Voyage Number</p>
                  <p style={{ ...body, marginTop: 2 }}>{voyageNo || '—'}</p>
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
            </>
          )}

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
              <p style={{ ...body, marginTop: 2, fontWeight: 700 }}>{freight}</p>
            </td>
            <td style={cell}>
              <p style={label}>No. of Original B/L</p>
              <p style={{ ...body, marginTop: 2 }}>{originals}</p>
            </td>
          </tr>

          {/* Cargo */}
          <tr>
            {cargoHeaders.map((h, hi) => (
              <th
                key={h}
                style={{
                  ...cell,
                  width:
                    cargoHeaders.length === 4
                      ? hi === 0
                        ? '26%'
                        : hi === 1
                          ? '38%'
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
          {(cargoRows.length
            ? cargoRows
            : [Array.from({ length: cargoHeaders.length }, () => '')]
          ).map((row, ri) => (
            <tr key={ri}>
              {cargoHeaders.map((_, ci) => (
                <td
                  key={ci}
                  style={{
                    ...cell,
                    minHeight: 72,
                    whiteSpace: 'pre-wrap',
                    fontSize: 8,
                  }}
                >
                  {row[ci] ??
                    (ci === cargoHeaders.length - 2
                      ? weight
                      : ci === cargoHeaders.length - 1
                        ? volume
                        : '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
