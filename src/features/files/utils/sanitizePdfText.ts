/** Keep pdf-lib StandardFonts text in WinAnsi range to avoid empty □ glyphs. */
export function sanitizePdfText(value: string): string {
  return value
    .replace(/\u2014/g, '-')
    .replace(/\u2013/g, '-')
    .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

export function safePdfText(value: string, fallback = ''): string {
  const cleaned = sanitizePdfText(value);
  return cleaned || fallback;
}
