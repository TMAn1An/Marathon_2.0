import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { certificateApi, eventsApi } from '../api/endpoints'
import { pickErrorMessage } from '../api/client'
import { Section } from '../components/Section'

export default function CertificatePage() {
  const [pastEvents, setPastEvents] = useState([])
  const [eventId, setEventId] = useState('')
  const [query, setQuery] = useState('')
  const [phase, setPhase] = useState('idle')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    eventsApi.list().then((res) => {
      const past = res.data?.data?.past || []
      setPastEvents(past)
      if (past.length) setEventId(String(past[0].id))
    }).catch(() => {})
  }, [])

  const onSubmit = async (e) => {
    e.preventDefault()
    setPhase('loading')
    setError(null)
    setResult(null)
    try {
      const res = await certificateApi.lookup({ event_id: eventId, query })
      setResult(res.data?.data)
      setPhase('done')
    } catch (err) {
      setError(pickErrorMessage(err))
      setPhase('idle')
    }
  }

  return (
    <>
      <header className="bg-ink-950 py-20 text-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <span className="pill bg-white/10 text-white">Certificate locker</span>
          <h1 className="mt-4 font-display text-4xl font-extrabold sm:text-5xl">
            Download your verified certificate.
          </h1>
          <p className="mt-3 max-w-2xl text-base text-white/75">
            Certificates are released the moment an event closes. Look up by BIB number or registered phone — they
            land as a print-ready A4 landscape PDF with a QR you can verify online.
          </p>
        </div>
      </header>

      <Section>
        <form onSubmit={onSubmit} className="card-elevated mx-auto grid max-w-3xl gap-5 p-8 sm:grid-cols-[1fr_1.5fr]">
          <label className="block">
            <span className="label">Event</span>
            <select className="input" value={eventId} onChange={(e) => setEventId(e.target.value)} required>
              {pastEvents.length === 0 && <option value="">No past events yet</option>}
              {pastEvents.map((e) => (
                <option key={e.id} value={e.id}>{e.title}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="label">BIB number or phone</span>
            <input className="input" placeholder="e.g. MIN_0031" value={query} onChange={(e) => setQuery(e.target.value)} required />
          </label>
          {error && (
            <div className="sm:col-span-2 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-100">
              {error}
            </div>
          )}
          <div className="sm:col-span-2 flex items-center justify-end">
            <button type="submit" disabled={phase === 'loading' || !pastEvents.length} className="btn-primary">
              {phase === 'loading' ? 'Looking up…' : 'Find certificate'}
            </button>
          </div>
        </form>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto mt-10 max-w-3xl"
          >
            <div className="card-elevated p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="pill-brand">Match found</span>
                  <h3 className="mt-3 font-display text-2xl font-bold text-ink-900">{result.participant.full_name}</h3>
                  <div className="mt-1 text-sm text-ink-600 capitalize">{result.participant.category}</div>
                  <div className="mt-3 font-mono text-xl font-bold text-brand-600">{result.participant.bib_number}</div>
                </div>
                <div className="text-right text-sm text-ink-600">
                  <div className="text-xs uppercase tracking-widest text-ink-500">Event</div>
                  <div className="font-semibold text-ink-900">{result.event.title}</div>
                  <div className="text-xs text-ink-500">
                    {new Date(result.event.event_start_date).toLocaleDateString('en-GB', { dateStyle: 'long' })}
                  </div>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={certificateApi.downloadUrl(result.certificate_uuid)}
                  className="btn-primary"
                  target="_blank"
                  rel="noreferrer"
                >
                  Download PDF
                </a>
                <Link to={`/verify/${result.certificate_uuid}`} className="btn-outline">
                  Verify online
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </Section>
    </>
  )
}
