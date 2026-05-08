import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { eventsApi, postsApi, sponsorsApi } from '../api/endpoints'
import { Section } from '../components/Section'
import CountdownClock from '../components/CountdownClock'
import Donut from '../components/Donut'
import SponsorMarquee from '../components/SponsorMarquee'
import SafeImage from '../components/SafeImage'
import AnimatedCounter from '../components/AnimatedCounter'
import BenefitsWithIcons from '../components/BenefitsWithIcons'
import HomeGallery from '../components/HomeGallery'

const HERO_VIDEO = 'https://cdn.coverr.co/videos/coverr-runners-on-the-park-track-2218/1080p.mp4'
const HERO_POSTER = 'https://images.unsplash.com/photo-1530143584546-02191bc84eb5?auto=format&fit=crop&w=1920&q=70'

const TESTIMONIALS = [
  {
    name: 'Aisha Khan',
    role: 'CSE, Class of 2025',
    photo: 'https://i.pravatar.cc/200?img=47',
    quote: 'The chip-timing setup felt every bit as professional as the city marathons — and the post-race certificate landed minutes after I finished.',
  },
  {
    name: 'Dr. Imran Hossain',
    role: 'Asst. Professor, SCSE',
    photo: 'https://i.pravatar.cc/200?img=12',
    quote: 'A genuinely well-organised campus run. Volunteers, hydration, and signage all dialled in.',
  },
  {
    name: 'Sajid Rahman',
    role: 'EEE finalist',
    photo: 'https://i.pravatar.cc/200?img=34',
    quote: 'I shaved two minutes off my best 5K and got my certificate before I had cooled down. Highly recommend.',
  },
]

export default function HomePage() {
  const [events, setEvents] = useState({ live: [], upcoming: [], past: [] })
  const [analytics, setAnalytics] = useState(null)
  const [posts, setPosts] = useState([])
  const [sponsors, setSponsors] = useState([])

  const featured = useMemo(() => {
    return events.live[0] || events.upcoming[0] || events.past[0] || null
  }, [events])

  useEffect(() => {
    eventsApi.list().then((res) => setEvents(res.data?.data || { live: [], upcoming: [], past: [] })).catch(() => {})
    postsApi.list({ per_page: 3 }).then((res) => setPosts(res.data?.data || [])).catch(() => {})
    sponsorsApi.list().then((res) => setSponsors(res.data?.data || [])).catch(() => {})
  }, [])

  useEffect(() => {
    if (!featured?.slug) return
    eventsApi.slots(featured.slug).then((res) => setAnalytics(res.data?.data)).catch(() => {})
  }, [featured?.slug])

  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 400], [0, -80])
  const heroOpacity = useTransform(scrollY, [0, 350], [1, 0])

  return (
    <>
      <Hero featured={featured} y={heroY} opacity={heroOpacity} />

      <SponsorBand sponsors={sponsors} />

      <BenefitsWithIcons />

      {analytics && (
        <Section
          eyebrow="Live registration analytics"
          title="A transparent view of who's running"
        >
          <div className="mx-auto max-w-3xl rounded-3xl bg-white p-6 shadow-card ring-1 ring-ink-100 sm:p-10">
            <Donut segments={analytics.segments} note={analytics.note} />
          </div>
        </Section>
      )}

      <Section
        eyebrow="Moments from past races"
        title="Inside the IUBAT SCSE MINI Marathon"
        intro="Tap any photo to view it full-screen."
      >
        <HomeGallery />
      </Section>

      <SocialProof />

      <UrgencyBlock featured={featured} />

      <Section
        dark
        eyebrow="From the press room"
        title="Latest news & event updates"
        intro="Announcements, race-day updates and behind-the-build essays from the SCSE platform team."
      >
        <div className="grid gap-6 lg:grid-cols-3">
          {posts.length === 0 && [0, 1, 2].map((i) => <div key={i} className="skeleton h-56 rounded-2xl" />)}
          {posts.map((p) => (
            <article
              key={p.id}
              className={`group relative overflow-hidden rounded-2xl ring-1 ring-white/10 transition hover:-translate-y-1 ${
                p.post_type === 'announcement'
                  ? 'bg-crimson-700'
                  : p.post_type === 'event_update'
                  ? 'bg-ink-900'
                  : 'bg-white text-ink-900'
              }`}
            >
              <Link to={`/news/${p.slug}`} className="flex h-full flex-col p-7">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] opacity-80">
                  {labelForType(p.post_type)}
                </span>
                <h3 className={`mt-4 font-display text-xl font-bold ${p.post_type === 'general' ? 'text-ink-900' : 'text-white'}`}>
                  {p.title}
                </h3>
                <p className={`mt-3 text-sm ${p.post_type === 'general' ? 'text-ink-600' : 'text-white/85'}`}>
                  {p.excerpt}
                </p>
                <span className={`mt-auto pt-6 text-sm font-semibold ${p.post_type === 'general' ? 'text-crimson-700' : 'text-white'}`}>
                  Read more →
                </span>
              </Link>
            </article>
          ))}
        </div>
      </Section>

      <FinalCta featured={featured} />
    </>
  )
}

function Hero({ featured, y, opacity }) {
  return (
    <section className="relative isolate -mt-20 flex min-h-[94vh] items-center overflow-hidden bg-brand-950 pt-28 text-white">
      <video
        className="absolute inset-0 h-full w-full object-cover opacity-40"
        src={HERO_VIDEO}
        poster={HERO_POSTER}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      />
      <div className="absolute inset-0 bg-hero-gradient" />
      <div className="absolute inset-0 bg-gradient-to-t from-brand-950 via-transparent to-transparent" />

      <motion.div
        style={{ y, opacity }}
        className="relative z-10 mx-auto grid w-full max-w-7xl gap-10 px-6 lg:grid-cols-[1.1fr_1fr] lg:px-8"
      >
        <div>
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="pill bg-white/10 text-white backdrop-blur"
          >
            <span className="live-dot" />
            <span className="ml-1.5">IUBAT SCSE MINI Marathon</span>
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 font-display text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl"
          >
            Run with knowledge.
            <br />
            <span className="bg-gradient-to-r from-sun-300 via-sun-400 to-sun-500 bg-clip-text text-transparent">
              Finish with pride.
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 max-w-xl text-base text-white/80 sm:text-lg"
          >
            The flagship campus run hosted by the IUBAT School of Computer Science &amp; Engineering.
            Premium chip timing, instant verified certificates, and a campus that turns out to cheer.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Link to="/events" className="btn-cta">
              Register
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <Link to="/events" className="btn-ghost">Explore Events</Link>
          </motion.div>
        </div>

        {featured && <FeaturedEventCard featured={featured} />}
      </motion.div>
    </section>
  )
}

function FeaturedEventCard({ featured }) {
  const eventTarget = featured.event_start_date
  const regTarget = featured.registration_start_date
  const [regStarted, setRegStarted] = useState(() => {
    if (!regTarget) return true
    return new Date(regTarget).getTime() <= Date.now()
  })

  useEffect(() => {
    if (!regTarget) {
      setRegStarted(true)
      return undefined
    }
    const targetMs = new Date(regTarget).getTime()
    const tick = () => setRegStarted(Date.now() >= targetMs)
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [regTarget])

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.7 }}
      className="self-center"
    >
      <div className="rounded-3xl bg-white/10 p-6 ring-1 ring-white/15 backdrop-blur-xl sm:p-7">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sun-300">
            Next up
          </span>
          {featured.status === 'live' && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-crimson-700 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sun-400" />
              Live
            </span>
          )}
        </div>
        <h3 className="mt-2 font-display text-2xl font-bold leading-tight">{featured.title}</h3>
        <p className="mt-1 text-sm text-white/70">{featured.location}</p>

        {!regStarted && regTarget && (
          <div className="mt-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
                Registration opens in
              </span>
              <span className="text-[11px] font-mono text-sun-300">
                {new Date(regTarget).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </div>
            <CountdownClock target={regTarget} tone="dark" className="mt-2" />
          </div>
        )}

        {eventTarget && (
          <div className="mt-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
                Event starts in
              </span>
              <span className="text-[11px] font-mono text-sun-300">
                {new Date(eventTarget).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </div>
            <CountdownClock target={eventTarget} tone="dark" className="mt-2" />
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-sun-400">
              Reporting time: 5:00 AM
            </p>
          </div>
        )}

        <Link
          to={`/events/${featured.slug}`}
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white"
        >
          View details
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    </motion.div>
  )
}

function SponsorBand({ sponsors }) {
  return (
    <Section
      eyebrow="Powered by our sponsors"
      title="Backed by brands that believe in active campuses"
    >
      <div className="rounded-3xl bg-white p-8 shadow-card ring-1 ring-ink-100 sm:p-10">
        <SponsorMarquee sponsors={sponsors} />
      </div>
    </Section>
  )
}

function SocialProof() {
  return (
    <Section
      dark
      eyebrow="Social proof"
      title="A campus that turns up"
      intro="Three years, three sold-out events, and a whole school that cheers from the side-lines."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1.6fr]">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-2">
          {[
            { value: 870, suffix: '+', label: 'Runners hosted' },
            { value: 200, suffix: '+', label: 'Volunteers each year' },
            { value: 15, suffix: 'K', label: 'Total km logged' },
            { value: 4.9, suffix: '/5', label: 'Avg. participant rating', decimals: 1 },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
              <div className="font-display text-3xl font-bold text-white">
                <AnimatedCounter value={s.value} suffix={s.suffix} decimals={s.decimals || 0} />
              </div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-widest text-white/60">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="grid gap-4">
          {TESTIMONIALS.map((t) => (
            <motion.figure
              key={t.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10"
            >
              <blockquote className="text-sm leading-relaxed text-white/85">"{t.quote}"</blockquote>
              <figcaption className="mt-4 flex items-center gap-3">
                <SafeImage src={t.photo} alt={t.name} className="h-10 w-10 rounded-full object-cover ring-1 ring-white/30" />
                <div>
                  <div className="text-sm font-semibold text-white">{t.name}</div>
                  <div className="text-xs text-white/60">{t.role}</div>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </Section>
  )
}

function UrgencyBlock({ featured }) {
  if (!featured) return null
  return (
    <Section className="!bg-brand-50">
      <div className="grid items-center gap-10 rounded-3xl bg-gradient-to-br from-brand-950 via-brand-700 to-brand-900 p-10 text-white shadow-card lg:grid-cols-2 lg:p-14">
        <div>
          <span className="pill bg-white/10 text-white">Reservation closing soon</span>
          <h3 className="mt-4 font-display text-3xl font-bold sm:text-4xl">
            Slots are filling. Lock yours before the gates close.
          </h3>
          <p className="mt-3 max-w-md text-white/80">
            Public BIBs start at <span className="font-mono">MIN_0031</span>. Reserve now and you'll have ten
            minutes to complete payment before the slot rolls back to the queue.
          </p>
          <Link to={`/events/${featured.slug}`} className="btn-cta mt-7 inline-flex">
            Reserve my BIB
          </Link>
        </div>
        <div>
          <CountdownClock target={featured.event_start_date} tone="dark" />
          <p className="mt-4 text-xs uppercase tracking-widest text-white/60">
            Race day · {new Date(featured.event_start_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
          <p className="mt-1 text-xs uppercase tracking-widest text-sun-300">
            Reporting time: 5:00 AM
          </p>
        </div>
      </div>
    </Section>
  )
}

function FinalCta({ featured }) {
  return (
    <section className="relative isolate overflow-hidden bg-brand-950 py-24 text-white">
      <div className="absolute inset-0 bg-grid-fade opacity-60" />
      <div className="relative mx-auto max-w-3xl px-6 text-center lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-4xl font-extrabold sm:text-5xl"
        >
          Don't miss your chance to be part of the IUBAT SCSE MINI Marathon.
        </motion.h2>
        <p className="mx-auto mt-5 max-w-xl text-base text-white/75">
          Limited BIBs · chip-timed · verified certificate · campus-wide celebration.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to={featured?.slug ? `/events/${featured.slug}` : '/events'} className="btn-cta">Register Now</Link>
          <Link to="/about" className="btn-ghost">Read the rules</Link>
        </div>
      </div>
    </section>
  )
}

function labelForType(type) {
  switch (type) {
    case 'announcement': return 'Announcement'
    case 'event_update': return 'Event update'
    default: return 'From the team'
  }
}
