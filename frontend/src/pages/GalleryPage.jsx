import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { galleryApi } from '../api/endpoints'
import SafeImage from '../components/SafeImage'

export default function GalleryPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [active, setActive] = useState(null)

  useEffect(() => {
    galleryApi
      .list({ per_page: 60 })
      .then((res) => setItems(res.data?.data || []))
      .finally(() => setLoading(false))
  }, [])

  const list = items.length
    ? items
    : Array.from({ length: 12 }).map((_, i) => ({
        id: `seed-${i}`,
        image_url: `https://picsum.photos/seed/marathon-${i}/${i % 3 === 0 ? 800 : 600}/${i % 4 === 0 ? 1000 : 700}`,
        caption: 'IUBAT SCSE Marathon archive',
      }))

  return (
    <>
      <header className="bg-ink-950 py-20 text-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <span className="pill bg-white/10 text-white">Gallery</span>
          <h1 className="mt-4 font-display text-4xl font-extrabold sm:text-5xl">
            Race-day moments, frame by frame.
          </h1>
        </div>
      </header>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {loading ? (
            <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="skeleton mb-4 h-64 rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
              {list.map((item) => (
                <motion.button
                  key={item.id}
                  type="button"
                  layout
                  whileHover={{ y: -3 }}
                  onClick={() => setActive(item)}
                  className="mb-4 block w-full overflow-hidden rounded-2xl ring-1 ring-ink-100"
                >
                  <SafeImage
                    src={item.image_url}
                    alt={item.caption || 'Marathon gallery image'}
                    className="block w-full"
                  />
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </section>

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/80 backdrop-blur-md p-4"
            onClick={() => setActive(null)}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="relative max-h-[88vh] max-w-5xl overflow-hidden rounded-3xl bg-black"
              onClick={(e) => e.stopPropagation()}
            >
              <SafeImage src={active.image_url} alt={active.caption || ''} className="max-h-[88vh] w-full object-contain" />
              {active.caption && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
                  <div className="text-sm">{active.caption}</div>
                </div>
              )}
              <button
                onClick={() => setActive(null)}
                className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/20 backdrop-blur hover:bg-white hover:text-ink-900"
              >
                ×
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
