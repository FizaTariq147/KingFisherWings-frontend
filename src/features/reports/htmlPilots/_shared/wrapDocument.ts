export type HtmlPilotPageOptions = {
  widthMm: number;
  heightMm: number;
  /** Extra CSS appended after base print rules. */
  styles?: string;
};

/**
 * Full HTML document shell for Playwright print.
 * @page margins are 0; padding lives on `.document`.
 */
export function wrapHtmlPilotDocument(bodyInner: string, page: HtmlPilotPageOptions): string {
  const width = `${page.widthMm}mm`;
  const height = `${page.heightMm}mm`;
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
  @page { size: ${width} ${height}; margin: 0; }
  html, body { margin: 0; padding: 0; background: #ffffff; }
  body { width: ${width}; min-height: ${height}; }
  * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body, body * { font-family: Arial, Helvetica, sans-serif; color: #111111; }
  .document { width: 100%; min-height: ${height}; }
  .no-break { break-inside: avoid; }
  table { border-collapse: collapse; width: 100%; table-layout: fixed; }
  th, td { vertical-align: top; }
  ${page.styles || ''}
</style>
</head>
<body><div class="document">${bodyInner}</div></body>
</html>`;
}
