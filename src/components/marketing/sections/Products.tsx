import { Cloud, Star, Smartphone, BarChart2, type LucideIcon } from 'lucide-react'

interface Product {
  name: string
  tagline: string
  description: string
  Icon: LucideIcon
}

const PRODUCTS: Product[] = [
  {
    name: 'KingFisher Tech Global',
    tagline: 'Enterprise freight platform',
    description: 'Full-scale multi-entity ERP for large freight conglomerates with consolidated reporting.',
    Icon: Cloud,
  },
  {
    name: 'KingFisher Tech Gold',
    tagline: 'Mid-market operations',
    description: 'Complete freight forwarding ERP — sea, air, land — built for growing teams.',
    Icon: Star,
  },
  {
    name: 'KingFisher Tech App',
    tagline: 'Mobile sales tool',
    description: 'Track leads, shipments, and quotations on the go for your field sales team.',
    Icon: Smartphone,
  },
  {
    name: 'KingFisher Tech Analytics',
    tagline: 'Business intelligence',
    description: 'Deep-dive MIS dashboards, lane profitability, and executive reporting suite.',
    Icon: BarChart2,
  },
]

export default function Products() {
  return (
    <section className="bg-[#F7F8FA] py-24">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold text-[#0EA5E9] uppercase tracking-widest mb-3">
            Our products
          </p>
          <h2 className="text-3xl font-medium text-gray-900">
            The complete KingFisher Tech suite
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PRODUCTS.map(({ name, tagline, description, Icon }) => (
            <div
              key={name}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:border-[#0EA5E9] transition-colors"
            >
              <div className="w-10 h-10 bg-[#E0F2FE] rounded-lg flex items-center justify-center mb-4">
                <Icon size={18} className="text-[#0EA5E9]" aria-hidden="true" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">{name}</h3>
              <p className="text-xs text-[#0EA5E9] font-medium mt-0.5 mb-3">{tagline}</p>
              <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}