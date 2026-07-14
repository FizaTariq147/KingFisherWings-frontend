/** Swagger CreateContainerTypeDto.size enum — single API field, do not invent a unit column. */
export const CONTAINER_TYPE_SIZES = [
  'SIZE_20GP',
  'SIZE_40GP',
  'SIZE_40HC',
  'SIZE_45HC',
  'SIZE_20REEFER',
  'SIZE_40REEFER',
  'SIZE_20OT',
  'SIZE_40OT',
  'SIZE_20FR',
  'SIZE_40FR',
  'SIZE_20TANK',
  'SIZE_40TANK',
] as const;

export type ContainerTypeSize = (typeof CONTAINER_TYPE_SIZES)[number];

export const CONTAINER_TYPE_SIZE_OPTIONS: Array<{
  value: ContainerTypeSize;
  label: string;
  teu: number;
  codeHint: string;
}> = [
  { value: 'SIZE_20GP', label: "20' General Purpose (GP)", teu: 1, codeHint: '20GP' },
  { value: 'SIZE_40GP', label: "40' General Purpose (GP)", teu: 2, codeHint: '40GP' },
  { value: 'SIZE_40HC', label: "40' High Cube (HC)", teu: 2, codeHint: '40HC' },
  { value: 'SIZE_45HC', label: "45' High Cube (HC)", teu: 2.25, codeHint: '45HC' },
  { value: 'SIZE_20REEFER', label: "20' Reefer", teu: 1, codeHint: '20RF' },
  { value: 'SIZE_40REEFER', label: "40' Reefer", teu: 2, codeHint: '40RF' },
  { value: 'SIZE_20OT', label: "20' Open Top (OT)", teu: 1, codeHint: '20OT' },
  { value: 'SIZE_40OT', label: "40' Open Top (OT)", teu: 2, codeHint: '40OT' },
  { value: 'SIZE_20FR', label: "20' Flat Rack (FR)", teu: 1, codeHint: '20FR' },
  { value: 'SIZE_40FR', label: "40' Flat Rack (FR)", teu: 2, codeHint: '40FR' },
  { value: 'SIZE_20TANK', label: "20' Tank", teu: 1, codeHint: '20TK' },
  { value: 'SIZE_40TANK', label: "40' Tank", teu: 2, codeHint: '40TK' },
];

export function isContainerTypeSize(value: unknown): value is ContainerTypeSize {
  return (
    typeof value === 'string' &&
    (CONTAINER_TYPE_SIZES as readonly string[]).includes(value)
  );
}

export function getContainerTypeSizeMeta(size: string) {
  return CONTAINER_TYPE_SIZE_OPTIONS.find((o) => o.value === size);
}

/**
 * Normalize a size value: map known labels/hints to the swagger enum when possible,
 * otherwise keep a custom trimmed string (single `size` field).
 */
export function normalizeContainerTypeSize(input: string): string {
  const trimmed = String(input ?? '').trim();
  if (!trimmed) return '';
  if (isContainerTypeSize(trimmed)) return trimmed;

  const lower = trimmed.toLowerCase();
  const upper = trimmed.toUpperCase().replace(/\s+/g, '');

  const byLabel = CONTAINER_TYPE_SIZE_OPTIONS.find((o) => o.label.toLowerCase() === lower);
  if (byLabel) return byLabel.value;

  const byHint = CONTAINER_TYPE_SIZE_OPTIONS.find(
    (o) => o.codeHint.toUpperCase() === upper || o.value.replace(/^SIZE_/, '') === upper,
  );
  if (byHint) return byHint.value;

  // Allow SIZE_FOO custom-style codes
  if (/^SIZE_[A-Z0-9_]+$/i.test(trimmed)) return trimmed.toUpperCase();

  return trimmed;
}

/** Enum pick or a custom written size (1–50 chars, letters/numbers + common punctuation). */
export function isValidContainerTypeSizeValue(value: string): boolean {
  const normalized = normalizeContainerTypeSize(value);
  if (!normalized) return false;
  if (isContainerTypeSize(normalized)) return true;
  if (normalized.length < 1 || normalized.length > 50) return false;
  return /^[A-Za-z0-9][A-Za-z0-9\s_'"./()-]*$/.test(normalized);
}
