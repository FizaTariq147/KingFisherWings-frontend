import { motion } from 'framer-motion'
import { FileText, Ship, Clipboard, BarChart3, type LucideIcon } from 'lucide-react'
import { FEATURES } from '@/constants/marketingData'

const ICON_MAP: Record<string, LucideIcon> = { FileText, Ship, Clipboard, BarChart3 }

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
}

export default function Features() {
  return (
    <section className="py-24" style={{  background: `
          linear-gradient(180deg, rgba(15,42,61,0.85) 0%, rgba(15,42,61,0.55) 100%),
          radial-gradient(circle at 70% 40%, rgba(14,165,233,0.35), transparent 65%),
          linear-gradient(135deg, #1E3A52 0%, #0F2A3D 50%, #15324A 100%)
        `,
        backgroundColor: '#0F2A3D', }}>
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          className="text-center mb-14"
        >
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#0EA5E9' }}>
            Why KingFisher Tech Gold
          </p>
          <h2 className="text-3xl font-bold text-white">Everything your freight team needs</h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {FEATURES.map(({ title, icon, desc }) => {
            const Icon = ICON_MAP[icon]
            return (
              <motion.div
                key={title}
                variants={cardVariants}
                whileHover={{ y: -4 }}
                className="rounded-xl p-6 transition-colors duration-200"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(14,165,233,0.4)' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                  style={{ background: 'rgba(14,165,233,0.12)' }}
                >
                  <Icon size={18} style={{ color: '#0EA5E9' }} aria-hidden="true" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#94A3B8' }}>{desc}</p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}