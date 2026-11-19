/** Keep pdf-lib StandardFonts text in WinAnsi range to avoid empty □ glyphs. */
export function sanitizePdfText(value: string): string {
  return value
    .replace(/\u2014/g, '-')
    .replace(/\u2013/g, '-')
    // WinAnsi cannot encode LF/CR/TAB (e.g. address fields with line breaks).
    .replace(/[\n\r\t]+/g, ' ')
    .replace(/[^\x20-\x7E]/g, ' ')
    .replace(/ {2,}/g, ' ')
    .trim();
}

export function safePdfText(value: string, fallback = ''): string {
  const cleaned = sanitizePdfText(value);
  return cleaned || fallback;
}
