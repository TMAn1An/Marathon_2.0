import { Link, useLocation } from 'react-router-dom'
import { formatCurrency } from '../utils/format'
import { useEvent } from '../context/EventContext'

export default function PaymentSuccessPage() {
  const { state } = useLocation()
  const { event } = useEvent()
  const payment = state?.payment
  const participant = payment?.participant

  if (!participant) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="text-3xl">Nothing to show here</h1>
        <p className="mt-3 text-slate-600">Start from the registration page.</p>
        <Link to="/register" className="btn-primary mt-6 inline-flex">Go to registration</Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <div className="card p-8 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-3xl text-emerald-600" aria-hidden>✓</div>
        <h1 className="mt-4 text-3xl">You&rsquo;re in!</h1>
        <p className="mt-2 text-slate-600">Welcome to the {event.name}, {participant.full_name}.</p>

        <dl className="mt-6 grid gap-4 rounded-lg bg-brand-50 p-5 text-left sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">BIB number</dt>
            <dd className="text-2xl font-bold text-brand-900">{participant.bib_number || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">Paid</dt>
            <dd className="text-slate-700">{formatCurrency(payment.amount)}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs uppercase tracking-wide text-slate-500">Transaction</dt>
            <dd className="font-mono text-sm text-slate-700">{payment.transaction_id}</dd>
          </div>
        </dl>

        <p className="mt-6 text-sm text-slate-600">
          A confirmation email is on its way. Keep your BIB handy — you will need it, with your phone number,
          to download your certificate after the race.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/" className="btn-outline">Back to home</Link>
          <Link to="/registration-info" className="btn-primary">Race-day info</Link>
        </div>
      </div>
    </div>
  )
}
