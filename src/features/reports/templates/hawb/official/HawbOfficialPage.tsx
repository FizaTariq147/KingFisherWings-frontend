import type { CSSProperties, ReactNode } from 'react';
import type { HawbOfficialLayoutConfig } from './hawbOfficial.types';

type Props = {
  layout: HawbOfficialLayoutConfig;
  children: ReactNode;
  pageIndex?: number;
  pageTotal?: number;
};

/** Page box from Phase 1 geometry for the format-specific layout. */
export function HawbOfficialPage({ layout, children, pageIndex, pageTotal }: Props) {
  const g = layout.page;
  const style: CSSProperties = {
    width: `${g.widthMm}mm`,
    minHeight: `${g.heightMm}mm`,
    height: `${g.heightMm}mm`,
    boxSizing: 'border-box',
    padding: `${g.marginsMm.top}mm ${g.marginsMm.right}mm ${g.marginsMm.bottom}mm ${g.marginsMm.left}mm`,
    background: '#ffffff',
    position: 'relative',
    overflow: 'hidden',
    pageBreakAfter: pageIndex != null && pageTotal != null && pageIndex < pageTotal ? 'always' : 'auto',
  };

  return (
    <article
      data-hawb-official-page={layout.variant}
      data-hawb-official-code={layout.code}
      data-page-width-pt={Math.round(g.widthPt)}
      data-page-height-pt={Math.round(g.heightPt)}
      className="fn-page fn-doc"
      style={style}
    >
      {children}
    </article>
  );
}
