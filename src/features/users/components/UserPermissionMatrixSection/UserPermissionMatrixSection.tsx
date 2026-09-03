import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  usePermissionMatrix,
  useRoles,
  useUpdateRolePermissions,
  useUpdateUserPermissions,
  useUserPermissions,
} from '../../hooks/useUserPermissionMatrix';
import type { PermissionCatalogItem, PermissionModuleGroup } from '../../types/userPermissionMatrix.types';
import { getErrorMessage } from '../../utils/getErrorMessage';

interface UserPermissionMatrixSectionProps {
  userId: string;
}

const PRIMARY_ACTIONS = ['view', 'create', 'update'] as const;

function itemSelected(item: PermissionCatalogItem, ids: Set<string>, keys: Set<string>): boolean {
  if (item.id && ids.has(item.id)) return true;
  return keys.has(item.key);
}

function extraActions(modules: PermissionModuleGroup[]): string[] {
  const set = new Set<string>();
  for (const group of modules) {
    for (const item of group.items) {
      if (!(PRIMARY_ACTIONS as readonly string[]).includes(item.action)) {
        set.add(item.action);
      }
    }
  }
  return [...set].sort();
}

function formatAction(action: string): string {
  return action.replace(/[_-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function UserPermissionMatrixSection({ userId }: UserPermissionMatrixSectionProps) {
  const matrixQuery = usePermissionMatrix();
  const assignmentQuery = useUserPermissions(userId);
  const rolesQuery = useRoles();
  const updateUser = useUpdateUserPermissions(userId);
  const updateRole = useUpdateRolePermissions();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState<string | null>(null);
  const [roleId, setRoleId] = useState('');

  useEffect(() => {
    const assignment = assignmentQuery.data;
    if (!assignment) return;
    setSelectedIds(new Set(assignment.permission_ids));
    setSelectedKeys(new Set(assignment.permission_keys));
  }, [assignmentQuery.data]);

  const modules = matrixQuery.data?.modules ?? [];
  const otherActions = useMemo(() => extraActions(modules), [modules]);
  const columns = [...PRIMARY_ACTIONS, ...otherActions];

  const toggleItem = (item: PermissionCatalogItem, checked: boolean) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (checked) next.add(item.key);
      else next.delete(item.key);
      return next;
    });
    if (item.id) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (checked) next.add(item.id!);
        else next.delete(item.id!);
        return next;
      });
    }
  };

  const saveDto = () => ({
    permission_ids: [...selectedIds],
    permission_keys: [...selectedKeys],
  });

  const matrixUnavailable = matrixQuery.data?.available === false;
  const assignmentUnavailable = assignmentQuery.data?.available === false;
  const loading = matrixQuery.isLoading || assignmentQuery.isLoading;
  const loadError = matrixQuery.isError || assignmentQuery.isError;
  const pending = updateUser.isPending || updateRole.isPending;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
          <div>
            <CardTitle>Permissions matrix</CardTitle>
            <p className="mt-1 text-xs text-[var(--color-neutral-400)]">
              Module access for this user (view / create / update). Staff functional flags remain on
              the Edit user form.
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            disabled={pending || loading || matrixUnavailable || modules.length === 0}
            onClick={async () => {
              setMessage(null);
              try {
                await updateUser.mutateAsync(saveDto());
                setMessage('Permissions saved.');
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
              Permission matrix is not available yet (GET /users/permission-matrix). You can keep using
              functional flags on Edit user until the backend ships.
            </p>
          ) : modules.length === 0 ? (
            <p className="text-sm text-[var(--color-neutral-500)]">
              No permissions were returned for this tenant.
            </p>
          ) : (
            <>
              {assignmentUnavailable && (
                <p className="text-sm text-[var(--color-neutral-500)]">
                  Current user permissions could not be loaded (GET /users/:id/permissions is not
                  available yet). Selections start empty — save will call PUT when the API exists.
                </p>
              )}
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[32rem]">
                  <thead>
                    <tr className="text-left text-xs text-[var(--color-neutral-500)] border-b border-[var(--color-neutral-200)]">
                      <th className="py-2 pr-3 font-medium">Module</th>
                      {columns.map((action) => (
                        <th key={action} className="py-2 pr-3 font-medium">
                          {formatAction(action)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {modules.map((group) => (
                      <tr key={group.module} className="border-b border-[var(--color-neutral-100)]">
                        <td className="py-2 pr-3 font-medium text-[var(--color-neutral-800)]">
                          {group.label}
                        </td>
                        {columns.map((action) => {
                          const item = group.items.find((entry) => entry.action === action);
                          if (!item) {
                            return (
                              <td key={action} className="py-2 pr-3 text-[var(--color-neutral-300)]">
                                —
                              </td>
                            );
                          }
                          const checked = itemSelected(item, selectedIds, selectedKeys);
                          const inputId = `${group.module}-${action}`;
                          return (
                            <td key={action} className="py-2 pr-3">
                              <label htmlFor={inputId} className="inline-flex items-center gap-2 cursor-pointer">
                                <input
                                  id={inputId}
                                  type="checkbox"
                                  className="h-4 w-4 rounded border-[var(--color-neutral-300)] text-[var(--color-primary-500)] focus:ring-[var(--color-primary-500)]"
                                  checked={checked}
                                  onChange={(e) => toggleItem(item, e.target.checked)}
                                />
                                <span className="sr-only">{group.label} {formatAction(action)}</span>
                              </label>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </Card>

      {rolesQuery.data?.available && rolesQuery.data.roles.length > 0 && (
        <Card>
          <CardHeader className="mb-0 pb-3">
            <CardTitle>Role permissions</CardTitle>
          </CardHeader>
          <div className="p-4 pt-0 space-y-3">
            <p className="text-xs text-[var(--color-neutral-400)]">
              Optional: apply the current checkbox selection to a role (PUT /roles/:id/permissions).
            </p>
            <div className="flex flex-wrap items-end gap-3">
              <label className="flex flex-col gap-1 min-w-[12rem]">
                <span className="text-xs font-medium text-[var(--color-neutral-600)]">Role</span>
                <select
                  className="h-9 rounded-md border border-[var(--color-neutral-200)] bg-white px-3 text-sm"
                  value={roleId}
                  onChange={(e) => setRoleId(e.target.value)}
                >
                  <option value="">Select a role</option>
                  {rolesQuery.data.roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </label>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={!roleId || pending || modules.length === 0}
                onClick={async () => {
                  setMessage(null);
                  try {
                    await updateRole.mutateAsync({ roleId, dto: saveDto() });
                    setMessage('Role permissions saved.');
                  } catch (err) {
                    setMessage(getErrorMessage(err) || 'Failed to save role permissions.');
                  }
                }}
              >
                {updateRole.isPending ? 'Saving role…' : 'Save to role'}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
