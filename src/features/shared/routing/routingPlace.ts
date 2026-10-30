/** Parse master place labels like "USNYC — New York" into code + name. */
export function parsePlaceLabel(label: string): { code?: string; name?: string } {
  const trimmed = label.trim();
  if (!trimmed) return {};
  const m = trimmed.match(/^([A-Za-z0-9]{2,12})\s*[—\-–]\s*(.+)$/);
  if (m) {
    return { code: m[1].trim().toUpperCase(), name: m[2].trim() };
  }
  // Bare code (short alphanumeric) vs free-text name
  if (/^[A-Za-z0-9]{2,12}$/.test(trimmed)) {
    return { code: trimmed.toUpperCase() };
  }
  return { name: trimmed };
}

export function pickRoutingPlaceDisplay(row: Record<string, unknown>, side: 'origin' | 'dest'): string {
  const nameKey = side === 'origin' ? 'origin_port_name' : 'dest_port_name';
  const codeKey = side === 'origin' ? 'origin_port_code' : 'dest_port_code';
  const nestedKey = side === 'origin' ? 'origin_port' : 'dest_port';
  const name = String(row[nameKey] ?? '').trim();
  const code = String(row[codeKey] ?? '').trim();
  if (name && code && !name.toUpperCase().includes(code.toUpperCase())) {
    return `${code} — ${name}`;
  }
  if (name || code) return name || code;
  const nested = row[nestedKey];
  if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
    const n = nested as Record<string, unknown>;
    const nName = String(n.name ?? n.port_name ?? n.label ?? '').trim();
    const nCode = String(n.code ?? n.port_code ?? n.un_locode ?? '').trim();
    if (nName && nCode && !nName.toUpperCase().includes(nCode.toUpperCase())) {
      return `${nCode} — ${nName}`;
    }
    return nName || nCode;
  }
  return '';
}

export function pickCarrierDisplay(row: Record<string, unknown>): string {
  const name = String(row.carrier_name ?? '').trim();
  if (name) return name;
  const nested = row.carrier;
  if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
    const n = nested as Record<string, unknown>;
    return String(n.name ?? n.label ?? n.code ?? '').trim();
  }
  return '';
}
