import Navbar from '@/components/marketing/Navbar'
import Footer from '@/components/marketing/Footer'
import Hero from '@/components/marketing/sections/Hero'
import TrustBar from '@/components/marketing/sections/TrustBar'
import Features from '@/components/marketing/sections/Features'
import Modules from '@/components/marketing/sections/Modules'
import Testimonials from '@/components/marketing/sections/Testimonials'
import CTASection from '@/components/marketing/sections/CTASection'

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <TrustBar />
        <Features />
        <Modules />
        <Testimonials />
        <CTASection />
      </main>
      <Footer />
    </>
  )
}