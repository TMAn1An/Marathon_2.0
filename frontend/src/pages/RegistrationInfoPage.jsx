import { Link } from 'react-router-dom'
import { useEvent } from '../context/EventContext'
import { formatCurrency } from '../utils/format'

export default function RegistrationInfoPage() {
  const { totalSlots, holdMinutes, categories } = useEvent()

  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <h1 className="text-4xl">Registration info</h1>
      <p className="mt-3 max-w-3xl text-lg leading-relaxed text-brand-600">
        Slots are first-come, first-served{totalSlots ? ` and capped at ${totalSlots}` : ''}. Reserve a slot, submit your payment
        within the {holdMinutes}-minute hold window, and your BIB number is issued as soon as an organizer confirms it.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="card p-6">
          <h3 className="text-lg">Registration fees</h3>
          <dl className="mt-3 divide-y divide-brand-100">
            {categories.map((c) => (
              <div key={c.id} className="flex items-center justify-between py-3">
                <dt className="text-brand-600">{c.label}</dt>
                <dd className="font-semibold text-brand-950">{formatCurrency(c.fee)}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="card p-6">
          <h3 className="text-lg">What&rsquo;s included</h3>
          <ul className="mt-3 space-y-2 text-sm text-brand-700">
            <li>· Race t-shirt</li>
            <li>· BIB number &amp; safety pins</li>
            <li>· Hydration on the course</li>
            <li>· Digital finisher certificate (PDF + QR)</li>
            <li>· Post-race refreshments</li>
          </ul>
        </div>

        <div className="card p-6 md:col-span-2">
          <h3 className="text-lg">How registration works</h3>
          <ol className="mt-3 list-decimal space-y-3 pl-5 text-sm text-brand-700">
            <li>Fill out the registration form. Your slot is reserved for {holdMinutes} minutes.</li>
            <li>Pay by mobile wallet (bKash or Nagad) and paste your transaction ID (TrxID).</li>
            <li>An organizer verifies the payment. Your BIB is generated and a confirmation is emailed to you.</li>
            <li>If you never submit a payment, the slot is released back to the pool and you can register again.</li>
          </ol>
          <div className="mt-5">
            <Link to="/register" className="btn-primary">Start registration</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
