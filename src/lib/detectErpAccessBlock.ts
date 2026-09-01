/** Backend guard when tenant-admin ERP routes still require 2FA setup. */
export const ERP_ACCESS_BLOCKED_CODE = 'REQUIRES_2FA_SETUP'

function pickBackendMessage(data: unknown): string {
  if (!data || typeof data !== 'object') return ''
  const record = data as { message?: unknown }
  const message = record.message
  if (typeof message === 'string') return message.trim()
  if (Array.isArray(message) && typeof message[0] === 'string') return message[0].trim()
  return ''
}

/** Detect POST-login ERP API blocks (login itself may still succeed). */
export function erpAccessBlockMessage(status?: number, data?: unknown): string | null {
  if (status !== 403) return null

  const record =
    data && typeof data === 'object' ? (data as { code?: unknown }) : null
  const code = typeof record?.code === 'string' ? record.code.trim() : ''
  const message = pickBackendMessage(data)

  if (code === ERP_ACCESS_BLOCKED_CODE) {
    return message || 'ERP access is blocked until two-factor authentication is enabled.'
  }

  if (/two.?factor|2fa/i.test(message)) {
    return message
  }

  return null
}
