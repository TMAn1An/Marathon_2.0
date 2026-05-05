import { useState } from 'react'
import { certificateApi } from '../api/endpoints'
import { pickErrorMessage } from '../api/client'

export default function CertificatePage() {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setResult(null)
    if (!query.trim()) {
      setError('Please enter your phone number or BIB number.')
      return
    }
    setLoading(true)
    try {
      const { data } = await certificateApi.lookup(query.trim())
      setResult(data?.data)
    } catch (err) {
      setError(pickErrorMessage(err, 'No matching registration was found.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="text-4xl">Download your certificate</h1>
      <p className="mt-3 text-slate-600">
        Enter the phone number you registered with or your BIB number to download your finisher
        certificate. The certificate includes a QR code that anyone can scan to verify it.
      </p>

      <form onSubmit={onSubmit} className="card mt-8 p-6 space-y-4">
        <div>
          <label className="label" htmlFor="query">Phone number or BIB</label>
          <input id="query" value={query} onChange={(e) => setQuery(e.target.value)}
            className="input" placeholder="+8801XXXXXXXXX or IUB0001" />
        </div>
        {error && <div className="rounded-md bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Searching…' : 'Find my certificate'}
        </button>
      </form>

      {result && (
        <div className="card mt-6 p-6">
          <h3 className="text-lg">Certificate ready</h3>
          <p className="mt-2 text-sm text-slate-600">
            Found a confirmed registration for <strong>{result.participant.full_name}</strong>{' '}
            (BIB <span className="font-mono">{result.participant.bib_number}</span>).
          </p>
          <a
            href={certificateApi.downloadUrl(result.certificate_uuid)}
            target="_blank"
            rel="noreferrer"
            className="btn-primary mt-4"
          >
            Download PDF
          </a>
        </div>
      )}
    </div>
  )
}
