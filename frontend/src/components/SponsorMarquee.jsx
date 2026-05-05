import { useEffect, useState } from 'react'
import { eventApi } from '../api/endpoints'
import SafeImage from './SafeImage'

const FALLBACK_SPONSORS = [
  { id: 'p1', name: 'IUBAT', logo_url: 'https://placehold.co/240x80/eefdf2/0d723c?text=IUBAT' },
  { id: 'p2', name: 'CSE Dept', logo_url: 'https://placehold.co/240x80/eefdf2/0d723c?text=CSE+Dept' },
  { id: 'p3', name: 'Sports Club', logo_url: 'https://placehold.co/240x80/eefdf2/0d723c?text=Sports+Club' },
  { id: 'p4', name: 'Alumni Network', logo_url: 'https://placehold.co/240x80/eefdf2/0d723c?text=Alumni' },
  { id: 'p5', name: 'Apex Hydration', logo_url: 'https://placehold.co/240x80/eefdf2/0d723c?text=Apex+Hydration' },
  { id: 'p6', name: 'Greenline Health', logo_url: 'https://placehold.co/240x80/eefdf2/0d723c?text=Greenline+Health' },
  { id: 'p7', name: 'CityRun Apparel', logo_url: 'https://placehold.co/240x80/eefdf2/0d723c?text=CityRun' },
]

/**
 * Right-to-left infinite logo carousel for the sponsors strip.
 * Pauses on hover. Gracefully grays the logos until hovered.
 *
 * Strategy: render the sponsor list twice and animate the inner track
 * by exactly 50% of its width. The seamless join makes the loop feel
 * uninterrupted.
 */
export default function SponsorMarquee() {
  const [sponsors, setSponsors] = useState(FALLBACK_SPONSORS)

  useEffect(() => {
    let active = true
    eventApi
      .sponsors()
      .then(({ data }) => {
        if (!active) return
        const fromApi = data?.data || []
        if (fromApi.length > 0) setSponsors(fromApi)
      })
      .catch(() => {
        // keep the fallback set so the carousel never looks empty
      })
    return () => {
      active = false
    }
  }, [])

  if (!sponsors || sponsors.length === 0) return null

  // Duplicate the list so a single -50% translate creates a seamless loop.
  const reel = [...sponsors, ...sponsors]

  return (
    <section className="relative overflow-hidden bg-white py-16 lg:py-20 border-y border-brand-100">
      <div className="mx-auto max-w-7xl px-4 mb-10">
        <div className="flex flex-col items-center text-center">
          <span className="badge-orange">Powered by our partners</span>
          <h2 className="mt-3 text-3xl md:text-4xl">Our sponsors</h2>
          <p className="mt-2 max-w-2xl text-slate-600">
            The IUBAT CSE 10K Marathon is made possible by these institutions and brands.
            Hover any logo to highlight it.
          </p>
        </div>
      </div>

      <div className="marquee group">
        <div className="marquee-track">
          {reel.map((s, i) => (
            <div
              key={`${s.id || s.name}-${i}`}
              className="marquee-item"
              aria-hidden={i >= sponsors.length ? true : undefined}
            >
              <SafeImage
                src={s.logo_url}
                alt={`${s.name} logo`}
                width={240}
                height={80}
                fallbackText={s.name}
                className="max-h-12 w-auto object-contain transition duration-300"
              />
            </div>
          ))}
        </div>

        {/* Edge fades so logos cleanly enter and leave */}
        <div className="marquee-fade marquee-fade--left" />
        <div className="marquee-fade marquee-fade--right" />
      </div>
    </section>
  )
}
