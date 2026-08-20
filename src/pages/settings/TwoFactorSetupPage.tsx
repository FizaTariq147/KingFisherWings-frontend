import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { KeyRound, Loader2, QrCode, RefreshCcw, ShieldCheck } from 'lucide-react'
import { authService } from '@/features/auth/services/auth.service'
import { erpPostAuthPath } from '@/features/auth/utils/postLoginPath'
import {
  buildOtpauthUrl,
  generateTotpCode,
  generateTotpSecret,
  remainingTotpSeconds,
  totpQrImageUrl,
} from '@/features/auth/utils/totp'
import type { TwoFactorSetupResult } from '@/features/auth/types/auth.api.types'
import { useAuthStore } from '@/store/authStore'

function readError(error: unknown): string {
  const record = error as {
    response?: {
      status?: number
      data?: { message?: string | string[] }
    }
    message?: string
  }
  const message = record?.response?.data?.message
  const text = Array.isArray(message)
    ? String(message[0] ?? '')
    : typeof message === 'string'
      ? message
      : ''
  if (text.trim()) return text.trim()
  if (typeof record?.message === 'string' && record.message.trim()) return record.message
  return 'Request failed. Please try again.'
}

function logTotpToConsole(code: string) {
  console.info(code)
}

function formatSecret(secret: string): string {
  return secret.replace(/(.{4})/g, '$1 ').trim()
}

function qrSrc(value?: string): string | undefined {
  if (!value) return undefined
  if (value.startsWith('data:image') || value.startsWith('http')) return value
  if (/^[A-Za-z0-9+/=]+$/.test(value) && value.length > 80) {
    return `data:image/png;base64,${value}`
  }
  return undefined
}

function applySetupFields(
  result: TwoFactorSetupResult,
  account: string,
): { secret: string; otpauthUrl: string; qrDataUrl: string; backupCodes: string[] } {
  const secret = result.secret || generateTotpSecret()
  const otpauthUrl = result.otpauthUrl || buildOtpauthUrl(secret, account)
  const qrDataUrl = qrSrc(result.qrCodeDataUrl) || totpQrImageUrl(otpauthUrl)
  return {
    secret,
    otpauthUrl,
    qrDataUrl,
    backupCodes: result.backupCodes || [],
  }
}

export default function TwoFactorSetupPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const patchSessionUser = useAuthStore((s) => s.patchSessionUser)
  const enabled = Boolean(user?.twoFactorEnabled)
  const account = user?.email || user?.name || 'user'

  const [loadingSetup, setLoadingSetup] = useState(false)
  const [setupError, setSetupError] = useState<string | null>(null)
  const [secret, setSecret] = useState('')
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])

  const [code, setCode] = useState('')
  const [enabling, setEnabling] = useState(false)
  const [enableError, setEnableError] = useState<string | null>(null)
  const [enableOk, setEnableOk] = useState(false)

  const [disablePassword, setDisablePassword] = useState('')
  const [disableCode, setDisableCode] = useState('')
  const [disabling, setDisabling] = useState(false)
  const [disableError, setDisableError] = useState<string | null>(null)

  const [liveCode, setLiveCode] = useState('')
  const [secondsLeft, setSecondsLeft] = useState(30)

  const applyResult = (result: TwoFactorSetupResult, _local: boolean) => {
    const next = applySetupFields(result, account)
    setSecret(next.secret)
    setQrDataUrl(next.qrDataUrl)
    setBackupCodes(next.backupCodes)
    setSetupError(null)
  }

  const loadSetup = async () => {
    setLoadingSetup(true)
    setSetupError(null)
    setEnableOk(false)
    try {
      const result = await authService.setupTwoFactor()
      applyResult(result, !result.secret && !result.otpauthUrl && !result.qrCodeDataUrl)
    } catch (error) {
      applyResult({}, true)
      setSetupError(readError(error))
    } finally {
      setLoadingSetup(false)
    }
  }

  useEffect(() => {
    if (enabled) return
    void loadSetup()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on enroll screen
  }, [enabled])

  useEffect(() => {
    if (!secret || enabled) return
    let lastCode = ''
    const tick = async () => {
      try {
        const totp = await generateTotpCode(secret)
        setLiveCode(totp)
        setSecondsLeft(remainingTotpSeconds())
        if (totp !== lastCode) {
          lastCode = totp
          logTotpToConsole(totp)
        }
      } catch {
        // Ignore crypto errors in unsupported browsers.
      }
    }
    void tick()
    const id = window.setInterval(() => void tick(), 1000)
    return () => window.clearInterval(id)
  }, [secret, enabled])

  const regenerate = async () => {
    await loadSetup()
  }

  const onEnable = async () => {
    const trimmed = code.trim()
    if (trimmed.length < 6) {
      setEnableError('Enter the 6-digit code from your authenticator app.')
      return
    }
    setEnabling(true)
    setEnableError(null)
    try {
      const expected = secret ? await generateTotpCode(secret) : ''
      if (!expected || trimmed !== expected) {
        setEnableError('That code is not valid. Use the 6-digit code shown on this page.')
        return
      }
      await authService.enableTwoFactor({ code: trimmed })
      patchSessionUser({ twoFactorEnabled: true })
      setEnableOk(true)
      navigate(erpPostAuthPath({ ...user, twoFactorEnabled: true, mustChangePassword: user?.mustChangePassword }), {
        replace: true,
      })
    } catch (error) {
      setEnableError(readError(error))
    } finally {
      setEnabling(false)
    }
  }

  const onDisable = async () => {
    if (!disablePassword.trim()) {
      setDisableError('Current password is required to disable 2FA.')
      return
    }
    setDisabling(true)
    setDisableError(null)
    try {
      await authService.disableTwoFactor({
        password: disablePassword,
        ...(disableCode.trim() ? { code: disableCode.trim() } : {}),
      })
      patchSessionUser({ twoFactorEnabled: false })
      setDisablePassword('')
      setDisableCode('')
    } catch (error) {
      setDisableError(readError(error))
    } finally {
      setDisabling(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: 'var(--color-primary-50)' }}
        >
          <ShieldCheck size={18} style={{ color: 'var(--color-primary-600)' }} aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-base font-semibold text-[var(--color-neutral-900)]">
            Two-factor authentication
          </h1>
          <p className="text-xs text-[var(--color-neutral-400)]">
            Authenticator TOTP for this account. Tenant Admin must enable 2FA before using the ERP.
          </p>
        </div>
      </div>

      {enabled ? (
        <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-5 space-y-4">
          <p className="text-sm text-[var(--color-neutral-700)]">
            Two-factor authentication is <span className="font-semibold">enabled</span> on this account.
          </p>
          <div>
            <label className="block text-xs font-medium text-[var(--color-neutral-600)] mb-1.5">
              Current password
            </label>
            <input
              type="password"
              value={disablePassword}
              onChange={(e) => setDisablePassword(e.target.value)}
              className="h-9 w-full rounded-lg border border-[var(--color-neutral-200)] px-3 text-sm outline-none focus:border-[var(--color-primary-500)]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--color-neutral-600)] mb-1.5">
              Authenticator or backup code (optional)
            </label>
            <input
              type="text"
              value={disableCode}
              onChange={(e) => setDisableCode(e.target.value)}
              className="h-9 w-full rounded-lg border border-[var(--color-neutral-200)] px-3 text-sm outline-none focus:border-[var(--color-primary-500)]"
            />
          </div>
          {disableError ? (
            <p className="text-xs font-medium text-[var(--color-danger-500)]">{disableError}</p>
          ) : null}
          <button
            type="button"
            disabled={disabling}
            onClick={() => void onDisable()}
            className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {disabling ? <Loader2 size={15} className="animate-spin" /> : <KeyRound size={15} />}
            Disable 2FA
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-[var(--color-neutral-700)]">
              Scan the QR code in your authenticator app, then enter the 6-digit code to enable 2FA.
            </p>
            <button
              type="button"
              onClick={() => void regenerate()}
              disabled={loadingSetup}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[var(--color-neutral-200)] px-3 py-1.5 text-xs font-semibold text-[var(--color-neutral-700)] disabled:opacity-60"
            >
              {loadingSetup ? <Loader2 size={13} className="animate-spin" /> : <RefreshCcw size={13} />}
              Generate
            </button>
          </div>

          {setupError ? (
            <p className="text-xs font-medium text-[var(--color-danger-500)]">{setupError}</p>
          ) : null}

          <div className="flex flex-wrap items-start gap-5">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Authenticator QR code"
                className="h-40 w-40 rounded-lg border border-[var(--color-neutral-200)] bg-white"
              />
            ) : (
              <div className="flex h-40 w-40 items-center justify-center rounded-lg border border-dashed border-[var(--color-neutral-200)] text-[var(--color-neutral-400)]">
                <QrCode size={28} />
              </div>
            )}
            {liveCode ? (
              <div className="min-w-[160px]">
                <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--color-neutral-400)]">
                  Authenticator code
                </p>
                <p className="mt-1 font-mono text-[28px] font-semibold tracking-[0.2em] text-[var(--color-neutral-900)]">
                  {liveCode}
                </p>
                <p className="mt-0.5 text-[11px] text-[var(--color-neutral-400)]">
                  Refreshes in {secondsLeft}s · also logged in the console
                </p>
              </div>
            ) : null}
          </div>

          {secret ? (
            <p className="text-xs text-[var(--color-neutral-600)]">
              Manual secret:{' '}
              <span className="font-mono font-semibold tracking-wide text-[var(--color-neutral-800)]">
                {formatSecret(secret)}
              </span>
            </p>
          ) : null}
          {backupCodes.length > 0 ? (
            <div>
              <p className="text-xs font-medium text-[var(--color-neutral-600)] mb-1">Backup codes — store these safely</p>
              <ul className="grid grid-cols-2 gap-1 font-mono text-xs text-[var(--color-neutral-800)]">
                {backupCodes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div>
            <label className="block text-xs font-medium text-[var(--color-neutral-600)] mb-1.5">
              Authenticator code
            </label>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              className="h-9 w-full max-w-xs rounded-lg border border-[var(--color-neutral-200)] px-3 text-sm outline-none focus:border-[var(--color-primary-500)]"
            />
          </div>
          {enableError ? (
            <p className="text-xs font-medium text-[var(--color-danger-500)]">{enableError}</p>
          ) : null}
          {enableOk ? (
            <p className="text-xs font-medium text-emerald-600">Two-factor authentication is now enabled.</p>
          ) : null}
          <button
            type="button"
            disabled={enabling || loadingSetup}
            onClick={() => void onEnable()}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary-600,#0A2942)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {enabling ? <Loader2 size={15} className="animate-spin" /> : <ShieldCheck size={15} />}
            Enable 2FA
          </button>
        </div>
      )}
    </div>
  )
}
