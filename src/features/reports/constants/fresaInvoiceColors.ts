/**
 * Colors extracted from Fresa Gold sample-report-formats PDFs
 * (Format-6 / 7 blue–orange–red accents + light fills).
 * Used as defaults and when layout themes were remapped to KingFisher T&C navy.
 */
export const FRESA_UI = {
  /**
   * From live Fresa sample PDFs on
   * https://fresatechnologies.com/sample-report-formats/
   * (air-quotation / invoice / ASN streams). FE capture still cannot be
   * pixel-identical to Jasper — packs are required for exact parity.
   */
  navy: '#0E4D95',
  sky: '#2285C8',
  skySoft: '#2788C9',
  cyan: '#99D6FF',
  asnPanel: '#E2F4FF',
  panel: '#EBF0F4',
  orange: '#F6A21B',
  red: '#DE1F25',
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
  navy: { r: 0.055, g: 0.302, b: 0.584 },
  sky: { r: 0.133, g: 0.522, b: 0.784 },
  cyan: { r: 0.6, g: 0.839, b: 1.0 },
  panel: { r: 0.922, g: 0.941, b: 0.957 },
  asnPanel: { r: 0.886, g: 0.957, b: 1.0 },
  orange: { r: 0.965, g: 0.635, b: 0.106 },
  red: { r: 0.871, g: 0.122, b: 0.145 },
  gray: { r: 0.396, g: 0.396, b: 0.396 },
  ink: { r: 0.063, g: 0.063, b: 0.063 },
  hairline: { r: 0.918, g: 0.918, b: 0.918 },
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

  const panelIsKf = hexEq(theme.panel, KF_TC_NAVY);
  const fillIsKf = hexEq(theme.fill, KF_TC_NAVY);

  return {
    ...theme,
    primary: primaryIsKf ? FRESA_UI.navy : theme.primary,
    accent: accentIsKf ? FRESA_UI.sky : theme.accent,
    cyan: cyanIsKf ? FRESA_UI.cyan : theme.cyan,
    orange: theme.orange || FRESA_UI.orange,
    red: theme.red || FRESA_UI.red,
    fill: fillIsKf || !theme.fill ? FRESA_UI.fill : theme.fill,
    panel: panelIsKf || !theme.panel ? FRESA_UI.panel : theme.panel,
  };
}
