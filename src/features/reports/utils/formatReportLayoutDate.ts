/** Display dates on FRESA-style report layouts (e.g. 28-JAN-2026). */
export function formatReportLayoutDate(value?: string | null): string | undefined {
  const raw = String(value ?? '').trim();
  if (!raw) return undefined;
  if (/^\d{2}-[A-Z]{3}-\d{2,4}$/i.test(raw)) return raw.toUpperCase();
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) {
    const d = new Date(`${iso[1]}-${iso[2]}-${iso[3]}T12:00:00Z`);
    if (!Number.isNaN(d.getTime())) {
      return d
        .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        .replace(/ /g, '-')
        .toUpperCase();
    }
  }
  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed
      .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      .replace(/ /g, '-')
      .toUpperCase();
  }
  return raw;
}
