import {
  createContext, useCallback, useEffect,
  useMemo, useRef, useState, type ReactNode,
} from 'react'
import { authService } from '@/features/auth/services/auth.service'
import { pickMustChangePassword, hasMustChangePasswordFlag } from '@/features/auth/utils/normalizeAuthResponse'
import {
  companyIdFromAccessToken,
  normalizePermissionKeys,
  permissionsFromAccessToken,
  resolveCompanyIdFromUserLike,
  resolveSessionTenantIdFromAuth,
  resolveTenantIdFromUserLike,
  tenantIdFromAccessToken,
} from '@/lib/tenantFromAuth'
import {
  isTenantUserManagerRole,
  hasStaffAccessFlags,
  menuKeysFromStaffAccess,
  mergeStaffPermissions,
  resolveAuthRoleSlug,
} from '@/features/users/constants/userPermissions'
import {
  hasMatrixModuleAccess,
  type MatrixAccessLevel,
} from '@/features/users/utils/matrixPermissionAccess'
import { bootstrapLocaleSession, clearLocaleSession } from '@/features/locale/bootstrap/localeBootstrap'
import { pickPreferredCountryCode } from '@/store/locale/localeSlice'
import { useAuthStore } from '@/store/authStore'
import { warehouseSummaryFromRecord } from '@/features/wms/utils/normalizeWms'
import type { AuthUser, PermissionKey, Role } from '@/types/auth.types'

type MeMatrixGrant = NonNullable<AuthUser['permissionMatrix']>[number]

function parseMeAccess(raw: unknown): MeMatrixGrant['access'] | null {
  if (typeof raw !== 'string') return null
  const v = raw.trim().toLowerCase()
  if (v === 'none' || v === 'read' || v === 'write') return v
  if (v === 'read_write' || v === 'read-write' || v === 'full') return 'write'
  if (v === 'view' || v === 'readonly') return 'read'
  return null
}

/** Effective matrix summary + synthetic JWT-style keys from GET /auth/me. */
function extractMePermissionMatrix(record: Record<string, unknown>): {
  summary: MeMatrixGrant[]
  keys: string[]
} {
  const summary: MeMatrixGrant[] = []
  const keys: string[] = []

  const pushGrant = (module: string, submodule: string, access: MeMatrixGrant['access']) => {
    if (!module || !submodule) return
    summary.push({ module, submodule, access })
    if (access === 'none') return
    const levels =
      access === 'write' ? (['see', 'read', 'write'] as const) : (['see', 'read'] as const)
    for (const level of levels) {
      if (submodule === 'module') {
        keys.push(`${module}_module.${level}`)
      } else {
        keys.push(`${module}_${submodule}.${level}`)
      }
    }
    // Classic bridge-style hints (BE also puts these on JWT after re-login)
    if (access === 'read' || access === 'write') {
      keys.push(`${module}.view`)
      keys.push(`${module}.read`)
    }
    if (access === 'write') {
      keys.push(`${module}.write`)
      keys.push(`${module}.manage`)
    }
  }

  const root =
    record.permission_matrix ??
    record.permissionMatrix ??
    record.effective_access ??
    record.access_summary

  const asObj = root && typeof root === 'object' && !Array.isArray(root)
    ? (root as Record<string, unknown>)
    : null

  const list: unknown[] =
    (Array.isArray(root) && root) ||
    (Array.isArray(asObj?.grants) && (asObj!.grants as unknown[])) ||
    (Array.isArray(asObj?.permission_grants) && (asObj!.permission_grants as unknown[])) ||
    (Array.isArray(asObj?.tree) && (asObj!.tree as unknown[])) ||
    (Array.isArray(asObj?.modules) && (asObj!.modules as unknown[])) ||
    []

  for (const row of list) {
    if (!row || typeof row !== 'object') continue
    const r = row as Record<string, unknown>
    const module =
      typeof r.module === 'string'
        ? r.module
        : typeof r.key === 'string'
          ? r.key
          : ''
    const nested =
      (Array.isArray(r.submodules) && r.submodules) ||
      (Array.isArray(r.children) && r.children) ||
      []

    if (nested.length) {
      for (const sub of nested) {
        if (!sub || typeof sub !== 'object') continue
        const s = sub as Record<string, unknown>
        const submodule =
          typeof s.submodule === 'string'
            ? s.submodule
            : typeof s.key === 'string'
              ? s.key
              : ''
        const access =
          parseMeAccess(s.access) ??
          (s.write === true ? 'write' : s.read === true || s.see === true ? 'read' : 'none')
        pushGrant(module, submodule, access)
      }
      continue
    }

    const submodule = typeof r.submodule === 'string' ? r.submodule : ''
    const access =
      parseMeAccess(r.access) ??
      (r.write === true ? 'write' : r.read === true || r.see === true ? 'read' : 'none')
    if (module && submodule) pushGrant(module, submodule, access)
  }

  return { summary, keys: [...new Set(keys)] }
}

function pickWarehouseSummariesFromMe(record: Record<string, unknown>): {
  warehouseId?: string
  assignedWarehouse?: AuthUser['assignedWarehouse']
  allowedWarehouses?: AuthUser['allowedWarehouses']
} {
  const allowedKeys = [
    'warehouses',
    'allowed_warehouses',
    'allowedWarehouses',
    'scoped_warehouses',
    'scopedWarehouses',
  ] as const

  const allowedWarehouses: NonNullable<AuthUser['allowedWarehouses']> = []
  const seen = new Set<string>()

  const push = (raw: unknown) => {
    const row = warehouseSummaryFromRecord(raw)
    if (!row || seen.has(row.id)) return
    seen.add(row.id)
    allowedWarehouses.push(row)
  }

  for (const key of allowedKeys) {
    const list = record[key]
    if (!Array.isArray(list)) continue
    for (const row of list) push(row)
  }

  for (const key of ['warehouse', 'assigned_warehouse', 'assignedWarehouse', 'default_warehouse', 'defaultWarehouse'] as const) {
    push(record[key])
  }

  const idCandidates = [
    record.warehouse_id,
    record.default_warehouse_id,
    record.warehouseId,
    record.defaultWarehouseId,
    record.assigned_warehouse_id,
  ]
  let warehouseId: string | undefined
  for (const c of idCandidates) {
    if (typeof c === 'string' && /^[0-9a-f-]{36}$/i.test(c.trim())) {
      warehouseId = c.trim()
      break
    }
  }

  const assignedWarehouse =
    allowedWarehouses.find((w) => w.id === warehouseId) ??
    allowedWarehouses[0] ??
    (warehouseId ? { id: warehouseId } : undefined)

  if (assignedWarehouse && !warehouseId) {
    warehouseId = assignedWarehouse.id
  }

  return {
    ...(warehouseId ? { warehouseId } : {}),
    ...(assignedWarehouse ? { assignedWarehouse } : {}),
    ...(allowedWarehouses.length ? { allowedWarehouses } : {}),
  }
}

function authMeErrorStatus(err: unknown): number | undefined {
  return (err as { response?: { status?: number } })?.response?.status
}

function authMeErrorMessage(err: unknown): string {
  const data = (err as { response?: { data?: { message?: unknown } } })?.response?.data
  if (!data || typeof data !== 'object') return ''
  const message = (data as { message?: unknown }).message
  if (typeof message === 'string') return message
  if (Array.isArray(message) && typeof message[0] === 'string') return message[0]
  return ''
}

function isSubscriptionBlockedError(err: unknown): boolean {
  const status = authMeErrorStatus(err)
  const message = authMeErrorMessage(err).toLowerCase()
  return status === 403 && message.includes('subscription')
}

export interface AuthContextValue {
  user:             AuthUser | null
  isAuthenticated:  boolean
  isLoading:        boolean
  hasPermission:    (...keys: PermissionKey[]) => boolean
  hasAnyPermission: (...keys: PermissionKey[]) => boolean
  /** Access from JWT matrix keys (`{module}_module.see|read|write`, `{module}.view`, …). */
  hasMatrixModule:  (moduleKey: string, level?: MatrixAccessLevel) => boolean
  hasRole:          (roleSlug: string) => boolean
  logout:           () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

const DEV_BYPASS_AUTH = import.meta.env.DEV && import.meta.env.VITE_BYPASS_AUTH === 'true'

const DEV_TENANT_ID = '00000000-0000-4000-8000-000000000001'

const MOCK_USER: AuthUser = {
  id:          'dev-user-1',
  name:        'Dev User',
  email:       'dev@kingfisherwings.com',
  tenantId:    DEV_TENANT_ID,
  companyId:   undefined,
  role:        { id: 'dev-role', name: 'Admin', slug: 'admin' },
  permissions: [] as PermissionKey[],
  product:     'KingFisher Tech Gold',
}

function normalizeAuthUser(raw: unknown, accessToken?: string | null): AuthUser | null {
  if (!raw || typeof raw !== 'object') return null
  let record = raw as Record<string, unknown>

  if (record.data && typeof record.data === 'object' && !Array.isArray(record.data)) {
    record = record.data as Record<string, unknown>
  } else if (record.user && typeof record.user === 'object') {
    record = record.user as Record<string, unknown>
  }

  const id = typeof record.id === 'string' ? record.id : ''
  const email = typeof record.email === 'string' ? record.email : ''
  if (!id && !email) return null

  const roleRaw = record.role
  let role: Role = { id: '', name: '', slug: '' }
  if (typeof roleRaw === 'string') {
    role = { id: roleRaw, name: roleRaw, slug: roleRaw }
  } else if (roleRaw && typeof roleRaw === 'object') {
    const r = roleRaw as Record<string, unknown>
    role = {
      id: typeof r.id === 'string' ? r.id : '',
      name: typeof r.name === 'string' ? r.name : String(r.slug ?? ''),
      slug: typeof r.slug === 'string' ? r.slug : String(r.name ?? ''),
    }
  }

  const first =
    typeof record.first_name === 'string'
      ? record.first_name
      : typeof record.firstName === 'string'
        ? record.firstName
        : ''
  const last =
    typeof record.last_name === 'string'
      ? record.last_name
      : typeof record.lastName === 'string'
        ? record.lastName
        : ''
  const name =
    typeof record.name === 'string' && record.name
      ? record.name
      : [first, last].filter(Boolean).join(' ') || email

  const tenantId =
    resolveTenantIdFromUserLike(record) ||
    tenantIdFromAccessToken(accessToken) ||
    (() => {
      const slug = (role.slug || role.name || '').toLowerCase().replace(/-/g, '_')
      if (
        id &&
        /^[0-9a-f-]{36}$/i.test(id) &&
        (slug.includes('tenant_admin') || slug === 'tenant' || slug.includes('tenant_owner'))
      ) {
        return id
      }
      return ''
    })()

  const companyId =
    resolveCompanyIdFromUserLike(record) ||
    companyIdFromAccessToken(accessToken) ||
    undefined

  const fromMe = normalizePermissionKeys(record.permissions)
  const fromJwt = permissionsFromAccessToken(accessToken)
  const fromStaffFlags = menuKeysFromStaffAccess(record)
  const matrixFromMe = extractMePermissionMatrix(record)
  const isTenantAdmin =
    isTenantUserManagerRole(role.slug) || isTenantUserManagerRole(role.name)

  // Staff: Tenant Admin functional/visibility flags own `menu_*` when present on /auth/me.
  // JWT role menus must not re-open Finance/Ops the admin turned off.
  const permissions = mergeStaffPermissions({
    fromMe: [...fromMe, ...normalizePermissionKeys(matrixFromMe.keys)],
    fromJwt,
    fromStaffFlags,
    staffFlagsPresent: hasStaffAccessFlags(record),
    isTenantAdmin,
  })

  // undefined = /me omitted the flag (keep login-session value); boolean = trust /me
  const mustChangePassword = hasMustChangePasswordFlag(record)
    ? pickMustChangePassword(record)
    : undefined

  const warehouseFromMe = pickWarehouseSummariesFromMe(record)

  return {
    id: id || email,
    name,
    email,
    tenantId,
    companyId: companyId || undefined,
    ...warehouseFromMe,
    role,
    permissions,
    product: (record.product as AuthUser['product']) || 'KingFisher Tech Gold',
    mustChangePassword,
    ...(matrixFromMe.summary.length ? { permissionMatrix: matrixFromMe.summary } : {}),
  }
}

/** Hydrate AuthContext from Zustand immediately after login (before /auth/me returns). */
function seedUserFromAuthStore(accessToken: string): AuthUser | null {
  const storeUser = useAuthStore.getState().user
  if (!storeUser) return null

  const roleSlug = resolveAuthRoleSlug(storeUser.role)
  const fromJwt = permissionsFromAccessToken(accessToken)
  const isTenantAdmin = isTenantUserManagerRole(roleSlug)
  const fromStaffFlags = menuKeysFromStaffAccess({ role: roleSlug })
  const permissions = mergeStaffPermissions({
    fromMe: [],
    fromJwt,
    fromStaffFlags,
    // Only treat role-derived menus as authoritative when they actually grant keys
    // (e.g. WAREHOUSE_STAFF → menu_warehouse). Otherwise keep JWT menus until /me.
    staffFlagsPresent: fromStaffFlags.length > 0,
    isTenantAdmin,
  })

  const id = storeUser.id || storeUser.email
  if (!id) return null

  return {
    id,
    name: storeUser.name || storeUser.email,
    email: storeUser.email,
    tenantId:
      storeUser.tenantId ||
      tenantIdFromAccessToken(accessToken) ||
      resolveSessionTenantIdFromAuth({
        accessToken,
        user: { id, role: roleSlug, tenantId: storeUser.tenantId },
      }) ||
      '',
    companyId: storeUser.companyId || companyIdFromAccessToken(accessToken) || undefined,
    role: {
      id: roleSlug,
      name: storeUser.role || roleSlug,
      slug: roleSlug,
    },
    permissions,
    product: storeUser.product,
    mustChangePassword: storeUser.mustChangePassword,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const accessToken = useAuthStore((s) => s.accessToken)
  const storeLogout = useAuthStore((s) => s.logout)
  const patchSessionUser = useAuthStore((s) => s.patchSessionUser)
  const setSubscriptionBlocked = useAuthStore((s) => s.setSubscriptionBlocked)
  const [user, setUser]       = useState<AuthUser | null>(DEV_BYPASS_AUTH ? MOCK_USER : null)
  const [isLoading, setLoading] = useState(!DEV_BYPASS_AUTH)
  const lastAccessTokenRef    = useRef<string | null>(null)

  useEffect(() => {
    if (DEV_BYPASS_AUTH) {
      bootstrapLocaleSession('AE')
      return
    }

    if (!accessToken) {
      lastAccessTokenRef.current = null
      setUser(null)
      setLoading(false)
      setSubscriptionBlocked(null)
      clearLocaleSession()
      return
    }

    const seeded = seedUserFromAuthStore(accessToken)
    if (seeded) setUser(seeded)

    if (lastAccessTokenRef.current === accessToken) {
      return
    }
    lastAccessTokenRef.current = accessToken

    setLoading(true)
    authService
      .me()
      .then((data) => {
        const normalized = normalizeAuthUser(data, accessToken)
        if (!normalized) {
          setUser(null)
          void storeLogout()
          return
        }
        if (!normalized.tenantId) {
          normalized.tenantId =
            tenantIdFromAccessToken(accessToken) ||
            resolveSessionTenantIdFromAuth({
              accessToken,
              user: {
                id: normalized.id,
                role: normalized.role.slug || normalized.role.name,
                tenantId: normalized.tenantId,
              },
            })
        }
        if (!normalized.companyId) {
          normalized.companyId = companyIdFromAccessToken(accessToken) || undefined
        }
        setUser(normalized)
        setSubscriptionBlocked(null)
        // Keep Zustand in sync so services (user.service) can resolve tenant without AuthContext.
        // Never overwrite a known tenantId with an empty /me payload.
        // Preserve mustChangePassword from login when /me omits the flag.
        const priorMustChange = Boolean(useAuthStore.getState().user?.mustChangePassword)
        patchSessionUser({
          id: normalized.id,
          name: normalized.name,
          email: normalized.email,
          role: normalized.role.slug || normalized.role.name || 'TENANT_ADMIN',
          ...(normalized.tenantId ? { tenantId: normalized.tenantId } : {}),
          ...(normalized.companyId ? { companyId: normalized.companyId } : {}),
          mustChangePassword:
            normalized.mustChangePassword === undefined
              ? priorMustChange
              : Boolean(normalized.mustChangePassword),
        })
        bootstrapLocaleSession(pickPreferredCountryCode(data))
      })
      .catch((err) => {
        const seeded = seedUserFromAuthStore(accessToken)
        const status = authMeErrorStatus(err)

        if (isSubscriptionBlockedError(err)) {
          setSubscriptionBlocked(authMeErrorMessage(err) || 'Tenant subscription has expired.')
          if (seeded) setUser(seeded)
          return
        }

        setSubscriptionBlocked(null)

        // Invalid session — sign out. Otherwise keep the login payload so navigation works.
        if (status === 401 || !seeded) {
          setUser(null)
          void storeLogout()
          return
        }

        setUser(seeded)
      })
      .finally(() => setLoading(false))
  }, [accessToken, storeLogout, patchSessionUser, setSubscriptionBlocked])

  const hasPermission    = useCallback((...keys: PermissionKey[]) => {
    if (DEV_BYPASS_AUTH) return true
    if (!user) return false
    // Tenant Admin is the workspace owner — full ERP menus (Quotations, Tariffs, etc.).
    // Staff are gated by menu_* keys from JWT /auth/me (+ visibility flags mapped into menus).
    if (isTenantUserManagerRole(user.role.slug) || isTenantUserManagerRole(user.role.name)) {
      return true
    }
    if (user.permissions.length === 0) return false
    return keys.every((k) => user.permissions.includes(k))
  }, [user])

  const hasAnyPermission = useCallback((...keys: PermissionKey[]) => {
    if (DEV_BYPASS_AUTH) return true
    if (!user) return false
    if (isTenantUserManagerRole(user.role.slug) || isTenantUserManagerRole(user.role.name)) {
      return true
    }
    if (user.permissions.length === 0) return false
    return keys.some((k) => user.permissions.includes(k))
  }, [user])

  const hasMatrixModule = useCallback(
    (moduleKey: string, level: MatrixAccessLevel = 'see') => {
      if (DEV_BYPASS_AUTH) return true
      if (!user) return false
      if (isTenantUserManagerRole(user.role.slug) || isTenantUserManagerRole(user.role.name)) {
        return true
      }
      return hasMatrixModuleAccess(user.permissions, moduleKey, level)
    },
    [user],
  )

  const hasRole = useCallback((slug: string) => {
    if (DEV_BYPASS_AUTH) return true
    if (!user?.role) return false
    const normalize = (v: string) => v.toLowerCase().replace(/-/g, '_')
    const target = normalize(slug)
    if (user.role.slug && normalize(user.role.slug) === target) return true
    if (user.role.name && normalize(user.role.name) === target) return true
    return false
  }, [user])

  const logout = useCallback(async () => {
    await storeLogout()
    setUser(null)
  }, [storeLogout])

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isAuthenticated: DEV_BYPASS_AUTH ? true : !!user,
    isLoading,
    hasPermission,
    hasAnyPermission,
    hasMatrixModule,
    hasRole,
    logout,
  }), [user, isLoading, hasPermission, hasAnyPermission, hasMatrixModule, hasRole, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
