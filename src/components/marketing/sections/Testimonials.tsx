import { TESTIMONIALS } from '@/constants/marketingData'

function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

export default function Testimonials() {
  return (
    <section className="bg-white py-24">
      <div className="max-w-[1200px] mx-auto px-6">
        <h2 className="text-3xl font-medium text-gray-900 text-center mb-14">
          Trusted by freight leaders worldwide
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {TESTIMONIALS.map(({ quote, name, company }) => (
            <div
              key={name}
              className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col"
            >
              <span
                className="text-4xl text-[#1a6e38] font-serif leading-none mb-4 select-none"
                aria-hidden="true"
              >
                "
              </span>
              <p className="text-sm text-gray-700 leading-relaxed flex-1 mb-6">
                {quote}
              </p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#e8f5ee] flex items-center justify-center shrink-0">
                  <span className="text-xs font-semibold text-[#1a6e38]">
                    {initials(name)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 leading-tight">{name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}