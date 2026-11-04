/**
 * Shared ops-department access helpers (Sidebar + Create Job / quotes / shipments).
 * Matrix grants from Tenant Admin are the primary allow-list; visible_job_types
 * further scopes when present, with tolerant token matching.
 */

/** Normalize job-type / department tokens from /auth/me (spaces, hyphens, case). */
export function normalizeJobTypeToken(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_')
    .replace(/_+/g, '_');
}

export function normalizeVisibleJobTypeTokens(
  visibleJobTypes: string[] | null | undefined,
): string[] | null {
  if (visibleJobTypes === null || visibleJobTypes === undefined) return null;
  return visibleJobTypes.map(normalizeJobTypeToken).filter(Boolean);
}

/**
 * Whether a department is allowed by visible_job_types.
 * null/undefined → unrestricted; [] → none (unless caller skips this check).
 */
export function deptAllowedByVisibleJobTypes(
  deptKey: string | undefined,
  visibleJobTypes: string[] | null | undefined,
): boolean {
  if (!deptKey || deptKey === 'nvocc') return true;
  const tokens = normalizeVisibleJobTypeTokens(visibleJobTypes);
  if (tokens === null) return true;
  if (!tokens.length) return false;

  const matches = (needles: string[]) =>
    tokens.some((t) =>
      needles.some((n) => {
        const needle = normalizeJobTypeToken(n);
        return t === needle || t.includes(needle) || needle.includes(t);
      }),
    );

  switch (deptKey) {
    case 'air-export':
      // Do not use bare "air" — that would also unlock Air Import.
      return matches([
        'air_export',
        'airexport',
        'air_export_operations',
        'AIR_EXPORT',
      ]);
    case 'air-import':
      return matches([
        'air_import',
        'airimport',
        'air_import_operations',
        'AIR_IMPORT',
      ]);
    case 'sea-export':
      return matches([
        'sea_export',
        'sea_fcl_export',
        'sea_lcl_export',
        'fcl_export',
        'lcl_export',
        'SEA_FCL_EXPORT',
        'SEA_LCL_EXPORT',
      ]);
    case 'sea-import':
      return matches([
        'sea_import',
        'sea_fcl_import',
        'sea_lcl_import',
        'fcl_import',
        'lcl_import',
        'SEA_FCL_IMPORT',
        'SEA_LCL_IMPORT',
      ]);
    case 'road-freight':
      return matches([
        'road_freight',
        'road',
        'land',
        'courier',
        'ROAD_FREIGHT',
        'LAND',
        'COURIER',
      ]);
    case 'customs-clearance':
      return matches([
        'customs_clearance',
        'customs',
        'custom_clearance',
        'CUSTOMS_CLEARANCE',
      ]);
    default:
      return true;
  }
}

/**
 * Derive department-scope tokens from operations_* matrix keys when
 * visible_job_types is an empty array (common after matrix-only assignment).
 */
export function deriveVisibleTokensFromOpsPermissions(
  permissions: readonly string[],
): string[] {
  const out = new Set<string>();
  for (const raw of permissions) {
    if (typeof raw !== 'string' || !raw.trim()) continue;
    const key = normalizeJobTypeToken(raw);
    const dot = key.lastIndexOf('.');
    if (dot <= 0) continue;
    const prefix = key.slice(0, dot);
    if (!prefix.startsWith('operations_') || prefix === 'operations_module') continue;
    const sub = prefix.slice('operations_'.length);
    if (!sub || sub === 'module') continue;
    out.add(sub);
    if (sub.includes('air_export')) out.add('air_export');
    if (sub.includes('air_import')) out.add('air_import');
    if (sub.includes('customs')) out.add('customs_clearance');
    if (sub.includes('sea_export') || sub.includes('fcl_export') || sub.includes('lcl_export')) {
      out.add('sea_export');
    }
    if (sub.includes('sea_import') || sub.includes('fcl_import') || sub.includes('lcl_import')) {
      out.add('sea_import');
    }
    if (sub.includes('road') || sub === 'land' || sub.includes('courier')) {
      out.add('road_freight');
    }
  }
  return [...out];
}

/**
 * Effective visible_job_types for UI gating (matches BE ops matrix contract).
 * - non-empty → scoped to those types
 * - `null` / `undefined` / `[]` → derive from ops matrix grants when present
 * - no derived tokens + null/undefined → unrestricted (legacy menu_* staff only;
 *   list/dashboard must still gate via isOpsUnrestrictedUser / filterJobTypesByStaffAccess)
 * - no derived tokens + `[]` → locked
 */
export function effectiveVisibleJobTypes(
  visibleJobTypes: string[] | null | undefined,
  permissions: readonly string[],
): string[] | null {
  if (Array.isArray(visibleJobTypes) && visibleJobTypes.length > 0) {
    return visibleJobTypes;
  }
  const derived = deriveVisibleTokensFromOpsPermissions(permissions);
  if (derived.length) return derived;
  if (visibleJobTypes === null || visibleJobTypes === undefined) return null;
  return [];
}

/**
 * List/dashboard scope: write implies see.
 * If matrix left visible empty/mismatched but writable has modes (e.g. Air Export create),
 * staff still list those types so their creates appear in sections + dashboard.
 */
export function effectiveListJobTypes(
  visibleJobTypes: string[] | null | undefined,
  writableJobTypes: string[] | null | undefined,
  permissions: readonly string[],
): string[] | null {
  const visible = effectiveVisibleJobTypes(visibleJobTypes, permissions);
  if (visible === null) return null; // unrestricted
  if (writableJobTypes === null || writableJobTypes === undefined) return visible;
  if (!writableJobTypes.length) return visible;
  return [...new Set([...visible, ...writableJobTypes])];
}
