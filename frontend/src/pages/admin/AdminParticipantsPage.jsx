import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { adminApi } from '../../api/endpoints'
import { getAdminToken, pickErrorMessage } from '../../api/client'

const CATEGORIES = [
  { value: '', label: 'All categories' },
  { value: 'student', label: 'Students' },
  { value: 'faculty', label: 'Faculty' },
  { value: 'guest', label: 'Guests' },
]

const STATUSES = [
  { value: '', label: 'All statuses' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'reserved', label: 'Reserved' },
  { value: 'pending_payment', label: 'Pending payment' },
  { value: 'cancelled', label: 'Cancelled' },
]

export default function AdminParticipantsPage() {
  const { eventId } = useParams()
  const [event, setEvent] = useState(null)
  const [data, setData] = useState({ data: [], total: 0 })
  const [filters, setFilters] = useState({ category: '', status: '', search: '' })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [resultOf, setResultOf] = useState(null)
  const [guestModal, setGuestModal] = useState(false)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await adminApi.participants(eventId, { ...filters, page, per_page: 25 })
      setData(data)
    } catch (err) { setError(pickErrorMessage(err)) }
    finally { setLoading(false) }
  }, [eventId, filters, page])

  useEffect(() => { load() }, [load])
  useEffect(() => { adminApi.event(eventId).then((res) => setEvent(res.data?.data)).catch(() => {}) }, [eventId])

  const downloadCsv = async () => {
    const url = adminApi.exportUrl(eventId, filters)
    const res = await fetch(url, { headers: { Authorization: `Bearer ${getAdminToken()}` } })
    if (!res.ok) return setError('Could not export CSV.')
    const blob = await res.blob()
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `participants-event-${eventId}.csv`
    link.click()
  }

  const verifyPayment = async (p) => {
    if (!confirm(`Mark payment verified for ${p.full_name}?`)) return
    try { await adminApi.verifyPayment(p.id); load() }
    catch (err) { setError(pickErrorMessage(err)) }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link to="/admin/events" className="text-xs font-semibold text-brand-600 hover:underline">← Events</Link>
          <h1 className="mt-2 font-display text-3xl font-bold text-ink-900">Participants</h1>
          <p className="mt-1 text-sm text-ink-500">{event?.title}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setGuestModal(true)} className="btn-outline">+ Guest registration</button>
          <button onClick={downloadCsv} className="btn-primary">Export CSV</button>
        </div>
      </header>

      {error && <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-100">{error}</div>}

      <div className="card-elevated grid gap-3 p-4 sm:grid-cols-4">
        <input
          className="input sm:col-span-2"
          placeholder="Search name, email, BIB…"
          value={filters.search}
          onChange={(e) => { setPage(1); setFilters((f) => ({ ...f, search: e.target.value })) }}
        />
        <select className="input" value={filters.category} onChange={(e) => { setPage(1); setFilters((f) => ({ ...f, category: e.target.value })) }}>
          {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <select className="input" value={filters.status} onChange={(e) => { setPage(1); setFilters((f) => ({ ...f, status: e.target.value })) }}>
          {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      <div className="card-elevated overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-ink-50 text-left text-[10px] font-semibold uppercase tracking-widest text-ink-500">
            <tr>
              <th className="px-4 py-3">BIB</th>
              <th className="px-4 py-3">Runner</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Result</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100 bg-white">
            {loading ? (
              <tr><td colSpan="6" className="px-4 py-8 text-center text-ink-500">Loading…</td></tr>
            ) : data.data.length === 0 ? (
              <tr><td colSpan="6" className="px-4 py-8 text-center text-ink-500">No participants match these filters.</td></tr>
            ) : data.data.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3 font-mono text-brand-600">{p.bib_number || '—'}</td>
                <td className="px-4 py-3">
                  <div className="font-medium text-ink-900">{p.full_name}</div>
                  <div className="text-xs text-ink-500">{p.email} · {p.phone}</div>
                </td>
                <td className="px-4 py-3 capitalize text-ink-700">{p.category}</td>
                <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                <td className="px-4 py-3 text-xs text-ink-700">
                  {p.chip_time && <div className="font-mono">{p.chip_time}</div>}
                  {p.overall_place && <div>#{p.overall_place} overall</div>}
                  {p.gender_place && <div className="capitalize">#{p.gender_place} {p.gender}</div>}
                  {!p.chip_time && '—'}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex flex-wrap justify-end gap-2 text-xs">
                    {p.status === 'confirmed' && (
                      <button onClick={() => setResultOf(p)} className="font-semibold text-brand-600 hover:underline">Record result</button>
                    )}
                    {p.status === 'pending_payment' && (
                      <button onClick={() => verifyPayment(p)} className="font-semibold text-emerald-700 hover:underline">Verify payment</button>
                    )}
                    <button onClick={() => setEditing(p)} className="font-semibold text-ink-600 hover:underline">Edit</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.last_page > 1 && (
        <div className="flex items-center justify-end gap-2 text-sm">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn-outline disabled:opacity-50">Prev</button>
          <span className="text-ink-500">Page {data.current_page} of {data.last_page}</span>
          <button disabled={page >= data.last_page} onClick={() => setPage((p) => p + 1)} className="btn-outline disabled:opacity-50">Next</button>
        </div>
      )}

      {editing && <EditParticipantModal participant={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load() }} onError={setError} />}
      {resultOf && <ResultModal participant={resultOf} onClose={() => setResultOf(null)} onSaved={() => { setResultOf(null); load() }} onError={setError} />}
      {guestModal && <GuestModal eventId={eventId} onClose={() => setGuestModal(false)} onSaved={() => { setGuestModal(false); load() }} onError={setError} />}
    </div>
  )
}

function StatusBadge({ status }) {
  const map = {
    confirmed: 'bg-emerald-100 text-emerald-800',
    reserved: 'bg-amber-100 text-amber-800',
    pending_payment: 'bg-amber-100 text-amber-800',
    cancelled: 'bg-rose-100 text-rose-800',
  }
  return <span className={`pill ${map[status] || 'bg-ink-100 text-ink-700'}`}>{status?.replace('_', ' ')}</span>
}

function EditParticipantModal({ participant, onClose, onSaved, onError }) {
  const [form, setForm] = useState({ ...participant })
  const [busy, setBusy] = useState(false)
  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    onError(null)
    try {
      await adminApi.updateParticipant(participant.id, {
        full_name: form.full_name, email: form.email, phone: form.phone,
        emergency_contact: form.emergency_contact, tshirt_size: form.tshirt_size, status: form.status,
      })
      onSaved()
    } catch (err) { onError(pickErrorMessage(err)) }
    finally { setBusy(false) }
  }
  return (
    <Modal title={`Edit · ${participant.full_name}`} onClose={onClose}>
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name"><input className="input" required value={form.full_name} onChange={update('full_name')} /></Field>
        <Field label="Email"><input className="input" type="email" required value={form.email} onChange={update('email')} /></Field>
        <Field label="Phone"><input className="input" required value={form.phone} onChange={update('phone')} /></Field>
        <Field label="Emergency"><input className="input" value={form.emergency_contact || ''} onChange={update('emergency_contact')} /></Field>
        <Field label="T-shirt"><select className="input" value={form.tshirt_size} onChange={update('tshirt_size')}>{['S','M','L','XL','XXL'].map(s=><option key={s}>{s}</option>)}</select></Field>
        <Field label="Status"><select className="input" value={form.status} onChange={update('status')}>{['reserved','pending_payment','confirmed','cancelled'].map(s=><option key={s}>{s}</option>)}</select></Field>
        <FormFooter busy={busy} onClose={onClose} />
      </form>
    </Modal>
  )
}

function ResultModal({ participant, onClose, onSaved, onError }) {
  const [form, setForm] = useState({
    chip_time: participant.chip_time || '',
    overall_place: participant.overall_place || '',
    gender_place: participant.gender_place || '',
  })
  const [busy, setBusy] = useState(false)
  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    onError(null)
    try {
      await adminApi.recordResults(participant.id, {
        chip_time: form.chip_time || null,
        overall_place: form.overall_place ? Number(form.overall_place) : null,
        gender_place: form.gender_place ? Number(form.gender_place) : null,
      })
      onSaved()
    } catch (err) { onError(pickErrorMessage(err)) }
    finally { setBusy(false) }
  }
  return (
    <Modal title={`Record result · ${participant.full_name}`} onClose={onClose}>
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-3">
        <Field label="Chip time (HH:MM:SS)"><input className="input" required placeholder="00:42:13" value={form.chip_time} onChange={(e) => setForm((f) => ({ ...f, chip_time: e.target.value }))} /></Field>
        <Field label="Overall rank"><input type="number" className="input" value={form.overall_place} onChange={(e) => setForm((f) => ({ ...f, overall_place: e.target.value }))} /></Field>
        <Field label={`${participant.gender || 'Gender'} rank`}><input type="number" className="input" value={form.gender_place} onChange={(e) => setForm((f) => ({ ...f, gender_place: e.target.value }))} /></Field>
        <div className="sm:col-span-3"><FormFooter busy={busy} onClose={onClose} /></div>
      </form>
    </Modal>
  )
}

function GuestModal({ eventId, onClose, onSaved, onError }) {
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', department: 'Guest',
    gender: 'male', tshirt_size: 'M',
  })
  const [busy, setBusy] = useState(false)
  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    onError(null)
    try {
      await adminApi.createGuest(eventId, form)
      onSaved()
    } catch (err) { onError(pickErrorMessage(err)) }
    finally { setBusy(false) }
  }
  return (
    <Modal title="Reserve guest BIB" onClose={onClose}>
      <p className="-mt-2 mb-4 text-sm text-ink-500">Guests get the reserved range MIN_0001 → MIN_0030 and never appear in public registration flows.</p>
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name"><input className="input" required value={form.full_name} onChange={update('full_name')} /></Field>
        <Field label="Phone"><input className="input" required value={form.phone} onChange={update('phone')} /></Field>
        <Field label="Email"><input className="input" type="email" value={form.email} onChange={update('email')} /></Field>
        <Field label="Department / org"><input className="input" required value={form.department} onChange={update('department')} /></Field>
        <Field label="Gender"><select className="input" value={form.gender} onChange={update('gender')}><option>male</option><option>female</option></select></Field>
        <Field label="T-shirt"><select className="input" value={form.tshirt_size} onChange={update('tshirt_size')}>{['S','M','L','XL','XXL'].map(s=><option key={s}>{s}</option>)}</select></Field>
        <div className="sm:col-span-2"><FormFooter busy={busy} onClose={onClose} primary="Reserve guest BIB" /></div>
      </form>
    </Modal>
  )
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-30 grid place-items-center bg-ink-950/40 backdrop-blur-sm p-4">
      <div className="card-elevated w-full max-w-2xl">
        <div className="flex items-center justify-between border-b border-ink-100 px-6 py-4">
          <h3 className="font-display text-lg font-bold text-ink-900">{title}</h3>
          <button onClick={onClose} className="text-ink-400 hover:text-ink-700">×</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return <label className="block"><span className="label">{label}</span>{children}</label>
}

function FormFooter({ busy, onClose, primary = 'Save' }) {
  return (
    <div className="flex items-center justify-end gap-2 pt-2">
      <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
      <button type="submit" disabled={busy} className="btn-primary">{busy ? 'Saving…' : primary}</button>
    </div>
  )
}
