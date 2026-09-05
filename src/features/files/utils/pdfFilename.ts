/** Remove a trailing .pdf extension for display/branding references. */
export function stripPdfExtension(name: string): string {
  return name.replace(/\.pdf$/i, '').trim();
}

/** Build a safe PDF filename from a business reference (e.g. quote no). */
export function formatPdfFilename(reference: string, fallback = 'document'): string {
  const cleaned = stripPdfExtension(reference)
    .replace(/[/\\?%*:|"<>]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 180);
  const base = cleaned || fallback;
  return `${base}.pdf`;
}

type FilenameHint = {
  documentNumber?: string;
  title?: string;
};

/** Prefer quote no / invoice no over server-provided names. */
export function resolvePdfDownloadFilename(filename: string, hint?: FilenameHint): string {
  const ref =
    stripPdfExtension(hint?.documentNumber || '') ||
    stripPdfExtension(hint?.title || '') ||
    stripPdfExtension(filename);
  const generic = [
    'quotation',
    'invoice',
    'document',
    'download',
    'statement',
    'vendor-statement',
  ].includes(ref.toLowerCase());
  if (ref && !generic) return formatPdfFilename(ref, stripPdfExtension(filename) || 'document');
  return formatPdfFilename(filename, 'document');
}
