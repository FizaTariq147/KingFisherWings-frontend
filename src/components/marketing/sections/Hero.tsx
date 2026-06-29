import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { REGIONAL_CONTACTS, STATS } from '@/constants/marketingData'

interface Node {
  x: number; y: number
  vx: number; vy: number
  r: number; color: string
  pulse: number; pulseSpeed: number
}

const COLORS = ['#1a6e38','#2a8a4a','#5cc98a','#0f4a28','#3aaa6a']
const NODE_COUNT = 70
const CONNECT_DIST = 120

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const heroRef   = useRef<HTMLDivElement>(null)
  const frameRef  = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    const hero   = heroRef.current
    if (!canvas || !hero) return

    const ctx = canvas.getContext('2d')!
    let W = 0, H = 0
    let nodes: Node[] = []

    const makeNode = (): Node => {
      const angle = Math.random() * Math.PI * 2
      const speed = 0.15 + Math.random() * 0.25
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: 1.5 + Math.random() * 2.5,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.03,
      }
    }

    const resize = () => {
      W = canvas.width  = hero.offsetWidth
      H = canvas.height = hero.offsetHeight
    }

    const init = () => {
      resize()
      nodes = Array.from({ length: NODE_COUNT }, makeNode)
    }

    const draw = () => {
      ctx.clearRect(0, 0, W, H)

      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy
        n.pulse += n.pulseSpeed
        if (n.x < -10) n.x = W + 10
        if (n.x > W + 10) n.x = -10
        if (n.y < -10) n.y = H + 10
        if (n.y > H + 10) n.y = -10
      })

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j]
          const dx = a.x - b.x, dy = a.y - b.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < CONNECT_DIST) {
            const alpha = (1 - dist / CONNECT_DIST) * 0.35
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = `rgba(90,201,138,${alpha})`
            ctx.lineWidth = 0.6
            ctx.stroke()
          }
        }
      }

      nodes.forEach(n => {
        const glow = 1 + Math.sin(n.pulse) * 0.3
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r * glow, 0, Math.PI * 2)
        ctx.fillStyle = n.color
        ctx.globalAlpha = 0.85
        ctx.fill()
        ctx.globalAlpha = 1
      })

      const cx = W / 2, cy = H / 2
      const orbRadius = Math.min(W, H) * 0.38
      const now = Date.now() / 1000

      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + now * 0.18
        const ox = cx + Math.cos(angle) * orbRadius
        const oy = cy + Math.sin(angle) * orbRadius * 0.35
        if (i % 2 === 0) {
          ctx.beginPath()
          ctx.arc(ox, oy, 3, 0, Math.PI * 2)
          ctx.fillStyle = '#5cc98a'
          ctx.globalAlpha = 0.6
          ctx.fill()
          ctx.globalAlpha = 1
        }
      }

      ctx.beginPath()
      ctx.ellipse(cx, cy, orbRadius, orbRadius * 0.35, 0, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(90,201,138,0.08)'
      ctx.lineWidth = 1
      ctx.setLineDash([4, 8])
      ctx.stroke()
      ctx.setLineDash([])

      ctx.beginPath()
      ctx.ellipse(cx, cy, orbRadius * 0.6, orbRadius * 0.21, 0, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(90,201,138,0.06)'
      ctx.lineWidth = 0.8
      ctx.setLineDash([3, 10])
      ctx.stroke()
      ctx.setLineDash([])

      frameRef.current = requestAnimationFrame(draw)
    }

    init()
    draw()

    const onResize = () => { cancelAnimationFrame(frameRef.current); init(); draw() }
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(frameRef.current)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <section
      ref={heroRef}
      className="relative overflow-hidden"
      style={{ backgroundColor: '#0A1F12', minHeight: '560px' }}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 0.55 }}
      />

      {/* Hero copy — upper part */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 pt-16 pb-12">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-[#1a3322] border border-[#2a5c3a] text-[#5cc98a] rounded-full px-4 py-1 text-xs font-medium mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#5cc98a] animate-pulse shrink-0" aria-hidden="true" />
          Cloud-based · Fast Setup · ISO 42001 Certified
        </div>

        {/* H1 */}
        <h1 className="hero-h1 text-white max-w-2xl">
          Cloud Freight Software<br />for Growing Teams
        </h1>

        {/* Subtext */}
        <p className="text-[#7aab8a] text-base lg:text-lg mt-4 max-w-xl leading-relaxed">
          Complete freight forwarding ERP for sea, air and road — built for
          mid-size forwarders who need fast implementation and full features from day one.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          <Link
            to="/contact"
            className="bg-[#1a6e38] hover:bg-[#145530] text-white text-sm font-medium rounded-lg px-6 py-3 transition-colors"
          >
            Book a Free Demo
          </Link>
          <Link
            to="/features"
            className="border border-[rgba(255,255,255,0.25)] hover:bg-white/10 text-white text-sm font-medium rounded-lg px-6 py-3 transition-colors"
          >
            Explore Features
          </Link>
        </div>

        {/* Regional contacts */}
        <div className="mt-10 pt-7 border-t border-[#1a3322] w-full max-w-3xl">
          <p className="text-[10px] text-[#4a7a5c] uppercase tracking-widest font-semibold mb-3">
            Global offices
          </p>
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
            {REGIONAL_CONTACTS.map(({ flag, country, phone, href }) => (
              <a
                key={country}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs text-[#7aab8a] hover:text-white transition-colors"
              >
                <span aria-hidden="true">{flag}</span>
                <span>{country}</span>
                <span className="text-[#2a5c3a]">·</span>
                <span>{phone}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Stats bar — full width, pinned to bottom of section */}
      <div
        className="relative z-10 w-full grid grid-cols-2 lg:grid-cols-4 border-t border-[#1a3322]"
        style={{ background: 'rgba(6,18,10,0.75)', backdropFilter: 'blur(12px)' }}
      >
        {STATS.map(({ value, label }, i) => (
          <div
            key={label}
            className="flex flex-col items-center justify-center py-8 px-6 text-center"
            style={{
              borderRight: i < STATS.length - 1 ? '1px solid rgba(26,51,34,0.8)' : 'none',
              borderBottom: i < 2 ? '1px solid rgba(26,51,34,0.8)' : 'none',
            }}
          >
            <span className="stat-value text-white">
              {value}
            </span>
            <span className="text-xs text-[#4a7a5c] uppercase tracking-[.15em] font-semibold mt-3">
              {label}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}