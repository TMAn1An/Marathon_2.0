import { useState } from 'react'
import { adminApi } from '../../api/endpoints'
import { pickErrorMessage } from '../../api/client'
import Alert from '../../components/Alert'

/** Parses "BIB,time" lines (header row and blank lines are ignored). */
function parseRows(text) {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const [bib, time] = line.split(/[,\t;]/).map((c) => c?.trim())
      return { bib, time }
    })
    .filter((r) => !/^bib$/i.test(r.bib || ''))
}

export default function AdminResultsPage() {
  const [text, setText] = useState('')
  const [report, setReport] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const rows = parseRows(text)

  const onFile = async (e) => {
    const file = e.target.files?.[0]
    if (file) setText(await file.text())
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setReport(null)
    setBusy(true)
    try {
      const { data } = await adminApi.importResults(rows)
      setReport(data.data)
    } catch (err) {
      setError(pickErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const errorEntries = Object.entries(report?.errors || {})

  return (
    <div className="max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl">Race results</h1>
        <p className="mt-1 text-sm text-slate-600">
          Paste or upload finishing times as <code className="rounded bg-slate-100 px-1">BIB,time</code> lines
          (e.g. <code className="rounded bg-slate-100 px-1">IUB0007,0:52:14</code>). Importing publishes the public
          results board and unlocks certificates for those runners. Re-importing a BIB overwrites its time.
        </p>
      </div>

      <form onSubmit={submit} className="card space-y-4 p-5">
        <div>
          <label htmlFor="csv" className="label">Upload a CSV file</label>
          <input id="csv" type="file" accept=".csv,.txt,text/csv" onChange={onFile} className="block text-sm" />
        </div>
        <div>
          <label htmlFor="rows" className="label">…or paste rows</label>
          <textarea id="rows" rows={10} className="input font-mono" value={text} onChange={(e) => setText(e.target.value)}
            placeholder={'IUB0001,0:48:30\nIUB0002,0:51:02'} />
          <p className="mt-1 text-xs text-slate-500">{rows.length} row{rows.length === 1 ? '' : 's'} detected</p>
        </div>
        <Alert>{error}</Alert>
        <button className="btn-primary" disabled={busy || rows.length === 0}>
          {busy ? 'Importing…' : `Import ${rows.length} result${rows.length === 1 ? '' : 's'}`}
        </button>
      </form>

      {report && (
        <div className="space-y-3">
          <Alert tone="success">{report.updated} result{report.updated === 1 ? '' : 's'} saved.</Alert>
          {errorEntries.length > 0 && (
            <Alert tone="warning">
              <p className="font-medium">{errorEntries.length} row(s) skipped:</p>
              <ul className="mt-1 list-disc pl-5">
                {errorEntries.map(([line, msg]) => <li key={line}>Row {line}: {msg}</li>)}
              </ul>
            </Alert>
          )}
        </div>
      )}
    </div>
  )
}
