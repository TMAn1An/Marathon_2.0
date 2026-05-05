import { useEffect, useState } from 'react'
import { eventApi } from '../api/endpoints'

export default function ResultsPage() {
  const [resultUrl, setResultUrl] = useState('')

  useEffect(() => {
    eventApi.info().then(({ data }) => setResultUrl(data?.data?.result_url || '')).catch(() => {})
  }, [])

  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <h1 className="text-4xl">Live results</h1>
      <p className="mt-3 text-slate-600 max-w-3xl">
        Race-day results are published to our official timing partner. The board below pulls the
        latest standings — open it in a new tab if your browser blocks iframes.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <a href={resultUrl} target="_blank" rel="noreferrer" className="btn-primary">
          Open results in new tab
        </a>
      </div>

      <div className="mt-8 card overflow-hidden">
        <div className="aspect-[16/10] w-full bg-slate-100">
          {resultUrl ? (
            <iframe title="Marathon results" src={resultUrl} className="h-full w-full border-0" loading="lazy" />
          ) : (
            <div className="grid h-full place-items-center text-slate-500">Loading results board…</div>
          )}
        </div>
      </div>
    </div>
  )
}
