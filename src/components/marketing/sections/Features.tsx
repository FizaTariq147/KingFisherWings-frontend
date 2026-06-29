import { FileText, Ship, Clipboard, BarChart3, type LucideIcon } from 'lucide-react'
import { FEATURES } from '@/constants/marketingData'

const ICON_MAP: Record<string, LucideIcon> = {
  FileText,
  Ship,
  Clipboard,
  BarChart3,
}

export default function Features() {
  return (
    <section className="bg-white py-24">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold text-[#1a6e38] uppercase tracking-widest mb-3">
            Why Fresa Gold
          </p>
          <h2 className="text-3xl font-medium text-gray-900">
            Everything your freight team needs
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map(({ title, icon, desc }) => {
            const Icon = ICON_MAP[icon]
            return (
              <div
                key={title}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:border-[#1a6e38] transition-colors group"
              >
                <div className="w-10 h-10 bg-[#e8f5ee] rounded-lg flex items-center justify-center mb-4">
                  <Icon size={18} className="text-[#1a6e38]" aria-hidden="true" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}