import { useEffect, useState } from 'react'
import { resultsApi } from '../api/endpoints'
import { pickErrorMessage } from '../api/client'
import Alert from '../components/Alert'
import Spinner from '../components/Spinner'

const TABS = [
  { id: '', label: 'Overall' },
  { id: 'student', label: 'Students' },
  { id: 'faculty', label: 'Faculty' },
]

export default function ResultsPage() {
  const [category, setCategory] = useState('')
  const [rows, setRows] = useState(null)
  const [externalUrl, setExternalUrl] = useState('')
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')

  useEffect(() => {
    let active = true
    resultsApi.list(category)
      .then(({ data }) => {
        if (!active) return
        setRows(data.data)
        setExternalUrl(data.external_url || '')
        setError('')
      })
      .catch((err) => active && setError(pickErrorMessage(err)))
    return () => { active = false }
  }, [category])

  const q = query.trim().toLowerCase()
  const visible = (rows || []).filter(
    (r) => !q || r.full_name.toLowerCase().includes(q) || (r.bib_number || '').toLowerCase().includes(q),
  )

  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <h1 className="text-4xl">Results</h1>
      <p className="mt-3 max-w-3xl text-slate-600">
        Official finishing times, ranked by chip time. Looking for your certificate?{' '}
        <a href="/certificate" className="font-medium text-brand-700 underline">Download it here</a>.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-lg bg-white p-1 shadow-soft" role="tablist">
          {TABS.map((t) => (
            <button key={t.id} role="tab" aria-selected={category === t.id} onClick={() => { setRows(null); setCategory(t.id) }}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${category === t.id ? 'bg-brand-700 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
              {t.label}
            </button>
          ))}
        </div>
        <input aria-label="Search by name or BIB" className="input max-w-xs" placeholder="Search name or BIB"
          value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      <div className="card mt-6 overflow-x-auto">
        {error ? (
          <Alert className="m-4">{error}</Alert>
        ) : rows === null ? (
          <Spinner label="Loading results…" />
        ) : visible.length === 0 ? (
          <p className="p-10 text-center text-slate-500">
            {rows.length === 0 ? 'Results will appear here once the race has finished.' : 'No runners match your search.'}
          </p>
        ) : (
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Runner</th>
                <th className="px-4 py-3">BIB</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.map((r) => (
                <tr key={r.bib_number} className="hover:bg-brand-50/50">
                  <td className="px-4 py-3 font-semibold text-brand-900">{category ? r.category_rank : r.rank}</td>
                  <td className="px-4 py-3">{r.full_name}</td>
                  <td className="px-4 py-3 font-mono text-slate-600">{r.bib_number}</td>
                  <td className="px-4 py-3 capitalize text-slate-600">{r.category}</td>
                  <td className="px-4 py-3 text-right font-mono font-semibold">{r.finish_time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {externalUrl && (
        <p className="mt-4 text-sm text-slate-500">
          Also published by our timing partner: <a href={externalUrl} target="_blank" rel="noreferrer" className="text-brand-700 underline">open external results</a>.
        </p>
      )}
    </div>
  )
}
