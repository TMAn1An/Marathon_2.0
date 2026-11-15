import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { paymentsApi } from '../api/endpoints'
import { pickErrorMessage } from '../api/client'
import { formatCurrency } from '../utils/format'
import { useCountdown } from '../hooks/useCountdown'
import Alert from '../components/Alert'

const GATEWAYS = [
  { id: 'bkash', label: 'bKash', tone: 'bg-pink-50 text-pink-700' },
  { id: 'nagad', label: 'Nagad', tone: 'bg-orange-50 text-orange-700' },
]

function loadCheckout(state) {
  if (state?.participant) return state
  try {
    return JSON.parse(sessionStorage.getItem('marathon-checkout') || 'null')
  } catch {
    return null
  }
}

export default function PaymentPage() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const [checkout] = useState(() => loadCheckout(state))
  const participant = checkout?.participant
  const fee = checkout?.fee

  const [config, setConfig] = useState(null)
  const [gateway, setGateway] = useState('bkash')
  const [payment, setPayment] = useState(null)
  const [reference, setReference] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)

  const countdown = useCountdown(payment?.hold_expires_at || checkout?.holdExpiresAt)
  const awaitingVerification = Boolean(payment?.submitted_reference)

  useEffect(() => {
    paymentsApi.config().then(({ data }) => setConfig(data?.data)).catch(() => {})
  }, [])

  if (!participant) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="text-3xl">No active registration</h1>
        <p className="mt-3 text-slate-600">Please fill in the registration form first.</p>
        <Link to="/register" className="btn-primary mt-6 inline-flex">Go to registration</Link>
      </div>
    )
  }

  const mode = payment?.checkout?.mode || config?.mode || 'manual'
  const merchant = (payment?.checkout?.merchant || config?.merchant || {})[gateway]
  const expired = countdown?.expired && !awaitingVerification

  const run = async (fn) => {
    setError('')
    setBusy(true)
    try {
      await fn()
    } catch (err) {
      setError(pickErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const initiate = () => run(async () => {
    const { data } = await paymentsApi.initiate({ participant_token: participant.token, gateway })
    setPayment(data.data)
    setFailed(false)
  })

  const submitReference = (e) => {
    e.preventDefault()
    run(async () => {
      const { data } = await paymentsApi.submit({
        transaction_id: payment.transaction_id,
        participant_token: participant.token,
        reference: reference.trim(),
      })
      setPayment(data.data)
    })
  }

  const simulate = (outcome) => run(async () => {
    const { data } = await paymentsApi.confirm({
      transaction_id: payment.transaction_id,
      participant_token: participant.token,
      outcome,
    })
    if (outcome === 'success') {
      sessionStorage.removeItem('marathon-checkout')
      navigate('/payment/success', { state: { payment: data.data } })
    } else {
      setPayment(null)
      setFailed(true)
    }
  })

  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="text-3xl">Complete your payment</h1>

      {countdown && !countdown.expired && !awaitingVerification && (
        <p className="mt-2 text-sm text-slate-500" aria-live="off">
          Slot held for{' '}
          <span className="font-medium text-brand-900">
            {countdown.minutes}m {String(countdown.seconds).padStart(2, '0')}s
          </span>
        </p>
      )}

      {expired && (
        <Alert tone="warning" className="mt-4">
          Your reservation has expired. <Link to="/register" className="font-semibold underline">Register again</Link> to get a new slot.
        </Alert>
      )}

      <section className="card mt-6 p-6" aria-label="Order summary">
        <h2 className="text-lg">Order summary</h2>
        <dl className="mt-3 grid gap-2 sm:grid-cols-2 text-sm">
          <div><dt className="text-slate-500">Runner</dt><dd className="font-medium">{participant.full_name}</dd></div>
          <div><dt className="text-slate-500">Category</dt><dd className="capitalize">{participant.category}</dd></div>
          <div><dt className="text-slate-500">University ID</dt><dd>{participant.university_id}</dd></div>
          <div><dt className="text-slate-500">Amount due</dt><dd className="text-brand-900 font-bold">{formatCurrency(fee)}</dd></div>
        </dl>
      </section>

      {!expired && !payment && (
        <section className="card mt-6 p-6">
          <h2 className="text-lg">Choose payment method</h2>
          {failed && <Alert tone="warning" className="mt-3">That payment did not go through. Your slot is still held — try again.</Alert>}
          <div className="mt-4 grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Payment method">
            {GATEWAYS.map((g) => (
              <button
                key={g.id}
                type="button"
                role="radio"
                aria-checked={gateway === g.id}
                onClick={() => setGateway(g.id)}
                className={`rounded-lg border-2 p-4 text-left transition ${gateway === g.id ? 'border-brand-700 bg-brand-50' : 'border-slate-200 hover:border-brand-200'}`}
              >
                <span className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${g.tone}`}>{g.label}</span>
                <span className="mt-2 block text-sm text-slate-600">Pay with your {g.label} account.</span>
              </button>
            ))}
          </div>
          <Alert className="mt-4">{error}</Alert>
          <button onClick={initiate} disabled={busy} className="btn-primary mt-5 w-full sm:w-auto">
            {busy ? 'Please wait…' : `Continue with ${GATEWAYS.find((g) => g.id === gateway).label}`}
          </button>
        </section>
      )}

      {!expired && payment && mode === 'manual' && !awaitingVerification && (
        <section className="card mt-6 p-6">
          <h2 className="text-lg">Pay with {GATEWAYS.find((g) => g.id === payment.gateway).label}</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-700">
            <li>
              Open the {payment.gateway === 'bkash' ? 'bKash' : 'Nagad'} app and choose <strong>Send Money</strong>
              {merchant ? <> to <strong className="font-mono text-brand-900">{merchant}</strong></> : ' to the organizers’ number (shown on the registration info page)'}.
            </li>
            <li>Send exactly <strong>{formatCurrency(payment.amount)}</strong> and put <span className="font-mono">{participant.university_id}</span> as the reference.</li>
            <li>Copy the <strong>TrxID</strong> from your receipt and paste it below.</li>
          </ol>
          <form onSubmit={submitReference} className="mt-5 space-y-3">
            <div>
              <label htmlFor="trx" className="label">Transaction ID (TrxID)</label>
              <input id="trx" className="input font-mono uppercase" value={reference} onChange={(e) => setReference(e.target.value)}
                placeholder="e.g. 9AB3KD82XQ" autoComplete="off" required minLength={6} maxLength={32} />
            </div>
            <Alert>{error}</Alert>
            <button type="submit" disabled={busy || reference.trim().length < 6} className="btn-primary">
              {busy ? 'Submitting…' : 'Submit for verification'}
            </button>
          </form>
        </section>
      )}

      {payment && mode === 'manual' && awaitingVerification && (
        <section className="card mt-6 p-8 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-amber-100 text-2xl text-amber-700" aria-hidden>⏳</div>
          <h2 className="mt-4 text-2xl">Payment submitted</h2>
          <p className="mt-2 text-slate-600">
            We received TrxID <span className="font-mono font-semibold text-brand-900">{payment.submitted_reference}</span>.
            An organizer will verify it shortly — your slot is held for up to {payment.checkout?.verification_hold_hours ?? 48} hours and your
            BIB will be emailed once it is confirmed.
          </p>
          <Link to="/" className="btn-outline mt-6 inline-flex">Back to home</Link>
        </section>
      )}

      {!expired && payment && mode === 'simulated' && (
        <section className="card mt-6 p-6">
          <h2 className="text-lg">Demo checkout ({payment.gateway})</h2>
          <Alert tone="info" className="mt-3">
            Demo mode: no real money moves. Production sites use manual bKash/Nagad verification.
          </Alert>
          <p className="mt-3 text-sm text-slate-600">
            Transaction <span className="font-mono text-brand-900">{payment.transaction_id}</span> · {formatCurrency(payment.amount)}
          </p>
          <Alert className="mt-3">{error}</Alert>
          <div className="mt-5 flex flex-wrap gap-3">
            <button onClick={() => simulate('success')} disabled={busy} className="btn-primary">Simulate success</button>
            <button onClick={() => simulate('failure')} disabled={busy} className="btn-danger">Simulate failure</button>
          </div>
        </section>
      )}
    </div>
  )
}
