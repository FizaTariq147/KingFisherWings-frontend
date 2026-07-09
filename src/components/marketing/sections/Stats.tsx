import { STATS } from '@/constants/marketingData'

export default function Stats() {
  return (
    <section style={{  background: `
          linear-gradient(180deg, rgba(15,42,61,0.85) 0%, rgba(15,42,61,0.55) 100%),
          radial-gradient(circle at 70% 40%, rgba(14,165,233,0.35), transparent 65%),
          linear-gradient(135deg, #1E3A52 0%, #0F2A3D 50%, #15324A 100%)
        `,
        backgroundColor: '#0F2A3D', }} className="py-5">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-[#0F2942]">
          {STATS.map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center py-8 px-6 text-center">
              <span className="text-5xl font-medium text-white leading-none">{value}</span>
              <span className="text-sm text-[#94A3B8] mt-2 uppercase tracking-widest">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}