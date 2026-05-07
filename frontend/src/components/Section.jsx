import { motion } from 'framer-motion'

export function Section({ id, eyebrow, title, intro, children, dark = false, className = '', innerClassName = '' }) {
  return (
    <section
      id={id}
      className={`relative py-20 sm:py-28 ${dark ? 'bg-ink-950 text-white' : 'bg-white'} ${className}`}
    >
      <div className={`mx-auto max-w-7xl px-6 lg:px-8 ${innerClassName}`}>
        {(eyebrow || title || intro) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mb-14 max-w-2xl text-center"
          >
            {eyebrow && (
              <span className={`text-xs font-semibold uppercase tracking-[0.18em] ${dark ? 'text-brand-300' : 'text-brand-600'}`}>
                {eyebrow}
              </span>
            )}
            {title && (
              <h2 className={`mt-3 font-display text-3xl font-bold sm:text-4xl ${dark ? 'text-white' : 'text-ink-900'}`}>
                {title}
              </h2>
            )}
            {intro && (
              <p className={`mt-4 text-base ${dark ? 'text-ink-300' : 'text-ink-600'}`}>{intro}</p>
            )}
          </motion.div>
        )}
        {children}
      </div>
    </section>
  )
}

export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}

export const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
}
