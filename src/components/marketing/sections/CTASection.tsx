import { Link } from 'react-router-dom'

export default function CTASection() {
  return (
    <section style={{ backgroundColor: '#0A1F12' }} className="py-20 text-center">
      <div className="max-w-[1200px] mx-auto px-6">
        <h2 className="text-3xl font-medium text-white">
          Ready to modernise your freight operations?
        </h2>
        <p className="text-[#7aab8a] mt-4 text-base max-w-md mx-auto leading-relaxed">
          Join 1000+ companies using Fresa Gold to run smarter, faster freight businesses.
        </p>
        <Link
          to="/contact"
          className="inline-block mt-8 bg-[#1a6e38] hover:bg-[#145530] text-white font-medium text-sm px-8 py-4 rounded-lg transition-colors"
        >
          Book a Free Demo
        </Link>
      </div>
    </section>
  )
}