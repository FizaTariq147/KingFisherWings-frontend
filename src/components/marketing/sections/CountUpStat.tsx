import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

interface CountUpStatProps {
  value: string   // e.g. "1000+", "30+", "15+", "5"
  label: string
}

function parseValue(value: string): { num: number; suffix: string } {
  const match = value.match(/^(\d+)(.*)$/)
  if (!match) return { num: 0, suffix: value }
  return { num: parseInt(match[1], 10), suffix: match[2] }
}

export default function CountUpStat({ value, label }: CountUpStatProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })
  const [display, setDisplay] = useState(0)
  const { num, suffix } = parseValue(value)

  useEffect(() => {
    if (!inView) return
    const duration = 1200
    const start = performance.now()

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      setDisplay(Math.round(eased * num))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [inView, num])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center py-8 px-6 text-center"
    >
      <span className="stat-value text-white">
        {display}{suffix}
      </span>
      <span className="text-xs text-[#94A3B8] uppercase tracking-[.15em] font-semibold mt-3">
        {label}
      </span>
    </motion.div>
  )
}