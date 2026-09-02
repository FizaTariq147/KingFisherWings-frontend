import { useDocumentationPermissions } from '../hooks/useDocumentationPermissions';

export function DocumentationEdiPermissionNotice() {
  const { missingEdiRead, ediReadHint, isTenantAdmin, jwtPermissions } = useDocumentationPermissions();

  if (!missingEdiRead) return null;

  return (
    <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
      <p className="font-medium">EDI API access not in your login token</p>
      <p className="mt-1">{ediReadHint}</p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-xs">
        {isTenantAdmin ? (
          <>
            <li>Super Admin → Tenants → <strong>Sync permissions</strong></li>
            <li>Required keys: <code>documentation.edi.read</code>, <code>documentation.edi.submit</code></li>
            <li>Sign out and sign back in</li>
          </>
        ) : (
          <>
            <li>Ask admin to sync permissions and assign EDI keys on your role</li>
            <li>Sign out and sign back in after permissions change</li>
          </>
        )}
      </ul>
      <p className="mt-2 text-xs text-amber-900/80">
        Token documentation keys:{' '}
        {jwtPermissions.filter((p) => p.startsWith('documentation')).join(', ') || 'none'}
      </p>
    </div>
  );
}
