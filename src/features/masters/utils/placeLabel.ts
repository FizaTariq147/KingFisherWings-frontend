import type { MasterRecord } from '../types/master.types';

/** Display label for ports / airports (code — name). */
export function masterPlaceLabel(record: MasterRecord | Record<string, unknown>): string {
  const code = [
    record.code,
    record.un_locode,
    record.unLocode,
    record.port_code,
    record.iata_code,
    record.iataCode,
    record.icao_code,
  ]
    .map((v) => (typeof v === 'string' ? v.trim() : ''))
    .find(Boolean);
  const name = [record.name, record.city, record.port_name, record.airport_name]
    .map((v) => (typeof v === 'string' ? v.trim() : ''))
    .find(Boolean);
  if (code && name && code.toLowerCase() !== name.toLowerCase()) return `${code} — ${name}`;
  return code || name || String(record.id ?? '');
}

export function masterPlacesToSelectOptions(
  rows: Array<MasterRecord | Record<string, unknown>>,
): Array<{ value: string; label: string }> {
  const out: Array<{ value: string; label: string }> = [];
  for (const row of rows) {
    const id = typeof row.id === 'string' ? row.id : '';
    if (!id) continue;
    const label = masterPlaceLabel(row);
    if (!label) continue;
    out.push({ value: id, label });
  }
  return out.sort((a, b) => a.label.localeCompare(b.label));
}
