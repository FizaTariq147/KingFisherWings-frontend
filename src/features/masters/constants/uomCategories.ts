/** Common UOM categories (API allows free text 2–50 chars). */
export const UOM_CATEGORY_SUGGESTIONS = [
  'Weight',
  'Volume',
  'Length',
  'Count',
  'Area',
  'Time',
  'Temperature',
  'Package',
  'Other',
] as const;

export const UOM_CATEGORY_OPTIONS: Array<{ value: string; label: string }> =
  UOM_CATEGORY_SUGGESTIONS.map((value) => ({ value, label: value }));

export function normalizeUomCategory(input: string): string {
  const trimmed = input.trim().replace(/\s+/g, ' ');
  if (!trimmed) return '';
  const match = UOM_CATEGORY_SUGGESTIONS.find(
    (c) => c.toLowerCase() === trimmed.toLowerCase(),
  );
  return match ?? trimmed;
}

export function isValidUomCategoryValue(value: string): boolean {
  const v = normalizeUomCategory(value);
  if (v.length < 2 || v.length > 50) return false;
  return /[\p{L}]/u.test(v);
}
