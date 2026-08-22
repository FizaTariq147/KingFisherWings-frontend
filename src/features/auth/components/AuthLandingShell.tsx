import { useState, type ComponentType, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronRight, LogIn, Package, Search, Shield } from 'lucide-react'
import loginBg from '@/assets/login-bg.mp4'
import logo from '@/assets/logo.png'

const NAVY = '#0A2942'

type HubIcon = ComponentType<{ size?: number; className?: string; strokeWidth?: number }>

function HubCard({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  description,
  to,
  onClick,
}: {
  icon: HubIcon
  iconBg: string
  iconColor: string
  title: string
  description: string
  to?: string
  onClick?: () => void
}) {
  const className =
    'group flex w-full items-center gap-3 rounded-2xl bg-white/90 px-4 py-3.5 text-left shadow-[0_8px_32px_rgba(10,41,66,0.12)] backdrop-blur-md transition hover:bg-white hover:shadow-[0_12px_36px_rgba(10,41,66,0.18)]'
  const inner = (
    <>
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
        style={{ background: iconBg, color: iconColor }}
      >
        <Icon size={18} strokeWidth={2} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold text-slate-800">{title}</span>
        <span className="mt-0.5 block text-[12.5px] leading-snug text-slate-500">{description}</span>
      </span>
      <ChevronRight
        size={18}
        className="shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-slate-600"
      />
    </>
  )

  if (to) {
    return (
      <Link to={to} className={className}>
        {inner}
      </Link>
    )
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {inner}
    </button>
  )
}

/** Shared video hub used by /login, /portal/login, and /vendor/login. */
export function AuthLandingShell({
  onAdminClick,
  children,
  videoOnly = false,
}: {
  onAdminClick: () => void
  children?: ReactNode
  /** Hide hub UI — video + overlay stay visible (e.g. while a login popup is open). */
  videoOnly?: boolean
}) {
  const navigate = useNavigate()
  const [trackRef, setTrackRef] = useState('')

  const onTrack = (e: FormEvent) => {
    e.preventDefault()
    const ref = trackRef.trim()
    navigate(ref ? `/track?ref=${encodeURIComponent(ref)}` : '/track')
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <video
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover object-center"
      >
        <source src={loginBg} type="video/mp4" />
      </video>
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(180deg, ${NAVY}CC 0%, ${NAVY}99 45%, ${NAVY}B8 100%)` }}
      />

      {!videoOnly && (
      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-[440px]">
          <div className="mx-auto mb-4 flex w-fit items-center justify-center rounded-2xl bg-white px-4 py-2.5 shadow-lg">
            <img src={logo} alt="KingFisher Wings" className="h-12 w-auto sm:h-14" />
          </div>
          <h1 className="text-center text-[22px] font-semibold tracking-tight text-white sm:text-[24px]">
            KingFisher Wings
          </h1>
          <p className="mt-1 mb-6 text-center text-[13px] text-white/75">
            Seamless logistics management for shipments, invoices, and operations
          </p>

          <div className="flex flex-col gap-3">
            <HubCard
              icon={LogIn}
              iconBg="#DBEAFE"
              iconColor="#2563EB"
              title="Customer Login"
              description="Track your shipments, quotations, and invoices."
              to="/portal/login"
            />
            <HubCard
              icon={Package}
              iconBg="#D1FAE5"
              iconColor="#059669"
              title="Vendor Login"
              description="Sign in for invoices, payments, and requests."
              to="/vendor/login"
            />
            <HubCard
              icon={Shield}
              iconBg="#EDE9FE"
              iconColor="#7C3AED"
              title="Admin Login"
              description="Staff and Tenant Admin sign-in for the ERP."
              onClick={onAdminClick}
            />
          </div>

          <form
            onSubmit={onTrack}
            className="mt-4 rounded-2xl bg-white/18 px-4 py-4 shadow-[0_8px_32px_rgba(10,41,66,0.12)] backdrop-blur-md ring-1 ring-white/25"
          >
            <div className="mb-2.5 flex items-start gap-2 text-white">
              <Search size={15} className="mt-0.5 shrink-0 opacity-90" />
              <div>
                <p className="text-[13.5px] font-semibold">Track a Shipment</p>
                <p className="text-[11.5px] leading-snug text-white/75">
                  Enter a job number, HAWB, MAWB, or booking ref — no login needed.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={trackRef}
                onChange={(e) => setTrackRef(e.target.value)}
                placeholder="Enter reference..."
                className="h-10 min-w-0 flex-1 rounded-lg border-0 bg-white px-3 text-[13px] text-slate-800 outline-none placeholder:text-slate-400"
              />
              <button
                type="submit"
                className="h-10 shrink-0 rounded-lg bg-white px-4 text-[13px] font-semibold text-slate-800 transition hover:bg-slate-100"
              >
                Track
              </button>
            </div>
          </form>
        </div>
      </main>
      )}

      {children}
    </div>
  )
}
