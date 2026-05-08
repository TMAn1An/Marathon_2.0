import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SafeImage from './SafeImage'

// Twenty diverse, high-quality marathon stock photos from picsum (deterministic seeds).
// Replace with real photos when available — the layout is gallery-ready out of the box.
const IMAGES = Array.from({ length: 20 }, (_, i) => ({
  src: `https://picsum.photos/seed/marathon-${i + 1}/640/${[420, 520, 620, 480, 560][i % 5]}`,
  alt: `Marathon snapshot ${i + 1}`,
  caption: [
    'Race-day energy on the start line',
    'Pacers calling out the next mile',
    'Sunrise stretches at the warm-up zone',
    'Volunteers handing out water at km 3',
    'A finisher crossing under the arch',
    'BIB pickup outside the SCSE block',
    'Cheer squad along the campus loop',
    'Chip timing mat reading a runner in',
    'Medics on standby near hydration',
    'Photo finish for the top three',
    'Pre-race briefing in the atrium',
    'Post-race recovery breakfast spread',
    'Drone shot over the running track',
    'Group warm-up led by the coach',
    'Selfies with the finisher medal',
    'Sunset jog for the late wave',
    'Bib numbers being applied trackside',
    'Family supporters at the finish line',
    'Volunteers cleaning up the kit zone',
    'Trophy presentation on the podium',
  ][i],
}))

export default function HomeGallery() {
  const [active, setActive] = useState(null)

  useEffect(() => {
    if (active === null) return
    const onKey = (e) => {
      if (e.key === 'Escape') setActive(null)
      if (e.key === 'ArrowRight') setActive((i) => (i + 1) % IMAGES.length)
      if (e.key === 'ArrowLeft') setActive((i) => (i - 1 + IMAGES.length) % IMAGES.length)
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [active])

  return (
    <>
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {IMAGES.map((img, i) => (
          <motion.button
            key={img.src}
            type="button"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.4, delay: (i % 6) * 0.04 }}
            onClick={() => setActive(i)}
            className="group mb-4 block w-full break-inside-avoid overflow-hidden rounded-2xl bg-ink-100 ring-1 ring-ink-100 transition hover:-translate-y-1 hover:shadow-card focus:outline-none focus:ring-2 focus:ring-crimson-700"
          >
            <SafeImage
              src={img.src}
              alt={img.alt}
              loading="lazy"
              className="h-auto w-full object-cover transition duration-700 group-hover:scale-[1.03]"
            />
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {active !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/85 p-4 backdrop-blur"
            onClick={() => setActive(null)}
          >
            <button
              type="button"
              aria-label="Close lightbox"
              className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white ring-1 ring-white/20 transition hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation()
                setActive(null)
              }}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <button
              type="button"
              aria-label="Previous image"
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white ring-1 ring-white/20 transition hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation()
                setActive((i) => (i - 1 + IMAGES.length) % IMAGES.length)
              }}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m15 6-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="relative max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-ink-900"
              onClick={(e) => e.stopPropagation()}
            >
              <SafeImage
                src={IMAGES[active].src.replace(/\/\d+\/\d+$/, '/1600/1000')}
                alt={IMAGES[active].alt}
                className="max-h-[80vh] w-full object-contain"
              />
              <div className="bg-ink-950/80 px-5 py-3 text-sm text-white">
                <span className="text-white/60">
                  {active + 1} / {IMAGES.length} ·{' '}
                </span>
                {IMAGES[active].caption}
              </div>
            </motion.div>

            <button
              type="button"
              aria-label="Next image"
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white ring-1 ring-white/20 transition hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation()
                setActive((i) => (i + 1) % IMAGES.length)
              }}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
