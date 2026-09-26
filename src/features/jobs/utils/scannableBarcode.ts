/**
 * Shared CODE128 settings so every on-screen / print / PDF barcode stays scannable.
 *
 * Specs oriented for handheld gate scanners + 100×50mm stickers:
 * - Module (X) ≥ 2px at render, quiet zone ≥ 10× module
 * - Bar height ≥ ~12mm on sticker (~34pt)
 * - Pure black on white (max contrast)
 * - Payload ASCII-safe for CODE128
 */

/** Geometry used for sticker PNG / print (high enough for lasers & phone cams). */
export const SCANNABLE_BARCODE_OPTS = {
  /** Bar height in px at 1× render. */
  height: 64,
  /** Module width in px — thicker bars survive print + PDF scale. */
  width: 2,
  /** Quiet zone (left/right) — JsBarcode margin in modules×width units. */
  margin: 12,
  fontSize: 12,
  textMargin: 3,
  background: '#ffffff',
  /** Pure black — navy reduces scanner contrast on some devices. */
  lineColor: '#000000',
} as const;

/** On-screen preview can be slightly shorter; still scannable if printed from PNG/PDF. */
export const SCREEN_BARCODE_OPTS = {
  ...SCANNABLE_BARCODE_OPTS,
  height: 48,
  width: 1.8,
  margin: 10,
  fontSize: 11,
} as const;

/**
 * Normalize any job barcode / job-number into a CODE128-safe payload.
 * Strips zero-width / control chars, collapses whitespace, rejects empty.
 */
export function normalizeCode128Value(raw: string): string {
  const cleaned = String(raw ?? '')
    .normalize('NFKC')
    // Remove control + zero-width chars
    .replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200D\uFEFF]/g, '')
    .trim()
    // Collapse internal whitespace (scanners often emit without spaces anyway)
    .replace(/\s+/g, '');

  if (!cleaned) return '';

  // CODE128 (JsBarcode) accepts most ASCII; drop remaining non-printable
  const ascii = cleaned
    .split('')
    .filter((ch) => {
      const c = ch.charCodeAt(0);
      return c >= 32 && c <= 126;
    })
    .join('');

  return ascii.slice(0, 48);
}

/** True when JsBarcode / scanners can encode this value. */
export function isCode128Encodable(raw: string): boolean {
  const v = normalizeCode128Value(raw);
  if (!v) return false;
  try {
    // Lazy: length + charset already filtered; empty already rejected
    return /^[\x20-\x7E]+$/.test(v);
  } catch {
    return false;
  }
}
