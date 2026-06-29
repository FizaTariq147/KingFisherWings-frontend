import { Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import Navbar from '@/components/marketing/Navbar'
import Footer from '@/components/marketing/Footer'
import CTASection from '@/components/marketing/sections/CTASection'

interface PlanFeature {
  text: string
}

interface Plan {
  name: string
  tier: string
  description: string
  features: PlanFeature[]
  cta: string
  ctaTo: string
  featured: boolean
}

const PLANS: Plan[] = [
  {
    name: 'Starter',
    tier: 'STARTER',
    description: 'For small teams getting started with freight software.',
    features: [
      { text: 'Air and sea FCL modules' },
      { text: 'Basic invoicing' },
      { text: 'Up to 5 users' },
      { text: 'Email support' },
    ],
    cta: 'Get started',
    ctaTo: '/contact',
    featured: false,
  },
  {
    name: 'Growth',
    tier: 'GROWTH',
    description: 'For growing forwarders who need the full feature set.',
    features: [
      { text: 'All 9 modules included' },
      { text: 'Unlimited users' },
      { text: 'Multi-branch support' },
      { text: 'UAE VAT compliance' },
      { text: 'Priority support' },
    ],
    cta: 'Book a demo',
    ctaTo: '/contact',
    featured: true,
  },
  {
    name: 'Enterprise',
    tier: 'ENTERPRISE',
    description: 'For large operations with custom integration needs.',
    features: [
      { text: 'Everything in Growth' },
      { text: 'Custom EDI integrations' },
      { text: 'Dedicated account manager' },
      { text: 'SLA-backed uptime' },
    ],
    cta: 'Contact sales',
    ctaTo: '/contact',
    featured: false,
  },
]

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="bg-[#F7F8FA] py-24">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="text-center mb-14">
              <p className="text-xs font-semibold text-[#1a6e38] uppercase tracking-widest mb-3">
                Pricing
              </p>
              <h1 className="text-4xl font-medium text-gray-900 mb-4">
                Simple, transparent plans
              </h1>
              <p className="text-gray-500 text-lg max-w-xl mx-auto">
                No hidden fees. Contact us for a quote tailored to your team size and region.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              {PLANS.map((plan) => (
                <div
                  key={plan.name}
                  className={[
                    'bg-white rounded-xl p-7 relative',
                    plan.featured
                      ? 'border-2 border-[#1a6e38]'
                      : 'border border-gray-200',
                  ].join(' ')}
                >
                  {plan.featured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-[#1a6e38] text-white text-xs font-semibold px-4 py-1 rounded-full whitespace-nowrap">
                        Most popular
                      </span>
                    </div>
                  )}

                  <p className="text-xs font-semibold text-[#1a6e38] tracking-widest mb-2">
                    {plan.tier}
                  </p>
                  <h2 className="text-xl font-medium text-gray-900 mb-2">{plan.name}</h2>
                  <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                    {plan.description}
                  </p>
                  <p className="text-sm font-semibold text-gray-400 mb-5">
                    Contact us for pricing
                  </p>

                  <ul className="flex flex-col gap-3 mb-7">
                    {plan.features.map(({ text }) => (
                      <li key={text} className="flex items-start gap-2.5 text-sm text-gray-600">
                        <Check size={15} className="text-[#1a6e38] mt-0.5 shrink-0" aria-hidden="true" />
                        {text}
                      </li>
                    ))}
                  </ul>

                  <Link
                    to={plan.ctaTo}
                    className={[
                      'block text-center text-sm font-medium py-2.5 rounded-lg transition-colors',
                      plan.featured
                        ? 'bg-[#1a6e38] hover:bg-[#145530] text-white'
                        : 'border border-[#1a6e38] text-[#1a6e38] hover:bg-[#e8f5ee]',
                    ].join(' ')}
                  >
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
        <CTASection />
      </main>
      <Footer />
    </>
  )
}