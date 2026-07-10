'use client'

export default function AboutHero() {
  return (
    <section
      className="relative h-[90vh] md:h-screen w-full overflow-hidden"
      style={{
        backgroundImage: `url('/about-hero-gujarat-map.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        filter: 'brightness(1.1) contrast(1.1) saturate(1.1)',
      }}
    >
      {/* Clean left gradient for readability */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to right, rgba(0,0,0,0.6), rgba(0,0,0,0.2), transparent)',
        }}
      />

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 animate-bounce z-20">
        <div className="flex flex-col items-center gap-2">
          <p className="text-slate-100/80 text-sm">Scroll to explore</p>
          <svg className="w-6 h-6 text-slate-100/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </section>
  )
}
