import Navbar from '@/components/marketing/Navbar'
import Footer from '@/components/marketing/Footer'
import Modules from '@/components/marketing/sections/Modules'
import CTASection from '@/components/marketing/sections/CTASection'

export default function ModulesPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Page hero */}
        <section className="bg-[#F7F8FA] py-20 text-center">
          <div className="max-w-[1200px] mx-auto px-6">
            <p className="text-xs font-semibold text-[#0EA5E9] uppercase tracking-widest mb-3">
              Modules
            </p>
            <h1 className="text-4xl font-medium text-gray-900 mb-4">
              Every department. One system.
            </h1>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
              Fresa Gold covers every team in your freight company — from sales and
              operations to accounts, HR, and warehouse — all connected in one platform.
            </p>
          </div>
        </section>

        <Modules />
        <CTASection />
      </main>
      <Footer />
    </>
  )
}