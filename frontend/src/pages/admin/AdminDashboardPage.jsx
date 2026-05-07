import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminApi } from '../../api/endpoints'

export default function AdminDashboardPage() {
  const [eventId, setEventId] = useState(null)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    adminApi
      .dashboard(eventId ? { event_id: eventId } : {})
      .then((res) => {
        setData(res.data?.data)
        if (!eventId && res.data?.data?.active_event) setEventId(res.data.data.active_event.id)
      })
      .finally(() => setLoading(false))
  }, [eventId])

  if (loading || !data) {
    return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}</div>
  }

  const { events, active_event: active, slots, participants, payments, posts } = data
  const publicCapacity = slots.public_capacity || 1
  const fillPct = Math.min(100, Math.round((slots.public_used / publicCapacity) * 100))

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="pill-brand">Operations</span>
          <h1 className="mt-2 font-display text-3xl font-bold text-ink-900">Dashboard</h1>
          <p className="mt-1 text-sm text-ink-500">Single-pane control for events, registrations &amp; certificates.</p>
        </div>
        <select
          value={eventId ?? ''}
          onChange={(e) => setEventId(Number(e.target.value))}
          className="input max-w-xs"
        >
          {events.map((e) => (
            <option key={e.id} value={e.id}>
              {e.title} · {e.status.toUpperCase()}
            </option>
          ))}
        </select>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Confirmed" value={participants.confirmed} hint="Paid &amp; BIB-issued" />
        <Stat label="Pending" value={participants.pending} hint="Reserved, awaiting payment" />
        <Stat label="Cancelled" value={participants.cancelled} hint="Open for re-register" />
        <Stat label="Revenue" value={`৳${(payments.completed_amount || 0).toLocaleString()}`} hint={`${payments.completed_count} txns`} />
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <article className="card-elevated p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-bold text-ink-900">{active?.title}</h3>
              <div className="text-xs uppercase tracking-widest text-ink-500">Active event · {active?.status?.toUpperCase()}</div>
            </div>
            <Link to="/admin/events" className="btn-outline">Manage</Link>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <Mini k="Total slots" v={slots.total_slots} />
            <Mini k="Guest reserved" v={slots.guest_reserved} />
            <Mini k="Public capacity" v={slots.public_capacity} />
            <Mini k="Students" v={slots.student_used} />
            <Mini k="Faculty" v={slots.faculty_used} />
            <Mini k="Guests" v={slots.guest_used} />
          </div>
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-ink-500">
              <span>Public fill</span>
              <span>{fillPct}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-ink-100">
              <div className="h-full bg-brand-500 transition-all" style={{ width: `${fillPct}%` }} />
            </div>
          </div>
        </article>

        <article className="card-elevated p-6">
          <h3 className="font-display text-lg font-bold text-ink-900">Posts</h3>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Mini k="Total" v={posts.total} />
            <Mini k="Published" v={posts.published} />
          </div>
          <Link to="/admin/posts" className="btn-outline mt-6 inline-flex">Open CMS</Link>
        </article>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <QuickAction title="Open participants" to={`/admin/events/${active?.id}/participants`} />
        <QuickAction title="Configure certificate" to="/admin/certificates" />
        <QuickAction title="Write a post" to="/admin/posts/new" />
        <QuickAction title="Manage events" to="/admin/events" />
      </section>
    </div>
  )
}

function Stat({ label, value, hint }) {
  return (
    <div className="card-elevated p-5">
      <div className="text-[11px] font-semibold uppercase tracking-widest text-ink-500">{label}</div>
      <div className="mt-2 font-display text-3xl font-bold text-ink-900">{value}</div>
      {hint && <div className="mt-1 text-xs text-ink-500">{hint}</div>}
    </div>
  )
}

function Mini({ k, v }) {
  return (
    <div className="rounded-xl bg-ink-50 p-4 ring-1 ring-ink-100">
      <div className="text-[11px] font-semibold uppercase tracking-widest text-ink-500">{k}</div>
      <div className="mt-1 font-display text-xl font-bold text-ink-900">{v}</div>
    </div>
  )
}

function QuickAction({ title, to }) {
  return (
    <Link to={to} className="card-elevated flex items-center justify-between p-5 transition hover:-translate-y-0.5 hover:shadow-card">
      <span className="font-display text-base font-semibold text-ink-900">{title}</span>
      <span className="text-brand-500">→</span>
    </Link>
  )
}
