import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { eventsApi } from '../api/endpoints'
import { Section } from '../components/Section'
import CountdownClock from '../components/CountdownClock'
import Donut from '../components/Donut'
import SafeImage from '../components/SafeImage'
import RegistrationForm from '../components/RegistrationForm'

export default function EventDetailPage() {
  const { slug } = useParams()
  const [event, setEvent] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      eventsApi.show(slug),
      eventsApi.slots(slug),
      eventsApi.registrationStatus(slug),
    ])
      .then(([e, s, r]) => {
        setEvent(e.data?.data)
        setAnalytics(s.data?.data)
        setStatus(r.data?.data)
      })
      .catch(() => setError('Could not load event.'))
      .finally(() => setLoading(false))
  }, [slug])

  const targetDate = useMemo(() => {
    if (!event || !status) return null
    if (status.is_locked) return status.unlocks_at
    return event.event_date
  }, [event, status])

  if (loading) {
    return <div className="mx-auto max-w-7xl px-6 py-24"><div className="skeleton h-96 rounded-3xl" /></div>
  }
  if (error || !event) {
    return <div className="mx-auto max-w-7xl px-6 py-24 text-center text-ink-700">{error || 'Event not found.'}</div>
  }

  const isPast = event.status === 'past'
  const isLive = event.status === 'live'
  const canRegister = !status?.is_locked && !isPast

  return (
    <>
      <header className="relative isolate overflow-hidden bg-ink-950 py-24 text-white">
        <SafeImage
          src={event.hero_image_url || `https://picsum.photos/seed/${event.slug}/1600/900`}
          alt={event.title}
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex items-center gap-2">
            {isLive && <span className="pill-live"><span className="live-dot" /><span className="ml-1.5">LIVE</span></span>}
            {!isLive && !isPast && <span className="pill bg-white/10 text-white">Upcoming</span>}
            {isPast && <span className="pill bg-white/10 text-white">Past event</span>}
            <span className="pill bg-white/10 text-white">{event.location}</span>
          </div>
          <h1 className="mt-5 font-display text-4xl font-extrabold sm:text-5xl">{event.title}</h1>
          <p className="mt-4 max-w-3xl text-base text-white/80">{event.summary}</p>
          <div className="mt-8 max-w-md">
            <CountdownClock target={targetDate} tone="dark" />
            <p className="mt-3 text-xs uppercase tracking-widest text-white/60">
              {status?.is_locked
                ? `Registration unlocks ${new Date(status.unlocks_at).toLocaleString('en-GB')}`
                : isPast
                ? 'Event has concluded'
                : `Race day · ${new Date(event.event_date).toLocaleDateString('en-GB')}`}
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            {canRegister && <a href="#register" className="btn-cta">Register now</a>}
            {isPast && <Link to="/certificate" className="btn-cta">Download certificate</Link>}
            <Link to="/events" className="btn-ghost">All events</Link>
          </div>
        </div>
      </header>

      <Section eyebrow="About" title="What this run is about">
        <div
          className="prose prose-ink mx-auto max-w-3xl prose-headings:font-display prose-a:text-brand-600"
          dangerouslySetInnerHTML={{ __html: event.description || '' }}
        />
      </Section>

      {analytics && (
        <Section
          eyebrow="Registration analytics"
          title="Where the slots are going"
          intro="We never publish raw slot counts — only how each segment is filling up."
        >
          <div className="mx-auto max-w-3xl rounded-3xl bg-white p-6 shadow-card ring-1 ring-ink-100 sm:p-10">
            <Donut segments={analytics.segments} note={analytics.note} />
          </div>
        </Section>
      )}

      <section id="register" className="bg-ink-50 py-20">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Registration</span>
            <h2 className="mt-2 font-display text-3xl font-bold text-ink-900">Reserve your BIB</h2>
            <p className="mt-2 text-sm text-ink-600">
              We'll hold your slot for 10 minutes while you complete payment.
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-10"
          >
            {status?.is_locked ? (
              <LockedCard status={status} />
            ) : isPast ? (
              <PastCard event={event} />
            ) : (
              <RegistrationForm event={event} />
            )}
          </motion.div>
        </div>
      </section>
    </>
  )
}

function LockedCard({ status }) {
  return (
    <div className="card-elevated mx-auto max-w-2xl p-10 text-center">
      <span className="pill-brand">Registration locked</span>
      <h3 className="mt-4 font-display text-2xl font-bold text-ink-900">
        We open the gates on{' '}
        {new Date(status.unlocks_at).toLocaleString('en-GB', { dateStyle: 'long', timeStyle: 'short' })}
      </h3>
      <p className="mt-3 text-sm text-ink-600">
        Bookmark this page or join our news feed and we'll ping you the moment forms go live.
      </p>
      <div className="mx-auto mt-6 max-w-sm">
        <CountdownClock target={status.unlocks_at} />
      </div>
    </div>
  )
}

function PastCard({ event }) {
  return (
    <div className="card-elevated mx-auto max-w-2xl p-10 text-center">
      <span className="pill-ink">Event concluded</span>
      <h3 className="mt-4 font-display text-2xl font-bold text-ink-900">
        {event.title} is in the books.
      </h3>
      <p className="mt-3 text-sm text-ink-600">
        Download your verified certificate from the certificate page.
      </p>
      <Link to="/certificate" className="btn-primary mt-6 inline-flex">
        Open certificate locker
      </Link>
    </div>
  )
}
