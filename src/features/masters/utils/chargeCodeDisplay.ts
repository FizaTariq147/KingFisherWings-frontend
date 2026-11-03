import type { MasterRecord } from '../types/master.types';

/** Human narrative for Description fields — never the charge code alone. */
export function chargeCodeNarrative(
  record: Pick<MasterRecord, 'description' | 'name' | 'code'> | null | undefined,
): string {
  if (!record) return '';
  const description = String(record.description ?? '').trim();
  if (description) return description;
  const name = String(record.name ?? '').trim();
  if (name) return name;
  return '';
}

/** Dropdown label: prefer description/name, keep code in parentheses when different. */
export function chargeCodeOptionLabel(
  record: Pick<MasterRecord, 'description' | 'name' | 'code' | 'id'>,
): string {
  const code = String(record.code ?? '').trim();
  const narrative = chargeCodeNarrative(record);
  if (narrative) {
    return code && narrative !== code ? `${narrative} (${code})` : narrative;
  }
  return code || String(record.id ?? '');
}

export type ChargeCodeOption = {
  id: string;
  code: string;
  label: string;
  description: string;
};

export function mapChargeCodeOptions(
  records: readonly MasterRecord[],
  isUuid: (value: string) => boolean,
): ChargeCodeOption[] {
  const out: ChargeCodeOption[] = [];
  for (const c of records) {
    const id = String(c.id ?? '');
    if (!isUuid(id)) continue;
    out.push({
      id,
      code: String(c.code ?? '').trim(),
      label: chargeCodeOptionLabel(c),
      description: chargeCodeNarrative(c),
    });
  }
  return out;
}
