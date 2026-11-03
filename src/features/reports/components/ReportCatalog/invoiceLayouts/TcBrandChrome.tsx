import { FRESA_UI } from '../../../constants/fresaInvoiceColors';
import { KINGFISHER_TC_HEADER_TAGLINE } from '../../../constants/kingfisherTermsBrandColors';

type ColorBarProps = {
  /** Match T&C top bar height (thicker) vs under-header hairline. */
  size?: 'lg' | 'sm';
  className?: string;
  /** RTL layouts reverse the accent split. */
  reverse?: boolean;
  /** Layout theme primary (Fresa navy / black). */
  primary?: string;
  /** Layout theme orange accent. */
  accent?: string;
};

/**
 * Dual color stripe — Fresa sample look (primary | orange).
 * Pass layout theme colors; falls back to classic Fresa navy/orange.
 */
export function TcBrandColorBar({
  size = 'lg',
  className = '',
  reverse = false,
  primary,
  accent,
}: ColorBarProps) {
  // Inline sizes only — Tailwind height/width classes are often dropped by html2canvas.
  const heightPx = size === 'lg' ? 10 : 4;
  const left = primary || FRESA_UI.navy;
  const right = accent || FRESA_UI.orange;
  const a = (
    <div style={{ width: '68%', height: '100%', backgroundColor: left, flex: '0 0 68%' }} />
  );
  const b = (
    <div style={{ width: '32%', height: '100%', backgroundColor: right, flex: '0 0 32%' }} />
  );
  return (
    <div
      className={className}
      data-fresa-color-bar="true"
      style={{
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        height: heightPx,
        minHeight: heightPx,
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {reverse ? (
        <>
          {b}
          {a}
        </>
      ) : (
        <>
          {a}
          {b}
        </>
      )}
    </div>
  );
}

type TaglineProps = {
  className?: string;
  text?: string;
  color?: string;
};

/** Orange eyebrow / tagline under company name (KF identity line). */
export function TcBrandTagline({
  className = '',
  text = KINGFISHER_TC_HEADER_TAGLINE,
  color = FRESA_UI.orange,
}: TaglineProps) {
  return (
    <p
      className={`text-[8px] font-semibold uppercase tracking-[0.12em] ${className}`}
      style={{ color }}
    >
      {text}
    </p>
  );
}
