/**
 * Colors for report PDF layouts.
 * Blues match header/footer navy (#0A2942) from KingFisher T&C chrome.
 */
export const FRESA_UI = {
  navy: '#0A2942',
  sky: '#0A2942',
  skySoft: '#0A2942',
  cyan: '#0A2942',
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
  navy: { r: 0.0392, g: 0.1608, b: 0.2588 },
  sky: { r: 0.0392, g: 0.1608, b: 0.2588 },
  cyan: { r: 0.0392, g: 0.1608, b: 0.2588 },
  panel: { r: 0.9216, g: 0.9412, b: 0.9569 },
  orange: { r: 0.9686, g: 0.6353, b: 0.1098 },
  red: { r: 0.8706, g: 0.1216, b: 0.149 },
  gray: { r: 0.3961, g: 0.3961, b: 0.3961 },
  ink: { r: 0.0627, g: 0.0627, b: 0.0627 },
  hairline: { r: 0.9176, g: 0.9176, b: 0.9176 },
} as const;
