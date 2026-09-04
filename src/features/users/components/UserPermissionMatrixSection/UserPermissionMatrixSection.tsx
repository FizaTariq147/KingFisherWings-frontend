import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  usePermissionMatrix,
  useUpdateUserPermissions,
  useUserPermissions,
} from '../../hooks/useUserPermissionMatrix';
import type { PermissionModuleNode } from '../../types/userPermissionMatrix.types';
import {
  applyGrantsToMatrix,
  grantsFromMatrixSelection,
} from '../../utils/normalizeUserPermissionMatrix';
import { getErrorMessage } from '../../utils/getErrorMessage';

interface UserPermissionMatrixSectionProps {
  userId: string;
}

const FLAG_COLUMNS = [
  { key: 'see' as const, label: 'See' },
  { key: 'read' as const, label: 'Read' },
  { key: 'write' as const, label: 'Write' },
];

export function UserPermissionMatrixSection({ userId }: UserPermissionMatrixSectionProps) {
  const matrixQuery = usePermissionMatrix();
  const assignmentQuery = useUserPermissions(userId);
  const updateUser = useUpdateUserPermissions(userId);

  const [modules, setModules] = useState<PermissionModuleNode[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const tree = matrixQuery.data?.modules ?? [];
    const grants = assignmentQuery.data?.grants ?? [];
    if (!tree.length) {
      setModules([]);
      return;
    }
    setModules(applyGrantsToMatrix(tree, grants));
  }, [matrixQuery.data, assignmentQuery.data]);

  const rowCount = useMemo(
    () => modules.reduce((sum, mod) => sum + mod.submodules.length, 0),
    [modules],
  );

  const setFlag = (
    moduleKey: string,
    submoduleKey: string,
    flag: 'see' | 'read' | 'write',
    checked: boolean,
  ) => {
    setModules((prev) =>
      prev.map((mod) => {
        if (mod.module !== moduleKey) return mod;
        return {
          ...mod,
          submodules: mod.submodules.map((sub) =>
            sub.submodule === submoduleKey ? { ...sub, [flag]: checked } : sub,
          ),
        };
      }),
    );
  };

  const matrixUnavailable = matrixQuery.data?.available === false;
  const assignmentUnavailable = assignmentQuery.data?.available === false;
  const loading = matrixQuery.isLoading || assignmentQuery.isLoading;
  const loadError = matrixQuery.isError || assignmentQuery.isError;
  const pending = updateUser.isPending;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
          <div>
            <CardTitle>Permissions matrix</CardTitle>
            <p className="mt-1 text-xs text-[var(--color-neutral-400)]">
              Module → submodule → see / read / write. After saving, the user must log in again so
              the JWT picks up new grants. Operations submodule grants limit job list/create to
              those job types.
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            disabled={pending || loading || matrixUnavailable || rowCount === 0}
            onClick={async () => {
              setMessage(null);
              try {
                await updateUser.mutateAsync({ grants: grantsFromMatrixSelection(modules) });
                setMessage('Permissions saved. Ask the user to sign in again to refresh JWT.');
              } catch (err) {
                setMessage(getErrorMessage(err) || 'Failed to save permissions.');
              }
            }}
          >
            {updateUser.isPending ? 'Saving…' : 'Save permissions'}
          </Button>
        </CardHeader>

        <div className="p-4 pt-0 space-y-3">
          {message && (
            <p className="text-sm text-[var(--color-neutral-600)]" role="status">
              {message}
            </p>
          )}

          {loading ? (
            <p className="text-sm text-[var(--color-neutral-400)]">Loading permission matrix…</p>
          ) : loadError ? (
            <div className="space-y-2">
              <p className="text-sm text-[var(--color-danger-600)]">
                {getErrorMessage(matrixQuery.error || assignmentQuery.error) ||
                  'Failed to load permissions.'}
              </p>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => {
                  void matrixQuery.refetch();
                  void assignmentQuery.refetch();
                }}
              >
                Retry
              </Button>
            </div>
          ) : matrixUnavailable ? (
            <p className="text-sm text-[var(--color-neutral-500)]">
              Permission matrix is not available yet (GET /users/permission-matrix). Apply migrations
              and sync permissions on the backend, then refresh.
            </p>
          ) : rowCount === 0 ? (
            <p className="text-sm text-[var(--color-neutral-500)]">
              No modules/submodules were returned for this tenant.
            </p>
          ) : (
            <>
              {assignmentUnavailable && (
                <p className="text-sm text-[var(--color-neutral-500)]">
                  Current grants could not be loaded yet. Selections start unchecked — save calls{' '}
                  <code className="text-xs">PUT /users/:id/permission-matrix</code>.
                </p>
              )}
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[36rem]">
                  <thead>
                    <tr className="text-left text-xs text-[var(--color-neutral-500)] border-b border-[var(--color-neutral-200)]">
                      <th className="py-2 pr-3 font-medium">Module</th>
                      <th className="py-2 pr-3 font-medium">Submodule</th>
                      {FLAG_COLUMNS.map((col) => (
                        <th key={col.key} className="py-2 pr-3 font-medium">
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {modules.map((mod) =>
                      mod.submodules.map((sub, index) => {
                        const inputBase = `${mod.module}-${sub.submodule}`;
                        return (
                          <tr
                            key={inputBase}
                            className="border-b border-[var(--color-neutral-100)]"
                          >
                            <td className="py-2 pr-3 font-medium text-[var(--color-neutral-800)]">
                              {index === 0 ? mod.label : ''}
                            </td>
                            <td className="py-2 pr-3 text-[var(--color-neutral-700)]">
                              {sub.label}
                            </td>
                            {FLAG_COLUMNS.map((col) => {
                              const inputId = `${inputBase}-${col.key}`;
                              return (
                                <td key={col.key} className="py-2 pr-3">
                                  <label
                                    htmlFor={inputId}
                                    className="inline-flex items-center gap-2 cursor-pointer"
                                  >
                                    <input
                                      id={inputId}
                                      type="checkbox"
                                      className="h-4 w-4 rounded border-[var(--color-neutral-300)] text-[var(--color-primary-500)] focus:ring-[var(--color-primary-500)]"
                                      checked={sub[col.key]}
                                      onChange={(e) =>
                                        setFlag(mod.module, sub.submodule, col.key, e.target.checked)
                                      }
                                    />
                                    <span className="sr-only">
                                      {mod.label} {sub.label} {col.label}
                                    </span>
                                  </label>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      }),
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
