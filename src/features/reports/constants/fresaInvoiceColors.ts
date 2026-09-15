/**
 * Colors extracted from Fresa Format-6 / 7 sample PDFs
 * (blue / orange / red accents + light fills).
 */
export const FRESA_UI = {
  navy: '#0F4D96',
  sky: '#2286C8',
  skySoft: '#2788C9',
  cyan: '#9AD7FF',
  panel: '#EBF0F4',
  orange: '#F7A21C',
  red: '#DE1F26',
  gray: '#656565',
  ink: '#101010',
  hairline: '#EAEAEA',
  white: '#FFFFFF',
  offWhite: '#FCFCFC',
} as const;

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
