import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { eventsApi, paymentsApi } from '../api/endpoints'
import { pickErrorMessage } from '../api/client'

export default function PaymentPage() {
  const { participantId } = useParams()
  const navigate = useNavigate()
  const { state } = useLocation()
  const event = state?.event
  const registration = state?.registration
  const [gateway, setGateway] = useState('bkash')
  const [phase, setPhase] = useState('select')
  const [error, setError] = useState(null)
  const [transaction, setTransaction] = useState(null)

  const fee = useMemo(() => registration?.fee ?? null, [registration])

  useEffect(() => {
    if (!registration) {
      navigate('/events', { replace: true })
    }
  }, [registration, navigate])

  const startPayment = async () => {
    setPhase('initiating')
    setError(null)
    try {
      const res = await eventsApi.initiatePayment(event.slug, {
        participant_id: Number(participantId),
        gateway,
      })
      setTransaction(res.data?.data)
      setPhase('confirm')
    } catch (err) {
      setError(pickErrorMessage(err))
      setPhase('select')
    }
  }

  const confirm = async (outcome) => {
    setPhase('confirming')
    setError(null)
    try {
      const res = await paymentsApi.confirm({
        transaction_id: transaction.transaction_id,
        outcome,
        gateway_reference: outcome === 'success' ? `MOCK-${transaction.transaction_id.slice(-6)}` : null,
        payer_phone: '+8801700000000',
      })
      const participant = res.data?.data?.participant
      if (outcome === 'success' && participant?.bib_number) {
        navigate('/payment/success', {
          state: { participant, event },
          replace: true,
        })
      } else {
        setError('Payment failed. Please retry — your slot is held until the timer expires.')
        setPhase('select')
      }
    } catch (err) {
      setError(pickErrorMessage(err))
      setPhase('confirm')
    }
  }

  if (!registration) return null

  return (
    <div className="bg-ink-50 py-20">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <div className="card-elevated overflow-hidden">
          <div className="bg-ink-950 p-8 text-white">
            <span className="pill bg-white/10 text-white">Checkout</span>
            <h1 className="mt-3 font-display text-2xl font-bold">{event?.title}</h1>
            <p className="mt-1 text-sm text-white/75">{event?.location}</p>
          </div>
          <div className="grid gap-8 p-8 sm:grid-cols-[1.2fr_1fr]">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-ink-500">Runner</h3>
              <div className="mt-2 font-display text-xl font-bold text-ink-900">
                {registration.participant.full_name}
              </div>
              <div className="mt-0.5 text-sm capitalize text-ink-600">{registration.participant.category}</div>

              <h3 className="mt-6 text-xs font-semibold uppercase tracking-widest text-ink-500">Pay with</h3>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {['bkash', 'nagad'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    disabled={phase !== 'select'}
                    onClick={() => setGateway(g)}
                    className={`rounded-2xl border-2 px-4 py-3 text-left text-sm font-semibold transition ${
                      gateway === g
                        ? 'border-brand-500 bg-brand-50 text-brand-700'
                        : 'border-ink-200 bg-white text-ink-700 hover:border-ink-300'
                    }`}
                  >
                    <div className="text-xs uppercase tracking-widest text-ink-500">Wallet</div>
                    <div className="mt-1">{g === 'bkash' ? 'bKash' : 'Nagad'}</div>
                  </button>
                ))}
              </div>

              {error && (
                <div className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-100">{error}</div>
              )}

              <div className="mt-6 flex flex-wrap gap-3">
                {phase === 'select' && (
                  <button onClick={startPayment} className="btn-primary">
                    Start payment
                  </button>
                )}
                {phase === 'initiating' && <button disabled className="btn-primary">Connecting…</button>}
                {phase === 'confirm' && (
                  <>
                    <button onClick={() => confirm('success')} className="btn-primary">
                      I paid — confirm
                    </button>
                    <button onClick={() => confirm('failure')} className="btn-outline">
                      Cancel payment
                    </button>
                  </>
                )}
                {phase === 'confirming' && <button disabled className="btn-primary">Confirming…</button>}
                <Link to={`/events/${event?.slug}`} className="btn-outline">Back</Link>
              </div>
            </div>

            <div className="rounded-2xl bg-ink-50 p-6 ring-1 ring-ink-100">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-ink-500">Order summary</h3>
              <dl className="mt-3 space-y-2 text-sm">
                <Row k="Category" v={registration.participant.category} />
                <Row k="Hold expires" v={registration.hold_expires_at ? new Date(registration.hold_expires_at).toLocaleTimeString() : '—'} />
                <div className="my-3 h-px bg-ink-200" />
                <Row k="Total" v={`৳ ${fee?.amount ?? '—'}`} bold />
              </dl>
              {transaction && (
                <div className="mt-4 rounded-lg bg-white p-3 ring-1 ring-ink-100 text-xs text-ink-700">
                  <div className="font-mono text-[11px] text-ink-500">Txn</div>
                  <div className="font-mono">{transaction.transaction_id}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Row({ k, v, bold }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-ink-500 capitalize">{k}</dt>
      <dd className={`text-ink-900 ${bold ? 'font-display text-xl font-bold' : 'font-medium'}`}>{v}</dd>
    </div>
  )
}
