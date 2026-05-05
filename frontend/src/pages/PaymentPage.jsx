import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { paymentsApi } from '../api/endpoints'
import { pickErrorMessage } from '../api/client'
import { formatCurrency } from '../utils/format'
import { useCountdown } from '../hooks/useCountdown'

export default function PaymentPage() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const participant = state?.participant
  const fee = state?.fee

  const [gateway, setGateway] = useState('bkash')
  const [transaction, setTransaction] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [step, setStep] = useState(participant ? 'choose-gateway' : 'no-state')

  const countdown = useCountdown(state?.holdExpiresAt)

  useEffect(() => {
    if (!participant) {
      setStep('no-state')
    }
  }, [participant])

  const initiate = async () => {
    setError('')
    setBusy(true)
    try {
      const { data } = await paymentsApi.initiate({ participant_id: participant.id, gateway })
      setTransaction(data?.data)
      setStep('confirm')
    } catch (err) {
      setError(pickErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const finalise = async (outcome) => {
    setError('')
    setBusy(true)
    try {
      const { data } = await paymentsApi.confirm({
        transaction_id: transaction.transaction_id,
        outcome,
        gateway_reference: outcome === 'success' ? `${gateway.toUpperCase()}-MOCK-${Date.now()}` : null,
        payer_phone: participant.phone,
      })
      if (outcome === 'success') {
        navigate('/payment/success', {
          state: {
            participant: data?.data?.participant,
            payment: data?.data?.payment,
          },
        })
      } else {
        setStep('failed')
      }
    } catch (err) {
      setError(pickErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  if (step === 'no-state') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="text-3xl">No active registration</h1>
        <p className="mt-3 text-slate-600">Please start the registration form first.</p>
        <a href="/register" className="btn-primary mt-6 inline-flex">Go to registration</a>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="text-3xl">Complete your payment</h1>

      {countdown && !countdown.expired && (
        <p className="mt-2 text-sm text-slate-500">
          Slot held for{' '}
          <span className="font-medium text-brand-900">
            {countdown.minutes}m {String(countdown.seconds).padStart(2, '0')}s
          </span>
        </p>
      )}

      <div className="card mt-6 p-6">
        <h3 className="text-lg">Order summary</h3>
        <dl className="mt-3 grid gap-2 sm:grid-cols-2 text-sm">
          <div>
            <dt className="text-slate-500">Runner</dt>
            <dd className="font-medium">{participant.full_name}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Category</dt>
            <dd className="capitalize">{participant.category}</dd>
          </div>
          <div>
            <dt className="text-slate-500">University ID</dt>
            <dd>{participant.university_id}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Amount due</dt>
            <dd className="text-brand-900 font-bold">{formatCurrency(fee)}</dd>
          </div>
        </dl>
      </div>

      {step === 'choose-gateway' && (
        <div className="card mt-6 p-6">
          <h3 className="text-lg">Choose payment method</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              { id: 'bkash', label: 'bKash', color: 'bg-pink-50 text-pink-700' },
              { id: 'nagad', label: 'Nagad', color: 'bg-orange-50 text-orange-700' },
            ].map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setGateway(g.id)}
                className={`rounded-lg border-2 p-4 text-left transition ${
                  gateway === g.id ? 'border-brand-700' : 'border-slate-200 hover:border-brand-100'
                }`}
              >
                <div className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${g.color}`}>{g.label}</div>
                <p className="mt-2 text-sm text-slate-600">
                  Pay using your {g.label} account. This is a simulated checkout for the demo.
                </p>
              </button>
            ))}
          </div>
          {error && <div className="mt-4 rounded-md bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
          <button onClick={initiate} disabled={busy} className="btn-primary mt-5 w-full sm:w-auto">
            {busy ? 'Connecting…' : `Continue with ${gateway === 'bkash' ? 'bKash' : 'Nagad'}`}
          </button>
        </div>
      )}

      {step === 'confirm' && transaction && (
        <div className="card mt-6 p-6">
          <h3 className="text-lg">Simulated {transaction.gateway === 'bkash' ? 'bKash' : 'Nagad'} checkout</h3>
          <p className="mt-2 text-sm text-slate-600">
            Transaction ID: <span className="font-mono text-brand-900">{transaction.transaction_id}</span>
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Amount: <span className="font-semibold">{formatCurrency(transaction.amount)}</span>
          </p>
          {error && <div className="mt-4 rounded-md bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
          <div className="mt-5 flex flex-wrap gap-3">
            <button onClick={() => finalise('success')} disabled={busy} className="btn-primary">
              {busy ? 'Processing…' : 'Confirm payment (success)'}
            </button>
            <button onClick={() => finalise('failure')} disabled={busy} className="btn-danger">
              {busy ? 'Processing…' : 'Simulate failure'}
            </button>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            In production these buttons would be replaced by the real bKash/Nagad redirect flow.
          </p>
        </div>
      )}

      {step === 'failed' && (
        <div className="card mt-6 p-6">
          <h3 className="text-lg text-rose-700">Payment did not go through</h3>
          <p className="mt-2 text-sm text-slate-600">
            Your slot is still on hold. You can retry the payment below or come back to this page within the next few minutes.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button onClick={() => setStep('choose-gateway')} className="btn-primary">Try again</button>
            <a href="/register" className="btn-outline">Start over</a>
          </div>
        </div>
      )}
    </div>
  )
}
