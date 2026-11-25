import JsBarcode from 'jsbarcode';

type Code128Encoding = { data?: string };

/**
 * CODE_128 module string from JsBarcode. `1` is a black bar, `0` is a gap.
 * Returns an empty string when the payload cannot be encoded.
 */
export function code128BitString(value: string): string {
  const text = String(value || '')
    .replace(/[^\x20-\x7E]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!text) return '';
  const target: { encodings?: Code128Encoding[] } = {};
  try {
    JsBarcode(target, text, {
      format: 'CODE128',
      displayValue: false,
      margin: 0,
      width: 2,
      height: 10,
      background: '#ffffff',
      lineColor: '#000000',
    });
  } catch {
    return '';
  }
  return (target.encodings || []).map((item) => item.data || '').join('');
}
