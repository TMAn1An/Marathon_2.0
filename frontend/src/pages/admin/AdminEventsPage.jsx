import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminApi } from '../../api/endpoints'
import { pickErrorMessage } from '../../api/client'

const STATUSES = ['upcoming', 'live', 'past']

const EMPTY_EVENT = {
  title: '',
  slug: '',
  summary: '',
  description: '',
  location: '',
  event_start_date: '',
  registration_start_date: '',
  total_slots: 400,
  guest_slot_limit: 30,
  hold_minutes: 10,
  student_fee_bdt: 500,
  faculty_fee_bdt: 800,
  is_visible: true,
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState(null)

  const refresh = () => {
    setLoading(true)
    adminApi.events().then((res) => setEvents(res.data?.data || [])).finally(() => setLoading(false))
  }

  useEffect(() => { refresh() }, [])

  const setStatus = async (event, status) => {
    setError(null)
    try {
      await adminApi.setEventStatus(event.id, { status, manual_override: true })
      refresh()
    } catch (err) {
      setError(pickErrorMessage(err))
    }
  }

  const disableOverride = async (event) => {
    setError(null)
    try {
      await adminApi.disableOverride(event.id)
      refresh()
    } catch (err) { setError(pickErrorMessage(err)) }
  }

  const onDelete = async (event) => {
    if (!confirm(`Delete "${event.title}"? Participants will be detached.`)) return
    try {
      await adminApi.deleteEvent(event.id)
      refresh()
    } catch (err) { setError(pickErrorMessage(err)) }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="pill-brand">Programme</span>
          <h1 className="mt-2 font-display text-3xl font-bold text-ink-900">Events</h1>
          <p className="mt-1 text-sm text-ink-500">Plan, publish, and run every IUBAT SCSE marathon edition.</p>
        </div>
        <button onClick={() => setEditing({ ...EMPTY_EVENT })} className="btn-primary">+ New event</button>
      </header>

      {error && <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-100">{error}</div>}

      <div className="card-elevated overflow-hidden">
        <table className="min-w-full divide-y divide-ink-100">
          <thead className="bg-ink-50">
            <tr>
              <Th>Event</Th><Th>Date</Th><Th>Status</Th><Th>Slots</Th><Th>Actions</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100 bg-white">
            {loading && <tr><td colSpan={5} className="px-6 py-8 text-center text-ink-500">Loading…</td></tr>}
            {!loading && events.length === 0 && <tr><td colSpan={5} className="px-6 py-8 text-center text-ink-500">No events yet.</td></tr>}
            {events.map((e) => (
              <tr key={e.id} className="text-sm">
                <td className="px-6 py-4">
                  <div className="font-display font-semibold text-ink-900">{e.title}</div>
                  <div className="text-xs text-ink-500">{e.slug}</div>
                </td>
                <td className="px-6 py-4 text-ink-700">
                  <div>{e.event_start_date ? new Date(e.event_start_date).toLocaleString('en-GB') : '—'}</div>
                  <div className="text-xs text-ink-500">
                    Reg opens: {e.registration_start_date ? new Date(e.registration_start_date).toLocaleString('en-GB') : '—'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <StatusPill status={e.status} override={e.manual_override} />
                </td>
                <td className="px-6 py-4 text-ink-700">{e.total_slots} <span className="text-ink-400 text-xs">({e.guest_slot_limit} guest)</span></td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link to={`/admin/events/${e.id}/participants`} className="text-xs font-semibold text-brand-600 hover:underline">Participants</Link>
                    <button onClick={() => setEditing(e)} className="text-xs font-semibold text-ink-600 hover:underline">Edit</button>
                    {STATUSES.filter((s) => s !== e.status).map((s) => (
                      <button key={s} onClick={() => setStatus(e, s)} className="rounded-full bg-ink-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-ink-600 hover:bg-ink-100">
                        Set {s}
                      </button>
                    ))}
                    {e.manual_override && (
                      <button onClick={() => disableOverride(e)} className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-amber-700">
                        Auto
                      </button>
                    )}
                    <button onClick={() => onDelete(e)} className="text-xs font-semibold text-rose-600 hover:underline">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <EventDrawer
          event={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); refresh() }}
          onError={setError}
        />
      )}
    </div>
  )
}

function StatusPill({ status, override }) {
  const map = { upcoming: 'pill-upcoming', live: 'pill-live', past: 'pill-past' }
  return (
    <div className="flex items-center gap-1.5">
      <span className={map[status]}>{status === 'live' && <span className="live-dot mr-1" />}{status}</span>
      {override && <span className="pill bg-amber-100 text-amber-700">override</span>}
    </div>
  )
}

function Th({ children }) {
  return <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-ink-500">{children}</th>
}

function EventDrawer({ event, onClose, onSaved, onError }) {
  const isEdit = Boolean(event.id)
  const [form, setForm] = useState(() => ({
    ...event,
    event_start_date: event.event_start_date ? new Date(event.event_start_date).toISOString().slice(0, 16) : '',
    registration_start_date: event.registration_start_date ? new Date(event.registration_start_date).toISOString().slice(0, 16) : '',
  }))
  const [busy, setBusy] = useState(false)

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    onError(null)
    try {
      const payload = {
        ...form,
        total_slots: Number(form.total_slots),
        guest_slot_limit: Number(form.guest_slot_limit),
        hold_minutes: Number(form.hold_minutes),
        student_fee_bdt: Number(form.student_fee_bdt),
        faculty_fee_bdt: Number(form.faculty_fee_bdt),
        event_start_date: new Date(form.event_start_date).toISOString(),
        registration_start_date: form.registration_start_date ? new Date(form.registration_start_date).toISOString() : null,
      }
      if (isEdit) await adminApi.updateEvent(event.id, payload)
      else await adminApi.createEvent(payload)
      onSaved()
    } catch (err) { onError(pickErrorMessage(err)) }
    finally { setBusy(false) }
  }

  return (
    <div className="fixed inset-0 z-30 flex justify-end bg-ink-950/40 backdrop-blur-sm">
      <form onSubmit={submit} className="flex h-full w-full max-w-xl flex-col bg-white shadow-card">
        <header className="flex items-center justify-between border-b border-ink-100 px-6 py-4">
          <h2 className="font-display text-xl font-bold text-ink-900">{isEdit ? 'Edit event' : 'New event'}</h2>
          <button type="button" onClick={onClose} className="text-ink-400 hover:text-ink-700">×</button>
        </header>
        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          <Field label="Title"><input className="input" required value={form.title} onChange={update('title')} /></Field>
          <Field label="Slug"><input className="input" required value={form.slug} onChange={update('slug')} placeholder="auto-generated if you leave it" /></Field>
          <Field label="Location"><input className="input" required value={form.location} onChange={update('location')} /></Field>
          <Field label="Summary"><textarea rows={2} className="input" required value={form.summary} onChange={update('summary')} /></Field>
          <Field label="Description (HTML allowed)"><textarea rows={4} className="input font-mono text-xs" value={form.description} onChange={update('description')} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Event start date"><input type="datetime-local" className="input" required value={form.event_start_date} onChange={update('event_start_date')} /></Field>
            <Field label="Registration start date"><input type="datetime-local" className="input" value={form.registration_start_date} onChange={update('registration_start_date')} /></Field>
            <Field label="Total slots"><input type="number" className="input" required value={form.total_slots} onChange={update('total_slots')} /></Field>
            <Field label="Guest slot limit"><input type="number" className="input" required value={form.guest_slot_limit} onChange={update('guest_slot_limit')} /></Field>
            <Field label="Hold minutes"><input type="number" className="input" required value={form.hold_minutes} onChange={update('hold_minutes')} /></Field>
            <Field label="Student fee (BDT)"><input type="number" className="input" required value={form.student_fee_bdt} onChange={update('student_fee_bdt')} /></Field>
            <Field label="Faculty fee (BDT)"><input type="number" className="input" required value={form.faculty_fee_bdt} onChange={update('faculty_fee_bdt')} /></Field>
          </div>
          <label className="flex items-center gap-2 text-sm text-ink-700">
            <input type="checkbox" checked={form.is_visible} onChange={update('is_visible')} />
            Visible to public
          </label>
        </div>
        <footer className="flex items-center justify-end gap-2 border-t border-ink-100 p-4">
          <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
          <button disabled={busy} type="submit" className="btn-primary">{busy ? 'Saving…' : 'Save event'}</button>
        </footer>
      </form>
    </div>
  )
}

function Field({ label, children }) {
  return <label className="block"><span className="label">{label}</span>{children}</label>
}
