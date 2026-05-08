import { motion } from 'framer-motion'
import {
  Timer,
  Shirt,
  Award,
  Droplet,
  Medal,
  UtensilsCrossed,
} from 'lucide-react'
import { Section, fadeUp, staggerContainer } from './Section'

const BENEFITS = [
  {
    icon: Timer,
    title: 'Timing chip & BIB',
    text: 'Real-time chip timing with a digital BIB on a premium tear-free strip.',
    accent: 'crimson',
  },
  {
    icon: Shirt,
    title: 'Performance T-shirt',
    text: 'Moisture-wicking IUBAT SCSE finisher tee, sized to fit.',
    accent: 'sun',
  },
  {
    icon: Award,
    title: 'Verified certificate',
    text: 'A QR-verified certificate generated the moment your results land.',
    accent: 'crimson',
  },
  {
    icon: Droplet,
    title: 'Hydration on course',
    text: 'Three hydration stations with electrolyte refresher and chilled water.',
    accent: 'sun',
  },
  {
    icon: Medal,
    title: 'Finisher medal',
    text: 'A heavyweight, ribbon-mounted medal for every finisher.',
    accent: 'crimson',
  },
  {
    icon: UtensilsCrossed,
    title: 'Recovery breakfast',
    text: 'A post-race breakfast spread served at the IUBAT Atrium.',
    accent: 'sun',
  },
]

const accentRing = {
  crimson: 'bg-crimson-700/10 text-crimson-700 ring-crimson-700/15',
  sun: 'bg-sun-400/15 text-sun-700 ring-sun-400/30',
}

export default function BenefitsWithIcons() {
  return (
    <Section
      eyebrow="What you get"
      title="Premium kit, instant feedback, real glory"
      intro="Every participant gets a curated runner kit and a digital paper trail that lasts beyond race day."
    >
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={staggerContainer}
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {BENEFITS.map((b) => {
          const Icon = b.icon
          return (
            <motion.div
              key={b.title}
              variants={fadeUp}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="group flex h-full flex-col rounded-3xl bg-white p-7 ring-1 ring-ink-100 transition hover:-translate-y-1 hover:shadow-card"
            >
              <span
                className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl ring-1 ${accentRing[b.accent]}`}
              >
                <Icon className="h-7 w-7" strokeWidth={2} />
              </span>
              <h3 className="mt-6 font-display text-lg font-semibold text-ink-900">{b.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">{b.text}</p>
            </motion.div>
          )
        })}
      </motion.div>
    </Section>
  )
}
