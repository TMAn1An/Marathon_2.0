import { useCallback, useEffect, useRef, useState } from 'react'
import { adminApi } from '../../api/endpoints'
import { pickErrorMessage } from '../../api/client'
import { formatCurrency, formatDateTime, statusBadgeClass } from '../../utils/format'
import Alert from '../../components/Alert'

const TABS = [
  { id: 'pending', label: 'Awaiting review' },
  { id: 'completed', label: 'Approved' },
  { id: 'failed', label: 'Rejected' },
  { id: 'all', label: 'All' },
]

const REASONS = [
  'TrxID not found in our account',
  'Amount does not match the fee',
  'TrxID already used or invalid',
]

const LABEL = { pending: 'awaiting review', completed: 'approved', failed: 'rejected' }

export default function AdminPaymentsPage() {
  const [tab, setTab] = useState('pending')
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [rows, setRows] = useState(null)
  const [notice, setNotice] = useState({ tone: 'error', text: '' })
  const [busyId, setBusyId] = useState(null)
  const [rejecting, setRejecting] = useState(null)
  const [reason, setReason] = useState('')

  const requestId = useRef(0)

  const load = useCallback(async () => {
    // Only the latest request may update the table (slow earlier ones are ignored).
    const id = ++requestId.current
    try {
      const { data } = await adminApi.payments({ status: tab, search: query || undefined, per_page: 50 })
      if (id === requestId.current) setRows(data.data)
    } catch (err) {
      if (id !== requestId.current) return
      setNotice({ tone: 'error', text: pickErrorMessage(err) })
      setRows([])
    }
    window.dispatchEvent(new Event('payments-changed'))
  }, [tab, query])

  useEffect(() => { setRows(null); load() }, [load])

  useEffect(() => {
    const id = setTimeout(() => setQuery(search.trim()), 350)
    return () => clearTimeout(id)
  }, [search])

  const approve = async (p) => {
    if (!confirm(`Approve ${formatCurrency(p.amount)} from ${p.participant?.full_name}?\nTrxID ${p.submitted_reference}\n\nThis confirms their slot and issues a BIB.`)) return
    setBusyId(p.id)
    setNotice({ tone: 'error', text: '' })
    try {
      await adminApi.approvePayment(p.id)
      setNotice({ tone: 'success', text: `Approved. ${p.participant?.full_name} is confirmed and a BIB was issued.` })
      load()
    } catch (err) {
      setNotice({ tone: 'error', text: pickErrorMessage(err) })
    } finally {
      setBusyId(null)
    }
  }

  const submitReject = async (e) => {
    e.preventDefault()
    setBusyId(rejecting.id)
    try {
      await adminApi.rejectPayment(rejecting.id, reason.trim())
      setNotice({ tone: 'success', text: `Rejected. ${rejecting.participant?.full_name} was emailed and can pay again.` })
      setRejecting(null)
      setReason('')
      load()
    } catch (err) {
      setNotice({ tone: 'error', text: pickErrorMessage(err) })
    } finally {
      setBusyId(null)
    }
  }

  const copy = (text) => navigator.clipboard?.writeText(text).catch(() => {})

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl">Payments</h1>
        <p className="mt-1 text-sm text-slate-600">
          Runners send money by bKash/Nagad and submit the TrxID. Check it in your wallet, then approve (issues the BIB) or reject (they are emailed and can try again).
        </p>
      </div>

      <Alert tone={notice.tone}>{notice.text}</Alert>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-xl bg-white p-1 shadow-soft" role="tablist">
          {TABS.map((t) => (
            <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${tab === t.id ? 'bg-brand-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
              {t.label}
            </button>
          ))}
        </div>
        <input aria-label="Search payments" className="input max-w-xs" placeholder="Search TrxID, name or phone"
          value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3">Submitted</th>
              <th className="px-4 py-3">Runner</th>
              <th className="px-4 py-3">Method</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3">TrxID</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows === null ? (
              <tr><td colSpan="7" className="px-4 py-8 text-center text-slate-500">Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan="7" className="px-4 py-10 text-center text-slate-500">
                {tab === 'pending' ? 'Nothing waiting for review. 🎉' : 'No payments here yet.'}
              </td></tr>
            ) : rows.map((p) => (
              <tr key={p.id}>
                <td className="whitespace-nowrap px-4 py-3 text-slate-500">{formatDateTime(p.submitted_at || p.created_at)}</td>
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-800">{p.participant?.full_name}</div>
                  <div className="text-xs text-slate-500">{p.participant?.phone}</div>
                </td>
                <td className="px-4 py-3 capitalize">{p.gateway}</td>
                <td className="px-4 py-3 text-right font-semibold tabular-nums">{formatCurrency(p.amount)}</td>
                <td className="px-4 py-3">
                  {p.submitted_reference ? (
                    <button onClick={() => copy(p.submitted_reference)} title="Copy TrxID" className="font-mono text-brand-900 hover:underline">
                      {p.submitted_reference}
                    </button>
                  ) : <span className="text-slate-400">not submitted</span>}
                </td>
                <td className="px-4 py-3">
                  <span className={statusBadgeClass(p.status)}>{LABEL[p.status] || p.status}</span>
                  {p.status === 'failed' && p.failure_reason && <div className="mt-1 max-w-[16rem] text-xs text-slate-500">{p.failure_reason}</div>}
                  {p.status === 'completed' && p.participant?.bib_number && <div className="mt-1 font-mono text-xs text-slate-500">{p.participant.bib_number}</div>}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  {p.status === 'pending' && p.submitted_reference && (
                    <div className="flex gap-2">
                      <button onClick={() => approve(p)} disabled={busyId === p.id} className="btn-primary !px-4 !py-1.5">Approve</button>
                      <button onClick={() => { setRejecting(p); setReason('') }} disabled={busyId === p.id} className="btn-outline !px-4 !py-1.5">Reject</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rejecting && (
        <div className="fixed inset-0 z-30 grid place-items-center bg-black/40 px-4" role="dialog" aria-modal="true" aria-label="Reject payment">
          <form onSubmit={submitReject} className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg">Reject payment</h3>
            <p className="text-sm text-slate-600">
              {rejecting.participant?.full_name} · TrxID <span className="font-mono">{rejecting.submitted_reference}</span> · {formatCurrency(rejecting.amount)}.
              They will be emailed this reason and can submit a corrected TrxID.
            </p>
            <div className="flex flex-wrap gap-2">
              {REASONS.map((r) => (
                <button type="button" key={r} onClick={() => setReason(r)}
                  className={`rounded-full border px-3 py-1 text-xs ${reason === r ? 'border-brand-900 bg-brand-900 text-white' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}`}>
                  {r}
                </button>
              ))}
            </div>
            <div>
              <label htmlFor="reason" className="label">Reason shown to the runner</label>
              <textarea id="reason" rows={3} className="input" value={reason} onChange={(e) => setReason(e.target.value)} required minLength={3} maxLength={200} />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setRejecting(null)} className="btn-outline">Cancel</button>
              <button type="submit" disabled={busyId === rejecting.id || reason.trim().length < 3} className="btn-danger">
                {busyId === rejecting.id ? 'Rejecting…' : 'Reject & email runner'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
