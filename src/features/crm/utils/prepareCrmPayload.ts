export function prepareCrmPayload<T extends object>(value: T): Partial<T> {
  const output: Record<string, unknown> = {};
  for (const [key, raw] of Object.entries(value)) {
    if (raw === undefined || raw === null || raw === '') continue;
    if (Array.isArray(raw)) {
      const list = raw.map((item) => typeof item === 'string' ? item.trim() : item).filter(Boolean);
      if (list.length) output[key] = list;
      continue;
    }
    const prepared = typeof raw === 'string' ? raw.trim() : raw;
    output[key] = key.endsWith('_code') && typeof prepared === 'string' ? prepared.toUpperCase() : prepared;
  }
  return output as Partial<T>;
}
