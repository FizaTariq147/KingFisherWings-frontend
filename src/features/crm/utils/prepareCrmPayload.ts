export function prepareCrmPayload<T extends object>(value: T): Partial<T> {
  const output: Record<string, unknown> = {};
  for (const [key, raw] of Object.entries(value)) {
    if (raw === undefined || raw === null || raw === '') continue;
    if (typeof raw === 'number' && Number.isNaN(raw)) continue;
    if (Array.isArray(raw)) {
      if (key === 'charges') {
        const lines = raw
          .map((item) => {
            if (!item || typeof item !== 'object') return null;
            const line = prepareCrmPayload(item as object);
            if (!line.description || line.amount === undefined || line.amount === '') return null;
            return line;
          })
          .filter(Boolean);
        if (lines.length) output[key] = lines;
        continue;
      }
      const list = raw
        .map((item) => (typeof item === 'string' ? item.trim() : item))
        .filter(Boolean);
      if (list.length) output[key] = list;
      continue;
    }
    const prepared = typeof raw === 'string' ? raw.trim() : raw;
    output[key] =
      key.endsWith('_code') && typeof prepared === 'string'
        ? prepared.toUpperCase()
        : prepared;
  }
  return output as Partial<T>;
}
