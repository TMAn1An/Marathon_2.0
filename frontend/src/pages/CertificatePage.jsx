import { useState } from 'react'
import { certificateApi } from '../api/endpoints'
import { pickErrorMessage } from '../api/client'
import Alert from '../components/Alert'

export default function CertificatePage() {
  const [bib, setBib] = useState('')
  const [phone, setPhone] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setResult(null)
    setLoading(true)
    try {
      const { data } = await certificateApi.lookup(bib.trim(), phone.trim())
      setResult(data?.data)
    } catch (err) {
      setError(pickErrorMessage(err, 'No certificate found.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="text-4xl">Download your certificate</h1>
      <p className="mt-3 text-slate-600">
        Certificates are available to finishers once results are published. Enter your BIB number and the phone
        number you registered with. Every certificate carries a QR code anyone can scan to verify it.
      </p>

      <form onSubmit={onSubmit} className="card mt-8 space-y-4 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="bib">BIB number</label>
            <input id="bib" value={bib} onChange={(e) => setBib(e.target.value)} className="input uppercase"
              placeholder="IUB0001" required autoComplete="off" />
          </div>
          <div>
            <label className="label" htmlFor="phone">Registered phone</label>
            <input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input"
              placeholder="+8801XXXXXXXXX" required autoComplete="tel" />
          </div>
        </div>
        <Alert>{error}</Alert>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Searching…' : 'Find my certificate'}
        </button>
      </form>

      {result && (
        <div className="card mt-6 p-6">
          <h2 className="text-lg">Congratulations, {result.participant.full_name}!</h2>
          <p className="mt-2 text-sm text-slate-600">
            BIB <span className="font-mono">{result.participant.bib_number}</span>
            {result.participant.finish_time && <> · finish time <strong>{result.participant.finish_time}</strong></>}
          </p>
          <a href={certificateApi.downloadUrl(result.certificate_uuid)} target="_blank" rel="noreferrer" className="btn-primary mt-4">
            Download PDF
          </a>
        </div>
      )}
    </div>
  )
}
