import { useDocumentationPermissions } from '../hooks/useDocumentationPermissions';

export function DocumentationPermissionNotice() {
  const { missingRead, missingManage, readHint, manageHint, isTenantAdmin, jwtPermissions } =
    useDocumentationPermissions();

  if (!missingRead && !missingManage) return null;

  return (
    <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
      <p className="font-medium">
        {missingRead
          ? 'Documentation API access not in your login token'
          : 'Documentation write access not in your login token'}
      </p>
      <p className="mt-1">{missingRead ? readHint : manageHint}</p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-xs">
        {isTenantAdmin ? (
          <>
            <li>Super Admin → Tenants → your tenant → <strong>Sync permissions</strong></li>
            <li>Backend role seed must include <code>documentation.read</code>, <code>documentation.manage</code>, <code>documentation.edi.read</code>, <code>documentation.edi.submit</code></li>
            <li>Sign out completely, then sign back in</li>
          </>
        ) : (
          <>
            <li>Ask Tenant Admin or Super Admin to sync permissions and assign Documentation keys</li>
            <li>Ensure <strong>Operations</strong> is enabled on your user (grants menu_documentation)</li>
            <li>Sign out and sign back in after permissions change</li>
          </>
        )}
      </ul>
      {jwtPermissions.length > 0 ? (
        <p className="mt-2 text-xs text-amber-900/80">
          Current token permissions ({jwtPermissions.length}):{' '}
          {jwtPermissions.filter((p) => p.startsWith('documentation') || p === 'menu_documentation').join(', ') ||
            'none for documentation.*'}
        </p>
      ) : null}
    </div>
  );
}
