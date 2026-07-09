import { lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCanRender3D } from '@/hooks/useCanRender3D'

const HeroScene = lazy(() => import('../3d/HeroScene'))

// ── Animation variants ──────────────────────────────────────────────────
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const wordVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeInOut' as const } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeInOut' as const } },
}

const HEADLINE_LINE_1 = ['Freight', 'Management.']
const HEADLINE_LINE_2 = ['Reimagined.']

// ── Floating particle layer (CSS-driven, no JS animation loop) ────────────
function FloatingParticles() {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: 2 + Math.random() * 3,
    duration: 8 + Math.random() * 6,
    delay: Math.random() * 4,
  }))

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            background: '#0EA5E9',
            boxShadow: '0 0 6px rgba(14,165,233,0.6)',
          }}
          animate={{
            y: [0, -24, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

export default function Hero() {
  const canRender3D = useCanRender3D()

  return (
    <section
      className="relative overflow-hidden flex flex-col min-h-screen"
      style={{
        background: `
          linear-gradient(180deg, rgba(15,42,61,0.85) 0%, rgba(15,42,61,0.55) 100%),
          radial-gradient(circle at 70% 40%, rgba(14,165,233,0.35), transparent 65%),
          linear-gradient(135deg, #1E3A52 0%, #0F2A3D 50%, #15324A 100%)
        `,
        backgroundColor: '#0F2A3D',
      }}
    >
      <FloatingParticles />

      {/* Main hero content */}
      <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-2 max-w-[1200px] mx-auto px-6 w-full items-center py-20 gap-12">

        {/* LEFT — text */}
        <motion.div initial="hidden" animate="visible" variants={containerVariants}>
          {/* Badge */}
          <motion.div
            variants={fadeUp}
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium mb-6"
            style={{
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#38BDF8',
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0 animate-pulse"
              style={{ background: '#0EA5E9' }}
              aria-hidden="true"
            />
            Cloud-based · ISO 42001 Certified
          </motion.div>

          {/* Headline — staggered word animation */}
          <motion.h1
            variants={containerVariants}
            className="text-4xl lg:text-[52px] font-bold text-white leading-[1.1] tracking-tight"
          >
            <span className="block">
              {HEADLINE_LINE_1.map((word, i) => (
                <motion.span key={i} variants={wordVariants} className="inline-block mr-3">
                  {word}
                </motion.span>
              ))}
            </span>
            <span className="block" style={{ color: '#0EA5E9' }}>
              {HEADLINE_LINE_2.map((word, i) => (
                <motion.span key={i} variants={wordVariants} className="inline-block">
                  {word}
                </motion.span>
              ))}
            </span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            variants={fadeUp}
            transition={{ delay: 0.3 }}
            className="text-[#B8C5D6] text-base lg:text-lg mt-5 max-w-md leading-relaxed"
          >
            Complete freight forwarding ERP for sea, air and road — built for
            mid-size forwarders who need fast implementation and full features from day one.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={fadeUp}
            transition={{ delay: 0.45 }}
            className="flex flex-wrap gap-3 mt-8"
          >
            <Link
              to="/contact"
              className="text-white text-sm font-semibold rounded-lg px-7 py-3.5 transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: '#0EA5E9',
                boxShadow: '0 0 0 0 rgba(14,165,233,0.5)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 30px -4px rgba(14,165,233,0.5)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 0 0 0 rgba(14,165,233,0.5)'
              }}
            >
              Book a Free Demo
            </Link>
            <Link
              to="/features"
              className="text-white text-sm font-medium rounded-lg px-7 py-3.5 transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.25)',
                backdropFilter: 'blur(12px)',
              }}
            >
              Explore Features →
            </Link>
          </motion.div>
        </motion.div>

        {/* RIGHT — 3D canvas */}
        <div className="relative h-[400px] lg:h-[480px]">
          {canRender3D ? (
            <Suspense
              fallback={
                <div className="w-full h-full flex items-center justify-center">
                  <div
                    className="w-16 h-16 rounded-full animate-pulse"
                    style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.4), transparent 70%)' }}
                  />
                </div>
              }
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                className="w-full h-full"
              >
                <HeroScene />
              </motion.div>
            </Suspense>
          ) : (
            // Static fallback for reduced-motion / no WebGL
            <div className="w-full h-full flex items-center justify-center">
              <div
                className="w-56 h-56 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(14,165,233,0.25), transparent 70%)',
                  border: '1px solid rgba(14,165,233,0.2)',
                }}
                aria-hidden="true"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}