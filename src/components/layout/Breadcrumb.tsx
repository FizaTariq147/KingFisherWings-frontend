import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import { ROUTE_LABELS, ROUTE_LABEL_RESOLVERS } from '@/config/routeLabels'

interface BreadcrumbItem {
  label: string
  to:    string | null   // null = current page (not clickable)
}

// ── Helpers ────────────────────────────────────────────────────────────────
function toTitleCase(str: string): string {
  return str
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function isUUID(segment: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment)
}

function isNumericId(segment: string): boolean {
  return /^\d+$/.test(segment)
}

function isDynamic(segment: string): boolean {
  return isUUID(segment) || isNumericId(segment)
}

async function resolveLabel(
  segment: string,
  prevSegment: string | null,
): Promise<string> {
  // Static label match
  if (ROUTE_LABELS[segment]) return ROUTE_LABELS[segment]

  // Dynamic id — attempt resolver using the preceding segment as context
  if (isDynamic(segment) && prevSegment && ROUTE_LABEL_RESOLVERS[prevSegment]) {
    const resolved = await ROUTE_LABEL_RESOLVERS[prevSegment](segment)
    if (resolved) return resolved
    // Fall through to truncated ID display
    return `#${segment.slice(0, 8)}`
  }

  return toTitleCase(segment)
}

async function buildCrumbs(pathname: string): Promise<BreadcrumbItem[]> {
  const segments = pathname.split('/').filter(Boolean)
  const crumbs: BreadcrumbItem[] = []
  let cumulativePath = ''

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]
    const prevSegment = i > 0 ? segments[i - 1] : null
    cumulativePath += `/${segment}`

    const label = await resolveLabel(segment, prevSegment)
    const isLast = i === segments.length - 1

    crumbs.push({
      label,
      to: isLast ? null : cumulativePath,
    })
  }

  return crumbs
}

// ── Component ──────────────────────────────────────────────────────────────
interface BreadcrumbProps {
  /** Override the last segment's label (useful when parent sets a page title) */
  currentLabel?: string
  className?: string
}

export default function Breadcrumb({ currentLabel, className = '' }: BreadcrumbProps) {
  const location = useLocation()
  const _params = useParams()   // consumed to trigger re-render on param change
  void _params

  const [crumbs, setCrumbs] = useState<BreadcrumbItem[]>([])

  useEffect(() => {
    let cancelled = false
    buildCrumbs(location.pathname).then((built) => {
      if (cancelled) return
      if (currentLabel && built.length > 0) {
        built[built.length - 1].label = currentLabel
      }
      setCrumbs(built)
    })
    return () => { cancelled = true }
  }, [location.pathname, currentLabel])

  if (crumbs.length <= 1) return null   // hide on top-level pages

  return (
    <nav aria-label="Breadcrumb" className={`flex items-center gap-1 text-xs ${className}`}>
      {/* Home anchor */}
      <Link
        to="/dashboard"
        className="flex items-center text-[var(--color-neutral-400)] hover:text-[var(--color-primary-600)] transition-colors"
        aria-label="Dashboard"
      >
        <Home size={12} aria-hidden="true" />
      </Link>

      {crumbs.map(({ label, to }, i) => (
        <span key={i} className="flex items-center gap-1">
          <ChevronRight
            size={12}
            className="text-[var(--color-neutral-300)] shrink-0"
            aria-hidden="true"
          />
          {to ? (
            <Link
              to={to}
              className="text-[var(--color-neutral-500)] hover:text-[var(--color-primary-600)] transition-colors truncate max-w-[160px]"
            >
              {label}
            </Link>
          ) : (
            <span
              className="text-[var(--color-neutral-700)] font-medium truncate max-w-[160px]"
              aria-current="page"
            >
              {label}
            </span>
          )}
        </span>
      ))}
    </nav>
  )
}