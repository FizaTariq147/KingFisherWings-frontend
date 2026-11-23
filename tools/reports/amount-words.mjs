/**
 * English amount in words with correct major/minor units and grouping.
 * INR and PKR use Indian (lakh/crore) grouping; AED/USD/EUR/GBP use
 * thousand/million/billion. Minor units: Paise (INR/PKR), Fils (AED),
 * Cents (USD/EUR), Pence (GBP).
 */
const SMALL = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function under100(value) {
  if (value < 20) return SMALL[value];
  const ten = Math.floor(value / 10);
  const rest = value % 10;
  return rest ? `${TENS[ten]}-${SMALL[rest]}` : TENS[ten];
}

function under1000(value) {
  if (value < 100) return under100(value);
  const hundred = Math.floor(value / 100);
  const rest = value % 100;
  return rest ? `${SMALL[hundred]} Hundred ${under100(rest)}` : `${SMALL[hundred]} Hundred`;
}

function englishWords(value) {
  if (value === 0) return 'Zero';
  const scales = [
    [1_000_000_000, 'Billion'],
    [1_000_000, 'Million'],
    [1_000, 'Thousand'],
  ];
  const parts = [];
  let left = value;
  for (const [size, name] of scales) {
    if (left >= size) {
      parts.push(`${under1000(Math.floor(left / size))} ${name}`);
      left %= size;
    }
  }
  if (left) parts.push(under1000(left));
  return parts.join(' ');
}

function indianWords(value) {
  if (value === 0) return 'Zero';
  const crore = Math.floor(value / 10_000_000);
  const lakh = Math.floor((value % 10_000_000) / 100_000);
  const thousand = Math.floor((value % 100_000) / 1_000);
  const rest = value % 1_000;
  const parts = [];
  if (crore) parts.push(`${under1000(crore)} Crore`);
  if (lakh) parts.push(`${under100(lakh)} Lakh`);
  if (thousand) parts.push(`${under1000(thousand)} Thousand`);
  if (rest) parts.push(under1000(rest));
  return parts.join(' ');
}

/** @type {Record<string, { major: string, minor: string, grouping: 'indian'|'western' }>} */
const UNIT = {
  INR: { major: 'Rupees', minor: 'Paise', grouping: 'indian' },
  PKR: { major: 'Rupees', minor: 'Paise', grouping: 'indian' },
  AED: { major: 'Dirhams', minor: 'Fils', grouping: 'western' },
  USD: { major: 'Dollars', minor: 'Cents', grouping: 'western' },
  EUR: { major: 'Euros', minor: 'Cents', grouping: 'western' },
  GBP: { major: 'Pounds', minor: 'Pence', grouping: 'western' },
};

export function amountInWords(amount, currency) {
  const number = Number(amount);
  if (!Number.isFinite(number)) return '';
  const sign = number < 0 ? 'Minus ' : '';
  const absolute = Math.abs(number);
  const whole = Math.floor(absolute + 1e-8);
  const minor = Math.round((absolute - whole) * 100);
  const code = String(currency || '').toUpperCase();
  const unit = UNIT[code] || { major: 'Units', minor: 'Cents', grouping: 'western' };
  const toWords = unit.grouping === 'indian' ? indianWords : englishWords;
  const words = toWords(whole);
  if (!minor) return `${sign}${unit.major} ${words} Only`;
  const minorWords = toWords(minor);
  return `${sign}${unit.major} ${words} and ${minorWords} ${unit.minor} Only`;
}

export const AMOUNT_WORDS_CURRENCIES = Object.keys(UNIT);
