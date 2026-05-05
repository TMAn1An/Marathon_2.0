import { Link, useLocation } from 'react-router-dom'
import { formatCurrency } from '../utils/format'

export default function PaymentSuccessPage() {
  const { state } = useLocation()
  const participant = state?.participant
  const payment = state?.payment

  if (!participant) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="text-3xl">No payment in progress</h1>
        <p className="mt-3 text-slate-600">Visit the registration page to start your registration.</p>
        <Link to="/register" className="btn-primary mt-6 inline-flex">Go to registration</Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <div className="card p-8 text-center">
        <div className="mx-auto h-14 w-14 grid place-items-center rounded-full bg-emerald-100 text-emerald-600 text-3xl">✓</div>
        <h1 className="mt-4 text-3xl">You're in!</h1>
        <p className="mt-2 text-slate-600">
          Welcome to the IUBAT CSE 10K Marathon, {participant.full_name}.
        </p>

        <div className="mt-6 rounded-lg bg-brand-50 p-5 text-left">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">BIB Number</p>
              <p className="text-2xl font-bold text-brand-900">{participant.bib_number || '—'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Status</p>
              <p className="text-brand-900 font-semibold capitalize">{participant.status}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Transaction</p>
              <p className="font-mono text-sm text-slate-700">{payment?.transaction_id}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Paid</p>
              <p className="text-slate-700">{formatCurrency(payment?.amount)}</p>
            </div>
          </div>
        </div>

        <p className="mt-6 text-sm text-slate-600">
          A confirmation email is on the way. You can download your finisher certificate here after the race.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/" className="btn-outline">Back to home</Link>
          <Link to="/certificate" className="btn-primary">Open certificate page</Link>
        </div>
      </div>
    </div>
  )
}
