import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { Menu, X, Phone, Mail, FileText } from 'lucide-react'
import { NAV_LINKS } from '@/constants/marketingData'

export default function Navbar() {
  const [open, setOpen] = useState(false)

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    [
      'text-sm font-medium px-4 py-1.5 rounded-md transition-colors',
      isActive
        ? 'bg-[#0EA5E9] text-white'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
    ].join(' ')

  return (
    <header className="sticky top-0 z-50">

      {/* ── Top utility bar ───────────────────────────────────────────── */}
      <div style={{  background: `
          linear-gradient(180deg, rgba(15,42,61,0.85) 0%, rgba(15,42,61,0.55) 100%),
          radial-gradient(circle at 70% 40%, rgba(14,165,233,0.35), transparent 65%),
          linear-gradient(135deg, #1E3A52 0%, #0F2A3D 50%, #15324A 100%)
        `,
        backgroundColor: '#0F2A3D', }} className="py-2">
        <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <a
              href="tel:+919344912004"
              className="flex items-center gap-1.5 text-[#fff] hover:text-white text-xs transition-colors"
            >
              <Phone size={12} aria-hidden="true" />
              +91 93449 12004
            </a>
            <a
              href="mailto:sales@KingFisher Techtechnologies.com"
              className="hidden sm:flex items-center gap-1.5 text-[#fff] hover:text-white text-xs transition-colors"
            >
              <Mail size={12} aria-hidden="true" />
              sales@KingFisher Techtechnologies.com
            </a>
          </div>
          <div className="flex items-center gap-5">
            <a
              href="/contact"
              className="flex items-center gap-1.5 text-[#fff] hover:text-white text-xs transition-colors"
            >
              <FileText size={12} aria-hidden="true" />
              Enquiry
            </a>
            <Link
              to="/login"
              className="flex items-center gap-1.5 text-[#38BDF8] hover:text-white text-xs font-medium transition-colors"
            >
              Login
            </Link>
          </div>
        </div>
      </div>

      {/* ── Main navbar ───────────────────────────────────────────────── */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between gap-8">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 bg-[#0EA5E9] rounded-lg flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M8 2C5 2 2.5 4.5 2.5 7.5c0 1.5.6 2.8 1.5 3.8L8 14l4-2.7c.9-1 1.5-2.3 1.5-3.8C13.5 4.5 11 2 8 2z" fill="white" opacity=".9"/>
                <circle cx="8" cy="7.5" r="2" fill="#0B1120"/>
              </svg>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900 leading-tight">KingFisher Tech Gold</div>
              <div className="text-[10px] text-gray-400 leading-tight">by KingFisher Tech Technologies</div>
            </div>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center" aria-label="Main navigation">
            {NAV_LINKS.map(({ label, to }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={navLinkClass}
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Desktop right CTAs */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <Link
              to="/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-300 px-4 py-1.5 rounded-md transition-colors"
            >
              Login
            </Link>
            <Link
              to="/contact"
              className="text-sm font-medium text-white bg-[#0EA5E9] hover:bg-[#0284C7] px-4 py-1.5 rounded-md transition-colors"
            >
              Book a Demo
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
        </div>
      </nav>

      {/* ── Mobile drawer ─────────────────────────────────────────────── */}
      {open && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 right-0 w-72 bg-white z-50 shadow-xl flex flex-col md:hidden">
            <div className="flex items-center justify-between px-6 h-16 border-b border-gray-200">
              <span className="font-medium text-gray-900 text-sm">Menu</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>
            <nav className="flex flex-col px-4 py-4 gap-1" aria-label="Mobile navigation">
              {NAV_LINKS.map(({ label, to }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    [
                      'px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-[#E0F2FE] text-[#0EA5E9]'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                    ].join(' ')
                  }
                  onClick={() => setOpen(false)}
                >
                  {label}
                </NavLink>
              ))}
            </nav>
            <div className="px-4 mt-auto pb-8 flex flex-col gap-3 border-t border-gray-100 pt-4">
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-center text-gray-700 border border-gray-200 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/contact"
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-center text-white bg-[#0EA5E9] hover:bg-[#0284C7] px-4 py-2.5 rounded-lg transition-colors"
              >
                Book a Demo
              </Link>
            </div>
          </div>
        </>
      )}
    </header>
  )
}