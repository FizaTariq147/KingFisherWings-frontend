import type { HawbOfficialLayoutConfig, HawbOfficialVariant } from '../hawbOfficial.types';
import { HAWB_DRAFT_LAYOUT } from './hawbDraft.layout';
import { HAWB_DRAFT1_LAYOUT } from './hawbDraft1.layout';
import { HAWB_DRAFT2_LAYOUT } from './hawbDraft2.layout';
import { HAWB_ORIGINAL1_LAYOUT } from './hawbOriginal1.layout';
import { HAWB_ORIGINAL2_LAYOUT } from './hawbOriginal2.layout';
import { OFFICIAL_HAWB_FORMAT_CODES } from '../../../../utils/officialFormatGovernance';

export const HAWB_OFFICIAL_LAYOUTS: readonly HawbOfficialLayoutConfig[] = [
  HAWB_DRAFT_LAYOUT,
  HAWB_DRAFT1_LAYOUT,
  HAWB_DRAFT2_LAYOUT,
  HAWB_ORIGINAL1_LAYOUT,
  HAWB_ORIGINAL2_LAYOUT,
] as const;

const BY_CODE = new Map(HAWB_OFFICIAL_LAYOUTS.map((l) => [l.code, l]));
const BY_VARIANT = new Map(HAWB_OFFICIAL_LAYOUTS.map((l) => [l.variant, l]));

export function getHawbOfficialLayout(code: string): HawbOfficialLayoutConfig | undefined {
  return BY_CODE.get(code.trim().toUpperCase());
}

export function getHawbOfficialLayoutByVariant(
  variant: HawbOfficialVariant,
): HawbOfficialLayoutConfig {
  const hit = BY_VARIANT.get(variant);
  if (!hit) throw new Error(`Unknown HAWB official variant: ${variant}`);
  return hit;
}

export function isHawbOfficialNativeCode(code: string): boolean {
  return BY_CODE.has(code.trim().toUpperCase());
}

/** Sanity: layouts cover exactly the five governance codes. */
export function hawbOfficialLayoutCodesMatchGovernance(): boolean {
  const codes = HAWB_OFFICIAL_LAYOUTS.map((l) => l.code).sort();
  const gov = [...OFFICIAL_HAWB_FORMAT_CODES].sort();
  return codes.length === 5 && codes.every((c, i) => c === gov[i]);
}

export {
  HAWB_DRAFT_LAYOUT,
  HAWB_DRAFT1_LAYOUT,
  HAWB_DRAFT2_LAYOUT,
  HAWB_ORIGINAL1_LAYOUT,
  HAWB_ORIGINAL2_LAYOUT,
};
