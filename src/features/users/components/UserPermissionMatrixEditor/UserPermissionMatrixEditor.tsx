import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { usePermissionMatrix } from '../../hooks/useUserPermissionMatrix';
import type {
  PermissionAccessLevel,
  PermissionMatrixGrant,
  PermissionModuleNode,
} from '../../types/userPermissionMatrix.types';
import {
  applyGrantsToMatrix,
  grantsFromMatrixSelection,
} from '../../utils/normalizeUserPermissionMatrix';
import { accessLabel, setSubmoduleAccess, submoduleAccess } from '../../utils/permissionAccess';
import { getErrorMessage } from '../../utils/getErrorMessage';

const ACCESS_OPTIONS: PermissionAccessLevel[] = ['none', 'read', 'write'];

const EMPTY_GRANTS: PermissionMatrixGrant[] = [];

export interface UserPermissionMatrixEditorProps {
  /** Existing grants (e.g. GET /users/:id/permission-matrix or role presets). Empty = all None. */
  initialGrants?: PermissionMatrixGrant[];
  /** Fired whenever the selection changes (create wizard / controlled parent). */
  onChange?: (grants: PermissionMatrixGrant[]) => void;
  /** Compact hint for create vs edit. */
  description?: string;
  className?: string;
}

/**
 * Renders the tenant permission tree from GET /users/permission-matrix.
 * Per submodule: None / Read / Read & Write (`access`).
 */
export function UserPermissionMatrixEditor({
  initialGrants = EMPTY_GRANTS,
  onChange,
  description = 'Module → submodule → None / Read / Read & Write. Loaded from GET /users/permission-matrix.',
  className,
}: UserPermissionMatrixEditorProps) {
  const matrixQuery = usePermissionMatrix();
  const [modules, setModules] = useState<PermissionModuleNode[]>([]);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const grantsKey = useMemo(() => JSON.stringify(initialGrants), [initialGrants]);

  useEffect(() => {
    const tree = matrixQuery.data?.modules ?? [];
    if (!tree.length) {
      setModules([]);
      onChangeRef.current?.([]);
      return;
    }
    let grants: PermissionMatrixGrant[] = EMPTY_GRANTS;
    try {
      grants = JSON.parse(grantsKey) as PermissionMatrixGrant[];
      if (!Array.isArray(grants)) grants = EMPTY_GRANTS;
    } catch {
      grants = EMPTY_GRANTS;
    }
    const next = applyGrantsToMatrix(tree, grants);
    setModules(next);
    onChangeRef.current?.(grantsFromMatrixSelection(next));
  }, [matrixQuery.data, grantsKey]);

  const rowCount = useMemo(
    () => modules.reduce((sum, mod) => sum + mod.submodules.length, 0),
    [modules],
  );

  const setAccess = (
    moduleKey: string,
    submoduleKey: string,
    access: PermissionAccessLevel,
  ) => {
    setModules((prev) => {
      const next = setSubmoduleAccess(prev, moduleKey, submoduleKey, access);
      onChangeRef.current?.(grantsFromMatrixSelection(next));
      return next;
    });
  };

  const matrixUnavailable = matrixQuery.data?.available === false;
  const loading = matrixQuery.isLoading;
  const loadError = matrixQuery.isError;

  return (
    <div className={className ?? 'space-y-3'}>
      {description ? (
        <p className="text-xs text-[var(--color-neutral-500)]">{description}</p>
      ) : null}

      {loading ? (
        <p className="text-sm text-[var(--color-neutral-400)]">Loading permission matrix…</p>
      ) : loadError ? (
        <div className="space-y-2">
          <p className="text-sm text-[var(--color-danger-600)]">
            {getErrorMessage(matrixQuery.error) || 'Failed to load permission matrix.'}
          </p>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => void matrixQuery.refetch()}
          >
            Retry
          </Button>
        </div>
      ) : matrixUnavailable ? (
        <p className="text-sm text-[var(--color-neutral-500)]">
          Permission matrix is not available yet (GET /users/permission-matrix). Sync permissions on
          the backend, then refresh.
        </p>
      ) : rowCount === 0 ? (
        <p className="text-sm text-[var(--color-neutral-500)]">
          No modules/submodules were returned for this tenant.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[40rem]">
            <thead>
              <tr className="text-left text-xs text-[var(--color-neutral-500)] border-b border-[var(--color-neutral-200)]">
                <th className="py-2 pr-3 font-medium">Module</th>
                <th className="py-2 pr-3 font-medium">Submodule</th>
                <th className="py-2 pr-3 font-medium">Access</th>
              </tr>
            </thead>
            <tbody>
              {modules.map((mod) =>
                mod.submodules.map((sub, index) => {
                  const inputBase = `${mod.module}-${sub.submodule}`;
                  const current = submoduleAccess(sub);
                  return (
                    <tr key={inputBase} className="border-b border-[var(--color-neutral-100)]">
                      <td className="py-2 pr-3 font-medium text-[var(--color-neutral-800)]">
                        {index === 0 ? mod.label : ''}
                      </td>
                      <td className="py-2 pr-3 text-[var(--color-neutral-700)]">{sub.label}</td>
                      <td className="py-2 pr-3">
                        <div
                          className="inline-flex flex-wrap gap-3"
                          role="radiogroup"
                          aria-label={`${mod.label} ${sub.label} access`}
                        >
                          {ACCESS_OPTIONS.map((opt) => {
                            const inputId = `${inputBase}-${opt}`;
                            return (
                              <label
                                key={opt}
                                htmlFor={inputId}
                                className="inline-flex items-center gap-1.5 cursor-pointer text-xs text-[var(--color-neutral-700)]"
                              >
                                <input
                                  id={inputId}
                                  type="radio"
                                  name={inputBase}
                                  className="h-3.5 w-3.5 border-[var(--color-neutral-300)] text-[var(--color-primary-500)] focus:ring-[var(--color-primary-500)]"
                                  checked={current === opt}
                                  onChange={() => setAccess(mod.module, sub.submodule, opt)}
                                />
                                {accessLabel(opt)}
                              </label>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  );
                }),
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
