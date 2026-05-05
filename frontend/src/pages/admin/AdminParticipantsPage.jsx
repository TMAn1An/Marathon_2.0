import { useCallback, useEffect, useState } from 'react'
import { adminApi } from '../../api/endpoints'
import { getAdminToken } from '../../api/client'
import { formatDateTime, statusBadgeClass } from '../../utils/format'

const categories = [
  { value: '', label: 'All categories' },
  { value: 'student', label: 'Students' },
  { value: 'faculty', label: 'Faculty' },
]

const statuses = [
  { value: '', label: 'All statuses' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'reserved', label: 'Reserved' },
  { value: 'pending_payment', label: 'Pending payment' },
  { value: 'cancelled', label: 'Cancelled' },
]

export default function AdminParticipantsPage() {
  const [data, setData] = useState({ data: [], current_page: 1, last_page: 1, total: 0 })
  const [filters, setFilters] = useState({ category: '', status: '', search: '' })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await adminApi.participants({ ...filters, page, per_page: 20 })
      setData(data)
    } finally {
      setLoading(false)
    }
  }, [filters, page])

  useEffect(() => { load() }, [load])

  const onChangeFilter = (key, value) => {
    setPage(1)
    setFilters((f) => ({ ...f, [key]: value }))
  }

  const downloadCsv = async () => {
    const url = adminApi.exportUrl(filters)
    const token = getAdminToken()
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    if (!res.ok) {
      alert('Could not export CSV.')
      return
    }
    const blob = await res.blob()
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'participants.csv'
    link.click()
  }

  const verifyPayment = async (participant) => {
    if (!confirm(`Mark payment as verified for ${participant.full_name}?`)) return
    setBusy(true)
    try {
      await adminApi.verifyPayment(participant.id)
      load()
    } finally {
      setBusy(false)
    }
  }

  const saveEdit = async (e) => {
    e.preventDefault()
    if (!editing) return
    setBusy(true)
    try {
      await adminApi.updateParticipant(editing.id, {
        full_name: editing.full_name,
        category: editing.category,
        phone: editing.phone,
        email: editing.email,
        emergency_contact: editing.emergency_contact,
        tshirt_size: editing.tshirt_size,
        status: editing.status,
      })
      setEditing(null)
      load()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl">Participants</h1>
        <button onClick={downloadCsv} className="btn-outline">Export CSV</button>
      </div>

      <div className="card p-4 grid gap-3 sm:grid-cols-4">
        <input value={filters.search} onChange={(e) => onChangeFilter('search', e.target.value)}
          className="input sm:col-span-2" placeholder="Search by name, email, BIB, ID…" />
        <select className="input" value={filters.category} onChange={(e) => onChangeFilter('category', e.target.value)}>
          {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <select className="input" value={filters.status} onChange={(e) => onChangeFilter('status', e.target.value)}>
          {statuses.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3">BIB</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Confirmed</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan="7" className="px-4 py-6 text-center text-slate-500">Loading…</td></tr>
            ) : data.data.length === 0 ? (
              <tr><td colSpan="7" className="px-4 py-6 text-center text-slate-500">No participants yet.</td></tr>
            ) : data.data.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3 font-mono text-brand-900">{p.bib_number || '—'}</td>
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-800">{p.full_name}</div>
                  <div className="text-xs text-slate-500">{p.email}</div>
                  <div className="text-xs text-slate-500">{p.phone}</div>
                </td>
                <td className="px-4 py-3 capitalize">{p.category}</td>
                <td className="px-4 py-3"><span className={statusBadgeClass(p.status)}>{p.status}</span></td>
                <td className="px-4 py-3">
                  {p.latest_payment ? (
                    <span className={statusBadgeClass(p.latest_payment.status)}>{p.latest_payment.status}</span>
                  ) : <span className="text-slate-400">—</span>}
                </td>
                <td className="px-4 py-3 text-slate-500">{formatDateTime(p.confirmed_at)}</td>
                <td className="px-4 py-3 space-x-2 whitespace-nowrap">
                  <button onClick={() => setEditing({ ...p })} className="text-brand-700 hover:underline text-sm">Edit</button>
                  {p.latest_payment?.status === 'pending' && (
                    <button onClick={() => verifyPayment(p)} disabled={busy} className="text-emerald-700 hover:underline text-sm">
                      Verify
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm">
          <p className="text-slate-500">{data.total} total participants</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="btn-outline px-3 py-1.5 text-sm">Prev</button>
            <span>Page {data.current_page} of {data.last_page}</span>
            <button onClick={() => setPage((p) => Math.min(data.last_page || 1, p + 1))}
              disabled={page >= (data.last_page || 1)}
              className="btn-outline px-3 py-1.5 text-sm">Next</button>
          </div>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-30 grid place-items-center bg-black/40 px-4">
          <form onSubmit={saveEdit} className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl space-y-4">
            <h3 className="text-lg">Edit participant</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="label">Full name</label>
                <input className="input" value={editing.full_name}
                  onChange={(e) => setEditing({ ...editing, full_name: e.target.value })} />
              </div>
              <div>
                <label className="label">Category</label>
                <select className="input" value={editing.category}
                  onChange={(e) => setEditing({ ...editing, category: e.target.value })}>
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                </select>
              </div>
              <div>
                <label className="label">Phone</label>
                <input className="input" value={editing.phone}
                  onChange={(e) => setEditing({ ...editing, phone: e.target.value })} />
              </div>
              <div>
                <label className="label">Email</label>
                <input className="input" type="email" value={editing.email}
                  onChange={(e) => setEditing({ ...editing, email: e.target.value })} />
              </div>
              <div>
                <label className="label">Emergency contact</label>
                <input className="input" value={editing.emergency_contact}
                  onChange={(e) => setEditing({ ...editing, emergency_contact: e.target.value })} />
              </div>
              <div>
                <label className="label">T-shirt size</label>
                <select className="input" value={editing.tshirt_size}
                  onChange={(e) => setEditing({ ...editing, tshirt_size: e.target.value })}>
                  {['XS','S','M','L','XL','XXL'].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="label">Status</label>
                <select className="input" value={editing.status}
                  onChange={(e) => setEditing({ ...editing, status: e.target.value })}>
                  <option value="reserved">Reserved</option>
                  <option value="pending_payment">Pending payment</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setEditing(null)} className="btn-outline">Cancel</button>
              <button type="submit" disabled={busy} className="btn-primary">{busy ? 'Saving…' : 'Save'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
