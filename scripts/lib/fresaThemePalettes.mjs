/**
 * Authentic Fresa Gold sample-report-formats colours
 * (sky blue #2286C8, cyan table headers #9AD7FF, navy #0F4D96).
 * Subtle family variants stay inside that sky-blue system — no purple/green drift.
 */

/** @typedef {{ primary: string, accent: string, fill: string, panel: string, orange: string, red: string, cyan: string, ink: string, gray: string, white: string }} FresaTheme */

const ORANGE = '#F7A21C';
const RED = '#DE1F26';
const INK = '#101010';
const GRAY = '#656565';
const WHITE = '#FFFFFF';

/** @type {Record<string, FresaTheme>} */
export const FRESA_THEME_FAMILIES = {
  /** Tax Invoice India — black rules + sky accents */
  tax_india: {
    primary: '#000000',
    accent: '#2286C8',
    fill: '#F3F3F3',
    panel: '#F3F3F3',
    orange: ORANGE,
    red: RED,
    cyan: '#9AD7FF',
    ink: INK,
    gray: GRAY,
    white: WHITE,
  },
  /** Standard / USA / simple — navy + sky */
  usa: {
    primary: '#0F4D96',
    accent: '#2286C8',
    fill: '#EBF0F4',
    panel: '#EBF0F4',
    orange: ORANGE,
    red: RED,
    cyan: '#9AD7FF',
    ink: INK,
    gray: GRAY,
    white: WHITE,
  },
  simple: {
    primary: '#0F4D96',
    accent: '#2788C9',
    fill: '#F3F3F3',
    panel: '#EBF0F4',
    orange: ORANGE,
    red: RED,
    cyan: '#9AD7FF',
    ink: INK,
    gray: GRAY,
    white: WHITE,
  },
  /** Cyan table-header heavy (Format-6 style) */
  cyan_header: {
    primary: '#0F4D96',
    accent: '#2286C8',
    fill: '#E8F4FC',
    panel: '#D6EEFB',
    orange: ORANGE,
    red: RED,
    cyan: '#9AD7FF',
    ink: INK,
    gray: GRAY,
    white: WHITE,
  },
  /** Sky title-band docs (arrival / notices) */
  sky_band: {
    primary: '#2286C8',
    accent: '#0F4D96',
    fill: '#F0F9FF',
    panel: '#E0F2FE',
    orange: ORANGE,
    red: RED,
    cyan: '#9AD7FF',
    ink: INK,
    gray: GRAY,
    white: WHITE,
  },
  /** Soft ice panel (HAWB / air) */
  air: {
    primary: '#0F4D96',
    accent: '#38BDF8',
    fill: '#F0F9FF',
    panel: '#E0F2FE',
    orange: ORANGE,
    red: RED,
    cyan: '#7DD3FC',
    ink: '#0C4A6E',
    gray: GRAY,
    white: WHITE,
  },
  /** Sea / HBL — deeper navy, same sky accents */
  hbl: {
    primary: '#0A3D7A',
    accent: '#2286C8',
    fill: '#F8FAFC',
    panel: '#E8F4FC',
    orange: ORANGE,
    red: RED,
    cyan: '#9AD7FF',
    ink: INK,
    gray: GRAY,
    white: WHITE,
  },
  hawb: {
    primary: '#0F4D96',
    accent: '#0284C7',
    fill: '#F0F9FF',
    panel: '#E0F2FE',
    orange: ORANGE,
    red: RED,
    cyan: '#7DD3FC',
    ink: '#0C4A6E',
    gray: GRAY,
    white: WHITE,
  },
  arrival: {
    primary: '#0F4D96',
    accent: '#2286C8',
    fill: '#E8F4FC',
    panel: '#D6EEFB',
    orange: ORANGE,
    red: RED,
    cyan: '#9AD7FF',
    ink: INK,
    gray: GRAY,
    white: WHITE,
  },
  delivery: {
    primary: '#0F4D96',
    accent: '#2788C9',
    fill: '#EEF6FF',
    panel: '#E0F2FE',
    orange: ORANGE,
    red: RED,
    cyan: '#9AD7FF',
    ink: INK,
    gray: GRAY,
    white: WHITE,
  },
  /** Land freight — navy + amber accents (still Fresa sky headers) */
  land: {
    primary: '#0F4D96',
    accent: '#2286C8',
    fill: '#FFF8F0',
    panel: '#EBF0F4',
    orange: ORANGE,
    red: RED,
    cyan: '#9AD7FF',
    ink: INK,
    gray: GRAY,
    white: WHITE,
  },
  warehouse: {
    primary: '#0F4D96',
    accent: '#2286C8',
    fill: '#F0F9FF',
    panel: '#E8F4FC',
    orange: ORANGE,
    red: RED,
    cyan: '#9AD7FF',
    ink: INK,
    gray: GRAY,
    white: WHITE,
  },
  /** Arabic RTL — same sky system, teal-leaning panel still sky-tinted */
  arabic: {
    primary: '#0F4D96',
    accent: '#1A8A94',
    fill: '#E8F4FC',
    panel: '#D6EEFB',
    orange: ORANGE,
    red: RED,
    cyan: '#9AD7FF',
    ink: INK,
    gray: GRAY,
    white: WHITE,
  },
  fcy: {
    primary: '#0F4D96',
    accent: '#2286C8',
    fill: '#EEF2FF',
    panel: '#E8F4FC',
    orange: ORANGE,
    red: RED,
    cyan: '#9AD7FF',
    ink: INK,
    gray: GRAY,
    white: WHITE,
  },
  summary: {
    primary: '#0F4D96',
    accent: '#2286C8',
    fill: '#E8F4FC',
    panel: '#D6EEFB',
    orange: ORANGE,
    red: RED,
    cyan: '#9AD7FF',
    ink: INK,
    gray: GRAY,
    white: WHITE,
  },
  preprinted: {
    primary: '#0F4D96',
    accent: '#2286C8',
    fill: '#F9FAFB',
    panel: '#EBF0F4',
    orange: ORANGE,
    red: RED,
    cyan: '#9AD7FF',
    ink: INK,
    gray: GRAY,
    white: WHITE,
  },
  debit: {
    primary: '#0F4D96',
    accent: '#2286C8',
    fill: '#F0F9FF',
    panel: '#E8F4FC',
    orange: ORANGE,
    red: RED,
    cyan: '#9AD7FF',
    ink: INK,
    gray: GRAY,
    white: WHITE,
  },
  finance: {
    primary: '#0F4D96',
    accent: '#2286C8',
    fill: '#E8F4FC',
    panel: '#D6EEFB',
    orange: ORANGE,
    red: RED,
    cyan: '#9AD7FF',
    ink: INK,
    gray: GRAY,
    white: WHITE,
  },
  ops_list: {
    primary: '#0F4D96',
    accent: '#2788C9',
    fill: '#EEF6FF',
    panel: '#E0F2FE',
    orange: ORANGE,
    red: RED,
    cyan: '#9AD7FF',
    ink: INK,
    gray: GRAY,
    white: WHITE,
  },
  quotation: {
    primary: '#0F4D96',
    accent: '#2286C8',
    fill: '#F0F9FF',
    panel: '#E8F4FC',
    orange: ORANGE,
    red: RED,
    cyan: '#9AD7FF',
    ink: INK,
    gray: GRAY,
    white: WHITE,
  },
  sea: {
    primary: '#0A3D7A',
    accent: '#2286C8',
    fill: '#ECFEFF',
    panel: '#E8F4FC',
    orange: ORANGE,
    red: RED,
    cyan: '#9AD7FF',
    ink: INK,
    gray: GRAY,
    white: WHITE,
  },
};

const FAMILY_KEYS = Object.keys(FRESA_THEME_FAMILIES);

function tintHex(hex, delta) {
  const h = String(hex || '').replace('#', '');
  if (h.length !== 6) return hex;
  const n = (i) => Math.max(0, Math.min(255, parseInt(h.slice(i, i + 2), 16) + delta));
  const to = (v) => v.toString(16).padStart(2, '0');
  return `#${to(n(0))}${to(n(2))}${to(n(4))}`.toUpperCase();
}

/**
 * Pick Fresa sky-blue family from report name/code, tint lightly by seed.
 * @returns {FresaTheme}
 */
export function themeForFresaFormat(name, code, seed = 0) {
  const blob = `${name || ''} ${code || ''}`.toUpperCase();
  let family = 'usa';

  if (/TAX.?INVOICE.?INDIA|SGST|CGST/.test(blob) && /INVOICE|TAX/.test(blob)) family = 'tax_india';
  else if (/ARABIC|RTL|فاتورة/.test(blob)) family = 'arabic';
  else if (/USA|UNITED STATES/.test(blob)) family = 'usa';
  else if (/LAND.?FREIGHT|TRANSPORTATION.?INVOICE|ROAD/.test(blob)) family = 'land';
  else if (/WAREHOUSE|WMS|ASN|SHIPPING.?NOTE|STOCK|ADVANCE.?SHIPPING/.test(blob))
    family = 'warehouse';
  else if (/DEBIT.?NOTE|VIETNAM/.test(blob)) family = 'debit';
  else if (/SUMMARY.?INVOICE/.test(blob)) family = 'summary';
  else if (/\bFCY\b|FOREIGN.?CURRENCY/.test(blob)) family = 'fcy';
  else if (/PRE.?PRINTED|PREPRINTED/.test(blob)) family = 'preprinted';
  else if (/SIMPLE.?INVOICE/.test(blob)) family = 'simple';
  else if (/QUOTATION|QUOTE|TARIFF|FCL.?QUOTATION|AIR.?QUOTATION/.test(blob)) family = 'quotation';
  else if (/\bHBL\b|BILL.?OF.?LADING|MULTIMODAL|MBL|FREIGHT.?MANIFEST|STUFFING|SAILING|FCR|ISF|VGM/.test(blob))
    family = 'hbl';
  else if (/\bHAWB\b|\bMAWB\b|AIR.?WAY|AIR.?MANIFEST|BOOKING.?CONFIRMATION.?AIR|BARCODE.?AWB/.test(blob))
    family = 'hawb';
  else if (/DELIVERY.?ORDER|\bDO\b/.test(blob)) family = 'delivery';
  else if (/ARRIVAL.?NOTICE|CARGO.?ARRIVAL|ATA|ARRIVAL.?CONFIRM/.test(blob)) family = 'arrival';
  else if (/OUTSTANDING|AGING|TRIAL.?BALANCE|VOUCHER|STATEMENT.?OF.?ACCOUNTS|PROFIT.?AND.?LOSS|GL_|JOURNAL|CHEQUE|AP_|AR_|PROFORMA/.test(blob))
    family = 'finance';
  else if (/LIST.?REPORT|PENDING_|DAILY.?STATUS|DSR|SHIPMENTS.?WITH|EXCEPTION|KPI|CONTAINER.?LIST|CONTAINER.?SUMMARY/.test(blob))
    family = 'ops_list';
  else if (/SEA|OCEAN|FCL|LCL|CONTAINER|VESSEL/.test(blob)) family = 'sea';
  else if (/AIR|FLIGHT|AIRLINE/.test(blob)) family = 'air';
  else if (/CYAN|JASPER/.test(blob)) family = 'cyan_header';
  else family = FAMILY_KEYS[Math.abs(seed) % FAMILY_KEYS.length];

  const base = { ...FRESA_THEME_FAMILIES[family] };
  // Tiny fill/panel tint so sibling formats differ without leaving Fresa sky system
  const delta = ((Math.abs(seed) * 5) % 17) - 8;
  return {
    ...base,
    accent: tintHex(base.accent, Math.round(delta / 3)),
    fill: tintHex(base.fill, delta),
    panel: tintHex(base.panel, Math.round(delta * 0.7)),
    cyan: tintHex(base.cyan, Math.round(delta / 4)),
  };
}

/** Official Invoice Report Format-1…21 theme map (Fresa marketing page). */
export function themeForOfficialInvoiceFormat(formatNumber) {
  /** @type {Record<number, keyof typeof FRESA_THEME_FAMILIES>} */
  const map = {
    1: 'tax_india',
    2: 'tax_india',
    3: 'summary',
    4: 'tax_india',
    5: 'tax_india',
    6: 'simple',
    7: 'simple',
    8: 'arabic',
    9: 'usa',
    10: 'usa',
    11: 'land',
    12: 'preprinted',
    13: 'usa',
    14: 'simple',
    15: 'fcy',
    16: 'preprinted',
    17: 'cyan_header',
    18: 'land',
    19: 'debit',
    20: 'tax_india',
    21: 'warehouse',
  };
  const family = map[formatNumber] || 'usa';
  const base = { ...FRESA_THEME_FAMILIES[family] };
  const delta = ((formatNumber * 5) % 15) - 7;
  return {
    ...base,
    accent: tintHex(base.accent, Math.round(delta / 3)),
    fill: tintHex(base.fill, delta),
    panel: tintHex(base.panel, Math.round(delta * 0.7)),
  };
}
