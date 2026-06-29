const CLIENT_NAMES = [
  'MCL Shipping',
  'Berrio Logistics',
  'FM Global',
  'Seagull Freight',
  'AlphaCargo UAE',
]

export default function TrustBar() {
  return (
    <section className="bg-white border-b border-gray-200 py-5">
      <div className="max-w-[1200px] mx-auto px-6 flex flex-wrap items-center gap-6">
        <p className="text-sm text-gray-400 shrink-0">Trusted in 30+ countries</p>
        <div className="w-px h-5 bg-gray-200 hidden sm:block" aria-hidden="true" />
        <div className="flex flex-wrap items-center gap-4">
          {CLIENT_NAMES.map((name) => (
            <span
              key={name}
              className="text-sm font-semibold text-gray-300 tracking-wide"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}