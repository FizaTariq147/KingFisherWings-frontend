import { STATS } from '@/constants/marketingData'

export default function Stats() {
  return (
    <section style={{ backgroundColor: '#0A1F12' }} className="py-16">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-[#1a3322]">
          {STATS.map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center py-8 px-6 text-center">
              <span className="text-5xl font-medium text-white leading-none">{value}</span>
              <span className="text-sm text-[#7aab8a] mt-2 uppercase tracking-widest">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}