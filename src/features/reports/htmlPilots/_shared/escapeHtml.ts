/** Escape untrusted text before inserting into HTML pilot templates. */
export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Join non-empty lines as escaped HTML with `<br/>`. */
export function escapeLines(lines: string[] | undefined): string {
  return (lines || [])
    .map((line) => String(line || '').trim())
    .filter(Boolean)
    .map(escapeHtml)
    .join('<br/>');
}
