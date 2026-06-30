import { Link } from 'react-router-dom'

export default function CTASection() {
  return (
    <section style={{  background: `
          linear-gradient(180deg, rgba(15,42,61,0.85) 0%, rgba(15,42,61,0.55) 100%),
          radial-gradient(circle at 70% 40%, rgba(14,165,233,0.35), transparent 65%),
          linear-gradient(135deg, #1E3A52 0%, #0F2A3D 50%, #15324A 100%)
        `,
        backgroundColor: '#0F2A3D', }} className="py-20 text-center">
      <div className="max-w-[1200px] mx-auto px-6">
        <h2 className="text-3xl font-medium text-white">
          Ready to modernise your freight operations?
        </h2>
        <p className="text-[#94A3B8] mt-4 text-base max-w-md mx-auto leading-relaxed">
          Join 1000+ companies using Fresa Gold to run smarter, faster freight businesses.
        </p>
        <Link
          to="/contact"
          className="inline-block mt-8 bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-medium text-sm px-8 py-4 rounded-lg transition-colors"
        >
          Book a Free Demo
        </Link>
      </div>
    </section>
  )
}