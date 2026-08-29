import { useNvoccPermissions } from '../hooks/useNvoccPermissions';

export function NvoccPermissionNotice() {
  const { missingManage, manageHint, isTenantAdmin } = useNvoccPermissions();

  if (!missingManage) return null;

  return (
    <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
      <p className="font-medium">NVOCC write access not in your login token</p>
      <p className="mt-1">{manageHint}</p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-xs">
        {isTenantAdmin ? (
          <>
            <li>Super Admin → Tenants → your tenant → <strong>Sync permissions</strong></li>
            <li>Sign out completely, then sign back in (Staff or Tenant Admin)</li>
          </>
        ) : (
          <>
            <li>Ask your Tenant Admin or Super Admin to sync permissions and assign <code>nvocc.manage</code></li>
            <li>Ensure <strong>Operations</strong> functional flag is enabled on your user profile</li>
            <li>Sign out and sign back in after permissions change</li>
          </>
        )}
      </ul>
    </div>
  );
}
