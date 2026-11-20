/**
 * Durable gate for forced "Set your password".
 *
 * Some tenants keep returning must_change_password=true from login /auth/me even
 * after POST /auth/tenant/change-password succeeds — which re-opens the loop on
 * every new session. Remember a successful change per principal id.
 */

const STORAGE_PREFIX = 'kf-must-change-password-cleared:'

function storageKey(principalId: string): string {
  return `${STORAGE_PREFIX}${principalId.trim()}`
}

export function markMustChangePasswordCleared(
  ...principalIds: Array<string | null | undefined>
): void {
  const now = String(Date.now())
  for (const principalId of principalIds) {
    const id = typeof principalId === 'string' ? principalId.trim() : ''
    if (!id) continue
    try {
      localStorage.setItem(storageKey(id), now)
    } catch {
      /* private mode */
    }
  }
}

export function hasMustChangePasswordCleared(
  ...principalIds: Array<string | null | undefined>
): boolean {
  try {
    for (const principalId of principalIds) {
      const id = typeof principalId === 'string' ? principalId.trim() : ''
      if (id && localStorage.getItem(storageKey(id))) return true
    }
  } catch {
    return false
  }
  return false
}

/** When /auth/me explicitly says the flag is off, drop the local override. */
export function clearMustChangePasswordClearedMark(principalId?: string | null): void {
  const id = typeof principalId === 'string' ? principalId.trim() : ''
  if (!id) return
  try {
    localStorage.removeItem(storageKey(id))
  } catch {
    /* ignore */
  }
}

/**
 * Resolve effective must-change for login /me.
 * Local clearance wins over a stale true from the API.
 */
export function resolveMustChangePassword(options: {
  principalId?: string | null
  apiFlag?: boolean | undefined
  priorFlag?: boolean
  sessionSatisfied?: boolean
}): boolean {
  const { principalId, apiFlag, priorFlag = false, sessionSatisfied = false } = options
  if (sessionSatisfied || hasMustChangePasswordCleared(principalId)) {
    return false
  }
  if (apiFlag === undefined) return priorFlag
  return Boolean(apiFlag)
}
