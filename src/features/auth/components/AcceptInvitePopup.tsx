import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react'
import { authService } from '@/features/auth/services/auth.service'
import { softPasswordField } from '@/lib/validation'
import { LoginPopupFrame, popupInputClass, popupLabelClass, popupSubmitClass } from './LoginPopupFrame'

const NAVY = '#0A2942'

const schema = z
  .object({
    first_name: z.string().trim().max(100).optional().or(z.literal('')),
    last_name: z.string().trim().max(100).optional().or(z.literal('')),
    password: softPasswordField(8),
    confirm: z.string().min(1, 'Confirm your password'),
  })
  .refine((v) => v.password === v.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'],
  })

type FormValues = z.infer<typeof schema>

export function AcceptInvitePopup({
  token,
  onClose,
  onAccepted,
}: {
  token: string
  onClose: () => void
  onAccepted: () => void
}) {
  const [showPw, setShowPw] = useState(false)
  const [apiErr, setApiErr] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { first_name: '', last_name: '', password: '', confirm: '' },
  })

  const onSubmit = async (values: FormValues) => {
    if (submitting) return
    setApiErr(null)
    setSubmitting(true)
    try {
      await authService.acceptInvite({
        token,
        password: values.password,
        ...(values.first_name?.trim() ? { first_name: values.first_name.trim() } : {}),
        ...(values.last_name?.trim() ? { last_name: values.last_name.trim() } : {}),
      })
      onAccepted()
    } catch (error) {
      const ax = error as { response?: { data?: { message?: string | string[] } }; message?: string }
      const msg = ax.response?.data?.message
      setApiErr(
        Array.isArray(msg) ? String(msg[0]) : typeof msg === 'string' && msg.trim() ? msg : ax.message || 'Could not accept invite.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <LoginPopupFrame title="Accept staff invite" onClose={onClose} compact>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-2.5">
        <p className="text-[12px] text-slate-500">
          Set your password, then sign in on Staff / User with your workspace slug and email.
        </p>
        {apiErr && (
          <p role="alert" className="flex items-center gap-1 text-[12px] text-red-600">
            <AlertCircle size={12} />
            {apiErr}
          </p>
        )}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={popupLabelClass} htmlFor="kf-invite-first">First name</label>
            <input id="kf-invite-first" className={popupInputClass} {...register('first_name')} />
          </div>
          <div>
            <label className={popupLabelClass} htmlFor="kf-invite-last">Last name</label>
            <input id="kf-invite-last" className={popupInputClass} {...register('last_name')} />
          </div>
        </div>
        <div>
          <label className={popupLabelClass} htmlFor="kf-invite-pw">New password</label>
          <div className="relative">
            <input
              id="kf-invite-pw"
              type={showPw ? 'text' : 'password'}
              autoComplete="new-password"
              className={`${popupInputClass} pr-10`}
              {...register('password')}
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
              onClick={() => setShowPw((v) => !v)}
              aria-label={showPw ? 'Hide password' : 'Show password'}
            >
              {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-[11px] text-red-500">{errors.password.message}</p>}
        </div>
        <div>
          <label className={popupLabelClass} htmlFor="kf-invite-confirm">Confirm password</label>
          <input
            id="kf-invite-confirm"
            type={showPw ? 'text' : 'password'}
            autoComplete="new-password"
            className={popupInputClass}
            {...register('confirm')}
          />
          {errors.confirm && <p className="mt-1 text-[11px] text-red-500">{errors.confirm.message}</p>}
        </div>
        <button type="submit" disabled={submitting} className={popupSubmitClass} style={{ background: NAVY }}>
          {submitting ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 size={14} className="animate-spin" /> Saving…
            </span>
          ) : (
            'Set password'
          )}
        </button>
      </form>
    </LoginPopupFrame>
  )
}
