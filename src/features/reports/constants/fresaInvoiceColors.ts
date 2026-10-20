/**
 * Colors extracted from Fresa Gold sample-report-formats PDFs
 * (Format-6 / 7 blue–orange–red accents + light fills).
 * Used as defaults and when layout themes were remapped to KingFisher T&C navy.
 */
export const FRESA_UI = {
  /** Format-6 / standard ink navy */
  navy: '#0F4D96',
  /** Format-7 header accent */
  sky: '#2286C8',
  skySoft: '#2788C9',
  /** Format-6 light-blue table header */
  cyan: '#9AD7FF',
  /** Formats 8–10 panel fill */
  panel: '#EBF0F4',
  orange: '#F7A21C',
  red: '#DE1F26',
  gray: '#656565',
  ink: '#101010',
  hairline: '#EAEAEA',
  white: '#FFFFFF',
  offWhite: '#FCFCFC',
  fill: '#F3F3F3',
  black: '#000000',
} as const;

/** KingFisher T&C navy — detect accidental remaps of Fresa cyan/sky onto this. */
export const KF_TC_NAVY = '#0A2942';

export const FRESA_PDF = {
  navy: { r: 0.0588, g: 0.302, b: 0.5882 },
  sky: { r: 0.1333, g: 0.5216, b: 0.7843 },
  cyan: { r: 0.6039, g: 0.8431, b: 1.0 },
  panel: { r: 0.9216, g: 0.9412, b: 0.9569 },
  orange: { r: 0.9686, g: 0.6353, b: 0.1098 },
  red: { r: 0.8706, g: 0.1216, b: 0.149 },
  gray: { r: 0.3961, g: 0.3961, b: 0.3961 },
  ink: { r: 0.0627, g: 0.0627, b: 0.0627 },
  hairline: { r: 0.9176, g: 0.9176, b: 0.9176 },
} as const;

function hexEq(a?: string, b?: string): boolean {
  if (!a || !b) return false;
  return a.replace(/^#/, '').toUpperCase() === b.replace(/^#/, '').toUpperCase();
}

/**
 * Restore Fresa-like accents when JSON themes collapsed cyan/accent onto KF navy.
 * Leaves black primary (Tax India) intact; remaps KF-navy primary → Fresa navy.
 */
export function normalizeFresaThemeColors<T extends {
  primary: string;
  accent: string;
  fill: string;
  panel: string;
  orange: string;
  cyan: string;
  ink: string;
  gray: string;
  white: string;
  red?: string;
}>(theme: T): T {
  const primaryIsKf = hexEq(theme.primary, KF_TC_NAVY);
  const accentIsKf = hexEq(theme.accent, KF_TC_NAVY);
  const cyanIsKf =
    hexEq(theme.cyan, KF_TC_NAVY) ||
    (hexEq(theme.cyan, theme.accent) && accentIsKf);

  return {
    ...theme,
    primary: primaryIsKf ? FRESA_UI.navy : theme.primary,
    accent: accentIsKf ? FRESA_UI.sky : theme.accent,
    cyan: cyanIsKf ? FRESA_UI.cyan : theme.cyan,
    orange: theme.orange || FRESA_UI.orange,
    red: theme.red || FRESA_UI.red,
    fill: theme.fill || FRESA_UI.fill,
    panel: theme.panel || FRESA_UI.panel,
  };
}
