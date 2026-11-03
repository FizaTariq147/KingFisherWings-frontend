import { Lock } from 'lucide-react'
import { popupLabelClass } from './LoginPopupFrame'

/** Dull, locked workspace slug when arriving via ?tenant_slug= from WordPress. */
export function LockedWorkspaceField({
  slug,
  label = 'Workspace',
}: {
  slug: string
  label?: string
}) {
  return (
    <div>
      <p className={`${popupLabelClass} text-slate-500`}>{label}</p>
      <div className="relative mt-1">
        <div
          className="flex h-10 w-full items-center truncate rounded-md border border-slate-200 bg-slate-100 px-3 pr-10 text-sm text-slate-400"
          aria-label={`${label} ${slug} (locked)`}
        >
          {slug}
        </div>
        <Lock
          size={15}
          strokeWidth={2}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
          aria-hidden
        />
      </div>
    </div>
  )
}
