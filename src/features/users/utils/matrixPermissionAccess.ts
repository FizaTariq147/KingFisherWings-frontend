/**
 * Resolve access from JWT /auth/me permission keys produced by the Users permission matrix
 * and the matrix→classic bridge (e.g. `wms_module.read` + `wms.view`).
 *
 * Backend naming:
 * - submodule `module`  → `{module}_module.{see|read|write}`  e.g. `wms_module.see`
 * - other submodules    → `{module}_{submodule}.{see|read|write}` e.g. `operations_air_export.write`
 * - classic bridge      → `{module}.view` / `{module}.manage` / action packs
 *
 * No FE catalog of modules is hardcoded — callers pass the module key from the API tree.
 */

export type MatrixAccessLevel = 'see' | 'read' | 'write';

function levelsAtLeast(level: MatrixAccessLevel): MatrixAccessLevel[] {
  if (level === 'write') return ['write'];
  if (level === 'read') return ['read', 'write'];
  return ['see', 'read', 'write'];
}

/** True when JWT/matrix permissions grant the module at the requested level. */
export function hasMatrixModuleAccess(
  permissions: readonly string[],
  moduleKey: string,
  level: MatrixAccessLevel = 'see',
): boolean {
  const mod = moduleKey.trim().toLowerCase();
  if (!mod || permissions.length === 0) return false;

  const accepted = new Set(levelsAtLeast(level));

  for (const raw of permissions) {
    if (typeof raw !== 'string' || !raw.trim()) continue;
    const key = raw.trim().toLowerCase();

    // menu_{module} if backend emits it
    if (key === `menu_${mod}` && (level === 'see' || accepted.has('see'))) return true;

    // {module}.view / {module}.manage (route guards)
    if (key === `${mod}.view` && (level === 'see' || level === 'read')) return true;
    if (key === `${mod}.manage`) return true;
    if (key === `${mod}.read` && (level === 'see' || level === 'read')) return true;
    if (key === `${mod}.write` && level === 'write') return true;
    if (key === `${mod}.see` && level === 'see') return true;

    const dot = key.lastIndexOf('.');
    if (dot <= 0) continue;
    const prefix = key.slice(0, dot);
    const flag = key.slice(dot + 1) as MatrixAccessLevel | 'view' | 'manage';

    const matchesModule =
      prefix === `${mod}_module` ||
      prefix === mod ||
      prefix.startsWith(`${mod}_`);

    if (!matchesModule) continue;

    if (flag === 'manage') return true;
    if (flag === 'view' && (level === 'see' || level === 'read')) return true;
    if (flag === 'see' || flag === 'read' || flag === 'write') {
      if (accepted.has(flag)) return true;
      // Higher grant implies lower for “see” checks
      if (level === 'see') return true;
      if (level === 'read' && (flag === 'read' || flag === 'write')) return true;
    }
  }

  return false;
}

/** Collect module keys that have at least `see` from a flat permission list (for debugging). */
export function matrixModulesFromPermissions(permissions: readonly string[]): string[] {
  const out = new Set<string>();
  for (const raw of permissions) {
    if (typeof raw !== 'string') continue;
    const key = raw.trim().toLowerCase();
    const m = /^([a-z0-9]+)(?:_module)?\.(?:see|read|write|view|manage)$/i.exec(key);
    if (m) out.add(m[1]);
    const m2 = /^([a-z0-9]+)_[a-z0-9_]+\.(?:see|read|write)$/i.exec(key);
    if (m2) out.add(m2[1]);
  }
  return [...out].sort();
}
