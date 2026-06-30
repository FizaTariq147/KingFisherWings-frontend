import Navbar from '@/components/marketing/Navbar'
import Footer from '@/components/marketing/Footer'
import Features from '@/components/marketing/sections/Features'
import Products from '@/components/marketing/sections/Products'
import CTASection from '@/components/marketing/sections/CTASection'

export default function FeaturesPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Page hero */}
        <section className="bg-[#F7F8FA] py-20 text-center">
          <div className="max-w-[1200px] mx-auto px-6">
            <p className="text-xs font-semibold text-[#0EA5E9] uppercase tracking-widest mb-3">
              Features
            </p>
            <h1 className="text-4xl font-medium text-gray-900 mb-4">
              Built for every step of the shipment lifecycle
            </h1>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
              From the first enquiry to final payment — Fresa Gold covers every workflow
              your team needs, without stitching together multiple tools.
            </p>
          </div>
        </section>

        <Features />
        <Products />
        <CTASection />
      </main>
      <Footer />
    </>
  )
}