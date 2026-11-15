import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { eventApi } from '../api/endpoints'
import SafeImage from './SafeImage'

/**
 * Sponsor logo strip. Renders only real sponsors from the API — nothing is
 * shown until at least one is added in the admin panel. Includes a
 * pause/play control (WCAG 2.2.2) for the auto-scrolling track.
 */
export default function SponsorMarquee() {
  const [sponsors, setSponsors] = useState([])
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    let active = true
    eventApi.sponsors()
      .then(({ data }) => active && setSponsors(data?.data || []))
      .catch(() => {})
    return () => { active = false }
  }, [])

  if (sponsors.length === 0) return null

  const reel = [...sponsors, ...sponsors]

  return (
    <section className="py-20" aria-labelledby="sponsors-title">
      <div className="mx-auto mb-10 flex max-w-6xl flex-wrap items-end justify-between gap-4 px-6">
        <div>
          <span className="eyebrow">Powered by</span>
          <h2 id="sponsors-title" className="mt-3 text-3xl md:text-4xl">Our sponsors &amp; partners</h2>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setPaused((p) => !p)} className="btn-outline !px-4 !py-2">
            {paused ? 'Play' : 'Pause'} scrolling
          </button>
          <Link to="/sponsors" className="btn-outline !px-4 !py-2">View all</Link>
        </div>
      </div>

      <div className="marquee" data-paused={paused}>
        <div className="marquee-track">
          {reel.map((s, i) => (
            <div key={`${s.id || s.name}-${i}`} className="marquee-item" aria-hidden={i >= sponsors.length ? true : undefined}>
              <SafeImage src={s.logo_url} alt={`${s.name} logo`} width={240} height={80} fallbackText={s.name}
                className="max-h-12 w-auto object-contain" />
            </div>
          ))}
        </div>
        <div className="marquee-fade marquee-fade--left" />
        <div className="marquee-fade marquee-fade--right" />
      </div>
    </section>
  )
}
