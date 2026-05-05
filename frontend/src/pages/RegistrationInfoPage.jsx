import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { eventApi } from '../api/endpoints'

export default function RegistrationInfoPage() {
  const [info, setInfo] = useState(null)

  useEffect(() => {
    eventApi.info().then(({ data }) => setInfo(data?.data)).catch(() => {})
  }, [])

  const fees = info?.fees || { student: 500, faculty: 1000 }

  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <h1 className="text-4xl">Registration info</h1>
      <p className="mt-3 text-slate-600 max-w-3xl">
        Slots are first-come, first-served and capped at 400. Reserve a slot, complete payment within
        the 10-minute hold window, and your BIB number is issued automatically on success.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="card p-6">
          <h3 className="text-lg">Registration fees</h3>
          <dl className="mt-3 divide-y divide-slate-100">
            <div className="flex items-center justify-between py-3">
              <dt className="text-slate-600">Student</dt>
              <dd className="text-brand-900 font-semibold">{fees.student} BDT</dd>
            </div>
            <div className="flex items-center justify-between py-3">
              <dt className="text-slate-600">Faculty</dt>
              <dd className="text-brand-900 font-semibold">{fees.faculty} BDT</dd>
            </div>
          </dl>
        </div>

        <div className="card p-6">
          <h3 className="text-lg">What's included</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            <li>· Official IUBAT race t-shirt</li>
            <li>· BIB number &amp; safety pins</li>
            <li>· Hydration on-course</li>
            <li>· Digital finisher certificate (PDF + QR)</li>
            <li>· Post-race refreshments</li>
          </ul>
        </div>

        <div className="card p-6 md:col-span-2">
          <h3 className="text-lg">How registration works</h3>
          <ol className="mt-3 space-y-3 text-sm text-slate-700 list-decimal pl-5">
            <li>Fill out the registration form. Your slot is reserved for 10 minutes.</li>
            <li>You'll be redirected to the simulated bKash/Nagad payment page.</li>
            <li>On successful payment, your BIB is generated and a confirmation is emailed to you.</li>
            <li>If payment fails, your slot is released back to the pool. You can register again.</li>
          </ol>
          <div className="mt-5">
            <Link to="/register" className="btn-primary">Start registration</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
