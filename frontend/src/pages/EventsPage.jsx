import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { eventsApi } from '../api/endpoints'
import { Section, fadeUp, staggerContainer } from '../components/Section'
import SafeImage from '../components/SafeImage'

const EMPTY_COPY = {
  upcoming: 'Stay tuned for our next big run!',
  past: 'We just begin not End, Stay with us.',
  live: 'No live event right now — but the next one is closer than you think.',
}

export default function EventsPage() {
  const [groups, setGroups] = useState({ live: [], upcoming: [], past: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    eventsApi
      .list()
      .then((res) => setGroups(res.data?.data || { live: [], upcoming: [], past: [] }))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <header className="bg-ink-950 py-20 text-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <span className="pill bg-white/10 text-white">Events Hub</span>
          <h1 className="mt-4 font-display text-4xl font-extrabold sm:text-5xl">
            Every IUBAT SCSE run on a single track.
          </h1>
          <p className="mt-4 max-w-2xl text-base text-white/75">
            Live, upcoming, and past — explore the full programme, register for what's open, or download your
            certificate from previous editions.
          </p>
        </div>
      </header>

      <Group title="Live now" tone="live" events={groups.live} loading={loading} empty={EMPTY_COPY.live} />
      <Group title="Upcoming" tone="upcoming" events={groups.upcoming} loading={loading} empty={EMPTY_COPY.upcoming} />
      <Group title="Past events" tone="past" events={groups.past} loading={loading} empty={EMPTY_COPY.past} />
    </>
  )
}

function Group({ title, tone, events, loading, empty }) {
  return (
    <Section eyebrow={tone === 'live' ? 'Happening now' : tone === 'upcoming' ? 'On the calendar' : 'In the archive'} title={title}>
      {loading ? (
        <div className="grid gap-6 lg:grid-cols-3">
          {[0, 1, 2].map((i) => <div key={i} className="skeleton h-72 rounded-3xl" />)}
        </div>
      ) : events.length === 0 ? (
        <EmptyState text={empty} />
      ) : (
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={staggerContainer}
          className="grid gap-6 lg:grid-cols-3"
        >
          {events.map((e) => (
            <motion.div key={e.id} variants={fadeUp} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
              <EventCard event={e} tone={tone} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </Section>
  )
}

function EventCard({ event, tone }) {
  const isLive = tone === 'live'
  return (
    <Link
      to={`/events/${event.slug}`}
      className={`group relative block overflow-hidden rounded-3xl bg-white ring-1 ring-ink-100 transition hover:-translate-y-1 hover:shadow-card ${
        isLive ? 'animate-pulseGlow ring-2 ring-brand-500/60' : ''
      }`}
    >
      <div className="relative aspect-[5/3] overflow-hidden bg-ink-100">
        <SafeImage
          src={event.hero_image_url || `https://picsum.photos/seed/${event.slug}/900/540`}
          alt={event.title}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent" />
        <div className="absolute left-4 top-4">
          {isLive ? (
            <span className="pill-live">
              <span className="live-dot" />
              <span className="ml-1.5">LIVE</span>
            </span>
          ) : tone === 'upcoming' ? (
            <span className="pill-upcoming">Upcoming</span>
          ) : (
            <span className="pill-past">Past</span>
          )}
        </div>
        <div className="absolute bottom-4 left-4 text-white">
          <div className="font-display text-xl font-bold leading-tight">{event.title}</div>
          <div className="text-xs text-white/80">{event.location}</div>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 p-5">
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-ink-500">
            {new Date(event.event_start_date).toLocaleString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
          <div className="mt-1 text-sm text-ink-600 line-clamp-2">{event.summary}</div>
        </div>
        <span className="rounded-full bg-ink-50 px-3 py-2 text-sm font-semibold text-brand-600 transition group-hover:bg-brand-500 group-hover:text-white">
          →
        </span>
      </div>
    </Link>
  )
}

function EmptyState({ text }) {
  return (
    <div className="rounded-3xl bg-ink-50 px-8 py-16 text-center ring-1 ring-ink-100">
      <div className="font-display text-2xl font-semibold text-ink-900">{text}</div>
    </div>
  )
}
