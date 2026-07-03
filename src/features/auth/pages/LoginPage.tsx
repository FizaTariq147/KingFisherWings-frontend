import { useState, useRef, useEffect, type ComponentType } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Phone, Mail, Lock, ArrowRight, ChevronDown,
  ShieldCheck, Cloud, Database, GraduationCap, LineChart,
  Settings, Headphones, Eye, EyeOff, Loader2, AlertCircle, X,
  Menu,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import heroBg from '@/assets/hero-freight.jpg'

// ── Brand tokens ───────────────────────────────────────────────────────────
const NAVY     = '#0B1E3A'
const NAVY_MID = '#14284A'
const ORANGE   = '#F5761F'
const ORANGE_D = '#DD5F0D'

// ── Zod schema ────────────────────────────────────────────────────────────
const schema = z.object({
  email:    z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})
type FormValues = z.infer<typeof schema>

// ─────────────────────────────────────────────────────────────────────────
// NAVBAR  — two-tier: utility bar + bottom orange rule + diagonal accent
// ─────────────────────────────────────────────────────────────────────────
function Navbar({ onLoginClick }: { onLoginClick: () => void }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header
      className="relative z-40 overflow-hidden"
      style={{ background: NAVY }}
    >
      {/* ── Diagonal orange accent — right edge ─────────────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-0 bottom-0 w-52 hidden lg:block"
        style={{
          background: ORANGE,
          clipPath: 'polygon(62% 0%, 100% 0%, 38% 100%, 0% 100%)',
          opacity: 0.92,
        }}
      />

      {/* ── Bottom orange rule ──────────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-[3px]"
        style={{ background: ORANGE }}
      />

      {/* ── Main nav row ────────────────────────────────────────────── */}
      <div className="relative mx-auto max-w-[1320px] px-5 sm:px-8 flex items-center justify-between gap-4 h-[68px]">

        {/* LEFT — Logo */}
        <KfWordmark />

        {/* CENTER — Contact links (hidden on small screens) */}
        <div className="hidden xl:flex items-center gap-8 text-[13px] font-medium text-white/80">
          <a
            href="tel:+97155535286"
            className="flex items-center gap-2 hover:text-white transition-colors duration-200"
          >
            <Phone size={14} className="shrink-0" />
            +971 55 535 5286
          </a>
          <a
            href="mailto:info@kingfisherwings.com"
            className="flex items-center gap-2 hover:text-white transition-colors duration-200"
          >
            <Mail size={14} className="shrink-0" />
            info@kingfisherwings.com
          </a>
        </div>

        {/* RIGHT — Action buttons */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Enquiry — outline */}
          <Link
            to="/contact"
            className="hidden sm:flex items-center rounded-lg border-[1.5px] px-[18px] py-[9px] text-[12.5px] font-semibold text-white transition-all duration-250 hover:-translate-y-px"
            style={{ borderColor: ORANGE }}
            onMouseEnter={e => (e.currentTarget.style.background = ORANGE)}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            Enquiry
          </Link>

          {/* Login — filled orange */}
          <button
            type="button"
            onClick={onLoginClick}
            className="flex items-center gap-1.5 rounded-lg px-[18px] py-[9px] text-[12.5px] font-semibold text-white shadow transition-all duration-250 hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(245,118,31,0.45)]"
            style={{ background: ORANGE }}
            onMouseEnter={e => (e.currentTarget.style.background = ORANGE_D)}
            onMouseLeave={e => (e.currentTarget.style.background = ORANGE)}
          >
            <Lock size={13} strokeWidth={2.5} />
            Login
          </button>

          {/* Mobile hamburger */}
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setMobileOpen(v => !v)}
            className="xl:hidden p-2 text-white/70 hover:text-white transition-colors"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* ── Mobile contact drawer ────────────────────────────────────── */}
      {mobileOpen && (
        <div className="xl:hidden relative border-t border-white/10 px-6 py-4 flex flex-col gap-3 text-sm text-white/80">
          <a href="tel:+97155535286" className="flex items-center gap-2 hover:text-white">
            <Phone size={14} /> +971 55 535 5286
          </a>
          <a href="mailto:info@kingfisherwings.com" className="flex items-center gap-2 hover:text-white">
            <Mail size={14} /> info@kingfisherwings.com
          </a>
          <Link to="/contact" className="flex items-center gap-2 hover:text-white">
            Enquiry
          </Link>
        </div>
      )}
    </header>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// HERO BACKGROUND — detailed inline SVG freight scene
// Replaces the photo from the reference image with an open-source SVG.
// When a real photo asset is available, swap <HeroSvg /> for:
//   <img src="/hero-bg.jpg" className="absolute inset-0 w-full h-full object-cover" alt="" aria-hidden="true" />
// ─────────────────────────────────────────────────────────────────────────
function HeroSvg() {
  return (
    <svg
      viewBox="0 0 1320 380"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
    >
      <defs>
        {/* Sky gradient */}
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#0F2B4E" />
          <stop offset="60%"  stopColor="#163454" />
          <stop offset="100%" stopColor="#0A1F35" />
        </linearGradient>
        {/* Water gradient */}
        <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor="#0B2D4E" />
          <stop offset="100%" stopColor="#071829" />
        </linearGradient>
        {/* Glow for plane */}
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        {/* World-map dot pattern */}
        <pattern id="dots" x="0" y="0" width="28" height="22" patternUnits="userSpaceOnUse">
          <circle cx="4" cy="4" r="1.6" fill="rgba(255,255,255,0.11)" />
        </pattern>
        {/* Vignette overlay */}
        <radialGradient id="vignette" cx="50%" cy="40%" r="75%">
          <stop offset="0%"   stopColor="transparent" />
          <stop offset="100%" stopColor="rgba(5,15,30,0.65)" />
        </radialGradient>
        {/* Horizon glow */}
        <radialGradient id="hglow" cx="50%" cy="0%" r="100%">
          <stop offset="0%"   stopColor="rgba(245,118,31,0.18)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>

      {/* Sky */}
      <rect width="1320" height="380" fill="url(#sky)" />
      {/* Dot-map texture */}
      <rect width="1320" height="380" fill="url(#dots)" />
      {/* Horizon orange glow */}
      <ellipse cx="660" cy="210" rx="700" ry="140" fill="url(#hglow)" />

      {/* ── STARS (sparse) ─────────────────────────────────────────── */}
      {[
        [80,30],[180,18],[320,45],[450,22],[600,38],[780,15],[920,50],[1050,28],[1200,40],[1280,20],
        [150,60],[400,55],[700,12],[1100,55],[1250,68],[60,80],[900,25],[350,10],[1000,42],[500,70],
      ].map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r={Math.random()*1+0.5} fill="rgba(255,255,255,0.7)" />
      ))}

      {/* ── PORT INFRASTRUCTURE (right side) ───────────────────────── */}
      {/* Quay crane 1 */}
      <g transform="translate(920,60)">
        <rect x="0"   y="60" width="8"  height="140" fill="#1E3A5F" />
        <rect x="-2"  y="55" width="12" height="8"   fill="#25496E" />
        {/* Boom */}
        <rect x="-60" y="50" width="70" height="6"   fill="#1E3A5F" />
        <rect x="-60" y="50" width="6"  height="50"  fill="#1E3A5F" />
        {/* Trolley */}
        <rect x="-35" y="44" width="14" height="8"   fill="#2A5280" />
        <line x1="-28" y1="52" x2="-28" y2="72"     stroke="#1A3050" strokeWidth="1.5" />
        {/* Hook */}
        <rect x="-32" y="72" width="9" height="6"    fill="#3A6A99" />
        {/* Tower diagonals */}
        <line x1="-60" y1="55" x2="4"  y2="80"  stroke="#1A3050" strokeWidth="2" />
        <line x1="0"   y1="70" x2="-50" y2="55" stroke="#1A3050" strokeWidth="1.5" />
        {/* Counterweight */}
        <rect x="6"  y="52" width="20" height="14"   fill="#162B45" />
        {/* Legs */}
        <rect x="-12" y="195" width="8" height="15" fill="#1E3A5F" />
        <rect x="6"   y="195" width="8" height="15" fill="#1E3A5F" />
      </g>

      {/* Quay crane 2 (taller) */}
      <g transform="translate(1040,30)">
        <rect x="0"  y="80" width="9"  height="170" fill="#1A3254" />
        <rect x="-70" y="74" width="80" height="7"  fill="#1A3254" />
        <rect x="-70" y="74" width="7"  height="60" fill="#1A3254" />
        <line x1="-70" y1="78" x2="5"  y2="100"    stroke="#152A45" strokeWidth="2" />
        <rect x="8"  y="72" width="18" height="15"  fill="#122238" />
        <rect x="-10" y="238" width="9" height="15" fill="#1A3254" />
        <rect x="6"   y="238" width="9" height="15" fill="#1A3254" />
      </g>

      {/* ── CONTAINER SHIP ─────────────────────────────────────────── */}
      <g transform="translate(580,210)">
        {/* Hull */}
        <path d="M0 80 L520 80 L540 50 L-18 50 Z" fill="#1C3D6A" />
        {/* Hull bottom */}
        <path d="M-18 50 L540 50 L560 70 L0 80 Z" fill="#16304F" />
        {/* Waterline stripe */}
        <rect x="-16" y="72" width="556" height="8" fill="#E05A15" />

        {/* Deck */}
        <rect x="0" y="20" width="520" height="32" fill="#1E4070" />

        {/* Containers — row 1 (bottom) */}
        {[0,38,76,114,152,190,228,266,304,342,380,418].map((x,i) => (
          <rect key={`c1-${i}`} x={x+4} y={-2} width="32" height="22" rx="1.5"
            fill={['#C0392B','#E67E22','#27AE60','#2980B9','#8E44AD','#C0392B','#F39C12','#1ABC9C','#E74C3C','#3498DB','#E67E22','#27AE60'][i % 12]} />
        ))}
        {/* Containers — row 2 */}
        {[0,38,76,114,152,190,228,266,304,342,380,418].map((x,i) => (
          <rect key={`c2-${i}`} x={x+4} y={-26} width="32" height="22" rx="1.5"
            fill={['#2980B9','#C0392B','#F39C12','#27AE60','#E74C3C','#8E44AD','#E67E22','#1ABC9C','#C0392B','#3498DB','#27AE60','#E67E22'][i % 12]} />
        ))}
        {/* Containers — row 3 (partial) */}
        {[0,38,76,114,152,190,228,266,304].map((x,i) => (
          <rect key={`c3-${i}`} x={x+4} y={-48} width="32" height="20" rx="1.5"
            fill={['#E74C3C','#1ABC9C','#E67E22','#C0392B','#3498DB','#27AE60','#8E44AD','#E67E22','#F39C12'][i % 9]} />
        ))}

        {/* Bridge / superstructure */}
        <rect x="430" y="-70" width="72" height="90" rx="2" fill="#1C3A62" />
        <rect x="438" y="-60" width="14" height="10" rx="1" fill="#8ABBE0" opacity="0.6" />
        <rect x="456" y="-60" width="14" height="10" rx="1" fill="#8ABBE0" opacity="0.6" />
        <rect x="474" y="-60" width="14" height="10" rx="1" fill="#8ABBE0" opacity="0.6" />
        <rect x="438" y="-44" width="14" height="10" rx="1" fill="#8ABBE0" opacity="0.4" />
        <rect x="456" y="-44" width="14" height="10" rx="1" fill="#8ABBE0" opacity="0.4" />
        {/* Funnel */}
        <rect x="454" y="-92" width="24" height="26" rx="3" fill="#C0392B" />
        <rect x="458" y="-108" width="16" height="18" rx="2" fill="#A93226" />
        {/* Smoke */}
        <ellipse cx="466" cy="-112" rx="10" ry="5" fill="rgba(180,180,180,0.3)" />
        <ellipse cx="470" cy="-122" rx="8"  ry="4" fill="rgba(180,180,180,0.2)" />

        {/* Mast & antenna */}
        <rect x="490" y="-130" width="3" height="44" fill="#25496E" />
        <line x1="491" y1="-130" x2="502" y2="-128" stroke="#1E3A5F" strokeWidth="1.5" />
        <line x1="491" y1="-125" x2="480" y2="-123" stroke="#1E3A5F" strokeWidth="1.5" />
      </g>

      {/* ── WATER / SEA ─────────────────────────────────────────────── */}
      <rect x="0" y="290" width="1320" height="90" fill="url(#water)" />
      {/* Wave 1 */}
      <path d="M0 292 Q100 286 200 292 T400 292 T600 292 T800 292 T1000 292 T1200 292 T1320 292 L1320 380 L0 380Z"
        fill="#0A2540" opacity="0.8" />
      {/* Wave 2 */}
      <path d="M0 300 Q80 295 160 300 T320 300 T480 300 T640 300 T800 300 T960 300 T1120 300 T1320 300 L1320 380 L0 380Z"
        fill="#07192E" opacity="0.7" />
      {/* Water sheen */}
      <path d="M100 295 Q200 290 300 295" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" fill="none" />
      <path d="M500 298 Q620 293 740 298" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" fill="none" />
      <path d="M900 294 Q1020 289 1140 294" stroke="rgba(255,255,255,0.07)" strokeWidth="1.5" fill="none" />

      {/* ── TRUCK (road freight, right foreground) ─────────────────── */}
      <g transform="translate(880,252)">
        {/* Trailer */}
        <rect x="0"   y="0" width="200" height="52" rx="3" fill="#E8EAED" />
        <rect x="4"   y="4" width="192" height="44" rx="2" fill="#D5D8DC" />
        {/* KF branding on trailer */}
        <rect x="20" y="12" width="120" height="28" rx="2" fill={NAVY} />
        <text x="80" y="31" textAnchor="middle" fill={ORANGE} fontSize="11" fontWeight="700" fontFamily="sans-serif">KINGFISHER</text>
        {/* Cab */}
        <path d="M200 4 H260 Q274 4 278 16 L286 48 L286 56 H200 Z" fill={ORANGE} />
        {/* Windshield */}
        <path d="M208 8 H254 Q262 8 266 16 L272 42 H208 Z" fill={NAVY} opacity="0.55" />
        {/* Bumper */}
        <rect x="282" y="44" width="8"  height="14" rx="2" fill="#BDC3C7" />
        {/* Exhaust pipe */}
        <rect x="196" y="-14" width="6" height="18" rx="1" fill="#95A5A6" />
        <ellipse cx="199" cy="-15" rx="5" ry="3" fill="#7F8C8D" />
        {/* Wheels */}
        {[28,80,132,236,268].map((x,i) => (
          <g key={i}>
            <circle cx={x} cy="56" r="14" fill={NAVY} />
            <circle cx={x} cy="56" r="9"  fill="#2C3E50" />
            <circle cx={x} cy="56" r="4"  fill="#95A5A6" />
          </g>
        ))}
        {/* Running lights */}
        <circle cx="285" cy="20" r="3" fill="#F1C40F" opacity="0.9" />
        <circle cx="285" cy="30" r="2" fill="#E74C3C" opacity="0.8" />
      </g>

      {/* ── AIRPLANE ────────────────────────────────────────────────── */}
      <g className="kf-plane" transform="translate(200,55) rotate(-6)" filter="url(#glow)">
        {/* Fuselage */}
        <ellipse cx="130" cy="18" rx="130" ry="16" fill="white" />
        {/* Nose */}
        <path d="M255 18 Q278 18 285 22 L285 14 Q278 18 255 18Z" fill="#E8EAED" />
        {/* Tail fin */}
        <path d="M8 14 Q-8 -8 -18 -40 L-4 -40 Q6 -12 18 14Z" fill="white" />
        {/* Tail horizontal stabilizer */}
        <path d="M4 20 L-22 8 L-20 4 L8 16Z" fill="#E8EAED" />
        <path d="M4 16 L-22 26 L-20 30 L8 20Z" fill="#E8EAED" />
        {/* Main wings */}
        <path d="M80 20 L30 62 L38 64 L100 24Z"  fill="white" />
        <path d="M80 16 L30 -28 L38 -30 L100 12Z" fill="white" />
        {/* Wing engines */}
        <ellipse cx="66" cy="62" rx="12" ry="5" fill="#D5D8DC" transform="rotate(-5,66,62)" />
        <ellipse cx="72" cy="-26" rx="12" ry="5" fill="#D5D8DC" transform="rotate(5,72,-26)" />
        {/* Windows */}
        {[200,218,236,254].map((x,i) => (
          <rect key={i} x={x} y="13" width="10" height="8" rx="2" fill="#AED6F1" opacity="0.7" />
        ))}
        {/* KF stripe */}
        <rect x="20" y="25" width="240" height="4" rx="1" fill={ORANGE} opacity="0.7" />
        {/* Engine trail */}
        <path d="M0 18 L-60 24 L-55 18 L-60 12 Z" fill="rgba(255,255,255,0.25)" />
      </g>

      {/* ── LIGHT BEAMS / RAYS from horizon ───────────────────────── */}
      <g opacity="0.06">
        {[-200,-100,0,100,200,300,400].map((offset,i) => (
          <path key={i}
            d={`M${660+offset} 210 L${560+offset*2} -10 L${580+offset*2} -10 Z`}
            fill="white"
          />
        ))}
      </g>

      {/* Vignette overlay */}
      <rect width="1320" height="380" fill="url(#vignette)" />

      {/* Subtle left fade for text readability */}
      <linearGradient id="lfade" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%"  stopColor="rgba(11,30,58,0.55)" />
        <stop offset="55%" stopColor="transparent" />
      </linearGradient>
      <rect width="1320" height="380" fill="url(#lfade)" />
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// PORTAL CARDS
// ─────────────────────────────────────────────────────────────────────────
interface PortalLink {
  label: string; to: string; primary?: boolean; openLogin?: boolean
}
interface PortalCard {
  icon: ComponentType<{ size?: number; className?: string; strokeWidth?: number; style?: any }>
  title: string
  description: string
  links: PortalLink[]
}

const PRIMARY_CARDS: PortalCard[] = [
  {
    icon: ShieldCheck,
    title: 'Single Sign-On',
    description: 'Access all platforms with one login',
    links: [
      { label: 'KingFisher Login Link 1', to: '/login', primary: true, openLogin: true },
      { label: 'KingFisher Login Link 2', to: '/login', openLogin: true },
      { label: 'KingFisher Login Link 3', to: '/login', openLogin: true },
    ],
  },
  {
    icon: Cloud,
    title: 'Private SAAS Login',
    description: 'Access your private SAAS portal',
    links: [
      { label: 'Private Login 1', to: '/login', primary: true, openLogin: true },
      { label: 'Private Login 2', to: '/login', openLogin: true },
      { label: 'Private Login 3', to: '/login', openLogin: true },
    ],
  },
  {
    icon: Database,
    title: 'Old Data Access',
    description: 'Access your old data and records',
    links: [
      { label: 'Please Contact Support', to: '/contact', primary: true },
    ],
  },
]

const SECONDARY_CARDS: PortalCard[] = [
  {
    icon: GraduationCap,
    title: 'KingFisher Training',
    description: 'Access online training and certification',
    links: [{ label: 'KingFisher Gold – Online Training', to: '/training', primary: true }],
  },
  {
    icon: LineChart,
    title: 'KingFisher Analytics',
    description: 'Access analytics and insights portal',
    links: [{ label: 'Analytics Demo Login', to: '/analytics', primary: true }],
  },
]

function PortalBtn({
  label, to, primary, openLogin, onLoginClick,
}: PortalLink & { onLoginClick?: () => void }) {
  const base = [
    'group flex items-center justify-between gap-2 w-full rounded-lg px-4 py-[11px]',
    'text-[12.5px] font-semibold transition-all duration-200',
    'hover:-translate-y-0.5 active:translate-y-0',
  ].join(' ')

  if (openLogin && onLoginClick) {
    return (
      <button type="button" onClick={onLoginClick}
        className={`${base} ${primary
          ? 'text-white'
          : 'border-[1.5px] border-slate-200 bg-white text-slate-600 hover:bg-[#0B1E3A] hover:border-[#0B1E3A] hover:text-white'}`}
        style={primary ? { background: NAVY } : undefined}
        onMouseEnter={e => { if (primary) (e.currentTarget as HTMLElement).style.background = ORANGE }}
        onMouseLeave={e => { if (primary) (e.currentTarget as HTMLElement).style.background = NAVY }}
      >
        <span className="truncate">{label}</span>
        <ArrowRight size={14} strokeWidth={2.5} className="shrink-0 transition-transform group-hover:translate-x-1" />
      </button>
    )
  }
  return (
    <Link to={to}
      className={`${base} ${primary
        ? 'text-white'
        : 'border-[1.5px] border-slate-200 bg-white text-slate-600 hover:bg-[#0B1E3A] hover:border-[#0B1E3A] hover:text-white'}`}
      style={primary ? { background: NAVY } : undefined}
      onMouseEnter={e => { if (primary) (e.currentTarget as HTMLElement).style.background = ORANGE }}
      onMouseLeave={e => { if (primary) (e.currentTarget as HTMLElement).style.background = NAVY }}
    >
      <span className="truncate">{label}</span>
      <ArrowRight size={14} strokeWidth={2.5} className="shrink-0 transition-transform group-hover:translate-x-1" />
    </Link>
  )
}

function Card({ icon: Icon, title, description, links, delay = 0, onLoginClick }: PortalCard & { delay?: number; onLoginClick: () => void }) {
  return (
    <div className="kf-up rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_1px_4px_rgba(11,30,58,0.07)] hover:shadow-[0_12px_28px_rgba(11,30,58,0.11)] transition-shadow duration-300"
      style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-start gap-4 mb-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border"
          style={{ background: '#FFF6EE', borderColor: '#FBDFC4' }}>
          <Icon size={20} strokeWidth={1.75} style={{ color: ORANGE }} />
        </div>
        <div>
          <h3 className="text-[15px] font-bold leading-snug" style={{ color: NAVY }}>{title}</h3>
          <p className="text-[12.5px] text-slate-400 leading-snug mt-0.5">{description}</p>
          <span className="mt-2 block h-[2px] w-8 rounded-full" style={{ background: ORANGE }} />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {links.map(l => (
          <PortalBtn key={l.label} {...l} onLoginClick={l.openLogin ? onLoginClick : undefined} />
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// LOGIN MODAL
// ─────────────────────────────────────────────────────────────────────────
function LoginModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate()
  const { login, isLoading } = useAuthStore()
  const [showPw, setShowPw]   = useState(false)
  const [apiErr, setApiErr]   = useState<string | null>(null)
  const inputRef              = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm<FormValues>({
    resolver: zodResolver(schema), mode: 'onTouched',
  })

  const ev = watch('email'); const pv = watch('password')
  useEffect(() => { if (apiErr) setApiErr(null) }, [ev, pv]) // eslint-disable-line

  useEffect(() => {
    if (open)  setTimeout(() => inputRef.current?.focus(), 80)
    if (!open) { reset(); setApiErr(null); setShowPw(false) }
  }, [open, reset])

  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [open, onClose])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const onSubmit = async (v: FormValues) => {
    if (isLoading) return
    setApiErr(null)
    await login(v.email, v.password, 'Fresa Gold' as never)
    const s = useAuthStore.getState()
    if (s.isAuthenticated) { onClose(); navigate('/dashboard') }
    else setApiErr(s.error ?? 'Incorrect email or password.')
  }

  if (!open) return null

  const inp = 'w-full h-11 rounded-lg border px-4 text-sm outline-none transition-all duration-200 text-slate-800 bg-white placeholder-slate-400 disabled:opacity-50'
  const { ref: emailRegisterRef, ...emailRegister } = register('email')

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />
      <div role="dialog" aria-modal="true" aria-label="Sign in" className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="relative w-full max-w-[400px] rounded-2xl bg-white shadow-2xl overflow-hidden">

          {/* Header */}
          <div className="px-8 pt-8 pb-6 text-center" style={{ background: NAVY }}>
            <KfWordmark centered />
            <h2 className="mt-5 text-[22px] font-extrabold text-white tracking-tight">Sign In</h2>
            <p className="mt-1 text-[13px] text-[#8BAACE]">Access your KingFisher portal</p>
            <span className="mt-3 block mx-auto h-[3px] w-12 rounded-full" style={{ background: ORANGE }} />
          </div>

          <button type="button" onClick={onClose} aria-label="Close"
            className="absolute top-4 right-4 p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors">
            <X size={16} />
          </button>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="px-8 py-7 space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="kf-email" className="block text-[11.5px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                <input ref={el => {
                    emailRegisterRef(el)
                    inputRef.current = el
                  }}
                  id="kf-email" type="email" autoComplete="email"
                  placeholder="you@company.com" disabled={isLoading} aria-invalid={!!errors.email}
                  {...emailRegister}
                  className={`${inp} pl-10 ${errors.email
                    ? 'border-red-300 ring-2 ring-red-100'
                    : 'border-slate-200 focus:border-[#F5761F] focus:ring-2 focus:ring-[#F5761F]/15'}`} />
              </div>
              {errors.email && <p role="alert" className="mt-1.5 flex items-center gap-1 text-[11px] text-red-500"><AlertCircle size={11} />{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="kf-pw" className="block text-[11.5px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                <input id="kf-pw" type={showPw ? 'text' : 'password'} autoComplete="current-password"
                  placeholder="••••••••" disabled={isLoading} aria-invalid={!!errors.password}
                  {...register('password')}
                  className={`${inp} pl-10 pr-10 [&::-ms-reveal]:hidden ${errors.password
                    ? 'border-red-300 ring-2 ring-red-100'
                    : 'border-slate-200 focus:border-[#F5761F] focus:ring-2 focus:ring-[#F5761F]/15'}`} />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p role="alert" className="mt-1.5 flex items-center gap-1 text-[11px] text-red-500"><AlertCircle size={11} />{errors.password.message}</p>}
            </div>

            <div className="flex justify-end -mt-1">
              <Link to="/forgot-password" onClick={onClose} className="text-[12px] font-semibold transition-colors" style={{ color: ORANGE }}
                onMouseEnter={e => (e.currentTarget.style.color = ORANGE_D)}
                onMouseLeave={e => (e.currentTarget.style.color = ORANGE)}>
                Forgot your password?
              </Link>
            </div>

            {apiErr && (
              <div role="alert" className="flex items-start gap-2.5 rounded-lg px-3.5 py-3 text-[12px] text-red-600"
                style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
                <AlertCircle size={14} className="mt-0.5 shrink-0" /><span>{apiErr}</span>
              </div>
            )}

            <button type="submit" disabled={isLoading} aria-busy={isLoading}
              className="w-full h-11 rounded-lg text-[13.5px] font-bold text-white flex items-center justify-center gap-2 transition-all duration-250 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(245,118,31,0.4)] disabled:opacity-60 disabled:cursor-not-allowed mt-1"
              style={{ background: isLoading ? NAVY : ORANGE }}
              onMouseEnter={e => { if (!isLoading) (e.currentTarget as HTMLElement).style.background = ORANGE_D }}
              onMouseLeave={e => { if (!isLoading) (e.currentTarget as HTMLElement).style.background = ORANGE }}>
              {isLoading
                ? <><Loader2 size={15} className="animate-spin" />Signing in…</>
                : <>Sign In <ArrowRight size={14} strokeWidth={2.5} /></>}
            </button>

            <p className="text-center text-[11px] text-slate-400 pt-1">
              Need access?{' '}
              <Link to="/contact" onClick={onClose} className="font-semibold hover:underline" style={{ color: ORANGE }}>Contact Support</Link>
            </p>
          </form>
        </div>
      </div>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const [loginOpen,    setLoginOpen]    = useState(false)
  const [supportHover, setSupportHover] = useState(false)

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <Navbar onLoginClick={() => setLoginOpen(true)} />

      <main className="mx-auto max-w-[1320px] px-5 sm:px-8">

        {/* ── Hero ─────────────────────────────────────────────────── */}
        <section className="kf-up relative mt-6 overflow-hidden rounded-2xl h-[300px] md:h-[360px]">
          {/* Hero photo — from src/assets/hero-freight.jpg, imported as heroBg */}
          <img src={heroBg} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover object-center" />
          {/* Gradient overlay — left-to-right fade keeps text readable */}
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(10,41,66,0.88) 0%, rgba(10,41,66,0.55) 50%, rgba(10,41,66,0.20) 100%)" }} />

          {/* Text overlay */}
          <div className="absolute inset-0 flex items-center z-10 px-8 md:px-14">
            <div className="max-w-[560px]">
              <span className="text-[11px] font-bold tracking-[0.22em] block" style={{ color: ORANGE }}>
                WELCOME TO
              </span>
              <h1 className="mt-2 text-[30px] sm:text-[38px] md:text-[44px] font-extrabold text-white leading-[1.05] tracking-tight">
                KINGFISHER WINGS
                <br />
                <span style={{ color: ORANGE }}>LOGISTICS PORTAL</span>
              </h1>
              <p className="mt-3 text-[14px] leading-relaxed max-w-[420px]" style={{ color: '#B0C4D8' }}>
                Your All-in-One Platform for Seamless Logistics Management &amp; Digital Solutions
              </p>
            </div>
          </div>

          {/* Scroll cue */}
          <button
            type="button"
            aria-label="Scroll to portal options"
            onClick={() => document.getElementById('kf-portals')?.scrollIntoView({ behavior: 'smooth' })}
            className="kf-bounce absolute -bottom-4 left-1/2 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-lg shadow-lg z-10 transition-transform hover:scale-110"
            style={{ background: ORANGE }}
          >
            <ChevronDown size={16} className="text-white" strokeWidth={3} />
          </button>
        </section>

        {/* ── Primary cards ─────────────────────────────────────────── */}
        <section id="kf-portals" className="grid gap-5 md:grid-cols-3 mt-12">
          {PRIMARY_CARDS.map((c, i) => (
            <Card key={c.title} {...c} delay={i * 80} onLoginClick={() => setLoginOpen(true)} />
          ))}
        </section>

        {/* ── Secondary cards ──────────────────────────────────────── */}
        <section className="grid gap-5 sm:grid-cols-2 max-w-3xl mx-auto mt-5">
          {SECONDARY_CARDS.map((c, i) => (
            <Card key={c.title} {...c} delay={i * 80} onLoginClick={() => setLoginOpen(true)} />
          ))}
        </section>

        {/* ── Notice bar ────────────────────────────────────────────── */}
        <section
          className="kf-up mt-10 mb-4 rounded-2xl px-6 py-5 flex flex-col lg:flex-row items-start lg:items-center gap-5 lg:gap-10"
          style={{ background: NAVY }}
        >
          <div className="flex items-start gap-3 flex-1">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: ORANGE }}>
              <Settings size={18} className="text-white" />
            </span>
            <div>
              <p className="text-[13px] font-bold" style={{ color: ORANGE }}>System Maintenance Notice</p>
              <p className="text-[12px] text-[#AEBBD1] leading-snug mt-0.5">
                Our systems will undergo scheduled maintenance every Sunday at 08:00 AM (UAE Time) for 15 to 30 minutes.
              </p>
            </div>
          </div>
          <div className="hidden lg:block h-10 w-px bg-white/10" />
          <div className="flex items-start gap-3 flex-1">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
              <Headphones size={18} className="text-white" />
            </span>
            <div>
              <p className="text-[13px] font-bold text-white">Need Support?</p>
              <p className="text-[12px] text-[#AEBBD1] leading-snug mt-0.5">
                If you face any issues accessing the portal, our support team is here to help you.
              </p>
            </div>
          </div>
          <Link
            to="/contact"
            onMouseEnter={() => setSupportHover(true)}
            onMouseLeave={() => setSupportHover(false)}
            className="flex items-center gap-2 rounded-lg border-[1.5px] px-5 py-2.5 text-[12.5px] font-semibold text-white shrink-0 transition-all duration-250"
            style={{ borderColor: ORANGE, background: supportHover ? ORANGE : 'transparent' }}
          >
            Contact Support
            <ArrowRight size={14} className={`transition-transform duration-250 ${supportHover ? 'translate-x-1' : ''}`} />
          </Link>
        </section>
      </main>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 bg-white py-5">
        <div className="mx-auto max-w-[1320px] px-6 flex flex-col sm:flex-row items-center justify-center gap-2 text-[12px] text-slate-400">
          <span>© {new Date().getFullYear()} KingFisher Wings.</span>
          <span className="flex items-center gap-1.5">
            KingFisher Technology by
            <CrewMark />
            <span className="font-semibold text-slate-500">Crew Innovations</span>
          </span>
        </div>
      </footer>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />

      <style>{`
        @keyframes kf-up {
          from { opacity:0; transform:translateY(16px) }
          to   { opacity:1; transform:translateY(0) }
        }
        .kf-up { animation: kf-up 0.55s cubic-bezier(.22,1,.36,1) both }

        @keyframes kf-bounce {
          0%,100% { transform:translate(-50%,0) }
          50%     { transform:translate(-50%,6px) }
        }
        .kf-bounce { animation: kf-bounce 1.8s ease-in-out infinite }

        @keyframes kf-plane {
          0%,100% { transform:translate(200px,55px) rotate(-6deg) }
          50%     { transform:translate(200px,36px) rotate(-4deg) }
        }
        .kf-plane { animation: kf-plane 4.2s ease-in-out infinite }

        @media (prefers-reduced-motion:reduce) {
          .kf-up,.kf-bounce,.kf-plane { animation:none!important }
        }
      `}</style>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// BRAND MARKS
// ─────────────────────────────────────────────────────────────────────────
function KfWordmark({ centered = false }: { centered?: boolean }) {
  return (
    <Link
      to="/"
      aria-label="KingFisher Wings home"
      className={`flex items-center gap-2.5 shrink-0 ${centered ? 'justify-center' : ''}`}
    >
      {/* Reconstructed kingfisher bird SVG — swap for official logo when available */}
      <svg width="34" height="34" viewBox="0 0 40 40" aria-hidden="true">
        <path d="M4 24 C10 8, 22 4, 36 10 C28 13, 21 19, 19 27 C15 21, 9 21, 4 24 Z" fill={ORANGE} />
        <path d="M7 27 C13 15, 23 13, 31 17 C23 18, 18 24, 17 32 C13 27, 9 26, 7 27 Z" fill={NAVY} />
        <circle cx="30" cy="11" r="3" fill="white" opacity="0.9" />
      </svg>
      <span className="leading-none">
        <span className="block text-[17px] font-extrabold tracking-tight text-white">KingFisher</span>
        <span className="block text-[10.5px] font-bold tracking-[0.28em]" style={{ color: ORANGE }}>WINGS</span>
      </span>
    </Link>
  )
}

function CrewMark() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
      <circle cx="12" cy="12" r="11" fill="none" stroke={ORANGE} strokeWidth="1.4" />
      <path d="M8 15 L8 9 L12 9 A3 3 0 0 1 12 15 L10.5 15 L14 18"
        fill="none" stroke={ORANGE} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}