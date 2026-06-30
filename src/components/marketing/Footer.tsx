import { Link } from 'react-router-dom'
import { Cloud, ExternalLink } from 'lucide-react'
import { FOOTER_LINKS } from '@/constants/marketingData'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 pt-16 pb-8">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 pb-12 border-b border-gray-200">

          {/* Col 1 — Logo + tagline */}
          <div>
            <Link to="/home" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#0EA5E9] rounded-lg flex items-center justify-center shrink-0">
                <Cloud size={16} className="text-white" aria-hidden="true" />
              </div>
              <span className="font-medium text-gray-900 text-sm">Fresa Gold</span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed mb-5 max-w-[200px]">
              Cloud-based freight forwarding ERP for growing teams worldwide.
            </p>
            <div className="flex flex-col gap-2">
              <a
                href="https://fresatechnologies.com/privacy"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors w-fit"
              >
                Privacy Policy
              </a>
              <a
                href="https://fresatechnologies.com/terms"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors w-fit"
              >
                Usage Policy
              </a>
            </div>
          </div>

          {/* Col 2 — Product */}
          <div>
            <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-widest mb-5">
              Product
            </h3>
            <ul className="flex flex-col gap-3">
              {FOOTER_LINKS.product.map(({ label, to }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Company */}
          <div>
            <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-widest mb-5">
              Company
            </h3>
            <ul className="flex flex-col gap-3">
              {FOOTER_LINKS.company.map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 — Contact + social */}
          <div>
            <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-widest mb-5">
              Contact
            </h3>
            <a
              href="mailto:sales@fresatechnologies.com"
              className="text-sm text-gray-500 hover:text-[#0EA5E9] transition-colors block mb-6"
            >
              sales@fresatechnologies.com
            </a>
            <div className="flex flex-col gap-3">
              {FOOTER_LINKS.social.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <ExternalLink size={13} aria-hidden="true" />
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} Fresa Technologies. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a
              href="https://fresatechnologies.com/privacy"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Privacy
            </a>
            <a
              href="https://fresatechnologies.com/terms"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}