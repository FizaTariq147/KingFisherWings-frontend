import type { CSSProperties } from 'react';

type Props = {
  /** Wider preprinted form (Original-1) vs near-A4 (Original-2). */
  variant: 'original1' | 'original2';
};

/**
 * Neutral IATA-style form underlay for digital PDF / screen preview.
 * Light ink only — not Fresa stationery, no competitor branding.
 * Physical print may use real preprinted paper; this underlay stands in digitally.
 */
export function HawbPreprintedUnderlay({ variant }: Props) {
  // Crisp black grid like dense faces (gray wash looked unfinished on screen/PDF).
  const line = '#000000';
  const label: CSSProperties = {
    position: 'absolute',
    fontSize: 6,
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontWeight: 700,
    color: '#000000',
    margin: 0,
    lineHeight: 1.1,
    pointerEvents: 'none',
  };
  const box = (t: number, l: number, w: number, h: number): CSSProperties => ({
    position: 'absolute',
    top: `${t}%`,
    left: `${l}%`,
    width: `${w}%`,
    height: `${h}%`,
    border: `1px solid ${line}`,
    boxSizing: 'border-box',
    pointerEvents: 'none',
  });

  return (
    <div
      data-hawb-preprinted-underlay={variant}
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        background: '#ffffff',
        zIndex: 0,
        overflow: 'hidden',
      }}
    >
      {/* Outer form edge — slightly heavier like Fresa pre-printed frame */}
      <div style={{ ...box(1, 1.2, 97.6, 97.5), border: `1.5px solid ${line}` }} />

      {/* Shipper / issued-by band */}
      <div style={box(2.5, 2, 46, 11)} />
      <p style={{ ...label, top: '2.7%', left: '2.4%' }}>Shipper&apos;s Name and Address</p>
      <div style={box(2.5, 48, 49.5, 11)} />
      <p style={{ ...label, top: '2.7%', left: '48.5%' }}>
        {variant === 'original2' ? 'Non Negotiable Air Waybill · Issued by' : 'Not Negotiable · Issued by'}
      </p>

      {/* Consignee / accounting */}
      <div style={box(13.5, 2, 46, 10)} />
      <p style={{ ...label, top: '13.7%', left: '2.4%' }}>Consignee&apos;s Name and Address</p>
      <div style={box(13.5, 48, 49.5, 10)} />
      <p style={{ ...label, top: '13.7%', left: '48.5%' }}>Accounting Information</p>

      {/* Agent */}
      <div style={box(23.5, 2, 46, 6)} />
      <p style={{ ...label, top: '23.7%', left: '2.4%' }}>Issuing Carrier&apos;s Agent Name and City</p>
      <div style={box(23.5, 48, 24.5, 6)} />
      <p style={{ ...label, top: '23.7%', left: '48.5%' }}>Agent&apos;s IATA Code</p>
      <div style={box(23.5, 72.5, 25, 6)} />
      <p style={{ ...label, top: '23.7%', left: '73%' }}>Account No.</p>

      {/* Departure / routing */}
      <div style={box(29.5, 2, 46, 3.5)} />
      <p style={{ ...label, top: '29.6%', left: '2.4%' }}>Airport of Departure</p>
      <div style={box(29.5, 48, 49.5, 3.5)} />
      <p style={{ ...label, top: '29.6%', left: '48.5%' }}>Requested Flight / Date</p>

      {/* To / By / values */}
      <div style={box(33, 2, 8, 3)} />
      <p style={{ ...label, top: '33.1%', left: '2.3%' }}>To</p>
      <div style={box(33, 10, 14, 3)} />
      <p style={{ ...label, top: '33.1%', left: '10.3%' }}>By first Carrier</p>
      <div style={box(33, 24, 12, 3)} />
      <p style={{ ...label, top: '33.1%', left: '24.3%' }}>to / by</p>
      <div style={box(33, 36, 10, 3)} />
      <p style={{ ...label, top: '33.1%', left: '36.3%' }}>Currency</p>
      <div style={box(33, 46, 14, 3)} />
      <p style={{ ...label, top: '33.1%', left: '46.3%' }}>CHGS / WT/VAL</p>
      <div style={box(33, 60, 18, 3)} />
      <p style={{ ...label, top: '33.1%', left: '60.3%' }}>Declared Carriage</p>
      <div style={box(33, 78, 19.5, 3)} />
      <p style={{ ...label, top: '33.1%', left: '78.3%' }}>Declared Customs</p>

      {/* Destination / insurance */}
      <div style={box(36, 2, 40, 3.5)} />
      <p style={{ ...label, top: '36.1%', left: '2.4%' }}>Airport of Destination</p>
      <div style={box(36, 42, 30, 3.5)} />
      <p style={{ ...label, top: '36.1%', left: '42.4%' }}>Flight / Date</p>
      <div style={box(36, 72, 25.5, 3.5)} />
      <p style={{ ...label, top: '36.1%', left: '72.4%' }}>Amount of Insurance</p>

      {/* Handling */}
      <div style={box(39.5, 2, 95.5, 4)} />
      <p style={{ ...label, top: '39.6%', left: '2.4%' }}>Handling Information</p>

      {/* Cargo table */}
      <div style={box(43.5, 2, 95.5, 22)} />
      {(
        [
          [2, 8, 'No. of Pieces'],
          [10, 10, 'Gross Weight'],
          [20, 5, 'kg'],
          [25, 8, 'Rate Class'],
          [33, 12, 'Chargeable Wt'],
          [45, 12, 'Rate / Charge'],
          [57, 12, 'Total'],
          [69, 28.5, 'Nature and Quantity of Goods'],
        ] as const
      ).map(([l, w, lab]) => (
        <div key={lab} style={box(43.5, l, w, 2.2)}>
          <p style={{ ...label, top: '43.7%', left: `${l + 0.2}%` }}>{lab}</p>
        </div>
      ))}

      {/* Charges / signature — band bottoms align with Fresa sparse execution Y */}
      <div style={box(65.5, 2, 48, 16)} />
      <p style={{ ...label, top: '65.7%', left: '2.4%' }}>Weight Charge · Prepaid / Collect</p>
      <div style={box(65.5, 50, 47.5, 16)} />
      <p style={{ ...label, top: '65.7%', left: '50.5%' }}>Signature of Shipper or his Agent</p>
      <p style={{ ...label, top: '77%', left: '50.5%' }}>Signature of Issuing Carrier or its Agent</p>
      <p style={{ ...label, top: '84%', left: '50.5%' }}>Executed on (Date) · at (Place)</p>

      <div style={box(91, 2, 95.5, 4)} />
      <p style={{ ...label, top: '91.2%', left: '2.4%' }}>
        Currency Conversion Rates · Charges at Destination · Total Collect Charges
      </p>
    </div>
  );
}
