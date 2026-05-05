import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { certificateApi } from '../api/endpoints'

export default function VerifyCertificatePage() {
  const { uuid } = useParams()
  const [state, setState] = useState({ loading: true, valid: false, data: null, error: '' })

  useEffect(() => {
    certificateApi.verify(uuid)
      .then(({ data }) => setState({ loading: false, valid: !!data?.valid, data: data?.data || null, error: '' }))
      .catch(() => setState({ loading: false, valid: false, data: null, error: 'Certificate not found.' }))
  }, [uuid])

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-3xl">Certificate verification</h1>
      <p className="mt-2 text-sm text-slate-500 break-all">UUID: {uuid}</p>

      <div className="card mt-6 p-6 text-center">
        {state.loading ? (
          <p className="text-slate-500">Verifying…</p>
        ) : state.valid ? (
          <>
            <div className="mx-auto h-14 w-14 grid place-items-center rounded-full bg-emerald-100 text-emerald-600 text-3xl">✓</div>
            <h3 className="mt-3 text-2xl">Verified</h3>
            <p className="mt-2 text-slate-600">This is a genuine IUBAT marathon certificate.</p>
            <dl className="mt-5 grid gap-3 sm:grid-cols-2 text-left">
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">Name</dt>
                <dd className="font-medium">{state.data.full_name}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">BIB</dt>
                <dd className="font-medium">{state.data.bib_number}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">Category</dt>
                <dd className="capitalize">{state.data.category}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">Event</dt>
                <dd>{state.data.event}</dd>
              </div>
            </dl>
          </>
        ) : (
          <>
            <div className="mx-auto h-14 w-14 grid place-items-center rounded-full bg-rose-100 text-rose-600 text-3xl">✗</div>
            <h3 className="mt-3 text-2xl">Not verified</h3>
            <p className="mt-2 text-slate-600">We could not find a certificate with that ID.</p>
          </>
        )}
      </div>
    </div>
  )
}
