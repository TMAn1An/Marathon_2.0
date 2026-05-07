import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { motion } from 'framer-motion'

export default function PaymentSuccessPage() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const participant = state?.participant
  const event = state?.event

  useEffect(() => {
    if (!participant) navigate('/events', { replace: true })
  }, [participant, navigate])

  if (!participant) return null

  return (
    <div className="bg-ink-50 py-20">
      <div className="mx-auto max-w-2xl px-6 text-center lg:px-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 18 }}
          className="card-elevated p-10"
        >
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-brand-50 text-brand-600 ring-1 ring-brand-200">
            <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="mt-6 font-display text-3xl font-bold text-ink-900">You're in!</h1>
          <p className="mt-2 text-sm text-ink-600">
            Your BIB has been issued and a confirmation email is on the way.
          </p>
          <div className="mt-8 grid gap-4 rounded-2xl bg-ink-50 p-6 ring-1 ring-ink-100 sm:grid-cols-2">
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-ink-500">BIB Number</div>
              <div className="mt-1 font-mono text-2xl font-bold text-brand-600">{participant.bib_number}</div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-ink-500">Runner</div>
              <div className="mt-1 font-display text-lg text-ink-900">{participant.full_name}</div>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {event && <Link to={`/events/${event.slug}`} className="btn-outline">Back to event</Link>}
            <Link to="/news" className="btn-primary">Read race-day briefing</Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
