const ALLOWED = new Set([
  'account_code',
  'account_name',
  'account_name_ar',
  'account_group',
  'account_type',
  'account_sub_type',
  'company_id',
  'parent_id',
  'is_header',
  'is_postable',
  'is_bank_account',
  'is_cash_account',
  'currency_code',
  'opening_balance',
  'opening_balance_type',
  'allow_manual_entry',
  'is_active',
  'sort_order',
  'notes',
]);

export function prepareChartOfAccountPayload<T extends Record<string, unknown>>(dto: T): T {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(dto)) {
    if (!ALLOWED.has(key)) continue;
    if (value === undefined || value === null) continue;
    if (typeof value === 'string' && value.trim() === '') continue;
    if (typeof value === 'number' && Number.isNaN(value)) continue;
    if (typeof value === 'string') {
      out[key] =
        key === 'account_code' || key === 'currency_code'
          ? value.trim().toUpperCase()
          : value.trim();
      continue;
    }
    out[key] = value;
  }

  if (!out.account_code || typeof out.account_code !== 'string') {
    throw new Error('Account code is required.');
  }
  if (!out.account_name || typeof out.account_name !== 'string') {
    throw new Error('Account name is required.');
  }
  if (!out.account_group) throw new Error('Account group is required.');
  if (!out.account_type) throw new Error('Account type is required.');

  return out as T;
}

export function prepareChartOfAccountUpdatePayload<T extends Record<string, unknown>>(
  dto: T,
): T {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(dto)) {
    if (!ALLOWED.has(key)) continue;
    if (key === 'parent_id' && (value === '' || value === null || value === undefined)) {
      out.parent_id = null;
      continue;
    }
    if (value === undefined) continue;
    if (value === null) continue;
    if (typeof value === 'string' && value.trim() === '') continue;
    if (typeof value === 'number' && Number.isNaN(value)) continue;
    if (typeof value === 'string') {
      out[key] =
        key === 'account_code' || key === 'currency_code'
          ? value.trim().toUpperCase()
          : value.trim();
      continue;
    }
    out[key] = value;
  }
  return out as T;
}
