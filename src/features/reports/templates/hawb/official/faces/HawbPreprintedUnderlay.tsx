import type { CSSProperties } from 'react';

type Props = {
  /** Wider preprinted form (Original-1) vs near-A4 (Original-2). */
  variant: 'original1' | 'original2';
};

/**
 * Neutral IATA-style form underlay for digital PDF / screen preview.
 * Boxes only — no label text (labels + data overlapping was the Original rough UI).
 * Physical print uses real preprinted stationery with showUnderlay=false.
 */
export function HawbPreprintedUnderlay({ variant: _variant }: Props) {
  const line = '#000000';
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
      data-hawb-preprinted-underlay="boxes-only"
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        background: '#ffffff',
        zIndex: 0,
        overflow: 'hidden',
      }}
    >
      <div style={{ ...box(1, 1.2, 97.6, 97.5), border: `1.5px solid ${line}` }} />

      <div style={box(2.5, 2, 46, 11)} />
      <div style={box(2.5, 48, 49.5, 11)} />

      <div style={box(13.5, 2, 46, 10)} />
      <div style={box(13.5, 48, 49.5, 10)} />

      <div style={box(23.5, 2, 46, 6)} />
      <div style={box(23.5, 48, 24.5, 6)} />
      <div style={box(23.5, 72.5, 25, 6)} />

      <div style={box(29.5, 2, 46, 3.5)} />
      <div style={box(29.5, 48, 49.5, 3.5)} />

      <div style={box(33, 2, 8, 3)} />
      <div style={box(33, 10, 14, 3)} />
      <div style={box(33, 24, 12, 3)} />
      <div style={box(33, 36, 10, 3)} />
      <div style={box(33, 46, 14, 3)} />
      <div style={box(33, 60, 18, 3)} />
      <div style={box(33, 78, 19.5, 3)} />

      <div style={box(36, 2, 40, 3.5)} />
      <div style={box(36, 42, 30, 3.5)} />
      <div style={box(36, 72, 25.5, 3.5)} />

      <div style={box(39.5, 2, 95.5, 4)} />

      <div style={box(43.5, 2, 95.5, 22)} />
      {(
        [
          [2, 8],
          [10, 10],
          [20, 5],
          [25, 8],
          [33, 12],
          [45, 12],
          [57, 12],
          [69, 28.5],
        ] as const
      ).map(([l, w]) => (
        <div key={`${l}-${w}`} style={box(43.5, l, w, 22)} />
      ))}

      <div style={box(65.5, 2, 48, 16)} />
      <div style={box(65.5, 50, 47.5, 16)} />
      <div style={box(91, 2, 95.5, 4)} />
    </div>
  );
}
