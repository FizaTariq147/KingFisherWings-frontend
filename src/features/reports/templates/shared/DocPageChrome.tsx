import type { CSSProperties, ReactNode } from 'react';
import { colors, pageA4Landscape, pageA4Portrait } from './docStyles';

type Props = {
  children: ReactNode;
  orientation?: 'portrait' | 'landscape';
  style?: CSSProperties;
  'data-report-template'?: string;
};

export function DocPageChrome({
  children,
  orientation = 'portrait',
  style,
  'data-report-template': dataAttr,
}: Props) {
  const base = orientation === 'landscape' ? pageA4Landscape : pageA4Portrait;
  return (
    <div
      data-report-template={dataAttr || 'doc'}
      style={{ ...base, ...style, border: `1px solid ${colors.line}` }}
    >
      {children}
    </div>
  );
}
