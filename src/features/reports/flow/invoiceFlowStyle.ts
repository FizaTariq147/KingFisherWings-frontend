/**
 * Measurements taken from reports/specs/INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA.json
 * and the Format 1 reference PDF. Used by the flow (pdfmake) invoice only.
 */
export const INVOICE_FLOW_STYLE = {
  page: {
    width: 594,
    height: 841.9,
  },
  /** Content margins inferred from span extrema (~16.6 left, ~16–17 bottom/top). */
  margins: {
    left: 16,
    right: 16,
    top: 16,
    bottom: 28,
  },
  fonts: {
    family: 'Arimo',
    sizes: {
      company: 15.8,
      title: 11.9,
      body: 7.9,
      small: 6.8,
      meta: 8,
    },
  },
  colors: {
    ink: '#101010',
    gray: '#656565',
    rule: '#656565',
    ruleDark: '#101010',
    headerFill: '#9AD7FF', // 0.603922,0.843137,1.000000
    panelFill: '#FCFCFC', // 0.988235,0.988235,0.988235
    bandGray: '#656565', // 0.396078
    accentBlue: '#0F4D96', // 0.058824,0.301961,0.588235
    accentOrange: '#F7A21C', // 0.968627,0.635294,0.109804
    accentRed: '#DE1F26', // 0.870588,0.121569,0.149020
    white: '#FFFFFF',
  },
  rules: {
    /** Dominant stroke width in the Format 1 line census. */
    weight: 0.5653,
  },
  logo: {
    x: 27.4,
    y: 784.6,
    width: 82,
    height: 39.6,
  },
  companySlot: {
    x: 352.9,
    y: 811.7,
    width: 202.26,
  },
  /** Browser print chrome on the reference PDF — masked in demo-vs-reference. */
  mask: {
    browserHeader: { x: 0, y: 808, width: 594, height: 34 },
    browserFooter: { x: 0, y: 0, width: 594, height: 24 },
    brandingFooter: { x: 0, y: 24, width: 594, height: 18 },
    logo: { x: 27.4, y: 784.6, width: 82, height: 39.6 },
    companyName: { x: 340, y: 790, width: 240, height: 40 },
  },
  table: {
    headerFill: '#9AD7FF',
    cellPadding: 2,
    fontSize: 6.5,
  },
} as const;

export type InvoiceFlowStyle = typeof INVOICE_FLOW_STYLE;
