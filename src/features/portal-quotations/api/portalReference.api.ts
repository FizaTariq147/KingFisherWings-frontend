export const PORTAL_LOOKUPS_API = {
  /** Preferred world sea ports (searchable, limit ≤ 500). */
  ports: '/portal/lookups/ports',
  airports: '/portal/lookups/airports',
  /** Legacy fallback. */
  portsLegacy: '/portal/reference/ports',
} as const;
