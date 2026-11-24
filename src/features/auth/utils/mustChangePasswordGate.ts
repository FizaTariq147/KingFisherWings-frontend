/**
 * Forced "Set your password" gate.
 *
 * Backend often keeps returning must_change_password=true after
 * POST /auth/tenant/change-password, which re-opens the Set password screen.
 * After a successful change we set a browser skip flag (id-agnostic) plus
 * optional per-principal marks.
 */

const STORAGE_PREFIX = 'kf-must-change-password-cleared:'
const SKIP_KEY = 'kf-must-change-password-skip-until'

function storageKey(principalId: string): string {
  return `${STORAGE_PREFIX}${principalId.trim()}`
}

/** In-memory + sessionStorage: skip must-change redirect until this epoch ms. */
let skipUntilMs = 0

/** Call immediately after a successful password change (before navigate). */
export function armMustChangePasswordSkip(durationMs = 24 * 60 * 60 * 1000): void {
  skipUntilMs = Date.now() + durationMs
  try {
    sessionStorage.setItem(SKIP_KEY, String(skipUntilMs))
  } catch {
    /* private mode */
  }
  try {
    localStorage.setItem(SKIP_KEY, String(skipUntilMs))
  } catch {
    /* private mode */
  }
}

export function shouldSkipMustChangePasswordRedirect(): boolean {
  let until = skipUntilMs
  try {
    const sessionUntil = Number(sessionStorage.getItem(SKIP_KEY) || 0)
    if (Number.isFinite(sessionUntil)) until = Math.max(until, sessionUntil)
  } catch {
    /* ignore */
  }
  try {
    const localUntil = Number(localStorage.getItem(SKIP_KEY) || 0)
    if (Number.isFinite(localUntil)) until = Math.max(until, localUntil)
  } catch {
    /* ignore */
  }
  return Date.now() < until
}

export function clearMustChangePasswordSkip(): void {
  skipUntilMs = 0
  try {
    sessionStorage.removeItem(SKIP_KEY)
  } catch {
    /* ignore */
  }
  try {
    localStorage.removeItem(SKIP_KEY)
  } catch {
    /* ignore */
  }
}

export function markMustChangePasswordCleared(
  ...principalIds: Array<string | null | undefined>
): void {
  armMustChangePasswordSkip()
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
  if (shouldSkipMustChangePasswordRedirect()) return true
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

/** When /auth/me explicitly says the flag is off, drop per-id marks (keep skip). */
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
 * Skip flag / local clearance wins over a stale true from the API.
 */
export function resolveMustChangePassword(options: {
  principalId?: string | null
  apiFlag?: boolean | undefined
  priorFlag?: boolean
  sessionSatisfied?: boolean
}): boolean {
  const { principalId, apiFlag, priorFlag = false, sessionSatisfied = false } = options
  if (
    sessionSatisfied ||
    shouldSkipMustChangePasswordRedirect() ||
    hasMustChangePasswordCleared(principalId)
  ) {
    return false
  }
  if (apiFlag === undefined) return priorFlag
  return Boolean(apiFlag)
}
