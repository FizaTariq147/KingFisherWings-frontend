import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import logo from '@/assets/logo.png'

const NAVY = '#0A2942'

/** White centered sign-in popup over the landing hub (Shaheen Adil style). */
export function LoginPopupFrame({
  title,
  onClose,
  children,
  labelledBy,
  compact = false,
}: {
  title: string
  onClose: () => void
  children: ReactNode
  labelledBy?: string
  compact?: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0" style={{ background: `${NAVY}8A` }} onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy ?? 'login-popup-title'}
        className={`relative z-10 w-full max-w-[560px] max-h-[92vh] overflow-y-auto rounded-2xl bg-white shadow-2xl sm:px-10 ${
          compact ? 'px-6 py-5' : 'px-6 py-7'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <X size={16} />
        </button>
        <div className={`flex justify-center ${compact ? 'mb-2' : 'mb-3'}`}>
          <img src={logo} alt="KingFisher Wings" className={compact ? 'h-10 w-auto' : 'h-12 w-auto'} />
        </div>
        <p
          id={labelledBy ?? 'login-popup-title'}
          className={`text-center text-[13.5px] font-medium text-slate-500 ${compact ? 'mb-3' : 'mb-5'}`}
        >
          {title}
        </p>
        {children}
      </div>
    </div>
  )
}

export const popupInputClass =
  'mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#0A2942] focus:ring-1 focus:ring-[#0A2942]/20 disabled:opacity-50'

export const popupLabelClass = 'block text-[13px] font-medium text-slate-700'

export const popupSubmitClass =
  'mt-2 h-11 w-full rounded-lg text-sm font-semibold text-white transition disabled:opacity-60 disabled:cursor-not-allowed'
