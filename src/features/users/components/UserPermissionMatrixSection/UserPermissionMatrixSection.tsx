import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { UserPermissionMatrixEditor } from '../UserPermissionMatrixEditor';
import {
  useUpdateUserPermissions,
  useUserPermissions,
} from '../../hooks/useUserPermissionMatrix';
import type { PermissionMatrixGrant } from '../../types/userPermissionMatrix.types';
import { getErrorMessage } from '../../utils/getErrorMessage';

interface UserPermissionMatrixSectionProps {
  userId: string;
}

export function UserPermissionMatrixSection({ userId }: UserPermissionMatrixSectionProps) {
  const assignmentQuery = useUserPermissions(userId);
  const updateUser = useUpdateUserPermissions(userId);
  const [grants, setGrants] = useState<PermissionMatrixGrant[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const initialGrants = useMemo(
    () => assignmentQuery.data?.grants ?? [],
    [assignmentQuery.data?.grants],
  );

  const assignmentUnavailable = assignmentQuery.data?.available === false;
  const pending = updateUser.isPending;
  const canSave = grants.length > 0 && !assignmentQuery.isLoading;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
          <div>
            <CardTitle>Permissions matrix</CardTitle>
            <p className="mt-1 text-xs text-[var(--color-neutral-400)]">
              None / Read / Read & Write per submodule (includes road_freight bridge). The tree is
              filtered to this tenant&apos;s enabled modules. After saving, ask the user to refresh
              or sign in again — API job-type scope and classic JWT bridges (e.g. wms.view,
              menu_jobs_*) load from the new token /auth/me. Grants for disabled modules are
              rejected by the API.
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            disabled={pending || !canSave}
            onClick={async () => {
              setMessage(null);
              try {
                await updateUser.mutateAsync({ grants });
                setMessage(
                  'Permissions saved. Ask the user to refresh or sign in again so JWT / menus update.',
                );
              } catch (err) {
                setMessage(getErrorMessage(err) || 'Failed to save permissions.');
              }
            }}
          >
            {updateUser.isPending ? 'Saving…' : 'Save permissions'}
          </Button>
        </CardHeader>

        <div className="p-4 pt-0 space-y-3">
          {assignmentQuery.data &&
          (assignmentQuery.data.unrestricted_ops != null ||
            assignmentQuery.data.visible_job_types !== undefined) ? (
            <p className="rounded-md border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] px-3 py-2 text-xs text-[var(--color-neutral-600)]">
              {assignmentQuery.data.unrestricted_ops ||
              assignmentQuery.data.visible_job_types === null
                ? 'Ops job-type scope: unrestricted (lists are not filtered by job type).'
                : `Ops job-type scope: ${(assignmentQuery.data.visible_job_types ?? []).join(', ') || 'none'}. Quotations, shipments, enquiries, invoices, and search are filtered to these types.`}
            </p>
          ) : null}
          {message ? (
            <p className="text-sm text-[var(--color-neutral-600)]" role="status">
              {message}
            </p>
          ) : null}

          {assignmentQuery.isError ? (
            <div className="space-y-2">
              <p className="text-sm text-[var(--color-danger-600)]">
                {getErrorMessage(assignmentQuery.error) || 'Failed to load user grants.'}
              </p>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => void assignmentQuery.refetch()}
              >
                Retry
              </Button>
            </div>
          ) : null}

          {assignmentUnavailable ? (
            <p className="text-sm text-[var(--color-neutral-500)]">
              Current grants could not be loaded yet. Selections start unchecked — save calls{' '}
              <code className="text-xs">PUT /users/:id/permission-matrix</code>.
            </p>
          ) : null}

          <UserPermissionMatrixEditor
            initialGrants={initialGrants}
            onChange={setGrants}
            description="Loaded from GET /users/permission-matrix. Saved via PUT /users/:id/permission-matrix (access or see/read/write)."
          />
        </div>
      </Card>
    </div>
  );
}
