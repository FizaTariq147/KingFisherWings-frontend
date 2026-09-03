import type { PortalCargoPackageDto } from '../types/portalQuotations.types';

/** Local draft row for the Request a quote package editor (cm + kg). */
export interface PortalPackageDraft {
  length_cm: string;
  width_cm: string;
  height_cm: string;
  gross_weight_kg: string;
  pieces: string;
}

export function emptyPortalPackageDraft(): PortalPackageDraft {
  return {
    length_cm: '',
    width_cm: '',
    height_cm: '',
    gross_weight_kg: '',
    pieces: '1',
  };
}

function parsePositive(value: string, min: number): number | undefined {
  if (value.trim() === '') return undefined;
  const n = Number(value);
  if (!Number.isFinite(n) || n < min) return undefined;
  return n;
}

/**
 * CBM from cm dims: (L × W × H × pieces) / 1_000_000.
 * Returns undefined until L, W, and H are all valid.
 */
export function calcPackageCbmFromCm(
  lengthCm: number | undefined,
  widthCm: number | undefined,
  heightCm: number | undefined,
  pieces = 1,
): number | undefined {
  if (lengthCm == null || widthCm == null || heightCm == null) return undefined;
  const pcs = Number.isFinite(pieces) && pieces >= 1 ? pieces : 1;
  const cbm = (lengthCm * widthCm * heightCm * pcs) / 1_000_000;
  return Number.isFinite(cbm) ? cbm : undefined;
}

export function calcPackageDraftCbm(draft: PortalPackageDraft): number | undefined {
  return calcPackageCbmFromCm(
    parsePositive(draft.length_cm, 0.01),
    parsePositive(draft.width_cm, 0.01),
    parsePositive(draft.height_cm, 0.01),
    parsePositive(draft.pieces, 1) ?? 1,
  );
}

export function sumPackageDraftCbm(drafts: PortalPackageDraft[]): number | undefined {
  let total = 0;
  let any = false;
  for (const draft of drafts) {
    const cbm = calcPackageDraftCbm(draft);
    if (cbm == null) continue;
    total += cbm;
    any = true;
  }
  return any ? roundCbm(total) : undefined;
}

export function sumPackageDraftWeightKg(drafts: PortalPackageDraft[]): number | undefined {
  let total = 0;
  let any = false;
  for (const draft of drafts) {
    const weight = parsePositive(draft.gross_weight_kg, 0);
    if (weight == null) continue;
    // Weight is the total for the package line as entered.
    total += weight;
    any = true;
  }
  return any ? roundWeight(total) : undefined;
}

export function sumPackageDraftPieces(drafts: PortalPackageDraft[]): number | undefined {
  let total = 0;
  let any = false;
  for (const draft of drafts) {
    const pieces = parsePositive(draft.pieces, 1);
    if (pieces == null) continue;
    total += pieces;
    any = true;
  }
  return any ? total : undefined;
}

export function roundCbm(value: number): number {
  return Math.round(value * 1000) / 1000;
}

function roundWeight(value: number): number {
  return Math.round(value * 1000) / 1000;
}

export function formatCbmDisplay(value: number | undefined): string {
  if (value == null || !Number.isFinite(value)) return '—';
  return roundCbm(value).toFixed(3);
}

/**
 * Map UI drafts → CargoPackageDto.
 * `gross_weight_kg` is required; dims optional but must be a complete L×W×H set when present.
 */
export function buildPortalEstimatePackages(
  drafts: PortalPackageDraft[],
): { packages: PortalCargoPackageDto[]; error?: string } {
  const packages: PortalCargoPackageDto[] = [];

  for (let i = 0; i < drafts.length; i += 1) {
    const draft = drafts[i];
    const weight = parsePositive(draft.gross_weight_kg, 0);
    if (weight == null) {
      return {
        packages: [],
        error: `Package ${i + 1}: enter gross weight (kg).`,
      };
    }

    const lengthCm = parsePositive(draft.length_cm, 0.01);
    const widthCm = parsePositive(draft.width_cm, 0.01);
    const heightCm = parsePositive(draft.height_cm, 0.01);
    const hasAnyDim =
      draft.length_cm.trim() !== '' ||
      draft.width_cm.trim() !== '' ||
      draft.height_cm.trim() !== '';

    if (hasAnyDim && (lengthCm == null || widthCm == null || heightCm == null)) {
      return {
        packages: [],
        error: `Package ${i + 1}: enter complete L × W × H in cm, or leave all blank.`,
      };
    }

    const pieces = parsePositive(draft.pieces, 1);
    const pkg: PortalCargoPackageDto = {
      gross_weight_kg: weight,
      ...(pieces != null ? { pieces } : { pieces: 1 }),
    };
    if (lengthCm != null && widthCm != null && heightCm != null) {
      pkg.length_cm = lengthCm;
      pkg.width_cm = widthCm;
      pkg.height_cm = heightCm;
    }
    packages.push(pkg);
  }

  if (!packages.length) {
    return { packages: [], error: 'Add at least one package with gross weight for estimate.' };
  }

  return { packages };
}
