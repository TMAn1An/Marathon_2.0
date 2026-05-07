import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { certificateApi } from '../api/endpoints'

export default function VerifyCertificatePage() {
  const { uuid } = useParams()
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    certificateApi.verify(uuid).then((res) => setData(res.data?.data)).catch(() => setError('Invalid or expired link.'))
  }, [uuid])

  return (
    <div className="bg-ink-50 py-20">
      <div className="mx-auto max-w-2xl px-6 lg:px-8">
        <div className="card-elevated p-10 text-center">
          <span className="pill-brand">Certificate verification</span>
          {error && <div className="mt-6 text-rose-700">{error}</div>}
          {data && (
            <>
              <div className="mx-auto mt-6 grid h-16 w-16 place-items-center rounded-full bg-brand-50 ring-1 ring-brand-200 text-brand-600">
                <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h1 className="mt-4 font-display text-3xl font-bold text-ink-900">Authentic certificate</h1>
              <p className="mt-2 text-sm text-ink-600">
                Issued by IUBAT SCSE MINI Marathon platform.
              </p>
              <div className="mt-8 grid gap-4 rounded-2xl bg-ink-50 p-6 ring-1 ring-ink-100 sm:grid-cols-2 text-left">
                <Cell k="Participant" v={data.participant?.full_name} />
                <Cell k="BIB" v={<span className="font-mono">{data.participant?.bib_number}</span>} />
                <Cell k="Category" v={<span className="capitalize">{data.participant?.category}</span>} />
                <Cell k="Event" v={data.event?.title} />
                {data.participant?.chip_time && <Cell k="Chip time" v={data.participant.chip_time} />}
                {data.participant?.overall_place && <Cell k="Overall rank" v={`#${data.participant.overall_place}`} />}
              </div>
            </>
          )}
          {!data && !error && <div className="mt-6 skeleton h-32 rounded-xl" />}
        </div>
      </div>
    </div>
  )
}

function Cell({ k, v }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-widest text-ink-500">{k}</div>
      <div className="mt-0.5 font-display text-base text-ink-900">{v ?? '—'}</div>
    </div>
  )
}
